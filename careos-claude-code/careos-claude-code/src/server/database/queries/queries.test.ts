/**
 * Query Builder Tests — Mock PostgreSQL, verify query construction + params
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock PostgreSQL ────────────────────────────────────

const mockQuery = vi.fn();
const mockCreate = vi.fn();

vi.mock('../postgres.js', () => ({
  getPostgres: () => ({
    query: mockQuery,
    create: mockCreate,
  }),
}));

// ── Import query builders (after mock) ────────────────

import {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  setTwoFactorSecret,
  enableTwoFactor,
  updateUserLocation,
  listUsersByRole,
  findNearbyUsers,
} from './users.js';

import {
  createFamily,
  getFamilyById,
  listFamiliesByConductor,
  updateFamily,
  deleteFamily,
  createCareRecipient,
  assignToCareTeam,
  removeCareTeamMember,
  getCareTeam,
  getFamiliesForUser,
} from './families.js';

import {
  createAssessment,
  reviewAssessment,
  setFhirId,
  getAssessmentHistory,
  getPendingCRIReviews,
  createKBSRating,
  getKBSHistory,
  countKBSForRecipient,
} from './assessments.js';

import {
  getOrCreateAccount,
  updateAccountBalance,
  updateStreak,
  creditMembershipFloor,
  createTransaction,
  getTransactionHistory,
  createTask,
  updateTaskStatus,
  listOpenTasks,
  listOpenTasksNear,
  listUserTasks,
  getCascadeChain,
  recordHelped,
  getRespiteFund,
  updateRespiteFund,
} from './timebank.js';

import {
  createNotification,
  getUnreadNotifications,
  getAllNotifications,
  markNotificationRead,
  markAllRead,
  countUnread,
  createMessage,
  getThread,
  listThreadsForUser,
  markThreadRead,
} from './notifications.js';

import {
  createOutboxEvent,
  claimPendingEvents,
  markEventCompleted,
  markEventFailed,
  requeueFailedEvents,
  getDeadLetterEvents,
  purgeCompletedEvents,
} from './outbox.js';

// ── Helpers ───────────────────────────────────────────

beforeEach(() => {
  mockQuery.mockReset();
  mockCreate.mockReset();
});

function expectQueryContains(pattern: string | RegExp) {
  const call = mockQuery.mock.calls[mockQuery.mock.calls.length - 1]!;
  const sql = call[0] as string;
  if (typeof pattern === 'string') {
    expect(sql).toContain(pattern);
  } else {
    expect(sql).toMatch(pattern);
  }
}

function expectQueryParams(params: Record<string, unknown>) {
  const call = mockQuery.mock.calls[mockQuery.mock.calls.length - 1]!;
  const actual = call[1] as Record<string, unknown>;
  for (const [key, value] of Object.entries(params)) {
    expect(actual[key]).toEqual(value);
  }
}

// ── User Query Tests ──────────────────────────────────

describe('User Queries', () => {
  it('createUser calls db.create with correct defaults', async () => {
    mockCreate.mockResolvedValue([{ id: 'user:1', email: 'a@b.com' }]);
    const result = await createUser({
      email: 'a@b.com',
      passwordHash: 'hash',
      firstName: 'A',
      lastName: 'B',
      roles: ['conductor'],
      activeRole: 'conductor',
    });
    expect(mockCreate).toHaveBeenCalledWith(
      'user',
      expect.objectContaining({
        email: 'a@b.com',
        twoFactorEnabled: false,
        twoFactorSecret: null,
        avatarUrl: null,
        location: null,
        backgroundCheckStatus: 'not_started',
        skills: [],
        rating: null,
        ratingCount: 0,
      }),
    );
    expect(result.id).toBe('user:1');
  });

  it('getUserById queries by type::thing', async () => {
    mockQuery.mockResolvedValue([[{ id: 'user:abc' }]]);
    const result = await getUserById('abc');
    expectQueryContains('type::thing("user", $id)');
    expectQueryParams({ id: 'abc' });
    expect(result?.id).toBe('user:abc');
  });

  it('getUserById returns null when no result', async () => {
    mockQuery.mockResolvedValue([[]]);
    const result = await getUserById('missing');
    expect(result).toBeNull();
  });

  it('getUserByEmail queries by email', async () => {
    mockQuery.mockResolvedValue([[{ id: 'user:1', email: 'x@y.com' }]]);
    await getUserByEmail('x@y.com');
    expectQueryContains('email = $email');
    expectQueryParams({ email: 'x@y.com' });
  });

  it('updateUser merges data and sets updatedAt', async () => {
    mockQuery.mockResolvedValue([[{ id: 'user:1' }]]);
    await updateUser('1', { firstName: 'New' });
    expectQueryContains('MERGE $data');
    const call = mockQuery.mock.calls[0]!;
    const params = call[1] as { data: { firstName: string; updatedAt: string } };
    expect(params.data.firstName).toBe('New');
    expect(params.data.updatedAt).toBeDefined();
  });

  it('deleteUser sends DELETE query', async () => {
    mockQuery.mockResolvedValue([]);
    await deleteUser('abc');
    expectQueryContains('DELETE');
    expectQueryParams({ id: 'abc' });
  });

  it('setTwoFactorSecret updates secret', async () => {
    mockQuery.mockResolvedValue([]);
    await setTwoFactorSecret('u1', 'secret123');
    expectQueryContains('twoFactorSecret = $secret');
    expectQueryParams({ id: 'u1', secret: 'secret123' });
  });

  it('enableTwoFactor sets flag to true', async () => {
    mockQuery.mockResolvedValue([]);
    await enableTwoFactor('u1');
    expectQueryContains('twoFactorEnabled = true');
  });

  it('updateUserLocation sets geo point', async () => {
    mockQuery.mockResolvedValue([]);
    await updateUserLocation('u1', -105.27, 40.015);
    expectQueryContains('coordinates');
    expectQueryParams({ id: 'u1', lng: -105.27, lat: 40.015 });
  });

  it('listUsersByRole filters by role', async () => {
    mockQuery.mockResolvedValue([[]]);
    await listUsersByRole('worker_owner');
    expectQueryContains('$role IN roles');
    expectQueryParams({ role: 'worker_owner' });
  });

  it('findNearbyUsers converts miles to meters', async () => {
    mockQuery.mockResolvedValue([[]]);
    await findNearbyUsers(-105.27, 40.015, 10);
    expectQueryContains('geo::distance');
    const call = mockQuery.mock.calls[0]!;
    const params = call[1] as { radius: number };
    expect(params.radius).toBeCloseTo(10 * 1609.34, 0);
  });

  it('findNearbyUsers adds skill filter when skills provided', async () => {
    mockQuery.mockResolvedValue([[]]);
    await findNearbyUsers(-105.27, 40.015, 10, ['medication_mgmt']);
    expectQueryContains('array::intersect');
  });
});

// ── Family Query Tests ────────────────────────────────

describe('Family Queries', () => {
  it('createFamily creates family and graph edge', async () => {
    mockCreate.mockResolvedValue([{ id: 'family:f1' }]);
    mockQuery.mockResolvedValue([]);
    const result = await createFamily({ name: 'Smith', conductorId: 'u1' });
    expect(mockCreate).toHaveBeenCalledWith(
      'family',
      expect.objectContaining({
        name: 'Smith',
        conductorId: 'u1',
        membershipStatus: 'pending',
      }),
    );
    // Second call should be the RELATE edge
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expectQueryContains('RELATE');
    expect(result.id).toBe('family:f1');
  });

  it('getFamilyById returns family or null', async () => {
    mockQuery.mockResolvedValue([[]]);
    const result = await getFamilyById('missing');
    expect(result).toBeNull();
  });

  it('listFamiliesByConductor filters by conductor', async () => {
    mockQuery.mockResolvedValue([[]]);
    await listFamiliesByConductor('u1');
    expectQueryContains('conductorId = type::thing("user", $conductorId)');
    expectQueryParams({ conductorId: 'u1' });
  });

  it('updateFamily merges and returns updated record', async () => {
    mockQuery.mockResolvedValue([[{ id: 'family:f1', membershipStatus: 'active' }]]);
    const result = await updateFamily('f1', { membershipStatus: 'active' });
    expectQueryContains('MERGE');
    expect(result?.membershipStatus).toBe('active');
  });

  it('deleteFamily deletes edges then family', async () => {
    mockQuery.mockResolvedValue([]);
    await deleteFamily('f1');
    expect(mockQuery).toHaveBeenCalledTimes(3); // member_of, assigned_to, family
  });

  it('createCareRecipient sets defaults', async () => {
    mockCreate.mockResolvedValue([{ id: 'care_recipient:cr1' }]);
    await createCareRecipient({
      familyId: 'f1',
      firstName: 'Helen',
      lastName: 'Smith',
      dateOfBirth: '1940-05-15',
    });
    expect(mockCreate).toHaveBeenCalledWith(
      'care_recipient',
      expect.objectContaining({
        mobilityLevel: 'independent',
        cognitiveStatus: null,
        location: null,
        activeOmahaProblems: [],
        fhirPatientId: null,
      }),
    );
  });

  it('assignToCareTeam creates RELATE edge', async () => {
    mockQuery.mockResolvedValue([]);
    await assignToCareTeam('u2', 'f1', 'nurse');
    expectQueryContains('RELATE');
    expectQueryContains('assigned_to');
    expectQueryParams({ userId: 'u2', familyId: 'f1', role: 'nurse' });
  });

  it('removeCareTeamMember sets active = false', async () => {
    mockQuery.mockResolvedValue([]);
    await removeCareTeamMember('u2', 'f1');
    expectQueryContains('active = false');
  });

  it('getCareTeam filters active members', async () => {
    mockQuery.mockResolvedValue([[]]);
    await getCareTeam('f1');
    expectQueryContains('active = true');
    expectQueryParams({ familyId: 'f1' });
  });

  it('getFamiliesForUser unions member_of and assigned_to', async () => {
    mockQuery.mockResolvedValue([[{ out: 'family:f1' }, { out: 'family:f2' }]]);
    const result = await getFamiliesForUser('u1');
    expectQueryContains('UNION');
    expect(result).toHaveLength(2);
  });
});

// ── Assessment Query Tests ────────────────────────────

describe('Assessment Queries', () => {
  it('createAssessment sets CRI to pending review', async () => {
    mockCreate.mockResolvedValue([{ id: 'assessment:a1', type: 'cri' }]);
    await createAssessment({
      familyId: 'f1',
      assessorId: 'u1',
      type: 'cri',
      scores: [3, 4, 5],
      totalScore: 12,
    });
    expect(mockCreate).toHaveBeenCalledWith(
      'assessment',
      expect.objectContaining({
        reviewStatus: 'pending',
      }),
    );
  });

  it('createAssessment sets CII to completed', async () => {
    mockCreate.mockResolvedValue([{ id: 'assessment:a2', type: 'cii' }]);
    await createAssessment({
      familyId: 'f1',
      assessorId: 'u1',
      type: 'cii',
      scores: [1, 2, 3],
      totalScore: 6,
    });
    expect(mockCreate).toHaveBeenCalledWith(
      'assessment',
      expect.objectContaining({
        reviewStatus: 'completed',
      }),
    );
  });

  it('reviewAssessment updates status and reviewer', async () => {
    mockQuery.mockResolvedValue([[{ id: 'assessment:a1', reviewStatus: 'approved' }]]);
    const result = await reviewAssessment('a1', 'dr1', 'approved');
    expectQueryContains('reviewStatus = $status');
    expectQueryContains('reviewedBy = type::thing("user", $reviewerId)');
    expect(result?.reviewStatus).toBe('approved');
  });

  it('setFhirId links FHIR QuestionnaireResponse', async () => {
    mockQuery.mockResolvedValue([]);
    await setFhirId('a1', 'fhir-123');
    expectQueryContains('fhirQuestionnaireResponseId = $fhirId');
    expectQueryParams({ id: 'a1', fhirId: 'fhir-123' });
  });

  it('getAssessmentHistory filters by family', async () => {
    mockQuery.mockResolvedValue([[]]);
    await getAssessmentHistory('f1');
    expectQueryContains('familyId = type::thing("family", $familyId)');
    expectQueryContains('ORDER BY completedAt DESC');
  });

  it('getAssessmentHistory filters by type when provided', async () => {
    mockQuery.mockResolvedValue([[]]);
    await getAssessmentHistory('f1', 'cii');
    expectQueryContains('AND type = $type');
  });

  it('getPendingCRIReviews queries pending CRIs', async () => {
    mockQuery.mockResolvedValue([[]]);
    await getPendingCRIReviews();
    expectQueryContains("type = 'cri'");
    expectQueryContains("reviewStatus = 'pending'");
  });

  it('createKBSRating creates with timestamp', async () => {
    mockCreate.mockResolvedValue([{ id: 'kbs_rating:k1' }]);
    await createKBSRating({
      careRecipientId: 'cr1',
      omahaProblemCode: 35,
      knowledge: 3,
      behavior: 4,
      status: 3,
      assessmentDay: 0,
      ratedBy: 'u1',
    });
    expect(mockCreate).toHaveBeenCalledWith(
      'kbs_rating',
      expect.objectContaining({
        fhirObservationId: null,
        omahaProblemCode: 35,
      }),
    );
  });

  it('getKBSHistory filters by care recipient', async () => {
    mockQuery.mockResolvedValue([[]]);
    await getKBSHistory('cr1');
    expectQueryContains('careRecipientId = type::thing("care_recipient", $crId)');
  });

  it('getKBSHistory adds problem filter when code provided', async () => {
    mockQuery.mockResolvedValue([[]]);
    await getKBSHistory('cr1', 35);
    expectQueryContains('AND omahaProblemCode = $code');
  });

  it('countKBSForRecipient returns count', async () => {
    mockQuery.mockResolvedValue([[{ count: 4 }]]);
    const count = await countKBSForRecipient('cr1', 35);
    expect(count).toBe(4);
  });

  it('countKBSForRecipient returns 0 when empty', async () => {
    mockQuery.mockResolvedValue([[]]);
    const count = await countKBSForRecipient('cr1', 99);
    expect(count).toBe(0);
  });
});

// ── Time Bank Query Tests ─────────────────────────────

describe('Time Bank Queries', () => {
  it('getOrCreateAccount returns existing account', async () => {
    mockQuery.mockResolvedValue([[{ id: 'tba:1', balanceEarned: 5 }]]);
    const result = await getOrCreateAccount('u1');
    expect(result.balanceEarned).toBe(5);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('getOrCreateAccount creates when none exists', async () => {
    mockQuery.mockResolvedValue([[]]);
    mockCreate.mockResolvedValue([{ id: 'tba:new', balanceEarned: 0 }]);
    const result = await getOrCreateAccount('u1');
    expect(mockCreate).toHaveBeenCalledWith(
      'timebank_account',
      expect.objectContaining({
        balanceEarned: 0,
        balanceMembership: 0,
        currentStreak: 0,
      }),
    );
    expect(result.id).toBe('tba:new');
  });

  it('updateAccountBalance uses atomic increment', async () => {
    mockQuery.mockResolvedValue([[{ id: 'tba:1' }]]);
    await updateAccountBalance('u1', 'balanceEarned', 2.5);
    expectQueryContains('balanceEarned += $delta');
    expectQueryParams({ delta: 2.5 });
  });

  it('updateStreak sets both current and longest', async () => {
    mockQuery.mockResolvedValue([]);
    await updateStreak('u1', 5, 10);
    expectQueryContains('currentStreak = $current');
    expectQueryContains('longestStreak = $longest');
    expectQueryParams({ current: 5, longest: 10 });
  });

  it('creditMembershipFloor sets absolute value', async () => {
    mockQuery.mockResolvedValue([]);
    await creditMembershipFloor('u1', 4);
    expectQueryContains('balanceMembership = $hours');
    expectQueryParams({ hours: 4 });
  });

  it('createTransaction includes taskId when provided', async () => {
    mockCreate.mockResolvedValue([{ id: 'tx:1' }]);
    await createTransaction({
      accountId: 'tba:1',
      type: 'earned',
      hours: 2,
      balanceAfter: 7,
      taskId: 'task:1',
      description: 'Helped with groceries',
    });
    expect(mockCreate).toHaveBeenCalledWith(
      'timebank_transaction',
      expect.objectContaining({
        taskId: 'task:1',
      }),
    );
  });

  it('createTransaction defaults taskId to null', async () => {
    mockCreate.mockResolvedValue([{ id: 'tx:2' }]);
    await createTransaction({
      accountId: 'tba:1',
      type: 'membership_floor',
      hours: 4,
      balanceAfter: 4,
      description: 'Monthly membership credit',
    });
    expect(mockCreate).toHaveBeenCalledWith(
      'timebank_transaction',
      expect.objectContaining({
        taskId: null,
      }),
    );
  });

  it('getTransactionHistory paginates', async () => {
    mockQuery.mockResolvedValue([[]]);
    await getTransactionHistory('u1', 10, 20);
    expectQueryContains('LIMIT $limit START $offset');
    expectQueryParams({ limit: 10, offset: 20 });
  });

  it('createTask sets status to open with null optionals', async () => {
    mockCreate.mockResolvedValue([{ id: 'task:t1', status: 'open' }]);
    await createTask({
      requesterId: 'u1',
      taskType: 'companionship',
      title: 'Visit with Helen',
      location: { type: 'Point', coordinates: [-105.27, 40.015] },
      estimatedHours: 2,
    });
    expect(mockCreate).toHaveBeenCalledWith(
      'timebank_task',
      expect.objectContaining({
        status: 'open',
        matchedUserId: null,
        checkInTime: null,
        actualHours: null,
        rating: null,
      }),
    );
  });

  it('updateTaskStatus merges extra fields', async () => {
    mockQuery.mockResolvedValue([[{ id: 'task:t1', status: 'matched' }]]);
    await updateTaskStatus('t1', 'matched', { matchedUserId: 'u2' });
    expectQueryContains('MERGE $data');
    const params = mockQuery.mock.calls[0]![1] as {
      data: { status: string; matchedUserId: string };
    };
    expect(params.data.status).toBe('matched');
    expect(params.data.matchedUserId).toBe('u2');
  });

  it('listOpenTasks filters by open status', async () => {
    mockQuery.mockResolvedValue([[]]);
    await listOpenTasks();
    expectQueryContains("status = 'open'");
  });

  it('listOpenTasksNear converts miles to meters', async () => {
    mockQuery.mockResolvedValue([[]]);
    await listOpenTasksNear(-105.27, 40.015, 5);
    const params = mockQuery.mock.calls[0]![1] as { radius: number };
    expect(params.radius).toBeCloseTo(5 * 1609.34, 0);
  });

  it('listUserTasks queries both requester and matched', async () => {
    mockQuery.mockResolvedValue([[]]);
    await listUserTasks('u1');
    expectQueryContains('requesterId');
    expectQueryContains('matchedUserId');
  });

  it('getCascadeChain queries helped graph edge', async () => {
    mockQuery.mockResolvedValue([[]]);
    await getCascadeChain('u1', 3);
    expectQueryContains('FROM helped');
  });

  it('recordHelped creates RELATE edge', async () => {
    mockQuery.mockResolvedValue([]);
    await recordHelped('u1', 'u2', 't1', 2);
    expectQueryContains('RELATE');
    expectQueryContains('helped');
    expectQueryParams({ helperId: 'u1', helpedId: 'u2', hours: 2 });
  });

  it('getRespiteFund queries singleton', async () => {
    mockQuery.mockResolvedValue([[{ id: 'respite_fund:1', balanceHours: 50 }]]);
    const result = await getRespiteFund();
    expectQueryContains('FROM respite_fund');
    expect(result?.balanceHours).toBe(50);
  });

  it('updateRespiteFund increments both balances', async () => {
    mockQuery.mockResolvedValue([]);
    await updateRespiteFund(5, 100);
    expectQueryContains('balanceHours += $dh');
    expectQueryContains('balanceDollars += $dd');
    expectQueryParams({ dh: 5, dd: 100 });
  });
});

// ── Notification & Message Query Tests ────────────────

describe('Notification Queries', () => {
  it('createNotification sets defaults', async () => {
    mockCreate.mockResolvedValue([{ id: 'notification:n1' }]);
    await createNotification({
      userId: 'u1',
      type: 'task_match',
      channel: 'push',
      title: 'New match!',
      body: 'Someone matched your task',
    });
    expect(mockCreate).toHaveBeenCalledWith(
      'notification',
      expect.objectContaining({
        read: false,
        readAt: null,
        data: null,
      }),
    );
  });

  it('createNotification passes data when provided', async () => {
    mockCreate.mockResolvedValue([{ id: 'notification:n2' }]);
    await createNotification({
      userId: 'u1',
      type: 'task_completed',
      channel: 'in_app',
      title: 'Done',
      body: 'Task completed',
      data: { taskId: 't1' },
    });
    expect(mockCreate).toHaveBeenCalledWith(
      'notification',
      expect.objectContaining({
        data: { taskId: 't1' },
      }),
    );
  });

  it('getUnreadNotifications filters unread', async () => {
    mockQuery.mockResolvedValue([[]]);
    await getUnreadNotifications('u1');
    expectQueryContains('read = false');
    expectQueryParams({ userId: 'u1' });
  });

  it('getAllNotifications paginates', async () => {
    mockQuery.mockResolvedValue([[]]);
    await getAllNotifications('u1', 20, 10);
    expectQueryContains('LIMIT $limit START $offset');
    expectQueryParams({ limit: 20, offset: 10 });
  });

  it('markNotificationRead sets read and readAt', async () => {
    mockQuery.mockResolvedValue([]);
    await markNotificationRead('n1');
    expectQueryContains('read = true');
    expectQueryContains('readAt = time::now()');
  });

  it('markAllRead updates all unread for user', async () => {
    mockQuery.mockResolvedValue([]);
    await markAllRead('u1');
    expectQueryContains('read = false'); // WHERE clause
    expectQueryContains('read = true'); // SET clause
  });

  it('countUnread returns count', async () => {
    mockQuery.mockResolvedValue([[{ count: 7 }]]);
    const count = await countUnread('u1');
    expect(count).toBe(7);
  });

  it('countUnread returns 0 when empty', async () => {
    mockQuery.mockResolvedValue([[]]);
    const count = await countUnread('u1');
    expect(count).toBe(0);
  });
});

describe('Message Queries', () => {
  it('createMessage sets read defaults', async () => {
    mockCreate.mockResolvedValue([{ id: 'message:m1' }]);
    await createMessage({
      threadId: 'thread-abc',
      senderId: 'u1',
      recipientId: 'u2',
      body: 'Hello!',
    });
    expect(mockCreate).toHaveBeenCalledWith(
      'message',
      expect.objectContaining({
        read: false,
        readAt: null,
        threadId: 'thread-abc',
      }),
    );
  });

  it('getThread orders by createdAt ASC', async () => {
    mockQuery.mockResolvedValue([[]]);
    await getThread('thread-abc');
    expectQueryContains('ORDER BY createdAt ASC');
    expectQueryParams({ threadId: 'thread-abc' });
  });

  it('listThreadsForUser groups by threadId', async () => {
    mockQuery.mockResolvedValue([[]]);
    await listThreadsForUser('u1');
    expectQueryContains('GROUP BY threadId');
  });

  it('markThreadRead updates only recipient messages', async () => {
    mockQuery.mockResolvedValue([]);
    await markThreadRead('thread-abc', 'u2');
    expectQueryContains('recipientId = type::thing("user", $userId)');
    expectQueryContains('read = false');
    expectQueryParams({ threadId: 'thread-abc', userId: 'u2' });
  });
});

// ── Outbox Query Tests ────────────────────────────────

describe('Outbox Queries', () => {
  it('createOutboxEvent sets pending status', async () => {
    mockCreate.mockResolvedValue([{ id: 'outbox_event:o1' }]);
    await createOutboxEvent({
      eventType: 'assessment.created',
      resourceType: 'QuestionnaireResponse',
      resourceId: 'a1',
      payload: { totalScore: 12 },
    });
    expect(mockCreate).toHaveBeenCalledWith(
      'outbox_event',
      expect.objectContaining({
        status: 'pending',
        retryCount: 0,
        lastError: null,
        processedAt: null,
      }),
    );
  });

  it('claimPendingEvents updates status to processing', async () => {
    mockQuery.mockResolvedValue([[]]);
    await claimPendingEvents(5);
    expectQueryContains("status = 'processing'");
    expectQueryContains("status = 'pending'");
    expectQueryParams({ batchSize: 5 });
  });

  it('markEventCompleted sets status and timestamp', async () => {
    mockQuery.mockResolvedValue([]);
    await markEventCompleted('o1');
    expectQueryContains("status = 'completed'");
    expectQueryContains('processedAt = time::now()');
  });

  it('markEventFailed records error and increments retry', async () => {
    mockQuery.mockResolvedValue([]);
    await markEventFailed('o1', 'Connection refused');
    expectQueryContains("status = 'failed'");
    expectQueryContains('lastError = $error');
    expectQueryContains('retryCount += 1');
    expectQueryParams({ error: 'Connection refused' });
  });

  it('requeueFailedEvents requeues under max retries', async () => {
    mockQuery.mockResolvedValue([[{ count: 3 }]]);
    const count = await requeueFailedEvents(5);
    expectQueryContains("status = 'failed'");
    expectQueryContains("status = 'pending'");
    expectQueryParams({ maxRetries: 5 });
    expect(count).toBe(3);
  });

  it('getDeadLetterEvents returns events at max retries', async () => {
    mockQuery.mockResolvedValue([[]]);
    await getDeadLetterEvents();
    expectQueryContains("status = 'failed'");
    expectQueryContains('retryCount >= 5');
  });

  it('purgeCompletedEvents deletes old completed', async () => {
    mockQuery.mockResolvedValue([]);
    await purgeCompletedEvents(30);
    expectQueryContains('DELETE outbox_event');
    expectQueryContains("status = 'completed'");
  });
});
