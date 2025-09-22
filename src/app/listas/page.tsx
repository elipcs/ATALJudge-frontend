"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import listasData from "@/mocks/question_lists.json";
import classesData from "@/mocks/classes.json";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import StatsCard from "@/components/StatsCard";
import FilterBar from "@/components/FilterBar";
import { useUserRoleContext } from "@/contexts/UserRoleContext";

export interface ListMock {
  id: string;
  title: string;
  description: string;
  questions: Array<{
    id: string;
    title: string;
    statement: string;
    input: string;
    output: string;
    examples: Array<{
      input: string;
      output: string;
    }>;
    tags: string[];
    timeLimit: string;
    memoryLimit: string;
    editorial: string;
    letter: string;
    origin: string;
    code: string;
    stats: { solved: number; total: number };
    status: string;
    difficulty: "fácil" | "média" | "difícil";
    description?: string;
    note?: string;
    lastScore?: number;
  }>;
  startDate: string;
  endDate: string;
}

// Dados dos mocks - usando dados diretos sem type assertion incorreto
const mockListsData = listasData;
const mockTurmas = classesData;

interface Lista {
  id: string;
  titulo: string;
  descricao?: string;
  dataInicio: string;
  dataFim: string;
  turmaId: string;
  nomeTurma: string;
  questoes: number;
  submissoes: number;
  status: 'rascunho' | 'publicada' | 'encerrada';
  criadaEm: string;
  atualizadaEm: string;
}

interface Turma {
  id: string;
  nome: string;
  ativa: boolean;
}

