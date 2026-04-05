/**
 * Omaha Auto-Coder Service
 * Auto-codes Time Bank tasks to Omaha System problems using TIME_BANK_OMAHA_MAP
 */
import type { TaskType } from '@shared/constants/business-rules';
import {
  TIME_BANK_OMAHA_MAP,
  getOmahaCodeForTask,
  type TimeBankOmahaMapping,
} from '@shared/constants/omaha-system';

export interface OmahaCoding {
  omahaProblemCode: number;
  omahaProblemName: string;
  interventionCategory: string;
}

/**
 * Auto-code a task type to its Omaha System problem
 * Returns null for 'teaching' (varies by subject) or unknown task types
 */
export function autoCodeTask(taskType: TaskType): OmahaCoding | null {
  const mapping: TimeBankOmahaMapping | undefined = getOmahaCodeForTask(taskType);
  if (!mapping) return null;

  return {
    omahaProblemCode: mapping.omahaProblemCode,
    omahaProblemName: mapping.omahaProblemName,
    interventionCategory: mapping.interventionCategory,
  };
}

/**
 * Get all task types that map to a given Omaha problem code
 */
export function getTaskTypesForProblem(omahaProblemCode: number): TaskType[] {
  return TIME_BANK_OMAHA_MAP.filter(
    (m: TimeBankOmahaMapping) => m.omahaProblemCode === omahaProblemCode,
  ).map((m: TimeBankOmahaMapping) => m.taskType as TaskType);
}
