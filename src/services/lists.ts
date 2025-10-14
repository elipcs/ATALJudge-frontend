import { QuestionList } from '../types';
import { authenticatedFetch } from '../config/api';

export interface Class {
  id: string;
  name: string;
  active: boolean;
}

export interface CreateListRequest {
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  class_ids?: string[];
  status?: 'draft' | 'published';
  scoring_mode?: 'simple' | 'groups';
  max_score?: number;
  min_questions_for_max_score?: number;
  question_groups?: Array<{
    id: string;
    name: string;
    question_ids: string[];
    percentage?: number;
  }>;
}

export interface ListFilters {
  search?: string;
  classId?: string;
  status?: 'all' | 'draft' | 'published';
}


export const listsApi = {
  async getLists(filters?: ListFilters, userRole?: string, currentUser?: any): Promise<QuestionList[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.classId) queryParams.append('class_id', filters.classId);
        if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
      }
      
      if (userRole === 'student' && currentUser?.classId) {
        queryParams.append('class_id', currentUser.classId);
      }
      
      const queryString = queryParams.toString();
      const endpoint = `/api/lists${queryString ? `?${queryString}` : ''}`;
      
      const response = await authenticatedFetch<{data: {count: number, lists: QuestionList[]}}>(endpoint);
      
      const data = response.data.data;
      const lists = data?.lists || [];
      
      const mappedLists = lists.map((list: any) => ({
  ...list,
  startDate: list.startDate || list.start_date || list.start_time || list.startTime,
  endDate: list.endDate || list.end_date || list.end_time || list.endTime,
  createdAt: list.createdAt || list.created_at,
  updatedAt: list.updatedAt || list.updated_at,
  classIds: list.classIds || list.class_ids || list.classes || [],
  questions: Array(list.question_count || 0).fill(null),
  status: list.status || 'draft'
      }));
      
      const result = Array.isArray(mappedLists) ? mappedLists : [];
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar listas:', error);
      return [];
    }
  },

  async getById(id: string): Promise<QuestionList | null> {
    try {
      console.log('🔍 [listsApi.getById] Buscando lista com ID:', id);
      
  const response = await authenticatedFetch<{ list: any }>(`/api/lists/${id}`);
      
  console.log('📦 [listsApi.getById] Resposta recebida');
      
  const list = response.data.list;
      
  console.log('🔍 [listsApi.getById] list extraída:', typeof list, list?.id);
      
      if (!list) {
        console.log('❌ [listsApi.getById] Lista não encontrada na resposta');
        console.log('❌ [listsApi.getById] Estrutura completa da resposta:', JSON.stringify(response, null, 2));
        return null;
      }
      
      const listAny = list as any;
      console.log('🔍 [listsApi.getById] Dados da lista antes do mapeamento:');
      console.log('  - listAny.questions:', listAny.questions);
      console.log('  - listAny.questions type:', typeof listAny.questions);
      console.log('  - listAny.questions length:', listAny.questions?.length);
      console.log('  - listAny.questions isArray:', Array.isArray(listAny.questions));
      console.log('  - listAny.questions:', listAny.questions);
      console.log('  - listAny.questions type:', typeof listAny.questions);
      console.log('  - listAny.questions length:', listAny.questions?.length);
      console.log('  - listAny.questions isArray:', Array.isArray(listAny.questions));
      
      // Mapear question_groups do backend (snake_case) para questionGroups (camelCase)
      const questionGroups = (listAny.question_groups || listAny.questionGroups || []).map((group: any) => ({
        id: group.id,
        name: group.name,
        questionIds: group.question_ids || group.questionIds || [],
        weight: group.weight,
        percentage: group.percentage
      }));

      const mappedList = {
  ...list,
  startDate: listAny.startDate || listAny.start_date || listAny.start_time || listAny.startTime,
  endDate: listAny.endDate || listAny.end_date || listAny.end_time || listAny.endTime,
  createdAt: listAny.createdAt || listAny.created_at,
  updatedAt: listAny.updatedAt || listAny.updated_at,
  classIds: listAny.classIds || listAny.class_ids || listAny.classes || [],
  questions: listAny.questions_detail || listAny.questions || [],
  status: listAny.status || 'draft',
  scoringMode: listAny.scoring_mode || listAny.scoringMode || 'simple',
  maxScore: listAny.max_score || listAny.maxScore || 10,
  minQuestionsForMaxScore: listAny.min_questions_for_max_score || listAny.minQuestionsForMaxScore,
  questionGroups: questionGroups
      };
      
      return mappedList;

    } catch (error) {
      console.error('❌ [listsApi.getById] Erro ao buscar lista:', error);
      return null;
    }
  },

  async create(listData: CreateListRequest): Promise<QuestionList> {
    try {
      const response = await authenticatedFetch<{list: QuestionList}>('/api/lists', {
        method: 'POST',
        body: JSON.stringify(listData),
      });
      return response.data.list;
    } catch (error) {
      console.error('Erro ao criar lista:', error);
      throw error;
    }
  },

  async update(id: string, listData: CreateListRequest): Promise<QuestionList> {
    try {
      const response = await authenticatedFetch<{list: QuestionList}>(`/api/lists/${id}`, {
        method: 'PUT',
        body: JSON.stringify(listData),
      });
      return response.data.list;
    } catch (error) {
      console.error('Erro ao atualizar lista:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await authenticatedFetch(`/api/lists/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Erro ao excluir lista:', error);
      throw error;
    }
  },

  async duplicateList(id: string, newTitle?: string): Promise<QuestionList> {
    try {
      const originalList = await this.getById(id);
      if (!originalList) {
        throw new Error('Lista não encontrada');
      }

      const title = newTitle || `${originalList.title} (Cópia)`;
      return await this.duplicateListWithTitle(id, title);
    } catch (error) {
      console.error('Erro ao duplicar lista:', error);
      throw error;
    }
  },


  async publishList(id: string): Promise<QuestionList> {
    try {
      
      const response = await authenticatedFetch<{list: QuestionList}>(`/api/lists/${id}/publish`, {
        method: 'POST',
      });
      
      return response.data.list;
    } catch (error) {
      throw error;
    }
  },

  async unpublishList(id: string): Promise<QuestionList> {
    try {
      const response = await authenticatedFetch<{list: QuestionList}>(`/api/lists/${id}/unpublish`, {
        method: 'POST',
      });
      
      return response.data.list;
    } catch (error) {
      console.error('❌ [listsApi.unpublishList] Erro ao despublicar lista:', error);
      throw error;
    }
  },

  async addQuestionToList(listId: string, questionId: string): Promise<void> {
    try {
      await authenticatedFetch(`/api/lists/${listId}/questions`, {
        method: 'POST',
        body: JSON.stringify({ question_id: questionId }),
      });
    } catch (error) {
      console.error('❌ [listsApi.addQuestionToList] Erro ao adicionar questão:', error);
      throw error;
    }
  },

  async removeQuestionFromList(listId: string, questionId: string): Promise<void> {
    try {
      await authenticatedFetch(`/api/lists/${listId}/questions/${questionId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('❌ [listsApi.removeQuestionFromList] Erro ao remover questão:', error);
      throw error;
    }
  },


  async duplicateListWithTitle(id: string, newTitle: string): Promise<QuestionList> {
    try {
      const response = await authenticatedFetch<{list: QuestionList}>(`/api/lists/${id}/duplicate`, {
        method: 'POST',
        body: JSON.stringify({ title: newTitle }),
      });
      
      return response.data.list;
    } catch (error) {
      console.error('❌ [listsApi.duplicateListWithTitle] Erro ao duplicar lista:', error);
      throw error;
    }
  },

  async getListScore(listId: string): Promise<any> {
    try {
      const response = await authenticatedFetch<any>(`/api/lists/${listId}/score`);
      return response.data;
    } catch (error) {
      console.error('❌ [listsApi.getListScore] Erro ao buscar pontuação:', error);
      throw error;
    }
  }
};
