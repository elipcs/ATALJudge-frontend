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
        "Authorization": `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao renovar token");
    }

    const data = await response.json();
    
    if (data.access_token) {
      setToken(data.access_token);
      // O backend pode retornar um novo refresh token ou manter o mesmo
      if (data.refresh_token) {
        setRefreshToken(data.refresh_token);
      }
      return data.access_token;
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
    // Se não há token, apenas limpar o localStorage
    removeTokens();
    return true;
  }

  try {
    // Obter o refresh token
    const refreshToken = getRefreshToken();
    
    // Chamar o endpoint de logout no backend para revogar o token
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        refresh_token: refreshToken || ''
      }),
    });

    // Independente da resposta do backend, limpar os tokens localmente
    removeTokens();
    
    // Limpar outros dados do localStorage relacionados ao usuário
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
      return true; // Retorna true mesmo com erro do servidor, pois limpamos localmente
    }
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    
    // Mesmo com erro, limpar os tokens localmente
    removeTokens();
    if (typeof window !== "undefined") {
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      localStorage.removeItem('manual-userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
    }
    
    return true; // Retorna true pois limpamos localmente
  }
}

export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  let token = getToken();
  
  // Verificar se o token está expirado
  if (token && isTokenExpired(token)) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      token = newToken;
    } else {
      // Se não conseguiu renovar, redirecionar para página inicial
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

  // Se receber 401, tentar renovar o token uma vez
  if (response.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      // Tentar a requisição novamente com o novo token
      const retryHeaders = {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      };
      return fetch(url, {
        ...options,
        headers: retryHeaders,
      });
    } else {
      // Se não conseguiu renovar, redirecionar para página inicial
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }

  return response;
}
