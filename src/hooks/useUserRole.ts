import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

import { UserRole } from '../types';
import { getToken, isTokenExpired, refreshAccessToken } from '../services/auth';

interface UseUserRoleReturn {
  userRole: UserRole;
  isLoading: boolean;
}

export function useUserRole(): UseUserRoleReturn {
  const pathname = usePathname();
  const [userRole, setUserRoleState] = useState<UserRole>('professor');
  const [isLoading, setIsLoading] = useState(true);

  const detectUserRole = useCallback(async (): Promise<UserRole> => {
    // Verificar se estamos no cliente antes de acessar localStorage
    if (typeof window === 'undefined') {
      return 'professor'; // Default para SSR
    }

    // Método 1: Verificar token JWT (prioridade principal)
    const token = getToken();
    if (token) {
      try {
        // Verificar se o token está expirado
        if (isTokenExpired(token)) {
          // Tentar renovar o token
          const newToken = await refreshAccessToken();
          if (newToken) {
            const payload = JSON.parse(atob(newToken.split('.')[1]));
            const role = payload.role || payload.userRole;
            if (['student', 'assistant', 'professor'].includes(role)) {
              return role as UserRole;
            }
          }
        } else {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const role = payload.role || payload.userRole;
          if (['student', 'assistant', 'professor'].includes(role)) {
            return role as UserRole;
          }
        }
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
      }
    }

    // Método 2: Fallback para localStorage (apenas se não houver token)
    const savedUserRole = localStorage.getItem('userRole');
    if (savedUserRole && ['student', 'assistant', 'professor'].includes(savedUserRole)) {
      return savedUserRole as UserRole;
    }

    // Método 3: Verificar pela URL atual (apenas como último recurso)
    if (pathname.includes('/professor/')) return 'professor';
    if (pathname.includes('/aluno/')) return 'student';
    if (pathname.includes('/monitor/')) return 'assistant';

    // Método 4: Verificar estrutura de pastas específicas
    if (pathname.startsWith('/home/')) return 'student'; // Estrutura /home/ geralmente para alunos
    if (pathname.startsWith('/convites')) {
      return 'professor'; // Esta rota é normalmente para professores
    }

    // Default para professor
    return 'professor';
  }, [pathname]);


  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const detectedUserRole = await detectUserRole();
        // Log removido - problema resolvido
        setUserRoleState(detectedUserRole);
        setIsLoading(false);

        // Salvar no localStorage para próximas sessões (apenas como fallback)
        localStorage.setItem('userRole', detectedUserRole);
      } catch (error) {
        console.error('Erro ao detectar role do usuário:', error);
        setUserRoleState('professor'); // Fallback
        setIsLoading(false);
      }
    };

    loadUserRole();
  }, [pathname, detectUserRole]);

  return {
    userRole,
    isLoading
  };
}