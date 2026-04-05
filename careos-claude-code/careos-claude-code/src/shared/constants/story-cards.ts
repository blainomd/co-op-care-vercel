// src/shared/constants/story-cards.ts
/**
 * Story Carousel cards for Homepage — real caregiver archetypes.
 * Each card drives an emotional connection before any signup ask.
 */

export interface StoryCard {
  id: string;
  name: string;
  role: string;
  quote: string;
  photoAlt: string;
  /** Unsplash photo ID or local path */
  photoSrc: string;
  /** Which CTA this story drives */
  cta: 'join' | 'learn';
}

export const STORY_CARDS: StoryCard[] = [
  {
    id: 'maria',
    name: 'Maria',
    role: 'Conductor — coordinating care for her father',
    quote: 'I was drowning in spreadsheets and guilt. Now I have neighbors who actually show up.',
    photoAlt: 'Woman in her 40s smiling while sitting with elderly man',
    photoSrc: '/images/stories/maria.jpg',
    cta: 'join',
  },
  {
    id: 'james',
    name: 'James',
    role: 'Neighbor — retired teacher giving 6 hours/week',
    quote:
      "Retirement was lonely until I started driving Frank to his appointments. Now we're friends.",
    photoAlt: 'Older man laughing while helping another senior into a car',
    photoSrc: '/images/stories/james.jpg',
    cta: 'join',
  },
  {
    id: 'priya',
    name: 'Priya',
    role: 'Worker-Owner — full-time caregiver earning equity',
    quote: "At my last agency I was a number. Here I own a piece of what we're building.",
    photoAlt: 'Young woman in scrubs smiling while holding clipboard',
    photoSrc: '/images/stories/priya.jpg',
    cta: 'learn',
  },
  {
    id: 'tom',
    name: 'Tom',
    role: 'Neighbor — software engineer helping with tech support',
    quote: 'Two hours a week setting up iPads. My daughter sees me helping and wants to join too.',
    photoAlt: 'Man helping elderly woman use a tablet',
    photoSrc: '/images/stories/tom.jpg',
    cta: 'join',
  },
];
