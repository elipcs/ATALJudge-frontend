export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
}

export function setRefreshToken(refreshToken: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("refreshToken", refreshToken);
}

export function setTokens(token: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
}

export function removeToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
}

export function removeRefreshToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("refreshToken");
}

export function removeTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
}

// Função simples para verificar autenticação
export async function checkAuthentication(): Promise<boolean> {
  const token = getToken();
  const refreshToken = getRefreshToken();

  // Se não há token nem refresh token, usuário não está logado
  if (!token && !refreshToken) {
    return false;
  }

  // Se há token, verificar se está expirado
  if (token && !isTokenExpired(token)) {
    // Token válido
    return true;
  }

  // Token expirado ou não existe, tentar renovar com refresh token
  if (refreshToken) {
    try {
      const newToken = await refreshAccessToken();
      return !!newToken;
    } catch (error) {
      // Falha no refresh
      return false;
    }
  }

  return false;
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch('/api/auth/refresh', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: refreshToken
      }),
    });

    if (!response.ok) {
      throw new Error("Falha ao renovar token");
    }

    const responseData = await response.json();
    const data = responseData.data;
    
    const accessToken = data.accessToken;

    if (accessToken) {
      setToken(accessToken);
      return accessToken;
    }
    return null;
  } catch (error) {
    console.error("Erro ao renovar token:", error);
    removeTokens();
    return null;
  }
}

export async function logout(): Promise<boolean> {
  const token = getToken();
  
  if (!token) {
    removeTokens();
    return true;
  }

  try {
    const refreshToken = getRefreshToken();
    
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        refreshToken: refreshToken
      }),
    });

    removeTokens();
    
    if (typeof window !== "undefined") {
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      localStorage.removeItem('manual-userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
    }

    if (response.ok) {
      return true;
    } else {
      console.warn('Erro ao fazer logout no servidor, mas tokens foram removidos localmente');
      return true;
    }
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    
    removeTokens();
    if (typeof window !== "undefined") {
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      localStorage.removeItem('manual-userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
    }
    
    return true;
  }
}

export async function login(email: string, password: string): Promise<{
  user: any;
  accessToken: string;
  refreshToken: string;
}> {
  const requestBody = { email, password };
  
  const res = await fetch('/api/auth/login', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || errorData.error || "Credenciais inválidas");
  }
  
  const response = await res.json();
  const data = response.data;
  
  if (!data.accessToken) {
    throw new Error("Token de acesso não recebido do servidor");
  }
  
  if (!data.refreshToken) {
    throw new Error("Token de refresh não recebido do servidor");
  }
  
  return data;
}

export interface RegistrationFormData {
  name: string;
  email: string;
  studentRegistration?: string;
  password: string;
  confirmPassword: string;
}

export interface TokenInfo {
  role: 'student' | 'assistant' | 'professor';
  classId?: string;
  className?: string;
  professor?: string;
  valid: boolean;
  expires: string;
}

export async function registerUser(
  formData: RegistrationFormData, 
  tokenInfo: TokenInfo | null
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const requestBody = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: tokenInfo?.role,
      student_registration: formData.studentRegistration,
      class_id: tokenInfo?.classId,
      class_name: tokenInfo?.className
    };

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Erro ao realizar cadastro"
      };
    }

    return {
      success: true,
      message: "Cadastro realizado com sucesso"
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao realizar cadastro"
    };
  }
}

export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  let token = getToken();
  
  if (token && isTokenExpired(token)) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      token = newToken;
    } else {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
      throw new Error("Token expirado e não foi possível renovar");
    }
  }

  const headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : "",
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retryHeaders = {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      };
      return fetch(url, {
        ...options,
        headers: retryHeaders,
      });
    } else {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }

  return response;
}
