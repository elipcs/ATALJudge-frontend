import { Invite, Class } from '../types';
import { authenticatedFetch } from '../config/api';

// API de Convites
export const invitesApi = {
  // Buscar todos os convites
  async getAll(queryParams?: string): Promise<Invite[]> {
    try {
      const endpoint = queryParams ? `/api/invites?${queryParams}` : '/api/invites';
      const response = await authenticatedFetch<Invite[]>(endpoint);

      if (!response.success) {
        throw new Error('Erro ao buscar convites');
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
      throw error;
    }
  },

  // Buscar convite por ID
  async getById(id: string): Promise<Invite | null> {
    try {
      const response = await authenticatedFetch<Invite>(`/api/invites/${id}`);

      if (!response.success) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar convite:', error);
      throw error;
    }
  },

  // Criar novo convite
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
      const response = await authenticatedFetch<Invite>('/api/invites/generate', {
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

      if (!response.success) {
        throw new Error(response.error || 'Erro ao gerar convite');
      }

      // A resposta já vem no formato correto do endpoint
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar convite:', error);
      throw error;
    }
  },

  // Revogar convite
  async revoke(id: string): Promise<boolean> {
    try {
      const response = await authenticatedFetch(`/api/invites/${id}/revoke`, {
        method: 'POST',
      });

      if (!response.success) {
        throw new Error(response.error || 'Erro ao revogar convite');
      }

      return true;
    } catch (error) {
      console.error('Erro ao revogar convite:', error);
      throw error;
    }
  },

  // Excluir convite
  async delete(id: string): Promise<boolean> {
    try {
      const response = await authenticatedFetch(`/api/invites/${id}`, {
        method: 'DELETE',
      });

      if (!response.success) {
        throw new Error(response.error || 'Erro ao excluir convite');
      }

      return true;
    } catch (error) {
      console.error('Erro ao excluir convite:', error);
      throw error;
    }
  },

  // Validar token
  async validateToken(token: string): Promise<Invite | null> {
    try {
      const response = await fetch('/api/invites/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok || !result.valid) {
        return null;
      }

      // Converter resposta do backend para formato esperado
      return {
        id: result.data.id,
        role: result.data.role,
        token: result.data.token,
        link: `${window.location.origin}/cadastro?token=${result.data.token}`,
        createdAt: new Date().toISOString(),
        expiresAt: result.data.expires_at,
        used: result.data.current_uses >= result.data.max_uses,
        maxUses: result.data.max_uses,
        currentUses: result.data.current_uses,
        classId: result.data.class_id,
        className: result.data.class_name,
        createdBy: result.data.created_by,
        creatorName: result.data.creator_name
      };
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return null;
    }
  },

  // Usar convite (quando alguém se cadastra com o token)
  async useToken(token: string): Promise<boolean> {
    try {
      const response = await fetch('/api/invites/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok || !result.valid) {
        return false;
      }

      // Verificar se ainda pode ser usado
      if (result.data.current_uses >= result.data.max_uses) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao usar token:', error);
      return false;
    }
  }
};

// API de Classes
export const classesApi = {
  // Buscar todas as classes ativas
  async getActive(): Promise<Class[]> {
    try {
      const response = await authenticatedFetch<Class[]>('/api/classes');

      if (!response.success) {
        throw new Error('Erro ao buscar turmas');
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      throw error;
    }
  },

  // Buscar classe por ID
  async getById(id: string): Promise<Class | null> {
    try {
      const response = await authenticatedFetch<Class>(`/api/classes/${id}`);

      if (!response.success) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar turma:', error);
      throw error;
    }
  }
};