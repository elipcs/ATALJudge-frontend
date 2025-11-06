import React from 'react';

interface LocalSubmission {
  id: string;
  questionId: string;
  status: 'pending' | 'accepted' | 'error' | 'timeout';
  score: number;
  attempt: number;
  submittedAt: string;
  question?: {
    id: string;
    name?: string;
    title?: string;
  };
  student?: {
    name: string;
  };
  language?: string;
  code?: string;
  verdict?: string;
}

interface SubmissionDetailsModalProps {
  isOpen: boolean;
  submission: LocalSubmission;
  onClose: () => void;
}

export default function SubmissionDetailsModal({
  isOpen,
  submission,
  onClose
}: SubmissionDetailsModalProps) {
  if (!isOpen || !submission) return null;

  const questionTitle = submission.question?.name || submission.question?.title || 'Questão desconhecida';
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-6">Detalhes da Submissão</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Coluna 1 */}
          <div className="space-y-4">
            {submission.student && (
              <div className="pb-4 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-600">Aluno: </span>
                <span className="text-sm text-slate-900 font-semibold">{submission.student.name}</span>
              </div>
            )}
            
            <div>
              <span className="text-sm font-medium text-slate-600">Questão: </span>
              <span className="text-sm text-slate-900 font-semibold">{questionTitle}</span>
            </div>
            
            <div>
              <span className="text-sm font-medium text-slate-600">Status: </span>
              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                submission.status === 'accepted' ? 'bg-green-100 text-green-700' :
                submission.status === 'error' ? 'bg-red-100 text-red-700' :
                submission.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                submission.status === 'timeout' ? 'bg-orange-100 text-orange-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {submission.status || submission.verdict || '-'}
              </span>
            </div>
            
            <div>
              <span className="text-sm font-medium text-slate-600">Nota: </span>
              <span className="text-sm text-slate-900 font-semibold">{submission.score}</span>
            </div>
          </div>

          {/* Coluna 2 */}
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-slate-600">Tentativa: </span>
              <span className="text-sm text-slate-900 font-semibold">{submission.attempt}</span>
            </div>
            
            {submission.language && (
              <div>
                <span className="text-sm font-medium text-slate-600">Linguagem: </span>
                <span className="text-sm text-slate-900 font-semibold">{submission.language}</span>
              </div>
            )}
            
            <div>
              <span className="text-sm font-medium text-slate-600">Data/Hora: </span>
              <span className="text-sm text-slate-900 font-semibold">{new Date(submission.submittedAt).toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {submission.code && (
          <div className="mb-6 pb-6 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Código Submetido:</h3>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto max-h-48 text-xs font-mono">
              {submission.code}
            </pre>
          </div>
        )}
        
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

