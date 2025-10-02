import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { getMockData } from '@/services/mockData';
import { Question, List, Submission } from '@/types/question';

import { useUserRole } from './useUserRole';

interface MockQuestion {
  id: string;
  title: string;
  description?: string;
  statement: string;
  input: string;
  output: string;
  examples: Array<{ input: string; output: string }>;
  tags?: string[];
  timeLimit: string;
  memoryLimit?: string;
}

interface MockList {
  id: string;
  title: string;
  status: string;
  classIds?: string[];
  questions: MockQuestion[];
}

interface MockSubmission {
  id: string;
  questionId: string;
  code: string;
  language: string;
  status: string;
  score?: number;
  attempt?: number;
  submittedAt: string;
  executionTime?: number;
  memoryUsed?: number;
  feedback?: string;
  testCases?: unknown;
}

export function useQuestionData() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;
  const questionId = params.questaoId as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [list, setList] = useState<List | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { userRole } = useUserRole();

  // Mock data
  const mockLists = getMockData.questionLists() as MockList[];
  const mockSubmissions = getMockData.submissions() as unknown as MockSubmission[];

  // Function to get question from mocks
  const getQuestionFromMocks = useCallback((questionId: string): Question | null => {
    for (const list of mockLists) {
      const question = list.questions.find((q: MockQuestion) => q.id === questionId);
      if (question) {
        return {
          id: question.id,
          title: question.title,
          points: 10,
          description: question.description || '',
          category: 'General',
          timeLimit: 30,
          group: question.tags?.[0] || "A",
          statement: `
**Problem:**
${question.statement}

**Input:**
${question.input}

**Output:**
${question.output}
          `,
          examples: question.examples.map((ex: { input: string; output: string }, index: number) => ({
            input: ex.input,
            output: ex.output,
            explanation: `Example ${index + 1}`
          })),
          constraints: [
            `Time limit: ${question.timeLimit}`,
            `Memory limit: ${question.memoryLimit || '256MB'}`
          ],
          notes: [
            "Read the statement carefully",
            "Test with the provided examples"
          ]
        };
      }
    }
    return null;
  }, [mockLists]);

  // Function to get list from mocks
  const getListFromMocks = useCallback((listId: string): List | null => {
    const list = mockLists.find((l: MockList) => l.id === listId);
    if (list) {
      return {
        id: list.id,
        title: list.title,
        status: list.status === 'draft' ? 'draft' : list.status === 'published' ? 'published' : 'closed',
        class: list.classIds?.[0] || 'default-class',
      };
    }
    return null;
  }, [mockLists]);

  // Function to get submissions from mocks
  const getSubmissionsFromMocks = useCallback((questionId: string): Submission[] => {
    return mockSubmissions
      .filter((s: MockSubmission) => s.questionId === questionId)
      .map((s: MockSubmission): Submission => ({
        id: s.id,
        code: s.code,
        language: s.language,
        status: s.status === 'aceita' ? 'accepted' : s.status === 'erro' ? 'error' : s.status === 'pendente' ? 'pending' : 'timeout',
        score: s.score || 0,
        attempt: s.attempt || 1,
        submittedAt: s.submittedAt,
        executionTime: s.executionTime,
        memoryUsed: s.memoryUsed,
        feedback: s.feedback,
        testCases: s.testCases as Submission['testCases']
      }));
  }, [mockSubmissions]);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      const mockList = mockLists.find(list => list.id === listId);
      if (mockList) {
        // Load all questions from the list
        const questions: Question[] = mockList.questions.map((q: MockQuestion): Question => {
          return {
            id: q.id,
            title: q.title,
            points: 10,
            description: q.description || '',
            category: 'General',
            timeLimit: 30,
            group: q.tags?.[0] || "A",
            statement: `
**Problem:**
${q.statement}

**Input:**
${q.input}

**Output:**
${q.output}
            `,
            examples: q.examples.map((ex: { input: string; output: string }, index: number) => ({
              input: ex.input,
              output: ex.output,
              explanation: `Example ${index + 1}`
            })),
            constraints: [
              `Time limit: ${q.timeLimit}`,
              `Memory limit: ${q.memoryLimit || '256MB'}`
            ],
            notes: [
              "Read the statement carefully",
              "Test with the provided examples"
            ]
          };
        });

        setAllQuestions(questions);
        setList(getListFromMocks(listId));
        setQuestion(getQuestionFromMocks(questionId));
        setSubmissions(getSubmissionsFromMocks(questionId));
        
        // userRole agora é obtido do hook useUserRole
        setLoading(false);
      } else {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [listId, questionId, getListFromMocks, getQuestionFromMocks, getSubmissionsFromMocks, mockLists]);

  const navigateToQuestion = (newQuestionId: string) => {
    // Como não temos mais rotas individuais de questões, 
    // esta função pode ser usada para atualizar o estado local
    setQuestion(getQuestionFromMocks(newQuestionId));
    setSubmissions(getSubmissionsFromMocks(newQuestionId));
  };

  const goBack = () => {
    router.push(`/listas/${listId}`);
  };

  const handleSubmit = async () => {
    if (!question) return;

    setSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      const newSubmission: Submission = {
        id: `s${Date.now()}`,
        code: "// Mock submission code",
        language: "python",
        status: 'pending',
        score: 0,
        attempt: submissions.length + 1,
        submittedAt: new Date().toISOString(),
        feedback: "Submissão enviada com sucesso! Aguarde o resultado..."
      };
      
      setSubmissions(prev => [newSubmission, ...prev]);
      setSubmitting(false);
      
      // Simulate processing
      setTimeout(() => {
        setSubmissions(prev => prev.map(s => 
          s.id === newSubmission.id 
            ? { ...s, status: 'accepted', score: question.points, feedback: "Solução aceita!" }
            : s
        ));
      }, 3000);
    }, 1000);
  };

  return {
    question,
    list,
    allQuestions,
    submissions,
    loading,
    submitting,
    userRole,
    navigateToQuestion,
    goBack,
    handleSubmit
  };
}