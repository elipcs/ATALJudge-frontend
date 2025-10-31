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

  const hasStudents = (classData.studentCount || 0) > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl mx-4 my-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-100 rounded-xl">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Excluir Turma</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="ml-auto text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {hasStudents ? "Não é possível excluir esta turma" : "Confirmar exclusão"}
            </h3>
            {hasStudents ? (
              <div className="space-y-3">
                <p className="text-slate-600">
                  A turma <strong>{classData.name}</strong> possui alunos matriculados e não pode ser excluída.
                </p>
                <p className="text-sm text-slate-500">
                  Para excluir esta turma, primeiro remova todos os alunos matriculados.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-600">
                  Tem certeza que deseja excluir a turma <strong>{classData.name}</strong>?
                </p>
                <p className="text-sm text-red-600 font-medium">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            )}
          </div>

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

          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 h-12 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl transition-all duration-200 order-1"
            >
              {hasStudents ? "Entendi" : "Cancelar"}
            </Button>
            {!hasStudents && (
              <Button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed order-2"
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
  );
}