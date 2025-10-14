"use client";

import { useState, useEffect, useCallback } from "react";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useUserRoleContext } from "../../contexts/UserRoleContext";
import { submissionsApi, SubmissionFilters } from "../../services/submissions";
import { Submission } from "../../types";
import PageHeader from "../../components/PageHeader";
import PageLoading from "../../components/PageLoading";
import { getSubmissionStatusColor, getVerdictColor, normalizeStatus } from "../../utils/statusUtils";
import { SUBMISSION_STATUS_OPTIONS, MESSAGES } from "../../constants";

interface SubmissionsPageState {
  submissions: Submission[];
  filteredSubmissions: Submission[];
  loading: boolean;
  searchTerm: string;
  selectedStatus: string;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

export default function SubmissoesPage() {
  const { userRole } = useUserRoleContext();

  const [state, setState] = useState<SubmissionsPageState>({
    submissions: [],
    filteredSubmissions: [],
    loading: true,
    searchTerm: "",
    selectedStatus: "all",
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
  });

  const loadSubmissions = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const filters: SubmissionFilters = {
        limit: 100
      };
      
      const submissions = await submissionsApi.getSubmissions(filters);
      
      setState(prev => ({
        ...prev,
        submissions,
        filteredSubmissions: submissions,
        loading: false,
        totalPages: Math.ceil(submissions.length / prev.itemsPerPage)
      }));
    } catch (error) {
      console.error('Erro ao carregar submissões:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false,
        submissions: [],
        filteredSubmissions: []
      }));
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const applyFilters = useCallback(() => {
    let filtered = state.submissions;

    if (state.searchTerm.trim()) {
      const searchLower = state.searchTerm.toLowerCase();
      filtered = filtered.filter(submission => 
        submission.question.name.toLowerCase().includes(searchLower) ||
        submission.questionList.name.toLowerCase().includes(searchLower) ||
        submission.student.name.toLowerCase().includes(searchLower)
      );
    }

    if (state.selectedStatus !== "all") {
      filtered = filtered.filter(submission => 
        normalizeStatus(submission.status) === state.selectedStatus
      );
    }

    setState(prev => ({
      ...prev,
      filteredSubmissions: filtered,
      totalPages: Math.ceil(filtered.length / prev.itemsPerPage),
      currentPage: 1
    }));
  }, [state.submissions, state.searchTerm, state.selectedStatus]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const paginatedSubmissions = state.filteredSubmissions.slice(
    (state.currentPage - 1) * state.itemsPerPage,
    state.currentPage * state.itemsPerPage
  );

  const handleSearchChange = (value: string) => {
    setState(prev => ({ ...prev, searchTerm: value }));
  };

  const handleStatusChange = (status: string) => {
    setState(prev => ({ ...prev, selectedStatus: status }));
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  const refreshSubmissions = () => {
    loadSubmissions();
  };

  if (state.loading) {
    return <PageLoading message="Carregando submissões..." description="Buscando dados das submissões" />;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Minhas Submissões"
        description="Acompanhe suas submissões e resultados"
      />
      
      {/* Filtros */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por questão, lista ou estudante..."
              value={state.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={state.selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todos os Status</option>
              {SUBMISSION_STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <Button
              onClick={refreshSubmissions}
              variant="outline"
              className="px-4 py-2 text-sm"
            >
              Atualizar
            </Button>
          </div>
        </div>
      </Card>

      {/* Lista de Submissões */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Submissões ({state.filteredSubmissions.length})
            </h2>
          </div>

          {state.filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-600">Nenhuma submissão encontrada</p>
              <p className="text-gray-500">
                {state.searchTerm || state.selectedStatus !== "all" 
                  ? "Tente ajustar os filtros de busca" 
                  : "Você ainda não fez nenhuma submissão"
                }
              </p>
            </div>
          ) : (
            <>
              {/* Tabela de Submissões */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Questão</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Lista</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Pontuação</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Linguagem</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                      {userRole !== 'student' && (
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Estudante</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSubmissions.map((submission) => (
                      <tr key={submission.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {submission.question.name}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-600">
                            {submission.questionList.name}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubmissionStatusColor(submission.status)}`}>
                            {SUBMISSION_STATUS_OPTIONS.find(opt => opt.value === normalizeStatus(submission.status))?.label || submission.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            {submission.score}/100
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-600">
                            {submission.language}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-600 text-sm">
                            {new Date(submission.submittedAt).toLocaleString('pt-BR')}
                          </div>
                        </td>
                        {userRole !== 'student' && (
                          <td className="py-3 px-4">
                            <div className="text-gray-600">
                              {submission.student.name}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {state.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-600">
                    Página {state.currentPage} de {state.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(state.currentPage - 1)}
                      disabled={state.currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(state.currentPage + 1)}
                      disabled={state.currentPage === state.totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}