import { useState, useCallback } from "react";
import { Invite } from "@/types";
import { invitesApi } from "../services/invites";

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
      const invites = await invitesApi.getAll(queryString);
      
      const sortedInvites = invites.sort((a, b) => {
        const aIsActive = !a.used && new Date(a.expiresAt) > new Date();
        const bIsActive = !b.used && new Date(b.expiresAt) > new Date();
        
        if (aIsActive && !bIsActive) return -1;
        if (!aIsActive && bIsActive) return 1;
        
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
