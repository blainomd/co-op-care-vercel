-- ============================================================
-- CareOS PostgreSQL Schema (MVP)
-- Migrated from PostgreSQL 3.0
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  roles TEXT[] NOT NULL DEFAULT '{}',
  active_role TEXT NOT NULL CHECK (active_role IN (
    'conductor','worker_owner','timebank_member',
    'medical_director','admin','employer_hr','wellness_provider'
  )),
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  two_factor_secret TEXT,
  avatar_url TEXT,
  location JSONB,
  background_check_status TEXT NOT NULL DEFAULT 'not_started',
  skills TEXT[] NOT NULL DEFAULT '{}',
  rating FLOAT,
  rating_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN(roles);

-- ============================================================
-- FAMILIES
-- ============================================================
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  conductor_id UUID NOT NULL REFERENCES users(id),
  membership_status TEXT NOT NULL DEFAULT 'pending',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_families_conductor ON families(conductor_id);
CREATE INDEX IF NOT EXISTS idx_families_status ON families(membership_status);

-- ============================================================
-- CARE RECIPIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS care_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  mobility_level TEXT NOT NULL DEFAULT 'independent',
  cognitive_status TEXT,
  location JSONB,
  primary_diagnoses TEXT[] NOT NULL DEFAULT '{}',
  active_omaha_problems INTEGER[] NOT NULL DEFAULT '{}',
  fhir_patient_id TEXT,
  wearable_device_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_care_recipients_family ON care_recipients(family_id);

-- ============================================================
-- GRAPH EDGE: member_of → family_memberships
-- ============================================================
CREATE TABLE IF NOT EXISTS family_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  family_id UUID NOT NULL REFERENCES families(id),
  role TEXT NOT NULL CHECK (role IN (
    'conductor','worker_owner','timebank_member',
    'medical_director','admin','employer_hr','wellness_provider'
  )),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, family_id)
);

CREATE INDEX IF NOT EXISTS idx_family_memberships_user ON family_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_family_memberships_family ON family_memberships(family_id);

-- ============================================================
-- GRAPH EDGE: assigned_to → care_team_assignments
-- ============================================================
CREATE TABLE IF NOT EXISTS care_team_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  family_id UUID NOT NULL REFERENCES families(id),
  role TEXT NOT NULL CHECK (role IN (
    'conductor','worker_owner','timebank_member',
    'medical_director','admin','employer_hr','wellness_provider'
  )),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_care_team_user ON care_team_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_care_team_family ON care_team_assignments(family_id);

-- ============================================================
-- TIME BANK ACCOUNTS
-- ============================================================
CREATE TABLE IF NOT EXISTS timebank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  balance_earned FLOAT NOT NULL DEFAULT 0,
  balance_membership FLOAT NOT NULL DEFAULT 0,
  balance_bought FLOAT NOT NULL DEFAULT 0,
  balance_spent FLOAT NOT NULL DEFAULT 0,
  balance_donated FLOAT NOT NULL DEFAULT 0,
  balance_expired FLOAT NOT NULL DEFAULT 0,
  balance_deficit FLOAT NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timebank_accounts_user ON timebank_accounts(user_id);

-- ============================================================
-- TIME BANK TASKS
-- Defined before transactions so the FK can reference it
-- ============================================================
CREATE TABLE IF NOT EXISTS timebank_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id),
  care_recipient_id UUID REFERENCES care_recipients(id),
  task_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location JSONB NOT NULL,
  estimated_hours FLOAT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  matched_user_id UUID REFERENCES users(id),
  check_in_time TIMESTAMPTZ,
  check_in_location JSONB,
  check_out_time TIMESTAMPTZ,
  check_out_location JSONB,
  actual_hours FLOAT,
  omaha_problem_code INTEGER,
  intervention_category TEXT,
  rating INTEGER,
  gratitude_note TEXT,
  scheduled_for TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timebank_tasks_status ON timebank_tasks(status);
CREATE INDEX IF NOT EXISTS idx_timebank_tasks_requester ON timebank_tasks(requester_id);
CREATE INDEX IF NOT EXISTS idx_timebank_tasks_matched ON timebank_tasks(matched_user_id);
CREATE INDEX IF NOT EXISTS idx_timebank_tasks_type ON timebank_tasks(task_type);

-- ============================================================
-- TIME BANK TRANSACTIONS (Ledger)
-- ============================================================
CREATE TABLE IF NOT EXISTS timebank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES timebank_accounts(id),
  type TEXT NOT NULL,
  hours FLOAT NOT NULL,
  balance_after FLOAT NOT NULL,
  task_id UUID REFERENCES timebank_tasks(id),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timebank_transactions_account ON timebank_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_timebank_transactions_created ON timebank_transactions(created_at);

