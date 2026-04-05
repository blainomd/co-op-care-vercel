/**
 * Cascade Service — Impact Visualization via PostgreSQL Graph Queries
 *
 * Tracks "who helped whom" via the `helped` graph edge
 * Used for community impact scoring and cascade chain diagrams
 */
import {
  getDirectlyHelpedByUser,
  countHelpedEdgesFrom,
  recordHelpedEdge,
} from '../../database/queries/index.js';

export interface CascadeNode {
  userId: string;
  displayName: string;
  depth: number;
}

export interface CascadeChain {
  rootUserId: string;
  nodes: CascadeNode[];
  totalImpactedUsers: number;
  maxDepth: number;
}

export interface ImpactScore {
  userId: string;
  directHelped: number;
  indirectHelped: number;
  totalImpact: number;
  cascadeDepth: number;
}

export const cascadeService = {
  /**
   * Query the cascade chain — who did this user's help ripple out to?
   * Uses BFS through the `helped` graph edge via query builders
   */
  async getCascadeChain(userId: string, maxDepth: number = 5): Promise<CascadeChain> {
    // BFS through graph
    const nodes: CascadeNode[] = [];
    const visited = new Set<string>();
    visited.add(userId);

    let currentLevel = [userId];
    for (let depth = 1; depth <= maxDepth; depth++) {
      if (currentLevel.length === 0) break;

      const nextLevel: string[] = [];
      for (const uid of currentLevel) {
        const helped = await getDirectlyHelpedByUser(uid);

        for (const h of helped) {
          if (!visited.has(h.id)) {
            visited.add(h.id);
            nodes.push({
              userId: h.id,
              displayName: `${h.firstName} ${h.lastName}`,
              depth,
            });
            nextLevel.push(h.id);
          }
        }
      }
      currentLevel = nextLevel;
    }

    return {
      rootUserId: userId,
      nodes,
      totalImpactedUsers: nodes.length,
      maxDepth: nodes.length > 0 ? Math.max(...nodes.map((n) => n.depth)) : 0,
    };
  },

  /**
   * Compute impact score for a user
   */
  async getImpactScore(userId: string): Promise<ImpactScore> {
    // Direct: people this user helped
    const directHelped = await countHelpedEdgesFrom(userId);

    // Get full cascade for indirect count
    const cascade = await this.getCascadeChain(userId, 5);
    const indirectHelped = Math.max(0, cascade.totalImpactedUsers - directHelped);

    return {
      userId,
      directHelped,
      indirectHelped,
      totalImpact: directHelped + indirectHelped,
      cascadeDepth: cascade.maxDepth,
    };
  },

  /**
   * Record a "helped" edge after task completion
   */
  async recordHelped(helperId: string, helpedUserId: string, taskId: string): Promise<void> {
    await recordHelpedEdge(helperId, helpedUserId, taskId);
  },
};
