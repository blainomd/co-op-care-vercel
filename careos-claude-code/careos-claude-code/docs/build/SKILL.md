---
name: deep-research
description: "Conduct deep research on any topic, pulling the best sources from the web, synthesizing findings into a comprehensive research package with multiple output formats. Use this skill whenever the user asks to research a topic, create a research brief, build a knowledge base, do competitive analysis, or says 'research', 'deep dive', 'investigate', 'analyze market', 'find everything about', 'what's the latest on', or any variation of wanting comprehensive information gathered and synthesized. Also trigger when the user asks for a 'notebook', 'research package', 'briefing doc', 'intelligence report', or 'landscape analysis'. This skill replaces switching between NotebookLM, Perplexity, and manual research workflows — everything stays in Claude."
---

# Deep Research Skill

## Overview

This skill turns Claude Code into a one-stop research command center. Given a topic, it:

1. Conducts multi-pass web research (broad → targeted → verification)
2. Pulls and synthesizes the 20-25 best sources
3. Builds a structured research package with:
   - Executive summary
   - Source-annotated findings organized by theme
   - Key data points and statistics
   - Contrarian/minority viewpoints
   - Open questions and knowledge gaps
4. Outputs in multiple formats based on user need

## Research Workflow

### Phase 1: Scope & Strategy (before any searching)

Ask the user (or infer from context):
- **Topic**: What specifically are we researching?
- **Audience**: Who will consume this? (executive, technical team, investor, general)
- **Depth**: Quick scan (5-10 sources), Standard (15-20), Deep (25+)
- **Bias check**: Any known positions or hypotheses to test?
- **Output**: What format(s) do they want? (see Output Formats below)

If the user gives a simple prompt like "research X", default to:
- Standard depth (15-20 sources)
- Executive audience
- Markdown research brief output

### Phase 2: Multi-Pass Research

**Pass 1 — Landscape Scan (5-7 searches)**
Cast a wide net to understand the territory:
```
Search queries should cover:
- [topic] overview 2025
- [topic] market size revenue
- [topic] key players companies
- [topic] recent developments news
- [topic] challenges problems criticism
- [topic] trends forecast future
- [topic] research studies data
```

After Pass 1, compile a working source list and identify:
- Which subtopics need deeper investigation
- Which claims need verification
- Where the most valuable sources are clustering

**Pass 2 — Targeted Deep Dives (5-10 searches)**
Go deep on the most important subtopics:
```
- Target specific publications (academic, industry, government)
- Chase primary sources cited in Pass 1 results
- Search for contrarian viewpoints
- Look for recent data/statistics
- Find expert commentary and analysis
```

Use `web_fetch` liberally here to pull full articles, not just snippets.

**Pass 3 — Verification & Gap-Fill (3-5 searches)**
```
- Cross-reference key statistics from multiple sources
- Verify claims that seem surprising or contrarian
- Fill gaps identified in Pass 2
- Find the most recent data points (within last 30 days if relevant)
```

### Phase 3: Synthesis

Organize findings into a research brief structure:

```markdown
# [Topic] Research Brief
**Date:** [current date]
**Depth:** [X sources analyzed]
**Researcher:** Claude (Deep Research Skill)

## Executive Summary
[3-5 sentences capturing the most important findings]

## Key Findings

### [Theme 1]
[Synthesized findings with source attribution]
- Key data point (Source: [publication, date])
- Key data point (Source: [publication, date])

### [Theme 2]
[Continue for each major theme — typically 4-7 themes]

## Data & Statistics
[Table or list of the most important quantitative findings]

| Metric | Value | Source | Date |
|--------|-------|--------|------|
| ... | ... | ... | ... |

## Contrarian & Minority Views
[What do the skeptics/critics say? This section is mandatory.]

## Open Questions
[What couldn't be definitively answered? Where is the data weak?]

## Source Index
[Numbered list of all sources with URLs, organized by quality tier]

### Tier 1: Primary Sources (government, academic, company filings)
### Tier 2: Quality Analysis (major publications, industry reports)
### Tier 3: Supporting Sources (blogs, forums, secondary coverage)
```

### Phase 4: Output Generation

Based on user request, generate one or more of these outputs:

## Output Formats

### 1. Research Brief (Default)
**Format:** Markdown file
**When:** Default output for any research request
**File:** `[topic-slug]-research-brief.md`

### 2. Executive One-Pager
**Format:** DOCX (use docx skill)
**When:** User says "one-pager", "executive summary", "brief for leadership"
**Content:** Distill to single page — key finding, 3 supporting points, 1 recommendation, source count
**File:** `[topic-slug]-executive-summary.docx`

### 3. Slide Deck
**Format:** PPTX (use pptx skill)
**When:** User says "slides", "deck", "presentation", "put this in a deck"
**Structure:**
- Title slide with topic and date
- Executive summary slide
- One slide per major theme (4-7 slides)
- Data/statistics slide
- Key takeaways slide
- Source appendix slide
**File:** `[topic-slug]-research-deck.pptx`

### 4. Competitive Landscape
**Format:** Markdown or XLSX (use xlsx skill for comparison matrix)
**When:** User says "competitive analysis", "landscape", "who else is doing this", "market map"
**Structure:**
- Market overview
- Player comparison matrix (features, pricing, funding, market position)
- Strengths/weaknesses per player
- White space / opportunity analysis
**File:** `[topic-slug]-competitive-landscape.md` or `.xlsx`

### 5. Data Extract
**Format:** XLSX (use xlsx skill)
**When:** User says "spreadsheet", "data", "give me the numbers", "export"
**Content:** All quantitative findings in structured spreadsheet with source attribution
**File:** `[topic-slug]-data.xlsx`

### 6. Stakeholder Email
**Format:** Draft email via Gmail (if connected)
**When:** User says "email this to", "send to my team", "draft an email with findings"
**Content:** 3-paragraph summary with key findings, link to full brief if available

## Research Quality Standards

1. **Source diversity**: Never rely on a single source for any major claim. Minimum 2 sources for statistics.
2. **Recency bias awareness**: Note when sources are >6 months old on fast-moving topics.
3. **Primary source preference**: Government data > academic papers > industry reports > news coverage > blogs.
4. **Contrarian inclusion**: Every research brief MUST include a "Contrarian Views" section. If you can't find criticism, note that as a finding.
5. **Confidence flagging**: Mark findings as High/Medium/Low confidence based on source quality and corroboration.
6. **No hallucinated sources**: Every source must come from actual web search results. If a claim can't be sourced, flag it as "unverified" or remove it.

## Usage Examples

**Simple:**
```
User: "Research the cooperative home care market"
→ Standard depth, executive audience, markdown brief
```

**Specific:**
```
User: "Deep dive on CMS ACCESS Model economics — I need a deck for a board meeting"
→ Deep depth, board/investor audience, PPTX + markdown brief
```

**Competitive:**
```
User: "Who are the main players in AI-powered MSK care? Give me a landscape."
→ Standard depth, competitive landscape format, markdown + xlsx matrix
```

**Multi-output:**
```
User: "Research Boulder Valley demographics for aging population — I need a brief, a one-pager for employers, and the raw data in a spreadsheet"
→ Deep depth, generates all three outputs
```

## Tips for Best Results

- **Be specific about audience**: "Research X for investors" produces very different output than "Research X for clinicians"
- **Name your unknowns**: "I think the market is $100B but I'm not sure — verify that" gets better results than just "research the market"
- **Request multiple formats upfront**: It's more efficient to generate all outputs in one pass than to ask for conversions later
- **Iterate**: After the first brief, ask follow-up questions — the skill retains context and can do targeted additional research