-- ============================================================
-- GRAPH EDGE: helped → help_edges
-- ============================================================
CREATE TABLE IF NOT EXISTS help_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  helper_id UUID NOT NULL REFERENCES users(id),
  helped_id UUID NOT NULL REFERENCES users(id),
  task_id UUID REFERENCES timebank_tasks(id),
  hours FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_help_edges_helper ON help_edges(helper_id);
CREATE INDEX IF NOT EXISTS idx_help_edges_helped ON help_edges(helped_id);

-- ============================================================
-- RESPITE FUND (singleton row)
-- ============================================================
CREATE TABLE IF NOT EXISTS respite_fund (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  balance_hours FLOAT NOT NULL DEFAULT 0,
  balance_dollars FLOAT NOT NULL DEFAULT 0,
  auto_approval_threshold FLOAT NOT NULL DEFAULT 100
);

-- ============================================================
-- RESPITE FUND TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS respite_fund_txns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  hours FLOAT NOT NULL DEFAULT 0,
  dollars FLOAT NOT NULL DEFAULT 0,
  source_user_id UUID REFERENCES users(id),
  recipient_user_id UUID REFERENCES users(id),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER STREAKS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  current_weeks INTEGER NOT NULL DEFAULT 0,
  longest_weeks INTEGER NOT NULL DEFAULT 0,
  next_milestone INTEGER,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ASSESSMENTS (CII, Mini CII, CRI)
-- ============================================================
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id),
  care_recipient_id UUID REFERENCES care_recipients(id),
  assessor_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  scores FLOAT[] NOT NULL DEFAULT '{}',
  total_score FLOAT NOT NULL,
  zone TEXT,
  acuity TEXT,
  lmn_eligible BOOLEAN,
  review_status TEXT NOT NULL DEFAULT 'completed',
  review_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  fhir_questionnaire_response_id TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_family ON assessments(family_id);
CREATE INDEX IF NOT EXISTS idx_assessments_type ON assessments(type);
CREATE INDEX IF NOT EXISTS idx_assessments_completed ON assessments(completed_at);

-- ============================================================
-- KBS OUTCOME RATINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS kbs_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_recipient_id UUID NOT NULL REFERENCES care_recipients(id),
  omaha_problem_code INTEGER NOT NULL,
  knowledge INTEGER NOT NULL,
  behavior INTEGER NOT NULL,
  status INTEGER NOT NULL,
  assessment_day INTEGER NOT NULL,
  rated_by UUID NOT NULL REFERENCES users(id),
  fhir_observation_id TEXT,
  rated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kbs_ratings_recipient ON kbs_ratings(care_recipient_id);
CREATE INDEX IF NOT EXISTS idx_kbs_ratings_problem ON kbs_ratings(omaha_problem_code);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  channel TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- ============================================================
-- MESSAGES (Secure Messaging)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);

-- ============================================================
-- TRANSACTIONAL OUTBOX (DB → Aidbox FHIR sync)
-- ============================================================
CREATE TABLE IF NOT EXISTS outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_outbox_events_status ON outbox_events(status);
CREATE INDEX IF NOT EXISTS idx_outbox_events_created ON outbox_events(created_at);

-- ============================================================
-- WORKER EQUITY (Subchapter T)
-- ============================================================
CREATE TABLE IF NOT EXISTS worker_equity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  hours_worked_this_quarter FLOAT NOT NULL DEFAULT 0,
  equity_rate_per_hour FLOAT NOT NULL DEFAULT 2.0,
  accumulated_equity FLOAT NOT NULL DEFAULT 0,
  vested_equity FLOAT NOT NULL DEFAULT 0,
  vesting_start_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SHIFTS
-- ============================================================
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES users(id),
  care_recipient_id UUID NOT NULL REFERENCES care_recipients(id),
  care_recipient_name TEXT,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled',
  check_in_location JSONB,
  check_out_location JSONB,
  breaks JSONB NOT NULL DEFAULT '[]',
  total_break_minutes INTEGER NOT NULL DEFAULT 0,
  billable_hours FLOAT,
  notes TEXT,
  address TEXT,
  task_types TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shifts_worker ON shifts(worker_id);
CREATE INDEX IF NOT EXISTS idx_shifts_start ON shifts(scheduled_start);

