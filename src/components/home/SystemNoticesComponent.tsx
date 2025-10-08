"use client";

import React, { useState, useEffect } from "react";

import { mockDataApi } from "../../services/mockData";
import { SystemNotice } from "../../types";

export default function SystemNoticesComponent() {
  const [notices, setNotices] = useState<SystemNotice[]>([]);

  const loadNotices = async () => {
    try {
      const response = await fetch('/api/sistema/avisos?audience=professors&limit=5');
      if (response.ok) {
        const data = await response.json();
        setNotices(data.notices || []);
      }
    } catch (error) {
      console.error('Erro ao carregar avisos:', error); 
      const mockSystemNotices = mockDataApi.systemNotices();
      setNotices(mockSystemNotices as SystemNotice[]);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Avisos do Sistema
        </h3>
        <button
          onClick={loadNotices}
          className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Atualizar
        </button>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
          {notices.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-lg font-medium text-gray-600 mb-2">Nenhum aviso encontrado</p>
                <p className="text-sm text-gray-500">Não há avisos disponíveis no momento.</p>
              </div>
            </div>
          ) : (
            notices.map(notice => (
              <div
                key={notice.id}
                className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-sm ${notice.type === 'warning' ? 'bg-amber-50 border-amber-400 text-amber-900' :
                  notice.type === 'success' ? 'bg-emerald-50 border-emerald-400 text-emerald-900' :
                    notice.type === 'error' ? 'bg-red-50 border-red-400 text-red-900' :
                      'bg-blue-50 border-blue-400 text-blue-900'
                  }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{notice.title}</h4>
                  <span className="text-xs opacity-70">
                    {new Date(notice.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm opacity-90">{notice.message}</p>
              </div>
            ))
          )}
        </div>
    </div>
  );
}
