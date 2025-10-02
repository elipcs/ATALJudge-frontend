import { getToken, getRefreshToken, isTokenExpired, refreshAccessToken } from "@/services/auth";

import { useAsyncData } from "./useAsyncData";

export function useAuth(timeoutMs: number = 10000) {
  const { data: isAuthenticated, loading: isLoading } = useAsyncData(
    async () => {
      const token = getToken();
      const refreshToken = getRefreshToken();

      // Se não há token nem refresh token, usuário não está logado
      if (!token && !refreshToken) {
        return false;
      }

      // Se há token, verificar se está expirado
      if (token) {
        if (isTokenExpired(token)) {
          // Token expirado, tentar renovar com refresh token
          if (refreshToken) {
            const newToken = await refreshAccessToken();
            return !!newToken;
          }
          return false;
        } else {
          // Token válido
          return true;
        }
      } else if (refreshToken) {
        // Só há refresh token, tentar renovar
        const newToken = await refreshAccessToken();
        return !!newToken;
      }

      return false;
    },
    { immediate: true, timeoutMs }
  );

  return { isAuthenticated: isAuthenticated ?? null, isLoading };
}
