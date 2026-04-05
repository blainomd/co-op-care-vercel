-- User Memory Schema — PostgreSQL
-- Commercial-grade profile persistence for Sage conversations
-- Replaces localStorage-only memory with server-side durability

-- ─── User Profiles ──────────────────────────────────────────────────
-- The "living profile" built from Sage conversations
CREATE TABLE IF NOT EXISTS user_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL UNIQUE,         -- Firebase UID, memberId, or anonymous ID
  email           TEXT,
  phone           TEXT,
  first_name      TEXT,

  -- Care recipient (extracted from conversation)
  care_recipient  JSONB DEFAULT '{}',           -- { name, age, relationship, conditions[], medications[], riskFlags[], ... }

  -- Caregiver context
  caregiver_ctx   JSONB DEFAULT '{}',           -- { employment, livesWithRecipient, distance, ... }

  -- Care circle / network
  network         JSONB DEFAULT '[]',           -- [{ name, relationship, role, ... }]

  -- Assessment scores
  last_mini_cii   JSONB,                        -- { physical, sleep, isolation, total, zone }
  last_cri        JSONB,                        -- { mobility, memory, dailyTasks, medications, social, total, zone, omahaFlags[] }

  -- Engagement
  seeds           JSONB DEFAULT '{"total": 0, "history": []}',
  conversation_count INTEGER DEFAULT 0,
  top_domains     JSONB DEFAULT '{}',           -- { "billing": 5, "emotional_support": 3, ... }
  referral_count  INTEGER DEFAULT 0,

  -- Onboarding state
  onboarding_phase TEXT DEFAULT 'fresh',
  memory_consent   TEXT DEFAULT 'pending',      -- 'granted' | 'session_only' | 'pending'
  community_roles  TEXT[] DEFAULT '{}',

  -- Identity verification
  id_verified     BOOLEAN DEFAULT FALSE,
  id_verified_at  TIMESTAMPTZ,
  id_provider     TEXT,                         -- 'persona', 'jumio', 'manual'
  id_document     JSONB,                        -- { type: 'drivers_license', state, dob, ... } (no images stored)

  -- FHIR linkage
  fhir_patient_id TEXT,                         -- Aidbox Patient resource ID
  fhir_data_imported BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  last_visit      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON user_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON user_profiles (email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON user_profiles (phone) WHERE phone IS NOT NULL;

-- ─── Conversation Memory ────────────────────────────────────────────
-- Stores conversation summaries, not raw messages (HIPAA-friendly)
CREATE TABLE IF NOT EXISTS conversation_memory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,

  -- What Sage "remembers" — a structured summary, not raw chat
  memory_summary  TEXT,                         -- Natural language: "Sarah is caring for her mother Alice (82, dementia)..."

  -- Key facts extracted (queryable)
  facts           JSONB DEFAULT '[]',           -- [{ category, fact, confidence, source_date }]

  -- Conversation stats
  total_messages  INTEGER DEFAULT 0,
  session_count   INTEGER DEFAULT 0,

  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_user_id ON conversation_memory (user_id);

-- ─── Conversation Sessions ──────────────────────────────────────────
-- Individual chat sessions (for analytics, not replay)
CREATE TABLE IF NOT EXISTS conversation_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,

  -- Session metadata
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  ended_at        TIMESTAMPTZ,
  message_count   INTEGER DEFAULT 0,
  domains_discussed TEXT[] DEFAULT '{}',

  -- Profile changes during this session
  profile_delta   JSONB DEFAULT '{}',           -- What was learned in this session

  -- Summary of this specific session
  session_summary TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON conversation_sessions (user_id);

-- ─── Trigger: auto-update updated_at ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated ON user_profiles;
CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_memory_updated ON conversation_memory;
CREATE TRIGGER trg_memory_updated
  BEFORE UPDATE ON conversation_memory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
