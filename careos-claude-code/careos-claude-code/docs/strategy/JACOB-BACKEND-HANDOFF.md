# CareOS Backend Handoff — Making the New Pages Live

**Date:** March 9, 2026 (Updated March 10 — PostgreSQL replaces SurrealDB)
**From:** Claude (AI pair programming with Blaine)
**For:** Jacob (backend implementation)
**Project:** `/Users/blaine/Desktop/careos-claude-code/careos-claude-code/`

> **Database change (March 10):** All queries updated from SurrealQL to PostgreSQL. Schema: `src/server/database/schema.sql`. Column names use snake_case per PostgreSQL convention. See `docs/JACOB-90-DAY-PLAN.md` for the full sprint plan.

---

## What Was Built (Frontend — Done)

Three new client pages that sell the Comfort Card story and drive Time Bank engagement. All use **hardcoded demo data** right now and need real API endpoints to go live.

| Page | Route | File |
|------|-------|------|
| **Comfort Card Landing** | `/billing/get-started` | `src/client/features/billing/ComfortCardLanding.tsx` |
| **Comfort Card Value** | `/billing/value` | `src/client/features/billing/ComfortCardValue.tsx` |
| **Time Bank Community** | `/timebank/community` | `src/client/features/timebank/TimeBankCommunity.tsx` |

**Also updated:**
- `App.tsx` — 3 lazy imports + 3 routes added
- `Sidebar.tsx` — "Get Started", "My Value", "Community" nav items added
- `MobileNav.tsx` — "Community" tab added to timebank_member

**Build status:** `tsc --noEmit` clean, `vite build` clean.

---

## What Jacob Needs to Build

### Endpoint 1: `GET /api/v1/community/stats`

**Used by:** ComfortCardLanding.tsx (hero stats + savings calculator)
**Auth:** Public or authenticated (this is a marketing page)
**Roles:** Any

**Response shape:**
```typescript
interface CommunityStats {
  neighborsActive: number;       // COUNT of users with activity in last 90 days (timebank_account.last_activity_at)
  hoursGivenThisMonth: number;   // SUM of timebank_transaction.hours WHERE type='earned' in current month
  familiesSupported: number;     // COUNT of DISTINCT requester_id from completed tasks
  avgResponseMinutes: number;    // AVG time from task.created_at to task matched/accepted
  totalHoursAllTime: number;     // SUM of all earned hours
  averageSatisfaction: number;   // AVG of task.rating WHERE rating IS NOT NULL
}
```

**PostgreSQL queries:**
```sql
-- Active neighbors (activity in last 90 days)
SELECT COUNT(*) FROM timebank_account
  WHERE last_activity_at > now() - INTERVAL '90 days';

-- Hours this month
SELECT COALESCE(SUM(hours), 0) FROM timebank_transaction
  WHERE type = 'earned' AND created_at >= date_trunc('month', now());

-- Families supported (distinct requesters with completed tasks)
SELECT COUNT(DISTINCT requester_id) FROM timebank_task
  WHERE status = 'completed';

-- Average response time (minutes)
SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60) AS avg_minutes
  FROM timebank_task
  WHERE status IN ('matched', 'accepted', 'completed');
```

---

### Endpoint 2: `GET /api/v1/user/value`

**Used by:** ComfortCardValue.tsx (personal value realization)
**Auth:** Required
**Roles:** conductor, timebank_member

**Response shape:**
```typescript
interface UserValueSummary {
  memberSince: string;           // user.created_at formatted as "January 2026"
  monthsActive: number;          // months since user.created_at
  timeBankHoursReceived: number; // SUM hours from tasks WHERE requester_id = userId AND status = 'completed'
  timeBankHoursGiven: number;    // SUM hours from tasks WHERE matched_user_id = userId AND status = 'completed'
  timeBankValueReceived: number; // hoursReceived * 35 (dollar equivalent)
  timeBankValueGiven: number;    // hoursGiven * 35
  sageConversations: number;     // COUNT from sage_conversation WHERE userId = userId
  libraryArticlesRead: number;   // COUNT from library_read WHERE userId = userId (if tracked)
  assessmentsCompleted: number;  // COUNT from assessment WHERE userId = userId AND status = 'completed'
  communityEventsAttended: number; // COUNT from event_attendance WHERE userId = userId
  careTeamSize: number;          // COUNT of DISTINCT matched_user_id from user's completed tasks
  totalValueReceived: number;    // Computed sum of all value categories
}
```

**Notes:**
- The `$35/hr` equivalent value comes from `CASH_RATE_CENTS_PER_HOUR: 1500` in business rules (that's $15 buy rate, but the market equivalent shown to user is $35 — matches the pitch deck's W-2 rate)
- If `sage_conversation` or `library_read` tables don't exist yet, return 0 and add them later
- `totalValueReceived` computation: `(hoursReceived * 35) + (sageConversations * 30) + (articlesRead * 8) + (assessments * 150) + (events * 50)` — these are approximate value-per-unit figures from the Project Sanitas deck

