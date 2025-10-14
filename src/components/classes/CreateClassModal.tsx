"use client";

import React, { useState } from "react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateClass: (name: string) => Promise<void>;
  loading: boolean;
  error: string;
  success: string;
}

export default function CreateClassModal({
  isOpen,
  onClose,
  onCreateClass,
  loading,
  error,
  success
}: CreateClassModalProps) {
  const [className, setClassName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (className.trim()) {
      await onCreateClass(className.trim());
      setClassName("");
    }
  };

  const handleClose = () => {
    setClassName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto" onClick={handleClose}>
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl mx-4 my-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Nova Turma</h2>
          <button
            onClick={handleClose}
            className="ml-auto text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="className" className="block text-sm font-medium text-slate-700 mb-2">
              Nome da Turma
            </label>
            <Input
              id="className"
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Ex: Algoritmos 2024.1"
              required
              className="h-12 text-sm bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
              {success}
            </div>
          )}

          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl transition-all duration-200 order-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed order-2"
              disabled={loading || !className.trim()}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Criando...
                </div>
              ) : (
                'Criar Turma'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
