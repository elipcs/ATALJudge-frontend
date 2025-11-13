"use client";

import { useState, useEffect } from "react";
import * as testCasesService from "@/services/testCases";
import { logger } from "@/utils/logger";
import { API } from "@/config/api";
import { generateTestCases, GenerateTestCasesRequest, GeneratedTestCase } from "@/services/testCases";

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
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Estados para geração automática
  const [showGenerator, setShowGenerator] = useState(false);
  const [oracleCode, setOracleCode] = useState("");
  const [oracleLanguage, setOracleLanguage] = useState<'python' | 'java'>('python');
  const [testCaseCount, setTestCaseCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTestCases, setGeneratedTestCases] = useState<GeneratedTestCase[]>([]);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTestCases();
      loadQuestionData();
      setSaveSuccess(false);
    }
  }, [isOpen, questionId]);

  const loadQuestionData = async () => {
    try {
      const result = await API.questions.get(questionId);
      const question = result.data;
      if (question) {
        setSubmissionType(question.submissionType || 'local');
        if (question.contestId) {
          setCodeforcesContestId(question.contestId);
        }
        if (question.problemIndex) {
          setCodeforcesProblemIndex(question.problemIndex);
        }
      }
    } catch (error) {
      logger.error('Erro ao carregar dados da questão', error);
      // Se falhar, manter o padrão 'local'
    }
  };

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
      logger.error('Erro ao carregar casos de teste', err);
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

    // IDs temporários (new- ou generated-) podem ser removidos diretamente
    if (id.startsWith("new-") || id.startsWith("generated-")) {
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
      logger.error('Erro ao remover caso de teste', error);
      setError(error?.message || "Erro ao remover caso de teste. Tente novamente.");
      setDeleteConfirm({ isOpen: false, testCaseId: null, testCaseName: "" });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, testCaseId: null, testCaseName: "" });
  };

  const removeAllTestCases = async () => {
    if (testCases.length === 0) {
      setError("Não há casos de teste para remover.");
      return;
    }

    setIsDeletingAll(true);
    setError(null);

    try {
      // Separar casos salvos (que precisam ser deletados do backend)
      const savedCases = testCases.filter(tc => 
        !tc.id.startsWith("new-") && !tc.id.startsWith("generated-")
      );

      if (savedCases.length === 0) {
        // Se não há casos salvos, apenas limpar os temporários
        setTestCases([
          {
            id: "new-1",
            input: "",
            expectedOutput: "",
            isSample: true,
            weight: 10,
          },
        ]);
        setDeleteAllConfirm(false);
        return;
      }

      // Deletar casos salvos do backend
      const deleteResults = await Promise.allSettled(
        savedCases.map(async (tc) => {
          try {
            await testCasesService.deleteTestCase(questionId, tc.id);
            logger.debug('Caso de teste deletado', { testCaseId: tc.id });
            return { success: true, testCaseId: tc.id };
          } catch (error: any) {
            logger.error('Erro ao deletar caso de teste', error, { testCaseId: tc.id });
            return { success: false, testCaseId: tc.id, error: error?.message || String(error) };
          }
        })
      );

      // Verificar se houve erros
      const succeeded: any[] = [];
      const failed: any[] = [];
      
      deleteResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value && result.value.success) {
          succeeded.push(result.value);
        } else {
          const testCaseId = savedCases[index]?.id || 'unknown';
          const error = result.status === 'rejected' 
            ? result.reason 
            : (result.status === 'fulfilled' && result.value ? result.value.error : 'Erro desconhecido');
          failed.push({ testCaseId, error });
        }
      });

      if (failed.length > 0) {
        logger.warn('Alguns casos de teste não foram deletados', { 
          total: savedCases.length,
          succeeded: succeeded.length,
          failed: failed.length 
        });
        setError(`Alguns casos de teste não puderam ser removidos (${succeeded.length}/${savedCases.length} removidos). Tente novamente.`);
      }

      // Recarregar casos de teste do servidor para garantir sincronização
      await loadTestCases();

      logger.info('Todos os casos de teste foram removidos', { 
        total: savedCases.length,
        succeeded: succeeded.length,
        failed: failed.length 
      });
      
      setDeleteAllConfirm(false);
      
      if (failed.length === 0) {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 2000);
      }
    } catch (error: any) {
      logger.error('Erro ao remover todos os casos de teste', error);
      setError(error?.message || "Erro ao remover casos de teste. Tente novamente.");
      
      // Tentar recarregar mesmo em caso de erro para ver o estado atual
      try {
        await loadTestCases();
      } catch (loadError) {
        logger.error('Erro ao recarregar casos de teste após erro na deleção', loadError);
      }
    } finally {
      setIsDeletingAll(false);
    }
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
    
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      // Lógica condicional baseada no tipo
      if (submissionType === 'local') {
        // Submissão LOCAL: Atualizar tipo e salvar casos de teste
        logger.debug('Atualizando tipo de submissão para local', { submissionType });
        await API.questions.update(questionId, {
          submissionType: submissionType
        });
        
        const hasEmptyFields = testCases.some(
          (tc) => !tc.input.trim() || !tc.expectedOutput.trim()
        );

        if (hasEmptyFields) {
          setError("Por favor, preencha todos os campos de entrada e saída esperada.");
          setIsSaving(false);
          return;
        }
        
        logger.debug('Salvando casos de teste', { 
          total: testCases.length,
          novos: testCases.filter((tc) => tc.id.startsWith("new-")).length,
          existentes: testCases.filter((tc) => !tc.id.startsWith("new-")).length
        });
        
        // Casos novos são aqueles que começam com "new-" ou "generated-"
        const newCases = testCases.filter((tc) => 
          tc.id.startsWith("new-") || tc.id.startsWith("generated-")
        );
        // Casos existentes são aqueles com IDs reais do banco (UUIDs)
        const existingCases = testCases.filter((tc) => 
          !tc.id.startsWith("new-") && !tc.id.startsWith("generated-")
        );

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

        if (onSave) {
          onSave(testCases);
        }

        setSaveSuccess(true);
        await loadTestCases();
        
      } else if (submissionType === 'codeforces') {
        // Submissão CODEFORCES: Validar e salvar campos
        // O backend automaticamente muda o submissionType para 'codeforces'
        if (!codeforcesContestId || !codeforcesProblemIndex) {
          setError('ID do Contest e Índice do Problema são obrigatórios');
          setIsSaving(false);
          return;
        }
        
        if (!/^\d+$/.test(codeforcesContestId)) {
          setError('ID do Contest deve conter apenas números');
          setIsSaving(false);
          return;
        }
        
        if (!/^[A-Za-z]\d*$/.test(codeforcesProblemIndex)) {
          setError('Índice do Problema inválido (ex: A, B, C1)');
          setIsSaving(false);
          return;
        }
        
        logger.debug('Salvando configuração do Codeforces (tipo atualizado automaticamente)');
        // ✅ APENAS 1 CHAMADA: atualiza campos CF + muda tipo automaticamente
        await API.questions.updateCodeforces(questionId, {
          contestId: codeforcesContestId,
          problemIndex: codeforcesProblemIndex.toUpperCase()
        });
        
        setSaveSuccess(true);
      }
      
      // Fecha o modal após 1.5 segundos
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error: any) {
      logger.error('Erro ao salvar configuração', error);
      setError(error.response?.data?.message || error?.message || "Erro ao salvar configuração. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const calculateTotalPoints = () => {
    return testCases.reduce((sum, tc) => sum + tc.weight, 0);
  };

  const handleGenerateTestCases = async () => {
    if (!oracleCode.trim()) {
      setGenerationError('Por favor, insira o código oráculo');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedTestCases([]);

    try {
      const request: GenerateTestCasesRequest = {
        oracleCode,
        language: oracleLanguage,
        count: testCaseCount
      };

      const result = await generateTestCases(questionId, request);
      
      if (result.testCases.length === 0) {
        setGenerationError('Nenhum caso de teste foi gerado. Verifique o código oráculo.');
        setIsGenerating(false);
        return;
      }

      // O backend já salva os casos automaticamente, apenas recarregar a lista
      console.log('[TestCasesModal] Casos de teste gerados pelo backend', { 
        count: result.totalGenerated,
        questionId 
      });
      logger.info('Casos de teste gerados pelo backend', { 
        totalGenerated: result.totalGenerated,
        totalReturned: result.testCases.length
      });

      // Recarregar casos de teste do banco para atualizar a lista
      console.log('[TestCasesModal] Recarregando casos de teste após geração');
      await loadTestCases();
      console.log('[TestCasesModal] Casos de teste recarregados');
      
      // Limpar o formulário de geração
      setOracleCode('');
      setShowGenerator(false);
      setGeneratedTestCases([]);

      // Mostrar mensagem de sucesso
      if (result.totalGenerated > 0) {
        const successMessage = `${result.totalGenerated} caso${result.totalGenerated > 1 ? 's' : ''} de teste gerado${result.totalGenerated > 1 ? 's' : ''} e salvo${result.totalGenerated > 1 ? 's' : ''} com sucesso`;
        console.log('[TestCasesModal] Casos gerados com sucesso', { 
          totalGenerated: result.totalGenerated 
        });
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        setGenerationError('Nenhum caso de teste foi gerado. Todos podem ter sido duplicados ou houve um erro.');
      }

      if (result.algorithmTypeDetected) {
        logger.info('Tipo de algoritmo detectado', { type: result.algorithmTypeDetected });
      }
    } catch (error: any) {
      logger.error('Erro ao gerar casos de teste', error);
      
      // Verificar se é um erro de timeout
      if (error.name === 'AbortError' || error.message?.includes('Timeout') || error.message?.includes('timeout')) {
        setGenerationError(
          'A geração de casos de teste está demorando mais que o esperado. ' +
          'Os casos podem estar sendo gerados em segundo plano. ' +
          'Por favor, aguarde alguns instantes e recarregue a página para verificar se os casos foram criados.'
        );
        // Tentar recarregar os casos de teste após um delay para verificar se foram criados
        setTimeout(async () => {
          try {
            await loadTestCases();
            logger.info('Casos de teste recarregados após timeout');
          } catch (reloadError) {
            logger.error('Erro ao recarregar casos de teste após timeout', reloadError);
          }
        }, 5000);
      } else {
        setGenerationError(
          error.response?.data?.message || 
          error.message || 
          'Erro ao gerar casos de teste. Verifique o código oráculo.'
        );
      }
    } finally {
      setIsGenerating(false);
    }
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
                {/* Seção: Gerador Automático de Casos de Teste */}
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Gerar Casos de Teste Automaticamente</h3>
                      <p className="text-xs text-slate-600 mt-1">
                        Use um código oráculo (Python ou Java) para gerar casos de teste automaticamente
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowGenerator(!showGenerator)}
                      className="px-3 py-1 text-sm font-medium text-purple-600 bg-white rounded-lg hover:bg-purple-50 transition-all duration-200 border border-purple-200"
                    >
                      {showGenerator ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>

                  {showGenerator && (
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Linguagem do Oráculo
                          </label>
                          <select
                            value={oracleLanguage}
                            onChange={(e) => setOracleLanguage(e.target.value as 'python' | 'java')}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-slate-900"
                          >
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Quantidade de Casos
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="200"
                            value={testCaseCount}
                            onChange={(e) => setTestCaseCount(parseInt(e.target.value) || 10)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Código Oráculo
                        </label>
                        <textarea
                          value={oracleCode}
                          onChange={(e) => setOracleCode(e.target.value)}
                          placeholder={oracleLanguage === 'python' 
                            ? 'n = int(input())\narr = list(map(int, input().split()))\n# Seu código aqui\nprint(result)'
                            : 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Seu código aqui\n    }\n}'
                          }
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-slate-900 placeholder:text-slate-500 h-32 text-sm font-mono"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          O código deve ler da entrada padrão (stdin) e imprimir a saída esperada
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleGenerateTestCases}
                        disabled={isGenerating || !oracleCode.trim()}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Gerando casos de teste... (pode demorar alguns minutos)
                          </span>
                        ) : (
                          'Gerar Casos de Teste'
                        )}
                      </button>

                      {generationError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-800">{generationError}</p>
                        </div>
                      )}

                      {generatedTestCases.length > 0 && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm font-semibold text-green-800">
                              {generatedTestCases.length} casos gerados e salvos automaticamente!
                            </p>
                          </div>
                          <p className="text-xs text-green-700">
                            Os casos de teste foram adicionados à lista abaixo. Você pode editá-los antes de salvar.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Casos de Teste</label>
                    <p className="text-xs text-slate-500 mt-1">
                      Configure os casos de teste que serão usados para avaliar as submissões
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {testCases.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setDeleteAllConfirm(true)}
                        disabled={isSaving || isDeletingAll}
                        className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Remover Todos
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={addTestCase}
                      disabled={isSaving}
                      className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + Adicionar Caso
                    </button>
                  </div>
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

      {deleteAllConfirm && (
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
                  Confirmar Exclusão de Todos os Casos
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Tem certeza que deseja remover <span className="font-semibold">todos os {testCases.length} casos de teste</span>? 
                  Esta ação não pode ser desfeita. Um novo caso vazio será criado automaticamente.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteAllConfirm(false)}
                    disabled={isDeletingAll}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={removeAllTestCases}
                    disabled={isDeletingAll}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeletingAll ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Removendo...
                      </span>
                    ) : (
                      "Sim, Remover Todos"
                    )}
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
