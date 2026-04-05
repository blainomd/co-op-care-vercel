# Quick Start Guide — CareOS + Claude Code

Everything you need to make changes using Claude Code. No coding required.

---

## How It Works

1. You describe what you want in plain English
2. Claude handles coding, testing, and deployment
3. You review the result, then push live

**Flow:** You describe → Claude builds/tests/deploys → You review → Live

---

## One-Time Setup

### 1. Clone the repo

```bash
git clone https://github.com/co-op-care/care-os.git
cd care-os/careos-claude-code/careos-claude-code
npm install
```

### 2. Add Claude to VS Code

1. Open VS Code
2. Press `Cmd+Shift+X` → search "Claude" → install **Claude by Anthropic**
3. Click the Claude icon in the left sidebar → Sign In
4. File → Open Folder → navigate to `care-os/careos-claude-code/careos-claude-code` → open it

---

## Making a Change (Step-by-Step)

1. **Open Terminal** — `Cmd + Space` → type "Terminal" → Enter
2. **Go to the project folder** — `cd care-os/careos-claude-code/careos-claude-code`
3. **Start Claude** — type `claude` and hit Enter (project rules load automatically)
4. **Tell Claude what you want** — use one of the prompt templates below
5. **Wait for Claude to finish** — it writes code, runs safety checks, deploys to dev
6. **Check the result** — Claude fixes anything Greptile flags automatically
7. **Push to live** — say "Everything looks good on dev, push it live." Production updates in 2-3 minutes.

---

## What Claude Does in the Background

When you ask for a change, Claude automatically:

1. Creates a safe branch for the change
2. Makes the code change
3. Runs lint, type checks, and all 682 tests — fixes any failures
4. Runs HIPAA security audit — fixes any issues
5. Pushes the code and opens a review request
6. Watches the automated CI pipeline — fixes failures
7. Waits for Greptile AI review — fixes anything it flags
8. Merges to dev once everything passes
9. When you say "push it live" — merges to production

---

## Prompt Templates by Role

### Josh (Clinical / CMO)

| What You Want | What to Type |
|---|---|
| Update an LMN template | "Update the LMN template for [condition] to include [new requirement]" |
| Add assessment questions | "Add a new Sage assessment question about [topic] in the [category] section" |
| Modify clinical protocols | "Update the care protocol for [condition] — change [specific detail]" |
| Review AI output format | "Change how the AI-generated clinical note displays — add [section/field]" |
| Update medication list | "Add [medication] to the medication reference for [condition]" |
| Fix clinical terminology | "The [screen/page] says [wrong term] — change it to [correct term]" |

**Pro tip:** Start with `read CLAUDE.md` so Claude has full project context, then paste your request.

### Jess (Operations / co-op.care)

| What You Want | What to Type |
|---|---|
| Update caregiver onboarding | "Update the caregiver onboarding flow to include [new step]" |
| Change pricing | "Change the family membership price from $59 to $[X] on the pricing page" |
| Edit caregiver scheduling | "Add [constraint] to the caregiver matching algorithm" |
| Update family-facing copy | "Change the text on the [page name] page from [old text] to [new text]" |
| Add a new care service | "Add [service name] as a new service option with description [details]" |
| Update the FAQ | "Add this FAQ: Q: [question] A: [answer]" |

### Levonti / Bryan (SurgeonAccess Sales)

| What You Want | What to Type |
|---|---|
| Add a new agent card | "Add a new agent card for [specialty] with description [details] and icon [type]" |
| Update pricing page | "Update the SurgeonAccess pricing — Core is now $[X]/mo, Pro is $[Y]/mo" |
| Change marketing copy | "Update the hero text on the SurgeonAccess homepage to [new text]" |
| Add a testimonial | "Add a testimonial from Dr. [Name] at [Practice]: [quote]" |
| Update the demo flow | "Add a screen to the demo that shows [feature]" |
| Fix a broken link | "The [button/link] on [page] goes to [wrong URL] — fix it to [correct URL]" |

### Blaine (Architecture / Everything)

| What You Want | What to Type |
|---|---|
| Add a new feature | "Add [feature name] — here's what it should do: [description]" |
| Deploy a new vertical | "Create a new [Vertical]Access page based on SurgeonAccess with [customizations]" |
| Debug an issue | "The [feature] is broken — [describe what's happening vs what should happen]" |
| Run the full test suite | "Run all tests and fix any failures" |
| Check deployment status | "What's the current deployment status? Any failing checks?" |

---

## Quick Commands

| What You Want | What to Type |
|---|---|
| Add a new page | "Add a feature XYZ" |
| Fix something broken | "Fix the login button — it's not working" |
| Change text or pricing | "Change the membership price to $120" |
| Push to live | "Everything looks good, push it live" |
| Set up the project | "Help me set up the project on my computer" |
| Load project context | "read CLAUDE.md" |

---

## Key Rules

- All changes go to a test/dev site first, then production
- HIPAA safety checks run on every change automatically
- If something goes wrong, Claude stops, explains the issue in plain English, and tells you exactly what to do next
- Never force push — Claude handles git safely

---

## If Something Goes Wrong

1. Claude will stop and explain the issue
2. Read what Claude says — it will be in plain English
3. If you're stuck, type: "Explain what went wrong and what my options are"
4. If everything is broken, type: "Roll back to the last working version"
5. Ping Blaine in Slack if you need help

---

*Last updated: March 31, 2026*
