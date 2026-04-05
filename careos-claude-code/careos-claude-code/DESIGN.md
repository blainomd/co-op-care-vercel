# DESIGN.md — co-op.care Design System

> Agent-friendly design specification for co-op.care CareOS platform.
> Import this into Google Stitch, Cursor, or any AI design/code tool.

## Brand Identity

**Name:** co-op.care
**Tagline:** Worker-owned home care and wellness cooperative
**Voice:** Warm, honest, slightly rebellious. We're caregivers who got tired of the broken system and built something better.
**Reading level:** 8th grade. Short sentences. Simple words. Zero jargon.

## Color Palette

### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `sage` | `#2BA5A0` | Primary brand color, CTAs, active states, success |
| `sage-light` | `#3DC4BE` | Hover states, accents |
| `sage-dark` | `#1B8A85` | Active/pressed states, emphasis text |
| `navy` | `#1B3A5C` | Headlines, strong text, dark backgrounds |
| `navy-light` | `#2A5580` | Secondary buttons |
| `navy-dark` | `#122840` | Deepest contrast |

### Accent Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `gold` | `#C49B40` | Premium tier, highlights, achievements |
| `gold-light` | `#D4B060` | Gold hover |
| `gold-dark` | `#A07E30` | Gold pressed |
| `blue` | `#4A6FA5` | Links, secondary actions |
| `purple` | `#7A5CB8` | Special features, Sage AI |

### CII Zone Colors (Clinical)
| Token | Hex | Usage |
|-------|-----|-------|
| `zone-green` | `#4CAF50` | Healthy / low risk |
| `zone-yellow` | `#FFC107` | Moderate / watch |
| `zone-red` | `#F44336` | High risk / urgent |

### Neutral Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `warm-white` | `#FAFAF8` | Page backgrounds |
| `warm-gray` | `#F5F5F0` | Section backgrounds, cards |
| `text-primary` | `#2C2C2C` | Body text |
| `text-secondary` | `#6B6B6B` | Supporting text |
| `text-muted` | `#9B9B9B` | Captions, timestamps |
| `border` | `#E5E5E0` | Card borders, dividers |

### Warm Extensions
| Token | Hex | Usage |
|-------|-----|-------|
| `cream` | `#FDF8F0` | Soft warm backgrounds |
| `linen` | `#FAF6F1` | Card backgrounds |
| `bark` | `#8B7355` | Earth tone accents |
| `moss` | `#6B8F71` | Nature/growth accents |
| `clay` | `#C4A882` | Warm neutral accents |

## Typography

### Font Stack
| Role | Family | Fallback | Weight Range |
|------|--------|----------|-------------|
| Headings | **Literata** (serif) | Georgia, serif | 400–700 |
| Body | **DM Sans** (sans-serif) | system-ui, sans-serif | 400–700 |
| Handwritten | **Caveat** (cursive) | cursive | 400–700 |

### Google Fonts Import
```
Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;0,7..72,700;1,7..72,400
DM Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400
Caveat:wght@400;500;600;700
```

### Type Scale
- Hero headings: 2.4rem–3rem (Literata 700)
- Section headings: 1.5rem (Literata 700)
- Card titles: 0.875rem (Literata 700)
- Body: 1rem (DM Sans 400)
- Small/supporting: 0.75rem (DM Sans 400–500)
- Micro: 0.625rem (DM Sans 400)

## Spacing & Layout

- **Mobile-first**, max-width containers at `max-w-2xl` (672px) for content
- Page padding: `px-6 py-16 md:px-12`
- Card padding: `p-5` or `p-6`
- Card border radius: `rounded-xl` (12px)
- Button radius: `rounded-xl` (12px) for block buttons, `rounded-full` for pills
- Gap between cards: `gap-3` or `gap-4`
- Section spacing: `py-14` to `py-16`

## Component Patterns

### Primary Button
```
bg-sage text-white font-bold rounded-xl px-6 py-3.5 shadow-sm
hover:bg-sage-dark active:scale-95 transition-all
```

### Secondary Button
```
border border-navy/15 text-navy rounded-full px-4 py-2 font-medium
hover:bg-navy/5 transition-colors
```

