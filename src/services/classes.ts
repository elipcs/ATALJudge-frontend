import { Class, Student } from '../types';
import { authenticatedFetch } from '../config/api';

export const classesApi = {
  async getAll(): Promise<Class[]> {
    try {
      const response = await authenticatedFetch<Class[]>('/api/classes');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('❌ [classesApi.getAll] Erro ao buscar turmas:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Class | null> {
    try {
      const response = await authenticatedFetch<{ class: Class }>(`/api/classes/${id}`);
      return response.data.class || null;
    } catch (error) {
      console.error('Erro ao buscar turma:', error);
      return null;
    }
  },

  async getUserClasses(userId: string, userRole: string): Promise<Class[]> {
    try {
      const allClasses = await this.getAll();
      if (userRole === 'student') {
        const studentClasses = allClasses.filter((cls: Class) => 
          cls.students && cls.students.some(student => student.id === userId)
        );
        return studentClasses;
      } else {
        return allClasses;
      }
    } catch (error) {
      console.error('Erro ao buscar turmas do usuário:', error);
      throw error;
    }
  },

  async create(data: {
    name: string;
    professorId: string;
    professorName: string;
  }): Promise<Class> {
    try {
      const response = await authenticatedFetch<{ class: Class }>('/api/classes', {
        method: 'POST',
        body: JSON.stringify({
          nome: data.name,
          professor_id: data.professorId
        }),
      });

      return response.data.class;
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      throw error;
    }
  },

  async update(id: string, data: { name: string }): Promise<Class> {
    try {
      const response = await authenticatedFetch<{ class: Class }>(`/api/classes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: data.name
        }),
      });

      return response.data.class;
    } catch (error) {
      console.error('Erro ao atualizar turma:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await authenticatedFetch(`/api/classes/${id}`, {
        method: 'DELETE',
      });

      return true;
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      throw error;
    }
  },

  async getClassStudents(classId: string): Promise<Student[]> {
    try {
      const response = await authenticatedFetch<{ students: { students: Student[] } }>(`/api/classes/${classId}/students`);
      return response.data.students?.students || [];
    } catch (error) {
      console.error('Erro ao buscar alunos da turma:', error);
      throw error;
    }
  },

};
