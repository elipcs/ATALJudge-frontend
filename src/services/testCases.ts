import { API } from '../config/api';
import { TestCaseResponseDTO } from '@/types/dtos';

export interface CreateTestCaseData {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  points: number;
  order?: number;
}

export interface UpdateTestCaseData {
  input?: string;
  expectedOutput?: string;
  isPublic?: boolean;
  points?: number;
  order?: number;
}

export interface ReorderTestCasesData {
  testCaseIds: string[];
}

export const getTestCases = async (questionId: string): Promise<TestCaseResponseDTO[]> => {
  const { data } = await API.testCases.list(questionId);
  return Array.isArray(data) ? data : [];
};

export const getTestCase = async (questionId: string, testCaseId: string): Promise<TestCaseResponseDTO> => {
  const testCases = await getTestCases(questionId);
  const testCase = testCases.find(tc => tc.id === testCaseId);
  if (!testCase) throw new Error('Test case not found');
  return testCase;
};

export const createTestCase = async (
  questionId: string,
  data: CreateTestCaseData
): Promise<TestCaseResponseDTO> => {
  const { data: created } = await API.testCases.create(questionId, data);
  return created;
};

export const updateTestCase = async (
  questionId: string,
  testCaseId: string,
  data: UpdateTestCaseData
): Promise<TestCaseResponseDTO> => {
  const { data: updated } = await API.testCases.update(questionId, testCaseId, data);
  return updated;
};

export const deleteTestCase = async (
  questionId: string,
  testCaseId: string
): Promise<void> => {
  await API.testCases.delete(questionId, testCaseId);
};

export const reorderTestCases = async (
  questionId: string,
  testCaseIds: string[]
): Promise<void> => {
  await API.testCases.reorder(questionId, testCaseIds);
};
