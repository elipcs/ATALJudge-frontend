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
import { submissionsApi, SubmissionDetailsResponse } from "@/services/submissions";
import { logger } from "@/utils/logger";
import { getVerdictColor } from "@/utils/statusUtils";

interface SubmissionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  initialStatus?: string;
  initialLanguage?: string;
  initialVerdict?: string;
  code?: string;
  questionName?: string;
  userName?: string;
  questionListTitle?: string;
}

export default function SubmissionStatusModal({
  isOpen,
  onClose,
  submissionId,
  initialStatus = "pending",
  initialLanguage = "python",
  initialVerdict,
  code = "",
  questionName: initialQuestionName = "",
  userName: initialUserName = "",
  questionListTitle: initialquestionListTitle= "",
}: SubmissionStatusModalProps) {
  const [status, setStatus] = useState(initialStatus.toLowerCase());
  const [language, setLanguage] = useState(initialLanguage);
  const [createdAt, setCreatedAt] = useState<string>(new Date().toISOString());
  const [isPolling, setIsPolling] = useState(false);
  const [results, setResults] = useState<SubmissionDetailsResponse | null>(null);
  const [verdict, setVerdict] = useState<string | undefined>(initialVerdict);
  const [questionName, setQuestionName] = useState<string>(initialQuestionName);
  const [userName, setUserName] = useState<string>(initialUserName);
  const [questionListTitle, setquestionListTitle] = useState<string>(initialquestionListTitle);

  useEffect(() => {
    if (!isOpen || !submissionId) return;

    const currentStatus = status.toLowerCase();
    
    if (currentStatus === "completed" || currentStatus === "failed") {
      if (currentStatus === "completed" && !results) {
        submissionsApi.getSubmissionResults(submissionId)
          .then(submissionResults => {
            if (submissionResults) {
              setResults(submissionResults);
            } else {
              logger.warn('Resultados da submissão incompletos', { submissionResults });
            }
          })
          .catch(error => {
            logger.error('Erro ao buscar resultados da submissão', { error });
          });
      }
      const id = setTimeout(() => setIsPolling(false), 0);
      return () => clearTimeout(id);
    }
    
    if (currentStatus === "pending" || currentStatus === "running") {
      setTimeout(() => setIsPolling(true), 0);
    }

    const pollInterval = setInterval(async () => {
      try {
        const submission = await submissionsApi.getSubmission(submissionId);
        if (!submission) return;

        const newStatus = submission.status.toLowerCase();
        setStatus(newStatus);
        setLanguage(submission.language);
        setCreatedAt(typeof submission.createdAt === 'string' ? submission.createdAt : submission.createdAt.toISOString());
        setVerdict(submission.verdict);
        setQuestionName(submission.questionName || "");
        setUserName(submission.userName || "");
        setquestionListTitle(submission.questionListTitle|| submission.questionListTitle|| "");

        if (newStatus === "completed") {
          try {
            const submissionResults = await submissionsApi.getSubmissionResults(submissionId);
            if (submissionResults) {
              setResults(submissionResults);
            } else {
              logger.warn('Resultados da submissão incompletos', { submissionResults });
            }
          } catch (error) {
            logger.error('Erro ao buscar resultados da submissão', { error });
          }
        }

        if (newStatus !== "pending" && newStatus !== "running") {
          const id = setTimeout(() => setIsPolling(false), 0);
          clearInterval(pollInterval);
          return () => clearTimeout(id);
        }
      } catch (_error) {
        
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [isOpen, submissionId, status, results]);

  const handleClose = () => {
    setResults(null);
    onClose();
  };

  const getVerdictDotColor = (verdict?: string): string => {
    if (!verdict) return "bg-green-500";
    
    switch (verdict) {
      case "Accepted":
        return "bg-green-500";
      case "Wrong Answer":
        return "bg-orange-500";
      case "Runtime Error":
      case "Compilation Error":
      case "Presentation Error":
      case "Time Limit Exceeded":
      case "Memory Limit Exceeded":
        return "bg-red-500";
      default:
        return "bg-green-500";
    }
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
          dotColor: getVerdictDotColor(verdict),
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
      default: 
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
          {/* Informações principais da submissão */}
          {(questionName || userName || questionListTitle) && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {questionName && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">Questão:</p>
                    <p className="text-sm text-slate-900 font-medium">{questionName}</p>
                  </div>
                )}
                {userName && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">Estudante:</p>
                    <p className="text-sm text-slate-900 font-medium">{userName}</p>
                  </div>
                )}
                {questionListTitle&& (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">Lista:</p>
                    <p className="text-sm text-slate-900 font-medium">{questionListTitle}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {}
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
                <p className="text-sm text-slate-900 font-medium">
                  {status === "completed" && verdict ? verdict : statusInfo.statusText}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-sm font-semibold text-slate-700 mb-1">Linguagem:</p>
              <p className="text-sm text-slate-900 font-medium uppercase">{language}</p>
            </div>
          </div>

          {}
          {results && status === "completed" && (
            <div className="space-y-3">
              {}
              <div
                className={`p-4 rounded-lg border-2 ${
                  results.passedTests === results.totalTests
                    ? "bg-green-50 border-green-300"
                    : "bg-yellow-50 border-yellow-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-800">Resultado da Avaliação</h3>
                  {results.passedTests === results.totalTests ? (
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
                      {results.passedTests}/{results.totalTests}
                    </p>
                    <p className="text-xs text-slate-500">casos passaram</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Pontuação</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {results.score}/100
                    </p>
                    <p className="text-xs text-slate-500">pontos obtidos</p>
                  </div>
                </div>
              </div>

              {}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-700">Detalhes dos Casos de Teste:</h4>
                
                {/* Resumo visual */}
                <div className="flex gap-2 mb-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-semibold text-green-700">
                      {results.passedTests} Passaram
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-sm font-semibold text-red-700">
                      {results.totalTests - results.passedTests} Falharam
                    </span>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {/* Exibir todos os casos de teste */}
                  {(results.testResults || []).map((result, index) => (
                    <div
                      key={result.testCaseId || index}
                      className={`p-3 rounded-lg border ${
                        result.passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold">
                          Caso de Teste {index + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${
                              result.passed ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                            }`}
                          >
                            {result.passed ? "✓ Passou" : "✗ Falhou"}
                          </span>
                          <span className="text-xs text-slate-600 font-medium">{result.verdict}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 mt-1 flex gap-3">
                        {result.executionTimeMs !== undefined && <span>Tempo: {result.executionTimeMs}ms</span>}
                        {result.memoryUsedKb !== undefined && <span>Memória: {(result.memoryUsedKb / 1024).toFixed(2)}MB</span>}
                      </div>

                      {result.actualOutput && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-slate-700 mb-1">Sua Saída:</p>
                          <pre className={`text-xs p-2 rounded font-mono overflow-x-auto max-h-20 ${
                            result.passed ? "bg-green-100" : "bg-red-100"
                          }`}>
                            {result.actualOutput}
                          </pre>
                        </div>
                      )}

                      {result.errorMessage && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-red-700 mb-1">Erro:</p>
                          <pre className="text-xs bg-red-100 p-2 rounded font-mono overflow-x-auto max-h-24">
                            {result.errorMessage}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {}
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

