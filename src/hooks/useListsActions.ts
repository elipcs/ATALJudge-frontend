import { useState } from "react";
import { QuestionList } from "@/types";
import { createBrazilianDate } from "@/utils";
import { listsApi } from "@/services/lists";

interface UseListsActionsProps {
  createList: (listData: any) => Promise<any>;
  updateList: (id: string, listData: any) => Promise<any>;
  deleteList: (id: string) => Promise<any>;
  duplicateList: (id: string) => Promise<any>;
}

export function useListsActions({
  createList,
  updateList,
  deleteList,
  duplicateList
}: UseListsActionsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingList, setEditingList] = useState<QuestionList | null>(null);
  const [deletingList, setDeletingList] = useState<QuestionList | null>(null);

  const handleCreateList = async (listData: any) => {
    try {
      await createList(listData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Erro ao criar lista:', error);
      throw error;
    }
  };

  const handleEditList = async (listData: any) => {
    try {
      if (!editingList) return;
      
      await updateList(editingList.id, listData);
      setShowEditModal(false);
      setEditingList(null);
    } catch (error) {
      console.error('Erro ao editar lista:', error);
      throw error;
    }
  };

  const handleDeleteList = async () => {
    try {
      if (!deletingList) return;
      
      await deleteList(deletingList.id);
      setShowDeleteModal(false);
      setDeletingList(null);
    } catch (error) {
      console.error('Erro ao deletar lista:', error);
      throw error;
    }
  };

  const handleDuplicateList = async (list: QuestionList) => {
    try {
      await duplicateList(list.id);
    } catch (error) {
      console.error('Erro ao duplicar lista:', error);
      throw error;
    }
  };

  const handleEditClick = (list: QuestionList) => {
    setEditingList(list);
    setShowEditModal(true);
  };

  const handleDeleteClick = (list: QuestionList) => {
    setDeletingList(list);
    setShowDeleteModal(true);
  };

  const closeCreateModal = () => setShowCreateModal(false);
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingList(null);
  };
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingList(null);
  };

  return {
    showCreateModal,
    showEditModal,
    showDeleteModal,
    editingList,
    deletingList,
    handleCreateList,
    handleEditList,
    handleDeleteList,
    handleDuplicateList,
    handleEditClick,
    handleDeleteClick,
    setShowCreateModal,
    closeCreateModal,
    closeEditModal,
    closeDeleteModal
  };
}
