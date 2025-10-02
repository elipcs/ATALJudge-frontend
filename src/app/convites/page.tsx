"use client";

import { useState, useEffect, useCallback } from "react";

import { Invite } from "@/types";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import PageHeader from "../../components/PageHeader";
import { invitesApi, classesApi } from "../../services/invites";
import { useUserRole } from "../../hooks/useUserRole";


export default function ConvitesPage() {
  const { userRole, isLoading } = useUserRole();
  
  const [invites, setInvites] = useState<Invite[]>([]);
  const [role, setRole] = useState<'student' | 'assistant' | 'professor'>('student');
  const [classId, setClassId] = useState('');
  const [maxUses, setMaxUses] = useState(1);
  const [expirationDays, setExpirationDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [invitesError, setInvitesError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [availableClasses, setAvailableClasses] = useState<{id: string; name: string}[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState<string | null>(null);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isExpirationDropdownOpen, setIsExpirationDropdownOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'assistant' | 'professor'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'used' | 'expired'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inviteToDelete, setInviteToDelete] = useState<Invite | null>(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [inviteToRevoke, setInviteToRevoke] = useState<Invite | null>(null);
  const [buttonSuccess, setButtonSuccess] = useState(false);


  const loadInvites = useCallback(async () => {
    try {
      setInvitesLoading(true);
      setInvitesError(null);
      
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
      setInvitesError(error instanceof Error ? error.message : 'Erro ao carregar convites');
      setInvites([]);
    } finally {
      setInvitesLoading(false);
    }
  }, [filterRole, filterStatus]);

  async function loadClasses() {
    try {
      setClassesLoading(true);
      setClassesError(null);
      const classes = await classesApi.getActive();
      const formattedClasses = classes.map(cls => ({
        id: cls.id,
        name: cls.name
      }));
      
      setAvailableClasses(formattedClasses);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      setClassesError(error instanceof Error ? error.message : 'Erro ao carregar turmas');
      setAvailableClasses([]);
    } finally {
      setClassesLoading(false);
    }
  }

  useEffect(() => {
    loadInvites();
    loadClasses();
  }, [loadInvites]);

  useEffect(() => {
    loadInvites();
  }, [loadInvites]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.class-dropdown-container')) {
        setIsClassDropdownOpen(false);
      }
      if (!target.closest('.expiration-dropdown-container')) {
        setIsExpirationDropdownOpen(false);
      }
    };

    if (isClassDropdownOpen || isExpirationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isClassDropdownOpen, isExpirationDropdownOpen]);

  if (!isLoading && userRole !== 'professor') {
    window.location.href = '/nao-autorizado';
    return null;
  }

  async function createInvite() {
    setLoading(true);
    try {
      
      if (role === 'student') {
        if (!classId) {
          alert('Selecione uma turma para convites de aluno');
          return;
        }
        if (availableClasses.length === 0) {
          alert('Você precisa criar pelo menos uma turma ativa antes de gerar convites para alunos');
          return;
        }
      }
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const selectedClass = availableClasses.find(c => c.id === classId);
      
      
      const inviteData = {
        role: role,
        maxUses: maxUses,
        expirationDays: expirationDays,
        classId: role === 'student' ? classId : undefined,
        className: role === 'student' ? selectedClass?.name : undefined,
        createdBy: currentUser.id || 'unknown',
        creatorName: currentUser.name || 'Usuário'
      };
      
      
      const newInvite = await invitesApi.create(inviteData);
      
      await loadInvites();
      
      setClassId('');
      setMaxUses(1);
      setExpirationDays(7);
      
      setButtonSuccess(true);
      setTimeout(() => setButtonSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao gerar convite:', error);
      alert('Erro ao gerar convite: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  }

  async function copyLink(link: string, id: string) {
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
  }


  function showDeleteConfirmation(invite: Invite) {
    setInviteToDelete(invite);
    setShowDeleteModal(true);
  }

  function showRevokeConfirmation(invite: Invite) {
    setInviteToRevoke(invite);
    setShowRevokeModal(true);
  }

  async function confirmDelete() {
    if (!inviteToDelete) return;

    // Salvar a posição atual do scroll
    const scrollPosition = window.scrollY;

    try {
      const success = await invitesApi.delete(inviteToDelete.id);
      if (success) {
        // Recarregar a lista de convites para garantir que está atualizada
        await loadInvites();
        
        // Restaurar a posição do scroll após o re-render
        setTimeout(() => {
          window.scrollTo(0, scrollPosition);
        }, 0);
      }
    } catch (error) {
      alert('Erro ao excluir convite: ' + error);
    } finally {
      setInviteToDelete(null);
    }
  }

  async function confirmRevoke() {
    if (!inviteToRevoke) return;

    // Salvar a posição atual do scroll
    const scrollPosition = window.scrollY;

    try {
      const success = await invitesApi.revoke(inviteToRevoke.id);
      if (success) {
        // Recarregar a lista de convites para garantir que está atualizada
        await loadInvites();
        
        // Restaurar a posição do scroll após o re-render
        setTimeout(() => {
          window.scrollTo(0, scrollPosition);
        }, 0);
      } else {
        alert('Erro ao revogar convite: Convite não encontrado');
      }
    } catch (error) {
      alert('Erro ao revogar convite: ' + error);
    } finally {
      setInviteToRevoke(null);
    }
  }

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

        {/* Formulário de Geração */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Gerar Novo Convite</h2>
          
          {/* Seleção de Tipo de Usuário */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Usuário</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { 
                  value: 'student', 
                  label: 'Aluno', 
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  ), 
                  description: 'Estudante da turma', 
                  color: 'blue' 
                },
                { 
                  value: 'assistant', 
                  label: 'Monitor', 
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ), 
                  description: 'Assistente do professor', 
                  color: 'green' 
                },
                { 
                  value: 'professor', 
                  label: 'Professor', 
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  ), 
                  description: 'Instrutor da disciplina', 
                  color: 'purple' 
                }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setRole(option.value as 'student' | 'assistant' | 'professor');
                    if (option.value !== 'student') {
                    setClassId('');
                  }
                }}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    role === option.value
                      ? option.color === 'blue' 
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : option.color === 'green'
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${
                      role === option.value 
                        ? option.color === 'blue' 
                          ? 'text-blue-600'
                          : option.color === 'green'
                          ? 'text-green-600'
                          : 'text-purple-600'
                        : 'text-gray-500'
                    }`}>
                      {option.icon}
                    </div>
                    <div>
                      <div className={`font-medium ${
                        role === option.value 
                          ? option.color === 'blue' 
                            ? 'text-blue-700'
                            : option.color === 'green'
                            ? 'text-green-700'
                            : 'text-purple-700'
                          : 'text-gray-900'
                      }`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Configurações do Convite */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">

            {role === 'student' && (
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Turma</label>
                <div className="relative class-dropdown-container">
                  <button
                    type="button"
                    onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-left flex items-center justify-between"
                  >
                    <span className={classId ? 'text-gray-900' : 'text-gray-500'}>
                      {classId ? availableClasses.find(cls => cls.id === classId)?.name : 'Selecione uma turma'}
                    </span>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        isClassDropdownOpen ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isClassDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {!classId && (
                        <button
                          type="button"
                          onClick={() => {
                            setClassId('');
                            setIsClassDropdownOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left text-gray-500 hover:bg-gray-50 border-b border-gray-100"
                        >
                          Selecione uma turma
                        </button>
                      )}
                      {availableClasses.map((cls, index) => (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => {
                            setClassId(cls.id);
                            setIsClassDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                            classId === cls.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                          } ${index < availableClasses.length - 1 || !classId ? 'border-b border-gray-100' : ''}`}
                        >
                      {cls.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {classesLoading && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Carregando turmas...
                    </p>
                  </div>
                )}
                
                {classesError && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Erro ao carregar turmas: {classesError}
                    </p>
                    <button 
                      onClick={loadClasses}
                      className="mt-2 text-xs text-red-600 underline hover:text-red-800"
                    >
                      Tentar novamente
                    </button>
                  </div>
                )}
                
                {!classesLoading && !classesError && availableClasses.length === 0 && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700 flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                      Você precisa <a href="/turmas" className="underline font-medium hover:text-amber-800">criar uma turma</a> primeiro
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Máximo de Usos</label>
              <div className="relative">
                <input 
                type="number" 
                value={maxUses} 
                onChange={e => setMaxUses(parseInt(e.target.value))}
                min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Validade do Convite</label>
              <div className="relative expiration-dropdown-container">
                <button
                  type="button"
                  onClick={() => setIsExpirationDropdownOpen(!isExpirationDropdownOpen)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-left flex items-center justify-between"
                >
                  <span className="text-gray-900">
                    {expirationDays === 1 ? '1 dia' : 
                     expirationDays === 7 ? '7 dias' :
                     expirationDays === 30 ? '30 dias' :
                     expirationDays === 90 ? '90 dias' : '7 dias'}
                  </span>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      isExpirationDropdownOpen ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isExpirationDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {[
                      { value: 1, label: '1 dia' },
                      { value: 7, label: '7 dias' },
                      { value: 30, label: '30 dias' },
                      { value: 90, label: '90 dias' }
                    ].map((option, index) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setExpirationDays(option.value);
                          setIsExpirationDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                          expirationDays === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                        } ${index < 3 ? 'border-b border-gray-100' : ''}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={createInvite} 
              disabled={loading || (role === 'student' && !classId)} 
              className={`px-8 py-3 font-medium rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed ${
                buttonSuccess 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:hover:bg-gray-400'
              }`}
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Gerando Convite...
                </>
              ) : buttonSuccess ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Convite Criado!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Gerar Convite
                </>
              )}
          </Button>
          </div>
        </Card>

        {/* Lista de Convites */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Convites Criados</h2>
            <div className="flex items-center gap-4">
              {/* Filtros */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Filtrar por:</label>
                <div className="flex gap-2">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value as 'all' | 'student' | 'assistant' | 'professor')}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos os tipos</option>
                    <option value="student">Alunos</option>
                    <option value="assistant">Monitores</option>
                    <option value="professor">Professores</option>
                  </select>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'used' | 'expired')}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos os status</option>
                    <option value="active">Ativos</option>
                    <option value="used">Usados</option>
                    <option value="expired">Expirados</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {invitesLoading ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Carregando convites...</h3>
              <p className="text-gray-500">Aguarde enquanto buscamos seus convites.</p>
            </div>
          ) : invitesError ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-xl shadow-lg border border-red-200 mx-auto w-fit">
                  <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar convites</h3>
              <p className="text-gray-500 mb-4">{invitesError}</p>
              <button 
                onClick={loadInvites}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02] py-2 px-4 rounded-xl"
              >
                Tentar Novamente
              </button>
            </div>
          ) : invites.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum convite criado</h3>
              <p className="text-gray-500">Crie seu primeiro convite usando o formulário acima.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invites.map(convite => {
                const isActive = !convite.used && new Date(convite.expiresAt) > new Date();
                const isExpired = new Date(convite.expiresAt) < new Date();
                const isUsed = convite.used;
                
                return (
                  <div 
                    key={convite.id} 
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      isActive 
                        ? 'border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100' 
                        : isUsed
                        ? 'border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100'
                        : 'border-yellow-200 bg-yellow-50 hover:border-yellow-300 hover:bg-yellow-100'
                    }`}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                      {/* Tipo e Status - Coluna 1 */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3">
                          {/* Tipo de Usuário */}
                          <div className={`p-2 rounded-lg border ${
                            convite.role === 'student' 
                              ? 'border-blue-500 bg-blue-50' 
                              : convite.role === 'assistant'
                              ? 'border-green-500 bg-green-50'
                              : 'border-purple-500 bg-purple-50'
                          }`}>
                            <div className={`${
                              convite.role === 'student' 
                                ? 'text-blue-600' 
                                : convite.role === 'assistant'
                                ? 'text-green-600'
                                : 'text-purple-600'
                            }`}>
                              {convite.role === 'student' ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                              </svg>
                              ) : convite.role === 'assistant' ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                               </svg>
                           ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                               </svg>
                              )}
                            </div>
                          </div>

                          {/* Status */}
                          <div className={`p-2 rounded-lg border ${
                            isActive 
                              ? 'border-green-500 bg-green-50' 
                              : isUsed
                              ? 'border-red-500 bg-red-50'
                              : 'border-yellow-500 bg-yellow-50'
                          }`}>
                            <div className={`${
                              isActive 
                                ? 'text-green-600' 
                                : isUsed
                                ? 'text-red-600'
                                : 'text-yellow-600'
                            }`}>
                              {isActive ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : isUsed ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Informações Principais - Coluna 2 */}
                      <div className="lg:col-span-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Tipo e Status Texto */}
                        <div>
                            <div className="text-sm font-medium text-gray-900">
                              {convite.role === 'student' ? 'Aluno' : 
                               convite.role === 'assistant' ? 'Monitor' : 'Professor'}
                            </div>
                            <div className={`text-xs font-medium ${
                              isActive 
                                ? 'text-green-700' 
                                : isUsed
                                ? 'text-red-700'
                                : 'text-yellow-700'
                            }`}>
                              {isActive ? 'Ativo' : isUsed ? 'Usado' : 'Expirado'}
                            </div>
                        </div>
                        
                          {/* Usos */}
                        <div>
                            <div className="text-sm font-medium text-gray-900">
                              {convite.currentUses || 0}/{convite.maxUses} usos
                        </div>
                            <div className="text-xs text-gray-500">Limite</div>
                      </div>

                          {/* Turma (se aplicável) */}
                      {convite.classId && (
                            <div>
                              <div className="text-sm font-medium text-indigo-600">
                            {convite.className || convite.classId}
                              </div>
                              <div className="text-xs text-gray-500">Turma</div>
                        </div>
                      )}
                        </div>
                      </div>

                      {/* Datas - Coluna 3 */}
                      <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                            <div className="text-xs text-gray-500">Criado</div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(convite.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZone: 'America/Sao_Paulo'
                              })}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-gray-500">Expira</div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(convite.expiresAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZone: 'America/Sao_Paulo'
                              })}
                            </div>
                        </div>
                      </div>
                    </div>

                      {/* Ações - Coluna 4 */}
                      <div className="lg:col-span-2">
                        <div className="flex flex-col gap-2">
                          {/* Botão de Copiar (só se ativo) */}
                          {isActive && (
                        <Button
                          onClick={() => copyLink(convite.link, convite.id)}
                              className={`w-full px-6 py-2.5 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                                copied === convite.id 
                                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                        >
                          {copied === convite.id ? (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                                  Copiado
                                </>
                          ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                                  Copiar
                                </>
                          )}
                        </Button>
                      )}
                      
                          {/* Botão de Ação (Revogar/Excluir) */}
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (isExpired || isUsed) {
                            showDeleteConfirmation(convite);
                          } else {
                            showRevokeConfirmation(convite);
                          }
                        }}
                            className={`w-full px-6 py-2.5 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                              (isExpired || isUsed) 
                                ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
                                : 'border-red-200 text-red-700 hover:bg-red-50'
                            }`}
                          >
                            {isExpired || isUsed ? (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Excluir
                                </>
                            ) : (
                                <>
                                <svg className="w-4 h-4" fill="none" stroke="red" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Revogar
                                </>
                            )}
                      </Button>
                    </div>
                  </div>
            </div>

                    {/* Link do Convite (linha separada) */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="text-xs font-medium text-gray-700">Link do Convite</span>
        </div>
                      <div className="bg-white p-2 rounded border text-xs font-mono break-all text-gray-700">
                        {convite.link}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Guia de Como Usar os Convites */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Como usar os convites</h2>
              <p className="text-gray-600 mt-1">Entenda os diferentes tipos de convites e suas funcionalidades</p>
            </div>
        </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Convite para Alunos */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-blue-900">Convites para Alunos</h3>
              </div>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Precisam de uma turma associada</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Acesso às listas de exercícios da turma</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Podem submeter soluções e ver resultados</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Visualizam estatísticas pessoais</span>
                </li>
              </ul>
            </div>

            {/* Convite para Monitores */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-green-900">Convites para Monitores</h3>
              </div>
              <ul className="text-sm text-green-800 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Podem ajudar na gestão das turmas</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Acesso às submissões dos alunos</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Visualizam estatísticas das turmas</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Podem auxiliar na correção de exercícios</span>
                </li>
              </ul>
            </div>

            {/* Convite para Professores */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-purple-900">Convites para Professores</h3>
              </div>
              <ul className="text-sm text-purple-800 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Acesso completo ao sistema</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Podem criar e gerenciar turmas</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Criar listas de exercícios</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Gerar convites para outros usuários</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Dicas Adicionais */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Dicas importantes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Configure a validade do convite conforme necessário (1 a 90 dias)</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Defina o número máximo de usos para cada convite</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Convites expirados ou usados podem ser excluídos</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Use os filtros para organizar e encontrar convites específicos</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Modal de Confirmação de Exclusão */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setInviteToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Excluir Convite"
          message={`Tem certeza que deseja excluir este convite? Esta ação não pode ser desfeita e o convite será permanentemente removido do sistema.`}
          confirmText="Sim, Excluir"
          cancelText="Cancelar"
          type="danger"
        />

        {/* Modal de Confirmação de Revogação */}
        <ConfirmationModal
          isOpen={showRevokeModal}
          onClose={() => {
            setShowRevokeModal(false);
            setInviteToRevoke(null);
          }}
          onConfirm={confirmRevoke}
          title="Revogar Convite"
          message={`Tem certeza que deseja revogar este convite? O convite será marcado como usado e não poderá mais ser utilizado para cadastros.`}
          confirmText="Sim, Revogar"
          cancelText="Cancelar"
          type="warning"
        />

    </div>
  );
}
