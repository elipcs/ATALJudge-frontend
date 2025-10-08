/**
 * Utilitários para chamadas de API
 */

import { API_ENDPOINTS as API_ENDPOINTS } from '../config/api';
import { API_CONFIG } from '../constants';

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface ApiErrorInterface {
  message: string;
  status?: number;
  code?: string;
}

/**
 * Classe para tratamento de erros de API
 */
export class ApiError extends Error {
  public status?: number;
  public code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Função para fazer requisições HTTP com tratamento de erro padronizado
 * @param url - URL da requisição
 * @param options - Opções da requisição
 * @returns Promise com a resposta da API
 */
export async function apiRequest<T = unknown>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      ...defaultOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code
      );
    }

    const data = await response.json();
    return {
      data,
      success: true,
      message: data.message,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Timeout da requisição', 408, 'TIMEOUT');
      }
      throw new ApiError(error.message, 0, 'NETWORK_ERROR');
    }

    throw new ApiError('Erro desconhecido', 0, 'UNKNOWN_ERROR');
  }
}

/**
 * Função para fazer requisições GET
 * @param url - URL da requisição
 * @param options - Opções adicionais
 */
export async function apiGet<T = unknown>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'GET',
    ...options,
  });
}

/**
 * Função para fazer requisições POST
 * @param url - URL da requisição
 * @param data - Dados para enviar
 * @param options - Opções adicionais
 */
export async function apiPost<T = unknown>(
  url: string, 
  data?: unknown, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * Função para fazer requisições PUT
 * @param url - URL da requisição
 * @param data - Dados para enviar
 * @param options - Opções adicionais
 */
export async function apiPut<T = unknown>(
  url: string, 
  data?: unknown, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * Função para fazer requisições DELETE
 * @param url - URL da requisição
 * @param options - Opções adicionais
 */
export async function apiDelete<T = unknown>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'DELETE',
    ...options,
  });
}

/**
 * Função para fazer requisições com retry automático
 * @param requestFn - Função de requisição
 * @param maxRetries - Número máximo de tentativas
 * @param delay - Delay entre tentativas
 */
export async function apiRequestWithRetry<T>(
  requestFn: () => Promise<ApiResponse<T>>,
  maxRetries: number = API_CONFIG.RETRY_ATTEMPTS,
  delay: number = API_CONFIG.RETRY_DELAY
): Promise<ApiResponse<T>> {
  let lastError: ApiError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as ApiError;
      
      // Não tentar novamente para erros 4xx (exceto 408 - timeout)
      if (lastError.status && lastError.status >= 400 && lastError.status < 500 && lastError.status !== 408) {
        throw lastError;
      }

      // Se é a última tentativa, lançar o erro
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Aguardar antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
    }
  }

  throw lastError!;
}

/**
 * Função para fazer upload de arquivos
 * @param url - URL para upload
 * @param file - Arquivo para upload
 * @param options - Opções adicionais
 */
export async function apiUpload<T = unknown>(
  url: string, 
  file: File, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest<T>(url, {
    method: 'POST',
    body: formData,
    headers: {
      // Não definir Content-Type para FormData
      ...options.headers,
    },
    ...options,
  });
}

/**
 * Função para fazer download de arquivos
 * @param url - URL para download
 * @param filename - Nome do arquivo
 * @param options - Opções adicionais
 */
export async function apiDownload(
  url: string, 
  filename: string, 
  options: RequestInit = {}
): Promise<void> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Erro ao fazer download do arquivo', 0, 'DOWNLOAD_ERROR');
  }
}

/**
 * Função para construir query string
 * @param params - Parâmetros para a query string
 * @returns Query string formatada
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams.toString();
}

/**
 * Função para construir URL com query string
 * @param baseUrl - URL base
 * @param params - Parâmetros para a query string
 * @returns URL completa com query string
 */
export function buildUrl(baseUrl: string, params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const queryString = buildQueryString(params);
  return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
}
