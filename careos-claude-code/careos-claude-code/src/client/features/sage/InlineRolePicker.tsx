/**
 * InlineRolePicker — Multi-select role chips rendered inline in Sage chat
 *
 * Used during onboarding profile_roles phase.
 * Tappable chips: companion, meals, tech, admin, transport.
 * Multiple selections allowed. Submit sends selected roles.
 */
import { useState } from 'react';
import { TileIcon } from '../../components/TileIcon';

interface InlineRolePickerProps {
  onComplete: (roles: string[]) => void;
  completedRoles?: string[];
}

const ROLES = [
  { id: 'companion', label: 'Companion Visits', emoji: 'chat', desc: 'Conversation & presence' },
  { id: 'meals', label: 'Meals & Cooking', emoji: 'meal', desc: 'Groceries, meal prep' },
  { id: 'errands', label: 'Errands & Rides', emoji: 'car', desc: 'Shopping, transport' },
  { id: 'tech', label: 'Tech Help', emoji: 'send', desc: 'Phones, tablets, WiFi' },
  { id: 'admin', label: 'Paperwork', emoji: 'clipboard', desc: 'Bills, forms, calls' },
  { id: 'yard', label: 'Yard & Home', emoji: 'home', desc: 'Light maintenance' },
];

export function InlineRolePicker({ onComplete, completedRoles }: InlineRolePickerProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;
    setSubmitted(true);
    onComplete(selected);
  };

  // Show completed view if result was already stored (survives re-mount)
  const done = completedRoles ?? (submitted ? selected : null);
  if (done) {
    return (
      <div className="mt-2 rounded-xl border border-sage/20 bg-sage/5 p-3">
        <p className="text-xs font-medium text-sage-dark">
          You selected: {done.map((id) => ROLES.find((r) => r.id === id)?.label).join(', ')}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-xl border border-sage/20 bg-sage/5 p-3">
      <p className="text-xs font-medium text-sage-dark">Tap everything that interests you:</p>

      <div className="flex flex-wrap gap-1.5">
        {ROLES.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => toggle(role.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
              selected.includes(role.id)
                ? 'border-sage bg-sage text-white'
                : 'border-sage/30 bg-white text-sage-dark hover:bg-sage/10'
            }`}
          >
            <TileIcon name={role.emoji} size={14} /> {role.label}
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-full bg-sage py-2 text-sm font-medium text-white hover:bg-sage-dark active:scale-95 transition-all"
        >
          That's me →
        </button>
      )}
    </div>
  );
}
