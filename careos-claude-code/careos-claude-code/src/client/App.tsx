import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Legacy components (inline styles — DO NOT apply Tailwind)
import { Website, ProductMap, Enzyme, CareUBI, Synthesis } from './legacy';

// Layout
import { AppShell } from './components/layout/AppShell';
import { AuthGate } from './components/layout/AuthGate';
import { useAuthStore } from './stores/authStore';

// Marketing / brand pages (inline styles — DO NOT apply Tailwind)
const SolvingHealthHub = lazy(() =>
  import('./features/marketing/SolvingHealthHub').then((m) => ({
    default: m.SolvingHealthHub,
  })),
);
const SurgeonAccessHome = lazy(() =>
  import('./features/marketing/SurgeonAccessHome').then((m) => ({
    default: m.SurgeonAccessHome,
  })),
);
const ClinicalSwipeHome = lazy(() =>
  import('./features/marketing/ClinicalSwipeHome').then((m) => ({
    default: m.ClinicalSwipeHome,
  })),
);
// CareGoals is a branded product (not a company) that feeds data + revenue into co-op.care LCA
const CareGoalsHome = lazy(() =>
  import('./features/marketing/CareGoalsHome').then((m) => ({ default: m.CareGoalsHome })),
);
const LMNIntakeForm = lazy(() =>
  import('./features/marketing/LMNIntakeForm').then((m) => ({ default: m.LMNIntakeForm })),
);
const DesignSystemPage = lazy(() =>
  import('./features/marketing/IconSystem').then((m) => ({ default: m.IconSystem })),
);
const CoopCareApp = lazy(() =>
  import('./features/marketing/CoopCareApp').then((m) => ({ default: m.CoopCareApp })),
);
const CareGoalsConversation = lazy(() =>
  import('./features/marketing/CareGoalsConversation').then((m) => ({
    default: m.CareGoalsConversation,
  })),
);
const HormoneDashboard = lazy(() =>
  import('./features/marketing/HormoneDashboard').then((m) => ({
    default: m.HormoneDashboard,
  })),
);
const RegenAccessClinic = lazy(() =>
  import('./features/marketing/RegenAccessClinic').then((m) => ({
    default: m.RegenAccessClinic,
  })),
);
const HealthcareHarness = lazy(() =>
  import('./features/marketing/HealthcareHarness').then((m) => ({
    default: m.HealthcareHarness,
  })),
);
const SAWeightManagement = lazy(() =>
  import('./features/marketing/SAWeightManagement').then((m) => ({
    default: m.SAWeightManagement,
  })),
);
const IconShowcasePage = lazy(() =>
  import('./features/marketing/IconShowcase').then((m) => ({
    default: m.IconShowcase,
  })),
);

