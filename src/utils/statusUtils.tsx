import React from 'react';

const STATUS_TRANSLATIONS: Record<string, string> = {
  'Accepted': 'Aceito',
  'Wrong Answer': 'Resposta Incorreta',
  'Time Limit Exceeded': 'Tempo Limite Excedido',
  'Memory Limit Exceeded': 'Limite de Memória Excedido',
  'Runtime Error': 'Erro de Execução',
  'Compilation Error': 'Erro de Compilação',
  'Presentation Error': 'Erro de Apresentação',
  'Pending': 'Pendente',
  'Running': 'Executando',
  'Queue': 'Na Fila',
  'submitted': 'Aceita',
  'failed': 'Rejeitada',
  'draft': 'Rascunho',
  'published': 'Publicada',
  'closed': 'Encerrada',
};


export function normalizeStatus(status: string): string {
  return STATUS_TRANSLATIONS[status] || status;
}


export function getSubmissionStatusColor(status: string): string {
  const normalizedStatus = normalizeStatus(status);
  
  if (normalizedStatus === 'Aceito' || normalizedStatus === 'Aceita') {
    return 'bg-green-100 text-green-800';
  }
  
  if (normalizedStatus.includes('Erro') || normalizedStatus === 'Rejeitada') {
    return 'bg-red-100 text-red-800';
  }
  
  if (normalizedStatus === 'Pendente' || normalizedStatus === 'Executando' || normalizedStatus === 'Na Fila') {
    return 'bg-yellow-100 text-yellow-800';
  }
  
  return 'bg-gray-100 text-gray-800';
}


export function getListStatusColor(status: string): string {
  switch (status) {
    case 'draft':
      return 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border border-slate-200';
    case 'published':
      return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200';
    case 'closed':
      return 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200';
    default:
      return 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border border-slate-200';
  }
}


export function getListStatusText(status: string): string {
  switch (status) {
    case 'draft':
      return 'Rascunho';
    case 'published':
      return 'Publicada';
    case 'closed':
      return 'Encerrada';
    default:
      return 'Desconhecido';
  }
}


export function getVerdictColor(verdict: string): string {
  if (verdict === 'Accepted') return 'text-green-600';
  if (verdict.includes('Wrong Answer')) return 'text-red-600';
  if (verdict.includes('Runtime Error')) return 'text-orange-600';
  if (verdict.includes('Time Limit Exceeded')) return 'text-yellow-600';
  return 'text-gray-600';
}


