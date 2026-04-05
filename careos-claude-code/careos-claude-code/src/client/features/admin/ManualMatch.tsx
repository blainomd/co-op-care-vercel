/**
 * ManualMatch — Admin override for task assignment
 *
 * Lists open tasks, shows match candidates per task, allows manual assign.
 */
import { useState, useMemo } from 'react';

interface OpenTask {
  id: string;
  title: string;
  taskType: string;
  requestedBy: string;
  familyName: string;
  createdAt: string;
  estimatedHours: number;
  waitHours: number;
}

interface MatchCandidate {
  userId: string;
  name: string;
  score: number;
  distanceMiles: number;
  skillMatch: boolean;
  rating: number;
  availableShifts: number;
}

const MOCK_TASKS: OpenTask[] = [
  {
    id: 't1',
    title: 'Companionship visit',
    taskType: 'companionship',
    requestedBy: 'u1',
    familyName: 'Martinez',
    createdAt: '2026-03-08T06:30:00Z',
    estimatedHours: 2,
    waitHours: 3.2,
  },
  {
    id: 't2',
    title: 'Meal preparation',
    taskType: 'meal_prep',
    requestedBy: 'u2',
    familyName: 'Johnson',
    createdAt: '2026-03-07T18:00:00Z',
    estimatedHours: 1.5,
    waitHours: 14.7,
  },
  {
    id: 't3',
    title: 'Transportation to appointment',
    taskType: 'transportation',
    requestedBy: 'u3',
    familyName: 'Williams',
    createdAt: '2026-03-08T08:00:00Z',
    estimatedHours: 3,
    waitHours: 1.5,
  },
];

const MOCK_CANDIDATES: MatchCandidate[] = [
  {
    userId: 'c1',
    name: 'Sarah Chen',
    score: 87,
    distanceMiles: 0.3,
    skillMatch: true,
    rating: 4.8,
    availableShifts: 3,
  },
  {
    userId: 'c2',
    name: 'Marcus Johnson',
    score: 72,
    distanceMiles: 1.1,
    skillMatch: true,
    rating: 4.5,
    availableShifts: 2,
  },
  {
    userId: 'c3',
    name: 'Emily Rodriguez',
    score: 65,
    distanceMiles: 0.8,
    skillMatch: false,
    rating: 4.9,
    availableShifts: 4,
  },
  {
    userId: 'c4',
    name: 'David Park',
    score: 51,
    distanceMiles: 2.4,
    skillMatch: true,
    rating: 4.2,
    availableShifts: 1,
  },
];

export function ManualMatch() {
  const [tasks] = useState<OpenTask[]>(MOCK_TASKS);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [candidates] = useState<MatchCandidate[]>(MOCK_CANDIDATES);
  const [assigningTo, setAssigningTo] = useState<string | null>(null);

  const selectedTaskObj = useMemo(
    () => tasks.find((t) => t.id === selectedTask),
    [tasks, selectedTask],
  );

  const handleAssign = (candidateId: string) => {
    setAssigningTo(candidateId);
    // Would call: api.post(`/admin/tasks/${selectedTask}/assign`, { userId: candidateId })
    setTimeout(() => setAssigningTo(null), 1000);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Manual Matching</h1>
        <p className="text-sm text-muted">Override matching algorithm — assign tasks manually</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Open Tasks List */}
        <div className="rounded-xl border border-border bg-white">
          <div className="border-b border-border p-4">
            <h2 className="text-sm font-semibold text-primary">Open Tasks ({tasks.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setSelectedTask(task.id)}
                className={`w-full p-4 text-left transition-colors ${selectedTask === task.id ? 'bg-sage/10' : 'hover:bg-warm-gray/20'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">{task.title}</p>
                    <p className="text-xs text-muted">
                      {task.familyName} family &middot; {task.estimatedHours}h
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${task.waitHours > 4 ? 'bg-zone-red/10 text-zone-red' : 'bg-zone-green/10 text-zone-green'}`}
                  >
                    {task.waitHours}h wait
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded bg-warm-gray/30 px-1.5 py-0.5 text-[10px] text-secondary">
                    {task.taskType.replace('_', ' ')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Candidates Panel */}
        <div className="rounded-xl border border-border bg-white">
          <div className="border-b border-border p-4">
            <h2 className="text-sm font-semibold text-primary">
              {selectedTaskObj ? `Candidates for "${selectedTaskObj.title}"` : 'Select a task'}
            </h2>
          </div>

          {selectedTask ? (
            <div className="divide-y divide-border">
              {candidates.map((c) => (
                <div key={c.userId} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage/10 text-sm font-semibold text-sage">
                      {c.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{c.name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted">
                        <span>{c.distanceMiles}mi</span>
                        <span>&middot;</span>
                        <span>{c.rating} &#9733;</span>
                        <span>&middot;</span>
                        <span>{c.availableShifts} shifts</span>
                        {c.skillMatch && (
                          <>
                            <span>&middot;</span>
                            <span className="text-zone-green">skill match</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold ${c.score >= 80 ? 'text-zone-green' : c.score >= 60 ? 'text-gold' : 'text-zone-red'}`}
                    >
                      {c.score}
                    </span>
                    <button
                      onClick={() => handleAssign(c.userId)}
                      disabled={assigningTo === c.userId}
                      className="rounded-lg bg-sage px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-sage/90 disabled:opacity-50"
                    >
                      {assigningTo === c.userId ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted">
              Select a task to view candidates
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
