-- ============================================================
-- CareOS SurrealDB 3.0 Schema
-- Operational database: users, families, timebank, assessments
-- ============================================================

-- ============================================================
-- USERS
-- ============================================================
DEFINE TABLE user SCHEMAFULL;
DEFINE FIELD email ON user TYPE string ASSERT string::is::email($value);
DEFINE FIELD passwordHash ON user TYPE string;
DEFINE FIELD firstName ON user TYPE string;
DEFINE FIELD lastName ON user TYPE string;
DEFINE FIELD phone ON user TYPE option<string>;
DEFINE FIELD roles ON user TYPE array<string>;
DEFINE FIELD activeRole ON user TYPE string;
DEFINE FIELD twoFactorEnabled ON user TYPE bool DEFAULT false;
DEFINE FIELD twoFactorSecret ON user TYPE option<string>;
DEFINE FIELD avatarUrl ON user TYPE option<string>;
DEFINE FIELD location ON user TYPE option<geometry<point>>;
DEFINE FIELD backgroundCheckStatus ON user TYPE string DEFAULT 'not_started';
DEFINE FIELD skills ON user TYPE array<string> DEFAULT [];
DEFINE FIELD rating ON user TYPE option<float>;
DEFINE FIELD ratingCount ON user TYPE int DEFAULT 0;
DEFINE FIELD createdAt ON user TYPE datetime DEFAULT time::now();
DEFINE FIELD updatedAt ON user TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_user_email ON user FIELDS email UNIQUE;

-- ============================================================
-- FAMILIES
-- ============================================================
DEFINE TABLE family SCHEMAFULL;
DEFINE FIELD name ON family TYPE string;
DEFINE FIELD conductorId ON family TYPE record<user>;
DEFINE FIELD membershipStatus ON family TYPE string DEFAULT 'pending';
DEFINE FIELD stripeCustomerId ON family TYPE option<string>;
DEFINE FIELD stripeSubscriptionId ON family TYPE option<string>;
DEFINE FIELD createdAt ON family TYPE datetime DEFAULT time::now();
DEFINE FIELD updatedAt ON family TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_family_conductor ON family FIELDS conductorId;
DEFINE INDEX idx_family_status ON family FIELDS membershipStatus;

-- ============================================================
-- CARE RECIPIENTS
-- ============================================================
DEFINE TABLE care_recipient SCHEMAFULL;
DEFINE FIELD familyId ON care_recipient TYPE record<family>;
DEFINE FIELD firstName ON care_recipient TYPE string;
DEFINE FIELD lastName ON care_recipient TYPE string;
DEFINE FIELD dateOfBirth ON care_recipient TYPE datetime;
DEFINE FIELD mobilityLevel ON care_recipient TYPE string DEFAULT 'independent';
DEFINE FIELD cognitiveStatus ON care_recipient TYPE option<string>;
DEFINE FIELD location ON care_recipient TYPE option<geometry<point>>;
DEFINE FIELD primaryDiagnoses ON care_recipient TYPE array<string> DEFAULT [];
DEFINE FIELD activeOmahaProblems ON care_recipient TYPE array<int> DEFAULT [];
DEFINE FIELD fhirPatientId ON care_recipient TYPE option<string>;
DEFINE FIELD wearableDeviceId ON care_recipient TYPE option<string>;
DEFINE FIELD createdAt ON care_recipient TYPE datetime DEFAULT time::now();
DEFINE FIELD updatedAt ON care_recipient TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_cr_family ON care_recipient FIELDS familyId;

-- ============================================================
-- TIME BANK ACCOUNTS
-- ============================================================
DEFINE TABLE timebank_account SCHEMAFULL;
DEFINE FIELD userId ON timebank_account TYPE record<user>;
DEFINE FIELD balanceEarned ON timebank_account TYPE float DEFAULT 0;
DEFINE FIELD balanceMembership ON timebank_account TYPE float DEFAULT 0;
DEFINE FIELD balanceBought ON timebank_account TYPE float DEFAULT 0;
DEFINE FIELD balanceDonated ON timebank_account TYPE float DEFAULT 0;
DEFINE FIELD balanceExpired ON timebank_account TYPE float DEFAULT 0;
DEFINE FIELD balanceDeficit ON timebank_account TYPE float DEFAULT 0;
DEFINE FIELD currentStreak ON timebank_account TYPE int DEFAULT 0;
DEFINE FIELD longestStreak ON timebank_account TYPE int DEFAULT 0;
DEFINE FIELD lastActivityAt ON timebank_account TYPE option<datetime>;
DEFINE FIELD createdAt ON timebank_account TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_tba_user ON timebank_account FIELDS userId UNIQUE;

