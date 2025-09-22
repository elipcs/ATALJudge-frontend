"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import listasData from "@/mocks/question_lists.json";
import submissoesData from "@/mocks/submissions.json";

export interface QuestionMock {
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
}

// Dados dos mocks
const mockLists = listasData;
const mockSubmissions = submissoesData;

interface Questao {
  id: string;
  titulo: string;
  dificuldade: 'facil' | 'medio' | 'dificil';
  pontos: number;
  descricao: string;
  categoria: string;
  tempoLimite: number; // em minutos
  grupo?: string; // Para agrupar questões em arranjos (A, B, C, D, etc.)
}

interface ArranjoQuestoes {
  id: string;
  nome: string;
  descricao: string;
  grupos: {
    [key: string]: {
      nome: string;
      questoes: string[]; // IDs das questões
      minimo: number; // Mínimo de questões a serem resolvidas do grupo
      maximo: number; // Máximo de questões a serem resolvidas do grupo
    };
  };
  pontosParaAprovacao: number;
  formula: string; // Ex: "(A ou B) e (C ou D)"
}

interface Lista {
  id: string;
  titulo: string;
  descricao: string;
  status: 'rascunho' | 'publicada' | 'encerrada';
  turmaId: string;
  turma: string;
  dataInicio: string;
  dataFim: string;
  questoes: Questao[];
  totalPontos: number;
  professor: string;
  criadaEm: string;
  atualizadaEm: string;
  arranjos?: ArranjoQuestoes; // Sistema de arranjos de questões
  tentativasIlimitadas: boolean; // Permite tentativas ilimitadas
}

interface Submissao {
  id: string;
  questaoId: string;
  status: 'pendente' | 'aceita' | 'erro' | 'tempo_excedido';
  pontuacao: number;
  tentativa: number;
  submittedAt: string;
}

// Mock data
const getListaFromMocks = (listaId: string): Lista | null => {
  const mockList = mockLists.find(list => list.id === listaId);
  if (!mockList) return null;
  
  return {
    id: mockList.id,
    titulo: mockList.titulo,
    descricao: mockList.descricao,
    status: "publicada",
    turmaId: "turma1",
    turma: "Algoritmos e Programação I",
    dataInicio: mockList.dataLiberacao,
    dataFim: mockList.dataLimite,
    professor: "Prof. Ana Silva",
    criadaEm: "2024-03-10T10:00:00Z",
    atualizadaEm: "2024-03-12T14:30:00Z",
    totalPontos: 100,
    tentativasIlimitadas: true,
    arranjos: {
      id: "arr1",
      nome: "Arranjo Principal",
      descricao: "Para obter nota máxima (100 pontos), resolva pelo menos uma questão do Grupo A ou B + uma questão do Grupo C ou D",
      pontosParaAprovacao: 100,
      formula: "(A ou B) e (C ou D)",
      grupos: {
        A: {
          nome: "Estruturas Básicas",
          questoes: ["q1", "q2"],
          minimo: 1,
          maximo: 2
        },
        B: {
          nome: "Algoritmos Simples", 
          questoes: ["q3"],
          minimo: 1,
          maximo: 1
        },
        C: {
          nome: "Estruturas Avançadas",
          questoes: ["q4"],
          minimo: 1,
          maximo: 1
        },
        D: {
          nome: "Algoritmos Complexos",
          questoes: ["q5", "q6"],
          minimo: 1,
          maximo: 2
        }
      }
    },
    questoes: mockList.questoes.map((q, index) => ({
      id: q.id,
      titulo: q.titulo,
      dificuldade: q.dificuldade === "fácil" ? "facil" : q.dificuldade === "média" ? "medio" : "dificil",
      pontos: q.pontos,
      descricao: q.descricao,
      categoria: getCategoriaPorIndex(index),
      tempoLimite: 30 + (index * 15), // Tempo limite incremental
      grupo: getGrupoPorIndex(index)
    }))
  };
};

