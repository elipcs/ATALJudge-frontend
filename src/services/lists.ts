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
  startTime?: string;
  endTime?: string;
  classIds?: string[];
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

export async function isCurrentIpAllowedForList(listId?: string): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;
    const { data } = await API.config.checkAllowedIp(listId);
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
      const lists = data.lists as QuestionListResponseDTO[];

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
          questions: [],
          isRestricted: list.isRestricted,
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
        startTime: originalList.startDate,
        endTime: originalList.endDate,
        classIds: originalList.classIds,
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

      const newList = await this.create(newListData);

      if (originalList.questions && originalList.questions.length > 0) {
        for (const question of originalList.questions) {
          if (question && (question as any).id) {
            await this.addQuestionToList(newList.id, (question as any).id);
          }
        }
      }

      return newList;
    } catch (error) {
      logger.error('Erro ao duplicar lista', { error });
      throw error;
    }
  },

  async addQuestionToList(listId: string, questionId: string): Promise<void> {
    try {
      await API.lists.addQuestion(listId, questionId);
    } catch (error) {
      logger.error('[listsApi.addQuestionToList] Erro ao adicionar questão', { error });
      throw error;
    }
  },

  async removeQuestionFromList(listId: string, questionId: string): Promise<void> {
    try {
      await API.lists.removeQuestion(listId, questionId);
    } catch (error) {
      logger.error('[listsApi.removeQuestionFromList] Erro ao remover questão', { error });
      throw error;
    }
  },
};
