"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageLoading from "@/components/PageLoading";
import { useListPage } from "@/hooks/useListPage";
import ListTabs from "@/components/lists/ListTabs";
import QuestionTabs from "@/components/questions/QuestionTabs";

export default function QuestionsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  
  const {
    list,
    loading,
    error,
    formatDateTime,
    hasQuestions,
    userRole
  } = useListPage();

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // Reordena as questões por grupos se o modo for 'groups'
  const getOrderedQuestions = () => {
    if (!list || list.scoringMode !== 'groups' || !list.questionGroups || list.questionGroups.length === 0) {
      return list?.questions || [];
    }

    const orderedQuestions: any[] = [];
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

  // Logs de diagnóstico para inspecionar os dados retornados do backend
  useEffect(() => {
    try {
      console.log('[diagnostic] list loaded', list);
      console.log('[diagnostic] list.questionGroups', list?.questionGroups);
      console.log('[diagnostic] orderedQuestions (count)', orderedQuestions.length, orderedQuestions.map(q => q.id));
    } catch (err) {
      console.error('[diagnostic] error logging list data', err);
    }
  }, [list, orderedQuestions]);

  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam !== null && orderedQuestions.length > 0) {
      const questionIndex = parseInt(qParam, 10);
      if (!isNaN(questionIndex) && questionIndex >= 0 && questionIndex < orderedQuestions.length) {
        setActiveQuestionIndex(questionIndex);
      }
    }
  }, [searchParams, orderedQuestions]);

  if (loading) {
    return <PageLoading message="Carregando questões..." description="Preparando as informações" />;
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
              Erro ao carregar questões
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

  if (!hasQuestions()) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200 rounded-2xl shadow-lg p-8 text-center">
          <div className="p-4 bg-slate-100 rounded-xl mx-auto mb-6 w-fit">
            <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhuma questão disponível</h3>
          <p className="text-slate-600">
            Esta lista ainda não possui questões cadastradas.
          </p>
        </Card>
      </div>
    );
  }

  const questionLabels = orderedQuestions.map((_, idx) => String.fromCharCode(65 + idx));
  const activeIndex = activeQuestionIndex;
  const activeQuestion = orderedQuestions[activeIndex];

  const goToQuestion = (idx: number) => {
    setActiveQuestionIndex(idx);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
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
            <p className="text-slate-600 mt-1">Questão {questionLabels[activeIndex]}</p>
          </div>
        </div>
        
        {/* Navegação entre páginas com estilo do perfil */}
        <ListTabs id={id} activeTab="questoes" hasQuestions={!!hasQuestions()} userRole={userRole || 'student'} />
      </div>

      {/* Navegação entre questões */}
      <QuestionTabs
        labels={questionLabels}
        activeIndex={activeIndex}
        onSelect={(idx) => goToQuestion(idx)}
        userRole={userRole || 'student'}
      />


      {/* Exibe a questão ativa */}
      <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-slate-900">
              {questionLabels[activeIndex]}. {activeQuestion.title}
            </h2>
            
            {/* Badge do grupo (se modo for groups) */}
            {list.scoringMode === 'groups' && list.questionGroups && (() => {
              // Safely find group and log diagnostic info
              const group = list.questionGroups.find(g => {
                if (!g || !g.questionIds) return false;
                const qids = Array.isArray(g.questionIds) ? g.questionIds : [];
                return qids.includes(activeQuestion.id);
              });
              try {
                console.log('[diagnostic] activeQuestion.id', activeQuestion?.id, 'foundGroup', group?.id ?? null);
              } catch (e) {
                console.error('[diagnostic] error logging active question group', e);
              }
              return group ? (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full border border-blue-200">
                  {group.name}
                </span>
              ) : null;
            })()}
          </div>
          
          {/* Enunciado */}
          {activeQuestion.statement && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Enunciado</h3>
              <div className="text-slate-700 text-base leading-relaxed bg-slate-50 rounded-xl p-4">
                {activeQuestion.statement}
              </div>
            </div>
          )}

          {/* Entrada */}
          {activeQuestion.input_format && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Entrada</h3>
              <div className="text-slate-700 text-base leading-relaxed bg-slate-50 rounded-xl p-4">
                {activeQuestion.input_format}
              </div>
            </div>
          )}

          {/* Saída */}
          {activeQuestion.output_format && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Saída</h3>
              <div className="text-slate-700 text-base leading-relaxed bg-slate-50 rounded-xl p-4">
                {activeQuestion.output_format}
              </div>
            </div>
          )}

          {/* Restrições */}
          {activeQuestion.constraints && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Restrições</h3>
              <div className="text-slate-700 text-base leading-relaxed bg-slate-50 rounded-xl p-4">
                {activeQuestion.constraints}
              </div>
            </div>
          )}

          {/* Exemplos */}
          {activeQuestion.examples && activeQuestion.examples.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Exemplos</h3>
              <div className="space-y-4">
                {activeQuestion.examples.map((example: { input: string; output: string }, idx: number) => (
                  <div key={idx} className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-slate-600 mb-3">Exemplo {idx + 1}:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-2">Entrada:</p>
                        <pre className="bg-white rounded-lg p-3 text-sm text-slate-800 font-mono border border-slate-200 overflow-x-auto">
                          {example.input}
                        </pre>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-2">Saída:</p>
                        <pre className="bg-white rounded-lg p-3 text-sm text-slate-800 font-mono border border-slate-200 overflow-x-auto">
                          {example.output}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          {activeQuestion.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">📝 Observações</h3>
              <div className="text-slate-700 text-base leading-relaxed bg-amber-50 rounded-xl p-4 border border-amber-200">
                {activeQuestion.notes}
              </div>
            </div>
          )}

        </div>
      </Card>
    </div>
  );
}
