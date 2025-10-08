"use client";

import React, { useState, useEffect } from "react";

import { Button } from "../ui/button";
import { Class } from "../../types";

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditClass: (id: string, data: { name: string }) => Promise<boolean>;
  classData: Class | null;
  loading?: boolean;
  error?: string;
}

export default function EditClassModal({
  isOpen,
  onClose,
  onEditClass,
  classData,
  loading = false,
  error
}: EditClassModalProps) {
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (isOpen && classData) {
      setName(classData.name || "");
      setLocalError("");
    }
  }, [isOpen, classData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!classData) return;

    if (!name || !name.trim()) {
      setLocalError("Nome da turma é obrigatório");
      return;
    }

    if (name.trim().length < 3) {
      setLocalError("Nome da turma deve ter pelo menos 3 caracteres");
      return;
    }

    if (name.trim().length > 50) {
      setLocalError("Nome da turma deve ter no máximo 50 caracteres");
      return;
    }

    setLocalError("");

    const trimmedName = name.trim();
    
    const success = await onEditClass(classData.id, { name: trimmedName });
    
    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName("");
      setLocalError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Editar Turma</h2>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Turma
              </label>
               <input
                 type="text"
                 id="name"
                 value={name || ''}
                 onChange={(e) => setName(e.target.value)}
                 disabled={loading}
                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                 placeholder="Digite o nome da turma"
                 maxLength={50}
               />
               <div className="mt-1 text-right text-xs text-gray-500">
                 {(name || '').length}/50 caracteres
               </div>
            </div>

            {/* Mensagens de erro */}
            {(localError || error) && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">{localError || error}</span>
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
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Salvando...
                  </div>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
