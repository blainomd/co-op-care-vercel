-- ============================================================
-- CareOS PostgreSQL Schema
-- Operational database: users, families, timebank, assessments
-- Primary operational schema (PostgreSQL)
-- Requires: PostgreSQL 16+ with PostGIS extension
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "postgis";    -- geography, ST_Distance

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE "user" (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  phone         TEXT,
  roles         TEXT[] NOT NULL DEFAULT '{}',
  active_role   TEXT NOT NULL,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  two_factor_secret  TEXT,
  avatar_url    TEXT,
  location      GEOGRAPHY(POINT, 4326),
  background_check_status TEXT NOT NULL DEFAULT 'not_started',
  skills        TEXT[] NOT NULL DEFAULT '{}',
  rating        REAL,
  rating_count  INTEGER NOT NULL DEFAULT 0,
  spotlight_opt_out BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_roles ON "user" USING GIN (roles);

-- ============================================================
-- FAMILIES
-- ============================================================
CREATE TABLE family (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  conductor_id          UUID NOT NULL REFERENCES "user"(id),
  membership_status     TEXT NOT NULL DEFAULT 'pending',
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_family_conductor ON family(conductor_id);
CREATE INDEX idx_family_status ON family(membership_status);

-- ============================================================
-- CARE RECIPIENTS
-- ============================================================
CREATE TABLE care_recipient (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id            UUID NOT NULL REFERENCES family(id) ON DELETE CASCADE,
  first_name           TEXT NOT NULL,
  last_name            TEXT NOT NULL,
  date_of_birth        DATE NOT NULL,
  mobility_level       TEXT NOT NULL DEFAULT 'independent',
  cognitive_status     TEXT,
  location             GEOGRAPHY(POINT, 4326),
  primary_diagnoses    TEXT[] NOT NULL DEFAULT '{}',
  active_omaha_problems INTEGER[] NOT NULL DEFAULT '{}',
  fhir_patient_id      TEXT,
  wearable_device_id   TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cr_family ON care_recipient(family_id);

-- ============================================================
-- TIME BANK ACCOUNTS
-- ============================================================
CREATE TABLE timebank_account (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL UNIQUE REFERENCES "user"(id),
  balance_earned     REAL NOT NULL DEFAULT 0,
  balance_membership REAL NOT NULL DEFAULT 0,
  balance_bought     REAL NOT NULL DEFAULT 0,
  balance_donated    REAL NOT NULL DEFAULT 0,
  balance_expired    REAL NOT NULL DEFAULT 0,
  balance_deficit    REAL NOT NULL DEFAULT 0,
  current_streak     INTEGER NOT NULL DEFAULT 0,
  longest_streak     INTEGER NOT NULL DEFAULT 0,
  last_activity_at   TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TIME BANK TRANSACTIONS (Double-Entry Ledger)
-- ============================================================
CREATE TABLE timebank_transaction (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    UUID NOT NULL REFERENCES timebank_account(id),
  type          TEXT NOT NULL,  -- 'earned','spent','bought','donated','expired','deficit','membership'
  hours         REAL NOT NULL,
  balance_after REAL NOT NULL,
  task_id       UUID,  -- FK added after timebank_task table
  description   TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tbt_account ON timebank_transaction(account_id);
CREATE INDEX idx_tbt_created ON timebank_transaction(created_at);
CREATE INDEX idx_tbt_type ON timebank_transaction(type);

-- ============================================================
-- TIME BANK TASKS
-- ============================================================
CREATE TABLE timebank_task (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id         UUID NOT NULL REFERENCES "user"(id),
  care_recipient_id    UUID REFERENCES care_recipient(id),
  task_type            TEXT NOT NULL,
  title                TEXT NOT NULL,
  description          TEXT,
  location             GEOGRAPHY(POINT, 4326) NOT NULL,
  estimated_hours      REAL NOT NULL,
  status               TEXT NOT NULL DEFAULT 'open',  -- open, matched, in_progress, completed, cancelled
  matched_user_id      UUID REFERENCES "user"(id),
  check_in_time        TIMESTAMPTZ,
  check_in_location    GEOGRAPHY(POINT, 4326),
  check_out_time       TIMESTAMPTZ,
  check_out_location   GEOGRAPHY(POINT, 4326),
  actual_hours         REAL,
  omaha_problem_code   INTEGER,
  intervention_category TEXT,
  rating               INTEGER CHECK (rating BETWEEN 1 AND 5),
  gratitude_note       TEXT,
  scheduled_for        TIMESTAMPTZ,
  expires_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE timebank_transaction
  ADD CONSTRAINT fk_tbt_task FOREIGN KEY (task_id) REFERENCES timebank_task(id);

CREATE INDEX idx_task_status ON timebank_task(status);
CREATE INDEX idx_task_requester ON timebank_task(requester_id);
CREATE INDEX idx_task_matched ON timebank_task(matched_user_id);
CREATE INDEX idx_task_type ON timebank_task(task_type);
CREATE INDEX idx_task_location ON timebank_task USING GIST(location);

-- ============================================================
-- ASSESSMENTS (CII, Mini CII, CRI)
-- ============================================================
CREATE TABLE assessment (
  id                             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id                      UUID NOT NULL REFERENCES family(id),
  care_recipient_id              UUID REFERENCES care_recipient(id),
  assessor_id                    UUID NOT NULL REFERENCES "user"(id),
  type                           TEXT NOT NULL,  -- 'cii', 'mini_cii', 'cri'
  scores                         REAL[] NOT NULL,
  total_score                    REAL NOT NULL,
  zone                           TEXT,  -- 'green', 'yellow', 'red' (null for CRI)
  review_status                  TEXT NOT NULL DEFAULT 'completed',  -- completed, pending, approved, needs_revision
  reviewed_by                    UUID REFERENCES "user"(id),
  reviewed_at                    TIMESTAMPTZ,
  fhir_questionnaire_response_id TEXT,
  completed_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at                     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessment_family ON assessment(family_id);
CREATE INDEX idx_assessment_type ON assessment(type);
CREATE INDEX idx_assessment_completed ON assessment(completed_at);
CREATE INDEX idx_assessment_review ON assessment(review_status) WHERE review_status = 'pending';

-- ============================================================
-- KBS OUTCOME RATINGS
-- ============================================================
CREATE TABLE kbs_rating (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_recipient_id  UUID NOT NULL REFERENCES care_recipient(id),
  omaha_problem_code INTEGER NOT NULL,
  knowledge          INTEGER NOT NULL CHECK (knowledge BETWEEN 1 AND 5),
  behavior           INTEGER NOT NULL CHECK (behavior BETWEEN 1 AND 5),
  status             INTEGER NOT NULL CHECK (status BETWEEN 1 AND 5),
  assessment_day     INTEGER NOT NULL,  -- 0, 30, 60, 90
  rated_by           UUID NOT NULL REFERENCES "user"(id),
  fhir_observation_id TEXT,
  rated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kbs_recipient ON kbs_rating(care_recipient_id);
CREATE INDEX idx_kbs_problem ON kbs_rating(omaha_problem_code);

-- ============================================================
-- CARE INTERACTIONS
-- ============================================================
CREATE TABLE care_interaction (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id                  UUID NOT NULL REFERENCES family(id),
  care_recipient_id          UUID NOT NULL REFERENCES care_recipient(id),
  worker_id                  UUID NOT NULL REFERENCES "user"(id),
  interaction_type           TEXT NOT NULL,
  notes                      TEXT,
  change_in_condition        BOOLEAN NOT NULL DEFAULT false,
  change_in_condition_severity TEXT,
  vitals_recorded            JSONB,
  omaha_problems             INTEGER[] NOT NULL DEFAULT '{}',
  fhir_encounter_id          TEXT,
  started_at                 TIMESTAMPTZ NOT NULL,
  ended_at                   TIMESTAMPTZ,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ci_family ON care_interaction(family_id);
CREATE INDEX idx_ci_worker ON care_interaction(worker_id);
CREATE INDEX idx_ci_created ON care_interaction(created_at);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notification (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES "user"(id),
  type      TEXT NOT NULL,
  channel   TEXT NOT NULL,
  title     TEXT NOT NULL,
  body      TEXT NOT NULL,
  data      JSONB,
  read      BOOLEAN NOT NULL DEFAULT false,
  sent_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at   TIMESTAMPTZ
);

CREATE INDEX idx_notif_user ON notification(user_id);
CREATE INDEX idx_notif_unread ON notification(user_id) WHERE read = false;

-- ============================================================
-- MESSAGES (Secure Messaging)
-- ============================================================
CREATE TABLE message (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id    TEXT NOT NULL,
  sender_id    UUID NOT NULL REFERENCES "user"(id),
  recipient_id UUID NOT NULL REFERENCES "user"(id),
  body         TEXT NOT NULL,
  read         BOOLEAN NOT NULL DEFAULT false,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_msg_thread ON message(thread_id);
CREATE INDEX idx_msg_recipient ON message(recipient_id);

-- ============================================================
-- RESPITE EMERGENCY FUND (Singleton — one row)
-- ============================================================
CREATE TABLE respite_fund (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  balance_hours           REAL NOT NULL DEFAULT 0,
  balance_dollars         REAL NOT NULL DEFAULT 0,
  auto_approval_threshold REAL NOT NULL DEFAULT 100
);

-- Seed the singleton row
INSERT INTO respite_fund (balance_hours, balance_dollars) VALUES (0, 0);

-- ============================================================
-- WORKER EQUITY (Subchapter T)
-- ============================================================
CREATE TABLE worker_equity (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id                UUID NOT NULL UNIQUE REFERENCES "user"(id),
  hours_worked_this_quarter REAL NOT NULL DEFAULT 0,
  equity_rate_per_hour     REAL NOT NULL DEFAULT 2.0,
  accumulated_equity       REAL NOT NULL DEFAULT 0,
  vested_equity            REAL NOT NULL DEFAULT 0,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TRANSACTIONAL OUTBOX (PostgreSQL → Aidbox sync)
-- ============================================================
CREATE TABLE outbox_event (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type    TEXT NOT NULL,  -- 'fhir_observation', 'billing_assessment', 'payroll_instruction'
  resource_type TEXT NOT NULL,
  resource_id   TEXT NOT NULL,
  payload       JSONB NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',  -- pending, processing, processed, failed
  retry_count   INTEGER NOT NULL DEFAULT 0,
  last_error    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at  TIMESTAMPTZ
);

CREATE INDEX idx_outbox_status ON outbox_event(status);
CREATE INDEX idx_outbox_pending ON outbox_event(created_at) WHERE status = 'pending';

-- ============================================================
-- RELATION TABLES (replace SurrealDB graph edges)
-- ============================================================

-- Time Bank cascade chain: who helped whom
CREATE TABLE helped (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user  UUID NOT NULL REFERENCES "user"(id),
  to_user    UUID NOT NULL REFERENCES "user"(id),
  task_id    UUID NOT NULL REFERENCES timebank_task(id),
  hours      REAL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_helped_from ON helped(from_user);
CREATE INDEX idx_helped_to ON helped(to_user);

-- Cooperative membership (user belongs to family)
CREATE TABLE member_of (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES "user"(id),
  family_id  UUID NOT NULL REFERENCES family(id),
  role       TEXT NOT NULL,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, family_id)
);

CREATE INDEX idx_memberof_user ON member_of(user_id);
CREATE INDEX idx_memberof_family ON member_of(family_id);

-- Care team assignment (worker assigned to family)
CREATE TABLE assigned_to (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES "user"(id),
  family_id   UUID NOT NULL REFERENCES family(id),
  role        TEXT NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  active      BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_assigned_user ON assigned_to(user_id);
CREATE INDEX idx_assigned_family ON assigned_to(family_id);

-- Referral tracking (viral loop)
CREATE TABLE referred (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id    UUID NOT NULL REFERENCES "user"(id),
  referred_id    UUID NOT NULL REFERENCES "user"(id),
  bonus_awarded  BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

CREATE INDEX idx_referred_referrer ON referred(referrer_id);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Haversine-based distance check (returns meters)
-- Usage: SELECT haversine_meters(lat1, lon1, lat2, lon2)
-- Or use PostGIS: ST_Distance(geog1, geog2) which returns meters natively
-- 0.25 miles = 402.336 meters

-- updated_at auto-trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_updated BEFORE UPDATE ON "user"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_family_updated BEFORE UPDATE ON family
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_care_recipient_updated BEFORE UPDATE ON care_recipient
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_timebank_task_updated BEFORE UPDATE ON timebank_task
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_worker_equity_updated BEFORE UPDATE ON worker_equity
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
