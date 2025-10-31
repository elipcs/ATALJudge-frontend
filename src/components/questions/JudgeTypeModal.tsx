"use client";

import { useState, useEffect } from 'react';
import { Question } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { JUDGE_TYPE_OPTIONS, JUDGE_TYPES } from '@/constants';
import { questionsApi } from '@/services/questions';

interface JudgeTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  onSuccess: (updatedQuestion: Question) => void;
}

export default function JudgeTypeModal({ 
  isOpen, 
  onClose, 
  question,
  onSuccess 
}: JudgeTypeModalProps) {
  const [judgeType, setJudgeType] = useState<'local' | 'codeforces'>(
    question.judgeType || 'local'
  );
  const [contestId, setContestId] = useState(question.codeforcesContestId || '');
  const [problemIndex, setProblemIndex] = useState(question.codeforcesProblemIndex || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [problemInfo, setProblemInfo] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setJudgeType(question.judgeType || 'local');
      setContestId(question.codeforcesContestId || '');
      setProblemIndex(question.codeforcesProblemIndex || '');
      setError(null);
      setProblemInfo(null);
    }
  }, [isOpen, question]);

  const getPreviewLink = () => {
    if (judgeType === 'codeforces' && contestId && problemIndex) {
      return `https://codeforces.com/contest/${contestId}/problem/${problemIndex.toUpperCase()}`;
    }
    return null;
  };

  const handleSave = async () => {
    setError(null);
    
    // Validações
    if (judgeType === 'codeforces') {
      if (!contestId || !problemIndex) {
        setError('Contest ID e Problem Index são obrigatórios para Codeforces');
        return;
      }
      
      if (!/^\d+$/.test(contestId)) {
        setError('Contest ID deve conter apenas números');
        return;
      }
      
      if (!/^[A-Za-z]\d*$/.test(problemIndex)) {
        setError('Problem Index deve começar com uma letra (ex: A, B, C, A1, B2)');
        return;
      }
    }

    try {
      setLoading(true);
      
      const config: any = {
        judgeType: judgeType
      };
      
      if (judgeType === 'codeforces') {
        config.contestId = contestId;
        config.problemIndex = problemIndex.toUpperCase();
      }
      
      const updatedQuestion = await questionsApi.update(question.id, config);
      onSuccess(updatedQuestion);
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar tipo de judge:', err);
      setError(err?.message || 'Erro ao salvar configuração');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Configurar Tipo de Judge</h2>
              <p className="text-slate-600 mt-1">
                Escolha como esta questão será avaliada
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Questão Info */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-1">{question.title}</h3>
            <p className="text-sm text-slate-600">ID: {question.id}</p>
          </div>

          {/* Tipo de Judge */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Tipo de Avaliação
            </label>
            <div className="space-y-3">
              {JUDGE_TYPE_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    judgeType === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                  onClick={() => setJudgeType(option.value)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      judgeType === option.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-300'
                    }`}>
                      {judgeType === option.value && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{option.label}</div>
                      <div className="text-sm text-slate-600 mt-1">{option.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campos do Codeforces */}
          {judgeType === 'codeforces' && (
            <div className="space-y-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-5 border border-purple-200">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Configuração do Codeforces
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Contest ID *
                  </label>
                  <Input
                    type="text"
                    value={contestId}
                    onChange={(e) => setContestId(e.target.value)}
                    placeholder="Ex: 1234"
                    className="w-full"
                  />
                  <p className="text-xs text-slate-600 mt-1">Apenas números</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Problem Index *
                  </label>
                  <Input
                    type="text"
                    value={problemIndex}
                    onChange={(e) => setProblemIndex(e.target.value.toUpperCase())}
                    placeholder="Ex: A, B, C"
                    maxLength={3}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-600 mt-1">Letra ou letra+número</p>
                </div>
              </div>

              {/* Preview do Link */}
              {getPreviewLink() && (
                <div className="bg-white rounded-xl p-4 border border-purple-200">
                  <p className="text-sm font-semibold text-slate-900 mb-2">Link do Problema:</p>
                  <a
                    href={getPreviewLink()!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline break-all flex items-center gap-2"
                  >
                    {getPreviewLink()}
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Nota sobre Judge Local */}
          {judgeType === 'local' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-green-900 mb-1">Judge Local (Judge0)</p>
                  <p className="text-sm text-green-700">
                    A questão será executada localmente usando os casos de teste cadastrados.
                    Certifique-se de cadastrar os casos de teste antes de publicar a lista.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-800">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={loading}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Salvando...
              </>
            ) : (
              'Salvar Configuração'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

