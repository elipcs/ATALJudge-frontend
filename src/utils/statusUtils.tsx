
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
  'failed': 'Rejeitada'
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


export function getVerdictColor(verdict: string): string {
  if (verdict === 'Accepted') return 'text-green-600';
  if (verdict.includes('Wrong Answer')) return 'text-red-600';
  if (verdict.includes('Runtime Error')) return 'text-orange-600';
  if (verdict.includes('Time Limit Exceeded')) return 'text-yellow-600';
  return 'text-gray-600';
}

/**
 * Retorna a cor adequada para o status da lista
 */
export function getListStatusColor(status?: 'scheduled' | 'open' | 'closed'): string {
  switch (status) {
    case 'open':
      return 'text-green-700';
    case 'scheduled':
      return 'text-blue-700';
    case 'closed':
      return 'text-red-700';
    default:
      return 'text-gray-700';
  }
}

/**
 * Retorna o texto traduzido para o status da lista
 */
export function getListStatusText(status?: 'scheduled' | 'open' | 'closed'): string {
  switch (status) {
    case 'open':
      return 'Aberta';
    case 'scheduled':
      return 'Agendada';
    case 'closed':
      return 'Encerrada';
    default:
      return 'Indefinido';
  }
}

/**
 * Retorna a classe de badge (fundo e texto) para o status da lista
 */
export function getListStatusBadgeClass(status?: 'scheduled' | 'open' | 'closed'): string {
  switch (status) {
    case 'open':
      return 'bg-green-100 text-green-800';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'closed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

