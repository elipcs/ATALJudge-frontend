import React from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  questionTitle: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  questionTitle
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Confirmar Exclusão
            </h3>
            <p className="text-slate-600">
              Tem certeza que deseja excluir a questão {questionTitle}?
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-white border-slate-300 hover:bg-slate-50 border rounded px-4 py-2"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded px-4 py-2"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
