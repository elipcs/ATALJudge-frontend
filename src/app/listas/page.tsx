"use client";

import { useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { 
  CreateListModal, 
  EditListModal, 
  ListsFilters, 
  ListsGrid,
  ListsError
} from "@/components/lists";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useUserRole } from "@/hooks/useUserRole";
import { useCurrentUser } from "@/hooks/useHomeData";
import { useListsData } from "@/hooks/useListsData";
import { useListsActions } from "@/hooks/useListsActions";
import PageLoading from "@/components/PageLoading";

export default function ListsPage() {
  const [search, setSearch] = useState('');
  
  const { userRole } = useUserRole();
  const { data: currentUser } = useCurrentUser();
  const { 
    lists, 
    classes, 
    loading, 
    error, 
    refreshLists, 
    createList, 
    updateList, 
    deleteList, 
    duplicateList,
    setFilters,
    clearFilters
  } = useListsData(userRole, currentUser);

  const {
    showCreateModal,
    showEditModal,
    showDeleteModal,
    editingList,
    deletingList,
    handleCreateList: baseHandleCreateList,
    handleEditList: baseHandleEditList,
    handleDeleteList: baseHandleDeleteList,
    handleDuplicateList: baseHandleDuplicateList,
    handleEditClick,
    handleDeleteClick,
    setShowCreateModal,
    closeCreateModal,
    closeEditModal,
    closeDeleteModal
  } = useListsActions({
    createList,
    updateList,
    deleteList,
    duplicateList
  });

  const handleCreateList = async (listData: any) => {
    await baseHandleCreateList(listData);
    await refreshLists();
  };

  const handleEditList = async (listData: any) => {
    await baseHandleEditList(listData);
    await refreshLists();
  };

  const handleDeleteList = async () => {
    await baseHandleDeleteList();
    await refreshLists();
  };

  const handleDuplicateList = async (list: any) => {
    await baseHandleDuplicateList(list);
    await refreshLists();
  };

  useMemo(() => {
    const filters = {
      search: search || undefined
    };
    setFilters(filters);
  }, [search, setFilters]);

  const filteredLists = useMemo(() => {
    return lists.filter(list => {
      if (!list || !list.id) {
        return false;
      }
      
      const matchSearch = search === '' || 
        list.title.toLowerCase().includes(search.toLowerCase()) ||
        list.description?.toLowerCase().includes(search.toLowerCase());
      
      return matchSearch;
    });
  }, [lists, search]);

  if (loading && lists.length === 0) {
    return <PageLoading message="Carregando listas..." description="Preparando as listas de exercícios" />;
  }

  if (error) {
    return (
      <ListsError 
        error={error}
        onRetry={() => window.location.reload()}
        onRefresh={() => window.location.reload()}
      />
    );
  }

  const handleClearFilters = () => {
    setSearch('');
    clearFilters();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <PageHeader
        title="Listas de Exercícios"
        description="Gerencie e visualize todas as listas de exercícios"
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        iconColor="slate"
      >
        {userRole !== 'student' && (
          <Button
            variant="outline"
            onClick={() => setShowCreateModal(true)}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Lista
          </Button>
        )}
      </PageHeader>

  {}

      {}
      <ListsFilters
        search={search}
        userRole={userRole}
        onSearchChange={setSearch}
        onClearFilters={handleClearFilters}
      />

      {}
      <ListsGrid
        lists={filteredLists}
        userRole={userRole}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onDuplicate={handleDuplicateList}
        onCreateList={() => setShowCreateModal(true)}
        classes={classes}
      />

      {}
      <CreateListModal
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        onSubmit={handleCreateList}
        classes={classes.map(cls => ({ id: cls.id, name: cls.name }))}
      />

      <EditListModal
        isOpen={showEditModal}
        onClose={closeEditModal}
        onSubmit={handleEditList}
        onRefresh={refreshLists}
        classes={classes.map(cls => ({ id: cls.id, name: cls.name }))}
        listData={editingList ? {
          id: editingList.id,
          title: editingList.title,
          description: editingList.description || '',
          startDate: editingList.startDate,
          endDate: editingList.endDate,
          classIds: editingList.classIds || []
        } : undefined}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteList}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a lista "${deletingList?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
