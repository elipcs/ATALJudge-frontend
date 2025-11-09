import { useState, useEffect, useCallback } from 'react';

import { listsApi, CreateListRequest, ListFilters, UpdateListScoringRequest } from '@/services/lists';
import { classesApi } from '@/services/classes';
import { QuestionList, Class } from '@/types';

interface UseListsDataReturn {
  lists: QuestionList[];
  classes: Class[];
  loading: boolean;
  error: string | null;
  refreshLists: () => Promise<void>;
  createList: (listData: CreateListRequest) => Promise<QuestionList>;
  updateList: (id: string, updates: CreateListRequest) => Promise<QuestionList>;
  updateListScoring: (id: string, scoringData: UpdateListScoringRequest) => Promise<QuestionList>;
  deleteList: (id: string) => Promise<void>;
  duplicateList: (id: string, newTitle?: string) => Promise<QuestionList>;
  addQuestionToList: (questionListId: string, questionId: string) => Promise<void>;
  removeQuestionFromList: (questionListId: string, questionId: string) => Promise<void>;
  filters: ListFilters;
  setFilters: (filters: ListFilters) => void;
  clearFilters: () => void;
}

export function useListsData(userRole?: string, currentUser?: any): UseListsDataReturn {
  const [lists, setLists] = useState<QuestionList[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ListFilters>({});

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [listsData, classesData] = await Promise.all([
        listsApi.getLists(filters, userRole, currentUser),
        classesApi.getAll().then(classes => Array.isArray(classes) ? classes : []).catch(err => {
          console.warn('⚠️ [useListsData] Erro ao carregar classes, continuando sem elas:', err);
          return [];
        })
      ]);

      const processedLists = Array.isArray(listsData) 
        ? listsData.filter(list => list && list.id)
        : [];
      const processedClasses = Array.isArray(classesData) ? classesData : [];

      setLists(processedLists);
      setClasses(processedClasses);
    } catch (err) {
      console.error('❌ [useListsData] Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [filters, userRole, currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSetFilters = useCallback((newFilters: ListFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const refreshLists = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const createList = useCallback(async (listData: CreateListRequest): Promise<QuestionList> => {
    try {
      setError(null);
      const newList = await listsApi.create(listData);
      
      setLists(prev => [newList, ...prev]);

      return newList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar lista';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateList = useCallback(async (id: string, updates: CreateListRequest): Promise<QuestionList> => {
    try {
      setError(null);
      const updatedList = await listsApi.update(id, updates);
      
      if (!updatedList || !updatedList.id) {
        throw new Error('Resposta inválida da API ao atualizar lista');
      }
      
      setLists(prev => prev.map(list => list.id === id ? updatedList : list));
      
      return updatedList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar lista';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateListScoring = useCallback(async (id: string, scoringData: any): Promise<QuestionList> => {
    try {
      setError(null);
      const updatedList = await listsApi.updateScoring(id, scoringData);
      
      if (!updatedList || !updatedList.id) {
        throw new Error('Resposta inválida da API ao atualizar pontuação');
      }
      
      setLists(prev => prev.map(list => list.id === id ? updatedList : list));
      
      return updatedList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar pontuação';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteList = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await listsApi.delete(id);
      
      setLists(prev => prev.filter(list => list.id !== id));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar lista';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const duplicateList = useCallback(async (id: string, newTitle?: string): Promise<QuestionList> => {
    try {
      setError(null);
      const duplicatedList = await listsApi.duplicateList(id, newTitle);
      
      setLists(prev => [duplicatedList, ...prev]);

      return duplicatedList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao duplicar lista';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const addQuestionToList = useCallback(async (questionListId: string, questionId: string): Promise<void> => {
    try {
      setError(null);
      await listsApi.addQuestionToList(questionListId, questionId);
      
      const updatedList = await listsApi.getById(questionListId);
      if (updatedList) {
        setLists(prev => prev.map(list => list.id === questionListId ? updatedList : list));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar questão à lista';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const removeQuestionFromList = useCallback(async (questionListId: string, questionId: string): Promise<void> => {
    try {
      setError(null);
      await listsApi.removeQuestionFromList(questionListId, questionId);
      
      const updatedList = await listsApi.getById(questionListId);
      if (updatedList) {
        setLists(prev => prev.map(list => list.id === questionListId ? updatedList : list));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover questão da lista';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    lists,
    classes,
    loading,
    error,
    refreshLists,
    createList,
    updateList,
    updateListScoring,
    deleteList,
    duplicateList,
    addQuestionToList,
    removeQuestionFromList,
    filters,
    setFilters: handleSetFilters,
    clearFilters
  };
}
