"use client";

import { useState, useEffect, useCallback } from "react";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useUserRoleContext } from "../../contexts/UserRoleContext";
import { getMockData, clearMockDataCache } from "../../services/mockData";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getSubmissionStatusColor, getVerdictColor, normalizeStatus } from "../../utils/statusUtils";
import { SUBMISSION_STATUS_OPTIONS, MESSAGES } from "../../constants";

// Interface baseada na nova estrutura do mock
interface Submission {
  id: string;
  questionList: {
    id: string;
    name: string;
  };
  questionListId: string;
  question: {
    id: string;
    name: string;
  };
  student: {
    id: string;
    name: string;
  };
  status: 'submitted' | 'failed';
  score: number;
  language: string;
  code: string;
  submittedAt: string;
  verdict: string;
  classId: string;
  className: string;
}

interface Class {
  id: string;
  name: string;
  code: string;
}

interface QuestionList {
  id: string;
  title: string;
  classId: string;
}

// Interface para dados mock
interface MockSubmission {
  id: string;
  questionList?: {
    id: string;
    name: string;
  };
  questionListId?: string;
  question?: {
    id: string;
    name: string;
  };
  student?: {
    id: string;
    name: string;
    class?: {
      id: string;
      name: string;
    };
  };
  status: string;
  score?: number;
  language?: string;
  code?: string;
  submittedAt: string;
  verdict?: string;
}

interface MockClass {
  id: string;
  name: string;
}

interface MockQuestionList {
  id: string;
  title: string;
  classIds?: string[];
}

