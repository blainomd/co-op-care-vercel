/**
 * IdentityOnboarding — Identity/skills discovery during Time Bank onboarding
 *
 * From synthesis: "During Time Bank onboarding, members complete 'I enjoy...' (NOT 'I'm willing to...').
 * Retired teacher -> tutoring. Car enthusiast -> driving. Gardener -> yard work.
 * The algorithm matches identity to task. People who help in alignment with their
 * identity help more, longer, and with higher satisfaction."
 */
import { useState } from 'react';

// ── Interest areas mapped to Time Bank task types ──

interface InterestArea {
  id: string;
  title: string;
  enjoy: string;
  taskTypes: string[];
  taskLabels: string[];
  icon: React.ReactNode;
}

const INTEREST_AREAS: InterestArea[] = [
  {
    id: 'cooking',
    title: 'Cooking & Meals',
    enjoy: 'I enjoy preparing food and sharing meals with others',
    taskTypes: ['meals', 'grocery_run'],
    taskLabels: ['Meal Prep', 'Grocery Runs'],
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12"
        />
      </svg>
    ),
  },
  {
    id: 'teaching',
    title: 'Teaching & Tutoring',
    enjoy: 'I enjoy helping others learn new things',
    taskTypes: ['teaching'],
    taskLabels: ['Tutoring', 'Education'],
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
        />
      </svg>
    ),
  },
  {
    id: 'driving',
    title: 'Driving & Rides',
    enjoy: "I enjoy driving and don't mind being on the road",
    taskTypes: ['rides', 'errands'],
    taskLabels: ['Rides', 'Errands'],
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-1.036-.84-1.875-1.875-1.875M6.75 12h10.5m-10.5 0a1.875 1.875 0 110-3.75h10.5a1.875 1.875 0 110 3.75m-10.5 0v4.5m10.5-4.5v4.5m0-9V3.375c0-.621-.504-1.125-1.125-1.125H8.25c-.621 0-1.125.504-1.125 1.125v3.375"
        />
      </svg>
    ),
  },
  {
    id: 'gardening',
    title: 'Gardening',
    enjoy: 'I enjoy being outdoors and working with plants',
    taskTypes: ['yard_work'],
    taskLabels: ['Yard Work', 'Gardening'],
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21v-6m0 0c-3.314 0-6-2.686-6-6 0-1.657.672-3.157 1.757-4.243A5.99 5.99 0 0112 3c1.657 0 3.157.672 4.243 1.757A5.99 5.99 0 0118 9c0 3.314-2.686 6-6 6z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 15c-1.38 0-2.632-.56-3.536-1.464M12 15c1.38 0 2.632-.56 3.536-1.464"
        />
      </svg>
    ),
  },
  {
    id: 'technology',
    title: 'Technology',
    enjoy: 'I enjoy figuring out how gadgets and apps work',
    taskTypes: ['tech_support'],
    taskLabels: ['Tech Support'],
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
        />
      </svg>
    ),
  },
  {
    id: 'crafts',
    title: 'Crafts & Hobbies',
    enjoy: 'I enjoy making things and sharing creative activities',
    taskTypes: ['companionship'],
    taskLabels: ['Activities', 'Companionship'],
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
        />
      </svg>
    ),
  },
  {
    id: 'music',
    title: 'Music',
    enjoy: 'I enjoy listening to or playing music with others',
    taskTypes: ['companionship', 'phone_companionship'],
    taskLabels: ['Companionship', 'Phone Companionship'],
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
        />
      </svg>
    ),
  },
  {
    id: 'animals',
    title: 'Animals',
    enjoy: 'I enjoy spending time with pets and animals',
    taskTypes: ['pet_care'],
    taskLabels: ['Pet Care'],
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904m7.846-9.772H5.904m7.846 0a3 3 0 00-2.266-1.03H5.904a3 3 0 00-3 3v3.27a3 3 0 003 3h1.116"
        />
      </svg>
    ),
  },
  {
    id: 'reading',
    title: 'Reading',
    enjoy: 'I enjoy reading and discussing books and stories',
    taskTypes: ['companionship', 'phone_companionship'],
    taskLabels: ['Companionship', 'Phone Companionship'],
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
        />
      </svg>
    ),
  },
  {
    id: 'home_repair',
    title: 'Home Repair',
    enjoy: 'I enjoy fixing things and working with my hands',
    taskTypes: ['housekeeping'],
    taskLabels: ['Handyman', 'Home Care'],
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.42 15.17l-5.658 5.659a2.122 2.122 0 01-3.003-3.003l5.658-5.659m3.003 3.003L20.25 3.75m-8.83 11.42l3.003-3.003m-3.003 3.003l-1.06 1.06a2.122 2.122 0 01-3.003 0l-1.414-1.414a2.122 2.122 0 010-3.003l6.364-6.364a2.122 2.122 0 013.003 0l1.414 1.414a2.122 2.122 0 010 3.003l-1.06 1.06"
        />
      </svg>
    ),
  },
  {
    id: 'organization',
    title: 'Organization',
    enjoy: 'I enjoy organizing, planning, and keeping things in order',
    taskTypes: ['admin_help'],
    taskLabels: ['Admin Help', 'Paperwork'],
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
        />
      </svg>
    ),
  },
  {
    id: 'walking',
    title: 'Walking & Exercise',
    enjoy: 'I enjoy staying active and walking with others',
    taskTypes: ['companionship'],
    taskLabels: ['Fitness Companionship'],
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2 3m-2-3l-2 3m2-3V9" />
      </svg>
    ),
  },
];

