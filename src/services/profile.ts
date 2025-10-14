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
      const response = await authenticatedFetch<{ data: any }>('/api/users/profile');
      
      const userData = response.data.data;

      const profileData: ProfileData = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        studentRegistration: userData.studentRegistration || userData.registration || userData.matricula || userData.student_registration,
        created_at: userData.created_at || userData.createdAt,
        last_login: userData.last_login || userData.lastLogin
      };

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

      const response = await authenticatedFetch<{ data: any }>('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(backendData),
      });
      const userData = response.data.data;
      const profileData: ProfileData = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        studentRegistration: userData.studentRegistration || userData.registration || userData.matricula || userData.student_registration,
        created_at: userData.created_at || userData.createdAt,
        last_login: userData.last_login || userData.lastLogin
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
