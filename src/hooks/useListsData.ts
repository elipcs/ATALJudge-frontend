import { useState, useEffect, useCallback } from 'react';

import { listsApi, CreateListRequest, UpdateListRequest, ListFilters, ListStats } from '@/services/lists';
import { classesApi } from '@/services/classes';
import { QuestionList, Class } from '@/types';

interface UseListsDataReturn {
  lists: QuestionList[];
  classes: Class[];
  stats: ListStats | null;
  loading: boolean;
  error: string | null;
  refreshLists: () => Promise<void>;
  createList: (listData: CreateListRequest) => Promise<QuestionList>;
  updateList: (id: string, updates: UpdateListRequest) => Promise<QuestionList>;
  deleteList: (id: string) => Promise<void>;
  duplicateList: (id: string) => Promise<QuestionList>;
  filters: ListFilters;
  setFilters: (filters: ListFilters) => void;
  clearFilters: () => void;
}

export function useListsData(userRole?: string): UseListsDataReturn {
  const [lists, setLists] = useState<QuestionList[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState<ListStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ListFilters>({});

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [listsData, classesData, statsData] = await Promise.all([
        listsApi.getLists(filters, userRole),
        classesApi.getAll(),
        listsApi.getStats()
      ]);

      setLists(listsData);
      setClasses(classesData);
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [filters, userRole]);

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
      
      const newStats = await listsApi.getStats();
      setStats(newStats);
      
      return newList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar lista';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateList = useCallback(async (id: string, updates: UpdateListRequest): Promise<QuestionList> => {
    try {
      setError(null);
      const updatedList = await listsApi.update(id, updates);
      
      setLists(prev => prev.map(list => list.id === id ? updatedList : list));
      
      return updatedList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar lista';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteList = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await listsApi.delete(id);
      
      setLists(prev => prev.filter(list => list.id !== id));
      
      const newStats = await listsApi.getStats();
      setStats(newStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar lista';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const duplicateList = useCallback(async (id: string): Promise<QuestionList> => {
    try {
      setError(null);
      const duplicatedList = await listsApi.duplicateList(id);
      
      setLists(prev => [duplicatedList, ...prev]);
      
      const newStats = await listsApi.getStats();
      setStats(newStats);
      
      return duplicatedList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao duplicar lista';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    lists,
    classes,
    stats,
    loading,
    error,
    refreshLists,
    createList,
    updateList,
    deleteList,
    duplicateList,
    filters,
    setFilters: handleSetFilters,
    clearFilters
  };
}