-- ============================================================
-- TIME BANK TRANSACTIONS (Ledger)
-- ============================================================
DEFINE TABLE timebank_transaction SCHEMAFULL;
DEFINE FIELD accountId ON timebank_transaction TYPE record<timebank_account>;
DEFINE FIELD type ON timebank_transaction TYPE string;
DEFINE FIELD hours ON timebank_transaction TYPE float;
DEFINE FIELD balanceAfter ON timebank_transaction TYPE float;
DEFINE FIELD taskId ON timebank_transaction TYPE option<record<timebank_task>>;
DEFINE FIELD description ON timebank_transaction TYPE string;
DEFINE FIELD createdAt ON timebank_transaction TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_tbt_account ON timebank_transaction FIELDS accountId;
DEFINE INDEX idx_tbt_created ON timebank_transaction FIELDS createdAt;

-- ============================================================
-- TIME BANK TASKS
-- ============================================================
DEFINE TABLE timebank_task SCHEMAFULL;
DEFINE FIELD requesterId ON timebank_task TYPE record<user>;
DEFINE FIELD careRecipientId ON timebank_task TYPE option<record<care_recipient>>;
DEFINE FIELD taskType ON timebank_task TYPE string;
DEFINE FIELD title ON timebank_task TYPE string;
DEFINE FIELD description ON timebank_task TYPE option<string>;
DEFINE FIELD location ON timebank_task TYPE geometry<point>;
DEFINE FIELD estimatedHours ON timebank_task TYPE float;
DEFINE FIELD status ON timebank_task TYPE string DEFAULT 'open';
DEFINE FIELD matchedUserId ON timebank_task TYPE option<record<user>>;
DEFINE FIELD checkInTime ON timebank_task TYPE option<datetime>;
DEFINE FIELD checkInLocation ON timebank_task TYPE option<geometry<point>>;
DEFINE FIELD checkOutTime ON timebank_task TYPE option<datetime>;
DEFINE FIELD checkOutLocation ON timebank_task TYPE option<geometry<point>>;
DEFINE FIELD actualHours ON timebank_task TYPE option<float>;
DEFINE FIELD omahaProblemCode ON timebank_task TYPE option<int>;
DEFINE FIELD interventionCategory ON timebank_task TYPE option<string>;
DEFINE FIELD rating ON timebank_task TYPE option<int>;
DEFINE FIELD gratitudeNote ON timebank_task TYPE option<string>;
DEFINE FIELD scheduledFor ON timebank_task TYPE option<datetime>;
DEFINE FIELD expiresAt ON timebank_task TYPE option<datetime>;
DEFINE FIELD createdAt ON timebank_task TYPE datetime DEFAULT time::now();
DEFINE FIELD updatedAt ON timebank_task TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_task_status ON timebank_task FIELDS status;
DEFINE INDEX idx_task_requester ON timebank_task FIELDS requesterId;
DEFINE INDEX idx_task_matched ON timebank_task FIELDS matchedUserId;
DEFINE INDEX idx_task_type ON timebank_task FIELDS taskType;
DEFINE INDEX idx_task_location ON timebank_task FIELDS location;

