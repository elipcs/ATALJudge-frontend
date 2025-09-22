"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useUserRoleContext } from "../../contexts/UserRoleContext";
import submissoesData from "../../mocks/submissions.json";

// Dados dos mocks
const mockSubmissions = submissoesData;
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatsCard from "../../components/StatsCard";

interface Submissao {
  id: string;
  estudanteId: string;
  estudanteNome: string;
  estudanteEmail: string;
  listaId: string;
  listaTitulo: string;
  questaoId: string;
  questaoTitulo: string;
  turmaId: string;
  turmaNome: string;
  codigo: string;
  linguagem: string;
  status: 'pendente' | 'aceita' | 'erro_compilacao' | 'erro_runtime' | 'timeout' | 'rejeitada';
  pontuacao: number;
  tempoExecucao?: number;
  memoriaUsada?: number;
  submissaoEm: string;
  avaliadoEm?: string;
  feedback?: string;
}

interface Turma {
  id: string;
  nome: string;
  codigo: string;
}

interface Lista {
  id: string;
  titulo: string;
  turmaId: string;
}

export default function SubmissoesPage() {
  const { userRole } = useUserRoleContext();
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [listas, setListas] = useState<Lista[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados do popup
  const [selectedSubmissao, setSelectedSubmissao] = useState<Submissao | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  // Filtros
  const [filtroTurma, setFiltroTurma] = useState('');
  const [filtroLista, setFiltroLista] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'pendente' | 'aceita' | 'erro_compilacao' | 'erro_runtime' | 'timeout' | 'rejeitada'>('todas');
  const [filtroEstudante, setFiltroEstudante] = useState('');
  const [filtroLinguagem, setFiltroLinguagem] = useState('');
  const [filtroQuestao, setFiltroQuestao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    carregarDados();
    // Limpar filtro de estudante se for aluno (não é aplicável)
    if (userRole === 'aluno') {
      setFiltroEstudante('');
    }
  }, [userRole]); // Recarregar quando o tipo de usuário mudar

  // Fechar popup com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPopupOpen) {
        fecharPopup();
      }
    };

    if (isPopupOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevenir scroll da página
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isPopupOpen]);

  async function carregarDados() {
    try {
      setLoading(true);
      
      // Simular carregamento com dados mockados
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filtrar submissões baseado no tipo de usuário
      let submissoesFiltradas = mockSubmissions;
      
      if (userRole === 'aluno') {
        // Aluno só vê suas próprias submissões (simulando ID do usuário logado como "aluno_001")
        submissoesFiltradas = mockSubmissions.filter(s => s.estudanteId === "aluno_001");
      } else if (userRole === 'monitor') {
        // Monitor vê submissões das turmas que monitora (simulando só turma_001)
        submissoesFiltradas = mockSubmissions.filter(s => s.turmaId === "turma_001");
      }
      // Professor vê todas as submissões
      
      setSubmissoes(submissoesFiltradas as Submissao[]);
      
      // Mock de turmas
      const turmasData = [
        { id: "turma_001", nome: "Programação I - 2024.1", codigo: "PROG1" },
        { id: "turma_002", nome: "Programação II - 2024.1", codigo: "PROG2" }
      ];
      setTurmas(turmasData);
      
      // Mock de listas
      const listasData = [
        { id: "lista_001", titulo: "Lista 1 - Introdução", turmaId: "turma_001" },
        { id: "lista_002", titulo: "Lista 2 - Estruturas Condicionais", turmaId: "turma_001" },
        { id: "lista_003", titulo: "Lista 3 - Estruturas de Repetição", turmaId: "turma_002" }
      ];
      setListas(listasData);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  async function reavaliarSubmissao(id: string) {
    try {
      const response = await fetch(`/api/submissoes/${id}/reavaliar`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Erro ao reavaliar submissão');

      // Recarregar dados para atualizar o status
      carregarDados();
    } catch (error) {
      alert('Erro ao reavaliar submissão: ' + error);
    }
  }

  function abrirPopup(submissao: Submissao) {
    setSelectedSubmissao(submissao);
    setIsPopupOpen(true);
  }

  function fecharPopup() {
    setSelectedSubmissao(null);
    setIsPopupOpen(false);
  }

  async function exportarRelatorio() {
    try {
      const params = new URLSearchParams();
      if (filtroTurma) params.append('turmaId', filtroTurma);
      if (filtroLista) params.append('listaId', filtroLista);
      if (filtroStatus !== 'todas') params.append('status', filtroStatus);
      if (filtroEstudante) params.append('estudante', filtroEstudante);
      if (dataInicio) params.append('dataInicio', dataInicio);
      if (dataFim) params.append('dataFim', dataFim);

      const response = await fetch(`/api/submissoes/relatorio?${params}`);
      
      if (!response.ok) throw new Error('Erro ao gerar relatório');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-submissoes-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Erro ao exportar relatório: ' + error);
    }
  }

  // Filtrar submissões
  const submissoesFiltradas = submissoes.filter(submissao => {
    const matchTurma = !filtroTurma || submissao.turmaId === filtroTurma;
    const matchLista = !filtroLista || submissao.listaId === filtroLista;
    const matchStatus = filtroStatus === 'todas' || submissao.status === filtroStatus;
    const matchEstudante = !filtroEstudante || 
      submissao.estudanteNome.toLowerCase().includes(filtroEstudante.toLowerCase()) ||
      submissao.estudanteEmail.toLowerCase().includes(filtroEstudante.toLowerCase());
    const matchLinguagem = !filtroLinguagem || submissao.linguagem.toLowerCase() === filtroLinguagem.toLowerCase();
    const matchQuestao = !filtroQuestao || 
      submissao.questaoTitulo.toLowerCase().includes(filtroQuestao.toLowerCase()) ||
      submissao.questaoId === filtroQuestao;
    
    let matchData = true;
    if (dataInicio || dataFim) {
      const submissaoData = new Date(submissao.submissaoEm);
      if (dataInicio) matchData = matchData && submissaoData >= new Date(dataInicio);
      if (dataFim) matchData = matchData && submissaoData <= new Date(dataFim + 'T23:59:59');
    }
    
    return matchTurma && matchLista && matchStatus && matchEstudante && matchLinguagem && matchQuestao && matchData;
  });

  // Filtrar listas pela turma selecionada
  const listasFiltradas = listas.filter(lista => 
    !filtroTurma || lista.turmaId === filtroTurma
  );

  // Obter linguagens únicas das submissões
  const linguagensUnicas = Array.from(new Set(submissoes.map(s => s.linguagem))).sort();

  // Obter questões únicas das submissões
  const questoesUnicas = Array.from(new Set(submissoes.map(s => ({
    id: s.questaoId,
    titulo: s.questaoTitulo
  }))), (questao) => questao.id).map(id => 
    submissoes.find(s => s.questaoId === id)!
  ).sort((a, b) => a.questaoTitulo.localeCompare(b.questaoTitulo));

  function getStatusColor(status: string) {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'aceita': return 'bg-green-100 text-green-800';
      case 'erro_compilacao': return 'bg-red-100 text-red-800';
      case 'erro_runtime': return 'bg-red-100 text-red-800';
      case 'timeout': return 'bg-orange-100 text-orange-800';
      case 'rejeitada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'aceita': return 'Aceita';
      case 'erro_compilacao': return 'Erro de Compilação';
      case 'erro_runtime': return 'Erro de Runtime';
      case 'timeout': return 'Timeout';
      case 'rejeitada': return 'Rejeitada';
      default: return status;
    }
  }

  if (loading) {
    return <LoadingSpinner message="Carregando submissões..." />;
  }

  return (
    <div className="p-6">
      <PageHeader
        title={userRole === 'aluno' ? 'Minhas Submissões' : 'Submissões'}
        description={userRole === 'aluno' 
          ? 'Acompanhe suas submissões e resultados.'
          : 'Acompanhe e gerencie as submissões dos estudantes.'
        }
      >
        {(userRole === 'professor' || userRole === 'monitor') && (
          <Button onClick={exportarRelatorio}>Exportar Relatório</Button>
        )}
      </PageHeader>



      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <StatsCard
          title="Total"
          value={submissoesFiltradas.length.toString()}
        />
        <StatsCard
          title="Aceitas"
          value={submissoesFiltradas.filter(s => s.status === 'aceita').length.toString()}
          className="text-green-600"
        />
        <StatsCard
          title="Pendentes"
          value={submissoesFiltradas.filter(s => s.status === 'pendente').length.toString()}
          className="text-yellow-600"
        />
        <StatsCard
          title="Com Erro"
          value={submissoesFiltradas.filter(s => ['erro_compilacao', 'erro_runtime', 'rejeitada'].includes(s.status)).length.toString()}
          className="text-red-600"
        />
        <StatsCard
          title="Taxa de Sucesso"
          value={`${Math.round((submissoesFiltradas.filter(s => s.status === 'aceita').length / Math.max(submissoesFiltradas.length, 1)) * 100)}%`}
          className="text-indigo-600"
        />
      </div>

      {/* Tabela de Submissões */}
      <Card>
        {submissoesFiltradas.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma submissão encontrada</h3>
            <p className="text-gray-600">
              {submissoes.length === 0 
                ? 'Ainda não há submissões para suas listas.'
                : 'Tente ajustar os filtros para encontrar o que procura.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {/* Linha de cabeçalhos */}
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-4 font-medium text-gray-900">Estudante</th>
                  {(userRole === 'professor' || userRole === 'monitor') && (
                    <th className="text-left p-4 font-medium text-gray-900">Turma</th>
                  )}
                  <th className="text-left p-4 font-medium text-gray-900">Lista</th>
                  <th className="text-left p-4 font-medium text-gray-900">Questão</th>
                  <th className="text-left p-4 font-medium text-gray-900">Status</th>
                  <th className="text-left p-4 font-medium text-gray-900">Data Submissão</th>
                  <th className="text-left p-4 font-medium text-gray-900">Linguagem</th>
                  <th className="text-left p-4 font-medium text-gray-900">Pontuação</th>
                  <th className="text-left p-4 font-medium text-gray-900">Ações</th>
                </tr>
                {/* Linha de filtros */}
                <tr className="border-b border-gray-200 bg-gray-25">
                  <td className="p-2">
                    {(userRole === 'professor' || userRole === 'monitor') && (
                      <Input
                        placeholder="Filtrar por nome ou email..."
                        value={filtroEstudante}
                        onChange={(e) => setFiltroEstudante(e.target.value)}
                        className="h-8 text-sm"
                      />
                    )}
                  </td>
                  {(userRole === 'professor' || userRole === 'monitor') && (
                    <td className="p-2">
                      <select
                        value={filtroTurma}
                        onChange={(e) => {
                          setFiltroTurma(e.target.value);
                          setFiltroLista(''); // Resetar lista quando mudar turma
                        }}
                        className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Todas</option>
                        {turmas.map(turma => (
                          <option key={turma.id} value={turma.id}>{turma.nome}</option>
                        ))}
                      </select>
                    </td>
                  )}
                  <td className="p-2">
                    <select
                      value={filtroLista}
                      onChange={(e) => setFiltroLista(e.target.value)}
                      className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todas</option>
                      {listasFiltradas.map(lista => (
                        <option key={lista.id} value={lista.id}>{lista.titulo}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <select
                      value={filtroQuestao}
                      onChange={(e) => setFiltroQuestao(e.target.value)}
                      className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todas</option>
                      {questoesUnicas.map(questao => (
                        <option key={questao.questaoId} value={questao.questaoId}>{questao.questaoTitulo}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <select
                      value={filtroStatus}
                      onChange={(e) => setFiltroStatus(e.target.value as typeof filtroStatus)}
                      className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="todas">Todos</option>
                      <option value="pendente">Pendente</option>
                      <option value="aceita">Aceita</option>
                      <option value="erro_compilacao">Erro de Compilação</option>
                      <option value="erro_runtime">Erro de Runtime</option>
                      <option value="timeout">Timeout</option>
                      <option value="rejeitada">Rejeitada</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <Input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        className="h-8 text-xs"
                        title="Data início"
                      />
                      <Input
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        className="h-8 text-xs"
                        title="Data fim"
                      />
                    </div>
                  </td>
                  <td className="p-2">
                    <select
                      value={filtroLinguagem}
                      onChange={(e) => setFiltroLinguagem(e.target.value)}
                      className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todas</option>
                      {linguagensUnicas.map(linguagem => (
                        <option key={linguagem} value={linguagem}>{linguagem}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    {/* Pontuação - sem filtro específico */}
                  </td>
                  <td className="p-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFiltroTurma('');
                        setFiltroLista('');
                        setFiltroStatus('todas');
                        setFiltroLinguagem('');
                        setFiltroQuestao('');
                        if (userRole === 'professor' || userRole === 'monitor') {
                          setFiltroEstudante('');
                        }
                        setDataInicio('');
                        setDataFim('');
                      }}
                      className="h-8 px-2 text-xs"
                    >
                      Limpar
                    </Button>
                  </td>
                </tr>
              </thead>
              <tbody>
                {submissoesFiltradas.map(submissao => (
                  <tr 
                    key={submissao.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    onClick={() => abrirPopup(submissao)}
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-gray-900">{submissao.estudanteNome}</div>
                        <div className="text-sm text-gray-500">{submissao.estudanteEmail}</div>
                      </div>
                    </td>
                    {(userRole === 'professor' || userRole === 'monitor') && (
                      <td className="p-4">
                        <div className="text-sm text-gray-900">{submissao.turmaNome}</div>
                      </td>
                    )}
                    <td className="p-4">
                      <div className="text-sm text-gray-900">{submissao.listaTitulo}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">{submissao.questaoTitulo}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submissao.status)}`}>
                        {getStatusLabel(submissao.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">
                        {new Date(submissao.submissaoEm).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(submissao.submissaoEm).toLocaleTimeString('pt-BR')}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {submissao.linguagem}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">
                        {submissao.pontuacao} pts
                      </div>
                      {(submissao.tempoExecucao || submissao.memoriaUsada) && (
                        <div className="text-xs text-gray-500">
                          {submissao.tempoExecucao && <span>{submissao.tempoExecucao}ms</span>}
                          {submissao.memoriaUsada && (
                            <span className={submissao.tempoExecucao ? " | " : ""}>
                              {submissao.memoriaUsada}KB
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirPopup(submissao);
                          }}
                          className="text-xs"
                        >
                          Ver
                        </Button>
                        {(userRole === 'professor' || userRole === 'monitor') && submissao.status !== 'pendente' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              reavaliarSubmissao(submissao.id);
                            }}
                            className="text-xs"
                          >
                            Reavaliar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Popup de Detalhes da Submissão */}
      {isPopupOpen && selectedSubmissao && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={fecharPopup} // Fechar ao clicar no backdrop
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Prevenir fechar ao clicar no conteúdo
          >
            {/* Header do Popup */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Detalhes da Submissão
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedSubmissao.estudanteNome} - {selectedSubmissao.questaoTitulo}
                </p>
              </div>
              <button
                onClick={fecharPopup}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo do Popup */}
            <div className="p-6">
              {/* Informações da Submissão */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Informações Gerais</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estudante:</span>
                      <span className="font-medium">{selectedSubmissao.estudanteNome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedSubmissao.estudanteEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Turma:</span>
                      <span className="font-medium">{selectedSubmissao.turmaNome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lista:</span>
                      <span className="font-medium">{selectedSubmissao.listaTitulo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Questão:</span>
                      <span className="font-medium">{selectedSubmissao.questaoTitulo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Linguagem:</span>
                      <span className="font-medium">{selectedSubmissao.linguagem}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Resultado</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSubmissao.status)}`}>
                        {getStatusLabel(selectedSubmissao.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pontuação:</span>
                      <span className="font-medium">{selectedSubmissao.pontuacao} pts</span>
                    </div>
                    {selectedSubmissao.tempoExecucao && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tempo de Execução:</span>
                        <span className="font-medium">{selectedSubmissao.tempoExecucao}ms</span>
                      </div>
                    )}
                    {selectedSubmissao.memoriaUsada && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Memória Usada:</span>
                        <span className="font-medium">{selectedSubmissao.memoriaUsada}KB</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submetido em:</span>
                      <span className="font-medium">
                        {new Date(selectedSubmissao.submissaoEm).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {selectedSubmissao.avaliadoEm && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avaliado em:</span>
                        <span className="font-medium">
                          {new Date(selectedSubmissao.avaliadoEm).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Feedback */}
              {selectedSubmissao.feedback && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Feedback</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedSubmissao.feedback}</p>
                  </div>
                </div>
              )}

              {/* Código */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Código Submetido</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {selectedSubmissao.codigo}
                  </pre>
                </div>
              </div>
            </div>

            {/* Footer do Popup */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              {(userRole === 'professor' || userRole === 'monitor') && selectedSubmissao.status !== 'pendente' && (
                <Button 
                  onClick={() => {
                    reavaliarSubmissao(selectedSubmissao.id);
                    fecharPopup();
                  }}
                  variant="outline"
                >
                  Reavaliar Submissão
                </Button>
              )}
              <Button onClick={fecharPopup}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