const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
] as const;

const TIME_PREFERENCES = [
  { key: 'morning', label: 'Morning', detail: '8 AM - 12 PM' },
  { key: 'afternoon', label: 'Afternoon', detail: '12 - 5 PM' },
  { key: 'evening', label: 'Evening', detail: '5 - 8 PM' },
] as const;

const DISTANCE_OPTIONS = [
  { value: '0.5', label: 'My block', detail: '0.5 miles' },
  { value: '1', label: 'My neighborhood', detail: '1 mile' },
  { value: '2', label: 'Across town', detail: '2 miles' },
] as const;

export function IdentityOnboarding() {
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [selectedTimes, setSelectedTimes] = useState<Set<string>>(new Set());
  const [zipCode, setZipCode] = useState('');
  const [distance, setDistance] = useState('1');

  // Toggle an interest card on/off
  function toggleInterest(id: string) {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // Toggle a day on/off
  function toggleDay(key: string) {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  // Toggle a time preference on/off
  function toggleTime(key: string) {
    setSelectedTimes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  // Derive matched task labels from selected interests (deduplicated)
  const matchedTaskLabels = Array.from(
    new Set(
      INTEREST_AREAS.filter((area) => selectedInterests.has(area.id)).flatMap(
        (area) => area.taskLabels,
      ),
    ),
  );

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // API call will be wired in later — collect all state and send to server
    // For now, just log to console
    console.log({
      interests: Array.from(selectedInterests),
      availability: {
        days: Array.from(selectedDays),
        times: Array.from(selectedTimes),
      },
      neighborhood: {
        zipCode,
        distanceMiles: parseFloat(distance),
      },
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* ── Header ── */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sage/10">
          <svg
            className="h-7 w-7 text-sage"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
            />
          </svg>
        </div>
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          Tell us about yourself
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          What do you enjoy? We match you with neighbors based on the things you love doing — not a
          list of chores.
        </p>
      </div>

      {/* ── Interest Discovery Cards ── */}
      <section className="mb-8">
        <h2 className="mb-1 text-sm font-medium uppercase tracking-wider text-text-muted">
          What do you enjoy?
        </h2>
        <p className="mb-4 text-xs text-text-secondary">
          Pick everything that sounds like you. There are no wrong answers.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {INTEREST_AREAS.map((area) => {
            const isSelected = selectedInterests.has(area.id);
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => toggleInterest(area.id)}
                className={`group relative flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all ${
                  isSelected
                    ? 'border-sage bg-sage/5 shadow-sm'
                    : 'border-border bg-white hover:border-sage/40 hover:bg-warm-gray'
                }`}
              >
                {/* Checkmark badge */}
                {isSelected && (
                  <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-sage text-white">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`mb-2 ${isSelected ? 'text-sage' : 'text-text-muted group-hover:text-text-secondary'}`}
                >
                  {area.icon}
                </div>

                {/* Title */}
                <span
                  className={`text-sm font-medium ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}
                >
                  {area.title}
                </span>

                {/* "I enjoy..." text */}
                <span className="mt-1 text-[10px] leading-tight text-text-muted">{area.enjoy}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Selected Interests Summary ── */}
      {matchedTaskLabels.length > 0 && (
        <div className="mb-8 rounded-xl border border-border bg-sage/5 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/10">
              <svg
                className="h-4 w-4 text-sage"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                Based on your interests, you'd be great at:
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {matchedTaskLabels.map((label) => (
                  <span
                    key={label}
                    className="inline-block rounded-full bg-sage/10 px-2.5 py-0.5 text-xs font-medium text-sage"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Availability Section ── */}
      <section className="mb-8">
        <h2 className="mb-1 text-sm font-medium uppercase tracking-wider text-text-muted">
          When are you usually free?
        </h2>
        <p className="mb-4 text-xs text-text-secondary">
          No commitments yet — this just helps us suggest good matches.
        </p>

        <div className="rounded-xl border border-border bg-white p-5">
          {/* Days of week */}
          <div className="mb-5">
            <label className="mb-2 block text-xs font-medium text-text-primary">
              Days of the week
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDays.has(day.key);
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => toggleDay(day.key)}
                    className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'border-sage bg-sage text-white'
                        : 'border-border bg-warm-gray text-text-secondary hover:border-sage/40'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred times */}
          <div>
            <label className="mb-2 block text-xs font-medium text-text-primary">
              Preferred times
            </label>
            <div className="flex flex-wrap gap-2">
              {TIME_PREFERENCES.map((time) => {
                const isSelected = selectedTimes.has(time.key);
                return (
                  <button
                    key={time.key}
                    type="button"
                    onClick={() => toggleTime(time.key)}
                    className={`flex flex-col items-center rounded-lg border px-4 py-2.5 transition-colors ${
                      isSelected
                        ? 'border-sage bg-sage text-white'
                        : 'border-border bg-warm-gray text-text-secondary hover:border-sage/40'
                    }`}
                  >
                    <span className="text-sm font-medium">{time.label}</span>
                    <span
                      className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-text-muted'}`}
                    >
                      {time.detail}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Neighborhood Section ── */}
      <section className="mb-8">
        <h2 className="mb-1 text-sm font-medium uppercase tracking-wider text-text-muted">
          Your neighborhood
        </h2>
        <p className="mb-4 text-xs text-text-secondary">
          We match you with neighbors nearby. Everything stays in your community.
        </p>

        <div className="rounded-xl border border-border bg-white p-5">
          {/* ZIP code */}
          <div className="mb-5">
            <label className="mb-1 block text-xs font-medium text-text-primary">ZIP code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{5}"
              maxLength={5}
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="80302"
              className="w-32 rounded-lg border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            />
          </div>

          {/* Distance preference */}
          <div>
            <label className="mb-2 block text-xs font-medium text-text-primary">
              How far would you help?
            </label>
            <div className="flex flex-wrap gap-2">
              {DISTANCE_OPTIONS.map((opt) => {
                const isSelected = distance === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDistance(opt.value)}
                    className={`flex flex-col items-center rounded-lg border px-4 py-2.5 transition-colors ${
                      isSelected
                        ? 'border-sage bg-sage text-white'
                        : 'border-border bg-warm-gray text-text-secondary hover:border-sage/40'
                    }`}
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span
                      className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-text-muted'}`}
                    >
                      {opt.detail}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Save & Continue ── */}
      <button
        onClick={handleSave}
        disabled={selectedInterests.size === 0}
        className={`w-full rounded-lg px-6 py-3 text-sm font-medium shadow-sm transition-colors ${
          selectedInterests.size > 0
            ? 'bg-sage text-white hover:bg-sage-dark'
            : 'cursor-not-allowed bg-warm-gray text-text-muted'
        }`}
      >
        Save & Continue
      </button>

      {selectedInterests.size === 0 && (
        <p className="mt-2 text-center text-xs text-text-muted">
          Pick at least one interest above to continue
        </p>
      )}
    </div>
  );
}
