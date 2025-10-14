"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageLoading from "@/components/PageLoading";
import { Question } from "@/types";
import { useListPage } from "@/hooks/useListPage";
import { useQuestionActions } from "@/hooks/useQuestionActions";
import ListTabs from "@/components/lists/ListTabs";
import QuestionModal from "@/components/lists/QuestionModal";
import ScoreSummary from "@/components/lists/ScoreSummary";
import ScoreSystemConfigModal from "@/components/lists/ScoreSystemConfigModal";
import { SubmissionScore } from "@/utils/scoringUtils";
import { listsApi } from "@/services/lists";

export default function ListPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const {
    list,
    loading,
    error,
    userRole,
    submissions,
    backendScore,
    getQuestionSubmission,
    getStatusColor,
    formatDateTime,
    isListStarted,
    hasQuestions
  } = useListPage();

  const {
    createQuestion,
    updateQuestion,
  } = useQuestionActions(id);

  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showScoreConfigModal, setShowScoreConfigModal] = useState(false);

  const handleSaveScoreConfig = async (config: any) => {
    try {
      console.log('💾 [handleSaveScoreConfig] Configuração recebida do modal:', config);
      
      // Converte os campos de camelCase para snake_case para o backend
      const backendConfig: any = {
        title: list!.title,
        description: list!.description,
        start_time: list!.startDate,
        end_time: list!.endDate,
        class_ids: list!.classIds,
        status: list!.status,
        scoring_mode: config.scoringMode,
        max_score: config.maxScore,
      };

      // Adiciona campos específicos do modo simples
      if (config.scoringMode === 'simple') {
        backendConfig.min_questions_for_max_score = config.minQuestionsForMaxScore;
      }

      // Adiciona grupos se modo for 'groups'
      if (config.scoringMode === 'groups' && config.questionGroups) {
        backendConfig.question_groups = config.questionGroups.map((group: any) => ({
          id: group.id,
          name: group.name,
          question_ids: group.questionIds,
          percentage: group.percentage
        }));
      }

      console.log('📤 [handleSaveScoreConfig] Dados convertidos para backend:', backendConfig);
      
      await listsApi.update(id, backendConfig);
      
      console.log('✅ [handleSaveScoreConfig] Configuração salva com sucesso!');
      setShowScoreConfigModal(false);
      window.location.reload();
    } catch (error) {
      console.error('❌ [handleSaveScoreConfig] Erro ao salvar configuração de pontuação:', error);
      alert('Erro ao salvar configuração. Por favor, tente novamente.');
    }
  };

  // Converte submissões para o formato esperado pelo ScoreSummary
  const submissionScores: SubmissionScore[] = submissions.map(sub => ({
    questionId: sub.questionId,
    score: sub.score,
    attempt: sub.attempt
  }));

  // Reordena as questões por grupos se o modo for 'groups'
  const getOrderedQuestions = () => {
    if (!list || list.scoringMode !== 'groups' || !list.questionGroups || list.questionGroups.length === 0) {
      return list?.questions || [];
    }

    const orderedQuestions: Question[] = [];
    const questionMap = new Map(list.questions.map(q => [q.id, q]));

    // Adiciona questões na ordem dos grupos
    for (const group of list.questionGroups) {
      if (!group || !group.questionIds) continue;
      const questionIds = Array.isArray(group.questionIds) ? group.questionIds : [];
      
      for (const questionId of questionIds) {
        const question = questionMap.get(questionId);
        if (question && !orderedQuestions.find(q => q.id === question.id)) {
          orderedQuestions.push(question);
        }
      }
    }

    // Adiciona questões que não estão em nenhum grupo no final
    for (const question of list.questions) {
      if (!orderedQuestions.find(q => q.id === question.id)) {
        orderedQuestions.push(question);
      }
    }

    return orderedQuestions;
  };

  const orderedQuestions = getOrderedQuestions();

  if (loading) {
    return <PageLoading message="Carregando lista..." description="Preparando as informações" />;
  }

  if (error) {
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
              Erro ao carregar lista
            </h1>
            <p className="text-slate-600 mb-8 text-lg">
              {error}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/listas">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                  Voltar às Listas
                </Button>
              </Link>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                Tentar Novamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
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
            <p className="text-slate-600 mb-8 text-lg">
              A lista solicitada não foi encontrada ou você não tem permissão para acessá-la.
            </p>
            <Link href="/listas">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                Voltar às Listas
              </Button>
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {list.title}
            </h1>
            <p className="text-slate-600 mt-1">Informações da Lista</p>
          </div>
        </div>
        
        {/* Navegação entre páginas com estilo do perfil */}
  <ListTabs id={id} activeTab="lista" hasQuestions={!!hasQuestions()} userRole={userRole || 'student'} />
      </div>

      {/* Verificar se a lista já começou (para estudantes) */}
      {!isListStarted() && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Lista ainda não iniciada</h3>
              <p className="text-yellow-700">
                Esta lista será disponibilizada em {formatDateTime(list.startDate)}.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Informações da Lista */}
      <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Informações da Lista</h3>
        </div>
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
            <span className="text-sm font-semibold text-slate-600">Status</span>
            <p className="text-slate-900 font-bold text-lg">
              {list.status === 'published' ? 'Publicada' : 'Rascunho'}
            </p>
          </div>
        </div>

        {/* Descrição da Lista */}
        {list.description && (
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Descrição</h3>
            <p className="text-slate-700 leading-relaxed">{list.description}</p>
          </div>
        )}

        {/* Sistema de Pontuação Configurado */}
        <div className={`${list.description ? 'border-t' : ''} border-slate-200 pt-6 mt-6`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-900">Sistema de Pontuação</h3>
            {(userRole === 'professor' || userRole === 'assistant') && (
              <Button
                onClick={() => setShowScoreConfigModal(true)}
                variant="outline"
                size="sm"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configurar
              </Button>
            )}
          </div>
          
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-semibold text-slate-700">Modo: </span>
                <span className="text-sm text-slate-900">
                  {list.scoringMode === 'groups' ? 'Por Grupos' : 'Simples'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-600">Nota Máxima: </span>
                <span className="text-sm font-semibold text-slate-900">{list.maxScore || 10} pts</span>
              </div>
            </div>
            
            {list.scoringMode === 'groups' && list.questionGroups && list.questionGroups.length > 0 ? (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-600 mb-2">
                  {list.questionGroups.length} grupo{list.questionGroups.length !== 1 ? 's' : ''} configurado{list.questionGroups.length !== 1 ? 's' : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  {list.questionGroups.map((group) => (
                    <span key={group.id} className="text-xs bg-white px-2 py-1 rounded border border-slate-200">
                      {group.name} ({group.percentage || group.weight}%)
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600 mt-2">
                Média das {list.minQuestionsForMaxScore || list.questions.length} melhores questões
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Sistema de Pontuação - Exibido para Estudantes */}
      {userRole === 'student' && isListStarted() && (
        <ScoreSummary list={list} submissions={submissionScores} backendScore={backendScore} />
      )}

      {/* Resumo das Questões */}
      {hasQuestions() && (
        <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Resumo das Questões</h2>
            {/* Botões para professor/assistant */}
            {(userRole === 'professor' || userRole === 'assistant') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddQuestionModal(true)}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Criar Questão
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {orderedQuestions.slice(0, 3).map((question, index) => {
              const submission = getQuestionSubmission(question.id);
              
              // Verifica se deve mostrar cabeçalho de grupo
              let groupHeader = null;
              if (list.scoringMode === 'groups' && list.questionGroups) {
                const currentGroup = list.questionGroups.find(g => {
                  if (!g || !g.questionIds) return false;
                  const questionIds = Array.isArray(g.questionIds) ? g.questionIds : [];
                  return questionIds.includes(question.id);
                });
                const previousQuestion = index > 0 ? orderedQuestions[index - 1] : null;
                const previousGroup = previousQuestion 
                  ? list.questionGroups.find(g => {
                      if (!g || !g.questionIds) return false;
                      const questionIds = Array.isArray(g.questionIds) ? g.questionIds : [];
                      return questionIds.includes(previousQuestion.id);
                    })
                  : null;
                
                // Mostra cabeçalho se é o primeiro da lista ou se mudou de grupo
                if (currentGroup && (!previousGroup || previousGroup.id !== currentGroup.id)) {
                  groupHeader = (
                    <div key={`group-header-${currentGroup.id}`} className="flex items-center gap-3 mb-3 mt-2">
                      <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-sm font-bold rounded-full border border-blue-200 shadow-sm">
                        {currentGroup.name} ({currentGroup.percentage || currentGroup.weight}%)
                      </span>
                      <div className="flex-1 h-px bg-gradient-to-l from-blue-200 to-transparent"></div>
                    </div>
                  );
                }
              }
              
              return (
                <div key={question.id}>
                  {groupHeader}
                  <div 
                    className="border border-slate-200 rounded-2xl p-6 bg-gradient-to-r from-slate-50 to-slate-100 hover:shadow-lg transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      router.push(`/listas/${id}/questoes?q=${index}`);
                    }}
                  >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-slate-900">
                        {String.fromCharCode(65 + index)}. {question.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Status da submissão */}
                      {submission && (
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                            {submission.status === 'accepted' ? 'Aceita' :
                              submission.status === 'error' ? 'Erro' :
                              submission.status === 'pending' ? 'Pendente' :
                              submission.status === 'timeout' ? 'Timeout' : 'Enviada'}
                          </span>
                          <span className="text-sm text-slate-600">
                            {submission.score}/100
                          </span>
                        </div>
                      )}
                      {/* Botão para acessar/editar questão */}
                      {(userRole === 'professor' || userRole === 'assistant') ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            setEditingQuestion(question); 
                            setShowEditQuestionModal(true); 
                          }}
                          className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar Questão
                        </Button>
                      ) : (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/listas/${id}/questoes?q=${index}`);
                          }}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          {submission ? 'Ver Questão' : 'Resolver'}
                        </Button>
                      )}
                    </div>
                  </div>
                  {submission && (
                    <div className="mt-3 text-xs text-slate-500">
                      Última submissão: {formatDateTime(submission.submittedAt)} (Tentativa {submission.attempt})
                    </div>
                  )}
                  </div>
                </div>
              );
            })}
            {orderedQuestions.length > 3 && (
              <div className="text-center pt-4">
                <p className="text-slate-600 mb-4">
                  E mais {orderedQuestions.length - 3} questão{orderedQuestions.length - 3 !== 1 ? 'ões' : ''}...
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Verificar se há questões */}
      {!hasQuestions() && (
        <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200 rounded-2xl shadow-lg p-8 text-center">
          <div className="p-4 bg-slate-100 rounded-xl mx-auto mb-6 w-fit">
            <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhuma questão disponível</h3>
          <p className="text-slate-600 mb-6">
            Esta lista ainda não possui questões cadastradas.
          </p>
          
          {/* Botão para professor/assistant criarem questão */}
          {(userRole === 'professor' || userRole === 'assistant') && (
            <Button 
              onClick={() => setShowAddQuestionModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Criar Primeira Questão
            </Button>
          )}
        </Card>
      )}

      {/* Modal de Criação de Questão */}
      {showAddQuestionModal && (
        <QuestionModal
          isOpen={showAddQuestionModal}
          onClose={() => setShowAddQuestionModal(false)}
          onSave={async (questionData) => {
            try {
              await createQuestion({
                ...questionData,
                listId: id,
              });
              setShowAddQuestionModal(false);
              window.location.reload();
            } catch (error) {
              console.error('Erro ao criar questão:', error);
              alert('Erro ao criar questão. Por favor, tente novamente.');
            }
          }}
          title="Criar Nova Questão"
        />
      )}

      {/* Modal de Edição de Questão */}
      {showEditQuestionModal && editingQuestion && (
        <QuestionModal
          isOpen={showEditQuestionModal}
          onClose={() => {
            setShowEditQuestionModal(false);
            setEditingQuestion(null);
          }}
          onSave={async (questionData) => {
            try {
              await updateQuestion(editingQuestion.id, questionData);
              setShowEditQuestionModal(false);
              setEditingQuestion(null);
              window.location.reload();
            } catch (error) {
              console.error('Erro ao editar questão:', error);
              alert('Erro ao editar questão. Por favor, tente novamente.');
            }
          }}
          question={editingQuestion}
          title="Editar Questão"
        />
      )}

      {/* Modal de Configuração de Pontuação */}
      {showScoreConfigModal && (
        <ScoreSystemConfigModal
          isOpen={showScoreConfigModal}
          onClose={() => setShowScoreConfigModal(false)}
          list={list}
          onSave={handleSaveScoreConfig}
        />
      )}
    </div>
  );
}
