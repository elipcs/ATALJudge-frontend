import { Invite, Class } from '../types';
import { authenticatedFetch, frontendFetch } from '../config/api';


export const invitesApi = {
  async getAll(queryParams?: string): Promise<Invite[]> {
    try {
      const endpoint = queryParams ? `/api/invites?${queryParams}` : '/api/invites';
      const response = await authenticatedFetch<Invite[] | { invites: Invite[] }>(endpoint);
      const payload = response.data as any;
      const list: Invite[] = Array.isArray(payload) ? payload : (payload?.invites ?? []);
      return list;
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Invite | null> {
    try {
      const response = await authenticatedFetch<Invite | { invite: Invite }>(`/api/invites/${id}`);
      const payload = response.data as any;
      const invite: Invite | undefined = (payload && 'invite' in payload) ? payload.invite : payload;
      return (invite as Invite) || null;
    } catch (error) {
      console.error('Erro ao buscar convite:', error);
      throw error;
    }
  },

  async create(data: {
    role: 'student' | 'assistant' | 'professor';
    maxUses: number;
    expirationDays: number;
    classId?: string;
    className?: string;
    createdBy: string;
    creatorName: string;
  }): Promise<Invite> {
    try {
      const response = await authenticatedFetch<Invite | { invite: Invite }>('/api/invites/create', {
        method: 'POST',
        body: JSON.stringify({
          role: data.role,
          classId: data.classId,
          className: data.className,
          maxUses: data.maxUses,
          expirationDays: data.expirationDays,
          createdBy: data.createdBy,
          creatorName: data.creatorName
        }),
      });

      const payload = response.data as any;
      const invite: Invite = (payload && 'invite' in payload) ? payload.invite : payload;
      return invite;
    } catch (error) {
      console.error('Erro ao gerar convite:', error);
      throw error;
    }
  },

  async revoke(id: string): Promise<boolean> {
    try {
      await authenticatedFetch(`/api/invites/${id}/revoke`, {
        method: 'POST',
      });

      return true;
    } catch (error) {
      console.error('Erro ao revogar convite:', error);
      throw error;
    }
  },

   
  async delete(id: string): Promise<boolean> {
    try {
      await authenticatedFetch(`/api/invites/${id}`, {
        method: 'DELETE',
      });

      return true;
    } catch (error) {
      console.error('Erro ao excluir convite:', error);
      throw error;
    }
  },

  async validateToken(token: string): Promise<Invite | null> {
    try {
      const response = await frontendFetch<{
        valid: boolean;
        data: {
          id: string;
          role: string;
          token: string;
          expires_at: string;
          current_uses: number;
          max_uses: number;
          classId: string;
          class_name: string;
          created_by: string;
          creator_name: string;
        };
      }>('/api/invites/verify', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      if (!response.data.valid) {
        return null;
      }

      const data = response.data.data;
      return {
        id: data.id,
        role: data.role as 'student' | 'assistant' | 'professor',
        token: data.token,
        link: `${window.location.origin}/cadastro?token=${data.token}`,
        createdAt: new Date().toISOString(),
        expiresAt: data.expires_at,
        used: data.current_uses >= data.max_uses,
        maxUses: data.max_uses,
        currentUses: data.current_uses,
        classId: data.classId,
        className: data.class_name,
        createdBy: data.created_by,
        creatorName: data.creator_name
      };
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return null;
    }
  },

  async useToken(token: string): Promise<boolean> {
    try {
      const response = await frontendFetch<{
        valid: boolean;
        data: {
          current_uses: number;
          max_uses: number;
        };
      }>('/api/invites/verify', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      if (!response.data.valid) {
        return false;
      }

      const data = response.data.data;
      if (data.current_uses >= data.max_uses) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao usar token:', error);
      return false;
    }
  }
};