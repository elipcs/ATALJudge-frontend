// Serviço de API para turmas usando dados reais do backend
import { Class, Student } from '../types';
import { authenticatedFetch } from '../config/api';

// API de Turmas
export const classesApi = {
  // Buscar todas as turmas
  async getAll(): Promise<Class[]> {
    try {
      const response = await authenticatedFetch<Class[]>('/api/classes');

      if (!response.success) {
        throw new Error('Erro ao buscar turmas');
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      throw error;
    }
  },

  // Buscar turma por ID
  async getById(id: string): Promise<Class | null> {
    try {
      const response = await authenticatedFetch<Class>(`/api/classes/${id}`);

      if (!response.success) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar turma:', error);
      throw error;
    }
  },

  // Buscar turmas do usuário (baseado no role)
  async getUserClasses(userId: string, userRole: string): Promise<Class[]> {
    try {
      const response = await authenticatedFetch<Class[]>('/api/classes');

      if (!response.success) {
        throw new Error('Erro ao buscar turmas do usuário');
      }

      const allClasses = response.data;
      
      if (userRole === 'student') {
        // Para alunos, retornar apenas a turma que eles estão matriculados
        // O backend já deve filtrar isso, mas vamos garantir
        const studentClasses = allClasses.filter((cls: Class) => 
          cls.students && cls.students.some(student => student.id === userId)
        );
        return studentClasses;
      } else {
        // Professor e Monitor veem todas as turmas
        return allClasses;
      }
    } catch (error) {
      console.error('Erro ao buscar turmas do usuário:', error);
      throw error;
    }
  },

  // Criar nova turma
  async create(data: {
    name: string;
    professorId: string;
    professorName: string;
  }): Promise<Class> {
    try {
      const response = await authenticatedFetch<Class>('/api/classes', {
        method: 'POST',
        body: JSON.stringify({
          nome: data.name,
          professor_id: data.professorId
        }),
      });

      if (!response.success) {
        throw new Error(response.error || 'Erro ao criar turma');
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      throw error;
    }
  },

  // Excluir turma
  async delete(id: string): Promise<boolean> {
    try {
      const response = await authenticatedFetch(`/api/classes/${id}`, {
        method: 'DELETE',
      });

      if (!response.success) {
        throw new Error(response.error || 'Erro ao excluir turma');
      }

      return true;
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      throw error;
    }
  },

  // Buscar alunos de uma turma
  async getClassStudents(classId: string): Promise<Student[]> {
    try {
      const response = await authenticatedFetch<Student[]>(`/api/classes/${classId}/students`);

      if (!response.success) {
        return [];
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar alunos da turma:', error);
      throw error;
    }
  },

};