### Card
```
rounded-xl border border-border bg-white p-5 shadow-sm
```

### Section with Background
```
bg-warm-gray/40 px-6 py-16 md:px-12
```

### Dark Section (navy)
```
bg-navy px-6 py-14 md:px-12
Stats: text-sage-light (numbers), text-white/60 (labels)
```

### Tag/Badge
```
rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-semibold text-sage-dark
```

### Icon Container
```
flex h-12 w-12 items-center justify-center rounded-full bg-white text-sage shadow-sm
```

## Icon System

Uses **Lucide React** icons mapped to semantic names:
- Care tiers: seedling (Sprout), rooted (TreePine), canopy (Mountain)
- Actions: heart, handshake, stethoscope, phone, clipboard, home, chart
- Status: check, warning, shield, flag, activity
- UI: star, leaf, sparkles, bell, calendar, brain, lock, mic

Custom **TileIcon** component provides additional SVG icons for specific features.

## Page Structure

### Homepage Flow
1. **Nav** — Logo left, "Get started" pill right
2. **Hero** — Audience-tailored headline (Literata 2.4–3rem), subtitle (DM Sans), LivePulse indicator
3. **Engagement Zone** — White card with: Audience picker → Burnout quiz (3 questions) → Email capture → Redirect to /card
4. **How It Works** — 4 steps with icons, warm-gray background
5. **Sage Listens** — Expandable story cards with tags
6. **The Numbers** — Navy background, animated stats
7. **Six Differentiators** — Icon + title + detail cards (includes yoga/wellness)
8. **Final CTA** — Warm-gray background, single action
9. **Footer** — Logo, location, copyright

### Key Pages
- `/` — Homepage with audience segmentation
- `/card` — CareCard + Sage AI chat (main app experience)
- `/partners` — Healthcare partners & employers (ROI-focused)
- `/faq` — Accordion FAQ with 9 sections including Wellness/Yoga
- `/team` — Team bios (Blaine CEO, Josh Medical Director, Jacob Developer, Jessica Community Director)
- `/admin` — Review dashboard with auto-approval triage

## Brand Themes

### Core Messaging Pillars
1. **Worker-owned caregivers** — $25–28/hr W-2 + equity = 85% retention
2. **Physician oversight** — Dr. Josh Emdur, 50-state licensed, $59/mo membership
3. **Yoga & wellness as prescribed care** — Not extras, documented in care plan, HSA/FSA eligible
4. **AI that operates, humans who decide** — Sage AI companion, 6-agent CareOS pipeline
5. **Community ownership** — Cooperative model, federation not franchise
6. **HSA/FSA savings** — 28–36% tax savings via Letter of Medical Necessity

### Wellness/Yoga Integration
Yoga and wellness appear across every user touchpoint:
- Homepage: burnout story, 6th differentiator, neighbor wellness hours
- Sage AI: dedicated yoga/wellness response handler (10 trigger keywords)
- FAQ: "Wellness, Yoga & Movement" section (5 Q&As)
- Partners: wellness-integrated care card, TEAM model yoga mention
- Care Tiers: "Wellness & Yoga" benefit (community → guided → prescribed)
- Onboarding: wellness topic chips, signup buttons mention wellness
- Email: welcome template includes wellness
- Notifications: suggest yoga classes to earn Time Bank credits

### Emotional Tone by Section
| Section | Tone | Example |
|---------|------|---------|
| Hero | Empathetic, direct | "You're doing so much. Let us help carry it." |
| Burnout quiz | Gentle, non-judgmental | "How heavy is the load?" |
| Differentiators | Confident, clear | "Six things nobody else combines." |
| Partners | Professional, data-driven | "Blocked beds cost $2,500 per day." |
| Yoga/Wellness | Warm, prescriptive | "Wellness that's prescribed, not optional." |
| Neighbor recruitment | Empowering | "Good pay. Real benefits. You own it." |

## Accessibility

- All interactive elements have hover/active states
- Color contrast meets WCAG AA
- Font sizes never below 10px
- Touch targets minimum 44px on mobile
- Animations use `prefers-reduced-motion` where applicable
- Semantic HTML throughout
