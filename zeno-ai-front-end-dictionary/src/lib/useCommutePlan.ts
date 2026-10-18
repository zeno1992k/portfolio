import { useLearning } from './LearningProvider';
import { LEGACY_PLAN_KEY } from './learning-store';

export const COMMUTE_PLAN_STORAGE_KEY = LEGACY_PLAN_KEY;

export function useCommutePlan() {
  const { plan, savePlan, issue } = useLearning();
  return { plan, savePlan, issue };
}
