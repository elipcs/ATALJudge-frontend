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


export async function apiGet<T = unknown>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'GET',
    ...options,
  });
}


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


export async function apiDelete<T = unknown>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'DELETE',
    ...options,
  });
}


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
      
      if (lastError.status && lastError.status >= 400 && lastError.status < 500 && lastError.status !== 408) {
        throw lastError;
      }

      if (attempt === maxRetries) {
        throw lastError;
      }

      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
    }
  }

  throw lastError!;
}


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


export function buildUrl(baseUrl: string, params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const queryString = buildQueryString(params);
  return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
}