export default function SubmissoesPage() {
  const { userRole } = useUserRoleContext();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [questionLists, setQuestionLists] = useState<QuestionList[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados do popup
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  // Filtros
  const [filterClass, setFilterClass] = useState('');
  const [filterList, setFilterList] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'failed'>('all');
  const [filterStudent, setFilterStudent] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterQuestion, setFilterQuestion] = useState('');
  
  // Estados dos dropdowns
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isListDropdownOpen, setIsListDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isQuestionDropdownOpen, setIsQuestionDropdownOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Limpar cache para garantir dados atualizados
      clearMockDataCache();
      
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Forçar recarregamento completo dos dados
      const mockSubmissions = getMockData.submissions() as unknown as MockSubmission[];
      const classesData = getMockData.classes() as unknown as MockClass[];
      const questionListsData = getMockData.questionLists() as unknown as MockQuestionList[];
      
      // Converter submissões do mock para formato esperado
      const submissionsConverted: Submission[] = mockSubmissions.map((sub) => {
        // Determinar o ID da lista (pode estar em questionList ou questionListId)
        const listId = sub.questionList?.id || sub.questionListId || '';
        
        // Encontrar a lista correspondente nos dados
        const questionList = questionListsData.find((ql) => ql.id === listId);
        
        // Usar informações da turma diretamente do student com verificação mais robusta
        let classId = 'unknown';
        let className = 'Turma não encontrada';
        
        // Verificar se student.class existe e tem os dados necessários
        if (sub.student?.class?.id && sub.student?.class?.name) {
          classId = sub.student.class.id;
          className = sub.student.class.name;
        } else if (sub.student?.class) {
          // Se class existe mas não tem id/name, usar valores padrão
          classId = sub.student.class.id || 'unknown';
          className = sub.student.class.name || 'Turma não encontrada';
        } else {
          // Fallback: buscar turma através da lista
          const fallbackClassId = questionList?.classIds?.[0] || '';
          const fallbackClassData = classesData.find((cls) => cls.id === fallbackClassId);
          if (fallbackClassData) {
            classId = fallbackClassId;
            className = fallbackClassData.name;
          }
        }
        
        return {
          id: String(sub.id),
          questionList: {
            id: listId,
            name: sub.questionList?.name || questionList?.title || 'Lista não encontrada'
          },
          questionListId: listId,
          question: {
            id: sub.question?.id || 'unknown',
            name: sub.question?.name || 'Questão não encontrada'
          },
          student: {
            id: sub.student?.id || 'unknown',
            name: sub.student?.name || 'Nome não disponível'
          },
          status: sub.status as 'submitted' | 'failed',
          score: sub.score || 0,
          language: sub.language || 'unknown',
          code: sub.code || '',
          submittedAt: sub.submittedAt,
          verdict: sub.verdict || 'Unknown',
          classId: classId,
          className: className
        };
      });
      
      // Filtrar submissões baseado no tipo de usuário
      let filteredSubmissions = submissionsConverted;
      
      if (userRole === 'student') {
        // Aluno só vê suas próprias submissões (João da Silva)
        filteredSubmissions = submissionsConverted.filter((s) => 
          s.student.id === "6500000000000000001001"
        );
      }
      // Professor e Monitor veem todas as submissões (mesma interface)
      
      setSubmissions(filteredSubmissions);
      
      // Configurar turmas e listas
      const classesDataFormatted: Class[] = classesData.map((cls) => ({
        id: String(cls.id),
        name: String(cls.name),
        code: String(cls.id).substring(0, 8)
      }));
      setClasses(classesDataFormatted);
      
      const questionListsDataFormatted: QuestionList[] = questionListsData.map((list) => ({
        id: String(list.id),
        title: String(list.title),
        classId: list.classIds?.[0] || ''
      }));
      setQuestionLists(questionListsDataFormatted);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    loadData();
    // Limpar filtro de estudante se for aluno (não é aplicável)
    if (userRole === 'student') {
      setFilterStudent('');
    }
  }, [userRole, loadData]);

  // Fechar dropdowns quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.class-dropdown-container')) {
        setIsClassDropdownOpen(false);
      }
      if (!target.closest('.list-dropdown-container')) {
        setIsListDropdownOpen(false);
      }
      if (!target.closest('.status-dropdown-container')) {
        setIsStatusDropdownOpen(false);
      }
      if (!target.closest('.language-dropdown-container')) {
        setIsLanguageDropdownOpen(false);
      }
      if (!target.closest('.question-dropdown-container')) {
        setIsQuestionDropdownOpen(false);
      }
    };

    if (isClassDropdownOpen || isListDropdownOpen || isStatusDropdownOpen || isLanguageDropdownOpen || isQuestionDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isClassDropdownOpen, isListDropdownOpen, isStatusDropdownOpen, isLanguageDropdownOpen, isQuestionDropdownOpen]);

  // Fechar popup com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPopupOpen) {
        closePopup();
      }
    };

    if (isPopupOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isPopupOpen]);

  async function revaluateSubmission(id: string) {
    try {
      const response = await fetch(`/api/submissoes/${id}/reavaliar`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Erro ao reavaliar submissão');

      // Recarregar dados para atualizar o status
      loadData();
    } catch (error) {
      alert('Erro ao reavaliar submissão: ' + error);
    }
  }

  function openPopup(submission: Submission) {
    setSelectedSubmission(submission);
    setIsPopupOpen(true);
  }

  function closePopup() {
    setSelectedSubmission(null);
    setIsPopupOpen(false);
  }

  async function exportReport() {
    try {
      const params = new URLSearchParams();
      if (filterClass) params.append('classId', filterClass);
      if (filterList) params.append('listId', filterList);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterStudent) params.append('student', filterStudent);

      const response = await fetch(`/api/submissoes/relatorio?${params}`);
      
      if (!response.ok) throw new Error('Erro ao gerar relatório');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-submissoes-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Erro ao exportar relatório: ' + error);
    }
  }

  // Filtrar submissões
  const filteredSubmissions = submissions.filter(submission => {
    const matchClass = !filterClass || submission.classId === filterClass;
    const matchList = !filterList || submission.questionListId === filterList;
    const matchStatus = filterStatus === 'all' || submission.status === filterStatus;
    const matchStudent = !filterStudent || 
      submission.student.name.toLowerCase().includes(filterStudent.toLowerCase());
    const matchLanguage = !filterLanguage || submission.language.toLowerCase() === filterLanguage.toLowerCase();
    const matchQuestion = !filterQuestion || 
      submission.question.name.toLowerCase().includes(filterQuestion.toLowerCase()) ||
      submission.question.id === filterQuestion;
    
    return matchClass && matchList && matchStatus && matchStudent && matchLanguage && matchQuestion;
  });

  // Filtrar listas pela turma selecionada
  const filteredQuestionLists = questionLists.filter(list => 
    !filterClass || list.classId === filterClass
  );

  // Obter linguagens únicas das submissões
  const uniqueLanguages = Array.from(new Set(submissions.map(s => s.language))).sort();

  // Obter questões únicas das submissões
  const uniqueQuestions = Array.from(new Set(submissions
    .filter(s => s.question && s.question.id && s.question.name)
    .map(s => ({
      id: s.question.id,
      name: s.question.name
    }))), (question) => question.id).map(id => 
    submissions.find(s => s.question && s.question.id === id)!
  ).sort((a, b) => a.question.name.localeCompare(b.question.name));

  function getStatusLabel(status: string) {
    return normalizeStatus(status);
  }

  if (loading) {
    return <LoadingSpinner message={MESSAGES.ERROR_LOADING_SUBMISSIONS} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <PageHeader
        title={userRole === 'student' ? 'Minhas Submissões' : 'Submissões'}
        description={userRole === 'student' 
          ? 'Acompanhe suas submissões e resultados.'
          : 'Acompanhe e gerencie as submissões dos estudantes.'
        }
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        iconColor="green"
      >
        {(userRole === 'professor' || userRole === 'assistant') && (
          <Button 
            onClick={exportReport}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02]"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar Relatório
          </Button>
        )}
      </PageHeader>

      {/* Filtros */}
      <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Filtros</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setFilterClass('');
              setFilterList('');
              setFilterStatus('all');
              setFilterLanguage('');
              setFilterQuestion('');
              if (userRole === 'professor' || userRole === 'assistant') {
                setFilterStudent('');
              }
            }}
            className="text-sm border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
          >
            Limpar Filtros
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Filtro por Estudante (apenas para professores/monitores) */}
          {(userRole === 'professor' || userRole === 'assistant') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Estudante</label>
              <Input
                placeholder="Nome do aluno..."
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
                className="h-10 text-sm bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
              />
            </div>
          )}

          {/* Filtro por Turma (apenas para professores/monitores) */}
          {(userRole === 'professor' || userRole === 'assistant') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Turma</label>
              <div className="relative class-dropdown-container">
                <button
                  type="button"
                  onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-left flex items-center justify-between text-sm"
                >
                  <span className={filterClass ? 'text-slate-900' : 'text-slate-500'}>
                    {filterClass ? classes.find(cls => cls.id === filterClass)?.name : 'Todas as turmas'}
                  </span>
                  <svg 
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isClassDropdownOpen ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isClassDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterClass('');
                        setFilterList(''); // Resetar lista quando mudar turma
                        setIsClassDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-slate-500 hover:bg-slate-50 border-b border-slate-100"
                    >
                      Todas as turmas
                    </button>
                    {classes.map((cls, index) => (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => {
                          setFilterClass(cls.id);
                          setFilterList(''); // Resetar lista quando mudar turma
                          setIsClassDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-slate-50 ${
                          filterClass === cls.id ? 'bg-blue-50 text-blue-700' : 'text-slate-900'
                        } ${index < classes.length - 1 ? 'border-b border-slate-100' : ''}`}
                      >
                        {cls.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Filtro por Lista */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Lista</label>
            <div className="relative list-dropdown-container">
              <button
                type="button"
                onClick={() => setIsListDropdownOpen(!isListDropdownOpen)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-left flex items-center justify-between text-sm"
              >
                <span className={filterList ? 'text-slate-900' : 'text-slate-500'}>
                  {filterList ? filteredQuestionLists.find(list => list.id === filterList)?.title : 'Todas as listas'}
                </span>
                <svg 
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isListDropdownOpen ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isListDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterList('');
                      setIsListDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-slate-500 hover:bg-slate-50 border-b border-slate-100"
                  >
                    Todas as listas
                  </button>
                  {filteredQuestionLists.map((list, index) => (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => {
                        setFilterList(list.id);
                        setIsListDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-50 ${
                        filterList === list.id ? 'bg-blue-50 text-blue-700' : 'text-slate-900'
                      } ${index < filteredQuestionLists.length - 1 ? 'border-b border-slate-100' : ''}`}
                    >
                      {list.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filtro por Questão */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Questão</label>
            <div className="relative question-dropdown-container">
              <button
                type="button"
                onClick={() => setIsQuestionDropdownOpen(!isQuestionDropdownOpen)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-left flex items-center justify-between text-sm"
              >
                <span className={filterQuestion ? 'text-slate-900' : 'text-slate-500'}>
                  {filterQuestion ? uniqueQuestions.find(q => q.question.id === filterQuestion)?.question.name : 'Todas as questões'}
                </span>
                <svg 
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isQuestionDropdownOpen ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isQuestionDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterQuestion('');
                      setIsQuestionDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-slate-500 hover:bg-slate-50 border-b border-slate-100"
                  >
                    Todas as questões
                  </button>
                  {uniqueQuestions.map((question, index) => (
                    <button
                      key={question.question.id}
                      type="button"
                      onClick={() => {
                        setFilterQuestion(question.question.id);
                        setIsQuestionDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-50 ${
                        filterQuestion === question.question.id ? 'bg-blue-50 text-blue-700' : 'text-slate-900'
                      } ${index < uniqueQuestions.length - 1 ? 'border-b border-slate-100' : ''}`}
                    >
                      {question.question.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filtro por Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <div className="relative status-dropdown-container">
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-left flex items-center justify-between text-sm"
              >
                <span className={filterStatus !== 'all' ? 'text-slate-900' : 'text-slate-500'}>
                  {filterStatus === 'all' ? 'Todos os status' : 
                   filterStatus === 'submitted' ? 'Aceitas' : 'Rejeitadas'}
                </span>
                <svg 
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isStatusDropdownOpen ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isStatusDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg">
                  {SUBMISSION_STATUS_OPTIONS.map((option, index) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFilterStatus(option.value as typeof filterStatus);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-50 ${
                        filterStatus === option.value ? 'bg-blue-50 text-blue-700' : 'text-slate-900'
                      } ${index < 2 ? 'border-b border-slate-100' : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filtro por Linguagem */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Linguagem</label>
            <div className="relative language-dropdown-container">
              <button
                type="button"
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-left flex items-center justify-between text-sm"
              >
                <span className={filterLanguage ? 'text-slate-900' : 'text-slate-500'}>
                  {filterLanguage || 'Todas as linguagens'}
                </span>
                <svg 
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isLanguageDropdownOpen ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isLanguageDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterLanguage('');
                      setIsLanguageDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-slate-500 hover:bg-slate-50 border-b border-slate-100"
                  >
                    Todas as linguagens
                  </button>
                  {uniqueLanguages.map((language, index) => (
                    <button
                      key={language}
                      type="button"
                      onClick={() => {
                        setFilterLanguage(language);
                        setIsLanguageDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-50 ${
                        filterLanguage === language ? 'bg-blue-50 text-blue-700' : 'text-slate-900'
                      } ${index < uniqueLanguages.length - 1 ? 'border-b border-slate-100' : ''}`}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabela de Submissões */}
      <Card className="bg-white border-slate-200 rounded-3xl shadow-lg">
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 rounded-xl shadow-lg border border-slate-200 mx-auto mb-6 w-fit">
              <svg className="w-16 h-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Nenhuma submissão encontrada</h3>
            <p className="text-slate-600 text-lg leading-relaxed max-w-lg mx-auto">
              {submissions.length === 0 
                ? 'Ainda não há submissões para suas listas.'
                : 'Tente ajustar os filtros para encontrar o que procura.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {/* Linha de cabeçalhos */}
                <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Estudante</th>
                  {(userRole === 'professor' || userRole === 'assistant') && (
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Turma</th>
                  )}
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Lista</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Questão</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Linguagem</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Pontuação</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map(submission => (
                  <tr 
                    key={submission.id} 
                    className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200"
                    onClick={() => openPopup(submission)}
                  >
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-semibold text-slate-900">{submission.student.name}</div>
                      </div>
                    </td>
                    {(userRole === 'professor' || userRole === 'assistant') && (
                      <td className="py-4 px-6">
                        <div className="text-sm text-slate-900">
                          {submission.className}
                        </div>
                      </td>
                    )}
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-900">
                        {submission.questionList.name}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-900">{submission.question.name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <span className={`px-3 py-1 rounded-xl text-xs font-medium ${getSubmissionStatusColor(submission.status)}`}>
                          {getStatusLabel(submission.status)}
                        </span>
                        <div className={`text-xs ${getVerdictColor(submission.verdict)}`}>
                          {submission.verdict}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-medium">
                        {submission.language}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-semibold text-slate-900">
                        {submission.score} pts
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPopup(submission);
                          }}
                          className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
                        >
                          Ver
                        </Button>
                        {(userRole === 'professor' || userRole === 'assistant') && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              revaluateSubmission(submission.id);
                            }}
                            className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
                          >
                            Reavaliar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Popup de Detalhes da Submissão */}
      {isPopupOpen && selectedSubmission && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closePopup}
        >
          <div 
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Popup */}
            <div className="flex items-center justify-between p-8 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Detalhes da Submissão
                </h2>
                <p className="text-slate-600 mt-2">
                  {selectedSubmission.student?.name || 'Nome não disponível'} - {selectedSubmission.question?.name || 'Questão não encontrada'}
                </p>
              </div>
              <button
                onClick={closePopup}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo do Popup */}
            <div className="p-8">
              {/* Informações da Submissão */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Informações Gerais</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Estudante:</span>
                      <span className="font-semibold text-slate-900">{selectedSubmission.student?.name || 'Nome não disponível'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-600">Lista:</span>
                      <span className="font-semibold text-slate-900">{selectedSubmission.questionList?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Questão:</span>
                      <span className="font-semibold text-slate-900">{selectedSubmission.question?.name || 'Questão não encontrada'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Linguagem:</span>
                      <span className="font-semibold text-slate-900">{selectedSubmission.language}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Resultado</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className={`px-3 py-1 rounded-xl text-xs font-medium ${getSubmissionStatusColor(selectedSubmission.status)}`}>
                        {getStatusLabel(selectedSubmission.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Veredicto:</span>
                      <span className={`font-semibold ${getVerdictColor(selectedSubmission.verdict)}`}>
                        {selectedSubmission.verdict}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Pontuação:</span>
                      <span className="font-semibold text-slate-900">{selectedSubmission.score} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Submetido em:</span>
                      <span className="font-semibold text-slate-900">
                        {new Date(selectedSubmission.submittedAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Código */}
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Código Submetido</h3>
                <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl overflow-x-auto border border-slate-700">
                  <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">
                    {selectedSubmission.code}
                  </pre>
                </div>
              </div>
            </div>

            {/* Footer do Popup */}
            <div className="flex justify-end gap-4 p-8 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
              {(userRole === 'professor' || userRole === 'assistant') && (
                <Button 
                  onClick={() => {
                    revaluateSubmission(selectedSubmission.id);
                    closePopup();
                  }}
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
                >
                  Reavaliar Submissão
                </Button>
              )}
              <Button 
                onClick={closePopup}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02] rounded-xl"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}