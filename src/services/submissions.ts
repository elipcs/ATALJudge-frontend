import { API } from '../config/api';
import { logger } from '../utils/logger';
import { SubmissionResponseDTO, SubmissionDetailDTO } from '@/types/dtos';

export type SubmissionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface Judge0Submission {
  id: string;
  questionId: string;
  listId?: string;
  userId: string;
  language: string;
  code: string;
  status: SubmissionStatus;
  totalScore?: number;      
  createdAt: string;
  updatedAt: string;
  judge0BatchToken?: string;
}

export interface SubmissionResult {
  id: string;
  submissionId: string;
  testCaseId: string;
  testCaseName?: string;
  isPublic: boolean;
  passed: boolean;
  pointsAwarded: number;
  expectedOutputSnapshot: string;
  actualOutput?: string;
  stdout?: string;
  stderr?: string;
  statusId?: number;
  statusDescription?: string;
  executionTimeMs?: number;
  memoryKb?: number;
  compileOutput?: string;
}

export interface SubmissionResultsResponse {
  submission: Judge0Submission;
  results: SubmissionResult[];
  summary: {
    passedCount: number;
    totalCases: number;
    totalPoints: number;
    earnedPoints: number;
  };
}

export interface SubmitCodeData {
  questionId: string;
  listId?: string;
  language: string;
  code: string;
}

export interface SubmissionFilters {
  questionId?: string;
  listId?: string;
  userId?: string;
  status?: 'pending' | 'accepted' | 'error' | 'timeout';
  limit?: number;
}

/**
 * API de submissões de código
 * 
 * Gerencia todas as operações relacionadas a submissões de código, incluindo:
 * - Buscar submissões (com filtros)
 * - Buscar detalhes de uma submissão específica
 * - Obter resultados de testes de uma submissão
 * 
 * @example
 * ```typescript
 * // Buscar submissões de uma questão
 * const submissions = await submissionsApi.getSubmissions({
 *   questionId: "question-id",
 *   listId: "list-id"
 * });
 * 
 * // Buscar detalhes de uma submissão
 * const submission = await submissionsApi.getSubmissionById("submission-id");
 * 
 * // Buscar resultados dos testes
 * const results = await submissionsApi.getSubmissionResults("submission-id");
 * ```
 */
export const submissionsApi = {
  async getSubmissions(filters?: SubmissionFilters): Promise<SubmissionResponseDTO[]> {
    try {
      const queryParams: Record<string, string> = {};
      if (filters?.questionId) queryParams.questionId = filters.questionId;
      if (filters?.listId) queryParams.listId = filters.listId;
      if (filters?.userId) queryParams.userId = filters.userId;
      if (filters?.status) queryParams.status = filters.status;
      if (filters?.limit) queryParams.limit = String(filters.limit);

      const { data } = await API.submissions.list(queryParams);
      return data.submissions || [];
    } catch (error) {
      logger.error('Erro ao buscar submissões', { error });
      return [];
    }
  },

  async getSubmission(id: string): Promise<SubmissionResponseDTO | null> {
    try {
      const { data } = await API.submissions.get(id);
      return data || null;
    } catch (error) {
      logger.error('Erro ao buscar submissão', { error });
      return null;
    }
  },

  async submitCode(data: SubmitCodeData): Promise<SubmissionDetailDTO> {
    try {
      const { data: result } = await API.submissions.submit(data);
      return result;
    } catch (error) {
      logger.error('Erro ao submeter código', { error });
      throw error;
    }
  },
};
