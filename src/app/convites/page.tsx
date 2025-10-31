"use client";

import { useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import { InviteForm, InviteList, InviteGuide } from "../../components/invites";
import { useUserRole } from "../../hooks/useUserRole";
import { useInvites } from "../../hooks/useInvites";
import { useInviteFilters } from "../../hooks/useInviteFilters";
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/utils/logger';


export default function InvitesPage() {
  const { userRole, isLoading } = useUserRole();
  const { filterRole, filterStatus } = useInviteFilters();
  const { 
    invites, 
    loading: invitesLoading, 
    error: invitesError, 
    copied, 
    loadInvites, 
    copyLink, 
    deleteInvite, 
    revokeInvite 
  } = useInvites();
  const { toast } = useToast();


  useEffect(() => {
    loadInvites(filterRole, filterStatus);
  }, [loadInvites, filterRole, filterStatus]);

  useEffect(() => {
    if (!isLoading && userRole !== 'professor') {
      window.location.href = '/nao-autorizado';
    }
  }, [isLoading, userRole]);

  if (!isLoading && userRole !== 'professor') {
    return null;
  }

  const handleInviteCreated = () => {
    loadInvites(filterRole, filterStatus);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Gerenciar Convites"
        description="Crie e gerencie links de convite para novos usuários"
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        }
        iconColor="blue"
      />

      <InviteForm onInviteCreated={handleInviteCreated} />

      <InviteList
        invites={invites}
        loading={invitesLoading}
        error={invitesError}
        copied={copied}
        onCopyLink={copyLink}
        onDelete={async (invite) => {
          try {
            await deleteInvite(invite.id);
            await loadInvites(filterRole, filterStatus);
            toast({
              description: "Convite excluído com sucesso!",
            });
          } catch (e) {
            logger.error('Erro ao excluir convite', { error: e });
            toast({
              title: "Erro",
              description: "Erro ao excluir convite",
              variant: "destructive",
            });
          }
        }}
        onRevoke={async (invite) => {
          try {
            await revokeInvite(invite.id);
            toast({
              description: "Convite revogado com sucesso!",
            });
            // Não recarrega a lista para manter o convite revogado visível
            // A atualização local já é feita no hook useInvites
          } catch (e) {
            logger.error('Erro ao revogar convite', { error: e });
            toast({
              title: "Erro",
              description: "Erro ao revogar convite",
              variant: "destructive",
            });
          }
        }}
        onReload={() => loadInvites(filterRole, filterStatus)}
      />

      <InviteGuide />
    </div>
  );
}
