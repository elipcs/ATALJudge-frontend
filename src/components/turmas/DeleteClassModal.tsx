"use client";

import React from "react";

import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface DeleteClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  className: string;
  loading?: boolean;
}

export default function DeleteClassModal({
  isOpen,
  onClose,
  onConfirm,
  className,
  loading = false
}: DeleteClassModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-md p-6 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Excluir Turma</h2>
              <p className="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="font-medium text-red-900 mb-1">Atenção!</h3>
                <p className="text-sm text-red-800">
                  Você está prestes a excluir a turma <strong>&quot;{className}&quot;</strong>. 
                  Esta ação irá:
                </p>
                <ul className="text-sm text-red-800 mt-2 ml-4 list-disc">
                  <li>Remover todos os alunos da turma</li>
                  <li>Excluir o histórico de atividades</li>
                  <li>Deletar todas as listas associadas</li>
                </ul>
              </div>
            </div>
          </div>
          
          <p className="text-gray-700">
            Tem certeza que deseja continuar? Esta ação <strong>não pode ser desfeita</strong>.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Excluindo...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Excluir Turma
              </div>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

