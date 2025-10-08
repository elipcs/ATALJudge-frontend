import { authenticatedFetch, frontendFetch } from '../config/api';

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

export const authApi = {
  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  },

  getRefreshToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
  },

  setToken(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem("token", token);
  },

  setRefreshToken(refreshToken: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem("refreshToken", refreshToken);
  },

  setTokens(token: string, refreshToken: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
  },

  removeToken() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
  },

  removeRefreshToken() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("refreshToken");
  },

  removeTokens() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  },

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  },

  async checkAuthentication(): Promise<boolean> {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (!token && !refreshToken) {
      return false;
    }

    if (token && !this.isTokenExpired(token)) {
      return true;
    }

    if (refreshToken) {
      try {
        const newToken = await this.refreshAccessToken();
        return !!newToken;
      } catch (error) {
        return false;
      }
    }

    return false;
  },

  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await authenticatedFetch<{ accessToken: string }>('/api/auth/refresh', {
        method: "POST",
        body: JSON.stringify({
          refreshToken: refreshToken
        }),
      });

      const accessToken = response.data.accessToken;

      if (accessToken) {
        this.setToken(accessToken);
        return accessToken;
      }
      return null;
    } catch (error) {
      console.error("Erro ao renovar token:", error);
      this.removeTokens();
      return null;
    }
  },

  async logout(): Promise<boolean> {
    const token = this.getToken();
    
    if (!token) {
      this.removeTokens();
      return true;
    }

    try {
      const refreshToken = this.getRefreshToken();
      
      await authenticatedFetch('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: refreshToken
        }),
      });

      this.removeTokens();
      
      if (typeof window !== "undefined") {
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        localStorage.removeItem('manual-userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
      }

      return true;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      
      this.removeTokens();
      if (typeof window !== "undefined") {
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        localStorage.removeItem('manual-userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
      }
      
      return true;
    }
  },

  async login(email: string, password: string): Promise<{
    user: any;
    accessToken: string;
    refreshToken: string;
  }> {
    const requestBody = { email, password };
    
    const response = await frontendFetch<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/api/auth/login', {
      method: "POST",
      body: JSON.stringify(requestBody),
    });
    
    const data = response.data;
    
    if (!data.accessToken) {
      throw new Error("Token de acesso não recebido do servidor");
    }
    
    if (!data.refreshToken) {
      throw new Error("Token de refresh não recebido do servidor");
    }
    
    return data;
  },

  async registerUser(
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

      const response = await frontendFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      return {
        success: true,
        message: "Cadastro realizado com sucesso"
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao realizar cadastro"
      };
    }
  },

};
