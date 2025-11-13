import { QuestionList } from '../types';
import { API } from '../config/api';
import { logger } from '../utils/logger';
import { QuestionListResponseDTO } from '@/types/dtos';

function calculateListStatus(startDate?: string, endDate?: string): 'scheduled' | 'open' | 'closed' {
  const now = new Date();

  if (!startDate && !endDate) {
    return 'open';
  }

  if (startDate) {
    const start = new Date(startDate);
    if (now < start) {
      return 'scheduled';
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    if (now > end) {
      return 'closed';
    }
  }

  return 'open';
}

export interface CreateListRequest {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  classIds?: string[];
  countTowardScore?: boolean;
  isRestricted?: boolean;
  scoringMode?: 'simple' | 'groups';
  maxScore?: number;
  minQuestionsForMaxScore?: number;
  questionGroups?: Array<{
    id: string;
    name: string;
    questionIds: string[];
    percentage?: number;
  }>;
}

export interface UpdateListScoringRequest {
  scoringMode?: 'simple' | 'groups';
  maxScore?: number;
  minQuestionsForMaxScore?: number;
  questionGroups?: Array<{
    id: string;
    name: string;
    questionIds: string[];
    percentage?: number;
  }>;
}

export interface ListFilters {
  search?: string;
  classId?: string;
}

export async function isCurrentIpAllowedForList(questionListId?: string): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;
    const { data } = await API.config.checkAllowedIp(questionListId);
    return Boolean((data as any).allowed ?? data);
  } catch {
    return false;
  }
}

export const listsApi = {
  async getLists(filters?: ListFilters, userRole?: string, currentUser?: { classId?: string }): Promise<QuestionList[]> {
    try {
      const queryParams: Record<string, string> = {};
      if (filters?.search) queryParams.search = filters.search;
      if (filters?.classId) queryParams.classId = filters.classId;
      if (userRole === 'student' && currentUser?.classId) queryParams.classId = currentUser.classId;

      const { data } = await API.lists.list(queryParams);
      const lists = data.questionLists as QuestionListResponseDTO[];

      const mappedLists: QuestionList[] = (lists || []).map((list) => {
        const startDate = list.startDate;
        const endDate = list.endDate;
        return {
          id: list.id,
          title: list.title,
          description: list.description,
          startDate,
          endDate,
          createdAt: String(list.createdAt),
          updatedAt: String(list.updatedAt),
          classIds: list.classIds || [],
          questions: (list.questions as any) || [],
          questionCount: list.questionCount || (list.questions as any)?.length || 0,
          isRestricted: list.isRestricted,
          countTowardScore: list.countTowardScore ?? false,
          scoringMode: list.scoringMode,
          maxScore: list.maxScore,
          minQuestionsForMaxScore: list.minQuestionsForMaxScore,
          questionGroups: (list.questionGroups as any) || [],
          calculatedStatus: calculateListStatus(startDate, endDate)
        };
      });

      return mappedLists;
    } catch (error) {
      logger.error('Erro ao buscar listas', { error });
      return [];
    }
  },

  async getById(id: string): Promise<QuestionList | null> {
    try {
      const { data: list } = await API.lists.get(id);
      if (!list) return null;

      const startDate = list.startDate || undefined;
      const endDate = list.endDate || undefined;

      const mapped: QuestionList = {
        id: list.id,
        title: list.title,
        description: list.description,
        startDate,
        endDate,
        createdAt: String(list.createdAt),
        updatedAt: String(list.updatedAt),
        classIds: list.classIds || [],
        questions: (list.questions as any) || [],
        scoringMode: list.scoringMode || 'simple',
        maxScore: list.maxScore || 10,
        minQuestionsForMaxScore: list.minQuestionsForMaxScore,
        questionGroups: (list.questionGroups as any) || [],
        isRestricted: list.isRestricted ?? false,
        countTowardScore: list.countTowardScore ?? false,
        calculatedStatus: calculateListStatus(startDate, endDate)
      };

      return mapped;
    } catch (error) {
      logger.error('[listsApi.getById] Erro ao buscar lista', { error });
      return null;
    }
  },

  async create(listData: CreateListRequest): Promise<QuestionList> {
    try {
      const { data } = await API.lists.create(listData);
      return await this.getById(data.id) as QuestionList;
    } catch (error) {
      logger.error('Erro ao criar lista', { error });
      throw error;
    }
  },

  async update(id: string, listData: CreateListRequest): Promise<QuestionList> {
    try {
      const { data } = await API.lists.update(id, listData);
      return await this.getById(data.id) as QuestionList;
    } catch (error) {
      logger.error('Erro ao atualizar lista', { error });
      throw error;
    }
  },

  async updateScoring(id: string, scoringData: UpdateListScoringRequest): Promise<QuestionList> {
    try {
      const { data } = await API.lists.updateScoring(id, scoringData);
      return await this.getById(data.id) as QuestionList;
    } catch (error) {
      logger.error('Erro ao atualizar pontuação da lista', { error });
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await API.lists.delete(id);
      return true;
    } catch (error) {
      logger.error('Erro ao excluir lista', { error });
      throw error;
    }
  },

  async duplicateList(id: string, newTitle?: string): Promise<QuestionList> {
    try {
      const originalList = await this.getById(id);
      if (!originalList) throw new Error('Lista não encontrada');

      const title = newTitle || `${originalList.title} (Cópia)`;
      
      const newListData: CreateListRequest = {
        title,
        description: originalList.description,
        startDate: originalList.startDate,
        endDate: originalList.endDate,
        classIds: originalList.classIds,
        countTowardScore: (originalList as any).countTowardScore ?? false,
        isRestricted: (originalList as any).isRestricted ?? false
      };

      const newList = await this.create(newListData);

      if (originalList.scoringMode || originalList.maxScore || originalList.questionGroups) {
        const scoringData: UpdateListScoringRequest = {
          scoringMode: originalList.scoringMode,
          maxScore: originalList.maxScore,
          minQuestionsForMaxScore: originalList.minQuestionsForMaxScore,
          questionGroups: originalList.questionGroups?.map(group => ({
            id: group.id,
            name: group.name,
            questionIds: group.questionIds || [],
            percentage: group.percentage
          })),
        };
        await this.updateScoring(newList.id, scoringData);
      }

      if (originalList.questions && originalList.questions.length > 0) {
        for (const question of originalList.questions) {
          if (question && (question as any).id) {
            await this.addQuestionToList(newList.id, (question as any).id);
          }
        }
      }

      return await this.getById(newList.id) as QuestionList;
    } catch (error) {
      logger.error('Erro ao duplicar lista', { error });
      throw error;
    }
  },

  async addQuestionToList(questionListId: string, questionId: string): Promise<void> {
    try {
      await API.lists.addQuestion(questionListId, questionId);
    } catch (error) {
      logger.error('[listsApi.addQuestionToList] Erro ao adicionar questão', { error });
      throw error;
    }
  },

  async removeQuestionFromList(questionListId: string, questionId: string): Promise<void> {
    try {
      await API.lists.removeQuestion(questionListId, questionId);
    } catch (error) {
      logger.error('[listsApi.removeQuestionFromList] Erro ao remover questão', { error });
      throw error;
    }
  },
};
