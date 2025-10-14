"use client";

import React, { useState, useEffect } from "react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl mx-4 my-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Editar Turma</h2>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Nome da Turma
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="Ex: Algoritmos 2024.1"
              required
              className="h-12 text-sm bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
              disabled={loading}
              maxLength={50}
            />
            <div className="mt-1 text-right text-xs text-gray-500">
              {name.length}/50 caracteres
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
          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 h-12 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl transition-all duration-200 order-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed order-2"
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
  );
}
