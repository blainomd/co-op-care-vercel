/**
 * Profile Builder Agent — Watches Sage conversations, scores profile completeness
 *
 * The Sensory → Diagnostic bridge. Every time Sage updates a Living Profile,
 * this agent checks: do we have enough data to start assessments?
 *
 * Completeness scoring:
 *   - Name, age, conditions, medications → 0.1 each (0.4 total)
 *   - Mobility level, risk flags → 0.1 each (0.2 total)
 *   - At least 3 Sage conversations → 0.2
 *   - At least 1 Omaha problem identified → 0.2
 *   Total: 1.0 = ready for assessment
 *
 * Threshold: 0.7 triggers assessment readiness
 */
import { BaseAgent } from './base-agent.js';
import { getJourney, updateJourneyData, advanceJourney } from './care-journey.js';
import { logger } from '../common/logger.js';
import type { CareEvent } from './event-bus.js';

const ASSESSMENT_READY_THRESHOLD = 0.7;

interface ProfileData {
  name?: string;
  age?: number;
  conditions?: string[];
  medications?: string[];
  mobilityLevel?: string;
  riskFlags?: string[];
  conversationCount: number;
  omahaProblemsFound: number;
  caregiverName?: string;
  caregiverRelationship?: string;
  state?: string;
}

// In-memory profile data store (Phase 1)
const profiles = new Map<string, ProfileData>();

export function getProfile(familyId: string): ProfileData {
  if (!profiles.has(familyId)) {
    profiles.set(familyId, { conversationCount: 0, omahaProblemsFound: 0 });
  }
  return profiles.get(familyId)!;
}

export function updateProfile(familyId: string, update: Partial<ProfileData>): ProfileData {
  const profile = getProfile(familyId);
  Object.assign(profile, update);
  return profile;
}

function scoreCompleteness(profile: ProfileData): number {
  let score = 0;

  if (profile.name) score += 0.1;
  if (profile.age) score += 0.1;
  if (profile.conditions && profile.conditions.length > 0) score += 0.1;
  if (profile.medications) score += 0.1;
  if (profile.mobilityLevel) score += 0.1;
  if (profile.riskFlags && profile.riskFlags.length > 0) score += 0.1;
  if (profile.conversationCount >= 3) score += 0.2;
  if (profile.omahaProblemsFound >= 1) score += 0.2;

  return Math.min(score, 1.0);
}

export class ProfileBuilderAgent extends BaseAgent {
  constructor() {
    super({
      name: 'profile-builder',
      description: 'Watches profile updates, scores completeness, triggers assessment readiness',
      subscribesTo: ['profile.updated', 'omaha.problem.found'],
      enabled: true,
    });
  }

  protected async handle(event: CareEvent): Promise<void> {
    const { familyId } = event;
    const profile = getProfile(familyId);

    // Update profile from event payload
    if (event.type === 'profile.updated') {
      const data = event.payload as Partial<ProfileData>;
      if (data.name) profile.name = data.name;
      if (data.age) profile.age = data.age as number;
      if (data.conditions) profile.conditions = data.conditions as string[];
      if (data.medications) profile.medications = data.medications as string[];
      if (data.mobilityLevel) profile.mobilityLevel = data.mobilityLevel as string;
      if (data.riskFlags) profile.riskFlags = data.riskFlags as string[];
      if (data.caregiverName) profile.caregiverName = data.caregiverName as string;
      if (data.caregiverRelationship)
        profile.caregiverRelationship = data.caregiverRelationship as string;
      if (data.state) profile.state = data.state as string;
      profile.conversationCount++;
    }

    if (event.type === 'omaha.problem.found') {
      profile.omahaProblemsFound++;
    }

    // Score completeness
    const completeness = scoreCompleteness(profile);
    updateJourneyData(familyId, { profileCompleteness: completeness });

    logger.info(
      { familyId, completeness, threshold: ASSESSMENT_READY_THRESHOLD },
      `Profile completeness: ${(completeness * 100).toFixed(0)}%`,
    );

    // Check if ready for assessment
    const journey = getJourney(familyId);
    if (completeness >= ASSESSMENT_READY_THRESHOLD && journey.stage === 'profiling') {
      // Advance journey
      advanceJourney(familyId, 'assessing', 'profile.assessment_ready');

      // Emit assessment readiness
      await this.emit('profile.assessment_ready', familyId, {
        completeness,
        profile: {
          name: profile.name,
          age: profile.age,
          conditions: profile.conditions,
          medications: profile.medications,
          mobilityLevel: profile.mobilityLevel,
          conversationCount: profile.conversationCount,
          omahaProblemsFound: profile.omahaProblemsFound,
        },
        gaps: getProfileGaps(profile),
      });
    }
  }
}

function getProfileGaps(profile: ProfileData): string[] {
  const gaps: string[] = [];
  if (!profile.name) gaps.push('care_recipient_name');
  if (!profile.age) gaps.push('care_recipient_age');
  if (!profile.conditions || profile.conditions.length === 0) gaps.push('conditions');
  if (!profile.mobilityLevel) gaps.push('mobility_level');
  if (!profile.caregiverName) gaps.push('caregiver_name');
  if (!profile.state) gaps.push('state_of_residence');
  if (profile.conversationCount < 3) gaps.push('more_conversations');
  if (profile.omahaProblemsFound < 1) gaps.push('omaha_problems');
  return gaps;
}
