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
  startDate: string;
  endDate: string;
  classIds: string[];
}

export interface UpdateListRequest {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: 'draft' | 'published';
}

export interface ListFilters {
  search?: string;
  classId?: string;
  status?: 'all' | 'draft' | 'published';
}

export interface ListStats {
  total: number;
  published: number;
  draft: number;
}

export const listsApi = {
  async getLists(filters?: ListFilters, userRole?: string): Promise<QuestionList[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.classId) queryParams.append('classId', filters.classId);
        if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
      }
      
      const queryString = queryParams.toString();
      const endpoint = `/api/lists${queryString ? `?${queryString}` : ''}`;
      
      const response = await authenticatedFetch<QuestionList[]>(endpoint);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar listas:', error);
      return [];
    }
  },

  async getById(id: string): Promise<QuestionList | null> {
    try {
      const response = await authenticatedFetch<QuestionList>(`/api/lists/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar lista:', error);
      return null;
    }
  },

  async create(listData: CreateListRequest): Promise<QuestionList> {
    try {
      const response = await authenticatedFetch<QuestionList>('/api/lists', {
        method: 'POST',
        body: JSON.stringify(listData),
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar lista:', error);
      throw error;
    }
  },

  async update(id: string, listData: UpdateListRequest): Promise<QuestionList> {
    try {
      const response = await authenticatedFetch<QuestionList>(`/api/lists/${id}`, {
        method: 'PUT',
        body: JSON.stringify(listData),
      });
      return response.data;
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

  async duplicateList(id: string): Promise<QuestionList> {
    try {
      const originalList = await this.getById(id);
      if (!originalList) {
        throw new Error('Lista não encontrada');
      }

      const duplicateData: CreateListRequest = {
        title: `${originalList.title} (Cópia)`,
        description: originalList.description,
        startDate: originalList.startDate,
        endDate: originalList.endDate,
        classIds: originalList.classIds,
      };

      return await this.create(duplicateData);
    } catch (error) {
      console.error('Erro ao duplicar lista:', error);
      throw error;
    }
  },

  async getStats(): Promise<ListStats> {
    try {
      const lists = await this.getLists();
      const listsArray = Array.isArray(lists) ? lists : [];
      const total = listsArray.length;
      const published = listsArray.filter(list => list.status === 'published').length;
      const draft = listsArray.filter(list => list.status === 'draft').length;

      return { total, published, draft };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { total: 0, published: 0, draft: 0 };
    }
  }
};
