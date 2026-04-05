/**
 * Job Scheduler — Runs periodic background tasks
 *
 * Uses setInterval (no external dependency) to run daily jobs:
 * - LMN auto-trigger scan
 * - LMN renewal reminders
 * - KBS reassessment scheduling
 * - Time bank credit expiry
 * - Membership renewal
 *
 * Only starts in production (NODE_ENV === 'production').
 */
import { logger } from '../common/logger.js';
import { runAutoTriggerScan } from '../modules/lmn/auto-trigger.js';
import { runLMNRenewal } from './lmn-renewal.js';
import { runKBSReassessment } from './kbs-reassessment.js';
import { runTimeBankExpiry } from './timebank-expiry.js';
import { runMembershipRenewal } from './membership-renewal.js';
import { runSynthesisCycle } from '../agents/index.js';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

interface JobDefinition {
  name: string;
  fn: () => Promise<unknown>;
}

const jobs: JobDefinition[] = [
  { name: 'lmn-auto-trigger-scan', fn: runAutoTriggerScan },
  { name: 'lmn-renewal', fn: runLMNRenewal },
  { name: 'kbs-reassessment', fn: runKBSReassessment },
  { name: 'timebank-expiry', fn: runTimeBankExpiry },
  { name: 'membership-renewal', fn: runMembershipRenewal },
  { name: 'agent-synthesis-cycle', fn: runSynthesisCycle },
];

const intervalHandles: NodeJS.Timeout[] = [];

async function runJob(job: JobDefinition): Promise<void> {
  const start = Date.now();
  logger.info({ job: job.name }, `Scheduled job starting: ${job.name}`);
  try {
    const result = await job.fn();
    const durationMs = Date.now() - start;
    logger.info({ job: job.name, durationMs, result }, `Scheduled job completed: ${job.name}`);
  } catch (err) {
    const durationMs = Date.now() - start;
    logger.error({ job: job.name, durationMs, err }, `Scheduled job failed: ${job.name}`);
  }
}

/**
 * Start the job scheduler. Only runs in production.
 * Each job runs every 24 hours, staggered by 5 minutes to avoid thundering herd.
 */
export function startScheduler(): void {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Job scheduler skipped (NODE_ENV is not production)');
    return;
  }

  logger.info({ jobCount: jobs.length }, 'Job scheduler starting');

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i]!;
    const staggerMs = i * 5 * 60 * 1000; // stagger each job by 5 minutes

    // Run first execution after stagger delay, then every 24 hours
    const initialTimeout = setTimeout(() => {
      // Run immediately on first tick
      runJob(job);

      // Then repeat every 24 hours
      const handle = setInterval(() => runJob(job), TWENTY_FOUR_HOURS_MS);
      intervalHandles.push(handle);
    }, staggerMs);

    intervalHandles.push(initialTimeout);
  }

  logger.info('Job scheduler started — all jobs scheduled for 24h intervals');
}

/**
 * Stop all scheduled jobs (for graceful shutdown).
 */
export function stopScheduler(): void {
  for (const handle of intervalHandles) {
    clearInterval(handle);
    clearTimeout(handle);
  }
  intervalHandles.length = 0;
  logger.info('Job scheduler stopped');
}
