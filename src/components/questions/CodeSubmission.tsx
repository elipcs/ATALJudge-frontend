"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TestCasesModal from "./TestCasesModal";
import { UserRole } from "@/types";
import { submissionsApi, SubmissionResultsResponse } from "@/services/submissions";
import { logger } from "@/utils/logger";

interface CodeSubmissionProps {
  questionId: string;
  listId: string;
  userRole?: UserRole;
  onSubmit?: (code: string, language: string) => void;
}

export default function CodeSubmission({
  questionId,
  listId,
  userRole,
  onSubmit,
}: CodeSubmissionProps) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestCasesModalOpen, setIsTestCasesModalOpen] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionInfo, setSubmissionInfo] = useState<{
    id: string;
    status: string;
    language: string;
    createdAt: string;
    code: string;
  } | null>(null);
  const [isPollingStatus, setIsPollingStatus] = useState(false);
  const [submissionResults, setSubmissionResults] = useState<SubmissionResultsResponse | null>(null);
  const [result, setResult] = useState<{
    status: "success" | "error" | "partial" | "running";
    message: string;
    details?: string;
    resultsData?: SubmissionResultsResponse;
  } | null>(null);

  const isProfessorOrMonitor = userRole === "professor" || userRole === "assistant";

  useEffect(() => {
    if (!showSubmissionModal || !submissionInfo?.id) return;
    
    const currentStatus = submissionInfo.status.toLowerCase();
    if (currentStatus !== 'pending' && currentStatus !== 'running') {
      setIsPollingStatus(false);
      return;
    }

    setIsPollingStatus(true);

    const pollStatusInterval = setInterval(async () => {
      try {
        const submission = await submissionsApi.getSubmission(submissionInfo.id);
        if (!submission) return;

        const newStatus = submission.status.toLowerCase();
        
        setSubmissionInfo(prev => prev ? { ...prev, status: newStatus } : null);

        if (newStatus === 'completed') {
          try {
            // NOTA: Endpoint /submissions/{id}/results foi removido do backend
            // Os resultados agora vêm diretamente na resposta da submissão
            logger.warn('Endpoint de resultados não disponível');
            // const resultsData = await submissionsApi.getSubmissionResults(submissionInfo.id);
            // setSubmissionResults(resultsData);
          } catch (error) {
            logger.error('Erro ao buscar resultados da submissão', { error });
          }
        }

        if (newStatus !== 'pending' && newStatus !== 'running') {
          setIsPollingStatus(false);
          clearInterval(pollStatusInterval);
        }
      } catch (error) {
        logger.error('Erro ao buscar status da submissão no modal', { error });
      }
    }, 2000);

    return () => {
      clearInterval(pollStatusInterval);
      setIsPollingStatus(false);
    };
  }, [showSubmissionModal, submissionInfo?.id, submissionInfo?.status]);

  useEffect(() => {
    if (!submissionId || result?.status !== "running") return;

    const pollInterval = setInterval(async () => {
      try {
        const submission = await submissionsApi.getSubmission(submissionId);
        if (!submission) return;

        if (submission.status === "RUNNING" || submission.status === "PENDING") {
          return;
        }

        if (submission.status === "COMPLETED") {
          // NOTA: Endpoint /submissions/{id}/results foi removido do backend
          // Os resultados agora vêm diretamente no objeto submission
          logger.warn('Endpoint de resultados não disponível');
          
          setResult({
            status: "success",
            message: `Submissão concluída`,
            details: `Pontuação: ${submission.totalScore || 0} pontos`,
          });
        } else if (submission.status === "FAILED") {
          setResult({
            status: "error",
            message: "Erro ao avaliar submissão",
            details: "Ocorreu um erro durante a avaliação. Tente novamente.",
          });
        }

        clearInterval(pollInterval);
        setIsSubmitting(false);
      } catch (error) {
        logger.error('Erro ao buscar status da submissão', { error });
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [submissionId, result?.status]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      setResult({
        status: "error",
        message: "Por favor, insira algum código antes de enviar.",
      });
      return;
    }

    setIsSubmitting(true);
    setResult(null);
    setSubmissionId(null);

    try {
      const submission = await submissionsApi.submitCode({
        questionId: questionId,  
        listId: listId,
        language: language,
        code: code,
      });

      if (submission && submission.id) {
        setSubmissionId(submission.id);
        
        setSubmissionInfo({
          id: submission.id,
          status: submission.status,
          language: submission.language,
          createdAt: submission.createdAt,
          code: code,
        });
        setShowSubmissionModal(true);
        
        setResult({
          status: "running",
          message: "Código submetido! Aguardando avaliação...",
          details: "Os casos de teste estão sendo executados.",
        });

        if (onSubmit) {
          onSubmit(code, language);
        }
      } else {
        throw new Error("Resposta inválida do servidor: submissão sem ID");
      }
    } catch (error: any) {
      logger.error('Erro ao submeter código', { error });
      setResult({
        status: "error",
        message: "Erro ao submeter código",
        details: error.response?.data?.message || error.message || "Erro desconhecido",
      });
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setCode("");
    setResult(null);
  };

  const getResultColor = () => {
    if (!result) return "";
    switch (result.status) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "partial":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "running":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "";
    }
  };

  const getResultIcon = () => {
    if (!result) return null;
    switch (result.status) {
      case "success":
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case "partial":
        return (
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
    }
  };

  return (
    <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6 h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Submissão de Código
            </h3>
            <p className="text-sm text-slate-600">
              Escreva sua solução e envie para avaliação
            </p>
          </div>
          {isProfessorOrMonitor && (
            <Button
              onClick={() => setIsTestCasesModalOpen(true)}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-xl font-semibold transition-all duration-200"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Gerenciar Testes
            </Button>
          )}
        </div>
      </div>

      {/* Seletor de Linguagem */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Linguagem de Programação
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full bg-white border-slate-300 border rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
      </div>

      {/* Editor de Código */}
      <div className="mb-4 flex-1 flex flex-col">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Seu Código
        </label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={
            language === "python"
              ? "# Escreva seu código Python aqui\ndef main():\n    pass\n\nif __name__ == '__main__':\n    main()"
              : "// Escreva seu código Java aqui\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}"
          }
          className="flex-1 min-h-[300px] w-full p-4 font-mono text-sm bg-slate-900 text-green-400 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          spellCheck={false}
        />
      </div>

      {/* Resultado */}
      {result && (
        <div
          className={`mb-4 p-4 rounded-xl border ${getResultColor()} transition-all duration-300`}
        >
          <div className="flex items-start gap-3">
            {getResultIcon()}
            <div className="flex-1">
              <p className="font-semibold mb-1">{result.message}</p>
              {result.details && (
                <p className="text-sm opacity-90">{result.details}</p>
              )}
              
              {/* Resultados detalhados */}
              {result.resultsData && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-semibold text-slate-700">
                    Resultados por caso de teste:
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {result.resultsData.results.map((testResult, idx) => (
                      <div
                        key={testResult.id}
                        className={`text-xs p-2 rounded ${
                          testResult.passed
                            ? "bg-green-50 text-green-800"
                            : "bg-red-50 text-red-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            Caso {idx + 1} {testResult.testCaseName ? `(${testResult.testCaseName})` : ""}
                          </span>
                          <span className="font-semibold">
                            {testResult.passed ? "✓ Passou" : "✗ Falhou"} ({testResult.pointsAwarded} pts)
                          </span>
                        </div>
                        {testResult.executionTimeMs && (
                          <div className="text-xs opacity-75 mt-1">
                            Tempo: {testResult.executionTimeMs}ms | 
                            Memória: {testResult.memoryKb ? `${Math.round(testResult.memoryKb / 1024)}MB` : "N/A"}
                          </div>
                        )}
                        {!testResult.passed && testResult.stderr && (
                          <div className="text-xs mt-1 font-mono bg-red-100 p-1 rounded">
                            {testResult.stderr.substring(0, 100)}
                            {testResult.stderr.length > 100 && "..."}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !code.trim()}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Enviando...
            </span>
          ) : (
            "Enviar Solução"
          )}
        </Button>
        <Button
          onClick={handleClear}
          disabled={isSubmitting}
          variant="outline"
          className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Limpar
        </Button>
      </div>

      {/* Dicas */}
      <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-xs text-blue-800">
          <span className="font-semibold">Dica:</span> Seu código será
          testado contra múltiplos casos de teste. Certifique-se de seguir o
          formato de entrada e saída especificado.
        </p>
      </div>

      {/* Modal de Casos de Teste */}
      <TestCasesModal
        isOpen={isTestCasesModalOpen}
        onClose={() => setIsTestCasesModalOpen(false)}
        questionId={questionId}
        onSave={() => {
          logger.info('Casos de teste salvos');
        }}
      />

      {/* Modal de Confirmação de Submissão */}
      <Dialog open={showSubmissionModal} onOpenChange={setShowSubmissionModal}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {submissionInfo?.status.toLowerCase() === 'completed' ? (
                <>
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-600">Submissão Concluída!</span>
                </>
              ) : submissionInfo?.status.toLowerCase() === 'failed' ? (
                <>
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-600">Submissão Falhou</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-blue-600">Processando Submissão...</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {submissionInfo?.status.toLowerCase() === 'completed' 
                ? 'Seu código foi avaliado com sucesso!'
                : submissionInfo?.status.toLowerCase() === 'failed'
                ? 'Ocorreu um erro ao avaliar seu código.'
                : 'Seu código foi recebido e está sendo avaliado.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Status e Informações Básicas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-slate-700">Status:</p>
                  {isPollingStatus && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Atualizando...
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    submissionInfo?.status.toLowerCase() === 'pending' ? 'bg-yellow-500 animate-pulse' :
                    submissionInfo?.status.toLowerCase() === 'running' ? 'bg-blue-500 animate-pulse' :
                    submissionInfo?.status.toLowerCase() === 'completed' ? 'bg-green-500' :
                    submissionInfo?.status.toLowerCase() === 'failed' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}></span>
                  <p className="text-sm text-slate-900 font-medium capitalize">
                    {submissionInfo?.status.toLowerCase() === 'pending' ? 'Pendente' :
                     submissionInfo?.status.toLowerCase() === 'running' ? 'Executando' :
                     submissionInfo?.status.toLowerCase() === 'completed' ? 'Concluído' :
                     submissionInfo?.status.toLowerCase() === 'failed' ? 'Falhou' :
                     submissionInfo?.status}
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm font-semibold text-slate-700 mb-1">Linguagem:</p>
                <p className="text-sm text-slate-900 font-medium uppercase">{submissionInfo?.language}</p>
              </div>
            </div>

            {/* Resultados dos Testes */}
            {submissionResults && submissionInfo?.status.toLowerCase() === 'completed' && (
              <div className="space-y-3">
                {/* Sumário */}
                <div className={`p-4 rounded-lg border-2 ${
                  submissionResults.summary.passedCount === submissionResults.summary.totalCases
                    ? 'bg-green-50 border-green-300'
                    : 'bg-yellow-50 border-yellow-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-800">Resultado da Avaliação</h3>
                    {submissionResults.summary.passedCount === submissionResults.summary.totalCases ? (
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Casos de Teste</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {submissionResults.summary.passedCount}/{submissionResults.summary.totalCases}
                      </p>
                      <p className="text-xs text-slate-500">casos passaram</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Pontuação</p>
                      <p className="text-2xl font-bold text-slate-900">
                      T{submissionResults.summary.earnedPoints}/{submissionResults.summary.totalPoints}
                      </p>
                      <p className="text-xs text-slate-500">pontos obtidos</p>
                    </div>
                  </div>
                </div>

                {/* Lista de Resultados dos Casos de Teste */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700">Detalhes dos Casos de Teste:</h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {submissionResults.results.map((testResult, idx) => (
                      <div
                        key={testResult.id}
                        className={`p-3 rounded-lg border ${
                          testResult.passed
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold">
                            {testResult.isPublic ? '🔓' : '🔒'} Caso {idx + 1}
                            {testResult.testCaseName && ` - ${testResult.testCaseName}`}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              testResult.passed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                            }`}>
                              {testResult.passed ? '✓ Passou' : '✗ Falhou'}
                            </span>
                            <span className="text-xs text-slate-600 font-medium">
                              {testResult.pointsAwarded} pts
                            </span>
                          </div>
                        </div>
                        
                        {testResult.executionTimeMs !== undefined && (
                          <div className="text-xs text-slate-600 mt-1 flex gap-3">
                            <span>⏱️ {testResult.executionTimeMs}ms</span>
                            {testResult.memoryKb && (
                              <span>💾 {Math.round(testResult.memoryKb / 1024)}MB</span>
                            )}
                          </div>
                        )}
                        
                        {!testResult.passed && testResult.isPublic && (
                          <div className="mt-2 space-y-1">
                            {testResult.stderr && (
                              <div>
                                <p className="text-xs font-semibold text-red-700 mb-1">Erro:</p>
                                <pre className="text-xs bg-red-100 p-2 rounded font-mono overflow-x-auto">
                                  {testResult.stderr}
                                </pre>
                              </div>
                            )}
                            {testResult.expectedOutputSnapshot && testResult.actualOutput && (
                              <>
                                <div>
                                  <p className="text-xs font-semibold text-slate-700 mb-1">Saída Esperada:</p>
                                  <pre className="text-xs bg-slate-100 p-2 rounded font-mono overflow-x-auto">
                                    {testResult.expectedOutputSnapshot}
                                  </pre>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-slate-700 mb-1">Sua Saída:</p>
                                  <pre className="text-xs bg-slate-100 p-2 rounded font-mono overflow-x-auto">
                                    {testResult.actualOutput}
                                  </pre>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        
                        {!testResult.passed && !testResult.isPublic && (
                          <p className="text-xs text-slate-600 mt-2 italic">
                            Este é um caso de teste privado. Os detalhes não são exibidos.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Informações Adicionais (colapsadas quando há resultados) */}
            <details className="bg-slate-50 p-3 rounded-lg" open={!submissionResults}>
              <summary className="text-sm font-semibold text-slate-700 cursor-pointer">
                Informações da Submissão
              </summary>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs text-slate-600 mb-1">ID da Submissão:</p>
                  <p className="text-xs text-slate-900 font-mono break-all">{submissionInfo?.id}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Criado em:</p>
                  <p className="text-xs text-slate-900">
                    {submissionInfo?.createdAt ? new Date(submissionInfo.createdAt).toLocaleString('pt-BR') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-2">Código Submetido:</p>
                  <div className="bg-slate-900 text-slate-100 p-3 rounded-md overflow-x-auto max-h-48">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                      {submissionInfo?.code || 'Código não disponível'}
                    </pre>
                  </div>
                </div>
              </div>
            </details>
          </div>
          
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              onClick={() => {
                setShowSubmissionModal(false);
                setSubmissionResults(null);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
