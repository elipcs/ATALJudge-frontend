import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getToken, getRefreshToken, isTokenExpired, refreshAccessToken } from "@/services/auth";

export function useAuthGuard(timeoutMs: number = 10000) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Criar timeout para verificação de autenticação
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: Verificação de autenticação demorou muito'));
        }, timeoutMs);
      });

      const authPromise = async (): Promise<boolean> => {
        const token = getToken();
        const refreshToken = getRefreshToken();

        // Se não há token nem refresh token, redirecionar para login
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
            } else {
              // Não há refresh token, redirecionar para login
              return false;
            }
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
      };

      try {
        // Executar verificação com timeout
        const isAuthenticated = await Promise.race([authPromise(), timeoutPromise]);
        
        if (!isAuthenticated) {
          router.replace("/login");
          return;
        }

        setIsChecking(false);
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        // Em caso de timeout ou erro, redirecionar para login
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router, timeoutMs]);

  return { isChecking };
}
