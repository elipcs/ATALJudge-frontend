"use client";

import { useState, useEffect } from "react";
import * as testCasesService from "@/services/testCases";
import { logger } from "@/utils/logger";

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
  weight: number;
  order?: number;
}

interface TestCasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  onSave?: (testCases: TestCase[]) => void;
}

export default function TestCasesModal({
  isOpen,
  onClose,
  questionId,
  onSave,
}: TestCasesModalProps) {
  const [submissionType, setSubmissionType] = useState<"local" | "codeforces">("local");
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: "1",
      input: "",
      expectedOutput: "",
      isSample: true,
      weight: 10,
    },
  ]);
  const [codeforcesContestId, setCodeforcesContestId] = useState("");
  const [codeforcesProblemIndex, setCodeforcesProblemIndex] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    testCaseId: string | null;
    testCaseName: string;
  }>({
    isOpen: false,
    testCaseId: null,
    testCaseName: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadTestCases();
      setSaveSuccess(false);
    }
  }, [isOpen, questionId]);

  const loadTestCases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      logger.debug('Carregando casos de teste', { questionId });
      const cases = await testCasesService.getTestCases(questionId);
      logger.debug('Casos de teste carregados', { 
        count: cases?.length, 
        isArray: Array.isArray(cases) 
      });
      
      if (Array.isArray(cases) && cases.length > 0) {
        logger.debug('Mapeando casos de teste', { count: cases.length });
        setTestCases(
          cases.map((tc, index) => ({
            id: tc.id,
            input: tc.input,
            expectedOutput: tc.expectedOutput,  
            isSample: tc.isSample,
            weight: tc.weight,
            order: index,
          }))
        );
      } else {
        logger.info('Nenhum caso de teste encontrado, inicializando com caso vazio');
        setTestCases([
          {
            id: "new-1",
            input: "",
            expectedOutput: "",
            isSample: true,
            weight: 10,
          },
        ]);
      }
    } catch (err) {
      logger.error('Erro ao carregar casos de teste', { error: err });
      setError("Erro ao carregar casos de teste. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const addTestCase = () => {
    const newTestCase: TestCase = {
      id: `new-${Date.now()}`,
      input: "",
      expectedOutput: "",
      isSample: false,
      weight: 10,
      order: testCases.length,
    };
    setTestCases([...testCases, newTestCase]);
  };

  const removeTestCase = async (id: string, testCaseName: string) => {
    if (testCases.length === 1) {
      setError("Deve haver pelo menos um caso de teste.");
      return;
    }

    if (id.startsWith("new-")) {
      setTestCases(testCases.filter((tc) => tc.id !== id));
      return;
    }

    setDeleteConfirm({
      isOpen: true,
      testCaseId: id,
      testCaseName,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.testCaseId) return;

    try {
      logger.debug('Deletando caso de teste', { testCaseId: deleteConfirm.testCaseId });
      await testCasesService.deleteTestCase(questionId, deleteConfirm.testCaseId);
      logger.info('Caso de teste deletado com sucesso');
      
      setTestCases(testCases.filter((tc) => tc.id !== deleteConfirm.testCaseId));
      setDeleteConfirm({ isOpen: false, testCaseId: null, testCaseName: "" });
    } catch (error: any) {
      logger.error('Erro ao remover caso de teste', { error });
      setError(error?.message || "Erro ao remover caso de teste. Tente novamente.");
      setDeleteConfirm({ isOpen: false, testCaseId: null, testCaseName: "" });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, testCaseId: null, testCaseName: "" });
  };

  const updateTestCase = (
    id: string,
    field: keyof TestCase,
    value: string | boolean | number
  ) => {
    setTestCases(
      testCases.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasEmptyFields = testCases.some(
      (tc) => !tc.input.trim() || !tc.expectedOutput.trim()
    );

    if (hasEmptyFields) {
      setError("Por favor, preencha todos os campos de entrada e saída esperada.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      logger.debug('Salvando casos de teste', { 
        total: testCases.length,
        novos: testCases.filter((tc) => tc.id.startsWith("new-")).length,
        existentes: testCases.filter((tc) => !tc.id.startsWith("new-")).length
      });
      
      const newCases = testCases.filter((tc) => tc.id.startsWith("new-"));
      const existingCases = testCases.filter((tc) => !tc.id.startsWith("new-"));

      const createdIds: string[] = [];

      for (let i = 0; i < newCases.length; i++) {
        const tc = newCases[i];
        logger.debug('Criando caso de teste');
        const created = await testCasesService.createTestCase(questionId, {
          questionId,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isSample: tc.isSample,
          weight: tc.weight,
          order: i,
        });
        createdIds.push(created.id);
        logger.debug('Caso criado', { id: created.id });
      }

      for (let i = 0; i < existingCases.length; i++) {
        const tc = existingCases[i];
        logger.debug('Atualizando caso de teste', { id: tc.id });
        await testCasesService.updateTestCase(questionId, tc.id, {
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isSample: tc.isSample,
          weight: tc.weight,
          order: newCases.length + i,
        });
      }

      const allIds = [...createdIds, ...existingCases.map((tc) => tc.id)];
      
      if (allIds.length > 0) {
        logger.debug('Reordenando casos de teste', { ids: allIds });
        await testCasesService.reorderTestCases(questionId, allIds);
      }

      if (onSave) {
        onSave(testCases);
      }

      setSaveSuccess(true);
      
      await loadTestCases();
      
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error: any) {
      logger.error('Erro ao salvar casos de teste', { error });
      setError(error.response?.data?.message || "Erro ao salvar casos de teste. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const calculateTotalPoints = () => {
    return testCases.reduce((sum, tc) => sum + tc.weight, 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-4xl mx-4 my-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Gerenciar Submissão</h2>
        </div>

        {/* Seletor de tipo de submissão */}
        <div className="mb-8">
          {/* Botão: Submissão Local */}
          <button
            type="button"
            onClick={() => setSubmissionType('local')}
            className={`w-full text-left border-2 rounded-xl p-4 cursor-pointer transition-all mb-3 ${
              submissionType === 'local'
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                submissionType === 'local'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-slate-300'
              }`}>
                {submissionType === 'local' && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900">Submissão Local</div>
                <div className="text-sm text-slate-600 mt-1">Configure casos de teste diretamente nesta plataforma</div>
              </div>
            </div>
          </button>

          {/* Botão: Codeforces */}
          <button
            type="button"
            onClick={() => setSubmissionType('codeforces')}
            className={`w-full text-left border-2 rounded-xl p-4 cursor-pointer transition-all ${
              submissionType === 'codeforces'
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                submissionType === 'codeforces'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-slate-300'
              }`}>
                {submissionType === 'codeforces' && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900">Codeforces</div>
                <div className="text-sm text-slate-600 mt-1">Integre com um problema existente do Codeforces</div>
              </div>
            </div>
          </button>
        </div>

        {}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-800 font-semibold">Casos de teste salvos com sucesso!</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seção: Submissão Local */}
            {submissionType === 'local' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Casos de Teste</label>
                    <p className="text-xs text-slate-500 mt-1">
                      Configure os casos de teste que serão usados para avaliar as submissões
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addTestCase}
                    disabled={isSaving}
                    className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Adicionar Caso
                  </button>
                </div>
                
                <div className="space-y-4">
                  {testCases.map((testCase, index) => (
                    <div key={testCase.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-slate-700">Caso de Teste {index + 1}</span>
                        {testCases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTestCase(testCase.id, `Caso de Teste ${index + 1}`)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Entrada</label>
                          <textarea
                            value={testCase.input}
                            onChange={(e) => updateTestCase(testCase.id, "input", e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-slate-900 placeholder:text-slate-500 h-20 text-sm font-mono"
                            placeholder="Digite a entrada do caso de teste..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Saída Esperada</label>
                          <textarea
                            value={testCase.expectedOutput}
                            onChange={(e) => updateTestCase(testCase.id, "expectedOutput", e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-slate-900 placeholder:text-slate-500 h-20 text-sm font-mono"
                            placeholder="Digite a saída esperada..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`public-${testCase.id}`}
                            checked={testCase.isSample}
                            onChange={(e) => updateTestCase(testCase.id, "isSample", e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`public-${testCase.id}`}
                            className="text-xs font-medium text-slate-700 cursor-pointer"
                          >
                            Visível para os alunos (caso público)
                          </label>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Pontuação</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={testCase.weight}
                            onChange={(e) => updateTestCase(testCase.id, "weight", parseInt(e.target.value) || 0)}
                            className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 font-semibold mb-1">
                        Pontuação Total: {calculateTotalPoints()} pontos
                      </p>
                      <p className="text-xs text-blue-700">
                        Casos públicos são visíveis aos alunos e ajudam no entendimento do problema. 
                        Casos privados são usados apenas na avaliação final.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* Seção: Submissão Codeforces */}
          {submissionType === 'codeforces' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-blue-800 font-semibold mb-1">Integração com Codeforces</p>
                    <p className="text-xs text-blue-700">
                      Configure esta questão para usar casos de teste do Codeforces.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    ID do Contest
                  </label>
                  <input
                    type="text"
                    value={codeforcesContestId}
                    onChange={(e) => setCodeforcesContestId(e.target.value)}
                    placeholder="Ex: 1234"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-slate-900 placeholder:text-slate-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Identificador único do contest no Codeforces</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Índice do Problema
                  </label>
                  <input
                    type="text"
                    value={codeforcesProblemIndex}
                    onChange={(e) => setCodeforcesProblemIndex(e.target.value)}
                    placeholder="Ex: A, B, C..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-slate-900 placeholder:text-slate-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Letra do problema (A, B, C, etc)</p>
                </div>
              </div>

              {(codeforcesContestId || codeforcesProblemIndex) && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-green-800 font-semibold">
                        Link: https://codeforces.com/contest/{codeforcesContestId}/problem/{codeforcesProblemIndex}
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Quando configurado, os casos de teste serão importados do Codeforces
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 h-12 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isSaving || saveSuccess}
              className={`flex-1 h-12 px-4 text-sm font-medium text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform font-semibold disabled:cursor-not-allowed ${
                saveSuccess
                  ? "bg-green-500 hover:bg-green-600 focus:ring-green-500"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500 hover:scale-[1.02] disabled:opacity-50"
              }`}
            >
              {saveSuccess ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Salvos com sucesso!
                </span>
              ) : isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </span>
              ) : (
                "Salvar"
              )}
            </button>
          </div>
        </form>
        )}
      </div>

      {}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Confirmar Exclusão
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Tem certeza que deseja remover o <span className="font-semibold">{deleteConfirm.testCaseName}</span>? 
                  Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Sim, Remover
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
