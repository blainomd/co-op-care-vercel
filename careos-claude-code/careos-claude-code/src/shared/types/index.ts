export type * from './user.types';
export type * from './family.types';
export type * from './assessment.types';
export type * from './timebank.types';
export type * from './notification.types';
export type * from './worker.types';
export type * from './lmn.types';
export type * from './acp.types';
export type * from './coverage.types';
export type * from './identity.types';

// ─── Phase 2/3 types — uncomment when features are built ───
// These type files exist but have zero imports. Removing from barrel
// speeds up TypeScript compilation and avoids misleading developers.
// export type * from './opolis.types';
// export type * from './nlp-pipeline.types';
// export type * from './federation.types';
// export type * from './bch-integration.types';
// export type * from './web3.types';
// export type * from './postgres-agentic.types';
// export type * from './network-intelligence.types';
