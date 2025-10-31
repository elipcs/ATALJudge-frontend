"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { submissionsApi, SubmissionResultsResponse } from "@/services/submissions";
import { logger } from "@/utils/logger";

interface SubmissionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  initialStatus?: string;
  initialLanguage?: string;
  code?: string;
}

export default function SubmissionStatusModal({
  isOpen,
  onClose,
  submissionId,
  initialStatus = "pending",
  initialLanguage = "python",
  code = "",
}: SubmissionStatusModalProps) {
  const [status, setStatus] = useState(initialStatus.toLowerCase());
  const [language, setLanguage] = useState(initialLanguage);
  const [createdAt, setCreatedAt] = useState<string>(new Date().toISOString());
  const [isPolling, setIsPolling] = useState(false);
  const [results, setResults] = useState<SubmissionResultsResponse | null>(null);

  // Polling do status da submissão
  useEffect(() => {
    if (!isOpen || !submissionId) return;

    const currentStatus = status.toLowerCase();
    if (currentStatus !== "pending" && currentStatus !== "running") {
      const id = setTimeout(() => setIsPolling(false), 0);
      return () => clearTimeout(id);
    }

    setTimeout(() => setIsPolling(true), 0);

    const pollInterval = setInterval(async () => {
      try {
        const submission = await submissionsApi.getSubmission(submissionId);
        if (!submission) return;

        const newStatus = submission.status.toLowerCase();
        setStatus(newStatus);
        setLanguage(submission.language);
        setCreatedAt(submission.createdAt);

        // Se concluído, buscar resultados
        if (newStatus === "completed") {
          try {
            // NOTA: Endpoint /submissions/{id}/results foi removido do backend
            // Os resultados agora vêm diretamente na resposta da submissão
            logger.warn('Endpoint de resultados não disponível');
            // setResults(resultsData);
          } catch (error) {
            console.error("Erro ao buscar resultados:", error);
          }
        }

        // Parar polling se não estiver mais em processamento
        if (newStatus !== "pending" && newStatus !== "running") {
          const id = setTimeout(() => setIsPolling(false), 0);
          clearInterval(pollInterval);
          return () => clearTimeout(id);
        }
      } catch (_error) {
        // silencioso
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [isOpen, submissionId, status]);

  const handleClose = () => {
    setResults(null);
    onClose();
  };

  const getStatusInfo = () => {
    switch (status) {
      case "completed":
        return {
          icon: (
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: "Submissão Concluída!",
          titleColor: "text-green-600",
          description: "Seu código foi avaliado com sucesso!",
          dotColor: "bg-green-500",
          statusText: "Concluído",
        };
      case "failed":
        return {
          icon: (
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: "Submissão Falhou",
          titleColor: "text-red-600",
          description: "Ocorreu um erro ao avaliar seu código.",
          dotColor: "bg-red-500",
          statusText: "Falhou",
        };
      case "running":
        return {
          icon: (
            <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ),
          title: "Processando Submissão...",
          titleColor: "text-blue-600",
          description: "Seu código está sendo executado nos casos de teste.",
          dotColor: "bg-blue-500 animate-pulse",
          statusText: "Executando",
        };
      default: // pending
        return {
          icon: (
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: "Submissão na Fila",
          titleColor: "text-yellow-600",
          description: "Seu código foi recebido e aguarda processamento.",
          dotColor: "bg-yellow-500 animate-pulse",
          statusText: "Pendente",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`text-xl font-bold flex items-center gap-2 ${statusInfo.titleColor}`}>
            {statusInfo.icon}
            <span>{statusInfo.title}</span>
          </DialogTitle>
          <DialogDescription>{statusInfo.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status e Informações Básicas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-slate-700">Status:</p>
                {isPolling && (
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
                <span className={`inline-block w-2 h-2 rounded-full ${statusInfo.dotColor}`}></span>
                <p className="text-sm text-slate-900 font-medium">{statusInfo.statusText}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-sm font-semibold text-slate-700 mb-1">Linguagem:</p>
              <p className="text-sm text-slate-900 font-medium uppercase">{language}</p>
            </div>
          </div>

          {/* Resultados dos Testes */}
          {results && status === "completed" && (
            <div className="space-y-3">
              {/* Sumário */}
              <div
                className={`p-4 rounded-lg border-2 ${
                  results.summary.passedCount === results.summary.totalCases
                    ? "bg-green-50 border-green-300"
                    : "bg-yellow-50 border-yellow-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-800">Resultado da Avaliação</h3>
                  {results.summary.passedCount === results.summary.totalCases ? (
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
                      {results.summary.passedCount}/{results.summary.totalCases}
                    </p>
                    <p className="text-xs text-slate-500">casos passaram</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Pontuação</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {results.summary.earnedPoints}/{results.summary.totalPoints}
                    </p>
                    <p className="text-xs text-slate-500">pontos obtidos</p>
                  </div>
                </div>
              </div>

              {/* Lista de Resultados */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-700">Detalhes dos Casos de Teste:</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {results.results.map((testResult, idx) => (
                    <div
                      key={testResult.id}
                      className={`p-3 rounded-lg border ${
                        testResult.passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold">
                          {testResult.isPublic ? "🔓" : "🔒"} Caso {idx + 1}
                        {testResult.testCaseName && ` - ${testResult.testCaseName}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${
                              testResult.passed ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                            }`}
                          >
                            {testResult.passed ? "✓ Passou" : "✗ Falhou"}
                          </span>
                          <span className="text-xs text-slate-600 font-medium">{testResult.pointsAwarded} pts</span>
                        </div>
                      </div>

                      {testResult.executionTimeMs !== undefined && (
                        <div className="text-xs text-slate-600 mt-1 flex gap-3">
                          <span>⏱️ {testResult.executionTimeMs}ms</span>
                          {testResult.memoryKb && <span>💾 {Math.round(testResult.memoryKb / 1024)}MB</span>}
                        </div>
                      )}

                      {!testResult.passed && testResult.isPublic && (
                        <div className="mt-2 space-y-1">
                          {testResult.stderr && (
                            <div>
                              <p className="text-xs font-semibold text-red-700 mb-1">Erro:</p>
                              <pre className="text-xs bg-red-100 p-2 rounded font-mono overflow-x-auto max-h-24">
                                {testResult.stderr}
                              </pre>
                            </div>
                          )}
                          {testResult.expectedOutputSnapshot && testResult.actualOutput && (
                            <>
                              <div>
                                <p className="text-xs font-semibold text-slate-700 mb-1">Saída Esperada:</p>
                                <pre className="text-xs bg-slate-100 p-2 rounded font-mono overflow-x-auto max-h-20">
                                  {testResult.expectedOutputSnapshot}
                                </pre>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-700 mb-1">Sua Saída:</p>
                                <pre className="text-xs bg-slate-100 p-2 rounded font-mono overflow-x-auto max-h-20">
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
          <details className="bg-slate-50 p-3 rounded-lg" open={!results}>
            <summary className="text-sm font-semibold text-slate-700 cursor-pointer">Informações da Submissão</summary>
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-xs text-slate-600 mb-1">ID da Submissão:</p>
                <p className="text-xs text-slate-900 font-mono break-all">{submissionId}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Criado em:</p>
                <p className="text-xs text-slate-900">{new Date(createdAt).toLocaleString("pt-BR")}</p>
              </div>
              {code && (
                <div>
                  <p className="text-xs text-slate-600 mb-2">Código Submetido:</p>
                  <div className="bg-slate-900 text-slate-100 p-3 rounded-md overflow-x-auto max-h-48">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-words">{code}</pre>
                  </div>
                </div>
              )}
            </div>
          </details>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button
            onClick={handleClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
