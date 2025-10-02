import { User, Class, Student, Submission, QuestionList, SystemNotice } from '../types';
import { authenticatedFetch } from '../config/api';

// API de Home para Estudantes
export const studentHomeApi = {
  // Buscar dados do estudante
  async getStudentData(): Promise<{
    currentClass: {
      id: string;
      name: string;
      professorId: string;
      professorName: string;
    };
    availableLists: QuestionList[];
    classParticipants: Student[];
  }> {
    try {
      const response = await authenticatedFetch<{
        currentClass: {
          id: string;
          name: string;
          professorId: string;
          professorName: string;
        };
        availableLists: QuestionList[];
        classParticipants: Student[];
      }>('/api/home/student');

      if (!response.success) {
        throw new Error('Erro ao buscar dados do estudante');
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do estudante:', error);
      throw error;
    }
  },

  // Buscar submissões do estudante
  async getStudentSubmissions(userId: string, limit: number = 5): Promise<Submission[]> {
    try {
      const response = await authenticatedFetch<{ submissions: Submission[] }>(`/api/home/student/submissions?userId=${userId}&limit=${limit}`);

      if (!response.success) {
        throw new Error('Erro ao buscar submissões do estudante');
      }

      return response.data.submissions || [];
    } catch (error) {
      console.error('Erro ao buscar submissões do estudante:', error);
      return [];
    }
  }
};

// API de Home para Staff (Professores e Assistentes)
export const staffHomeApi = {
  // Buscar dados do staff
  async getStaffData(): Promise<{
    classes: Class[];
    students: Student[];
    submissions: Submission[];
    systemNotices: SystemNotice[];
  }> {
    try {
      const response = await authenticatedFetch<{
        classes: Class[];
        students: Student[];
        submissions: Submission[];
        systemNotices: SystemNotice[];
      }>('/api/home/staff');

      if (!response.success) {
        throw new Error('Erro ao buscar dados do staff');
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do staff:', error);
      throw error;
    }
  },

  // Buscar estatísticas gerais
  async getStatistics(): Promise<{
    totalStudents: number;
    totalClasses: number;
    totalSubmissions: number;
    recentSubmissions: Submission[];
  }> {
    try {
      const response = await authenticatedFetch<{
        totalStudents: number;
        totalClasses: number;
        totalSubmissions: number;
        recentSubmissions: Submission[];
      }>('/api/home/staff/statistics');

      if (!response.success) {
        throw new Error('Erro ao buscar estatísticas');
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  },

  // Buscar avisos do sistema
  async getSystemNotices(): Promise<SystemNotice[]> {
    try {
      const response = await authenticatedFetch<{ notices: SystemNotice[] }>('/api/home/staff/notices');

      if (!response.success) {
        throw new Error('Erro ao buscar avisos do sistema');
      }

      return response.data.notices || [];
    } catch (error) {
      console.error('Erro ao buscar avisos do sistema:', error);
      return [];
    }
  },

  // Buscar listas ativas
  async getActiveLists(): Promise<QuestionList[]> {
    try {
      const response = await authenticatedFetch<{ lists: QuestionList[] }>('/api/home/staff/lists');

      if (!response.success) {
        throw new Error('Erro ao buscar listas ativas');
      }

      return response.data.lists || [];
    } catch (error) {
      console.error('Erro ao buscar listas ativas:', error);
      return [];
    }
  }
};

// API de Usuários
export const userApi = {
  // Buscar dados do usuário atual
  async getCurrentUser(): Promise<User> {
    try {
      const response = await authenticatedFetch<User>('/api/home/user/current');

      if (!response.success) {
        throw new Error('Erro ao buscar dados do usuário');
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      throw error;
    }
  }
};