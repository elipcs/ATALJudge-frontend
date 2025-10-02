import { studentHomeApi, staffHomeApi, userApi } from '../services/home';

import { useAsyncData } from './useAsyncData';

// Hook para dados do estudante
export const useStudentHomeData = () => {
  return useAsyncData(
    () => studentHomeApi.getStudentData(),
    { immediate: true }
  );
};

// Hook para dados do staff
export const useStaffHomeData = () => {
  return useAsyncData(
    () => staffHomeApi.getStaffData(),
    { immediate: true }
  );
};

// Hook para estatísticas
export const useStatistics = () => {
  return useAsyncData(
    () => staffHomeApi.getStatistics(),
    { immediate: true }
  );
};

// Hook para dados do usuário atual
export const useCurrentUser = () => {
  // Importar dinamicamente para evitar problemas de SSR
  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  const hasToken = getToken();
  
  const result = useAsyncData(
    () => userApi.getCurrentUser(),
    { immediate: !!hasToken } // Só executar se há token
  );
  
  // Log removido - problema resolvido
  
  return result;
};

// Hook para submissões do estudante
export const useStudentSubmissions = (userId: string, limit: number = 5) => {
  return useAsyncData(
    () => studentHomeApi.getStudentSubmissions(userId, limit),
    { immediate: true }
  );
};

// Hook para listas ativas
export const useActiveLists = () => {
  return useAsyncData(
    () => staffHomeApi.getActiveLists(),
    { immediate: true }
  );
};

// Hook para avisos do sistema
export const useSystemNotices = () => {
  return useAsyncData(
    () => staffHomeApi.getSystemNotices(),
    { immediate: true }
  );
};
