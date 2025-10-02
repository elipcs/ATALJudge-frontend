// Serviço centralizado para dados de mock
import questionListsData from '../mocks/question_lists.json';
import classesData from '../mocks/classes.json';
import usersData from '../mocks/users.json';
import systemNoticesData from '../mocks/system-notices.json';
import submissionsData from '../mocks/submissions.json';
import studentsData from '../mocks/students.json';
import professorsData from '../mocks/professors.json';
import inviteTokensData from '../mocks/invite_tokens.json';
import { Class, Student, Professor, Submission, Invite, SystemNotice, User, QuestionList} from '../types';

// Cache dos dados para evitar re-parsing
let cachedData: {
  questionLists?: QuestionList[];
  classes?: Class[];
  users?: User[];
  systemNotices?: SystemNotice[];
  submissions?: Submission[];
  students?: Student[];
  professors?: Professor[];
  inviteTokens?: Invite[];
} = {};

// Cache de processamento pesado
type StudentData = {
  currentClass: {
    id: string;
    name: string;
    professorId: string;
    professorName: string;
  };
  availableLists: QuestionList[];
  classParticipants: Student[];
};

type ProfessorData = {
  classes: Class[];
  students: Student[];
  submissions: Submission[];
};

type AssistantData = {
  classes: Class[];
  students: Student[];
  submissions: Submission[];
};

let processedDataCache: {
  studentData?: StudentData;
  professorData?: ProfessorData;
  assistantData?: AssistantData;
} = {};

export const getMockData = {
  questionLists: () => {
    if (!cachedData.questionLists) {
      // Converter os dados mock para o formato da interface QuestionList
      cachedData.questionLists = questionListsData.map((ql: Record<string, unknown>) => ({
        id: ql.id as string,
        title: ql.title as string,
        description: ql.description as string,
        classIds: ql.class_ids as string[],
        questions: (ql.questions as Record<string, unknown>[]).map((q: Record<string, unknown>) => ({
          id: q.id as string,
          title: q.title as string,
          description: q.description as string,
          statement: q.statement as string,
          input: q.input as string,
          output: q.output as string,
          examples: q.examples as Array<{ input: string; output: string }>,
          tags: q.tags as string[],
          timeLimit: q.timeLimit as string || '1s',
          memoryLimit: q.memoryLimit as string || '256MB',
        })),
        startDate: ql.start_date as string,
        endDate: ql.end_date as string,
        status: ql.status as 'draft' | 'published',
        created_at: ql.created_at as string,
        updated_at: ql.updated_at as string
      }));
    }
    return cachedData.questionLists;
  },
  classes: () => {
    if (!cachedData.classes) {
      // Converter dados mock para interfaces reais
      cachedData.classes = classesData.map((cls: { id: string; name: string; professor: { id: string; name: string; avatar: string; email: string; role: string }; created_at: string; students?: { id: string; name: string; avatar?: string; email: string; studentRegistration: string; role: string; grades?: { score: number }[]; created_at?: string }[] }) => ({
        id: cls.id,
        name: cls.name,
        professor: cls.professor ? {
          id: cls.professor.id,
          name: cls.professor.name,
          avatar: cls.professor.avatar,
          email: cls.professor.email,
          role: cls.professor.role
        } : null,
        created_at: cls.created_at,
        students: cls.students?.map((student: { id: string; name: string; avatar?: string; email: string; studentRegistration: string; role: string; grades?: { score: number }[]; created_at?: string }) => ({
          id: student.id,
          name: student.name,
          avatar: student.avatar,
          email: student.email,
          studentRegistration: student.studentRegistration,
          role: student.role,
          classId: cls.id,
          grades: student.grades?.map((g: { score: number }) => ({ questionListId: '', score: g.score })) || [],
          created_at: student.created_at || new Date().toISOString()
        })) || [],
        student_count: cls.students?.length || 0,
        updated_at: cls.created_at
      }));
    }
    return cachedData.classes;
  },
  users: () => {
    if (!cachedData.users) {
      // Converter dados mock para interfaces reais
      cachedData.users = usersData.map((user: { id: string; name: string; email: string; role: string; avatar?: string }) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar ?? ''
      }));
    }
    return cachedData.users;
  },
  
  systemNotices: () => {
    if (!cachedData.systemNotices) {
      cachedData.systemNotices = systemNoticesData.map((notice: { id: string; title: string; message: string; type: string; date: string }) => ({
        id: notice.id,
        title: notice.title,
        message: notice.message,
        type: notice.type as 'info' | 'warning' | 'success' | 'error',
        date: notice.date
      }));
    }
    return cachedData.systemNotices;
  },
  
  submissions: () => {
    if (!cachedData.submissions) {
      cachedData.submissions = submissionsData.map((sub: Record<string, unknown>) => ({
        id: sub.id as string,
        questionList: sub.questionList as { id: string; name: string },
        question: sub.question as { id: string; name: string },
        student: sub.student as { id: string; name: string; class: { id: string; name: string } },
        status: sub.status === 'submitted' ? 'accepted' : 
                sub.status === 'failed' ? 'error' : 
                sub.status as 'pending' | 'accepted' | 'error' | 'timeout',
        score: sub.score as number,
        language: sub.language as string,
        code: sub.code as string,
        submittedAt: sub.submittedAt as string,
        verdict: sub.verdict as string
      }));
    }
    return cachedData.submissions;
  },
  students: () => {
    if (!cachedData.students) {
      // Converter dados mock para interfaces reais
      cachedData.students = studentsData.map((student: { id: string; name: string; avatar?: string; email: string; studentRegistration: string; role: string; classId?: string; grades?: { questionListId: string; score: number }[]; created_at?: string }) => ({
        id: student.id,
        name: student.name,
        avatar: student.avatar,
        email: student.email,
        studentRegistration: student.studentRegistration,
        role: student.role,
        classId: student.classId || '',
        grades: student.grades?.map((g: { questionListId?: string; score: number }) => ({ questionListId: g.questionListId || '', score: g.score })) || [],
        created_at: student.created_at || new Date().toISOString()
      }));
    }
    return cachedData.students;
  },
  
  professors: () => {
    if (!cachedData.professors) {
      // Converter dados mock para interfaces reais
      cachedData.professors = professorsData.map((prof: { id: string; name: string; avatar?: string; email: string; role: string }) => ({
        id: prof.id,
        name: prof.name,
        avatar: prof.avatar,
        email: prof.email,
        role: prof.role
      }));
    }
    return cachedData.professors;
  },
  
  inviteTokens: () => {
    if (!cachedData.inviteTokens) {
      // Converter dados mock para interfaces reais
      cachedData.inviteTokens = inviteTokensData.map((token: Record<string, unknown>) => ({
        id: token.id as string,
        role: token.role === 'aluno' ? 'student' : 
              token.role === 'monitor' ? 'assistant' : 'professor',
        token: token.token as string,
        link: token.link as string,
        maxUses: (token.maxUses ?? token.max_uses ?? 0) as number,
        currentUses: (token.currentUses ?? token.current_uses ?? 0) as number,
        createdAt: (token.createdAt ?? token.created_at ?? '') as string,
        expiresAt: (token.expiresAt ?? token.expires_at ?? '') as string,
        used: token.used as boolean,
        classId: (token.classId ?? token.class_id ?? '') as string,
        className: (token.className ?? token.class_name ?? '') as string,
        createdBy: (token.createdBy ?? token.created_by ?? '') as string,
        creatorName: (token.creatorName ?? token.creator_name ?? '') as string
      }));
    }
    return cachedData.inviteTokens;
  }
};

