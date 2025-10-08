/**
 * Hook genérico para operações assíncronas
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAsyncDataOptions<T> {
  initialData?: T | null;
  immediate?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: T) => void;
  timeoutMs?: number;
}

interface UseAsyncDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: unknown[]) => Promise<void>;
  reset: () => void;
}

/**
 * Hook genérico para operações assíncronas
 * @param asyncFunction - Função assíncrona para executar
 * @param options - Opções de configuração
 * @returns Estado e funções para gerenciar a operação assíncrona
 */
export function useAsyncData<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T> {
  const {
    initialData = null,
    immediate = true,
    onError,
    onSuccess,
    timeoutMs
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cache e debouncing
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isExecutingRef = useRef(false);
  const lastFunctionRef = useRef<Function | null>(null);

  const execute = useCallback(async (...args: unknown[]) => {
    // Evitar execuções simultâneas
    if (isExecutingRef.current) {
      return;
    }

    // Verificar se a função mudou
    if (lastFunctionRef.current === asyncFunction) {
      // Se a função não mudou e já temos dados, não executar novamente
      if (data !== null && !loading) {
        return;
      }
    }
    lastFunctionRef.current = asyncFunction;

    // Criar chave de cache baseada nos argumentos
    const cacheKey = JSON.stringify(args);
    const now = Date.now();
    const CACHE_DURATION = 30000; // 30 segundos

    // Verificar cache
    const cached = cacheRef.current.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setData(cached.data);
      onSuccess?.(cached.data);
      return;
    }

    // Debouncing - cancelar execução anterior se houver
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Executar com debounce de 500ms para maior estabilidade
    debounceRef.current = setTimeout(async () => {
      try {
        isExecutingRef.current = true;
        setLoading(true);
        setError(null);
        
        // Executar função assíncrona
        let result: T;
        if (timeoutMs) {
          // Timeout de segurança para evitar loading infinito
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout: Operação demorou muito para responder')), timeoutMs);
          });
          
          result = await Promise.race([
            asyncFunction(...args),
            timeoutPromise
          ]) as T;
        } else {
          // Sem timeout - execução direta
          result = await asyncFunction(...args);
        }
        
        // Salvar no cache
        cacheRef.current.set(cacheKey, { data: result, timestamp: now });
        
        setData(result);
        onSuccess?.(result);
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
                setError(errorMessage);
                onError?.(err instanceof Error ? err : new Error(errorMessage));
                
                // Se for erro de autenticação, não tentar novamente
                if (errorMessage.includes('Token expirado') || errorMessage.includes('Não autorizado') || errorMessage.includes('401')) {
                  return;
                }
      } finally {
        setLoading(false);
        isExecutingRef.current = false;
      }
    }, 300);
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
    
    // Limpar cache e debounce
    cacheRef.current.clear();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    isExecutingRef.current = false;
    lastFunctionRef.current = null;
  }, [initialData]);

  useEffect(() => {
    if (immediate) {
      // console.log('useAsyncData: executando imediatamente');
      execute();
    }
    
    // Cleanup
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [immediate]); // Removido execute das dependências para evitar loop

  // Remover log excessivo para evitar spam no console
  // console.log('useAsyncData: retornando estado:', { data, loading, error });
  
  return {
    data,
    loading,
    error,
    execute,
    reset
  };
}

/**
 * Hook especializado para fetch de dados com dependências
 * @param fetchFunction - Função para buscar dados
 * @param dependencies - Array de dependências para re-executar
 * @param options - Opções adicionais
 */
export function useFetch<T>(
  fetchFunction: (...args: unknown[]) => Promise<T>,
  dependencies: unknown[] = [],
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T> {
  const asyncData = useAsyncData(fetchFunction, { ...options, immediate: false });

  useEffect(() => {
    asyncData.execute(...dependencies);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]); // Removido asyncData.execute das dependências

  return asyncData;
}

