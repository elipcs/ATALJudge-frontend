import { useState, useEffect, useCallback } from 'react';

import { listsApi, QuestionList, Class, CreateListRequest, UpdateListRequest, ListFilters, ListStats } from '@/services/lists';

interface UseListsDataReturn {
  // Dados
  lists: QuestionList[];
  classes: Class[];
  stats: ListStats | null;
  
  // Estados
  loading: boolean;
  error: string | null;
  
  // Ações
  refreshLists: () => Promise<void>;
  createList: (listData: CreateListRequest) => Promise<QuestionList>;
  updateList: (id: string, updates: UpdateListRequest) => Promise<QuestionList>;
  deleteList: (id: string) => Promise<void>;
  duplicateList: (id: string) => Promise<QuestionList>;
  
  // Filtros
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

  // Carregar dados iniciais
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar dados em paralelo
      const [listsData, classesData, statsData] = await Promise.all([
        listsApi.getLists(filters, userRole),
        listsApi.getClasses(),
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

  // Carregar dados quando os filtros ou userRole mudarem
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Atualizar filtros
  const handleSetFilters = useCallback((newFilters: ListFilters) => {
    setFilters(newFilters);
  }, []);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Atualizar listas
  const refreshLists = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Criar nova lista
  const createList = useCallback(async (listData: CreateListRequest): Promise<QuestionList> => {
    try {
      setError(null);
      const newList = await listsApi.createList(listData);
      
      // Atualizar estado local
      setLists(prev => [newList, ...prev]);
      
      // Atualizar estatísticas
      const newStats = await listsApi.getStats();
      setStats(newStats);
      
      return newList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar lista';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Atualizar lista
  const updateList = useCallback(async (id: string, updates: UpdateListRequest): Promise<QuestionList> => {
    try {
      setError(null);
      const updatedList = await listsApi.updateList(id, updates);
      
      // Atualizar estado local
      setLists(prev => prev.map(list => list.id === id ? updatedList : list));
      
      return updatedList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar lista';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Deletar lista
  const deleteList = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await listsApi.deleteList(id);
      
      // Atualizar estado local
      setLists(prev => prev.filter(list => list.id !== id));
      
      // Atualizar estatísticas
      const newStats = await listsApi.getStats();
      setStats(newStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar lista';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Duplicar lista
  const duplicateList = useCallback(async (id: string): Promise<QuestionList> => {
    try {
      setError(null);
      const duplicatedList = await listsApi.duplicateList(id);
      
      // Atualizar estado local
      setLists(prev => [duplicatedList, ...prev]);
      
      // Atualizar estatísticas
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
    // Dados
    lists,
    classes,
    stats,
    
    // Estados
    loading,
    error,
    
    // Ações
    refreshLists,
    createList,
    updateList,
    deleteList,
    duplicateList,
    
    // Filtros
    filters,
    setFilters: handleSetFilters,
    clearFilters
  };
}
