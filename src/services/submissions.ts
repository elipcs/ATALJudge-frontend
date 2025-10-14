import { Submission } from '../types';
import { authenticatedFetch } from '../config/api';

export interface CreateSubmissionRequest {
  questionId: string;
  listId: string;
  code: string;
  language: 'python' | 'java';
}

export interface SubmissionFilters {
  questionId?: string;
  listId?: string;
  userId?: string;
  status?: 'pending' | 'accepted' | 'error' | 'timeout';
  limit?: number;
}

export const submissionsApi = {
  async getSubmissions(filters?: SubmissionFilters): Promise<Submission[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.questionId) queryParams.append('questionId', filters.questionId);
        if (filters.listId) queryParams.append('listId', filters.listId);
        if (filters.userId) queryParams.append('userId', filters.userId);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.limit) queryParams.append('limit', filters.limit.toString());
      }
      
      const queryString = queryParams.toString();
      const endpoint = `/api/submissions${queryString ? `?${queryString}` : ''}`;
      
  const response = await authenticatedFetch<{submissions: Submission[]}>(endpoint);
  const submissions = response.data.submissions || [];
      
      return Array.isArray(submissions) ? submissions : [];
    } catch (error) {
      console.error('Erro ao buscar submissões:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Submission | null> {
    try {
      const response = await authenticatedFetch<{submission: Submission}>(`/api/submissions/${id}`);
      
      const submission = response.data.submission;
      if (!submission) return null;
      
      return submission;
    } catch (error) {
      console.error('❌ [submissionsApi.getById] Erro ao buscar submissão:', error);
      return null;
    }
  },

  async create(submissionData: CreateSubmissionRequest): Promise<Submission> {
    try {
      const response = await authenticatedFetch<{submission: Submission}>('/api/submissions', {
        method: 'POST',
        body: JSON.stringify(submissionData),
      });
      return response.data.submission;
    } catch (error) {
      console.error('Erro ao criar submissão:', error);
      throw error;
    }
  },

  async getQuestionSubmissions(questionId: string, listId: string): Promise<Submission[]> {
    try {
      return await this.getSubmissions({ questionId, listId });
    } catch (error) {
      console.error('Erro ao buscar submissões da questão:', error);
      return [];
    }
  },

  async getUserSubmissions(userId: string, limit: number = 10): Promise<Submission[]> {
    try {
      return await this.getSubmissions({ userId, limit });
    } catch (error) {
      console.error('Erro ao buscar submissões do usuário:', error);
      return [];
    }
  }
};
