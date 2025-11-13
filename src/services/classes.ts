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
      const response = await API.classes.list(params);
      const { data } = response;
      
      // Garantir que data é um array
      if (!data) {
        logger.warn('Resposta da API não contém data');
        return [];
      }
      
      const array = Array.isArray(data) ? data : [];
      
      if (array.length === 0) {
        logger.warn('Nenhuma turma encontrada na resposta da API');
      }
      
      return array.map(mapClassDTO);
    } catch (error) {
      logger.error('Erro ao buscar turmas', { error });
      throw error;
    }
  },

  async getById(id: string): Promise<Class | null> {
    try {

      const { data } = await API.classes.get(id, true);
      if (!data) return null;
      
      console.log('classesApi.getById - Class data:', data);
      console.log('classesApi.getById - Professor:', data.professor);
      
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
    includeRelations: boolean = true,
    userClassId?: string
  ): Promise<Class[]> {
    try {
      // Para estudantes, se temos o classId do perfil, busca diretamente
      if (userRole === 'student' && userClassId) {
        try {
          const classData = await this.getById(userClassId);
          if (classData) {
            return [classData];
          }
        } catch (err) {
          logger.error(`Erro ao buscar turma do estudante pelo classId ${userClassId}`, { error: err });
          // Continua com a busca normal se falhar
        }
      }
      
      const params = includeRelations ? { include: 'relations' } : undefined;
      const allClasses = await API.classes.list(params);
      const array = Array.isArray(allClasses.data) ? allClasses.data : [];
      
      if (userRole === 'student') {
        // Para estudantes, primeiro mapeia as classes básicas
        const mappedClasses = array.map(mapClassDTO);
        
        // Filtra apenas as classes onde o estudante está matriculado
        let studentClasses = mappedClasses.filter((cls: Class) => {
          // Verifica se o estudante está na lista de estudantes da classe
          if (Array.isArray(cls.students) && cls.students.length > 0) {
            return cls.students.some(student => student.id === userId);
          }
          // Se temos o classId do perfil, usa ele para filtrar
          if (userClassId && cls.id === userClassId) {
            return true;
          }
          return false;
        });
        
        // Se não encontrou classes, tenta buscar pelo classId do perfil
        if (studentClasses.length === 0 && userClassId) {
          const classById = mappedClasses.find(cls => cls.id === userClassId);
          if (classById) {
            studentClasses = [classById];
          }
        }
        
        // Se ainda não encontrou, busca classes que podem ter o estudante mas não foram populadas
        if (studentClasses.length === 0) {
          const classesToFetch = array.filter((clsData: ClassResponseDTO) => {
            // Se não tem students na resposta, precisa buscar
            return !Array.isArray(clsData.students) || clsData.students.length === 0;
          });
          
          // Busca cada classe individualmente para verificar se o estudante está nela
          const fetchedClasses = await Promise.all(
            classesToFetch.map(async (clsData: ClassResponseDTO) => {
              try {
                const fullClassData = await this.getById(clsData.id);
                if (fullClassData && Array.isArray(fullClassData.students)) {
                  const hasStudent = fullClassData.students.some(student => student.id === userId);
                  return hasStudent ? fullClassData : null;
                }
                return null;
              } catch (err) {
                logger.error(`Erro ao buscar turma ${clsData.id}`, { error: err });
                return null;
              }
            })
          );
          
          const validClasses = fetchedClasses.filter((cls): cls is Class => cls !== null);
          if (validClasses.length > 0) {
            return validClasses;
          }
        }
        
        // Se já tem estudantes populados e includeRelations foi true, os dados já vêm completos
        // Não precisa fazer chamadas adicionais
        if (studentClasses.length > 0) {
          return studentClasses;
        }
        
        return [];
      }
      
      // Para professores/assistentes, mapeia todas as classes
      // Se includeRelations foi passado na query, os dados já vêm completos
      const mappedClasses = array.map(mapClassDTO);
      
      // Se includeRelations foi true na query, os dados já vêm com estudantes
      // Não precisa fazer chamadas adicionais para getById
      return mappedClasses;
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
