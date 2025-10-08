"use client";

import { useEffect } from "react";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import PageHeader from "../../components/PageHeader";
import { InviteForm, InviteList, InviteGuide } from "../../components/invites";
import { useUserRole } from "../../hooks/useUserRole";
import { useInvites } from "../../hooks/useInvites";
import { useInviteFilters } from "../../hooks/useInviteFilters";
import { useInviteActions } from "../../hooks/useInviteActions";


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
  
  const {
    showDeleteModal,
    showRevokeModal,
    inviteToDelete,
    inviteToRevoke,
    showDeleteConfirmation,
    showRevokeConfirmation,
    confirmDelete,
    confirmRevoke,
    closeDeleteModal,
    closeRevokeModal,
  } = useInviteActions();


  useEffect(() => {
    loadInvites(filterRole, filterStatus);
  }, [loadInvites, filterRole, filterStatus]);

  if (!isLoading && userRole !== 'professor') {
    window.location.href = '/nao-autorizado';
    return null;
  }

  const handleInviteCreated = () => {
    loadInvites(filterRole, filterStatus);
  };

  const handleDeleteConfirm = async () => {
    await confirmDelete(() => {
      loadInvites(filterRole, filterStatus);
    });
  };

  const handleRevokeConfirm = async () => {
    await confirmRevoke(() => {
      loadInvites(filterRole, filterStatus);
    });
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
        onDelete={showDeleteConfirmation}
        onRevoke={showRevokeConfirmation}
        onReload={() => loadInvites(filterRole, filterStatus)}
      />

      <InviteGuide />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Excluir Convite"
        message={`Tem certeza que deseja excluir este convite? Esta ação não pode ser desfeita e o convite será permanentemente removido do sistema.`}
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de Confirmação de Revogação */}
      <ConfirmationModal
        isOpen={showRevokeModal}
        onClose={closeRevokeModal}
        onConfirm={handleRevokeConfirm}
        title="Revogar Convite"
        message={`Tem certeza que deseja revogar este convite? O convite será marcado como usado e não poderá mais ser utilizado para cadastros.`}
        confirmText="Sim, Revogar"
        cancelText="Cancelar"
        type="warning"
      />
    </div>
  );
}
