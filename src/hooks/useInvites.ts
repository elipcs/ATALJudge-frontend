import { useState, useCallback } from "react";
import { Invite } from "@/types";
import { invitesApi } from "../services/invites";
import { createBrazilianDate } from "../utils";

export function useInvites() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const loadInvites = useCallback(async (filterRole: string, filterStatus: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filterRole !== 'all') {
        params.append('role', filterRole);
      }
      if (filterStatus !== 'all') {
        if (filterStatus === 'used') {
          params.append('used', 'true');
        } else if (filterStatus === 'active') {
          params.append('used', 'false');
        }
      }
      
      const queryString = params.toString();
      const invitesDTO = await invitesApi.getAll(queryString);

      // Converter InviteResponseDTO para Invite
      const invites: Invite[] = invitesDTO.map(dto => ({
        id: dto.id,
        role: dto.role,
        token: dto.token,
        link: dto.link,
        createdAt: typeof dto.createdAt === 'string' ? dto.createdAt : new Date(dto.createdAt).toISOString(),
        expiresAt: typeof dto.expiresAt === 'string' ? dto.expiresAt : new Date(dto.expiresAt).toISOString(),
        used: dto.isUsed,
        maxUses: dto.maxUses,
        currentUses: dto.currentUses,
        classId: dto.classId,
        className: dto.className,
        createdBy: dto.createdById || '',
        creatorName: dto.creatorName || ''
      }));

      const now = new Date();
      const filtered = invites.filter((inv) => {
        const roleOk = filterRole === 'all' || inv.role === filterRole;
        const expiresAt = createBrazilianDate(inv.expiresAt);
        const isActive = !inv.used && expiresAt && now < expiresAt;
        const isExpired = expiresAt && now >= expiresAt;
        const isUsed = inv.used;
        const statusOk =
          filterStatus === 'all' ||
          (filterStatus === 'active' && !!isActive) ||
          (filterStatus === 'used' && !!isUsed) ||
          (filterStatus === 'expired' && !!isExpired);
        return roleOk && statusOk;
      });

      const sortedInvites = filtered.sort((a, b) => {
        const aExpiresAt = createBrazilianDate(a.expiresAt);
        const bExpiresAt = createBrazilianDate(b.expiresAt);
        const aIsActive = !a.used && aExpiresAt && now < aExpiresAt;
        const bIsActive = !b.used && bExpiresAt && now < bExpiresAt;
        
        if (aIsActive && !bIsActive) return -1;
        if (!aIsActive && bIsActive) return 1;
        
        const aCreatedAt = createBrazilianDate(a.createdAt);
        const bCreatedAt = createBrazilianDate(b.createdAt);
        return (bCreatedAt?.getTime() || 0) - (aCreatedAt?.getTime() || 0);
      });
      
      setInvites(sortedInvites);
    } catch (error) {
      console.error('Error loading invites:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar convites');
      setInvites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const copyLink = async (link: string, id: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(id);
      setTimeout(() => {
        setCopied(null);
      }, 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(id);
      setTimeout(() => {
        setCopied(null);
      }, 2000);
    }
  };

  const deleteInvite = async (inviteId: string) => {
    try {
      const success = await invitesApi.delete(inviteId);
      if (success) {
        setInvites(prev => prev.filter(invite => invite.id !== inviteId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting invite:', error);
      throw error;
    }
  };

  const revokeInvite = async (inviteId: string) => {
    try {
      const success = await invitesApi.revoke(inviteId);
      if (success) {
        setInvites(prev => prev.map(invite => 
          invite.id === inviteId ? { ...invite, used: true } : invite
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error revoking invite:', error);
      throw error;
    }
  };

  return {
    invites,
    loading,
    error,
    copied,
    loadInvites,
    copyLink,
    deleteInvite,
    revokeInvite,
  };
}
