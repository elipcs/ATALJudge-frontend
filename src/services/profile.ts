import { authenticatedFetch } from '../config/api';

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: 'professor' | 'student' | 'assistant';
  avatarUrl?: string;
  studentRegistration?: string;
  created_at: string;
  last_login?: string;
}

export interface UpdateProfileData {
  name: string;
  studentRegistration?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  userId?: string;
}

// Profile API
export const profileApi = {
  // Get profile data
  async getProfile(): Promise<ProfileData> {
    try {
      const response = await authenticatedFetch<ProfileData>('/api/users/profile');

      if (!response.success) {
        throw new Error('Erro ao buscar perfil');
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw error;
    }
  },

  // Update profile data
  async updateProfile(data: UpdateProfileData): Promise<ProfileData> {
    try {
      const response = await authenticatedFetch<ProfileData>('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (!response.success) {
        throw new Error(response.error || 'Erro ao atualizar perfil');
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  // Change password
  async changePassword(data: ChangePasswordData): Promise<boolean> {
    try {
      // Fazer requisição diretamente para contornar o authenticatedFetch
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao alterar senha');
      }

      return true;
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      
      // Se o erro é uma instância de Error, preservar a mensagem
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      
      // Se não for, converter para string
      throw new Error(String(error));
    }
  },

  // Upload avatar
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await authenticatedFetch<{ avatarUrl: string }>('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.success) {
        throw new Error(response.error || 'Erro ao fazer upload do avatar');
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      throw error;
    }
  }
};
