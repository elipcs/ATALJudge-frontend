"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockDataApi } from "@/services/mockData";
import PageLoading from "@/components/PageLoading";
import { QuestionList, Question, QuestionGroup, QuestionArrangement, GroupResult, ArrangementResult } from "@/types";
import { useUserRole } from "@/hooks/useUserRole";

interface LocalSubmission {
  id: string;
  questionId: string;
  status: 'pending' | 'accepted' | 'error' | 'timeout';
  score: number;
  attempt: number;
  submittedAt: string;
}

const formatDateTime = (dateString: string) => {
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
};


export default function ListPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [list, setList] = useState<QuestionList | null>(null);
  const [submissions, setSubmissions] = useState<LocalSubmission[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [arrangement, setArrangement] = useState<QuestionArrangement | null>(null);
  const [showArrangementConfig, setShowArrangementConfig] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'java'>('python');
  const [availableArrangements, setAvailableArrangements] = useState<QuestionArrangement[]>([]);
  const [currentArrangementIndex, setCurrentArrangementIndex] = useState(0);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [showReferenceCodeModal, setShowReferenceCodeModal] = useState(false);
  const [showTestCasesModal, setShowTestCasesModal] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  
  // Estados do popup de detalhes da submissão
  const [showSubmissionDetails, setShowSubmissionDetails] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState<LocalSubmission | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const mockLists = mockDataApi.questionLists();
      const foundList = mockLists.find(list => list.id === id);
      if (foundList) {
        setList(foundList);
        
        // Função para criar diferentes cenários de arranjos
        const createArrangementScenarios = (): QuestionArrangement[] => {
          const scenarios: QuestionArrangement[] = [];
          const totalQuestions = foundList.questions.length;
          
          // Cenário 1: Qualquer 2 questões (grupo único)
          if (totalQuestions >= 2) {
            scenarios.push({
              id: 'cenario1',
              name: 'Qualquer 2 Questões',
              description: 'Resolva quaisquer 2 questões para obter a nota máxima',
              groups: [{
                id: 'todas',
                name: 'Todas as Questões',
                questions: foundList.questions.map(q => q.id),
                minRequired: 2,
                pointsPerQuestion: 5,
                color: 'bg-purple-100 text-purple-800 border-purple-200'
              }],
              requireAllGroups: false,
              maxScore: 10,
              passingScore: 6
            });
          }
          
          // Cenário 2: 2 grupos equilibrados (2 questões cada, 1 de cada grupo)
          if (totalQuestions >= 4) {
            const halfLength = Math.floor(totalQuestions / 2);
            scenarios.push({
              id: 'cenario2',
              name: '2 Grupos Equilibrados',
              description: 'Resolva 1 questão de cada grupo para obter a nota máxima',
              groups: [
                {
                  id: 'grupo1',
                  name: 'Grupo 1',
                  questions: foundList.questions.slice(0, halfLength).map(q => q.id),
                  minRequired: 1,
                  pointsPerQuestion: 5,
                  color: 'bg-blue-100 text-blue-800 border-blue-200'
                },
                {
                  id: 'grupo2',
                  name: 'Grupo 2',
                  questions: foundList.questions.slice(halfLength, halfLength * 2).map(q => q.id),
                  minRequired: 1,
                  pointsPerQuestion: 5,
                  color: 'bg-green-100 text-green-800 border-green-200'
                }
              ],
              requireAllGroups: true,
              maxScore: 10,
              passingScore: 6
            });
          }
          
          // Cenário 3: Grupos desiguais (2 questões + 1 questão)
          if (totalQuestions >= 3) {
            scenarios.push({
              id: 'cenario3',
              name: 'Grupos Desiguais',
              description: 'Resolva 1 questão de cada grupo para obter a nota máxima',
              groups: [
                {
                  id: 'grupo_principal',
                  name: 'Grupo Principal',
                  questions: foundList.questions.slice(0, -1).map(q => q.id), // Todas exceto a última
                  minRequired: 1,
                  pointsPerQuestion: 4,
                  color: 'bg-blue-100 text-blue-800 border-blue-200'
                },
                {
                  id: 'grupo_especial',
                  name: 'Questão Especial',
                  questions: [foundList.questions[foundList.questions.length - 1].id], // Última questão
                  minRequired: 1,
                  pointsPerQuestion: 6,
                  color: 'bg-orange-100 text-orange-800 border-orange-200'
                }
              ],
              requireAllGroups: true,
              maxScore: 10,
              passingScore: 6
            });
          }
          
          // Cenário 4: Baseado em tags (se disponível)
          const questionsA = foundList.questions.filter(q => q.tags?.[0] === 'A');
          const questionsB = foundList.questions.filter(q => q.tags?.[0] === 'B');
          const questionsC = foundList.questions.filter(q => q.tags?.[0] === 'C');
          const questionsD = foundList.questions.filter(q => q.tags?.[0] === 'D');
          
          if (questionsA.length > 0 || questionsB.length > 0 || questionsC.length > 0 || questionsD.length > 0) {
            const tagGroups: QuestionGroup[] = [];
            
            if (questionsA.length > 0 || questionsB.length > 0) {
              tagGroups.push({
                id: 'basicas',
                name: 'Questões Básicas',
                questions: [...questionsA, ...questionsB].map(q => q.id),
                minRequired: 1,
                pointsPerQuestion: 4,
                color: 'bg-blue-100 text-blue-800 border-blue-200'
              });
            }
            
            if (questionsC.length > 0 || questionsD.length > 0) {
              tagGroups.push({
                id: 'avancadas',
                name: 'Questões Avançadas',
                questions: [...questionsC, ...questionsD].map(q => q.id),
                minRequired: 1,
                pointsPerQuestion: 6,
                color: 'bg-red-100 text-red-800 border-red-200'
              });
            }
            
            if (tagGroups.length > 0) {
              scenarios.push({
                id: 'cenario4',
                name: 'Por Dificuldade',
                description: tagGroups.length > 1 
                  ? 'Resolva 1 questão básica e 1 avançada para obter a nota máxima'
                  : 'Resolva questões do grupo disponível',
                groups: tagGroups,
                requireAllGroups: tagGroups.length > 1,
                maxScore: 10,
                passingScore: 6
              });
            }
          }
          
          return scenarios;
        };
        
        const arrangementsScenarios = createArrangementScenarios();
        const fallbackArrangement = {
          id: 'fallback',
          name: 'Arranjo Simples',
          description: 'Complete todas as questões disponíveis',
          groups: [{
            id: 'todas',
            name: 'Todas as Questões',
            questions: foundList.questions.map(q => q.id),
            minRequired: foundList.questions.length,
            pointsPerQuestion: 10 / foundList.questions.length,
            color: 'bg-gray-100 text-gray-800 border-gray-200'
          }],
          requireAllGroups: false,
          maxScore: 10,
          passingScore: 6
        };
        
        const allArrangements = arrangementsScenarios.length > 0 ? arrangementsScenarios : [fallbackArrangement];
        setAvailableArrangements(allArrangements);
        setArrangement(allArrangements[0]);
        
        // Simular algumas submissões para demonstração
        setSubmissions([
          {
            id: 'sub1',
            questionId: foundList.questions[0]?.id || '',
            status: 'accepted',
            score: 85,
            attempt: 1,
            submittedAt: '2024-03-15T10:30:00Z'
          },
          {
            id: 'sub2',
            questionId: foundList.questions[1]?.id || '',
            status: 'accepted',
            score: 90,
            attempt: 1,
            submittedAt: '2024-03-15T11:30:00Z'
          }
        ]);
      }
      setLoading(false);
    }, 500);


    return () => clearTimeout(timer);
  }, [id]);

  // useEffect para gerenciar navegação por hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      if (hash === '#questoes' || hash === '#questao') {
        if (list && list.questions.length > 0) {
          setViewMode('question');
          if (!selectedQuestion) {
            setSelectedQuestion(list.questions[0]);
            setCurrentQuestionIndex(0);
          }
        }
      } else if (hash === '#lista' || hash === '') {
        setViewMode('list');
      }
    };

    // Verificar hash inicial
    handleHashChange();

    // Escutar mudanças no hash
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [list, selectedQuestion]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'timeout': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getQuestionSubmission = (questionId: string) => {
    return submissions
      .filter(s => s.questionId === questionId)
      .sort((a, b) => b.attempt - a.attempt)[0];
  };

  // Função para calcular o resultado dos arranjos
  const calculateArrangementResult = (): ArrangementResult | null => {
    if (!arrangement) return null;

    const groupResults: { [groupId: string]: GroupResult } = {};
    let totalScore = 0;

    // Calcular resultado para cada grupo
    arrangement.groups.forEach(group => {
      const questionsSolvedInGroup = group.questions.filter(questionId => {
        const submission = getQuestionSubmission(questionId);
        return submission && submission.status === 'accepted';
      });

      const points = questionsSolvedInGroup.length * group.pointsPerQuestion;
      const completed = questionsSolvedInGroup.length >= group.minRequired;
      const progress = `${questionsSolvedInGroup.length}/${group.minRequired} questões resolvidas`;

      groupResults[group.id] = {
        questionsSolved: questionsSolvedInGroup,
        points,
        completed,
        progress,
        groupInfo: group
      };

      totalScore += points;
    });

    // Verificar se os requirements foram atendidos
    let requirementsMet = false;
    if (arrangement.requireAllGroups) {
      // Precisa resolver questões de todos os grupos
      requirementsMet = arrangement.groups.every(group => groupResults[group.id].completed);
    } else {
      // Precisa resolver o mínimo de pelo menos um grupo
      requirementsMet = arrangement.groups.some(group => groupResults[group.id].completed);
    }

    // Calcular nota final (0-10)
    let finalGrade = 0;
    const maxPossibleScore = arrangement.groups.reduce((sum, group) => 
      sum + (group.minRequired * group.pointsPerQuestion), 0
    );
    
    if (requirementsMet) {
      // Se atendeu os requirements, nota baseada no score total
      finalGrade = Math.min((totalScore / maxPossibleScore) * arrangement.maxScore, arrangement.maxScore);
    } else {
      // Se não atendeu, nota limitada
      finalGrade = Math.min((totalScore / maxPossibleScore) * arrangement.passingScore, arrangement.passingScore);
    }

    return {
      completed: requirementsMet,
      groups: groupResults,
      totalScore,
      finalGrade: Math.round(finalGrade * 10) / 10,
      requirementsMet
    };
  };

  // Função para obter o grupo de uma questão
  const getQuestionGroup = (questionId: string): QuestionGroup | null => {
    if (!arrangement) return null;
    
    return arrangement.groups.find(group => group.questions.includes(questionId)) || null;
  };

  // Função para trocar de cenário de arranjo
  const switchArrangementScenario = (index: number) => {
    if (index >= 0 && index < availableArrangements.length) {
      setCurrentArrangementIndex(index);
      setArrangement(availableArrangements[index]);
    }
  };

  // Funções para gerenciar questões
  const handleAddQuestion = () => {
    setShowAddQuestionModal(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowEditQuestionModal(true);
  };

  const handleSaveQuestion = (questionData: Partial<Question>) => {
    if (!list) return;

    if (editingQuestion) {
      // Editar questão existente
      const updatedQuestions = list.questions.map(q => 
        q.id === editingQuestion.id ? { ...q, ...questionData } : q
      );
      setList({ ...list, questions: updatedQuestions });
      setEditingQuestion(null);
      setShowEditQuestionModal(false);
    } else {
      // Adicionar nova questão
      const newQuestion: Question = {
        id: `q_${Date.now()}`,
        title: questionData.title || 'Nova Questão',
        statement: questionData.statement || '',
        input: questionData.input || '',
        output: questionData.output || '',
        examples: questionData.examples || [],
        timeLimit: questionData.timeLimit || '1s',
        memoryLimit: questionData.memoryLimit || '128MB',
        tags: questionData.tags || [],
        referenceCode: questionData.referenceCode,
        referenceLanguage: questionData.referenceLanguage,
        testCases: questionData.testCases
      };
      setList({ ...list, questions: [...list.questions, newQuestion] });
      setShowAddQuestionModal(false);
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestionToDelete(questionId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteQuestion = () => {
    if (!list || !questionToDelete) return;
    
    const updatedQuestions = list.questions.filter(q => q.id !== questionToDelete);
    setList({ ...list, questions: updatedQuestions });
    
    // Se estamos visualizando a questão que foi deletada, voltar para a lista
    if (selectedQuestion?.id === questionToDelete) {
      window.location.hash = '#lista';
      setSelectedQuestion(null);
    }

    // Limpar estado do modal
    setShowDeleteConfirm(false);
    setQuestionToDelete(null);
  };

  const cancelDeleteQuestion = () => {
    setShowDeleteConfirm(false);
    setQuestionToDelete(null);
  };

  const handleViewReferenceCode = (question: Question) => {
    setViewingQuestion(question);
    setShowReferenceCodeModal(true);
  };

  const handleViewTestCases = (question: Question) => {
    setViewingQuestion(question);
    setShowTestCasesModal(true);
  };

  // Funções para gerenciar popup de detalhes da submissão
  const closeSubmissionDetails = () => {
    setShowSubmissionDetails(false);
    setSubmissionDetails(null);
  };


  // Função para obter a questão por ID
  const getQuestionById = (questionId: string) => {
    return list?.questions.find(q => q.id === questionId);
  };

  // Templates de código para diferentes linguagens
  const getCodeTemplate = (language: 'python' | 'java', questionTitle?: string) => {
    const templates = {
      python: `# ${questionTitle || 'Solução'}
# Leia os dados de entrada
# Processe a lógica
# Imprima o resultado

def solve():
    # Sua solução aqui
    pass

if __name__ == "__main__":
    solve()`,
      
      java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        // ${questionTitle || 'Sua solução aqui'}
        // Leia os dados de entrada
        // Processe a lógica
        // Imprima o resultado
        
        scanner.close();
    }
}`
    };
    
    return templates[language];
  };

  // Função para mudar a linguagem e atualizar o template
  const handleLanguageChange = (language: 'python' | 'java') => {
    setSelectedLanguage(language);
    
    // Se não há código ou é o template padrão, aplicar novo template
    if (!code.trim() || code === getCodeTemplate(selectedLanguage, selectedQuestion?.title)) {
      setCode(getCodeTemplate(language, selectedQuestion?.title));
    }
  };

  // Função para obter a extensão do arquivo
  const getFileExtension = (language: 'python' | 'java') => {
    return language === 'python' ? '.py' : '.java';
  };

  // Função para obter informações da linguagem
  const getLanguageInfo = (language: 'python' | 'java') => {
    const info = {
      python: {
        name: 'Python',
        version: '3.11',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        ext: '.py',
      },
      java: {
        name: 'Java',
        version: '17',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        ext: '.java',
      }
    };
    
    return info[language];
  };

  const handleQuestionSelect = (question: Question, index: number) => {
    setSelectedQuestion(question);
    setCurrentQuestionIndex(index);
    setCode(getCodeTemplate(selectedLanguage, question.title));
    setSubmissionResult(null);
    window.location.hash = '#questoes';
  };

  const handleNavigateQuestion = (direction: 'prev' | 'next') => {
    if (!list) return;
    
    let newIndex = currentQuestionIndex;
    if (direction === 'prev' && currentQuestionIndex > 0) {
      newIndex = currentQuestionIndex - 1;
    } else if (direction === 'next' && currentQuestionIndex < list.questions.length - 1) {
      newIndex = currentQuestionIndex + 1;
    }
    
    setCurrentQuestionIndex(newIndex);
    setSelectedQuestion(list.questions[newIndex]);
    setCode(getCodeTemplate(selectedLanguage, list.questions[newIndex].title));
    setSubmissionResult(null);
  };

  // Função para simular execução de testes e calcular nota
  const calculateTestScore = (question: Question, submittedCode: string): { passedTests: number, totalTests: number, score: number, testResults: Array<{ input: string, expectedOutput: string, actualOutput: string, passed: boolean }> } => {
    if (!question.testCases || question.testCases.length === 0) {
      // Se não há casos de teste, simular resultado baseado na qualidade do código
      const hasBasicStructure = submittedCode.includes('def ') || submittedCode.includes('public class') || submittedCode.includes('function');
      const hasInputOutput = submittedCode.includes('input') || submittedCode.includes('print') || submittedCode.includes('System.out');
      const score = hasBasicStructure && hasInputOutput ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 30);
      
      return {
        passedTests: score > 50 ? 1 : 0,
        totalTests: 1,
        score,
        testResults: [{
          input: 'N/A',
          expectedOutput: 'N/A',
          actualOutput: 'N/A',
          passed: score > 50
        }]
      };
    }

    // Simular execução dos testes
    const testResults = question.testCases.map(testCase => {
      // Simular diferentes cenários baseados no código submetido
      const codeQuality = submittedCode.length > 50 ? 0.8 : 0.4;
      const hasCorrectLogic = submittedCode.includes('+') || submittedCode.includes('Math.max') || submittedCode.includes('max(');
      const randomFactor = Math.random();
      
      const passed = (codeQuality + (hasCorrectLogic ? 0.3 : 0) + randomFactor * 0.2) > 0.6;
      
      return {
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: passed ? testCase.expectedOutput : `Erro: ${Math.random() > 0.5 ? 'Wrong Answer' : 'Runtime Error'}`,
        passed
      };
    });

    const passedTests = testResults.filter(result => result.passed).length;
    const totalTests = testResults.length;
    const score = Math.round((passedTests / totalTests) * 100);

    return { passedTests, totalTests, score, testResults };
  };

  const handleSubmitCode = async () => {
    if (!selectedQuestion || !code.trim()) return;

    setSubmitting(true);
    setSubmissionResult(null);

    // Simular submissão
    setTimeout(() => {
      const testResult = calculateTestScore(selectedQuestion, code);
      const isAccepted = testResult.score >= 50; // Aceita se 50% ou mais dos testes passam
      
      setSubmissionResult({
        status: isAccepted ? 'accepted' : 'error',
        message: isAccepted 
          ? `Solução ${getLanguageInfo(selectedLanguage).name} aceita! ${testResult.passedTests}/${testResult.totalTests} testes passaram.`
          : `Erro na solução ${getLanguageInfo(selectedLanguage).name}. ${testResult.passedTests}/${testResult.totalTests} testes passaram.`,
        score: testResult.score
      });

      // Adicionar submissão à lista
      const newSubmission: LocalSubmission = {
        id: `sub_${Date.now()}`,
        questionId: selectedQuestion.id,
        status: isAccepted ? 'accepted' : 'error',
        score: testResult.score,
        attempt: (getQuestionSubmission(selectedQuestion.id)?.attempt || 0) + 1,
        submittedAt: new Date().toISOString()
      };

      setSubmissions(prev => [...prev, newSubmission]);
      setSubmitting(false);
      
      // Abrir popup com detalhes da submissão
      setSubmissionDetails(newSubmission);
      setShowSubmissionDetails(true);
    }, 2000);
  };

  if (loading) {
    return <PageLoading message="Carregando lista..." description="Preparando as questões" />;
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-xl shadow-lg border border-red-200 mx-auto mb-6 w-fit">
              <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">
              Lista não encontrada
            </h1>
            <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-lg mx-auto mb-8">
              A lista solicitada não existe ou não está disponível.
            </p>
            <Link href="/listas">
              <button className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02] py-3 px-6 rounded-xl">
                Voltar para Listas
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/listas">
            <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl">
              ← Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{list.title}</h1>
            <p className="text-slate-600 mt-1">{list.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${
            list.status === 'published' ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' :
            'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border border-slate-200'
          }`}>
            {list.status === 'published' ? 'Ativa' : 'Rascunho'}
          </span>
            
            {/* Toggle de visualização */}
            <div className="flex rounded-lg overflow-hidden border border-slate-300 bg-white/80">
              <button
                onClick={() => {
                  window.location.hash = '#lista';
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => {
                  if (list.questions.length > 0) {
                    window.location.hash = '#questoes';
                  }
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'question' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
                disabled={list.questions.length === 0}
              >
                Questões
              </button>
            </div>
        </div>
      </div>

        {viewMode === 'list' ? (
          // Visualização em Lista
          <>
      {/* Informações da Lista */}
            <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4">
                  <span className="text-sm font-semibold text-slate-600">Início</span>
                  <p className="text-slate-900 font-bold text-lg">{formatDateTime(list.startDate)}</p>
                </div>
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4">
                  <span className="text-sm font-semibold text-slate-600">Fim</span>
                  <p className="text-slate-900 font-bold text-lg">{formatDateTime(list.endDate)}</p>
                </div>
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4">
                  <span className="text-sm font-semibold text-slate-600">Questões</span>
                  <p className="text-slate-900 font-bold text-lg">{list.questions.length}</p>
                </div>
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4">
                  <span className="text-sm font-semibold text-slate-600">Resolvidas</span>
                  <p className="text-slate-900 font-bold text-lg">
                    {submissions.filter(s => s.status === 'accepted').length}/{list.questions.length}
                  </p>
                </div>
              </div>

        {/* Sistema de Arranjos */}
              {arrangement && (() => {
                const result = calculateArrangementResult();
                return (
                  <div className="border-t border-slate-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Sistema de Arranjos</h3>
                        <p className="text-sm text-slate-600">{arrangement.description}</p>
                      </div>
                      {userRole !== 'student' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowArrangementConfig(true)}
                          className="bg-white/80 border-slate-300 hover:bg-slate-50"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Configurar
                        </Button>
                      )}
              </div>
              
                    {/* Seletor de Cenários */}
                    {availableArrangements.length > 1 && userRole !== 'student' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Cenário de Avaliação:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {availableArrangements.map((arr, index) => (
                            <button
                              key={arr.id}
                              onClick={() => switchArrangementScenario(index)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                currentArrangementIndex === index
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {arr.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-slate-700">Requisito:</span>
                        <span className="text-sm text-slate-600">
                          {arrangement.requireAllGroups 
                            ? 'Resolver questões de todos os grupos' 
                            : 'Resolver questões de pelo menos um grupo'}
                        </span>
                      </div>
                      
                      {/* Info sobre cenários disponíveis para estudantes */}
                      {userRole === 'student' && availableArrangements.length > 1 && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-sm font-medium text-blue-900 mb-1">
                            💡 Cenários Disponíveis para esta Lista:
                          </div>
                          <div className="text-xs text-blue-700 space-y-1">
                            {availableArrangements.map((arr, index) => (
                              <div key={arr.id} className={`${index === currentArrangementIndex ? 'font-medium' : ''}`}>
                                {index === currentArrangementIndex ? '→ ' : '• '}{arr.name}: {arr.description}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {result && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Resultado Geral */}
                        <div className="bg-slate-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-slate-900 mb-3">Sua Nota</h4>
                          <div className="text-center">
                            <div className={`text-4xl font-bold mb-2 ${
                              result.finalGrade >= arrangement.passingScore ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {result.finalGrade.toFixed(1)}
                            </div>
                            <div className="text-sm text-slate-600">
                              {result.requirementsMet ? 'Requisitos atendidos ✓' : 'Requisitos não atendidos ✗'}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {result.totalScore} pontos de {arrangement.maxScore} possíveis
                            </div>
                          </div>
                        </div>

                        {/* Progresso por Grupos */}
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3">Progresso por Grupos</h4>
                          <div className="space-y-3">
                            {arrangement.groups.map((group) => {
                              const groupResult = result.groups[group.id];
                              return (
                                <div key={group.id} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${group.color}`}>
                                      {group.name}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {group.questions.length} questões
                      </span>
                    </div>
                                  <div className="text-right">
                                    <div className={`text-sm font-medium ${
                                      groupResult?.completed ? 'text-green-600' : 'text-slate-600'
                                    }`}>
                                      {groupResult?.completed ? '✓' : '○'} {groupResult?.points || 0} pts
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {groupResult?.progress || `0/${group.minRequired} questões resolvidas`}
                                    </div>
                    </div>
                  </div>
                );
                            })}
                          </div>
            </div>
          </div>
        )}
                  </div>
                );
              })()}
      </Card>

            {/* Lista de Questões */}
            <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Questões</h2>
                {userRole !== 'student' && (
                  <Button 
                    onClick={handleAddQuestion}
                    className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border border-slate-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar Questão
                  </Button>
                )}
              </div>
              
        <div className="space-y-4">
          {list.questions.map((question, index) => {
            const submission = getQuestionSubmission(question.id);
                  
                  // Determinar grupo da questão
                  const questionGroup = getQuestionGroup(question.id);
                  
            return (
                    <div key={question.id} className="border border-slate-200 rounded-2xl p-6 bg-gradient-to-r from-slate-50 to-slate-100 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-slate-900">
                      {index + 1}. {question.title}
                    </span>
                          
                          {/* Badge do grupo */}
                          {questionGroup && (
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${questionGroup.color}`}>
                              {questionGroup.name} ({questionGroup.pointsPerQuestion} pts)
                    </span>
                          )}
                  
                    {submission && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {submission.status === 'accepted' ? 'Aceita' :
                         submission.status === 'error' ? 'Erro' :
                         submission.status === 'pending' ? 'Pendente' : 'Tempo Excedido'}
                      </span>
                    )}
                        </div>
                    
                        <div className="flex items-center gap-2">
                    {userRole === 'student' && list.status === 'published' && (
                        <Button 
                          size="sm"
                              onClick={() => handleQuestionSelect(question, index)}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                        >
                              {submission ? 'Ver Questão' : 'Resolver'}
                        </Button>
                    )}
                    
                          {userRole !== 'student' && (
                      <div className="flex gap-2">
                        {(question.referenceCode || question.testCases) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewReferenceCode(question)}
                            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Código Base
                          </Button>
                        )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                          className="bg-white/80 border-slate-300 hover:bg-slate-50"
                      >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        Editar
                      </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Excluir
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                      <p className="text-slate-600 mb-3">{question.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {userRole !== 'student' && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {question.tags?.join(', ') || 'Sem tags'}
                    </span>
                  )}
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {question.timeLimit || '1s'}
                        </span>
                        {questionGroup && (
                          <span className="font-medium">
                            {questionGroup.pointsPerQuestion} pts por questão
                    </span>
                  )}
                  {submission && (
                          <span className="font-medium">
                            Tentativa #{submission.attempt} - {submission.score}/100 pts ({submission.score}% dos testes)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
          </>
        ) : (
          // Visualização de Questão
          selectedQuestion && (
            <div className="space-y-6">
              {/* Navegação entre questões */}
              <Card className="p-4 bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">{selectedQuestion.title}</h2>
                  
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigateQuestion('prev')}
                      disabled={currentQuestionIndex === 0}
                      className="bg-white/80 border-slate-300 hover:bg-slate-50"
                    >
                      ← Anterior
                    </Button>
                    <span className="text-sm font-medium text-slate-600">
                      Questão {currentQuestionIndex + 1} de {list.questions.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigateQuestion('next')}
                      disabled={currentQuestionIndex === list.questions.length - 1}
                      className="bg-white/80 border-slate-300 hover:bg-slate-50"
                    >
                      Próxima →
                    </Button>
              </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enunciado */}
                <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
                  <h3 className="text-lg font-bold mb-4 text-slate-900">Enunciado</h3>
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-slate-700 whitespace-pre-wrap">{selectedQuestion.statement}</p>
                  </div>

                <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Entrada</h4>
                      <div className="bg-slate-100 p-3 rounded text-sm font-mono text-slate-800">
                        {selectedQuestion.input}
                      </div>
                  </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Saída</h4>
                      <div className="bg-slate-100 p-3 rounded text-sm font-mono text-slate-800">
                        {selectedQuestion.output}
                      </div>
                    </div>

                    {selectedQuestion.examples && selectedQuestion.examples.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Exemplos</h4>
                        {selectedQuestion.examples.map((example, idx) => (
                          <div key={idx} className="mb-3">
                            <div className="text-xs text-slate-500 mb-1">Entrada {idx + 1}:</div>
                            <div className="bg-slate-100 p-2 rounded text-sm font-mono text-slate-800 mb-1">
                              {example.input}
                      </div>
                            <div className="text-xs text-slate-500 mb-1">Saída {idx + 1}:</div>
                            <div className="bg-slate-100 p-2 rounded text-sm font-mono text-slate-800">
                              {example.output}
                    </div>
                  </div>
                        ))}
                </div>
                    )}
                  </div>
                </Card>

                {/* Editor de Código */}
                {userRole === 'student' && (
                  <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900">Solução</h3>
                      
                      {/* Seletor de Linguagem */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-700">Linguagem:</span>
                        <div className="flex rounded-lg overflow-hidden border border-slate-300 bg-white">
                          {(['python', 'java'] as const).map((lang) => {
                            const langInfo = getLanguageInfo(lang);
                            return (
                              <button
                                key={lang}
                                onClick={() => handleLanguageChange(lang)}
                                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                                  selectedLanguage === lang
                                    ? langInfo.color
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span>{langInfo.name}</span>
                                <span className="text-xs opacity-75">{langInfo.version}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Info da linguagem selecionada */}
                      <div className={`px-3 py-2 rounded-lg border text-sm ${getLanguageInfo(selectedLanguage).color}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {getLanguageInfo(selectedLanguage).name} {getLanguageInfo(selectedLanguage).version}
                          </span>
                          <span className="text-xs opacity-75">
                            Arquivo: solution{getFileExtension(selectedLanguage)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Digite sua solução aqui..."
                          className="w-full h-64 p-4 font-mono text-sm border-0 resize-none focus:outline-none bg-white/90"
                      disabled={submitting}
                    />
                  </div>

                      <div className="flex gap-2">
                    <Button
                      onClick={handleSubmitCode}
                      disabled={!code.trim() || submitting}
                          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                        >
                          {submitting ? 'Enviando...' : `Enviar Solução ${getLanguageInfo(selectedLanguage).name}`}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setCode(getCodeTemplate(selectedLanguage, selectedQuestion?.title))}
                          disabled={submitting}
                          className="bg-white/80 border-slate-300 hover:bg-slate-50"
                        >
                          Template
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCode('')}
                      disabled={submitting}
                          className="bg-white/80 border-slate-300 hover:bg-slate-50"
                    >
                      Limpar
                    </Button>
                  </div>

                  {/* Resultado da Submissão */}
                  {submissionResult && (
                        <div className={`p-4 rounded-lg border ${
                      submissionResult.status === 'accepted' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <svg className={`w-5 h-5 ${
                          submissionResult.status === 'accepted' ? 'text-green-600' : 'text-red-600'
                        }`} fill="currentColor" viewBox="0 0 20 20">
                          {submissionResult.status === 'accepted' ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          )}
                        </svg>
                        <span className={`font-medium ${
                          submissionResult.status === 'accepted' ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {submissionResult.message}
                        </span>
                      </div>
                          <div className="mt-2 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Pontuação: {submissionResult.score}/100 pontos</span>
                              <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                                {submissionResult.score}% dos testes passaram
                              </span>
                      </div>
                            {selectedQuestion?.testCases && selectedQuestion.testCases.length > 0 && (
                              <div className="mt-1 text-xs text-slate-500">
                                Baseado em {selectedQuestion.testCases.length} caso(s) de teste
                    </div>
                  )}
                </div>
              </div>
                  )}
            </div>
                  </Card>
                )}

                {/* Seção para Professores/Monitores */}
                {userRole !== 'student' && (
                  <Card className="p-6 bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900">Ferramentas de Professor</h3>
              </div>
          
          <div className="space-y-4">
                      {/* Botão Código Base */}
                      {selectedQuestion && (selectedQuestion.referenceCode || selectedQuestion.testCases) && (
                        <Button
                          onClick={() => handleViewReferenceCode(selectedQuestion)}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          Ver Código de Referência
                        </Button>
                      )}

                      {/* Informações da Questão */}
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-3">Informações da Questão</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">ID:</span>
                            <span className="font-mono text-slate-800">{selectedQuestion.id}</span>
                  </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Limite de Tempo:</span>
                            <span className="text-slate-800">{selectedQuestion.timeLimit}</span>
                      </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Limite de Memória:</span>
                            <span className="text-slate-800">{selectedQuestion.memoryLimit}</span>
                    </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Tags:</span>
                            <span className="text-slate-800">{selectedQuestion.tags.join(', ')}</span>
                  </div>
                </div>
            </div>

                      {/* Status dos Recursos */}
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-3">Recursos Disponíveis</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Código de Referência:</span>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                selectedQuestion.referenceCode 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {selectedQuestion.referenceCode ? 'Disponível' : 'Não definido'}
                              </span>
                              {selectedQuestion.referenceCode && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewReferenceCode(selectedQuestion)}
                                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 text-xs px-2 py-1"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                  </svg>
                                  Ver
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Casos de Teste:</span>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                selectedQuestion.testCases && selectedQuestion.testCases.length > 0
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {selectedQuestion.testCases && selectedQuestion.testCases.length > 0 
                                  ? `${selectedQuestion.testCases.length} casos` 
                                  : 'Não definidos'}
                              </span>
                              {selectedQuestion.testCases && selectedQuestion.testCases.length > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewTestCases(selectedQuestion)}
                                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 text-xs px-2 py-1"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Ver
                                </Button>
                              )}
                            </div>
                          </div>
                          {selectedQuestion.testCases && selectedQuestion.testCases.length > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Casos Públicos:</span>
                              <span className="text-slate-800">
                                {selectedQuestion.testCases.filter(tc => tc.isPublic).length}
                              </span>
                            </div>
                          )}
                        </div>
            </div>
          </div>
        </Card>
                )}
              </div>
            </div>
          )
      )}

        {/* Modal de Configuração de Arranjos */}
        {showArrangementConfig && arrangement && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Configurar Sistema de Arranjos</h2>
            <button
                    onClick={() => setShowArrangementConfig(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

                <div className="space-y-6">
                  {/* Informações Gerais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nome do Arranjo
              </label>
              <input
                type="text"
                        value={arrangement.name}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
              />
            </div>
            <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Requisito
              </label>
                      <input
                        type="text"
                        value={arrangement.requireAllGroups 
                          ? 'Resolver questões de todos os grupos' 
                          : 'Resolver questões de pelo menos um grupo'}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
            </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nota Máxima
              </label>
              <input
                type="number"
                        value={arrangement.maxScore}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
              />
                  </div>
              <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nota Mínima para Aprovação
                </label>
                <input
                        type="number"
                        value={arrangement.passingScore}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
              </div>

              <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Descrição
                </label>
                    <textarea
                      value={arrangement.description}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
            </div>

                  {/* Grupos */}
            <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Grupos de Questões</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {arrangement.groups.map((group) => (
                        <div key={group.id} className={`p-4 rounded-lg border-2 ${group.color}`}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2 py-1 rounded text-sm font-bold ${group.color}`}>
                              {group.name}
                          </span>
                            <span className="text-xs text-slate-500">
                              {group.pointsPerQuestion} pts por questão
                            </span>
                      </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Mínimo necessário:</span>
                              <span className="font-medium">{group.minRequired} questões</span>
                    </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Total de questões:</span>
                              <span className="font-medium">{group.questions.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Pontos por questão:</span>
                              <span className="font-medium">{group.pointsPerQuestion}</span>
                            </div>
                          </div>

                          <div className="mt-3">
                            <span className="text-sm font-medium text-slate-700">Questões:</span>
                            <div className="mt-2 space-y-1">
                              {group.questions.map(questionId => {
                                const question = getQuestionById(questionId);
                                return (
                                  <div key={questionId} className="text-sm text-slate-600 bg-white/50 px-2 py-1 rounded">
                                    {question?.title || 'Questão não encontrada'}
                                  </div>
                                );
                              })}
                            </div>
                  </div>
                </div>
              ))}
                    </div>
            </div>

                  {/* Simulação de Nota */}
                  {(() => {
                    const result = calculateArrangementResult();
                    return result && (
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Simulação Atual</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className={`text-3xl font-bold ${
                              result.finalGrade >= arrangement.passingScore ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {result.finalGrade.toFixed(1)}
            </div>
                            <div className="text-sm text-slate-600">Nota Final</div>
          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {result.totalScore}
                            </div>
                            <div className="text-sm text-slate-600">Pontos Obtidos</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${
                              result.requirementsMet ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {result.requirementsMet ? '✓' : '✗'}
                            </div>
                            <div className="text-sm text-slate-600">Requisitos Atendidos</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                    onClick={() => setShowArrangementConfig(false)}
                    className="bg-white border-slate-300 hover:bg-slate-50"
              >
                    Fechar
              </Button>
              <Button
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    onClick={() => {
                      // TODO: Implementar salvamento das configurações
                      setShowArrangementConfig(false);
                    }}
                  >
                    Salvar Configurações
              </Button>
            </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Adicionar/Editar Questão */}
        {(showAddQuestionModal || showEditQuestionModal) && (
          <QuestionModal
            isOpen={showAddQuestionModal || showEditQuestionModal}
            onClose={() => {
              setShowAddQuestionModal(false);
              setShowEditQuestionModal(false);
              setEditingQuestion(null);
            }}
            onSave={handleSaveQuestion}
            question={editingQuestion}
            title={editingQuestion ? 'Editar Questão' : 'Adicionar Questão'}
          />
        )}

        {/* Modal de Confirmação de Exclusão */}
        {showDeleteConfirm && questionToDelete && (
          <DeleteConfirmModal
            isOpen={showDeleteConfirm}
            onConfirm={confirmDeleteQuestion}
            onCancel={cancelDeleteQuestion}
            questionTitle={list?.questions.find(q => q.id === questionToDelete)?.title || 'questão'}
        />
        )}

        {/* Popup de Detalhes da Submissão */}
        {showSubmissionDetails && submissionDetails && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={closeSubmissionDetails}
          >
            <div 
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do Popup */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Detalhes da Submissão
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedQuestion?.title || 'Questão não encontrada'} - Tentativa #{submissionDetails.attempt}
                  </p>
                </div>
                <button
                  onClick={closeSubmissionDetails}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Conteúdo do Popup */}
              <div className="p-6">
                {/* Informações da Submissão */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Informações Gerais</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Questão:</span>
                        <span className="font-medium">{selectedQuestion?.title || 'Questão não encontrada'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Linguagem:</span>
                        <span className="font-medium">{getLanguageInfo(selectedLanguage).name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tentativa:</span>
                        <span className="font-medium">#{submissionDetails.attempt}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submetido em:</span>
                        <span className="font-medium">
                          {new Date(submissionDetails.submittedAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Resultado</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submissionDetails.status)}`}>
                          {submissionDetails.status === 'accepted' ? 'Aceita' : 'Erro'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pontuação:</span>
                        <span className="font-medium">{submissionDetails.score}/100 pts ({submissionDetails.score}% dos testes)</span>
                      </div>
                      {selectedQuestion?.testCases && selectedQuestion.testCases.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Casos de Teste:</span>
                          <span className="font-medium">{selectedQuestion.testCases.length} casos</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Código Submetido */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Código Submetido</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400 font-mono">
                        {getFileExtension(selectedLanguage)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {code.split('\n').length} linhas
                      </span>
                    </div>
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      {code}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Footer do Popup */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <Button onClick={closeSubmissionDetails}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Popup de Código de Referência */}
        {showReferenceCodeModal && viewingQuestion && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Código de Referência</h2>
                    <p className="text-slate-600 mt-1">{viewingQuestion.title}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowReferenceCodeModal(false);
                      setViewingQuestion(null);
                    }}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Código de Referência */}
                  {viewingQuestion.referenceCode && (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-slate-900">Código de Referência</h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-sm font-medium flex items-center gap-2">
                          <span>{viewingQuestion.referenceLanguage === 'python' ? 'Python' : viewingQuestion.referenceLanguage === 'java' ? 'Java' : viewingQuestion.referenceLanguage}</span>
                        </span>
                      </div>
                      
                      <div className="border border-slate-300 rounded-lg overflow-hidden">
                        <div className="bg-slate-50 px-3 py-2 border-b border-slate-300">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                            </svg>
                            <span>solution.{viewingQuestion.referenceLanguage === 'python' ? 'py' : viewingQuestion.referenceLanguage === 'java' ? 'java' : 'txt'}</span>
                          </div>
                        </div>
                        <div className="bg-white p-4">
                          <pre className="font-mono text-sm text-slate-800 whitespace-pre-wrap overflow-x-auto">
                            {viewingQuestion.referenceCode}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Casos de Teste */}
                  {viewingQuestion.testCases && viewingQuestion.testCases.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-slate-900">Casos de Teste</h3>
                        <span className="text-xs text-slate-500 bg-blue-100 px-2 py-1 rounded">
                          {viewingQuestion.testCases.length} casos • {viewingQuestion.testCases.filter(tc => tc.isPublic).length} públicos
                        </span>
                      </div>
                      
                      <div className="border border-slate-300 rounded-lg overflow-hidden">
                        <div className="max-h-80 overflow-y-auto">
                          {viewingQuestion.testCases.map((testCase, index) => (
                            <div key={index} className={`p-4 border-b border-slate-200 last:border-b-0 ${testCase.isPublic ? 'bg-green-50' : 'bg-slate-50'}`}>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-slate-900">Caso {index + 1}</h4>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                  testCase.isPublic 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                                }`}>
                                  {testCase.isPublic ? 'Público' : 'Privado'}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-2">
                                    Entrada
                                  </label>
                                  <div className="bg-white border border-slate-200 rounded p-3 font-mono text-sm text-slate-800 whitespace-pre-wrap">
                                    {testCase.input}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-2">
                                    Saída Esperada
                                  </label>
                                  <div className="bg-white border border-slate-200 rounded p-3 font-mono text-sm text-slate-800 whitespace-pre-wrap">
                                    {testCase.expectedOutput}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mensagem quando não há dados */}
                  {!viewingQuestion.referenceCode && (!viewingQuestion.testCases || viewingQuestion.testCases.length === 0) && (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum código de referência ou casos de teste</h3>
                      <p className="text-slate-600">Esta questão ainda não possui código de referência ou casos de teste gerados.</p>
                    </div>
                  )}
                </div>

                {/* Botão de Fechar */}
                <div className="flex justify-end pt-6 border-t border-slate-200 mt-6">
                  <Button
                    onClick={() => {
                      setShowReferenceCodeModal(false);
                      setViewingQuestion(null);
                    }}
                    className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Popup de Casos de Teste */}
        {showTestCasesModal && viewingQuestion && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Casos de Teste</h2>
                    <p className="text-slate-600 mt-1">{viewingQuestion.title}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowTestCasesModal(false);
                      setViewingQuestion(null);
                    }}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Casos de Teste */}
                  {viewingQuestion.testCases && viewingQuestion.testCases.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-slate-900">Casos de Teste</h3>
                        <span className="text-xs text-slate-500 bg-blue-100 px-2 py-1 rounded">
                          {viewingQuestion.testCases.length} casos • {viewingQuestion.testCases.filter(tc => tc.isPublic).length} públicos
                        </span>
                      </div>
                      
                      <div className="border border-slate-300 rounded-lg overflow-hidden">
                        <div className="max-h-80 overflow-y-auto">
                          {viewingQuestion.testCases.map((testCase, index) => (
                            <div key={index} className={`p-4 border-b border-slate-200 last:border-b-0 ${testCase.isPublic ? 'bg-green-50' : 'bg-slate-50'}`}>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-slate-900">Caso {index + 1}</h4>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                  testCase.isPublic 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                                }`}>
                                  <div className="flex items-center gap-1">
                                    {testCase.isPublic ? (
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                                      </svg>
                                    ) : (
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
                                      </svg>
                                    )}
                                    <span>{testCase.isPublic ? 'Público' : 'Privado'}</span>
                                  </div>
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-2">
                                    Entrada
                                  </label>
                                  <div className="bg-white border border-slate-200 rounded p-3 font-mono text-sm text-slate-800 whitespace-pre-wrap">
                                    {testCase.input}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-2">
                                    Saída Esperada
                                  </label>
                                  <div className="bg-white border border-slate-200 rounded p-3 font-mono text-sm text-slate-800 whitespace-pre-wrap">
                                    {testCase.expectedOutput}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-slate-400 text-6xl mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum caso de teste</h3>
                      <p className="text-slate-600">Esta questão ainda não possui casos de teste definidos.</p>
                    </div>
                  )}
                </div>

                {/* Botão de Fechar */}
                <div className="flex justify-end pt-6 border-t border-slate-200 mt-6">
                  <Button
                    onClick={() => {
                      setShowTestCasesModal(false);
                      setViewingQuestion(null);
                    }}
                    className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
  );
}

// Componente Modal para Adicionar/Editar Questões
interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questionData: Partial<Question>) => void;
  question?: Question | null;
  title: string;
}

function QuestionModal({ isOpen, onClose, onSave, question, title }: QuestionModalProps) {
  const [formData, setFormData] = useState({
    title: question?.title || '',
    statement: question?.statement || '',
    input: question?.input || '',
    output: question?.output || '',
    timeLimit: question?.timeLimit || '1s',
    memoryLimit: question?.memoryLimit || '128MB',
    tags: question?.tags?.join(', ') || '',
    examples: question?.examples || [{ input: '', output: '' }],
    referenceCode: question?.referenceCode || '',
    referenceLanguage: question?.referenceLanguage || 'python' as 'python' | 'java'
  });

  const [testCases, setTestCases] = useState<Array<{
    input: string;
    expectedOutput: string;
    isPublic: boolean;
  }>>(question?.testCases || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'code'>('basic');

  useEffect(() => {
    if (question) {
      setFormData({
        title: question.title,
        statement: question.statement,
        input: question.input,
        output: question.output,
        timeLimit: question.timeLimit,
        memoryLimit: question.memoryLimit,
        tags: question.tags?.join(', ') || '',
        examples: question.examples || [{ input: '', output: '' }],
        referenceCode: question.referenceCode || '',
        referenceLanguage: question.referenceLanguage || 'python'
      });
      setTestCases(question.testCases || []);
    }
  }, [question]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const questionData: Partial<Question> = {
      title: formData.title,
      statement: formData.statement,
      input: formData.input,
      output: formData.output,
      timeLimit: formData.timeLimit,
      memoryLimit: formData.memoryLimit,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      examples: formData.examples,
      referenceCode: formData.referenceCode,
      referenceLanguage: formData.referenceLanguage,
      testCases: testCases.length > 0 ? testCases : undefined
    };

    onSave(questionData);
  };

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { input: '', output: '' }]
    });
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', isPublic: true }]);
  };

  const removeTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const updateTestCase = (index: number, field: 'input' | 'expectedOutput' | 'isPublic', value: string | boolean) => {
    const updatedTestCases = [...testCases];
    updatedTestCases[index] = { ...updatedTestCases[index], [field]: value };
    setTestCases(updatedTestCases);
  };

  const removeExample = (index: number) => {
    const newExamples = formData.examples.filter((_, i) => i !== index);
    setFormData({ ...formData, examples: newExamples });
  };

  const updateExample = (index: number, field: 'input' | 'output', value: string) => {
    const newExamples = formData.examples.map((example, i) => 
      i === index ? { ...example, [field]: value } : example
    );
    setFormData({ ...formData, examples: newExamples });
  };

  // Função para simular geração de casos de teste
  const generateTestCases = async () => {
    if (!formData.referenceCode || !formData.statement) {
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular casos de teste gerados
      const mockTestCases = [
        {
          input: "5\n1 2 3 4 5",
          expectedOutput: "15",
          isPublic: true
        },
        {
          input: "3\n10 20 30",
          expectedOutput: "60",
          isPublic: true
        },
        {
          input: "1\n100",
          expectedOutput: "100",
          isPublic: false
        },
        {
          input: "4\n-1 -2 -3 -4",
          expectedOutput: "-10",
          isPublic: false
        },
        {
          input: "0",
          expectedOutput: "0",
          isPublic: false
        }
      ];

      // Adicionar casos gerados ao array unificado
      setTestCases([...testCases, ...mockTestCases]);

      // Aqui seria a chamada real para o backend
      // const response = await generateTestCasesAPI({
      //   referenceCode: formData.referenceCode,
      //   referenceLanguage: formData.referenceLanguage,
      //   statement: formData.statement,
      //   inputFormat: formData.input,
      //   outputFormat: formData.output
      // });
      // setGeneratedTestCases(response.testCases);
      
    } catch (error) {
      console.error('Erro ao gerar casos de teste:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ position: 'relative', zIndex: 10000 }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sistema de Abas */}
            <div className="border-b border-slate-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'basic'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Informações Básicas
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'code'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Código & Testes
                  </div>
                </button>
              </nav>
            </div>

            {/* Conteúdo das Abas */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Título da Questão *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

            {/* Enunciado */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Enunciado *
              </label>
              <textarea
                value={formData.statement}
                onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Entrada e Saída */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Formato de Entrada *
              </label>
                <textarea
                  value={formData.input}
                  onChange={(e) => setFormData({ ...formData, input: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Formato de Saída *
                </label>
                <textarea
                  value={formData.output}
                  onChange={(e) => setFormData({ ...formData, output: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Limites */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Limite de Tempo
              </label>
              <input
                  type="text"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1s"
              />
            </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Limite de Memória
                </label>
                <input
                  type="text"
                  value={formData.memoryLimit}
                  onChange={(e) => setFormData({ ...formData, memoryLimit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="128MB"
                />
              </div>
              </div>

            {/* Tags */}
              <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="A, arrays, sorting"
                />
              </div>
{/* Exemplos */}
<div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-700">
                  Exemplos
              </label>
                <Button
                  type="button"
                  onClick={addExample}
                  size="sm"
                  variant="outline"
                  className="bg-white border-slate-300 hover:bg-slate-50"
                >
                  + Adicionar Exemplo
                </Button>
            </div>

              {formData.examples.map((example, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-slate-900">Exemplo {index + 1}</h4>
                    {formData.examples.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExample(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Entrada
                      </label>
                      <textarea
                        value={example.input}
                        onChange={(e) => updateExample(index, 'input', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Saída
                      </label>
                      <textarea
                        value={example.output}
                        onChange={(e) => updateExample(index, 'output', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="space-y-6">
                {/* Código de Referência */}
              <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-700">
                  Código de Referência
                </label>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  Para geração automática de casos de teste
                </span>
            </div>

              {/* Seletor de Linguagem */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Linguagem do Código de Referência
                </label>
                <div className="flex gap-2">
                  {([
                    { value: 'python', name: 'Python'},
                    { value: 'java', name: 'Java'},

                  ] as const).map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, referenceLanguage: lang.value })}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center gap-2 ${
                        formData.referenceLanguage === lang.value
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Editor de Código */}
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-3 py-2 border-b border-slate-300">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    <span>solution.{formData.referenceLanguage === 'python' ? 'py' : formData.referenceLanguage === 'java' ? 'java' : formData.referenceLanguage === 'cpp' ? 'cpp' : 'c'}</span>
                  </div>
                </div>
                <textarea
                  value={formData.referenceCode}
                  onChange={(e) => setFormData({ ...formData, referenceCode: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-3 font-mono text-sm border-0 resize-none focus:outline-none bg-white"
                  placeholder={`Digite o código de referência em ${formData.referenceLanguage}...

Este código será usado para:
• Gerar casos de teste automaticamente
• Validar soluções corretas
• Definir comportamento esperado`}
                />
              </div>
              
              {formData.referenceCode && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <div className="text-sm">
                        <div className="font-medium text-green-900">Código de referência adicionado</div>
                        <div className="text-green-700">
                          O backend poderá usar este código para gerar casos de teste automaticamente com base no enunciado.
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={generateTestCases}
                      size="sm"
                      disabled={!formData.statement || !formData.input || !formData.output || isGenerating}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shrink-0 disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-1"></div>
                          Gerando...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="white" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Gerar Casos de Teste
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>


            {/* Casos de Teste */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-700">
                  Casos de Teste
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {testCases.length} casos • {testCases.filter(tc => tc.isPublic).length} públicos
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTestCase}
                    className="bg-white border-slate-300 hover:bg-slate-50 text-xs px-2 py-1"
                  >
                    + Adicionar Manual
                  </Button>
                </div>
              </div>
              
              {testCases.length > 0 ? (
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    {testCases.map((testCase, index) => (
                      <div key={index} className={`p-4 border-b border-slate-200 last:border-b-0 ${testCase.isPublic ? 'bg-green-50' : 'bg-slate-50'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-slate-900">Caso {index + 1}</h4>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1 text-xs">
                <input
                                type="checkbox"
                                checked={testCase.isPublic}
                                onChange={(e) => updateTestCase(index, 'isPublic', e.target.checked)}
                                className="rounded border-slate-300"
                              />
                              <span className={testCase.isPublic ? 'text-green-700' : 'text-slate-600'}>
                                {testCase.isPublic ? 'Público' : 'Privado'}
                              </span>
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeTestCase(index)}
                              className="text-red-600 border-red-300 hover:bg-red-50 text-xs px-2 py-1"
                            >
                              Remover
                            </Button>
              </div>
            </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Entrada
              </label>
                            <textarea
                              value={testCase.input}
                              onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                              placeholder="Ex: 5 3"
                              className="w-full p-2 border border-slate-300 rounded text-sm font-mono resize-none"
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Saída Esperada
                            </label>
                            <textarea
                              value={testCase.expectedOutput}
                              onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                              placeholder="Ex: 8"
                              className="w-full p-2 border border-slate-300 rounded text-sm font-mono resize-none"
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <div className="text-slate-400 mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">Nenhum caso de teste adicionado</p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTestCase}
                      className="bg-white border-slate-300 hover:bg-slate-50"
                    >
                      Adicionar Manual
                    </Button>
                    {formData.referenceCode && formData.statement && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateTestCases}
                        disabled={isGenerating}
                        className="bg-blue-50 border-blue-300 hover:bg-blue-100 text-blue-700"
                      >
                        {isGenerating ? 'Gerando...' : 'Gerar Automaticamente'}
                      </Button>
                    )}
            </div>
                </div>
              )}
              
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="text-sm">
                    <div className="font-medium text-slate-900">Casos de teste</div>
                    <div className="text-slate-600">
                      Adicione casos manualmente ou gere automaticamente com base no código de referência. Casos públicos serão visíveis aos estudantes.
                    </div>
                  </div>
                </div>
              </div>
            </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="bg-white border-slate-300 hover:bg-slate-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white"
              >
                {question ? 'Salvar Alterações' : 'Adicionar Questão'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Componente Modal de Confirmação de Exclusão
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  questionTitle: string;
}

function DeleteConfirmModal({ isOpen, onConfirm, onCancel, questionTitle }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Confirmar Exclusão
            </h3>
            <p className="text-slate-600">
              Tem certeza que deseja excluir a questão <span className="font-medium">&ldquo;{questionTitle}&rdquo;</span>?
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Esta ação não pode ser desfeita.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 bg-white border-slate-300 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
            >
              Excluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
