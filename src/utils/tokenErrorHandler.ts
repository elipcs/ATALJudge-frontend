/**
 * Handler para erros de token revogado
 */
export function handleTokenError(error: any): void {
  // Verificar se é erro de token revogado
  if (error?.response?.data?.error === 'TOKEN_REVOKED' || 
      error?.code === 'TOKEN_REVOKED' ||
      error?.message?.includes('revoked')) {
    
    // Limpar todos os dados do localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    
    // Redirecionar para login com mensagem
    if (typeof window !== 'undefined') {
      const message = encodeURIComponent(
        'Sua sessão foi invalidada por motivos de segurança. Por favor, faça login novamente.'
      );
      window.location.href = `/login?message=${message}`;
    }
  }
}

/**
 * Verificar se o erro é de autenticação
 */
export function isAuthError(error: any): boolean {
  return (
    error?.status === 401 ||
    error?.response?.status === 401 ||
    error?.code === 'TOKEN_REVOKED' ||
    error?.message?.includes('revoked')
  );
}