-- ============================================================
-- ASSESSMENTS (CII, Mini CII, CRI)
-- ============================================================
DEFINE TABLE assessment SCHEMAFULL;
DEFINE FIELD familyId ON assessment TYPE record<family>;
DEFINE FIELD careRecipientId ON assessment TYPE option<record<care_recipient>>;
DEFINE FIELD assessorId ON assessment TYPE record<user>;
DEFINE FIELD type ON assessment TYPE string; -- 'cii' | 'mini_cii' | 'cri'
DEFINE FIELD scores ON assessment TYPE array<float>;
DEFINE FIELD totalScore ON assessment TYPE float;
DEFINE FIELD zone ON assessment TYPE option<string>;
DEFINE FIELD reviewStatus ON assessment TYPE string DEFAULT 'completed';
DEFINE FIELD reviewedBy ON assessment TYPE option<record<user>>;
DEFINE FIELD reviewedAt ON assessment TYPE option<datetime>;
DEFINE FIELD fhirQuestionnaireResponseId ON assessment TYPE option<string>;
DEFINE FIELD completedAt ON assessment TYPE datetime DEFAULT time::now();
DEFINE FIELD createdAt ON assessment TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_assessment_family ON assessment FIELDS familyId;
DEFINE INDEX idx_assessment_type ON assessment FIELDS type;
DEFINE INDEX idx_assessment_completed ON assessment FIELDS completedAt;

-- ============================================================
-- KBS OUTCOME RATINGS
-- ============================================================
DEFINE TABLE kbs_rating SCHEMAFULL;
DEFINE FIELD careRecipientId ON kbs_rating TYPE record<care_recipient>;
DEFINE FIELD omahaProblemCode ON kbs_rating TYPE int;
DEFINE FIELD knowledge ON kbs_rating TYPE int;
DEFINE FIELD behavior ON kbs_rating TYPE int;
DEFINE FIELD status ON kbs_rating TYPE int;
DEFINE FIELD assessmentDay ON kbs_rating TYPE int; -- 0, 30, 60, 90
DEFINE FIELD ratedBy ON kbs_rating TYPE record<user>;
DEFINE FIELD fhirObservationId ON kbs_rating TYPE option<string>;
DEFINE FIELD ratedAt ON kbs_rating TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_kbs_recipient ON kbs_rating FIELDS careRecipientId;
DEFINE INDEX idx_kbs_problem ON kbs_rating FIELDS omahaProblemCode;

-- ============================================================
-- CARE INTERACTIONS
-- ============================================================
DEFINE TABLE care_interaction SCHEMAFULL;
DEFINE FIELD familyId ON care_interaction TYPE record<family>;
DEFINE FIELD careRecipientId ON care_interaction TYPE record<care_recipient>;
DEFINE FIELD workerId ON care_interaction TYPE record<user>;
DEFINE FIELD interactionType ON care_interaction TYPE string;
DEFINE FIELD notes ON care_interaction TYPE option<string>;
DEFINE FIELD changeInCondition ON care_interaction TYPE bool DEFAULT false;
DEFINE FIELD changeInConditionSeverity ON care_interaction TYPE option<string>;
DEFINE FIELD vitalsRecorded ON care_interaction TYPE option<object>;
DEFINE FIELD omahaProblems ON care_interaction TYPE array<int> DEFAULT [];
DEFINE FIELD fhirEncounterId ON care_interaction TYPE option<string>;
DEFINE FIELD startedAt ON care_interaction TYPE datetime;
DEFINE FIELD endedAt ON care_interaction TYPE option<datetime>;
DEFINE FIELD createdAt ON care_interaction TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_ci_family ON care_interaction FIELDS familyId;
DEFINE INDEX idx_ci_worker ON care_interaction FIELDS workerId;
DEFINE INDEX idx_ci_created ON care_interaction FIELDS createdAt;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
DEFINE TABLE notification SCHEMAFULL;
DEFINE FIELD userId ON notification TYPE record<user>;
DEFINE FIELD type ON notification TYPE string;
DEFINE FIELD channel ON notification TYPE string;
DEFINE FIELD title ON notification TYPE string;
DEFINE FIELD body ON notification TYPE string;
DEFINE FIELD data ON notification TYPE option<object>;
DEFINE FIELD read ON notification TYPE bool DEFAULT false;
DEFINE FIELD sentAt ON notification TYPE datetime DEFAULT time::now();
DEFINE FIELD readAt ON notification TYPE option<datetime>;

DEFINE INDEX idx_notif_user ON notification FIELDS userId;
DEFINE INDEX idx_notif_read ON notification FIELDS userId, read;