// Função para converter mocks para formato esperado
const getListasFromMocks = (): Lista[] => {
  return mockListsData.map((list: any, index: number) => {
    const turma = mockTurmas[index % mockTurmas.length];
    return {
      id: list.id,
      titulo: list.title,
      descricao: list.description,
      dataInicio: list.startDate,
      dataFim: list.endDate,
      turmaId: turma._id?.$oid,
      nomeTurma: turma.name,
      questoes: list.questions.length,
      submissoes: Math.floor(Math.random() * 200),
      status: index % 3 === 0 ? 'encerrada' : index % 3 === 1 ? 'publicada' : 'rascunho',
      criadaEm: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      atualizadaEm: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  });
};

export default function ListasPage() {
  const { userRole } = useUserRoleContext();
  const [listas, setListas] = useState<Lista[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTurma, setFiltroTurma] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'rascunho' | 'publicada' | 'encerrada'>('todas');
  const [busca, setBusca] = useState('');

  // Estados do popup Nova Lista
  const [isNovaListaPopupOpen, setIsNovaListaPopupOpen] = useState(false);
  const [novaListaForm, setNovaListaForm] = useState({
    titulo: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    turmaIds: [] as string[]
  });

  useEffect(() => {
    carregarDados();
  }, [userRole]); // Recarregar quando userRole mudar

  // Fechar popup com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isNovaListaPopupOpen) {
        fecharNovaListaPopup();
      }
    };

    if (isNovaListaPopupOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevenir scroll da página
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isNovaListaPopupOpen]);

  async function carregarDados() {
    try {
      setLoading(true);
      
      // Simular carregamento da API com delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Obter listas dos mocks
      const listasConvertidas = getListasFromMocks();
      
      // Filtrar listas baseado no tipo de usuário
      let listasFiltradas = listasConvertidas;
      
      if (userRole === 'aluno') {
        // Aluno vê apenas listas publicadas de sua turma
        // Para demo, assumimos que o aluno está na turma '1'
        const alunoTurmaId = '1'; // Em um sistema real, isso viria do contexto do usuário
        listasFiltradas = listasConvertidas.filter((lista: Lista) => 
          lista.turmaId === alunoTurmaId && lista.status === 'publicada'
        );
      }
      // Professor e Monitor vêem todas as listas
      
      setListas(listasFiltradas);
      setTurmas(mockTurmas.map(t => ({
        id: t._id?.$oid,
        nome: t.name,
        codigo: 'SEM-CODIGO',
        ativa: true
      })));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  async function duplicarLista(id: string) {
    // Verificar se o usuário tem permissão para duplicar listas
    if (userRole === 'aluno') {
      alert('Apenas professores e monitores podem duplicar listas.');
      return;
    }
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const listaOriginal = listas.find(l => l.id === id);
      if (!listaOriginal) throw new Error('Lista não encontrada');

      const novaLista: Lista = {
        ...listaOriginal,
        id: (Date.now()).toString(),
        titulo: `${listaOriginal.titulo} (Cópia)`,
        status: 'rascunho',
        submissoes: 0,
        criadaEm: new Date().toISOString(),
        atualizadaEm: new Date().toISOString(),
        dataInicio: new Date().toISOString(),
        dataFim: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 semanas a partir de hoje
      };

      setListas(prev => [novaLista, ...prev]);
    } catch (error) {
      alert('Erro ao duplicar lista: ' + error);
    }
  }

  async function excluirLista(id: string) {
    // Verificar se o usuário tem permissão para excluir listas
    if (userRole === 'aluno') {
      alert('Apenas professores e monitores podem excluir listas.');
      return;
    }
    
    if (!confirm('Tem certeza que deseja excluir esta lista? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setListas(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      alert('Erro ao excluir lista: ' + error);
    }
  }

  function abrirNovaListaPopup() {
    // Verificar se o usuário tem permissão para criar listas
    if (userRole === 'aluno') {
      alert('Apenas professores e monitores podem criar listas.');
      return;
    }
    
    setIsNovaListaPopupOpen(true);
    // Resetar formulário
    setNovaListaForm({
      titulo: '',
      descricao: '',
      dataInicio: '',
      dataFim: '',
      turmaIds: turmas.map(t => t.id)
    });
  }

  function fecharNovaListaPopup() {
    setIsNovaListaPopupOpen(false);
    setNovaListaForm({
      titulo: '',
      descricao: '',
      dataInicio: '',
      dataFim: '',
      turmaIds: []
    });
  }

  async function criarNovaLista() {
    // Verificar se o usuário tem permissão para criar listas
    if (userRole === 'aluno') {
      alert('Apenas professores e monitores podem criar listas.');
      return;
    }
    
    // Validações
    if (!novaListaForm.titulo.trim()) {
      alert('Título é obrigatório');
      return;
    }
    if (!novaListaForm.turmaIds || novaListaForm.turmaIds.length === 0) {
      alert('Selecione ao menos uma turma');
      return;
    }
    if (!novaListaForm.dataInicio) {
      alert('Data de início é obrigatória');
      return;
    }
    if (!novaListaForm.dataFim) {
      alert('Data de fim é obrigatória');
      return;
    }
    if (new Date(novaListaForm.dataInicio) >= new Date(novaListaForm.dataFim)) {
      alert('Data de fim deve ser posterior à data de início');
      return;
    }

    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 300));

      const novasListas: Lista[] = novaListaForm.turmaIds.map(turmaId => {
        const turmaEscolhida = turmas.find(t => t.id === turmaId);
        return {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 8),
          titulo: novaListaForm.titulo.trim(),
          descricao: novaListaForm.descricao.trim() || undefined,
          dataInicio: novaListaForm.dataInicio,
          dataFim: novaListaForm.dataFim,
          turmaId,
          nomeTurma: turmaEscolhida?.nome || '',
          questoes: 0,
          submissoes: 0,
          status: 'rascunho',
          criadaEm: new Date().toISOString(),
          atualizadaEm: new Date().toISOString()
        };
      });

      setListas(prev => [...novasListas, ...prev]);
      fecharNovaListaPopup();
      alert('Lista(s) criada(s) com sucesso!');
    } catch (error) {
      alert('Erro ao criar lista: ' + error);
    }
  }

  // Filtrar listas baseado no tipo de usuário
  const listasDisponiveis = userRole === 'aluno' 
    ? listas.filter(lista => lista.status === 'publicada' || lista.status === 'encerrada')
    : listas;

  const listasFiltradas = listasDisponiveis
    .filter(lista => {
      const matchBusca = lista.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                        lista.descricao?.toLowerCase().includes(busca.toLowerCase());
      // Para alunos, não filtrar por turma; para professores/monitores, aplicar filtro de turma
      const matchTurma = userRole === 'aluno' || !filtroTurma || lista.turmaId === filtroTurma;
      const matchStatus = filtroStatus === 'todas' || lista.status === filtroStatus;
      
      return matchBusca && matchTurma && matchStatus;
    })
    .sort((a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime()); // Ordenar por data de criação (mais recente primeiro)

  function getStatusColor(status: string) {
    switch (status) {
      case 'rascunho': return 'bg-gray-100 text-gray-800';
      case 'publicada': return 'bg-green-100 text-green-800';
      case 'encerrada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'rascunho': return 'Rascunho';
      case 'publicada': return 'Publicada';
      case 'encerrada': return 'Encerrada';
      default: return status;
    }
  }

  if (loading) {
    return <LoadingSpinner message="Carregando listas..." />;
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Listas de Questões"
        description={userRole === 'aluno' 
          ? 'Acesse as listas de questões disponíveis e submeta suas soluções.'
          : 'Gerencie as listas de questões.'
        }
      >
        {/* Botão Nova Lista - para professor e monitor */}
        {(userRole === 'professor' || userRole === 'monitor') && (
          <Button onClick={abrirNovaListaPopup}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Lista
          </Button>
        )}
      </PageHeader>

      {/* Estatísticas - apenas para professores e monitores */}
      {userRole !== 'aluno' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total de Listas"
            value={listas.length}
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
              </svg>
            }
          />
          
          <StatsCard
            title="Listas Ativas"
            value={listas.filter(l => l.status === 'publicada').length}
            icon={
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            }
          />
          
          <StatsCard
            title="Total de Questões"
            value={listas.reduce((acc, l) => acc + l.questoes, 0)}
            icon={
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
              </svg>
            }
          />
          
          <StatsCard
            title="Total de Submissões"
            value={listas.reduce((acc, l) => acc + l.submissoes, 0)}
            icon={
              <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            }
          />
        </div>
      )}

      {/* Filtros */}
      <FilterBar
        filters={[
          {
            label: "Buscar",
            value: busca,
            type: "text",
            placeholder: "Título ou descrição...",
            onChange: setBusca
          },
          ...(userRole === 'professor' || userRole === 'monitor' ? [{
            label: "Turma",
            value: filtroTurma,
            type: "select" as const,
            options: [
              { value: "", label: "Todas as turmas" },
              ...turmas.map(turma => ({
                value: turma.id,
                label: `${turma.nome} (${turma.codigo})`
              }))
            ],
            onChange: setFiltroTurma
          }] : []),
          {
            label: "Status",
            value: filtroStatus,
            type: "select" as const,
            options: [
              { value: "todas", label: "Todos os status" },
              ...(userRole === 'professor' || userRole === 'monitor' ? [
                { value: "rascunho", label: "Rascunho" }
              ] : []),
              { 
                value: "publicada", 
                label: userRole === 'aluno' ? 'Disponível' : 'Publicada' 
              },
              { value: "encerrada", label: "Encerrada" }
            ],
            onChange: (value) => setFiltroStatus(value as typeof filtroStatus)
          }
        ]}
        onClear={() => {
          setBusca('');
          if (userRole === 'professor' || userRole === 'monitor') {
            setFiltroTurma('');
          }
          setFiltroStatus('todas');
        }}
      />

      {/* Lista de Listas */}
      <div>
        {listasFiltradas.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma lista encontrada</h3>
            <p className="text-gray-600 mb-4">
              {listas.length === 0 
                ? (userRole === 'aluno' 
                    ? 'Não há listas disponíveis no momento.' 
                    : 'Comece criando sua primeira lista de exercícios.')
                : 'Tente ajustar os filtros para encontrar o que procura.'
              }
            </p>
            {listas.length === 0 && (userRole === 'professor' || userRole === 'monitor') && (
              <Button onClick={abrirNovaListaPopup}>Criar Primeira Lista</Button>
            )}
          </Card>
        ) : (
          listasFiltradas.map(lista => (
            <Card key={lista.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{lista.titulo}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lista.status)}`}>
                      {getStatusLabel(lista.status)}
                    </span>
                  </div>

                  {lista.descricao && (
                    <p className="text-gray-600 mb-3">{lista.descricao}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <span>
                      <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                      </svg>
                      {lista.nomeTurma}
                    </span>
                    <span>
                      <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                      </svg>
                      {lista.questoes} questões
                    </span>
                    <span>
                      <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                      </svg>
                      {lista.submissoes} submissões
                    </span>
                    <span>
                      <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                      </svg>
                      {new Date(lista.dataInicio).toLocaleDateString('pt-BR')} - {new Date(lista.dataFim).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="text-xs text-gray-400">
                    Criada em {new Date(lista.criadaEm).toLocaleString('pt-BR')} | 
                    Atualizada em {new Date(lista.atualizadaEm).toLocaleString('pt-BR')}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link href={`/listas/${lista.id}`}>
                    <Button size="sm" variant="outline">
                      {userRole === 'aluno' ? 'Acessar' : 'Ver'}
                    </Button>
                  </Link>
                  
                  {/* Ações administrativas - para professor e monitor */}
                  {(userRole === 'professor' || userRole === 'monitor') && (
                    <>
                      <Link href={`/listas/${lista.id}/editar`}>
                        <Button size="sm" variant="outline">Editar</Button>
                      </Link>

                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => duplicarLista(lista.id)}
                      >
                        Duplicar
                      </Button>

                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => excluirLista(lista.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Excluir
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Popup Nova Lista */}
      {isNovaListaPopupOpen && (
        <div 
          className="fixed inset-0 bg-black/5 flex items-center justify-center z-50 p-4"
          onClick={fecharNovaListaPopup} // Fechar ao clicar no backdrop
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Prevenir fechar ao clicar no conteúdo
          >
            {/* Header do Popup */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Nova Lista de Exercícios
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Crie uma nova lista de exercícios para suas turmas
                </p>
              </div>
              <button
                onClick={fecharNovaListaPopup}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Formulário */}
            <div className="p-6">
              <form className="space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <Input
                    type="text"
                    value={novaListaForm.titulo}
                    onChange={(e) => setNovaListaForm(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Ex: Lista 1 - Introdução à Programação"
                    className="w-full"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={novaListaForm.descricao}
                    onChange={(e) => setNovaListaForm(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição opcional da lista de exercícios..."
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  />
                </div>

                {/* Turmas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Turmas *
                  </label>
                  <select
                    multiple
                    value={novaListaForm.turmaIds}
                    onChange={e => {
                      const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                      setNovaListaForm(prev => ({ ...prev, turmaIds: options }));
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32"
                  >
                    {turmas.map(turma => (
                      <option key={turma.id} value={turma.id}>
                        {turma.nome} ({turma.codigo})
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-500 mt-1 block">Segure Ctrl (Windows) ou Command (Mac) para selecionar múltiplas turmas.</span>
                </div>

                {/* Datas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início *
                    </label>
                    <Input
                      type="datetime-local"
                      value={novaListaForm.dataInicio}
                      onChange={(e) => setNovaListaForm(prev => ({ ...prev, dataInicio: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Fim *
                    </label>
                    <Input
                      type="datetime-local"
                      value={novaListaForm.dataFim}
                      onChange={(e) => setNovaListaForm(prev => ({ ...prev, dataFim: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Nota sobre questões */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Próximo passo</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Após criar a lista, você poderá adicionar questões navegando para a página de detalhes da lista.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer do Popup */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button 
                onClick={fecharNovaListaPopup}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button 
                onClick={criarNovaLista}
                disabled={!novaListaForm.titulo.trim() || !novaListaForm.turmaIds.length || !novaListaForm.dataInicio || !novaListaForm.dataFim}
              >
                Criar Lista
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
