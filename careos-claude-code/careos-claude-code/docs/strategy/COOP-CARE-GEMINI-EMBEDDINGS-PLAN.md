# co-op.care — Gemini Embeddings Integration Plan

**Date:** March 10, 2026
**Author:** Blaine Warkentine + Claude
**Status:** Implementation Blueprint

---

## Executive Summary

co-op.care currently uses keyword pattern-matching for Sage AI (~50 patterns) and deterministic multi-factor scoring for caregiver-family matching. This plan upgrades both systems using Google's Gemini Embeddings API to enable semantic understanding — so Sage can answer questions it's never been explicitly programmed for, and matching can consider personality compatibility alongside proximity and skills.

**Priority order:** Sage RAG first (highest user impact), then matching enhancement, then analytics applications.

---

## 1. Gemini Embedding Models

### Primary: gemini-embedding-001 (Text-Only)
- **Input:** Up to 2,048 tokens
- **Output:** 128–3,072 dimensions (we'll use 768 for balance of quality vs. storage)
- **Task types:** SEMANTIC_SIMILARITY, CLASSIFICATION, CLUSTERING, RETRIEVAL_DOCUMENT, RETRIEVAL_QUERY, QUESTION_ANSWERING, FACT_VERIFICATION
- **Cost:** Free tier available; paid tier scales with usage

### Future: gemini-embedding-2-preview (Multimodal)
- **Input:** Up to 8,192 tokens
- **Supports:** Text, images, video (128s), audio (80s), PDFs (6 pages)
- **Use case:** Galaxy Watch vitals + care notes combined embeddings (Phase 3)

### Key API Pattern
```typescript
import { GoogleGenAI } from '@google/genai';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Embed a query (for search)
const queryResult = await client.models.embedContent({
  model: 'gemini-embedding-001',
  contents: ['How do I handle sundowning?'],
  config: { taskType: 'QUESTION_ANSWERING', outputDimensionality: 768 },
});

// Embed a document (for knowledge base)
const docResult = await client.models.embedContent({
  model: 'gemini-embedding-001',
  contents: ['Sundowning guide content here...'],
  config: { taskType: 'RETRIEVAL_DOCUMENT', outputDimensionality: 768 },
});
```

**Critical:** Use asymmetric task types — `RETRIEVAL_QUERY` for user questions, `RETRIEVAL_DOCUMENT` for knowledge base content. This optimizes the embedding space for search relevance.

---

## 2. Application Priority Matrix

| # | Application | Model | Task Type | Dim | Phase | Impact |
|---|------------|-------|-----------|-----|-------|--------|
| 1 | Sage semantic Q&A | embedding-001 | QUESTION_ANSWERING | 768 | 1 | Highest — replaces keyword matching |
| 2 | Caregiver-family compatibility | embedding-001 | SEMANTIC_SIMILARITY | 768 | 2 | High — personality matching |
| 3 | Care log anomaly detection | embedding-001 | CLUSTERING | 768 | 2 | Medium — early warning |
| 4 | Discharge disposition prediction | embedding-001 | CLASSIFICATION | 768 | 3 | High — ACO partnership value |
| 5 | Cross-system context retrieval | embedding-001 | RETRIEVAL_DOCUMENT | 1536 | 3 | Medium — unified search |
| 6 | Respite fund targeting | embedding-001 | CLASSIFICATION | 768 | 2 | Medium — burnout prediction |
| 7 | Happenstance event ranking | embedding-001 | SEMANTIC_SIMILARITY | 768 | 2 | Low — nice-to-have |
| 8 | Omaha System code suggestion | embedding-001 | CLASSIFICATION | 768 | 3 | Medium — clinical workflow |

---

## 3. Phase 1: Sage RAG Pipeline (Weeks 1-4)

### Architecture

```
User Query ("Mom won't eat anything")
    ↓
Gemini Embedding (768-dim, task_type: QUESTION_ANSWERING)
    ↓
Vector Search (ChromaDB, top-5 nearest neighbors)
    ↓
Retrieved Knowledge Chunks (care guides, Omaha codes, FAQ)
    ↓
Gemini Flash 2.0 (generative response with retrieved context + Sage system prompt)
    ↓
Sage Response (warm, empathetic, clinically informed, personalized)
```

### Knowledge Base to Embed

| Source | Documents | Avg Tokens | Total Chunks |
|--------|-----------|-----------|-------------|
| Caregiver guides (Care Library) | ~40 articles | ~800 | ~200 |
| Omaha System (42 problems × 4 domains) | 168 entries | ~300 | ~170 |
| Assessment interpretations (CII/KBS/CRI) | 12 score ranges | ~200 | ~36 |
| FAQ (common caregiver questions) | ~100 Q&A pairs | ~400 | ~200 |
| Community wisdom (anonymized gratitude patterns) | ~50 patterns | ~150 | ~50 |
| **Total** | | | **~656 chunks** |

### Chunking Strategy
- **Chunk size:** 400-600 tokens (fits within 2,048 input limit with margin)
- **Overlap:** 50 tokens between chunks (preserves context at boundaries)
- **Metadata per chunk:** source, category, relevance_tags, last_updated
- **Re-embedding frequency:** Weekly for dynamic content (community wisdom), monthly for static (guides)

### Vector Storage: ChromaDB (Phase 1)

**Why ChromaDB for POC:**
- Lightweight, runs locally alongside the app
- Python and JavaScript SDKs
- No additional infrastructure
- Fast enough for <1,000 chunks
- Easy migration path to Qdrant for production

```typescript
// src/server/services/vector-store.ts
import { ChromaClient } from 'chromadb';

const client = new ChromaClient();
const collection = await client.getOrCreateCollection({
  name: 'sage_knowledge',
  metadata: { 'hnsw:space': 'cosine' },
});

// Add documents
await collection.add({
  ids: ['guide-sundowning-1', 'guide-sundowning-2'],
  embeddings: [embedding1, embedding2],
  metadatas: [{ source: 'care-library', category: 'behavior' }],
  documents: ['Original text chunk 1...', 'Original text chunk 2...'],
});

// Query
const results = await collection.query({
  queryEmbeddings: [queryEmbedding],
  nResults: 5,
  where: { category: 'behavior' }, // optional filter
});
```

### Sage System Prompt (for Gemini Flash generation)

```
You are Sage, an AI companion for family caregivers on co-op.care.

PERSONALITY:
- Warm, validating, knowledgeable but never preachy
- A knowledgeable friend who's been through this — not a therapist or medical advisor
- Always see the CAREGIVER, not just the patient

RULES:
- Never use clinical language ("caregiver burden" → "what you're carrying")
- Always offer next steps — never leave someone with a scary number and no path
- If the query suggests medical emergency, immediately suggest 911
- If the query suggests suicidal ideation, provide 988 Lifeline number
- Never share or reference PHI from other members

CONTEXT:
- Care recipient: {careRecipient.firstName}, age {careRecipient.age}
- Caregiver: {conductorName}
- CII Score: {ciiScore} ({ciiZone} zone)
- Recent care log: {recentCareLog}

RETRIEVED KNOWLEDGE:
{topKChunks}

Respond warmly and helpfully based on the retrieved knowledge and care context.
```

### New Files

| File | Purpose |
|------|---------|
| `src/server/services/embedding.service.ts` | Gemini embedding API wrapper |
| `src/server/services/vector-store.ts` | ChromaDB operations |
| `src/server/services/sage-rag.service.ts` | RAG pipeline orchestrator |
| `src/server/services/knowledge-ingestion.ts` | Chunking + embedding knowledge base |
| `src/server/modules/sage/routes.ts` | New POST /sage/chat endpoint |
| `data/knowledge/` | Raw knowledge base files (markdown) |

### Modified Files

| File | Change |
|------|--------|
| `src/client/features/sage/SageChat.tsx` | Replace `generateSageResponse()` with API call to /sage/chat |
| `src/server/modules/sage/` | New module for Sage API |
| `.env` | Add GEMINI_API_KEY |

---

## 4. Phase 2: Matching Enhancement (Weeks 5-8)

### Current Matching (Deterministic)

```
Total Score = (proximity × 0.35) + (skill × 0.25) + (rating × 0.20) + (availability × 0.20)
              × identity_multiplier
```

### Enhanced Matching (Hybrid)

```
Final Score = deterministic_score × 0.6 + semantic_compatibility × 0.4
```

Where `semantic_compatibility` uses Gemini embeddings to match:
- Caregiver profile narrative ↔ Family preference narrative
- Care style descriptions (detailed updater vs. independent worker)
- Past successful pairing patterns as training signal

### What Deterministic Scoring Misses

1. **Personality compatibility** — cheerful caregiver + introverted recipient = bad fit
2. **Communication style** — some families want detailed updates, others want independence
3. **Care philosophy** — curative vs. comfort-focused mindset alignment
4. **Historical success** — which pairings have worked well in practice?
5. **Caregiver capacity** — emotional bandwidth, not just schedule availability

### Implementation

```typescript
// Embed caregiver profiles
const caregiverEmbedding = await embed(
  `${caregiver.bio} ${caregiver.careStyle} ${caregiver.strengths}`,
  'SEMANTIC_SIMILARITY'
);

// Embed family preferences
const familyEmbedding = await embed(
  `${family.preferences} ${family.careNeeds} ${family.communicationStyle}`,
  'SEMANTIC_SIMILARITY'
);

// Cosine similarity
const compatibility = cosineSimilarity(caregiverEmbedding, familyEmbedding);
```

---

## 5. Phase 3: Analytics & ACO Value (Weeks 9-16)

### Care Log Anomaly Detection
- Embed daily care logs → cluster by similarity
- Flag outlier logs (sudden change in language, tone, or content)
- Alert: "Margaret's care logs this week are significantly different from her baseline"

### Discharge Disposition Prediction
- Embed patient profiles + care history
- Classify: home with support, SNF, rehab, hospice
- ACO value: predict which patients need co-op.care post-discharge

### Cross-System Context Retrieval
- Unified search across care logs, assessments, FHIR resources
- "Show me everything about Margaret's nutrition concerns" → semantic search across all data

---

## 6. Vector Storage Migration Path

| Stage | Storage | Capacity | Latency |
|-------|---------|----------|---------|
| POC (Phase 1) | ChromaDB (local) | <5,000 chunks | <100ms |
| Growth (Phase 2) | Qdrant (self-hosted) | <100,000 chunks | <50ms |
| Scale (Phase 3) | Qdrant Cloud or Pinecone | Unlimited | <30ms |

**PostgreSQL Option:** PostgreSQL supports float arrays, so embeddings *could* be stored alongside relational data. However, it lacks native ANN (Approximate Nearest Neighbor) indexing, making vector search O(n) instead of O(log n). Use PostgreSQL for metadata, ChromaDB/Qdrant for vectors.

---

## 7. Privacy & HIPAA Considerations

### What Gets Embedded (Safe)
- Care library articles (public content)
- Omaha System codes (clinical taxonomy)
- FAQ answers (general knowledge)
- Anonymized community patterns
- Caregiver profile narratives (with consent)

### What NEVER Gets Embedded
- PHI (names, dates, diagnoses, medications)
- Individual assessment scores
- Care logs with identifiable information
- FHIR resources containing patient data

### If PHI Must Be Embedded (Future)
- BAA required with Google Cloud for Gemini API
- Use Vertex AI (Google Cloud) instead of consumer API
- Embeddings stored in HIPAA-compliant vector store
- Access logging and audit trail required

---

## 8. Cost Estimates

### Gemini Embeddings API
- **Free tier:** 1,500 requests/day (sufficient for POC)
- **Paid tier:** ~$0.00004 per 1,000 characters
- **Phase 1 estimate:** ~$5-10/month (knowledge base re-embedding + user queries)
- **Phase 2 estimate:** ~$20-50/month (adding matching + analytics)

### Gemini Flash (Generation)
- **Free tier:** 15 requests/minute, 1M tokens/day
- **Paid tier:** $0.075/1M input tokens, $0.30/1M output tokens
- **Phase 1 estimate:** ~$10-30/month (Sage conversations)

### Vector Storage
- **ChromaDB:** Free (self-hosted)
- **Qdrant Cloud:** Starting ~$25/month for 1M vectors

### Total Monthly Cost Projection
| Phase | Embeddings | Generation | Storage | Total |
|-------|-----------|------------|---------|-------|
| Phase 1 (POC) | $5-10 | $10-30 | $0 | $15-40 |
| Phase 2 (Growth) | $20-50 | $30-80 | $25 | $75-155 |
| Phase 3 (Scale) | $50-100 | $80-200 | $50 | $180-350 |

---

## 9. Success Metrics

| Metric | Current (Keyword) | Target (RAG) | Measurement |
|--------|-------------------|-------------|-------------|
| Sage query resolution | ~40% (misses paraphrasing) | 85%+ | User satisfaction rating |
| Sage response time | <500ms | <2s (acceptable for quality) | P95 latency |
| Knowledge coverage | ~50 keyword patterns | 656+ semantic chunks | Unique queries answered |
| Matching satisfaction | Unknown | 4.2+/5.0 rating | Post-match survey |
| Care log anomaly detection | None | 80% recall on known events | Validated against incident reports |

---

## 10. Implementation Timeline

| Week | Deliverable |
|------|------------|
| 1 | `embedding.service.ts` + `vector-store.ts` + ChromaDB setup |
| 2 | Knowledge base chunking + ingestion pipeline |
| 3 | `sage-rag.service.ts` + Gemini Flash integration |
| 4 | SageChat.tsx API integration + testing |
| 5-6 | Caregiver profile embedding + matching enhancement |
| 7-8 | A/B test hybrid matching vs. deterministic-only |
| 9-12 | Care log anomaly detection |
| 13-16 | Discharge disposition prediction + ACO integration |

---

## Appendix: File Structure

```
src/
  server/
    services/
      embedding.service.ts      ← Gemini API wrapper
      vector-store.ts           ← ChromaDB operations
      sage-rag.service.ts       ← RAG pipeline orchestrator
      knowledge-ingestion.ts    ← Chunking + embedding pipeline
    modules/
      sage/
        routes.ts               ← POST /sage/chat
        service.ts              ← Sage business logic
  shared/
    types/
      embedding.types.ts        ← Vector, Chunk, SearchResult types
data/
  knowledge/
    care-library/               ← Markdown guides
    omaha-system/               ← Omaha problem definitions
    faq/                        ← Q&A pairs
    assessment-interpretations/ ← CII/KBS/CRI ranges
```
