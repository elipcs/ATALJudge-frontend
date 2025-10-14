import { ApiResponse } from '../utils/apiUtils';

export const API_ENDPOINTS = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      REGISTER: '/api/auth/register',
      REFRESH: '/api/auth/refresh',
      CHANGE_PASSWORD: '/api/auth/change-password',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      VERIFY_RESET_TOKEN: '/api/auth/verify',
    },
    INVITES: {
      BASE: '/api/invites',
      BY_ID: (id: string) => `/api/invites/${id}`,
      VERIFY: '/api/invites/verify',
      CREATE: '/api/invites/create',
      REVOKE: (id: string) => `/api/invites/revoke/${id}`,
      DELETE: (id: string) => `/api/invites/${id}`,
      CLEANUP: '/api/invites/cleanup',
    },
    CLASSES: {
      BASE: '/api/classes',
      BY_ID: (id: string) => `/api/classes/${id}`,
      STUDENTS: (id: string) => `/api/classes/${id}/students`,
      CREATE: '/api/classes/create',
      ADD_STUDENT: (id: string) => `/api/classes/${id}/add-student`,
      REMOVE_STUDENT: (id: string) => `/api/classes/${id}/remove-student`,
      UPDATE: (id: string) => `/api/classes/${id}`,
      DELETE: (id: string) => `/api/classes/${id}`,
    },
    USERS: {
      PROFILE: '/api/users/profile',
      STUDENTS: '/api/users/students',
      ADD_STUDENTS: '/api/config/add-students',
      REMOVE_STUDENTS: '/api/config/remove-students',
    },
    CONFIG: {
      ALLOWED_IPS: '/api/config/allowed-ips',
      ALLOWED_IPS_BY_ID: (id: string) => `/api/config/allowed-ips/${id}`,
      ALLOWED_IPS_TOGGLE: (id: string) => `/api/config/allowed-ips/${id}/toggle`,
      SYSTEM_RESET: '/api/config/system-reset',
    },
    
  }
};

export async function frontendFetch<T = unknown>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {

    const url = endpoint.startsWith('http') || endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || errorData.msg || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      data,
      success: true,
      message: data.message,
    };
  } catch (error) {
    throw error;
  }
}

export async function authenticatedFetch<T = unknown>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const getCookie = (name: string) => {
      if (typeof document === 'undefined') return null;
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    };

    const token = (typeof window !== 'undefined')
      ? (localStorage.getItem('token') || getCookie('token') || null)
      : null;
    
    const url = endpoint.startsWith('/api/') 
      ? endpoint 
      : endpoint.startsWith('http') 
        ? endpoint 
        : `${API_ENDPOINTS.BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    let passedHeaders: Record<string, string> = {};
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => { passedHeaders[key.toLowerCase()] = value; });
    } else if (Array.isArray(options.headers)) {
      (options.headers as Array<[string, string]>).forEach(([k, v]) => { passedHeaders[k.toLowerCase()] = v; });
    } else if (options.headers && typeof options.headers === 'object') {
      passedHeaders = Object.entries(options.headers as Record<string, string>)
        .reduce((acc, [k, v]) => { acc[k.toLowerCase()] = v as string; return acc; }, {} as Record<string, string>);
    }

    const headers = {
      ...defaultHeaders,
      ...passedHeaders,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    } as Record<string, string>;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('📡 [authenticatedFetch] Resposta recebida - Status:', response.status, response.statusText);

    if (!response.ok) {
      console.error('❌ [authenticatedFetch] Erro na requisição');
      console.error('❌ [authenticatedFetch] URL:', url);
      console.error('❌ [authenticatedFetch] Método:', options.method || 'GET');
      console.error('❌ [authenticatedFetch] Status:', response.status, response.statusText);
      console.error('❌ [authenticatedFetch] Body enviado:', options.body);
      
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [authenticatedFetch] Resposta de erro do servidor:', errorData);
      
      throw new Error(errorData.error || errorData.message || errorData.msg || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ [authenticatedFetch] Dados recebidos com sucesso');
    
    return {
      data,
      success: true,
      message: data.message,
    };
  } catch (error) {
    throw error;
  }
}

export async function backendFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_ENDPOINTS.BASE_URL}${endpoint}`;
  
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

    if (!response) {
      throw new Error('Nenhuma resposta recebida do servidor');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      console.error('Backend retornou resposta não-JSON:', {
        status: response.status,
        contentType,
        url,
        text: await response.text()
      });
      throw new Error(`Backend retornou ${contentType} em vez de JSON. Verifique se o servidor está rodando em ${API_ENDPOINTS.BASE_URL}`);
    }

    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Não foi possível conectar ao backend em ${API_ENDPOINTS.BASE_URL}. Verifique se o servidor está rodando.`);
    }
    throw error;
  }
}

export async function diagnoseBackendConnection(): Promise<{
  isConnected: boolean;
  error?: string;
  suggestions: string[];
}> {
  const suggestions: string[] = [];
  
  try { 
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test', password: 'test' }),
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
      suggestions.push(`Confirme se a URL ${API_ENDPOINTS.BASE_URL} está correta`);
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
