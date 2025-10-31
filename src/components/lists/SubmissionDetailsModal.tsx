import React from 'react';

interface LocalSubmission {
  id: string;
  questionId: string;
  status: 'pending' | 'accepted' | 'error' | 'timeout';
  score: number;
  attempt: number;
  submittedAt: string;
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
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Detalhes da Submissão</h2>
        <div className="mb-2">
          <span className="font-medium">Status: </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            submission.status === 'accepted' ? 'bg-green-100 text-green-700' :
            submission.status === 'error' ? 'bg-red-100 text-red-700' :
            submission.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            submission.status === 'timeout' ? 'bg-orange-100 text-orange-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            {submission.status}
          </span>
        </div>
        <div className="mb-2">
          <span className="font-medium">Nota: </span>{submission.score}
        </div>
        <div className="mb-2">
          <span className="font-medium">Tentativa: </span>{submission.attempt}
        </div>
        <div className="mb-2">
          <span className="font-medium">Data/Hora: </span>{new Date(submission.submittedAt).toLocaleString('pt-BR')}
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700">Fechar</button>
        </div>
      </div>
    </div>
  );
};

