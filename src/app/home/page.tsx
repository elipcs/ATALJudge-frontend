"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { useUserRole } from "../../hooks/useUserRole";
import listsData from "../../mocks/question_lists.json";
import classesData from "../../mocks/classes.json";
import usersData from "../../mocks/users.json";
import systemNoticesData from "../../mocks/system-notices.json";
import submissionsData from "../../mocks/submissions.json";
import studentsData from "../../mocks/students.json";

// Definindo tipos e interfaces
interface SystemNotice {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

// Interface para o componente de header
interface WelcomeHeaderProps {
  currentUser: User;
  title?: string;
  subtitle?: string;
  extraInfo?: React.ReactNode;
  gradientColors: string;
  textColor?: string;
  children?: React.ReactNode;
}

// Componente de Header de Boas-vindas
function WelcomeHeader({
  currentUser,
  title,
  subtitle,
  extraInfo,
  gradientColors,
  textColor = "text-white",
  children
}: WelcomeHeaderProps) {
  const firstName = currentUser.name.split(' ')[0];
  const displayTitle = title || `Bem-vindo, ${firstName}!`;

  // Determinar cor dos ícones baseado no papel
  const getIconColor = () => {
    if (gradientColors.includes('green')) return 'text-green-600';
    if (gradientColors.includes('slate')) return 'text-slate-600';
    if (gradientColors.includes('blue')) return 'text-blue-600';
    return 'text-slate-600'; // default
  };

  const getTextColor = () => {
    if (gradientColors.includes('green')) return 'text-green-200';
    if (gradientColors.includes('slate')) return 'text-slate-200';
    if (gradientColors.includes('blue')) return 'text-blue-200';
    return 'text-slate-200'; // default
  };

  const getSubtitleColor = () => {
    if (gradientColors.includes('green')) return 'text-green-100';
    if (gradientColors.includes('slate')) return 'text-slate-100';
    if (gradientColors.includes('blue')) return 'text-blue-100';
    return 'text-slate-100'; // default
  };

  const getRoleColor = () => {
    if (gradientColors.includes('green')) return 'text-green-300';
    if (gradientColors.includes('slate')) return 'text-slate-300';
    if (gradientColors.includes('blue')) return 'text-blue-300';
    return 'text-slate-300'; // default
  };

  return (
    <div className={`${gradientColors} ${textColor} rounded-xl shadow-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">{displayTitle}</h1>
          {subtitle && (
            <div className={`flex items-center gap-2 ${getSubtitleColor()}`}>
              <svg className="w-5 h-5" fill="white" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                <path d="M3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" />
              </svg>
              <span className="font-medium">{subtitle}</span>
            </div>
          )}
          {extraInfo && (
            <div className={`flex items-center gap-2 mt-1 ${getSubtitleColor()} text-sm`}>
              <svg className="w-4 h-4" fill="white" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              {extraInfo}
            </div>
          )}
          {children}
        </div>

        {/* Perfil do usuário */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-medium">{currentUser.name}</div>
            <div className={`text-sm ${getTextColor()}`}>{currentUser.email}</div>
            <div className={`text-xs ${getRoleColor()} capitalize`}>{currentUser.role}</div>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <svg className={`w-8 h-8 ${getIconColor()}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Student {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  studentRegistration: string;
  role: string;
  grades: number[];
}

interface Class {
  id: string;
  name: string;
  professorId: string;
  professorName?: string;
}

interface HighlightList {
  id: string;
  title: string;
  description: string;
  class_ids: { $oid: string }[];
  questions: any[];
  start_date: string;
  end_date: string;
  status: 'open' | 'next' | 'closed';
}

interface QuickAction {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  hoverColor: string;
  iconColor: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

interface SubmissionsTableProps {
  submissions: any[];
  showActions?: boolean;
}

// Componente reutilizável de Tabela de Submissões
function SubmissionsTable({ submissions, showActions = false }: SubmissionsTableProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  const openModal = (submission: any) => {
    setSelectedSubmission(submission);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedSubmission(null);
    setShowModal(false);
  };
  // Função para normalizar status para português
  const normalizeStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'Accepted': 'Aceito',
      'Wrong Answer': 'Resposta Incorreta',
      'Time Limit Exceeded': 'Tempo Limite Excedido',
      'Memory Limit Exceeded': 'Limite de Memória Excedido',
      'Runtime Error': 'Erro de Execução',
      'Compilation Error': 'Erro de Compilação',
      'Presentation Error': 'Erro de Apresentação',
      'Pending': 'Pendente',
      'Running': 'Executando',
      'Queue': 'Na Fila',
      // Manter os que já estão em português
      'Aceito': 'Aceito',
      'Erro de Compilação': 'Erro de Compilação',
      'Resposta Incorreta': 'Resposta Incorreta',
      'Pendente': 'Pendente'
    };
    return statusMap[status] || status;
  };

  // Função para obter cor do status
  const getStatusColor = (status: string): string => {
    const normalizedStatus = normalizeStatus(status);
    if (normalizedStatus === 'Aceito') return 'bg-green-100 text-green-800';
    if (normalizedStatus.includes('Erro')) return 'bg-red-100 text-red-800';
    if (normalizedStatus === 'Pendente' || normalizedStatus === 'Executando' || normalizedStatus === 'Na Fila') {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Últimas Submissões</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Aluno</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Lista</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Questão</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              {showActions && (
                <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {submissions.slice(0, 5).map((submission, index) => {
              // Nome do aluno
              let studentName = 'Aluno';
              const sid = submission.studentId && submission.studentId.$oid ? submission.studentId.$oid : null;
              if (sid) {
                const user = mockUsers.find(u => u._id && u._id.$oid === sid);
                if (user && user.name) studentName = user.name;
                else {
                  const student = mockStudents.find(s => s._id && s._id.$oid === sid);
                  if (student && student.name) studentName = student.name;
                }
              }
              // Nome da lista
              let listTitle = 'Lista desconhecida';
              const listId = submission.questionListId && submission.questionListId.$oid ? submission.questionListId.$oid : null;
              if (listId) {
                const listObj = mockLists.find(l => l._id && l._id.$oid === listId);
                if (listObj && listObj.title) listTitle = listObj.title;
              }
              // Nome da questão
              let questionTitle = 'Questão desconhecida';
              const questionId = submission.questionId && submission.questionId.$oid ? submission.questionId.$oid : null;
              if (listId && questionId) {
                const listObj = mockLists.find(l => l._id && l._id.$oid === listId);
                if (listObj && Array.isArray(listObj.questions)) {
                  const qObj = listObj.questions.find(q => q._id && q._id.$oid === questionId);
                  if (qObj && qObj.title) questionTitle = qObj.title;
                }
              }
              return (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{studentName}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {listId ? (
                      <Link href={`/listas/${listId}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                        {listTitle}
                      </Link>
                    ) : listTitle}
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {listId && questionId ? (
                      <Link href={`/listas/${listId}/questoes/${questionId}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                        {questionTitle}
                      </Link>
                    ) : questionTitle}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {normalizeStatus(submission.status)}
                    </span>
                  </td>
                  {showActions && (
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(submission)}
                          className="text-sm px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Ver detalhes
                        </button>
                        {/* Futuras ações podem ser adicionadas aqui */}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Modal de detalhes da submissão */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={closeModal}></div>
          <div className="relative z-60 max-w-3xl w-full mx-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalhes da Submissão</h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-800">Fechar</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <div className="text-gray-600">Aluno</div>
                  <div className="font-medium">{(function(){
                    const sid = selectedSubmission.studentId && selectedSubmission.studentId.$oid ? selectedSubmission.studentId.$oid : null;
                    if (sid) {
                      const user = mockUsers.find(u => u._id && u._id.$oid === sid);
                      if (user && user.name) return user.name;
                      const student = mockStudents.find(s => s._id && s._id.$oid === sid);
                      if (student && student.name) return student.name;
                    }
                    return selectedSubmission.studentName || 'Aluno';
                  })()}</div>
                </div>
                <div>
                  <div className="text-gray-600">Status</div>
                  <div className="font-medium">{selectedSubmission.status || selectedSubmission.verdict || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-600">Veredito</div>
                  <div className="font-medium">{selectedSubmission.verdict || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-600">Pontuação</div>
                  <div className="font-medium">{selectedSubmission.score ?? '-'}</div>
                </div>
                <div>
                  <div className="text-gray-600">Linguagem</div>
                  <div className="font-medium">{selectedSubmission.language || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-600">Enviado em</div>
                  <div className="font-medium">{formatDateBR(selectedSubmission.submittedAt || selectedSubmission.submittedAt)}</div>
                </div>
              </div>

              <div>
                <div className="text-gray-600 mb-2">Código</div>
                <pre className="bg-gray-100 rounded p-3 text-xs overflow-x-auto max-h-64">{selectedSubmission.code}</pre>
              </div>

              <div className="mt-4 text-right">
                <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente reutilizável de Ações Rápidas
function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card className="p-6 bg-gray-50 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Ações Rápidas</h2>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Link key={index} href={action.href}>
            <div className={`p-4 bg-white rounded-lg border border-gray-200 ${action.hoverColor} hover:shadow-md transition-all duration-200 cursor-pointer group`}>
              <div className="flex items-center mb-2">
                {action.icon}
              </div>
              <div className={`font-medium text-gray-900 ${action.iconColor.replace('text-', 'group-hover:text-')}`}>{action.title}</div>
              <div className="text-sm text-gray-600 mt-1">{action.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

// Dados dos mocks
const mockLists = listsData;
const mockClasses = classesData;
const mockUsers = usersData;
const mockSystemNotices = systemNoticesData;
const mockStudents = studentsData;
const mockSubmissions = submissionsData;

// Funções auxiliares para dados mocados de usuário
export const getUserNameByRole = (role: string): string => {
  switch (role) {
    case 'professor':
      // Buscar primeiro professor no array
      const professor = mockUsers.find(user => user.role === 'professor');
      return professor ? professor.name : 'Professor';
    case 'assistant':
      // Buscar primeiro monitor no array
      const assistant = mockUsers.find(user => user.role === 'assistant');
      return assistant ? assistant.name : 'Monitor';
    case 'student':
      // Buscar primeiro aluno no array
      const student = mockUsers.find(user => user.role === 'student');
      return student ? student.name : 'Aluno';
    default: return 'Usuário';
  }
};

export const getUserEmailByRole = (role: string): string => {
  switch (role) {
    case 'professor':
      const professor = mockUsers.find(user => user.role === 'professor');
      return professor ? professor.email : 'professor@email.com';
    case 'assistant':
      const assistant = mockUsers.find(user => user.role === 'assistant');
      return assistant ? assistant.email : 'monitor@email.com';
    case 'student':
      const student = mockUsers.find(user => user.role === 'student');
      return student ? student.email : 'aluno@email.com';
    default: return 'usuario@example.com';
  }
};

// Função para obter dados do usuário baseado no tipo detectado
export const getUserData = (detectedUserRole: string): User => {
  try {
    // Método 1: Verificar token JWT (produção)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      try {
        // Decodificar JWT para extrair dados
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          id: payload.userId || `${detectedUserRole}_1`,
          name: payload.name || getUserNameByRole(detectedUserRole),
          email: payload.email || getUserEmailByRole(detectedUserRole),
          role: detectedUserRole,
          avatar: payload.avatar || "/profile-default.svg"
        };
      } catch (jwtError) {
        console.error('Erro ao decodificar token:', jwtError);
      }
    }

    // Método 2: Fallback para dados mocados baseados no tipo
    const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') : null;
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;

    const normalizedRole = detectedUserRole === 'aluno' ? 'student' : detectedUserRole;
    return {
      id: `${normalizedRole}_1`,
      name: userName || getUserNameByRole(normalizedRole),
      email: userEmail || getUserEmailByRole(normalizedRole),
      role: normalizedRole,
      avatar: "/profile-default.svg"
    };

  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    const normalizedRole = detectedUserRole === 'aluno' ? 'student' : detectedUserRole;
    return {
      id: `${normalizedRole}_1`,
      name: getUserNameByRole(normalizedRole),
      email: getUserEmailByRole(normalizedRole),
      role: normalizedRole,
      avatar: '/profile-default.svg'
    };
  }
};

// Função para obter dados específicos do aluno
export const fetchMockStudentData = () => {
  const cls = mockClasses[0]; // Primeira turma como exemplo

  return {
    cls: {
      id: cls._id.$oid,
      name: cls.name,
      professorId: cls.professor_id.$oid,
      professorName: cls.professor_name,
    } as Class,

    availableLists: mockLists
      .filter(list => list.status === 'published')
      .map(list => {
        const now = new Date();
        const start = new Date(list.start_date);
        const end = new Date(list.end_date);
        let status: 'next' | 'open' | 'closed' = 'next';
        if (now < start) status = 'next';
        else if (now >= start && now <= end) status = 'open';
        else if (now > end) status = 'closed';
        return {
          id: list._id.$oid,
          title: list.title,
          description: list.description,
          class_ids: list.class_ids,
          questions: list.questions,
          start_date: list.start_date,
          end_date: list.end_date,
          status,
        };
      }) as HighlightList[],

    classParticipants: mockStudents
      .filter(student => student.class_id.$oid === cls._id.$oid)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((student, index) => ({
        id: student._id.$oid,
        name: student.name,
        avatar: student.avatar,
        email: student.email,
        studentRegistration: student.studentRegistration,
        role: student.role,
        grades: student.grades.map(g => g.score),
      })) as Student[]
  };
};


// Componente de avisos aprimorado
function SystemNoticesComponent() {
  const [notices, setNotices] = useState<SystemNotice[]>(mockSystemNotices as SystemNotice[]);
  const [loading, setLoading] = useState(false);

  const loadNotices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sistema/avisos?audience=professors&limit=5');
      if (response.ok) {
        const data = await response.json();
        setNotices(data.notices || []);
      }
    } catch (error) {
      console.error('Erro ao carregar avisos:', error);
      // Mantém os avisos mock em caso de erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Avisos do Sistema
        </h3>
        <button
          onClick={loadNotices}
          disabled={loading}
          className="text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          {loading ? 'Carregando...' : 'Atualizar'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Carregando avisos...</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {notices.length === 0 ? (
            <div className="text-center text-gray-600 py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-sm">Nenhum aviso no momento</p>
            </div>
          ) : (
            notices.map(notice => (
              <div
                key={notice.id}
                className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-sm ${notice.type === 'warning' ? 'bg-amber-50 border-amber-400 text-amber-900' :
                  notice.type === 'success' ? 'bg-emerald-50 border-emerald-400 text-emerald-900' :
                    notice.type === 'error' ? 'bg-red-50 border-red-400 text-red-900' :
                      'bg-blue-50 border-blue-400 text-blue-900'
                  }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{notice.title}</h4>
                  <span className="text-xs opacity-70">
                    {new Date(notice.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm opacity-90">{notice.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}


function formatDateBR(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr.replace(/-/g, "/"));
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// Componente de listas aprimorado
function ListsComponent() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Listas de Exercícios</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Título</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Início</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Fim</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Questões</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockLists.map(list => {
              const now = new Date();
              const inicio = new Date(list.start_date);
              const fim = new Date(list.end_date);
              let status = 'Futura';
              let statusColor = 'bg-gray-100 text-gray-800';

              if (now >= inicio && now <= fim) {
                status = 'Ativa';
                statusColor = 'bg-green-100 text-green-800';
              } else if (now > fim) {
                status = 'Encerrada';
                statusColor = 'bg-red-100 text-red-800';
              }

              return (
                <tr key={list._id.$oid} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link href={`/listas/${list._id.$oid}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                      {list.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{formatDateBR(list.start_date)}</td>
                  <td className="py-3 px-4 text-gray-600">{formatDateBR(list.end_date)}</td>
                  <td className="py-3 px-4 text-gray-600">{list.questions.length}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Componente específico para a home do aluno
function StudentHome({ currentUser }: { currentUser: User }) {
  const { cls, availableLists: availableLists, classParticipants: classParticipants } = fetchMockStudentData();

  // Debug temporário
  console.log('Available lists:', availableLists);
  console.log('Available lists length:', availableLists.length);

  // Encontrar lista em destaque (aberta, próxima ou última encerrada)
  let highlightList = availableLists.find(l => l.status === 'open') || availableLists.find(l => l.status === 'next');
  if (!highlightList) {
    // Se não houver open/next, pega a última closed
    const closedLists = availableLists.filter(l => l.status === 'closed');
    if (closedLists.length > 0) {
      // Ordena por data de fim decrescente
      closedLists.sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());
      highlightList = closedLists[0];
    }
  }

  console.log('Highlight list:', highlightList);

  // Dados do aluno atual - buscar pelo nome do usuário logado
  const alunoAtual = classParticipants.find(classParticipant => classParticipant.name === currentUser.name) || {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    studentRegistration: '20241001',
  };

  return (
    <div className="space-y-6">
      {/* Header com informações da turma e perfil */}
      <WelcomeHeader
        currentUser={currentUser}
        title={`Bem-vindo(a), ${currentUser.name.split(' ')[0]}!`}
        subtitle={cls.name}
        extraInfo={<span>Professor: {cls.professorName}</span>}
        gradientColors="bg-gradient-to-r from-slate-600 to-slate-700"
      />

      {/* Lista em destaque */}
      {highlightList && (
        <Card className="p-6 bg-gray-50 border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {highlightList.status === 'open' ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ) : highlightList.status === 'next' ? (
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <h2 className="text-xl font-semibold text-gray-900">
                  {highlightList.status === 'open' ? 'Lista em Andamento' : 
                   highlightList.status === 'next' ? 'Próxima Lista' : 
                   'Última Lista'}
                </h2>
              </div>
              <p className="text-gray-600">
                {highlightList.status === 'open'
                  ? 'Você pode submeter suas soluções agora'
                  : highlightList.status === 'next'
                  ? 'Esta lista será liberada em breve'
                  : 'Esta lista foi encerrada recentemente'
                }
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              highlightList.status === 'open'
                ? 'bg-green-100 text-green-800'
                : highlightList.status === 'next'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
              }`}>
              {highlightList.status === 'open' ? 'Aberta' : 
               highlightList.status === 'next' ? 'Em breve' : 
               'Encerrada'}
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{highlightList.title}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Início:</span>
                <span className="ml-2 font-medium">
                  {new Date(highlightList.start_date).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Prazo:</span>
                <span className="ml-2 font-medium">
                  {new Date(highlightList.end_date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          {highlightList.status === 'open' && (
            <div className="flex gap-3">
              <Link href={`/listas/${highlightList.id}`}>
                <Button>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Acessar Lista
                </Button>
              </Link>
              <Link href={`/submissoes?lista=${highlightList.id}`}>
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Ver Submissões
                </Button>
              </Link>
            </div>
          )}
          {highlightList.status === 'closed' && (
            <div className="flex gap-3">
              <Link href={`/listas/${highlightList.id}`}>
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver Lista
                </Button>
              </Link>
              <Link href={`/submissoes?lista=${highlightList.id}`}>
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Ver Resultados
                </Button>
              </Link>
            </div>
          )}
        </Card>
      )}

      {/* Lista de Alunos da turma */}
      <Card className="p-6 bg-gray-50 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Alunos da Turma</h2>
          <span className="text-sm text-gray-600">{classParticipants.length} alunos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Nome</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Matrícula</th>
              </tr>
            </thead>
            <tbody>
              {classParticipants.map((classParticipant, index) => (
                <tr key={classParticipant.id} className={`border-b border-gray-100 ${classParticipant.id === alunoAtual.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className={`font-medium ${classParticipant.id === alunoAtual.id ? 'text-blue-700' : 'text-gray-900'}`}>
                          {classParticipant.name}
                          {classParticipant.id === alunoAtual.id && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              Você
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{classParticipant.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900 font-medium">{classParticipant.studentRegistration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function HomePage() {
  // Hook para detectar tipo de usuário
  const { userRole, isLoading: userRoleLoading, setUserRole } = useUserRole();

  // Estado do usuário autenticado baseado no tipo detectado
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userRoleLoading) {
      const user = getUserData(userRole);
      setCurrentUser(user);
      setLoading(false);
    }
  }, [userRole, userRoleLoading]);

  if (loading || userRoleLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Layout para Professor
  if (currentUser.role === 'professor') {
    const currentDate = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const professorActions: QuickAction[] = [
      {
        href: "/turmas",
        icon: <svg className="w-6 h-6 text-blue-600 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>,
        title: "Gerenciar Turmas",
        description: "Criar e administrar turmas",
        hoverColor: "hover:border-blue-300",
        iconColor: "text-blue-600"
      },
      {
        href: "/listas",
        icon: <svg className="w-6 h-6 text-green-600 group-hover:text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>,
        title: "Criar Listas",
        description: "Adicionar novas listas de exercícios",
        hoverColor: "hover:border-green-300",
        iconColor: "text-green-600"
      },
      {
        href: "/convites",
        icon: <svg className="w-6 h-6 text-purple-600 group-hover:text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>,
        title: "Convidar Alunos",
        description: "Gerar códigos de convite",
        hoverColor: "hover:border-purple-300",
        iconColor: "text-purple-600"
      }
    ];

    return (
      <div className="space-y-6">
        {/* Header com informações do professor */}
        <WelcomeHeader
          currentUser={currentUser}
          title={`Bem-vindo(a), Prof. ${currentUser.name.split(' ')[0]}!`}
          gradientColors="bg-gradient-to-r from-slate-600 to-slate-700"
        >
          <div className="flex items-center gap-2 mt-1 text-slate-100 text-sm">
            <svg className="w-4 h-4" fill="white" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>{currentDate}</span>
          </div>
        </WelcomeHeader>

        {/* Ações rápidas destacadas */}
        <QuickActions actions={professorActions} />

        {/* Conteúdo com abas */}
        <Card className="p-6">
          <Tabs defaultValue="submissoes">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="submissoes">Submissões Recentes</TabsTrigger>
              <TabsTrigger value="listas">Listas Ativas</TabsTrigger>
              <TabsTrigger value="avisos">Avisos do Sistema</TabsTrigger>
            </TabsList>
            <TabsContent value="submissoes" className="mt-6">
              <SubmissionsTable submissions={mockSubmissions} showActions={true} />
            </TabsContent>
            <TabsContent value="listas" className="mt-6">
              <ListsComponent />
            </TabsContent>
            <TabsContent value="avisos" className="mt-6">
              <SystemNoticesComponent />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    );
  }

  // Layout para Monitor - redesenhado baseado na experiência do aluno
  if (currentUser.role === 'assistant') {
    const currentDate = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const monitorActions: QuickAction[] = [
      {
        href: "/submissoes",
        icon: <svg className="w-6 h-6 text-red-600 group-hover:text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>,
        title: "Corrigir Submissões",
        description: "12 pendentes",
        hoverColor: "hover:border-red-300",
        iconColor: "text-red-600"
      },
      {
        href: "/listas",
        icon: <svg className="w-6 h-6 text-green-600 group-hover:text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>,
        title: "Criar Listas",
        description: "Adicionar novas listas de exercícios",
        hoverColor: "hover:border-green-300",
        iconColor: "text-green-600"
      },
      {
        href: "/turmas",
        icon: <svg className="w-6 h-6 text-blue-600 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>,
        title: "Acompanhar Turmas",
        description: "Ver progresso dos alunos",
        hoverColor: "hover:border-blue-300",
        iconColor: "text-blue-600"
      }
    ];

    return (
      <div className="space-y-6">
        {/* Header com informações do monitor */}
        <WelcomeHeader
          currentUser={currentUser}
          title={`Bem-vindo(a), Monitor ${currentUser.name.split(' ')[0]}!`}
          gradientColors="bg-gradient-to-r from-slate-600 to-slate-700"
        >
          <div className="flex items-center gap-2 mt-1 text-slate-100 text-sm">
            <svg className="w-4 h-4" fill="white" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>{currentDate}</span>
          </div>
        </WelcomeHeader>

        {/* Ações rápidas para monitor */}
        <QuickActions actions={monitorActions} />

        {/* Conteúdo com abas para monitor */}
        <Card className="p-6">
          <Tabs defaultValue="submissoes">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="submissoes">Submissões Recentes</TabsTrigger>
              <TabsTrigger value="listas">Listas Ativas</TabsTrigger>
              <TabsTrigger value="performance">Minha Performance</TabsTrigger>
            </TabsList>
            <TabsContent value="submissoes" className="mt-6">
              <SubmissionsTable submissions={mockSubmissions} showActions={true} />
            </TabsContent>
            <TabsContent value="listas" className="mt-6">
              <ListsComponent />
            </TabsContent>
            <TabsContent value="performance" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Estatísticas de Correção</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Esta Semana</h4>
                    <div className="text-2xl font-bold text-blue-600">24</div>
                    <div className="text-sm text-gray-600">submissões corrigidas</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Tempo Médio</h4>
                    <div className="text-2xl font-bold text-green-600">15min</div>
                    <div className="text-sm text-gray-600">por correção</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    );
  }

  // Layout para Aluno - usar o novo componente HomeAluno
  if (currentUser.role === 'student') {
    return <StudentHome currentUser={currentUser} />;
  }

  // Fallback para tipos não identificados
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tipo de usuário não identificado</h1>
        <p className="text-gray-600">Por favor, verifique suas permissões ou contate o administrador.</p>
      </div>
    </div>
  );
}