---

### Endpoint 3: `GET /api/v1/timebank/community/impact`

**Used by:** TimeBankCommunity.tsx (Community Impact tab)
**Auth:** Required
**Roles:** conductor, timebank_member

**Response shape:**
```typescript
interface CommunityImpact {
  totalHoursGiven: number;       // SUM all earned hours
  activeFamilies: number;        // DISTINCT requesters in last 90 days
  activeNeighbors: number;       // DISTINCT helpers in last 90 days
  averageSatisfaction: number;   // AVG rating
  categoryBreakdown: {
    category: string;            // 'meals' | 'rides' | 'companionship' | 'housekeeping' | 'tech_support' | 'errands'
    hours: number;
    tasks: number;
  }[];
  respiteFund: {
    totalHoursPooled: number;    // SUM of respite_deduction transactions
    familiesProtected: number;   // COUNT of families eligible for respite
  };
}
```

**Existing overlap:** `GET /timebank/impact` and `GET /timebank/cascade` already exist but are per-user. This endpoint aggregates across ALL users.

---

### Endpoint 4: `GET /api/v1/timebank/community/my-impact`

**Used by:** TimeBankCommunity.tsx ("Your Impact" card)
**Auth:** Required
**Roles:** conductor, timebank_member

**Response shape:**
```typescript
interface MyImpact {
  hoursGiven: number;
  hoursReceived: number;
  tasksCompleted: number;
  streak: {                      // Can reuse existing streakService
    currentWeeks: number;
    longestWeeks: number;
    nextMilestone: number | null;
  };
  rank: number;                  // Position among all members by hours given
  totalMembers: number;          // Total count for "Top X of Y"
  milestoneProgress: {
    current: number;             // e.g. 42 hours
    next: number;                // e.g. 50 hours
    label: string;               // e.g. "Community Champion"
  };
}
```

**Note:** Much of this can delegate to existing `streakService` and `impactService`. The `rank` requires a sorted aggregation query.

---

### Endpoint 5: `GET /api/v1/timebank/community/spotlights`

**Used by:** TimeBankCommunity.tsx (Neighbor Spotlights tab)
**Auth:** Required
**Roles:** conductor, timebank_member

**Response shape:**
```typescript
interface NeighborSpotlight {
  userId: string;
  displayName: string;
  hoursGiven: number;
  specialty: string;             // Most frequent task_type
  quote?: string;                // From gratitude notes received (highest-rated)
  memberSince: string;
}

// Response: NeighborSpotlight[] (top 4-6 by hours given, rotated monthly)
```

**Selection logic:**
- Top contributors by hours in last 90 days
- Exclude anyone who opted out of spotlight (`user.spotlight_opt_out = true` — already in PostgreSQL schema)
- Rotate: don't show same person every month

---

### Endpoint 6: `GET /api/v1/timebank/community/gratitude`

**Used by:** TimeBankCommunity.tsx (Gratitude Wall tab)
**Auth:** Required
**Roles:** conductor, timebank_member

**Response shape:**
```typescript
interface GratitudeEntry {
  id: string;
  fromName: string;              // Display name of person who wrote it
  toName: string;                // Display name of helper
  task_type: string;
  message: string;               // The gratitude note
  created_at: string;
}

// Response: { entries: GratitudeEntry[], total: number }
// Paginated: ?page=1&limit=10
```

**Source:** `timebank_task.gratitude_note` WHERE `gratitude_note IS NOT NULL` AND `status = 'completed'`
**Privacy:** Only show first name + last initial (e.g., "Maria S.") unless user has opted into full name display.

---

### Endpoint 7: `GET /api/v1/timebank/community/feed`

**Used by:** TimeBankCommunity.tsx (live activity feed)
**Auth:** Required
**Roles:** conductor, timebank_member

**Response shape:**
```typescript
interface ActivityFeedItem {
  id: string;
  type: 'task_completed' | 'task_created' | 'member_joined' | 'milestone_reached' | 'gratitude_sent';
  message: string;               // "Maria helped Dorothy with meal prep"
  timeAgo: string;               // "2 hours ago"
  created_at: string;
}

// Response: ActivityFeedItem[] (last 20 items)
```

**Future:** Could use the existing WebSocket infrastructure (`useRealtimeNotifications` hook) for true real-time updates. For v1, polling every 30 seconds is fine.

---

## Implementation Guide

### Follow Existing Patterns

**Plugin registration** (`src/server/modules/timebank/plugin.ts`):
```typescript
export async function communityPlugin(app: FastifyInstance): Promise<void> {
  await app.register(rateLimit, { max: 60, timeWindow: '1 minute' });
  await app.register(communityRoutes);
}
```

