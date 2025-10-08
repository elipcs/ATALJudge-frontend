"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/PageHeader";
import { CreateListModal, EditListModal } from "@/components/lists";
import { mockDataApi } from "@/services/mockData";
import { QuestionList } from "@/types";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserClasses } from "@/hooks/useClassesData";
import { useCurrentUser } from "@/hooks/useHomeData";
import { formatDateTime, getListStatusColor, getListStatusText, getListStatusIcon } from "@/utils";
import { LIST_STATUS_OPTIONS, MESSAGES } from "@/constants";
import PageLoading from "@/components/PageLoading";


export default function ListsPage() {
  const [lists, setLists] = useState<QuestionList[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingList, setEditingList] = useState<QuestionList | null>(null);
  
  const { userRole } = useUserRole();
  const { data: currentUser } = useCurrentUser();
  const { classes } = useUserClasses(currentUser?.id || '', userRole || 'student');

  useEffect(() => {
    const timer = setTimeout(() => {
      const mockLists = mockDataApi.questionLists();
      setLists(mockLists);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const filteredLists = useMemo(() => {
    return lists.filter(list => {
      const matchSearch = search === '' || 
        list.title.toLowerCase().includes(search.toLowerCase()) ||
        list.description?.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || list.status === statusFilter;
      
      return matchSearch && matchStatus;
    });
  }, [lists, search, statusFilter]);

  const handleCreateList = async (listData: any) => {
    try {
      const newList: QuestionList = {
        id: Date.now().toString(),
        title: listData.title,
        description: listData.description,
        status: 'draft',
        startDate: listData.startDate,
        endDate: listData.endDate,
        questions: [],
        classIds: listData.classIds || []
      };
      
      setLists(prev => [newList, ...prev]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Erro ao criar lista:', error);
      throw error;
    }
  };

  const handleEditList = async (listData: any) => {
    try {
      if (!editingList) return;
      
      const updatedList: QuestionList = {
        ...editingList,
        title: listData.title,
        description: listData.description,
        startDate: listData.startDate,
        endDate: listData.endDate,
        classIds: listData.classIds || editingList.classIds
      };
      
      setLists(prev => prev.map(list => 
        list.id === editingList.id ? updatedList : list
      ));
      
      setShowEditModal(false);
      setEditingList(null);
    } catch (error) {
      console.error('Erro ao editar lista:', error);
      throw error;
    }
  };

  const handleEditClick = (list: QuestionList) => {
    setEditingList(list);
    setShowEditModal(true);
  };


  if (loading) {
    return <PageLoading message="Carregando listas..." description="Preparando as listas de exercícios" />;
  }

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
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border border-slate-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02]"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Lista
          </Button>
        )}
      </PageHeader>

      {/* Filtros */}
      <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Filtros</h3>
          {(search || statusFilter !== 'all') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
              }}
              className="text-sm border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
            >
              Limpar Filtros
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Buscar</label>
            <Input
              placeholder="Buscar listas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 text-sm bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published')}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-slate-900"
            >
              {LIST_STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de listas */}
      <div className="grid gap-6">
        {filteredLists.length === 0 ? (
          <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-12 text-center">
            <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 rounded-xl shadow-lg border border-slate-200 mx-auto mb-6 w-fit">
              <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Nenhuma lista encontrada</h3>
            <p className="text-slate-600 text-lg leading-relaxed max-w-lg mx-auto mb-8">
              Tente ajustar os filtros ou criar uma nova lista.
            </p>
            {userRole !== 'student' && (
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border border-slate-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02]"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Criar Primeira Lista
              </Button>
            )}
          </Card>
          ) : (
          filteredLists.map((list) => (
            <Link key={list.id} href={`/listas/${list.id}`} className="block">
              <Card className="bg-white border-slate-200 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        {list.title}
                      </h3>
                      {list.description && (
                        <p className="text-slate-600 text-lg">{list.description}</p>
                      )}
                    </div>
                    
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4 mb-4">
                      <div className="flex items-center gap-6 text-sm">
                        <span className="flex items-center gap-2 text-slate-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="font-semibold text-slate-900">{list.questions.length} questões</span>
                        </span>
                        <span className="flex items-center gap-2 text-slate-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-semibold text-slate-900">
                            {formatDateTime(list.startDate)} - {formatDateTime(list.endDate)}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500">
                      Criada em {formatDateTime(list.startDate)} | Última atualização recente
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${getListStatusColor(list.status)}`}>
                      {getListStatusIcon(list.status)}
                      {getListStatusText(list.status)}
                    </span>
                    
                    {userRole !== 'student' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditClick(list);
                          }}
                          className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // TODO: Implementar duplicação
                          }}
                          className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Duplicar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Modais */}
      <CreateListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateList}
        classes={classes.map(cls => ({ id: cls.id, name: cls.name }))}
      />

      <EditListModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingList(null);
        }}
        onSubmit={handleEditList}
        classes={classes.map(cls => ({ id: cls.id, name: cls.name }))}
        listData={editingList ? {
          id: editingList.id,
          title: editingList.title,
          description: editingList.description || '',
          startDate: editingList.startDate,
          endDate: editingList.endDate,
          classIds: editingList.classIds
        } : undefined}
      />
    </div>
  );
}