/**
 * Utilitários para formatação de datas
 */

/**
 * Formata uma data para o padrão brasileiro com hora
 * @param dateString - String da data no formato ISO
 * @returns String formatada no padrão "DD/MM/AAAA às HH:MM"
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  });
  const formattedTime = date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Sao_Paulo'
  });
  return `${formattedDate} às ${formattedTime}`;
}

/**
 * Formata uma data para o padrão brasileiro (apenas data)
 * @param dateString - String da data no formato ISO
 * @returns String formatada no padrão "DD/MM/AAAA"
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo'
  });
}

/**
 * Formata uma data para o padrão brasileiro com data e hora completas
 * @param dateString - String da data no formato ISO
 * @returns String formatada no padrão "DD/MM/AAAA HH:MM:SS"
 */
export function formatDateTimeFull(dateString: string): string {
  return new Date(dateString).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo'
  });
}

/**
 * Obtém a data atual formatada em português
 * @returns String com a data atual formatada
 */
export function getCurrentDateFormatted(): string {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Sao_Paulo'
  });
}
