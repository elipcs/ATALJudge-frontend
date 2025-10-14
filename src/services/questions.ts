import { Question } from '../types';
import { authenticatedFetch } from '../config/api';

export interface CreateQuestionRequest {
  title: string;
  statement: string;
  input_format: string;
  output_format: string;
  constraints?: string;
  notes?: string;
  timeLimit: string;
  memoryLimit: string;
  tags: string[];
  examples: Array<{
    input: string;
    output: string;
  }>;
  referenceCode?: string;
  referenceLanguage?: 'python' | 'java';
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    isPublic: boolean;
  }>;
  listId?: string;
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {
  id: string;
}

export const questionsApi = {
  async getAll(): Promise<Question[]> {
    try {
  const response = await authenticatedFetch<{questions: Question[]}>('/api/questions');
  const questions = response.data.questions || [];
      
      return Array.isArray(questions) ? questions : [];
    } catch (error) {
      console.error('Erro ao buscar questões:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Question | null> {
    try {
  const response = await authenticatedFetch<{question: Question}>(`/api/questions/${id}`);
  const question = response.data.question;
      if (!question) return null;
      
      return question;
    } catch (error) {
      console.error('❌ [questionsApi.getById] Erro ao buscar questão:', error);
      return null;
    }
  },

  async create(questionData: CreateQuestionRequest): Promise<Question> {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(questionData).filter(([_, value]) => value !== undefined)
      ) as CreateQuestionRequest;
      
      console.log('🔍 [questionsApi.create] Dados originais:', questionData);
      console.log('🔍 [questionsApi.create] Dados limpos (sem undefined):', cleanData);
      
      const response = await authenticatedFetch<{question: Question}>('/api/questions', {
        method: 'POST',
        body: JSON.stringify(cleanData),
      });
      
      console.log('📦 [questionsApi.create] Resposta completa:', response);
      console.log('📦 [questionsApi.create] response.data:', response.data);
      console.log('📦 [questionsApi.create] response.data.question:', response.data.question);
      console.log('📦 [questionsApi.create] response.data.data:', (response.data as any).data);
      
  const question = response.data.question;
      
      console.log('📦 [questionsApi.create] Questão extraída:', question);
      
      if (!question) {
        console.error('❌ [questionsApi.create] Questão não encontrada na resposta:', response.data);
        throw new Error('Questão não foi retornada pela API');
      }
      
      return question;
    } catch (error) {
      console.error('❌ [questionsApi.create] Erro ao criar questão:', error);
      throw error;
    }
  },

  async update(id: string, questionData: Partial<CreateQuestionRequest>): Promise<Question> {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(questionData).filter(([_, value]) => value !== undefined)
      ) as Partial<CreateQuestionRequest>;
      
      console.log('🔍 [questionsApi.update] ID da questão:', id);
      console.log('🔍 [questionsApi.update] Dados originais:', questionData);
      console.log('🔍 [questionsApi.update] Dados limpos (sem undefined):', cleanData);
      console.log('🔍 [questionsApi.update] Dados stringificados:', JSON.stringify(cleanData, null, 2));
      
      const response = await authenticatedFetch<{question: Question}>(`/api/questions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cleanData),
      });
      
      console.log('✅ [questionsApi.update] Resposta completa:', response);
      console.log('✅ [questionsApi.update] response.data:', response.data);
      console.log('✅ [questionsApi.update] response.data.question:', response.data.question);
      
  const question = response.data.question;
      
      console.log('✅ [questionsApi.update] Questão extraída:', question);
      
      if (!question) {
        console.error('❌ [questionsApi.update] Questão não encontrada na resposta:', response.data);
        throw new Error('Questão não foi retornada pela API');
      }
      
      return question;
    } catch (error) {
      console.error('❌ [questionsApi.update] Erro ao atualizar questão:', error);
      console.error('❌ [questionsApi.update] ID:', id);
      console.error('❌ [questionsApi.update] Dados que causaram erro:', questionData);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as any;
        console.error('❌ [questionsApi.update] Status HTTP:', err.response?.status);
        console.error('❌ [questionsApi.update] Mensagem do servidor:', err.response?.data);
        console.error('❌ [questionsApi.update] Headers:', err.response?.headers);
      }
      
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await authenticatedFetch(`/api/questions/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Erro ao excluir questão:', error);
      throw error;
    }
  },

  async addToList(listId: string, questionId: string): Promise<void> {
    try {
      console.log('🔍 [questionsApi.addToList] Adicionando questão à lista:', { listId, questionId });
      
      const response = await authenticatedFetch(`/api/lists/${listId}/questions`, {
        method: 'POST',
        body: JSON.stringify({ question_id: questionId }),
      });
      
      console.log('✅ [questionsApi.addToList] Questão adicionada à lista com sucesso:', response);
    } catch (error) {
      console.error('❌ [questionsApi.addToList] Erro ao adicionar questão à lista:', error);
      throw error;
    }
  },

  async removeFromList(listId: string, questionId: string): Promise<void> {
    try {
      console.log('🔍 [questionsApi.removeFromList] Removendo questão da lista:', { listId, questionId });
      
      const response = await authenticatedFetch(`/api/lists/${listId}/questions/${questionId}`, {
        method: 'DELETE',
      });
      
      console.log('✅ [questionsApi.removeFromList] Questão removida da lista com sucesso:', response);
    } catch (error) {
      console.error('❌ [questionsApi.removeFromList] Erro ao remover questão da lista:', error);
      throw error;
    }
  },

  async generateTestCases(questionId: string, referenceCode: string, language: string): Promise<Array<{
    input: string;
    expectedOutput: string;
    isPublic: boolean;
  }>> {
    try {
      const response = await authenticatedFetch<{testCases: Array<{
        input: string;
        expectedOutput: string;
        isPublic: boolean;
      }>}>(`/api/questions/${questionId}/generate-test-cases`, {
        method: 'POST',
        body: JSON.stringify({ referenceCode, language }),
      });
      
      return response.data.testCases || [];
    } catch (error) {
      console.error('❌ [questionsApi.generateTestCases] Erro ao gerar casos de teste:', error);
      throw error;
    }
  }
};