**Route structure:**
```typescript
export async function communityRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireRole('conductor', 'timebank_member', 'admin'));

  app.get('/community/stats', async (request, reply) => {
    const stats = await communityService.getStats();
    reply.send(stats);
  });
  // ... etc
}
```

**Database queries** — Use parameterized PostgreSQL:
```typescript
const { rows } = await pool.query(
  `SELECT COALESCE(SUM(hours), 0) AS total FROM timebank_transaction
   WHERE type = $1 AND created_at > $2`,
  ['earned', ninetyDaysAgo]
);
return rows[0]?.total ?? 0;
```

**Error handling** — Use existing `AppError` hierarchy:
- `NotFoundError` (404), `ValidationError` (400), `ForbiddenError` (403)
- Never expose PHI in error messages

### Where to Put Things

```
src/server/modules/
  timebank/
    community-routes.ts    ← NEW: endpoints 3-7
    community-service.ts   ← NEW: aggregation logic
  community/
    plugin.ts              ← NEW: endpoint 1 (public stats)
    routes.ts
    service.ts
  user/
    value-routes.ts        ← NEW: endpoint 2 (or add to existing user routes)
    value-service.ts
```

Or simpler: add all community endpoints to the existing `timebank/routes.ts` under a `/community` prefix.

### Shared Types to Add

**File:** `src/shared/types/community.types.ts`

Add TypeScript interfaces for all 7 response shapes above so both client and server share the same types.

---

## Priority Order

| # | Endpoint | Impact | Complexity |
|---|----------|--------|------------|
| 1 | `community/stats` | High — powers the marketing landing page | Low — simple aggregation queries |
| 2 | `user/value` | High — drives upgrade conversion | Medium — joins across multiple tables |
| 3 | `community/impact` | Medium — community dashboard | Low — aggregate version of existing per-user queries |
| 4 | `community/my-impact` | Medium — personal engagement | Low — mostly wraps existing services |
| 5 | `community/gratitude` | Medium — social proof | Low — simple SELECT with pagination |
| 6 | `community/spotlights` | Low — nice-to-have | Low — top-N query |
| 7 | `community/feed` | Low — nice-to-have | Medium — needs event sourcing or recent activity log |

**Suggestion:** Ship endpoints 1-4 first. The pages will work with demo data until then, so no rush — but `community/stats` and `user/value` are the highest-value because they power the conversion funnel.

---

## Client Wiring (After Endpoints Exist)

Once Jacob builds the endpoints, the frontend needs `useEffect` calls added to each page. Pattern:

```typescript
// In ComfortCardLanding.tsx
const [stats, setStats] = useState(DEMO_STATS); // keep demo as fallback
const [loading, setLoading] = useState(true);

useEffect(() => {
  api.get('/community/stats')
    .then(setStats)
    .catch(() => console.warn('Using demo stats'))
    .finally(() => setLoading(false));
}, []);
```

This follows the existing pattern used in `NotificationsPage.tsx` — try the API, fall back to demo data if the backend isn't ready.

---

## Database Tables That May Need Creation

| Table | Purpose | Endpoints Using It |
|-------|---------|-------------------|
| `sage_conversation` | Track Sage chat sessions per user | `user/value` |
| `library_read` | Track library article views | `user/value` |
| `event_attendance` | Track community event participation | `user/value` |

If these don't exist yet, the `user/value` endpoint should return `0` for those fields and we add tracking later.

**Tables that already exist and are sufficient:**
- `timebank_task` — tasks, ratings, gratitude notes
- `timebank_transaction` — ledger entries (earned, spent, etc.)
- `timebank_account` — balance fields, last_activity_at
- `user` — created_at, roles, display name

---

## Testing Checklist

- [ ] `GET /community/stats` returns valid numbers (not null/undefined)
- [ ] `GET /user/value` returns data scoped to the authenticated user only
- [ ] `GET /community/impact` category breakdown sums match totalHoursGiven
- [ ] `GET /community/my-impact` streak data matches existing `/timebank/streak`
- [ ] `GET /community/gratitude` respects privacy (first name + last initial only)
- [ ] `GET /community/spotlights` excludes opted-out users
- [ ] `GET /community/feed` returns most recent items first
- [ ] All endpoints return `401` for unauthenticated requests
- [ ] All endpoints return `403` for unauthorized roles
- [ ] No PHI in error responses
- [ ] Rate limiting works (60/min)

---

## Questions for Jacob

1. Do `sage_conversation`, `library_read`, and `event_attendance` tables exist? If not, should we create them now or stub `user/value` with zeros?
2. Should `community/stats` be public (for marketing page before login) or auth-required?
3. For the activity feed — do you want to use the existing WebSocket notification infrastructure, or start with REST polling?
4. Spotlight opt-out: should we add `spotlightOptOut` to the user model, or default to showing everyone?
