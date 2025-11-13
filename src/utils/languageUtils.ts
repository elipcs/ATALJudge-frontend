/**
 * Formata o nome da linguagem de programação para exibição padronizada
 * Converte para primeira letra maiúscula e resto minúsculo
 * 
 * @param language - Nome da linguagem (pode estar em qualquer formato: python, PYTHON, Python, etc.)
 * @returns Nome formatado (Python, Java, etc.)
 */
export function formatLanguageName(language: string | undefined | null): string {
  if (!language) return '';
  
  const normalized = language.toLowerCase().trim();
  
  // Mapeamento de linguagens conhecidas
  const languageMap: Record<string, string> = {
    'python': 'Python',
    'python3': 'Python',
    'pypy3': 'Python',
    'java': 'Java',
    'java8': 'Java',
    'java11': 'Java',
    'cpp': 'C++',
    'cpp17': 'C++',
    'cpp14': 'C++',
    'c': 'C',
    'javascript': 'JavaScript',
    'typescript': 'TypeScript'
  };
  
  // Retorna o nome formatado do mapeamento ou capitaliza a primeira letra
  if (languageMap[normalized]) {
    return languageMap[normalized];
  }
  
  // Fallback: primeira letra maiúscula, resto minúsculo
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

