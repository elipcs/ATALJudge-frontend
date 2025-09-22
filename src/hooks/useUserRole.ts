import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export type UserRole = 'student' | 'assistant' | 'professor';

interface UseUserRoleReturn {
  userRole: UserRole;
  isLoading: boolean;
  setUserRole: (role: UserRole) => void;
}

export function useUserRole(): UseUserRoleReturn {
  const pathname = usePathname();
  const [userRole, setUserRoleState] = useState<UserRole>('professor');
  const [isLoading, setIsLoading] = useState(true);

  const detectUserRole = (): UserRole => {
    // Método 0: Verificar se há um tipo definido manualmente (para testes)
    const manualUserRole = localStorage.getItem('manual-userRole');
    if (manualUserRole && ['student', 'assistant', 'professor'].includes(manualUserRole)) {
      return manualUserRole as UserRole;
    }

    // Método 1: Verificar token JWT
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role || payload.userRole;
        if (['student', 'assistant', 'professor'].includes(role)) {
          return role as UserRole;
        }
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
      }
    }

    // Método 2: Fallback para localStorage
    const savedUserRole = localStorage.getItem('userRole');
    if (savedUserRole && ['student', 'assistant', 'professor'].includes(savedUserRole)) {
      return savedUserRole as UserRole;
    }

    // Método 3: Verificar pela URL atual
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
  };

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    localStorage.setItem('userRole', role);
    // Para testes, também salvar como tipo manual
    localStorage.setItem('manual-userRole', role);
    
    // Disparar evento customizado para notificar outras páginas sobre a mudança
    window.dispatchEvent(new CustomEvent('userRoleChanged', { detail: role }));
  };

  useEffect(() => {
    const detectedUserRole = detectUserRole();
    setUserRoleState(detectedUserRole);
    setIsLoading(false);

    // Salvar no localStorage para próximas sessões
    localStorage.setItem('userRole', detectedUserRole);

    // Adicionar listener para mudanças de tipo de usuário
    const handleUserRoleChange = (event: CustomEvent) => {
      setUserRoleState(event.detail);
    };

    window.addEventListener('userRoleChanged', handleUserRoleChange as EventListener);
    
    // Também escutar mudanças no localStorage para sincronizar entre abas
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'manual-userRole' || event.key === 'userRole') {
        const newUserRole = detectUserRole();
        setUserRoleState(newUserRole);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('userRoleChanged', handleUserRoleChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname]);

  return {
    userRole,
    isLoading,
    setUserRole
  };
}