"use client";

import React, { useState, useEffect } from "react";

import { useUserRole } from "@/hooks/useUserRole";
import { useCurrentUser } from "@/hooks/useHomeData";
import { useUserClasses, useCreateClass, useClassStudents } from "@/hooks/useClassesData";
import { CreateClassModal, ClassDetails } from "@/components/turmas";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Class, Student } from "@/types";




export default function TurmasPage() {
  const { userRole, isLoading: userRoleLoading } = useUserRole();
  const { data: currentUser } = useCurrentUser();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [classDetails, setClassDetails] = useState<{ cls: Class; students: Student[] } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [createClassModal, setCreateClassModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Hooks para dados
  const { classes, loading: classesLoading, error: classesError } = useUserClasses(currentUser?.id || '', userRole || 'student');
  const { createClass, loading: createLoading, error: createError } = useCreateClass();
  const { students, loading: studentsLoading } = useClassStudents(selectedClassId || '');

  // Para alunos, configurar automaticamente quando as turmas carregarem
  useEffect(() => {
    if (userRole === 'student' && classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [userRole, classes.length, selectedClassId]); // Usar classes.length em vez de classes para evitar re-renders desnecessários

  // Para alunos, sempre mostrar loading até que todos os dados estejam prontos
  const isStudentDataReady = userRole === 'student' && classes.length > 0 && selectedClassId && !studentsLoading;

  // Atualizar detalhes quando tudo estiver pronto - para alunos
  useEffect(() => {
    if (userRole === 'student' && selectedClassId && !studentsLoading && classes.length > 0) {
      const classData = classes.find(cls => cls.id === selectedClassId);
      if (classData) {
        // Se a API de alunos retornou vazio mas a turma tem alunos, usar os alunos da turma
        const studentsToUse = students.length > 0 ? students : (classData.students || []);
        
        setClassDetails({
          cls: classData,
          students: studentsToUse
        });
        setShowDetails(true);
      }
    }
  }, [userRole, selectedClassId, studentsLoading, classes.length, students.length]); // Usar .length para evitar re-renders desnecessários

  // Atualizar detalhes quando tudo estiver pronto - para professores e monitores
  useEffect(() => {
    if ((userRole === 'professor' || userRole === 'assistant') && selectedClassId && !studentsLoading && classes.length > 0) {
      const classData = classes.find(cls => cls.id === selectedClassId);
      if (classData) {
        // Usar dados dos alunos carregados via API, ou fallback para dados da turma
        const studentsToUse = students.length > 0 ? students : (classData.students || []);
        
        setClassDetails({
          cls: classData,
          students: studentsToUse
        });
      }
    }
  }, [userRole, selectedClassId, studentsLoading, classes.length, students.length]);

  async function handleCreateClass(nameClass: string) {
    if (!nameClass.trim()) {
      setError('Nome da turma é obrigatório');
      return;
    }

    setError("");
    setSuccess("");

    try {
      const newClass = await createClass({
        name: nameClass.trim(),
        professorId: currentUser?.id ?? '',
        professorName: currentUser?.name ?? ''
      });
      
      if (newClass) {
        setSuccess('Turma criada com sucesso!');
        setCreateClassModal(false);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(createError || 'Erro ao criar turma');
      }
    } catch (error: unknown) {
      setError((error as Error).message || 'Erro ao criar turma');
    }
  }



  function handleViewClassDetails(cls: Class) {
    setSelectedClassId(cls.id);
    setShowDetails(true);
  }

  function handleBackToList() {
    setShowDetails(false);
    setClassDetails(null);
    setSelectedClassId(null);
  }

  // Loading state - aguardar currentUser estar disponível
  if (!currentUser && userRole === 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Carregando sua turma...</h1>
            <p className="text-slate-600">Preparando as informações da turma</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state - para alunos, mostrar loading até que todos os dados estejam prontos
  if (userRole === 'student' && !isStudentDataReady) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Carregando sua turma...</h1>
            <p className="text-slate-600">Preparando as informações da turma</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Loading state geral - aguardar currentUser estar disponível para professores
  if (userRoleLoading || classesLoading || (!currentUser && (userRole === 'professor' || userRole === 'assistant'))) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Carregando...</h1>
            <p className="text-slate-600">Preparando suas turmas</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (classesError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-xl shadow-lg border border-red-200 mx-auto mb-6 w-fit">
              <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">
              Erro ao carregar turmas
            </h1>
            <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-lg mx-auto mb-8">
              {classesError}
            </p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02] py-3 px-6 rounded-xl"
              >
                Tentar Novamente
              </button>
              <button
                onClick={() => window.location.href = '/convites'}
                className="w-full bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02] py-3 px-6 rounded-xl"
              >
                Ir para Convites
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // Renderizar baseado no estado atual
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      {/* Header da página */}
      {showDetails && classDetails ? (
        <PageHeader
          title={classDetails.cls.name}
          description={`Prof. ${classDetails.cls.professor?.name || 'Desconhecido'}`}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          iconColor="indigo"
        >
          {userRole !== 'student' && (
            <Button 
              variant="outline" 
              onClick={handleBackToList} 
              className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar às Turmas
            </Button>
          )}
        </PageHeader>
      ) : (
        <PageHeader
          title={userRole === 'student' ? 'Minha Turma' : 'Minhas Turmas'}
          description={userRole === 'student' 
            ? 'Informações da sua turma' 
            : 'Escolha uma turma para ver os detalhes'
          }
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          iconColor="indigo"
        >
          {userRole === 'professor' && (
            <Button 
              onClick={() => setCreateClassModal(true)}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02]"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>            
              Nova Turma
            </Button>
          )}
        </PageHeader>
      )}

      {/* Mensagens de feedback */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      {showDetails && classDetails ? (
        <ClassDetails
          classDetails={classDetails}
          userRole={userRole || 'student'}
          onBack={handleBackToList}
          loading={studentsLoading}
        />
      ) : (
        // Lista de turmas para professor e monitor
        <div className="space-y-6">
          {classes.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-12 text-center">
              <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 rounded-xl shadow-lg border border-slate-200 mx-auto mb-6 w-fit">
                <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M7 7h10m-10 4h10m-10 4h7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                {userRole === 'student' ? 'Nenhuma turma encontrada' : 'Nenhuma turma criada'}
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed max-w-lg mx-auto mb-8">
                {userRole === 'student' 
                  ? 'Você ainda não está matriculado em nenhuma turma.'
                  : 'Comece criando sua primeira turma para organizar seus alunos.'
                }
              </p>
              {userRole === 'professor' && (
                <Button 
                  onClick={() => setCreateClassModal(true)}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Criar Primeira Turma
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {classes.map((cls) => (
                <div key={cls.id} className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-[1.02]" 
                      onClick={() => handleViewClassDetails(cls)}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{cls.name}</h3>
                      <p className="text-slate-600">Prof. {cls.professor?.name || 'Desconhecido'}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 px-3 py-1 rounded-xl text-xs font-medium">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Ativa
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4 mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Alunos:</span>
                        <span className="font-semibold text-slate-900">{cls.student_count || 0}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Criada em:</span>
                        <span className="font-semibold text-slate-900">
                          {new Date(cls.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewClassDetails(cls);
                      }}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de criar turma */}
      <CreateClassModal
        isOpen={createClassModal}
        onClose={() => setCreateClassModal(false)}
        onCreateClass={handleCreateClass}
        loading={createLoading}
        error={error}
        success={success}
      />

    </div>
  );
}
