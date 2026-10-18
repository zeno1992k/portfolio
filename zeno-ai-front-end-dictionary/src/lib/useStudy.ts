import { useLearning } from './LearningProvider';
import { LEGACY_STUDY_KEY } from './learning-store';

export const STORAGE_KEY = LEGACY_STUDY_KEY;

export function useStudy() {
  const { data, setData, storageIssue } = useLearning();
  return { data, setData, storageIssue };
}
