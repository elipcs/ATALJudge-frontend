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
    : dto.professorName
    ? {
        id: dto.professorId,
        name: dto.professorName,
        email: '',
        role: 'professor',
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
  async getAll(includeRelations: boolean = false): Promise<Class[]> {
    try {
      const params = includeRelations ? { include: 'relations' as string } : undefined;
      const { data } = await API.classes.list(params);
      const array = Array.isArray(data) ? data : [];
      return array.map(mapClassDTO);
    } catch (error) {
      logger.error('Erro ao buscar turmas', { error });
      throw error;
    }
  },

  async getById(id: string): Promise<Class | null> {
    try {
      // Buscar dados básicos da turma com professor
      const { data } = await API.classes.get(id, true);
      if (!data) return null;
      
      console.log('classesApi.getById - Class data:', data);
      console.log('classesApi.getById - Professor:', data.professor);
      
      // Buscar estudantes com grades separadamente
      const studentsResponse = await API.classes.students(id);
      
      console.log('classesApi.getById - Raw response:', studentsResponse);
      console.log('classesApi.getById - Students:', studentsResponse.data.students);
      
      const studentsWithGrades = Array.isArray(studentsResponse.data.students)
        ? studentsResponse.data.students.map((s: any) => {
            console.log('Mapeando aluno:', s.name, 'grades:', s.grades);
            const mapped = {
              id: s.id,
              name: s.name,
              email: s.email,
              studentRegistration: s.studentRegistration || '',
              role: s.role,
              classId: id,
              grades: s.grades || [],
              createdAt: typeof s.createdAt === 'string' ? s.createdAt : new Date(s.createdAt).toISOString(),
            };
            console.log('Aluno mapeado:', mapped);
            return mapped;
          })
        : [];
      
      console.log('classesApi.getById - Final studentsWithGrades:', studentsWithGrades);
      
      // Mapear professor se existir na resposta, ou usar professorName como fallback
      const professor: Professor | null = data.professor
        ? {
            id: data.professor.id,
            name: data.professor.name,
            email: data.professor.email,
            role: data.professor.role,
          }
        : data.professorName
        ? {
            id: data.professorId,
            name: data.professorName,
            email: '',
            role: 'professor',
          }
        : null;

      return {
        id: data.id,
        name: data.name,
        professor,
        students: studentsWithGrades,
        studentCount: studentsWithGrades.length,
        createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date(data.createdAt).toISOString(),
        updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date(data.updatedAt).toISOString(),
      };
    } catch (error) {
      logger.error('Erro ao buscar turma', { error });
      return null;
    }
  },

    async getUserClasses(
    userId: string,
    userRole: string,
    includeRelations: boolean = true
  ): Promise<Class[]> {
    try {
      // Sempre incluir relations para obter professor
      const params = { include: 'relations' as string };
      const allClasses = await API.classes.list(params);
      const array = Array.isArray(allClasses.data) ? allClasses.data : [];
      
      // Para alunos, filtrar turmas onde o usuário é aluno
      if (userRole === 'student') {
        const studentClasses = array.filter((clsData: ClassResponseDTO) => 
          Array.isArray(clsData.students) && clsData.students.some(student => student.id === userId)
        );
        
        // Buscar dados completos de cada turma (com grades dos estudantes)
        const classesWithGrades = await Promise.all(
          studentClasses.map(async (clsData: ClassResponseDTO) => {
            const fullClassData = await this.getById(clsData.id);
            return fullClassData;
          })
        );
        
        return classesWithGrades.filter((cls): cls is Class => cls !== null);
      }
      
      // Para professores/assistentes, mapear diretamente (professor já vem no list)
      // e buscar grades se necessário
      const classesWithGrades = await Promise.all(
        array.map(async (clsData: ClassResponseDTO) => {
          const fullClassData = await this.getById(clsData.id);
          return fullClassData;
        })
      );
      
      return classesWithGrades.filter((cls): cls is Class => cls !== null);
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