-- ============================================================
-- MESSAGES (Secure Messaging)
-- ============================================================
DEFINE TABLE message SCHEMAFULL;
DEFINE FIELD threadId ON message TYPE string;
DEFINE FIELD senderId ON message TYPE record<user>;
DEFINE FIELD recipientId ON message TYPE record<user>;
DEFINE FIELD body ON message TYPE string;
DEFINE FIELD read ON message TYPE bool DEFAULT false;
DEFINE FIELD readAt ON message TYPE option<datetime>;
DEFINE FIELD createdAt ON message TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_msg_thread ON message FIELDS threadId;
DEFINE INDEX idx_msg_recipient ON message FIELDS recipientId;

-- ============================================================
-- RESPITE EMERGENCY FUND (Singleton)
-- ============================================================
DEFINE TABLE respite_fund SCHEMAFULL;
DEFINE FIELD balanceHours ON respite_fund TYPE float DEFAULT 0;
DEFINE FIELD balanceDollars ON respite_fund TYPE float DEFAULT 0;
DEFINE FIELD autoApprovalThreshold ON respite_fund TYPE float DEFAULT 100;

-- ============================================================
-- WORKER EQUITY (Subchapter T)
-- ============================================================
DEFINE TABLE worker_equity SCHEMAFULL;
DEFINE FIELD workerId ON worker_equity TYPE record<user>;
DEFINE FIELD hoursWorkedThisQuarter ON worker_equity TYPE float DEFAULT 0;
DEFINE FIELD equityRatePerHour ON worker_equity TYPE float DEFAULT 2.0;
DEFINE FIELD accumulatedEquity ON worker_equity TYPE float DEFAULT 0;
DEFINE FIELD vestedEquity ON worker_equity TYPE float DEFAULT 0;
DEFINE FIELD updatedAt ON worker_equity TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_we_worker ON worker_equity FIELDS workerId UNIQUE;

-- ============================================================
-- TRANSACTIONAL OUTBOX (SurrealDB → Aidbox sync)
-- ============================================================
DEFINE TABLE outbox_event SCHEMAFULL;
DEFINE FIELD eventType ON outbox_event TYPE string;
DEFINE FIELD resourceType ON outbox_event TYPE string;
DEFINE FIELD resourceId ON outbox_event TYPE string;
DEFINE FIELD payload ON outbox_event TYPE object;
DEFINE FIELD status ON outbox_event TYPE string DEFAULT 'pending';
DEFINE FIELD retryCount ON outbox_event TYPE int DEFAULT 0;
DEFINE FIELD lastError ON outbox_event TYPE option<string>;
DEFINE FIELD createdAt ON outbox_event TYPE datetime DEFAULT time::now();
DEFINE FIELD processedAt ON outbox_event TYPE option<datetime>;

DEFINE INDEX idx_outbox_status ON outbox_event FIELDS status;
DEFINE INDEX idx_outbox_created ON outbox_event FIELDS createdAt;

-- ============================================================
-- GRAPH EDGES
-- ============================================================

-- Time Bank cascade chain: who helped whom
DEFINE TABLE helped SCHEMAFULL TYPE RELATION FROM user TO user;
DEFINE FIELD taskId ON helped TYPE record<timebank_task>;
DEFINE FIELD hours ON helped TYPE float;
DEFINE FIELD createdAt ON helped TYPE datetime DEFAULT time::now();

-- Cooperative membership
DEFINE TABLE member_of SCHEMAFULL TYPE RELATION FROM user TO family;
DEFINE FIELD role ON member_of TYPE string;
DEFINE FIELD joinedAt ON member_of TYPE datetime DEFAULT time::now();

-- Care team assignment
DEFINE TABLE assigned_to SCHEMAFULL TYPE RELATION FROM user TO family;
DEFINE FIELD role ON assigned_to TYPE string;
DEFINE FIELD assignedAt ON assigned_to TYPE datetime DEFAULT time::now();
DEFINE FIELD active ON assigned_to TYPE bool DEFAULT true;

-- Referral tracking (viral loop)
DEFINE TABLE referred SCHEMAFULL TYPE RELATION FROM user TO user;
DEFINE FIELD bonusAwarded ON referred TYPE bool DEFAULT false;
DEFINE FIELD createdAt ON referred TYPE datetime DEFAULT time::now();
