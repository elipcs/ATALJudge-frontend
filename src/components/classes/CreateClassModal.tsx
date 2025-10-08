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
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-md bg-white rounded-lg shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Nova Turma</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Turma
            </label>
            <Input
              id="className"
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Ex: Algoritmos 2024.1"
              required
              className="w-full"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm">
              {success}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-600 text-white"
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
