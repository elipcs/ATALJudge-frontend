import { API } from '../config/api';
import { QuestionResponseDTO } from '@/types/dtos';

export interface CreateQuestionRequest {
  title: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
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
  questionListId?: string;
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {
  id: string;
}

export const questionsApi = {
  async getAll(): Promise<QuestionResponseDTO[]> {
    try {
      const { data } = await API.questions.list();
      return data.questions || [];
    } catch (error) {
      console.error('Erro ao buscar questões:', error);
      return [];
    }
  },

  async getById(id: string): Promise<QuestionResponseDTO | null> {
    try {
      const { data } = await API.questions.get(id);
      return data || null;
    } catch (error) {
      console.error('❌ [questionsApi.getById] Erro ao buscar questão:', error);
      return null;
    }
  },

  async create(questionData: CreateQuestionRequest): Promise<QuestionResponseDTO> {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(questionData).filter(([_, value]) => value !== undefined)
      ) as CreateQuestionRequest;
      const { data } = await API.questions.create(cleanData);
      if (!data || !data.id) throw new Error('Questão não foi criada corretamente');
      return data;
    } catch (error) {
      console.error('Erro ao criar questão:', error);
      throw error;
    }
  },

  async update(id: string, questionData: Partial<CreateQuestionRequest>): Promise<QuestionResponseDTO> {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(questionData).filter(([_, value]) => value !== undefined)
      );
      const { data } = await API.questions.update(id, cleanData);
      return data;
    } catch (error) {
      console.error('Erro ao atualizar questão:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await API.questions.delete(id);
      return true;
    } catch (error) {
      console.error('Erro ao deletar questão:', error);
      throw error;
    }
  },
};
