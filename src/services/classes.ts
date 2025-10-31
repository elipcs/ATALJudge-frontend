import { API } from '../config/api';
import { logger } from '../utils/logger';
import { ClassResponseDTO } from '@/types/dtos';
import { Class, Professor } from '@/types';

function mapClassDTO(dto: ClassResponseDTO): Class {
  const professor: Professor | null = dto.professor
    ? {
        id: dto.professor.id,
        name: dto.professor.name,
        email: dto.professor.email,
        role: dto.professor.role,
      }
    : null;

  const students = Array.isArray(dto.students)
    ? dto.students.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        studentRegistration: s.studentRegistration || '',
        role: s.role,
        classId: dto.id,
        grades: [],
        createdAt: typeof s.createdAt === 'string' ? s.createdAt : new Date(s.createdAt).toISOString(),
      }))
    : [];

  return {
    id: dto.id,
    name: dto.name,
    professor,
    students,
    studentCount: typeof dto.studentCount === 'number' ? dto.studentCount : students.length,
    createdAt: typeof dto.createdAt === 'string' ? dto.createdAt : new Date(dto.createdAt).toISOString(),
    updatedAt: typeof dto.updatedAt === 'string' ? dto.updatedAt : new Date(dto.updatedAt).toISOString(),
  };
}

export const classesApi = {
  async getAll(): Promise<Class[]> {
    try {
      const { data } = await API.classes.list();
      const array = Array.isArray(data) ? data : [];
      return array.map(mapClassDTO);
    } catch (error) {
      logger.error('Erro ao buscar turmas', { error });
      throw error;
    }
  },

  async getById(id: string): Promise<Class | null> {
    try {
      const { data } = await API.classes.get(id);
      return data ? mapClassDTO(data) : null;
    } catch (error) {
      logger.error('Erro ao buscar turma', { error });
      return null;
    }
  },

  async getUserClasses(userId: string, userRole: string): Promise<Class[]> {
    try {
      const allClasses = await API.classes.list();
      const array = Array.isArray(allClasses.data) ? allClasses.data : [];
      const mapped = array.map(mapClassDTO);
      if (userRole === 'student') {
        return mapped.filter((cls) => 
          Array.isArray(cls.students) && cls.students.some(student => student.id === userId)
        );
      }
      return mapped;
    } catch (error) {
      logger.error('Erro ao buscar turmas do usuário', { error });
      throw error;
    }
  },

  async create(data: { name: string; professorId: string; professorName?: string }): Promise<Class> {
    try {
      const { data: created } = await API.classes.create({
        name: data.name,
        professorId: data.professorId
      });
      return mapClassDTO(created);
    } catch (error) {
      logger.error('Erro ao criar turma', { error });
      throw error;
    }
  },

  async update(id: string, data: { name: string }): Promise<Class> {
    try {
      const { data: updated } = await API.classes.update(id, { name: data.name });
      return mapClassDTO(updated);
    } catch (error) {
      logger.error('Erro ao atualizar turma', { error });
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await API.classes.delete(id);
      return true;
    } catch (error) {
      logger.error('Erro ao excluir turma', { error });
      throw error;
    }
  },

  async getClassStudents(classId: string): Promise<Array<{ id: string; name: string; email: string; role: string; studentRegistration?: string; createdAt: string }>> {
    try {
      const { data } = await API.classes.students(classId);
      return data.students || [];
    } catch (error) {
      logger.error('Erro ao buscar alunos da turma', { error });
      throw error;
    }
  },
};