// Função para limpar cache se necessário
export const clearMockDataCache = () => {
  cachedData = {};
  processedDataCache = {};
};

// Funções de cache para dados processados
export const getCachedStudentData = () => {
  if (!processedDataCache.studentData) {
    // Processar dados do estudante uma vez e cachear - usando dados já embutidos
    const mockLists = getMockData.questionLists();
    const mockClasses = getMockData.classes();

    const cls = mockClasses[0];
    if (!cls) {
      throw new Error('Nenhuma classe encontrada');
    }

    processedDataCache.studentData = {
      currentClass: {
        id: cls.id,
        name: cls.name,
        professorId: cls.professor?.id || '',
        professorName: cls.professor?.name || 'Professor',
      },
      availableLists: mockLists
        .filter((list: QuestionList) => list.status === 'published')
        .map((list: QuestionList) => list),
      // Usar students já embutidos na classe - muito mais eficiente!
      classParticipants: cls.students
        ?.sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name))
        .map((student: { id: string; name: string; avatar?: string; email: string; studentRegistration: string; role: string; grades?: { score: number }[]; created_at?: string }) => ({
          id: student.id,
          name: student.name,
          avatar: student.avatar,
          email: student.email,
          studentRegistration: student.studentRegistration,
          role: student.role,
          classId: cls.id,
          grades: student.grades?.map((g: { score: number }) => ({ questionListId: '', score: g.score })) || [],
          created_at: student.created_at || new Date().toISOString()
        })) || []
    };
  }
  return processedDataCache.studentData;
};
