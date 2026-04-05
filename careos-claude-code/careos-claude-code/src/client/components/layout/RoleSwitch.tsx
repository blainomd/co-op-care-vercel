/**
 * RoleSwitch — Multi-role selector for users with multiple roles
 *
 * Some users hold multiple roles simultaneously (e.g., Conductor + Time Bank member).
 * This component allows switching the active role, which changes the dashboard view.
 */
import { useAuth } from '../../hooks/useAuth';

const ROLE_LABELS: Record<string, string> = {
  conductor: 'Conductor',
  worker_owner: 'Worker-Owner',
  timebank_member: 'Time Bank Member',
  medical_director: 'Medical Director',
  admin: 'Admin',
  employer_hr: 'Employer HR',
  wellness_provider: 'Wellness Provider',
};

export function RoleSwitch() {
  const { user, activeRole, switchRole } = useAuth();

  if (!user || user.roles.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg bg-warm-gray p-1">
      {user.roles.map((role) => (
        <button
          key={role}
          onClick={() => switchRole(role)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            activeRole === role
              ? 'bg-white text-sage shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {ROLE_LABELS[role] ?? role}
        </button>
      ))}
    </div>
  );
}
