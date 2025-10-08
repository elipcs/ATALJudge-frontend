import { authenticatedFetch } from '../config/api';

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: 'professor' | 'student' | 'assistant';
  studentRegistration?: string;
  created_at: string;
  last_login?: string;
  avatarUrl?: string;
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

export const profileApi = {

  async getProfile(): Promise<ProfileData> {
    try {
      const response = await authenticatedFetch<any>('/api/users/profile');
      
      console.log('🔍 Debug - Resposta completa:', response);
      console.log('🔍 Debug - Dados do perfil recebidos:', response.data);

      const rawData = response.data;

      const profileData: ProfileData = {
        id: rawData.id,
        name: rawData.name,
        email: rawData.email,
        role: rawData.role,
        studentRegistration: rawData.studentRegistration || rawData.registration || rawData.matricula || rawData.student_registration,
        created_at: rawData.created_at || rawData.createdAt,
        last_login: rawData.last_login || rawData.lastLogin
      };

      console.log('🔍 Debug - Dados mapeados finais:', profileData);

      return profileData;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw error;
    }
  },

  async updateProfile(data: UpdateProfileData): Promise<ProfileData> {
    try {
      const backendData = {
        name: data.name,
        student_registration: data.studentRegistration
      };

      const response = await authenticatedFetch<any>('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(backendData),
      });

      const rawData = response.data;

      const profileData: ProfileData = {
        id: rawData.id,
        name: rawData.name,
        email: rawData.email,
        role: rawData.role,
        studentRegistration: rawData.student_registration,
        created_at: rawData.created_at || rawData.createdAt,
        last_login: rawData.last_login || rawData.lastLogin
      };

      return profileData;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  async changePassword(data: ChangePasswordData): Promise<boolean> {
    try {
      await authenticatedFetch('/api/users/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return true;
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      
      throw new Error(String(error));
    }
  },

};
