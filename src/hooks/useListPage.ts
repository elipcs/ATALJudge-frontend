import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QuestionList, Question, Submission } from '@/types';
import { listsApi } from '@/services/lists';
import { submissionsApi } from '@/services/submissions';
import { useUserRole } from './useUserRole';

interface LocalSubmission {
  id: string;
  questionId: string;
  status: 'pending' | 'accepted' | 'error' | 'timeout';
  score: number;
  attempt: number;
  submittedAt: string;
  code?: string;
  language?: string;
  feedback?: string;
}

export function useListPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;
  const questionId = params.questaoId as string;
  
  const [list, setList] = useState<QuestionList | null>(null);
  const [submissions, setSubmissions] = useState<LocalSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userRole } = useUserRole();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    status: 'pending' | 'accepted' | 'error' | 'timeout';
    message: string;
    score: number;
  } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'question'>('list');
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'java'>('python');

  const loadListData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useListPage] Carregando lista com ID:', listId);
      console.log('🔍 [useListPage] User role:', userRole);
      
      const listData = await listsApi.getById(listId);
      console.log('📦 [useListPage] Dados recebidos:', listData);
      
      if (!listData) {
        console.log('❌ [useListPage] Lista não encontrada para ID:', listId);
        setError(`Lista não encontrada (ID: ${listId})`);
        return;
      }
      
      console.log('✅ [useListPage] Lista carregada com sucesso:');
      console.log('  - ID:', listData.id);
      console.log('  - Título:', listData.title);
      console.log('  - Questões:', listData.questions);
      console.log('  - Número de questões:', listData.questions?.length);
      console.log('  - Questões é array:', Array.isArray(listData.questions));
      
      setList(listData);
      
      if (userRole === 'student') {
        await loadSubmissions(listData);
      }
      
    } catch (err) {
      console.error('❌ [useListPage] Erro ao carregar dados da lista:', err);
      setError(`Erro ao carregar dados da lista: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }, [listId, userRole]);

  const isListStarted = useCallback(() => {
    if (!list || userRole !== 'student') return true;
    
    if (!list.startDate) return true;
    
    const now = new Date();
    const startDate = new Date(list.startDate);
    
    return now >= startDate;
  }, [list, userRole]);

  const hasQuestions = useCallback(() => {
    return list && list.questions && list.questions.length > 0;
  }, [list]);

  const loadSubmissions = useCallback(async (listData: QuestionList) => {
    try {
      const allSubmissions: LocalSubmission[] = [];
      
      for (const question of listData.questions) {
        const questionSubmissions = await submissionsApi.getQuestionSubmissions(question.id, listId);
        
        const localSubmissions = questionSubmissions.map((sub, index) => ({
          id: sub.id,
          questionId: question.id,
          status: sub.status,
          score: sub.score,
          attempt: index + 1,
          submittedAt: sub.submittedAt,
          code: sub.code,
          language: sub.language,
          feedback: sub.verdict
        }));
        
        allSubmissions.push(...localSubmissions);
      }
      
      setSubmissions(allSubmissions);
    } catch (err) {
      console.error('Erro ao carregar submissões:', err);
    }
  }, [listId]);

  const navigateToQuestion = useCallback((question: Question, index: number) => {
    setSelectedQuestion(question);
    setCurrentQuestionIndex(index);
    setViewMode('question');
    setCode('');
    setSubmissionResult(null);
    
    router.push(`/listas/${listId}#questao-${question.id}`);
  }, [listId, router]);

  const goBack = useCallback(() => {
    setViewMode('list');
    setSelectedQuestion(null);
    setCode('');
    setSubmissionResult(null);
    router.push(`/listas/${listId}`);
  }, [listId, router]);

  const handleSubmit = useCallback(async () => {
    if (!selectedQuestion || !code.trim()) return;

    setSubmitting(true);
    setSubmissionResult(null);
    
    try {
      const submission = await submissionsApi.create({
        questionId: selectedQuestion.id,
        listId: listId,
        code: code.trim(),
        language: selectedLanguage
      });

      const newSubmission: LocalSubmission = {
        id: submission.id,
        questionId: selectedQuestion.id,
        status: submission.status,
        score: submission.score,
        attempt: submissions.filter(s => s.questionId === selectedQuestion.id).length + 1,
        submittedAt: submission.submittedAt,
        code: submission.code,
        language: submission.language,
        feedback: submission.verdict
      };

      setSubmissions(prev => [newSubmission, ...prev]);
      
      setSubmissionResult({
        status: submission.status,
        message: submission.status === 'accepted' ? 'Solução aceita!' : 
                submission.status === 'error' ? 'Erro na solução' :
                submission.status === 'timeout' ? 'Tempo limite excedido' :
                'Submissão enviada com sucesso!',
        score: submission.score
      });

    } catch (err) {
      console.error('Erro ao enviar solução:', err);
      setSubmissionResult({
        status: 'error',
        message: 'Erro ao enviar solução. Tente novamente.',
        score: 0
      });
    } finally {
      setSubmitting(false);
    }
  }, [selectedQuestion, code, selectedLanguage, listId, submissions]);

  const getQuestionSubmission = useCallback((questionId: string) => {
    return submissions
      .filter(s => s.questionId === questionId)
      .sort((a, b) => b.attempt - a.attempt)[0];
  }, [submissions]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'timeout': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const formatDateTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const formattedTime = date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
    return `${formattedDate} às ${formattedTime}`;
  }, []);

  useEffect(() => {
    loadListData();
  }, [loadListData]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#questao-') && list) {
        const questionIdFromHash = hash.replace('#questao-', '');
        const question = list.questions.find(q => q.id === questionIdFromHash);
        if (question) {
          const index = list.questions.findIndex(q => q.id === questionIdFromHash);
          navigateToQuestion(question, index);
        }
      } else if (!hash && viewMode === 'question') {
        setViewMode('list');
      }
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [list, viewMode, navigateToQuestion]);

  return {
    list,
    submissions,
    selectedQuestion,
    currentQuestionIndex,
    code,
    loading,
    error,
    userRole,
    viewMode,
    submitting,
    submissionResult,
    selectedLanguage,    
    navigateToQuestion,
    goBack,
    handleSubmit,
    setCode,
    setSelectedLanguage,    
    getQuestionSubmission,
    getStatusColor,
    formatDateTime,
    isListStarted,
    hasQuestions
  };
}