-- ============================================================
-- CARE LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS care_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES shifts(id),
  worker_id UUID NOT NULL REFERENCES users(id),
  care_recipient_id UUID NOT NULL REFERENCES care_recipients(id),
  category TEXT NOT NULL,
  notes TEXT NOT NULL,
  omaha_problems INTEGER[] NOT NULL DEFAULT '{}',
  vitals JSONB,
  mood_rating INTEGER,
  alert_level TEXT,
  voice_transcript TEXT,
  duration INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_care_logs_shift ON care_logs(shift_id);
CREATE INDEX IF NOT EXISTS idx_care_logs_worker ON care_logs(worker_id);

-- ============================================================
-- SHIFT SWAPS
-- ============================================================
CREATE TABLE IF NOT EXISTS shift_swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id),
  requester_name TEXT,
  shift_id UUID NOT NULL REFERENCES shifts(id),
  shift_date DATE NOT NULL,
  shift_start TIMESTAMPTZ NOT NULL,
  shift_end TIMESTAMPTZ NOT NULL,
  care_recipient_name TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  offered_to_id UUID REFERENCES users(id),
  offered_to_name TEXT,
  approved_by_id UUID REFERENCES users(id),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LMNs (Letters of Medical Necessity)
-- ============================================================
CREATE TABLE IF NOT EXISTS lmns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_recipient_id UUID NOT NULL REFERENCES care_recipients(id),
  care_recipient_name TEXT NOT NULL,
  generated_by UUID NOT NULL REFERENCES users(id),
  signing_physician_id UUID REFERENCES users(id),
  signing_physician_name TEXT,
  cri_assessment_id UUID REFERENCES assessments(id),
  cri_score FLOAT NOT NULL,
  acuity TEXT NOT NULL,
  diagnosis_codes TEXT[] NOT NULL DEFAULT '{}',
  omaha_problems INTEGER[] NOT NULL DEFAULT '{}',
  care_plan_summary TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  issued_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  duration_days INTEGER NOT NULL DEFAULT 365,
  document_url TEXT,
  signature_request_id TEXT,
  signed_at TIMESTAMPTZ,
  signature_method TEXT,
  last_reminder_tier INTEGER,
  renewal_cri_id UUID REFERENCES assessments(id),
  fhir_document_reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lmns_care_recipient ON lmns(care_recipient_id);
CREATE INDEX IF NOT EXISTS idx_lmns_status ON lmns(status);
CREATE INDEX IF NOT EXISTS idx_lmns_expires ON lmns(expires_at);

-- ============================================================
-- AUDIT LOGS (HIPAA — 6-year retention required)
-- Append-only. No PHI stored — only identifiers and outcome metadata.
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'auth_event', 'phi_access', 'data_change', 'admin_action'
  )),
  action TEXT NOT NULL,   -- login | login_failed | logout | register |
                          -- token_refresh | 2fa_setup | 2fa_verify |
                          -- 2fa_failed | read | create | update | delete
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'failure')),
  user_id TEXT,           -- NULL for anonymous/pre-auth failures
  ip_address TEXT,
  user_agent TEXT,
  resource_type TEXT,     -- e.g. 'family' | 'assessment' | 'user' (no PHI)
  resource_id TEXT,       -- opaque UUID only
  details JSONB,          -- extra context — MUST NOT contain PHI
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- To make rows immutable at DB level, run as superuser after setup:
--   REVOKE UPDATE, DELETE ON audit_logs FROM careos_app;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user       ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action     ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created    ON audit_logs(created_at DESC);

-- ============================================================
-- REFERRALS (replaces referred graph edge)
-- ============================================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id),
  referred_id UUID NOT NULL REFERENCES users(id),
  bonus_awarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAYMENT RECORDS (receipt audit trail — HSA/FSA documentation)
