import { ApiResponse } from '../utils/apiUtils';

// Configuração centralizada da API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REGISTER: '/auth/register',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      VERIFY_RESET_TOKEN: '/auth/verify-reset-token',
    },
    INVITES: {
      BASE: '/invites',
      VALIDATE: '/invites/validate',
      GENERATE: '/invites/generate',
      REVOKE: (id: string) => `/invites/${id}/revoke`,
    },
    TURMAS: {
      BASE: '/classes',
      BY_ID: (id: string) => `/classes/${id}`,
      ALUNOS: (id: string) => `/classes/${id}/students`,
    },
    USUARIOS: {
      PERFIL: '/users/profile',
      ESTATISTICAS: '/users/statistics',
      PRIVACIDADE: '/users/privacy',
      ALTERAR_SENHA: '/users/change-password',
      AVATAR: '/users/avatar',
    },
    SISTEMA: {
      AVISOS: '/sistema/avisos',
      ESTATISTICAS: '/sistema/estatisticas',
      RESET: '/sistema/reset',
    }
  }
};

// Função helper para fazer requisições autenticadas
export async function authenticatedFetch<T = unknown>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Importar dinamicamente para evitar problemas de SSR
  const { makeAuthenticatedRequest } = await import('../services/auth');
  
  const response = await makeAuthenticatedRequest(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  // Log removido - problema resolvido
  return {
    data,
    success: true,
    message: data.message,
  };
}

// Função helper para fazer requisições para o backend
export async function backendFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // Verificar se a resposta é válida
    if (!response) {
      throw new Error('Nenhuma resposta recebida do servidor');
    }

    // Verificar se o backend está retornando HTML em vez de JSON
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      console.error('Backend retornou resposta não-JSON:', {
        status: response.status,
        contentType,
        url,
        text: await response.text()
      });
      throw new Error(`Backend retornou ${contentType} em vez de JSON. Verifique se o servidor está rodando em ${API_CONFIG.BASE_URL}`);
    }

    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Não foi possível conectar ao backend em ${API_CONFIG.BASE_URL}. Verifique se o servidor está rodando.`);
    }
    throw error;
  }
}

// Função para diagnosticar problemas de conectividade
export async function diagnoseBackendConnection(): Promise<{
  isConnected: boolean;
  error?: string;
  suggestions: string[];
}> {
  const suggestions: string[] = [];
  
  try {
    // Teste básico de conectividade
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      suggestions.push(`Backend retornou status ${response.status}`);
      suggestions.push('Verifique se o servidor backend está rodando corretamente');
      return {
        isConnected: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        suggestions
      };
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      suggestions.push('Backend não está retornando JSON');
      suggestions.push('Verifique se a rota /health está configurada corretamente');
      return {
        isConnected: false,
        error: `Content-Type inválido: ${contentType}`,
        suggestions
      };
    }

    return {
      isConnected: true,
      suggestions: ['Backend está funcionando corretamente']
    };

  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      suggestions.push('Verifique se o backend está rodando');
      suggestions.push(`Confirme se a URL ${API_CONFIG.BASE_URL} está correta`);
      suggestions.push('Verifique se não há problemas de firewall ou proxy');
      return {
        isConnected: false,
        error: 'Não foi possível conectar ao backend',
        suggestions
      };
    }

    if (error instanceof Error && error.name === 'TimeoutError') {
      suggestions.push('Backend está demorando muito para responder');
      suggestions.push('Verifique se o servidor não está sobrecarregado');
      return {
        isConnected: false,
        error: 'Timeout na conexão',
        suggestions
      };
    }

    suggestions.push('Erro inesperado na conexão');
    return {
      isConnected: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      suggestions
    };
  }
}
