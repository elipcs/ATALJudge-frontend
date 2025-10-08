"use client";

import React from "react";

import { Button } from "../ui/button";
import { Class } from "../../types";

interface DeleteClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteClass: (id: string) => Promise<boolean>;
  classData: Class | null;
  loading?: boolean;
  error?: string;
}

export default function DeleteClassModal({
  isOpen,
  onClose,
  onDeleteClass,
  classData,
  loading = false,
  error
}: DeleteClassModalProps) {
  const handleDelete = async () => {
    if (!classData) return;

    const success = await onDeleteClass(classData.id);
    
    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen || !classData) return null;

  const hasStudents = (classData.student_count || 0) > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Excluir Turma</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Ícone de aviso */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Mensagem principal */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {hasStudents ? "Não é possível excluir esta turma" : "Confirmar exclusão"}
              </h3>
              
              {hasStudents ? (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    A turma <strong>{classData.name}</strong> possui alunos matriculados e não pode ser excluída.
                  </p>
                  <p className="text-sm text-gray-500">
                    Para excluir esta turma, primeiro remova todos os alunos matriculados.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Tem certeza que deseja excluir a turma <strong>{classData.name}</strong>?
                  </p>
                  <p className="text-sm text-red-600 font-medium">
                    Esta ação não pode ser desfeita.
                  </p>
                </div>
              )}
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                {hasStudents ? "Entendi" : "Cancelar"}
              </Button>
              
              {!hasStudents && (
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Excluindo...
                    </div>
                  ) : (
                    "Sim, Excluir"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}