-- MCC 8099: Health & Welfare Organizations (set in Stripe Dashboard)
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id),
  user_id UUID NOT NULL REFERENCES users(id),
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'membership', 'membership_renewal', 'credit_purchase', 'comfort_card'
  )),
  hsa_fsa_eligible BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'succeeded' CHECK (status IN ('succeeded', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_records_family ON payment_records(family_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_user ON payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_stripe_pi ON payment_records(stripe_payment_intent_id);

-- ============================================================
-- PHASE 2 — NEW MODULE TABLES
-- Added for: Care Journey, Community, Matching, Nutrition,
--            Peer Support, Referrals, Reimbursement, Social,
--            Waitlist, Wellness, ACP
-- ============================================================

-- ============================================================
-- MEMORY MODULE (Sage AI agent state)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  profile_data JSONB NOT NULL DEFAULT '{}',
  fhir_connected BOOLEAN NOT NULL DEFAULT false,
  fhir_last_import TIMESTAMPTZ,
  fhir_resource_count INTEGER NOT NULL DEFAULT 0,
  fhir_source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  family_id UUID REFERENCES families(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  message_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_conversation_sessions_user ON conversation_sessions(user_id);

CREATE TABLE IF NOT EXISTS conversation_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  session_id UUID REFERENCES conversation_sessions(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversation_memory_user ON conversation_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_memory_session ON conversation_memory(session_id);

-- ============================================================
-- CARE JOURNEY (Agent orchestration state)
-- ============================================================
CREATE TABLE IF NOT EXISTS care_journey (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) UNIQUE,
  stage TEXT NOT NULL DEFAULT 'discovered',
  profile_completeness FLOAT NOT NULL DEFAULT 0,
  stage_entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  history JSONB NOT NULL DEFAULT '[]',
  assessments JSONB NOT NULL DEFAULT '{}',
  lmn JSONB NOT NULL DEFAULT '{}',
  billing JSONB NOT NULL DEFAULT '{}',
  match_data JSONB NOT NULL DEFAULT '{}',
  profile_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_care_journey_family ON care_journey(family_id);
CREATE INDEX IF NOT EXISTS idx_care_journey_stage ON care_journey(stage);

-- ============================================================
-- LMN REVIEW QUEUE
-- ============================================================
CREATE TABLE IF NOT EXISTS lmn_review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'elevated', 'normal')),
  lmn_id UUID REFERENCES lmns(id),
  family_id UUID REFERENCES families(id),
  data JSONB NOT NULL DEFAULT '{}',
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lmn_review_queue_status ON lmn_review_queue(status);
CREATE INDEX IF NOT EXISTS idx_lmn_review_queue_priority ON lmn_review_queue(priority, created_at);

-- ============================================================
-- COMMUNITY PROFILES & CAPABILITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS community_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  display_name TEXT NOT NULL,
  total_hours_given FLOAT NOT NULL DEFAULT 0,
  total_hours_received FLOAT NOT NULL DEFAULT 0,
  trust_score FLOAT NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  member_since TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tier TEXT NOT NULL DEFAULT 'newcomer' CHECK (tier IN ('newcomer', 'helper', 'trusted', 'guardian', 'elder')),
  opt_in_leaderboard BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_profiles_user ON community_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_community_profiles_tier ON community_profiles(tier);
CREATE INDEX IF NOT EXISTS idx_community_profiles_leaderboard ON community_profiles(opt_in_leaderboard, total_hours_given DESC);

CREATE TABLE IF NOT EXISTS capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  hours_in_category FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_capabilities_user ON capabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_capabilities_verified ON capabilities(user_id, verified);

CREATE TABLE IF NOT EXISTS community_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewee_id UUID NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  task_id UUID REFERENCES timebank_tasks(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_reviews_reviewee ON community_reviews(reviewee_id);

-- ============================================================
-- MATCHING ENGINE
-- ============================================================
CREATE TABLE IF NOT EXISTS match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id),
  care_recipient_id UUID NOT NULL REFERENCES care_recipients(id),
  needs TEXT[] NOT NULL DEFAULT '{}',
  schedule JSONB NOT NULL DEFAULT '{}',
  preferences JSONB NOT NULL DEFAULT '{}',
  urgency TEXT NOT NULL DEFAULT 'routine' CHECK (urgency IN ('routine', 'expedited', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'declined', 'expired')),
  accepted_caregiver_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_requests_family ON match_requests(family_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_status ON match_requests(status);

CREATE TABLE IF NOT EXISTS match_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_request_id UUID NOT NULL REFERENCES match_requests(id),
  family_id UUID NOT NULL REFERENCES families(id),
  caregiver_id UUID NOT NULL REFERENCES users(id),
  match_score FLOAT NOT NULL,
  match_factors JSONB NOT NULL DEFAULT '{}',
  outcome TEXT NOT NULL CHECK (outcome IN ('presented', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_history_request ON match_history(match_request_id);
CREATE INDEX IF NOT EXISTS idx_match_history_caregiver ON match_history(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_match_history_family ON match_history(family_id);

CREATE TABLE IF NOT EXISTS caregiver_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID NOT NULL REFERENCES users(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_caregiver_availability_caregiver ON caregiver_availability(caregiver_id);

-- ============================================================
-- NUTRITION — Meal Plans, Orders, Assessments, Neighbor Kitchens
-- ============================================================
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_recipient_id UUID NOT NULL REFERENCES care_recipients(id),
  care_recipient_name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  conditions TEXT[] NOT NULL DEFAULT '{}',
  dietary_restrictions TEXT[] NOT NULL DEFAULT '{}',
  allergens TEXT[] NOT NULL DEFAULT '{}',
  caloric_target INTEGER,
  protein_target INTEGER,
  meals_per_day INTEGER NOT NULL DEFAULT 3,
  meals_per_week INTEGER NOT NULL DEFAULT 21,
  delivery_days INTEGER[] NOT NULL DEFAULT '{}',
  lmn_id UUID REFERENCES lmns(id),
  icd10_codes TEXT[] NOT NULL DEFAULT '{}',
  hsa_eligible BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_care_recipient ON meal_plans(care_recipient_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_status ON meal_plans(status);

CREATE TABLE IF NOT EXISTS meal_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES meal_plans(id),
  care_recipient_id UUID NOT NULL REFERENCES care_recipients(id),
  meals JSONB NOT NULL DEFAULT '[]',
  special_instructions TEXT,
  prepared_by TEXT NOT NULL CHECK (prepared_by IN ('neighbor', 'cloud_kitchen', 'caregiver')),
  preparer_id UUID NOT NULL REFERENCES users(id),
  preparer_name TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_window TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'scheduled' CHECK (delivery_status IN (
    'scheduled', 'preparing', 'ready', 'in_transit', 'delivered', 'cancelled'
  )),
  delivered_at TIMESTAMPTZ,
  total_calories INTEGER NOT NULL DEFAULT 0,
  total_protein INTEGER NOT NULL DEFAULT 0,
  cost FLOAT NOT NULL DEFAULT 0,
  hsa_claimable BOOLEAN NOT NULL DEFAULT false,
  time_bank_hours FLOAT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  rating_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_orders_plan ON meal_orders(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_orders_care_recipient ON meal_orders(care_recipient_id);
CREATE INDEX IF NOT EXISTS idx_meal_orders_preparer ON meal_orders(preparer_id);
CREATE INDEX IF NOT EXISTS idx_meal_orders_delivery_date ON meal_orders(delivery_date);

CREATE TABLE IF NOT EXISTS nutrition_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_recipient_id UUID NOT NULL REFERENCES care_recipients(id),
  assessed_by UUID NOT NULL REFERENCES users(id),
  weight_loss TEXT NOT NULL CHECK (weight_loss IN ('none', 'unsure', '1_3kg', 'over_3kg')),
  mobility_level TEXT NOT NULL,
  psychological_stress BOOLEAN NOT NULL DEFAULT false,
  neuropsychological TEXT NOT NULL,
  bmi FLOAT,
  calf_circumference FLOAT,
  total_score FLOAT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('normal', 'at_risk', 'malnourished')),
  sarcf_strength INTEGER NOT NULL DEFAULT 0,
  sarcf_assist_walking INTEGER NOT NULL DEFAULT 0,
  sarcf_rise_from_chair INTEGER NOT NULL DEFAULT 0,
  sarcf_climb_stairs INTEGER NOT NULL DEFAULT 0,
  sarcf_falls INTEGER NOT NULL DEFAULT 0,
  sarcf_total INTEGER NOT NULL DEFAULT 0,
  fall_risk_elevated BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nutrition_assessments_care_recipient ON nutrition_assessments(care_recipient_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_assessments_completed ON nutrition_assessments(completed_at DESC);

CREATE TABLE IF NOT EXISTS neighbor_kitchens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighbor_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  neighbor_name TEXT NOT NULL,
  cottage_food_certified BOOLEAN NOT NULL DEFAULT false,
  food_handler_certified BOOLEAN NOT NULL DEFAULT false,
  certification_expiry DATE,
  cuisine_types TEXT[] NOT NULL DEFAULT '{}',
  can_prepare_pureed BOOLEAN NOT NULL DEFAULT false,
  can_prepare_high_protein BOOLEAN NOT NULL DEFAULT false,
  can_prepare_diabetic_friendly BOOLEAN NOT NULL DEFAULT false,
  max_meals_per_day INTEGER NOT NULL DEFAULT 3,
  delivery_radius FLOAT NOT NULL DEFAULT 2,
  available_days INTEGER[] NOT NULL DEFAULT '{}',
  total_meals_delivered INTEGER NOT NULL DEFAULT 0,
  average_rating FLOAT NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN (
    'pending_approval', 'active', 'suspended', 'inactive'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_neighbor_kitchens_status ON neighbor_kitchens(status);

-- ============================================================
-- PEER SUPPORT — Communities, Posts, Comments, Memberships
-- ============================================================
CREATE TABLE IF NOT EXISTS peer_communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  conditions TEXT[] NOT NULL DEFAULT '{}',
  member_count INTEGER NOT NULL DEFAULT 0,
  post_count INTEGER NOT NULL DEFAULT 0,
  moderator_ids UUID[] NOT NULL DEFAULT '{}',
  guidelines TEXT NOT NULL DEFAULT 'Be respectful. No medical advice — share experiences, not prescriptions.',
  smart_patients_url TEXT,
  external_resources JSONB NOT NULL DEFAULT '[]',
  partner_orgs JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_peer_communities_slug ON peer_communities(slug);
CREATE INDEX IF NOT EXISTS idx_peer_communities_conditions ON peer_communities USING GIN(conditions);

CREATE TABLE IF NOT EXISTS peer_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES peer_communities(id),
  author_id UUID NOT NULL REFERENCES users(id),
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('question', 'experience', 'resource', 'tip', 'milestone', 'research')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  related_conditions TEXT[] NOT NULL DEFAULT '{}',
  related_medications TEXT[] NOT NULL DEFAULT '{}',
  related_interventions TEXT[] NOT NULL DEFAULT '{}',
  upvotes INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  bookmark_count INTEGER NOT NULL DEFAULT 0,
  pinned BOOLEAN NOT NULL DEFAULT false,
  flagged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_peer_posts_community ON peer_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_peer_posts_author ON peer_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_peer_posts_created ON peer_posts(created_at DESC);

CREATE TABLE IF NOT EXISTS peer_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES peer_posts(id),
  author_id UUID NOT NULL REFERENCES users(id),
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  content TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  is_clinician_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_peer_comments_post ON peer_comments(post_id);

CREATE TABLE IF NOT EXISTS community_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  community_id UUID NOT NULL REFERENCES peer_communities(id),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'expert')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (user_id, community_id)
);

CREATE INDEX IF NOT EXISTS idx_community_memberships_user ON community_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_community_memberships_community ON community_memberships(community_id);

-- ============================================================
-- REFERRAL REWARDS (Growth / cooperative member referral program)
-- ============================================================
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES users(id),
  owner_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('member', 'physician', 'employer', 'partner')),
  reward_type TEXT NOT NULL,
  referee_reward TEXT NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 10,
  used_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_owner ON referral_codes(owner_id);

CREATE TABLE IF NOT EXISTS referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id),
  referrer_id UUID NOT NULL REFERENCES users(id),
  referee_id UUID NOT NULL REFERENCES users(id),
  referee_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'signed_up', 'background_cleared', 'first_visit_complete', 'reward_issued', 'expired'
  )),
  signed_up_at TIMESTAMPTZ,
  background_cleared_at TIMESTAMPTZ,
  first_visit_at TIMESTAMPTZ,
  reward_issued_at TIMESTAMPTZ,
  reward_type TEXT NOT NULL,
  reward_value FLOAT NOT NULL DEFAULT 0,
  reward_description TEXT NOT NULL DEFAULT '',
  meal_order_id UUID REFERENCES meal_orders(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_events_referrer ON referral_events(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_code ON referral_events(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_status ON referral_events(status);

-- ============================================================
-- CLINICAL REFERRALS (Hospital / social worker → CareOS intake)
-- Distinct from referrals (user-to-user growth referrals)
-- ============================================================
CREATE TABLE IF NOT EXISTS clinical_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('hospital', 'social_worker', 'physician', 'self')),
  source_organization TEXT,
  source_contact_name TEXT,
  source_contact_email TEXT,
  patient_first_name TEXT NOT NULL,
  patient_last_name TEXT NOT NULL,
  patient_date_of_birth DATE NOT NULL,
  patient_age INTEGER,
  patient_conditions TEXT[] NOT NULL DEFAULT '{}',
  patient_medications TEXT[] NOT NULL DEFAULT '{}',
  patient_mobility_level TEXT,
  patient_state TEXT NOT NULL,
  caregiver_first_name TEXT,
  caregiver_last_name TEXT,
  caregiver_relationship TEXT,
  caregiver_email TEXT,
  caregiver_phone TEXT,
  discharge_date DATE,
  urgency TEXT NOT NULL DEFAULT 'routine' CHECK (urgency IN ('routine', 'expedited', 'urgent')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'declined', 'converted_to_family'
  )),
  estimated_cri_score FLOAT NOT NULL DEFAULT 0,
  estimated_acuity TEXT NOT NULL DEFAULT 'moderate' CHECK (estimated_acuity IN ('low', 'moderate', 'high', 'critical')),
  recommended_tier TEXT NOT NULL DEFAULT 'standard',
  lmn_draft_id UUID REFERENCES lmns(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinical_referrals_status ON clinical_referrals(status);
CREATE INDEX IF NOT EXISTS idx_clinical_referrals_created ON clinical_referrals(created_at DESC);

-- ============================================================
-- REIMBURSEMENT CLAIMS (HSA/FSA)
-- ============================================================
CREATE TABLE IF NOT EXISTS reimbursement_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id),
  care_recipient_id UUID NOT NULL REFERENCES care_recipients(id),
  care_recipient_name TEXT NOT NULL,
  lmn_id UUID NOT NULL REFERENCES lmns(id),
  claim_period_start DATE NOT NULL,
  claim_period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'ready', 'submitted', 'approved', 'denied', 'needs_info'
  )),
  line_items JSONB NOT NULL DEFAULT '[]',
  total_amount FLOAT NOT NULL DEFAULT 0,
  estimated_reimbursement FLOAT NOT NULL DEFAULT 0,
  lmn_document_hash TEXT,
  supporting_documents TEXT[] NOT NULL DEFAULT '{}',
  irs_categories TEXT[] NOT NULL DEFAULT '{}',
  tax_year INTEGER NOT NULL,
  hsa_provider TEXT,
  hsa_account_id TEXT,
  submitted_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  denial_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reimbursement_claims_family ON reimbursement_claims(family_id);
CREATE INDEX IF NOT EXISTS idx_reimbursement_claims_care_recipient ON reimbursement_claims(care_recipient_id);
CREATE INDEX IF NOT EXISTS idx_reimbursement_claims_status ON reimbursement_claims(status);
CREATE INDEX IF NOT EXISTS idx_reimbursement_claims_tax_year ON reimbursement_claims(family_id, tax_year);

-- ============================================================
-- SOCIAL NETWORK — Care Circles, Posts, Comments, Milestones
-- ============================================================
CREATE TABLE IF NOT EXISTS care_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('family', 'neighborhood', 'interest')),
  member_ids UUID[] NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_care_circles_created_by ON care_circles(created_by);
CREATE INDEX IF NOT EXISTS idx_care_circles_members ON care_circles USING GIN(member_ids);

CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id),
  author_name TEXT NOT NULL,
  author_tier TEXT NOT NULL DEFAULT 'newcomer',
  type TEXT NOT NULL CHECK (type IN ('care_moment', 'milestone', 'ask', 'offer', 'gratitude', 'tip', 'event')),
  content TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'coop' CHECK (visibility IN ('coop', 'neighborhood', 'private')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  reactions JSONB NOT NULL DEFAULT '{}',
  comment_count INTEGER NOT NULL DEFAULT 0,
  circle_id UUID REFERENCES care_circles(id),
  flagged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_posts_author ON social_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_circle ON social_posts(circle_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created ON social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_visibility ON social_posts(visibility);

CREATE TABLE IF NOT EXISTS social_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id),
  author_id UUID NOT NULL REFERENCES users(id),
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_comments_post ON social_comments(post_id);

CREATE TABLE IF NOT EXISTS milestone_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN (
    'hours_milestone', 'tier_upgrade', 'capability_earned',
    'first_visit', 'anniversary', 'lmn_approved'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  celebrated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestone_events_user ON milestone_events(user_id);
CREATE INDEX IF NOT EXISTS idx_milestone_events_celebrated ON milestone_events(celebrated_at DESC);

-- ============================================================
-- WAITLIST (Lead capture + FOMO engine)
-- ============================================================
CREATE TABLE IF NOT EXISTS waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  source TEXT NOT NULL CHECK (source IN (
    'homepage_quiz', 'referral', 'social_share', 'physician', 'employer', 'direct'
  )),
  quiz_score FLOAT,
  quiz_zone TEXT CHECK (quiz_zone IN ('green', 'yellow', 'red')),
  interests TEXT[] NOT NULL DEFAULT '{}',
  zip_code TEXT,
  role TEXT CHECK (role IN ('family', 'caregiver', 'neighbor', 'employer', 'physician')),
  referred_by TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'invited', 'converted', 'declined')),
  priority INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  converted_user_id UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invited_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_waitlist_entries_status ON waitlist_entries(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_priority ON waitlist_entries(priority DESC, position ASC);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_email ON waitlist_entries(email);

-- ============================================================
-- WELLNESS MARKETPLACE
-- ============================================================
CREATE TABLE IF NOT EXISTS wellness_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  conditions TEXT[] NOT NULL DEFAULT '{}',
  interventions TEXT[] NOT NULL DEFAULT '{}',
  contraindications TEXT[] NOT NULL DEFAULT '{}',
  ease_of_use INTEGER NOT NULL CHECK (ease_of_use BETWEEN 1 AND 5),
  setup_complexity TEXT NOT NULL CHECK (setup_complexity IN ('none', 'minimal', 'moderate', 'professional_install')),
  tech_required TEXT NOT NULL CHECK (tech_required IN ('none', 'smartphone', 'wifi', 'bluetooth')),
  cognitive_load TEXT NOT NULL CHECK (cognitive_load IN ('very_low', 'low', 'moderate', 'high')),
  price_min FLOAT NOT NULL DEFAULT 0,
  price_max FLOAT NOT NULL DEFAULT 0,
  pricing_model TEXT NOT NULL CHECK (pricing_model IN ('one_time', 'monthly', 'annual', 'per_use')),
  hsa_eligible BOOLEAN NOT NULL DEFAULT false,
  coop_rating FLOAT NOT NULL DEFAULT 0,
  coop_review TEXT NOT NULL DEFAULT '',
  member_review_count INTEGER NOT NULL DEFAULT 0,
  member_avg_rating FLOAT NOT NULL DEFAULT 0,
  affiliate_url TEXT,
  partner_discount JSONB,
  image_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wellness_products_category ON wellness_products(category);
CREATE INDEX IF NOT EXISTS idx_wellness_products_active ON wellness_products(active, featured DESC);
CREATE INDEX IF NOT EXISTS idx_wellness_products_conditions ON wellness_products USING GIN(conditions);

CREATE TABLE IF NOT EXISTS wellness_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  conditions TEXT[] NOT NULL DEFAULT '{}',
  products JSONB NOT NULL DEFAULT '[]',
  total_price_min FLOAT NOT NULL DEFAULT 0,
  total_price_max FLOAT NOT NULL DEFAULT 0,
  hsa_eligible_amount FLOAT NOT NULL DEFAULT 0,
  savings FLOAT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wellness_bundles_conditions ON wellness_bundles USING GIN(conditions);

CREATE TABLE IF NOT EXISTS wellness_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  care_recipient_id UUID NOT NULL REFERENCES care_recipients(id),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('assessment', 'sage_conversation', 'condition', 'manual')),
  trigger_details TEXT NOT NULL,
  products JSONB NOT NULL DEFAULT '[]',
  viewed_at TIMESTAMPTZ,
  products_clicked TEXT[] NOT NULL DEFAULT '{}',
  products_purchased TEXT[] NOT NULL DEFAULT '{}',
  dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wellness_recommendations_user ON wellness_recommendations(user_id);

CREATE TABLE IF NOT EXISTS wellness_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES wellness_products(id),
  user_id UUID NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_wellness_reviews_product ON wellness_reviews(product_id);

-- ============================================================
-- ACP — Advance Care Planning
-- ============================================================
CREATE TABLE IF NOT EXISTS acp_directives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id),
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  witnesses TEXT[] NOT NULL DEFAULT '{}',
  notarized BOOLEAN NOT NULL DEFAULT false,
  effective_date DATE,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acp_directives_family ON acp_directives(family_id);

CREATE TABLE IF NOT EXISTS acp_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acp_goals_family ON acp_goals(family_id);

CREATE TABLE IF NOT EXISTS acp_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id),
  category TEXT NOT NULL,
  preference TEXT NOT NULL,
  importance TEXT NOT NULL DEFAULT 'medium',
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acp_preferences_family ON acp_preferences(family_id);

CREATE TABLE IF NOT EXISTS acp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id),
  participants TEXT[] NOT NULL DEFAULT '{}',
  topics TEXT[] NOT NULL DEFAULT '{}',
  summary TEXT NOT NULL,
  next_steps TEXT[] NOT NULL DEFAULT '{}',
  mood TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acp_conversations_family ON acp_conversations(family_id);

CREATE TABLE IF NOT EXISTS acp_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id),
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acp_checklists_family ON acp_checklists(family_id);
