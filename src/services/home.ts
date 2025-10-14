import { User, Class, Student, Submission, QuestionList, SystemNotice } from '../types';
import { authenticatedFetch } from '../config/api';
import { classesApi } from './classes';
import { listsApi } from './lists';

export const homeApi = {
  student: {
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
  const userResponse = await authenticatedFetch<{data: User, message: string}>('/api/users/profile');
  const currentUser = userResponse.data.data;
        
        let userClass: Class | null = null;
        
        if (currentUser.classId) {
          userClass = await classesApi.getById(currentUser.classId);
        }
        
        if (!userClass) {
          const allClasses = await classesApi.getAll();
          userClass = Array.isArray(allClasses)
            ? allClasses.find(cls => cls.students && cls.students.some(student => student.id === currentUser.id)) || null
            : null;
        }
        
        if (!userClass) {
          throw new Error('Usuário não encontrado em nenhuma turma');
        }
        
        let availableLists: QuestionList[] = [];
        try {
          const allLists = await listsApi.getLists();
          const listsArray = Array.isArray(allLists) ? allLists : [];
          availableLists = listsArray.filter((list: QuestionList) => 
            list.classIds && list.classIds.includes(userClass.id) && list.status === 'published'
          );
        } catch (error) {
          availableLists = [];
        }
        
        return {
          currentClass: {
            id: userClass.id,
            name: userClass.name,
            professorId: userClass.professor?.id || '',
            professorName: userClass.professor?.name || ''
          },
          availableLists,
          classParticipants: userClass.students || []
        };
    } catch (error) {
      console.error('Erro ao buscar dados do estudante:', error);
      throw error;
    }
  },

  async getStudentSubmissions(userId: string, limit: number = 5): Promise<Submission[]> {
    try {
        const response = await authenticatedFetch<Submission[]>(`/api/submissions?userId=${userId}&limit=${limit}`);
        return response.data.slice(0, limit);
    } catch (error) {
      console.error('Erro ao buscar submissões do estudante:', error);
      return [];
    }
  }
  },

  staff: {
  async getStaffData(): Promise<{
    classes: Class[];
    students: Student[];
    submissions: Submission[];
    systemNotices: SystemNotice[];
  }> {
    try {
        const [classesData, submissionsData, noticesData] = await Promise.allSettled([
          classesApi.getAll(),
          authenticatedFetch<Submission[]>('/api/submissions?limit=10').catch(() => ({ data: [] })),
          authenticatedFetch<SystemNotice[]>('/api/system/notices?audience=professors&limit=5').catch(() => ({ data: [] }))
        ]);

        const classes = classesData.status === 'fulfilled' && Array.isArray(classesData.value) ? classesData.value : [];
        const submissions = submissionsData.status === 'fulfilled' ? submissionsData.value.data : [];
        const notices = noticesData.status === 'fulfilled' ? noticesData.value.data : [];

        const allStudents = classes.flatMap(cls => cls.students || []);

        return {
          classes,
          students: allStudents,
          submissions,
          systemNotices: notices
        };
    } catch (error) {
      console.error('Erro ao buscar dados do staff:', error);
      return {
        classes: [],
        students: [],
        submissions: [],
        systemNotices: []
      };
    }
  },


  async getSystemNotices(): Promise<SystemNotice[]> {
    try {
        const response = await authenticatedFetch<SystemNotice[]>('/api/system/notices?audience=professors&limit=10');
        return response.data;
    } catch (error) {
      console.error('Erro ao buscar avisos do sistema:', error);
      return [];
    }
  },

  async getActiveLists(): Promise<QuestionList[]> {
    try {
        const response = await authenticatedFetch<QuestionList[]>('/api/lists?status=published');
        return response.data;
    } catch (error) {
      console.error('Erro ao buscar listas ativas:', error);
      return [];
    }
  }
  },

  user: {
  async getCurrentUser(): Promise<User> {
    try {
  const response = await authenticatedFetch<{ data: User; message: string }>('/api/users/profile');

      if (!response.success) {
        throw new Error('Erro ao buscar dados do usuário');
      }

  const userData = response.data.data;
      return userData;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      throw error;
      }
    }
  }
};