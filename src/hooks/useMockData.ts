import { useMemo } from 'react';

import { mockDataApi } from '../services/mockData';
import { User, Class, Student, Professor, Submission, Invite, SystemNotice } from '../types';

export const useMockData = () => {
  const data = useMemo(() => ({
    submissions: mockDataApi.submissions() as Submission[],
    users: mockDataApi.users() as User[],
    questionLists: mockDataApi.questionLists(),
    classes: mockDataApi.classes() as Class[],
    students: mockDataApi.students() as Student[],
    professors: mockDataApi.professors() as Professor[],
    inviteTokens: mockDataApi.inviteTokens() as Invite[],
    systemNotices: mockDataApi.systemNotices() as SystemNotice[],
  }), []);

  return data;
};

export const useUserData = (userRole: string): User => {
  return useMemo(() => {
    const mockUsers = mockDataApi.users();
    
    const getUserNameByRole = (role: string): string => {
      const user = mockUsers.find((user: User) => user.role === role);
      return user?.name || (role === 'professor' ? 'Professor' : role === 'assistant' ? 'Monitor' : 'Aluno');
    };

    const getUserEmailByRole = (role: string): string => {
      const user = mockUsers.find((user: User) => user.role === role);
      return user?.email || `${role}@email.com`;
    };

    // Se estamos no servidor, retornar dados básicos
    if (typeof window === 'undefined') {
      const normalizedRole = userRole === 'aluno' ? 'student' : userRole;
      return {
        id: `${normalizedRole}_1`,
        name: getUserNameByRole(normalizedRole),
        email: getUserEmailByRole(normalizedRole),
        role: normalizedRole
      };
    }

    try {
      // Método 1: Verificar token JWT (produção)
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return {
            id: payload.userId || `${userRole}_1`,
            name: payload.name || getUserNameByRole(userRole),
            email: payload.email || getUserEmailByRole(userRole),
            role: userRole
          };
        } catch (jwtError) {
          console.error('Erro ao decodificar token:', jwtError);
        }
      }

      // Método 2: Fallback para dados mocados baseados no tipo
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');

      const normalizedRole = userRole === 'aluno' ? 'student' : userRole;
      return {
        id: `${normalizedRole}_1`,
        name: userName || getUserNameByRole(normalizedRole),
        email: userEmail || getUserEmailByRole(normalizedRole),
        role: normalizedRole
      };

    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      const normalizedRole = userRole === 'aluno' ? 'student' : userRole;
      return {
        id: `${normalizedRole}_1`,
        name: getUserNameByRole(normalizedRole),
        email: getUserEmailByRole(normalizedRole),
        role: normalizedRole
      };
    }
  }, [userRole]);
};
