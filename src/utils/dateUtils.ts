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


export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo'
  });
}


export function formatDateTimeFull(dateString: string): string {
  return new Date(dateString).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo'
  });
}

  
export function getCurrentDateFormatted(): string {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Sao_Paulo'
  });
}