// Lazy-loaded feature modules
const ConductorDashboard = lazy(() =>
  import('./features/conductor/ConductorDashboard').then((m) => ({
    default: m.ConductorDashboard,
  })),
);
const CIIAssessment = lazy(() =>
  import('./features/assessments/CIIAssessment').then((m) => ({ default: m.CIIAssessment })),
);
const MiniCII = lazy(() =>
  import('./features/assessments/MiniCII').then((m) => ({ default: m.MiniCII })),
);
const TaskFeed = lazy(() =>
  import('./features/timebank/TaskFeed').then((m) => ({ default: m.TaskFeed })),
);
const TaskAccept = lazy(() =>
  import('./features/timebank/TaskAccept').then((m) => ({ default: m.TaskAccept })),
);
const ImpactScore = lazy(() =>
  import('./features/timebank/ImpactScore').then((m) => ({ default: m.ImpactScore })),
);
const OnboardingFlow = lazy(() =>
  import('./features/onboarding/OnboardingFlow').then((m) => ({ default: m.OnboardingFlow })),
);
const ThreadList = lazy(() =>
  import('./features/messaging/ThreadList').then((m) => ({ default: m.ThreadList })),
);
const MessageView = lazy(() =>
  import('./features/messaging/MessageView').then((m) => ({ default: m.MessageView })),
);
const ComposeMessage = lazy(() =>
  import('./features/messaging/ComposeMessage').then((m) => ({ default: m.ComposeMessage })),
);
const WorkerDashboard = lazy(() =>
  import('./features/worker/WorkerDashboard').then((m) => ({ default: m.WorkerDashboard })),
);
const CareLog = lazy(() =>
  import('./features/worker/CareLog').then((m) => ({ default: m.CareLog })),
);
const AmbientScribe = lazy(() =>
  import('./features/worker/AmbientScribe').then((m) => ({ default: m.AmbientScribe })),
);
const ShiftClock = lazy(() =>
  import('./features/worker/ShiftClock').then((m) => ({ default: m.ShiftClock })),
);
const ShiftSwap = lazy(() =>
  import('./features/worker/ShiftSwap').then((m) => ({ default: m.ShiftSwap })),
);
const LMNPublicRequest = lazy(() => import('./features/lmn/LMNPublicRequest'));
const Homepage = lazy(() => import('./features/homepage/Homepage'));
const IconSystem = lazy(() => import('./components/icons/IconSystem'));
const LMNFormV2 = lazy(() => import('./features/lmn/LMNFormV2'));
const SAHomeV1 = lazy(() => import('./features/surgeonaccess/SAHomeV1'));
const LMNList = lazy(() => import('./features/lmn/LMNList').then((m) => ({ default: m.LMNList })));
const LMNDetail = lazy(() =>
  import('./features/lmn/LMNDetail').then((m) => ({ default: m.LMNDetail })),
);
const AdminDashboard = lazy(() =>
  import('./features/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
);
const ManualMatch = lazy(() =>
  import('./features/admin/ManualMatch').then((m) => ({ default: m.ManualMatch })),
);
const MemberManagement = lazy(() =>
  import('./features/admin/MemberManagement').then((m) => ({ default: m.MemberManagement })),
);
const RespiteFund = lazy(() =>
  import('./features/admin/RespiteFund').then((m) => ({ default: m.RespiteFund })),
);
const EmployerDashboard = lazy(() =>
  import('./features/employer/EmployerDashboard').then((m) => ({ default: m.EmployerDashboard })),
);
const ROIReport = lazy(() =>
  import('./features/employer/ROIReport').then((m) => ({ default: m.ROIReport })),
);
const EnrollmentView = lazy(() =>
  import('./features/employer/EnrollmentView').then((m) => ({ default: m.EnrollmentView })),
);
const BillingDashboard = lazy(() =>
  import('./features/billing/BillingDashboard').then((m) => ({ default: m.BillingDashboard })),
);
const TaxStatement = lazy(() =>
  import('./features/billing/TaxStatement').then((m) => ({ default: m.TaxStatement })),
);
const ComfortCard = lazy(() =>
  import('./features/billing/ComfortCard').then((m) => ({ default: m.ComfortCard })),
);
const EquityDashboard = lazy(() =>
  import('./features/timebank/EquityDashboard').then((m) => ({ default: m.EquityDashboard })),
);
const ReferralFlow = lazy(() =>
  import('./features/timebank/ReferralFlow').then((m) => ({ default: m.ReferralFlow })),
);
const ProfilePage = lazy(() =>
  import('./features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const NotificationsPage = lazy(() =>
  import('./features/notifications/NotificationsPage').then((m) => ({
    default: m.NotificationsPage,
  })),
);
const SettingsPage = lazy(() =>
  import('./features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const AssessmentsList = lazy(() =>
  import('./features/assessments/AssessmentsList').then((m) => ({ default: m.AssessmentsList })),
);
const RequestHelp = lazy(() =>
  import('./features/timebank/RequestHelp').then((m) => ({ default: m.RequestHelp })),
);
const WellnessDirectory = lazy(() =>
  import('./features/wellness/WellnessDirectory').then((m) => ({ default: m.WellnessDirectory })),
);
const CRIAssessment = lazy(() =>
  import('./features/assessments/CRIAssessment').then((m) => ({ default: m.CRIAssessment })),
);
const CRIReviewQueue = lazy(() =>
  import('./features/assessments/CRIReviewQueue').then((m) => ({ default: m.CRIReviewQueue })),
);
const CRIDetail = lazy(() =>
  import('./features/assessments/CRIDetail').then((m) => ({ default: m.CRIDetail })),
);
const KBSAssessment = lazy(() =>
  import('./features/assessments/KBSAssessment').then((m) => ({ default: m.KBSAssessment })),
);
const KBSTrend = lazy(() =>
  import('./features/assessments/KBSTrend').then((m) => ({ default: m.KBSTrend })),
);
const CareTeam = lazy(() =>
  import('./features/conductor/CareTeam').then((m) => ({ default: m.CareTeam })),
);
const VitalsDashboard = lazy(() =>
  import('./features/conductor/VitalsDashboard').then((m) => ({ default: m.VitalsDashboard })),
);
const ConductorCertification = lazy(() =>
  import('./features/conductor/ConductorCertification').then((m) => ({
    default: m.ConductorCertification,
  })),
);
const CareSchedule = lazy(() =>
  import('./features/conductor/CareSchedule').then((m) => ({ default: m.CareSchedule })),
);
const Governance = lazy(() =>
  import('./features/worker/Governance').then((m) => ({ default: m.Governance })),
);
const CascadeImpact = lazy(() =>
  import('./features/timebank/CascadeImpact').then((m) => ({ default: m.CascadeImpact })),
);
const StreakDashboard = lazy(() =>
  import('./features/timebank/StreakDashboard').then((m) => ({ default: m.StreakDashboard })),
);
const ExpiryAlerts = lazy(() =>
  import('./features/timebank/ExpiryAlerts').then((m) => ({ default: m.ExpiryAlerts })),
);
const RespiteDispatch = lazy(() =>
  import('./features/admin/RespiteDispatch').then((m) => ({ default: m.RespiteDispatch })),
);
const DischargeConcierge = lazy(() =>
  import('./features/conductor/DischargeConcierge').then((m) => ({
    default: m.DischargeConcierge,
  })),
);
const TaxCalculator = lazy(() =>
  import('./features/billing/TaxCalculator').then((m) => ({ default: m.TaxCalculator })),
);
const WellnessBookings = lazy(() =>
  import('./features/wellness/WellnessBookings').then((m) => ({ default: m.WellnessBookings })),
);
const PACEDashboard = lazy(() =>
  import('./features/admin/PACEDashboard').then((m) => ({ default: m.PACEDashboard })),
);
const BackgroundCheck = lazy(() =>
  import('./features/worker/BackgroundCheck').then((m) => ({ default: m.BackgroundCheck })),
);
const CommunityDirectory = lazy(() =>
  import('./features/admin/CommunityDirectory').then((m) => ({ default: m.CommunityDirectory })),
);
const MedicalAlerts = lazy(() =>
  import('./features/conductor/MedicalAlerts').then((m) => ({ default: m.MedicalAlerts })),
);
const MatchingQuality = lazy(() =>
  import('./features/admin/MatchingQuality').then((m) => ({ default: m.MatchingQuality })),
);
const EndowmentAnimation = lazy(() =>
  import('./features/timebank/EndowmentAnimation').then((m) => ({ default: m.EndowmentAnimation })),
);
const PredictiveAlert = lazy(() =>
  import('./features/conductor/PredictiveAlert').then((m) => ({ default: m.PredictiveAlert })),
);
const LMNMarketplace = lazy(() =>
  import('./features/lmn/LMNMarketplace').then((m) => ({ default: m.LMNMarketplace })),
);
const GratitudeFlow = lazy(() =>
  import('./features/timebank/GratitudeFlow').then((m) => ({ default: m.GratitudeFlow })),
);
const LMNRenewal = lazy(() =>
  import('./features/lmn/LMNRenewal').then((m) => ({ default: m.LMNRenewal })),
);
const DeficitNudge = lazy(() =>
  import('./features/timebank/DeficitNudge').then((m) => ({ default: m.DeficitNudge })),
);
const OmahaReference = lazy(() =>
  import('./features/assessments/OmahaReference').then((m) => ({ default: m.OmahaReference })),
);
const CareTimeline = lazy(() =>
  import('./features/conductor/CareTimeline').then((m) => ({ default: m.CareTimeline })),
);
const TimeBankWallet = lazy(() =>
  import('./features/conductor/TimeBankWallet').then((m) => ({ default: m.TimeBankWallet })),
);
const NudgeOverlay = lazy(() =>
  import('./features/timebank/NudgeOverlay').then((m) => ({ default: m.NudgeOverlay })),
);
const WearableSetup = lazy(() =>
  import('./features/conductor/WearableSetup').then((m) => ({ default: m.WearableSetup })),
);
const GPSCheckin = lazy(() =>
  import('./features/timebank/GPSCheckin').then((m) => ({ default: m.GPSCheckin })),
);
const FederationWaitlist = lazy(() =>
  import('./features/onboarding/FederationWaitlist').then((m) => ({
    default: m.FederationWaitlist,
  })),
);
const AdminAnalytics = lazy(() =>
  import('./features/admin/AdminAnalytics').then((m) => ({ default: m.AdminAnalytics })),
);
const BCHPartnership = lazy(() =>
  import('./features/admin/BCHPartnership').then((m) => ({ default: m.BCHPartnership })),
);
const IdentityOnboarding = lazy(() =>
  import('./features/onboarding/IdentityOnboarding').then((m) => ({
    default: m.IdentityOnboarding,
  })),
);
const MedicationTracker = lazy(() =>
  import('./features/conductor/MedicationTracker').then((m) => ({ default: m.MedicationTracker })),
);
const TaskHistory = lazy(() =>
  import('./features/timebank/TaskHistory').then((m) => ({ default: m.TaskHistory })),
);
const CarePlanBuilder = lazy(() =>
  import('./features/conductor/CarePlanBuilder').then((m) => ({ default: m.CarePlanBuilder })),
);
const ComfortCardReconciliation = lazy(() =>
  import('./features/billing/ComfortCardReconciliation').then((m) => ({
    default: m.ComfortCardReconciliation,
  })),
);
const EmergencyContacts = lazy(() =>
  import('./features/conductor/EmergencyContacts').then((m) => ({ default: m.EmergencyContacts })),
);
const CoopMembership = lazy(() =>
  import('./features/conductor/CoopMembership').then((m) => ({ default: m.CoopMembership })),
);
const AgeAtHomePreview = lazy(() =>
  import('./features/conductor/AgeAtHomePreview').then((m) => ({ default: m.AgeAtHomePreview })),
);
const SocialPrescribing = lazy(() =>
  import('./features/conductor/SocialPrescribing').then((m) => ({ default: m.SocialPrescribing })),
);
const FamilyOnboarding = lazy(() =>
  import('./features/onboarding/FamilyOnboarding').then((m) => ({ default: m.FamilyOnboarding })),
);
const WorkerOnboarding = lazy(() =>
  import('./features/onboarding/WorkerOnboarding').then((m) => ({ default: m.WorkerOnboarding })),
);
const IncidentReport = lazy(() =>
  import('./features/worker/IncidentReport').then((m) => ({ default: m.IncidentReport })),
);
const QualityMetrics = lazy(() =>
  import('./features/admin/QualityMetrics').then((m) => ({ default: m.QualityMetrics })),
);
const CaregiverGuideLanding = lazy(() =>
  import('./features/caregiver-guide/CaregiverGuideLanding').then((m) => ({
    default: m.CaregiverGuideLanding,
  })),
);
const GuideBuilder = lazy(() =>
  import('./features/caregiver-guide/GuideBuilder').then((m) => ({
    default: m.GuideBuilder,
  })),
);
const PersonalizedHome = lazy(() =>
  import('./features/home/PersonalizedHome').then((m) => ({
    default: m.PersonalizedHome,
  })),
);
const ActionPage = lazy(() =>
  import('./features/action/ActionPage').then((m) => ({
    default: m.ActionPage,
  })),
);

function LoadingSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-sage border-t-transparent" />
    </div>
  );
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
}

export function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Domain-aware routing: clinicalswipe.com shows ClinicalSwipe, not co-op.care
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isClinicalSwipe = hostname.includes('clinicalswipe');
  const isSurgeonAccess = hostname.includes('surgeonaccess');
  const isCareGoals = hostname.includes('caregoals');
  const isSolvingHealth = hostname.includes('solvinghealth');

  const HomeComponent = isClinicalSwipe
    ? ClinicalSwipeHome
    : isSurgeonAccess
      ? SurgeonAccessHome
      : isCareGoals
        ? CareGoalsHome
        : isSolvingHealth
          ? SolvingHealthHub
          : Homepage;

  return (
    <BrowserRouter>
      <Routes>
        {/* ─── Public routes — domain-aware homepage ─── */}
        <Route
          path="/"
          element={
            <Lazy>
              <HomeComponent />
            </Lazy>
          }
        />
        <Route path="/legacy" element={<Website />} />
        <Route path="/product-map" element={<ProductMap />} />
        <Route path="/enzyme" element={<Enzyme />} />
        <Route path="/care-ubi" element={<CareUBI />} />
        <Route path="/synthesis" element={<Synthesis />} />

        {/* ─── Action Pages — SMS tap target, no auth, token-based ─── */}
        <Route
          path="/act/:token"
          element={
            <Lazy>
              <ActionPage />
            </Lazy>
          }
        />

        {/* ─── Caregiver Guide — top-of-funnel, no auth ─── */}
        <Route
          path="/guide"
          element={
            <Lazy>
              <CaregiverGuideLanding />
            </Lazy>
          }
        />
        <Route
          path="/guide/build"
          element={
            <Lazy>
              <GuideBuilder />
            </Lazy>
          }
        />

        {/* ─── Public LMN request — no auth, direct-to-consumer $199 ─── */}
        <Route
          path="/get-lmn"
          element={
            <Lazy>
              <LMNPublicRequest />
            </Lazy>
          }
        />

        {/* ─── Design System & Product Pages ─── */}
        <Route
          path="/icons"
          element={
            <Lazy>
              <IconSystem />
            </Lazy>
          }
        />
        <Route
          path="/lmn-request"
          element={
            <Lazy>
              <LMNFormV2 />
            </Lazy>
          }
        />

        {/* ─── Marketing / brand pages (inline styles — standalone) ─── */}
        <Route
          path="/solving-health"
          element={
            <Lazy>
              <SolvingHealthHub />
            </Lazy>
          }
        />
        <Route
          path="/surgeonaccess"
          element={
            <Lazy>
              <SurgeonAccessHome />
            </Lazy>
          }
        />
        <Route
          path="/surgeonaccess/reviews"
          element={
            <Lazy>
              <SAHomeV1 />
            </Lazy>
          }
        />
        <Route
          path="/clinicalswipe"
          element={
            <Lazy>
              <ClinicalSwipeHome />
            </Lazy>
          }
        />
        <Route
          path="/caregoals"
          element={
            <Lazy>
              <CareGoalsHome />
            </Lazy>
          }
        />
        <Route
          path="/lmn-intake"
          element={
            <Lazy>
              <LMNIntakeForm />
            </Lazy>
          }
        />
        <Route
          path="/caregoals-conversation"
          element={
            <Lazy>
              <CareGoalsConversation />
            </Lazy>
          }
        />
        <Route
          path="/app-preview"
          element={
            <Lazy>
              <CoopCareApp />
            </Lazy>
          }
        />
        <Route
          path="/clinicalswipe/regen"
          element={
            <Lazy>
              <RegenAccessClinic />
            </Lazy>
          }
        />
        <Route
          path="/surgeonaccess/weight"
          element={
            <Lazy>
              <SAWeightManagement />
            </Lazy>
          }
        />
        <Route
          path="/clinicalswipe/regen/patient"
          element={
            <Lazy>
              <HormoneDashboard />
            </Lazy>
          }
        />
        <Route
          path="/design-system"
          element={
            <Lazy>
              <DesignSystemPage />
            </Lazy>
          }
        />
        <Route
          path="/harness"
          element={
            <Lazy>
              <HealthcareHarness />
            </Lazy>
          }
        />
        <Route
          path="/icon-showcase"
          element={
            <Lazy>
              <IconShowcasePage />
            </Lazy>
          }
        />

        {/* ─── Public onboarding flow ─── */}
        <Route
          path="/onboarding"
          element={
            <Lazy>
              <OnboardingFlow />
            </Lazy>
          }
        />
        <Route
          path="/onboarding/identity"
          element={
            <Lazy>
              <IdentityOnboarding />
            </Lazy>
          }
        />
        <Route
          path="/federation"
          element={
            <Lazy>
              <FederationWaitlist />
            </Lazy>
          }
        />
        <Route
          path="/onboarding/family"
          element={
            <Lazy>
              <FamilyOnboarding />
            </Lazy>
          }
        />
        <Route
          path="/onboarding/worker"
          element={
            <Lazy>
              <WorkerOnboarding />
            </Lazy>
          }
        />

        {/* ─── Personalized Home — Connector-driven, role-aware ─── */}
        <Route
          path="/home"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <PersonalizedHome />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />

        {/* ─── Authenticated routes — behind auth gate ─── */}
        <Route
          path="/conductor"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <ConductorDashboard />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />

        <Route
          path="/conductor/team"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <CareTeam />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/conductor/vitals"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <VitalsDashboard />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/conductor/certification"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <ConductorCertification />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/conductor/schedule"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <CareSchedule />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/conductor/discharge"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <DischargeConcierge />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/conductor/predictive"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <PredictiveAlert />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/conductor/timeline"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <CareTimeline />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/conductor/wallet"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <TimeBankWallet />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/conductor/wearable"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <WearableSetup />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/conductor/medications"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <MedicationTracker />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/conductor/care-plan"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <CarePlanBuilder />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/conductor/emergency"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <EmergencyContacts />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/conductor/membership"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <CoopMembership />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/conductor/age-at-home"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <AgeAtHomePreview />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/conductor/social-rx"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <SocialPrescribing />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />

        {/* Time Bank */}
        <Route
          path="/timebank"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <TaskFeed />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/timebank/task/:taskId"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <TaskAccept />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/timebank/impact"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <ImpactScore />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/timebank/new"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <RequestHelp />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/timebank/equity"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <EquityDashboard />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/timebank/referral"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <ReferralFlow />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/timebank/cascade"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <CascadeImpact />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/timebank/streak"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <StreakDashboard />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/timebank/expiring"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <ExpiryAlerts />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/timebank/endowment"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <EndowmentAnimation />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/timebank/gratitude"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <GratitudeFlow />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/timebank/deficit"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <DeficitNudge />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/timebank/nudge"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <NudgeOverlay />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/timebank/gps"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <GPSCheckin />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/timebank/history"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <TaskHistory />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />

        {/* Assessments */}
        <Route
          path="/assessments"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <AssessmentsList />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/assessments/cii"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <CIIAssessment />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/assessments/cri"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <CRIAssessment />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/assessments/cri/review"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <CRIReviewQueue />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/assessments/cri/:assessmentId"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <CRIDetail />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/assessments/kbs"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <KBSAssessment />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/assessments/kbs/trend"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <KBSTrend />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/assessments/omaha"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <OmahaReference />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/assessments/mini-cii"
          element={
            <Lazy>
              <MiniCII />
            </Lazy>
          }
        />

        {/* Messages */}
        <Route
          path="/messages"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <ThreadList />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/messages/new"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <ComposeMessage />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/messages/:threadId"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <MessageView />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <NotificationsPage />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />

        {/* Worker-Owner */}
        <Route
          path="/worker"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <WorkerDashboard />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/worker/care-log"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <CareLog />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/worker/voice"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <AmbientScribe />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/worker/clock"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <ShiftClock />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/worker/swaps"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <ShiftSwap />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/worker/governance"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <Governance />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/worker/verification"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <BackgroundCheck />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/worker/incident"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <IncidentReport />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />

        {/* LMN — shared by conductor + medical director */}
        <Route
          path="/lmn"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <LMNList />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/lmn/:lmnId"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <LMNDetail />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/lmn/marketplace"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <LMNMarketplace />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/lmn/renewal"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <LMNRenewal />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />

        {/* Medical Director */}
        <Route
          path="/medical"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <LMNList />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/medical/lmn"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <LMNList />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/medical/lmn/:lmnId"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <LMNDetail />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/medical/alerts"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <MedicalAlerts />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <AdminDashboard />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/admin/matching"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <ManualMatch />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/admin/members"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <MemberManagement />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/admin/respite"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <RespiteFund />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/admin/dispatch"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <RespiteDispatch />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/admin/pace"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <PACEDashboard />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/admin/directory"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <CommunityDirectory />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/admin/matching-quality"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <MatchingQuality />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <AdminAnalytics />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/admin/bch"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <BCHPartnership />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/admin/quality"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <QualityMetrics />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />

        {/* Employer */}
        <Route
          path="/employer"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <EmployerDashboard />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/employer/roi"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <ROIReport />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/employer/enrollment"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <EnrollmentView />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />

        {/* Billing */}
        <Route
          path="/billing"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <BillingDashboard />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/billing/tax-statement"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <TaxStatement />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/billing/comfort-card"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <ComfortCard />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/billing/tax-calculator"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <TaxCalculator />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/billing/reconciliation"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <ComfortCardReconciliation />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />

        {/* Wellness Provider */}
        <Route
          path="/wellness"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <WellnessDirectory />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/wellness/bookings"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <WellnessBookings />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <ProfilePage />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <SettingsPage />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />

        {/* Legacy dashboard redirect */}
        <Route
          path="/dashboard"
          element={
            <AuthGate>
              <AppShell>
                <Lazy>
                  <ConductorDashboard />
                </Lazy>
              </AppShell>
            </AuthGate>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