const getCategoriaPorIndex = (index: number): string => {
  const categorias = ["Arrays", "Busca", "Ordenação", "Listas Ligadas", "Árvores", "Grafos"];
  return categorias[index % categorias.length];
};

const getGrupoPorIndex = (index: number): string => {
  const grupos = ["A", "A", "B", "C", "D", "D"];
  return grupos[index % grupos.length];
};

const getSubmissoesFromMocks = (listaId: string): Submissao[] => {
  return mockSubmissions
    .filter(sub => ["q1", "q2", "q3", "q4", "q5", "q6"].includes(sub.questaoId))
    .map(sub => ({
      id: sub.id,
      questaoId: sub.questaoId,
      status: sub.status === 'aceita' ? 'aceita' : 
             sub.status === 'pendente' ? 'pendente' :
             sub.status === 'timeout' ? 'tempo_excedido' : 'erro',
      pontuacao: sub.pontuacao,
      tentativa: 1,
      submittedAt: sub.submissaoEm
    }));
};

export default function ListaIdPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [lista, setLista] = useState<Lista | null>(null);
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'aluno' | 'professor' | 'monitor'>('aluno');

  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => {
      if (id === "1") {
        setLista(getListaFromMocks(id));
        setSubmissoes(getSubmissoesFromMocks(id));
      }
      setLoading(false);
    }, 500);

    // Recuperar tipo de usuário
    const savedUserRole = localStorage.getItem('userRole') as 'aluno' | 'professor' | 'monitor';
    if (savedUserRole) {
      setUserRole(savedUserRole);
    }

    return () => clearTimeout(timer);
  }, [id]);

  const getDificuldadeColor = (dificuldade: string) => {
    switch (dificuldade) {
      case 'facil': return 'text-green-600 bg-green-100';
      case 'medio': return 'text-yellow-600 bg-yellow-100';
      case 'dificil': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aceita': return 'text-green-600 bg-green-100';
      case 'erro': return 'text-red-600 bg-red-100';
      case 'pendente': return 'text-yellow-600 bg-yellow-100';
      case 'tempo_excedido': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getQuestaoSubmissao = (questaoId: string) => {
    return submissoes
      .filter(s => s.questaoId === questaoId)
      .sort((a, b) => b.tentativa - a.tentativa)[0];
  };

  const calcularPontuacaoTotal = () => {
    const questoesComSubmissao = lista?.questoes.filter(q => 
      submissoes.some(s => s.questaoId === q.id && s.status === 'aceita')
    ) || [];
    
    return questoesComSubmissao.reduce((total, questao) => {
      const submissao = getQuestaoSubmissao(questao.id);
      return total + (submissao?.pontuacao || 0);
    }, 0);
  };

  const verificarArranjos = () => {
    if (!lista?.arranjos) return { cumprido: false, grupos: {}, pontuacao: 0 };

    const grupos = lista.arranjos.grupos;
    const resultadoGrupos: { [key: string]: { questoesResolvidas: string[], pontos: number, cumprido: boolean } } = {};

    // Verificar cada grupo
    Object.keys(grupos).forEach(grupoId => {
      const grupo = grupos[grupoId];
      const questoesResolvidasDoGrupo = grupo.questoes.filter(questaoId => {
        const submissao = getQuestaoSubmissao(questaoId);
        return submissao && submissao.status === 'aceita';
      });

      const pontos = questoesResolvidasDoGrupo.reduce((total, questaoId) => {
        const submissao = getQuestaoSubmissao(questaoId);
        return total + (submissao?.pontuacao || 0);
      }, 0);

      resultadoGrupos[grupoId] = {
        questoesResolvidas: questoesResolvidasDoGrupo,
        pontos,
        cumprido: questoesResolvidasDoGrupo.length >= grupo.minimo
      };
    });

    // Verificar se a fórmula do arranjo foi cumprida
    // Para este exemplo: (A ou B) e (C ou D)
    const grupoAOuB = resultadoGrupos['A']?.cumprido || resultadoGrupos['B']?.cumprido;
    const grupoCOuD = resultadoGrupos['C']?.cumprido || resultadoGrupos['D']?.cumprido;
    const arranjoCumprido = grupoAOuB && grupoCOuD;

    const pontuacaoTotal = Object.values(resultadoGrupos).reduce((total, grupo) => total + grupo.pontos, 0);

    return {
      cumprido: arranjoCumprido,
      grupos: resultadoGrupos,
      pontuacao: pontuacaoTotal,
      podeObter100: arranjoCumprido && pontuacaoTotal >= lista.arranjos.pontosParaAprovacao
    };
  };

  const getGrupoColor = (grupo: string) => {
    const cores = {
      'A': 'text-blue-600 bg-blue-100',
      'B': 'text-green-600 bg-green-100', 
      'C': 'text-purple-600 bg-purple-100',
      'D': 'text-orange-600 bg-orange-100'
    };
    return cores[grupo as keyof typeof cores] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!lista) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lista não encontrada</h1>
          <p className="text-gray-600 mb-4">A lista solicitada não existe ou não está disponível.</p>
          <Link href="/listas">
            <Button>Voltar para Listas</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/listas">
            <Button variant="outline" size="sm">
              ← Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lista.titulo}</h1>
            <p className="text-gray-600">{lista.turma}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            lista.status === 'publicada' ? 'text-green-600 bg-green-100' :
            lista.status === 'encerrada' ? 'text-gray-600 bg-gray-100' :
            'text-yellow-600 bg-yellow-100'
          }`}>
            {lista.status === 'publicada' ? 'Ativa' : 
             lista.status === 'encerrada' ? 'Encerrada' : 'Rascunho'}
          </span>
          {userRole === 'aluno' && (
            <span className="text-sm text-gray-600">
              {calcularPontuacaoTotal()}/{lista.totalPontos} pontos
            </span>
          )}
        </div>
      </div>

      {/* Informações da Lista */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Início</span>
            <p className="text-gray-900">{formatDate(lista.dataInicio)}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Prazo Final</span>
            <p className="text-gray-900">{formatDate(lista.dataFim)}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Questões</span>
            <p className="text-gray-900">{lista.questoes.length}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Tentativas</span>
            <p className="text-gray-900">{lista.tentativasIlimitadas ? 'Ilimitadas' : 'Limitadas'}</p>
          </div>
        </div>

        {/* Sistema de Arranjos */}
        {lista.arranjos && (
          <div className="border-t pt-4 mt-4">
            <span className="text-sm font-medium text-gray-500">Sistema de Arranjos</span>
            <div className="mt-2">
              <p className="text-gray-900 font-medium">{lista.arranjos.nome}</p>
              <p className="text-gray-600 text-sm mt-1">{lista.arranjos.descricao}</p>
              <div className="mt-2 text-sm">
                <span className="font-medium">Fórmula:</span> {lista.arranjos.formula}
              </div>
              
              {userRole === 'aluno' && (() => {
                const resultado = verificarArranjos();
                return (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Seu Progresso:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        resultado.cumprido ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                      }`}>
                        {resultado.cumprido ? 'Arranjo Cumprido' : 'Em Progresso'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Pontuação atual: {resultado.pontuacao}/{lista.arranjos.pontosParaAprovacao} pontos
                      {resultado.podeObter100 && (
                        <span className="ml-2 text-green-600 font-medium">✓ Apto para nota máxima!</span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
        
        <div className="border-t pt-4">
          <span className="text-sm font-medium text-gray-500">Descrição</span>
          <p className="text-gray-900 mt-1">{lista.descricao}</p>
        </div>
      </Card>

      {/* Lista de Questões */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Questões</h2>
          {lista.arranjos && userRole === 'aluno' && (() => {
            const resultado = verificarArranjos();
            return (
              <div className="text-sm">
                <span className="text-gray-600">Progresso dos Grupos: </span>
                {Object.entries(resultado.grupos).map(([grupoId, grupo]) => (
                  <span key={grupoId} className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                    grupo.cumprido ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                  }`}>
                    {grupoId} {grupo.cumprido ? '✓' : `(${grupo.questoesResolvidas.length}/${lista.arranjos?.grupos[grupoId].minimo})`}
                  </span>
                ))}
              </div>
            );
          })()}
        </div>
        
        <div className="space-y-4">
          {lista.questoes.map((questao, index) => {
            const submissao = getQuestaoSubmissao(questao.id);
            
            return (
              <div key={questao.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-900">
                      {index + 1}. {questao.titulo}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDificuldadeColor(questao.dificuldade)}`}>
                      {questao.dificuldade === 'facil' ? 'Fácil' : 
                       questao.dificuldade === 'medio' ? 'Médio' : 'Difícil'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {questao.pontos} pts
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {submissao && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submissao.status)}`}>
                        {submissao.status === 'aceita' ? 'Aceita' :
                         submissao.status === 'erro' ? 'Erro' :
                         submissao.status === 'pendente' ? 'Pendente' : 'Tempo Excedido'}
                      </span>
                    )}
                    
                    {userRole === 'aluno' && lista.status === 'publicada' && (
                      <Link href={`/lista/${lista.id}/${questao.id}`}>
                        <Button size="sm">
                          {submissao ? 'Ver Submissão' : 'Resolver'}
                        </Button>
                      </Link>
                    )}
                    
                    {(userRole === 'professor' || userRole === 'monitor') && (
                      <Link href={`/listas/${lista.id}/questoes/${questao.id}`}>
                        <Button variant="outline" size="sm">Editar</Button>
                      </Link>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-2">{questao.descricao}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {questao.grupo && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGrupoColor(questao.grupo)}`}>
                      Grupo {questao.grupo}
                    </span>
                  )}
                  <span>Categoria: {questao.categoria}</span>
                  <span>Tempo Limite: {questao.tempoLimite}min</span>
                  {submissao && (
                    <span>
                      Tentativa #{submissao.tentativa} - {submissao.pontuacao}/{questao.pontos} pts
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Painel de Gerenciamento de Arranjos - apenas para professores/monitores */}
      {(userRole === 'professor' || userRole === 'monitor') && lista.arranjos && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Gerenciamento de Arranjos</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Como funciona o sistema de arranjos:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Os alunos precisam resolver questões específicas para atingir a pontuação máxima</li>
                <li>• Fórmula atual: <strong>{lista.arranjos.formula}</strong></li>
                <li>• Pontos necessários para aprovação: <strong>{lista.arranjos.pontosParaAprovacao}</strong></li>
                <li>• As tentativas são ilimitadas, permitindo múltiplas submissões</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(lista.arranjos.grupos).map(([grupoId, grupo]) => (
                <div key={grupoId} className="p-4 border rounded-lg">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium mb-2 ${getGrupoColor(grupoId)}`}>
                    Grupo {grupoId}
                  </div>
                  <h4 className="font-medium mb-2">{grupo.nome}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Questões: {grupo.questoes.length}</p>
                    <p>Mínimo: {grupo.minimo} de {grupo.maximo}</p>
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">IDs das questões:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {grupo.questoes.map(qId => (
                          <span key={qId} className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                            {qId}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {(userRole === 'professor' || userRole === 'monitor') && (
                <>
                  <Button size="sm">Editar Arranjos</Button>
                  <Button variant="outline" size="sm">Visualizar Estatísticas</Button>
                  <Button variant="outline" size="sm">Exportar Resultados</Button>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Botão para alternar tipo de usuário (apenas para demonstração) */}
      <div className="mt-6 text-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            const novoTipo = userRole === 'aluno' ? 'professor' : 'aluno';
            setUserRole(novoTipo);
            localStorage.setItem('userRole', novoTipo);
          }}
        >
          {userRole === 'aluno' ? 'Ver como Professor' : 'Ver como Aluno'}
        </Button>
      </div>
    </div>
  );
}
