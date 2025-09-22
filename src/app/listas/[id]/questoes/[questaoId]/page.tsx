"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import listasData from "@/mocks/question_lists.json";
import submissoesData from "@/mocks/submissions.json";

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
  tempoLimite: number;
  grupo?: string;
  enunciado: string;
  exemplos: {
    entrada: string;
    saida: string;
    explicacao?: string;
  }[];
  restricoes: string[];
  notas?: string[];
}

interface Lista {
  id: string;
  titulo: string;
  status: 'rascunho' | 'publicada' | 'encerrada';
  turma: string;
  tentativasIlimitadas: boolean;
}

interface Submissao {
  id: string;
  codigo: string;
  linguagem: string;
  status: 'pendente' | 'aceita' | 'erro' | 'tempo_excedido' | 'compilacao_erro';
  pontuacao: number;
  tentativa: number;
  submittedAt: string;
  tempoExecucao?: number;
  memoriaUsada?: number;
  feedback?: string;
  testeCases?: {
    numero: number;
    status: 'aceito' | 'erro' | 'tempo_excedido';
    entrada: string;
    saidaEsperada: string;
    saidaObtida: string;
  }[];
}

// Função para obter questão dos mocks
const getQuestaoFromMocks = (questaoId: string): Questao | null => {
  for (const list of mockLists) {
    const question = list.questoes.find(q => q.id === questaoId);
    if (question) {
      return {
        id: question.id,
        titulo: question.titulo,
        dificuldade: question.dificuldade === 'fácil' ? 'facil' : question.dificuldade === 'média' ? 'medio' : 'dificil',
        pontos: question.pontos,
        descricao: question.descricao,
        categoria: 'Geral',
        tempoLimite: 30,
        grupo: "A",
        enunciado: `
**Problema:**
${question.descricao}

**Entrada:**
Entrada padrão conforme especificado no problema.

**Saída:**
Saída esperada conforme especificado no problema.
        `,
        exemplos: [
          {
            entrada: "1 2",
            saida: "3",
            explicacao: "Exemplo 1"
          }
        ],
        restricoes: [
          "Tempo limite: 1 segundo",
          "Memória limite: 256 MB"
        ],
        notas: [
          "Leia atentamente o enunciado",
          "Teste com os exemplos fornecidos"
        ]
      };
    }
  }
  return null;
};

const getListaFromMocks = (listaId: string): Lista | null => {
  const mockList = mockLists.find(list => list.id === listaId);
  if (!mockList) return null;
  
  return {
    id: mockList.id,
    titulo: mockList.titulo,
    status: "publicada",
    turma: "Algoritmos e Programação I",
    tentativasIlimitadas: true
  };
};

const getSubmissoesFromMocks = (questaoId: string): Submissao[] => {
  return mockSubmissions
    .filter(sub => sub.questaoId === questaoId)
    .map(sub => ({
      id: sub.id,
      codigo: sub.codigo,
      linguagem: sub.linguagem,
      status: sub.status === 'aceita' ? 'aceita' : 
             sub.status === 'pendente' ? 'pendente' :
             sub.status === 'timeout' ? 'tempo_excedido' : 'erro',
      pontuacao: sub.pontuacao,
      tempoExecucao: sub.tempoExecucao || 0,
      memoriaUsada: sub.memoriaUsada || 0,
      submittedAt: sub.submissaoEm,
      feedback: sub.feedback || '',
      tentativa: 1,
      casosDeTestePassaram: [],
      casosDeTesteFalharam: []
    }));
};

export default function QuestaoPage() {
  const params = useParams();
  const router = useRouter();
  const listaId = params.id as string;
  const questaoId = params.questaoId as string;
  
  const [questao, setQuestao] = useState<Questao | null>(null);
  const [lista, setLista] = useState<Lista | null>(null);
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);
  const [codigo, setCodigo] = useState("");
  const [linguagem, setLinguagem] = useState("cpp");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<'aluno' | 'professor' | 'monitor'>('aluno');
  const [abaSelecionada, setAbaSelecionada] = useState<'problema' | 'submissoes' | 'editor'>('problema');

  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => {
      if (listaId === "1" && questaoId === "q1") {
        setQuestao(getQuestaoFromMocks(questaoId));
        setLista(getListaFromMocks(listaId));
        setSubmissoes(getSubmissoesFromMocks(questaoId));
      }
      setLoading(false);
    }, 500);

    // Recuperar tipo de usuário
    const savedUserRole = localStorage.getItem('userRole') as 'aluno' | 'professor' | 'monitor';
    if (savedUserRole) {
      setUserRole(savedUserRole);
    }

    return () => clearTimeout(timer);
  }, [listaId, questaoId]);

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
      case 'compilacao_erro': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleSubmit = async () => {
    if (!codigo.trim()) {
      alert('Por favor, insira seu código antes de submeter.');
      return;
    }

    setSubmitting(true);
    
    // Simular submissão
    setTimeout(() => {
      const novaSubmissao: Submissao = {
        id: `s${Date.now()}`,
        codigo,
        linguagem,
        status: 'pendente',
        pontuacao: 0,
        tentativa: submissoes.length + 1,
        submittedAt: new Date().toISOString(),
        feedback: "Submissão enviada com sucesso! Aguarde o resultado..."
      };
      
      setSubmissoes(prev => [novaSubmissao, ...prev]);
      setSubmitting(false);
      setAbaSelecionada('submissoes');
      
      // Simular processamento
      setTimeout(() => {
        setSubmissoes(prev => prev.map(s => 
          s.id === novaSubmissao.id 
            ? { ...s, status: 'aceita', pontuacao: questao?.pontos || 0, feedback: "Solução aceita!" }
            : s
        ));
      }, 3000);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!questao || !lista) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Questão não encontrada</h1>
          <p className="text-gray-600 mb-4">A questão solicitada não existe ou não está disponível.</p>
          <Link href={`/listas/${listaId}`}>
            <Button>Voltar para Lista</Button>
          </Link>
        </div>
      </div>
    );
  }

  const melhorSubmissao = submissoes
    .filter(s => s.status === 'aceita')
    .sort((a, b) => b.pontuacao - a.pontuacao)[0];

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/listas/${listaId}`}>
            <Button variant="outline" size="sm">
              ← Voltar para Lista
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{questao.titulo}</h1>
            <p className="text-gray-600">{lista.turma} • {lista.titulo}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {questao.grupo && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGrupoColor(questao.grupo)}`}>
              Grupo {questao.grupo}
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDificuldadeColor(questao.dificuldade)}`}>
            {questao.dificuldade === 'facil' ? 'Fácil' : 
             questao.dificuldade === 'medio' ? 'Médio' : 'Difícil'}
          </span>
          <span className="text-sm text-gray-600">
            {questao.pontos} pontos
          </span>
          {melhorSubmissao && (
            <span className="text-sm text-green-600 font-medium">
              ✓ Resolvida ({melhorSubmissao.pontuacao} pts)
            </span>
          )}
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setAbaSelecionada('problema')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              abaSelecionada === 'problema'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Problema
          </button>
          {userRole === 'aluno' && lista.status === 'publicada' && (
            <button
              onClick={() => setAbaSelecionada('editor')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                abaSelecionada === 'editor'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Submeter Solução
            </button>
          )}
          <button
            onClick={() => setAbaSelecionada('submissoes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              abaSelecionada === 'submissoes'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Submissões ({submissoes.length})
          </button>
        </nav>
      </div>

      {/* Aba Problema */}
      {abaSelecionada === 'problema' && (
        <div className="space-y-6">
          {/* Botão de submeter para alunos - bem visível no topo */}
          {userRole === 'aluno' && lista.status === 'publicada' && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900">Pronto para resolver?</h3>
                  <p className="text-sm text-indigo-700">Leia o problema abaixo e submeta sua solução.</p>
                </div>
                <Button 
                  onClick={() => setAbaSelecionada('editor')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 text-lg font-semibold"
                  size="lg"
                >
                  🚀 Submeter Solução
                </Button>
              </div>
            </div>
          )}

          {/* Enunciado */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Enunciado</h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono bg-gray-50 p-4 rounded-lg">
                {questao.enunciado}
              </pre>
            </div>
          </Card>

          {/* Exemplos */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Exemplos</h2>
            <div className="space-y-4">
              {questao.exemplos.map((exemplo, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Exemplo {index + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Entrada:</span>
                      <pre className="mt-1 text-sm bg-gray-50 p-2 rounded border font-mono">
                        {exemplo.entrada}
                      </pre>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Saída:</span>
                      <pre className="mt-1 text-sm bg-gray-50 p-2 rounded border font-mono">
                        {exemplo.saida}
                      </pre>
                    </div>
                  </div>
                  {exemplo.explicacao && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-500">Explicação:</span>
                      <p className="text-sm text-gray-700 mt-1">{exemplo.explicacao}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Restrições */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Restrições</h2>
            <ul className="space-y-2">
              {questao.restricoes.map((restricao, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                  {restricao}
                </li>
              ))}
            </ul>
          </Card>

          {/* Notas */}
          {questao.notas && questao.notas.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Notas</h2>
              <ul className="space-y-2">
                {questao.notas.map((nota, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                    {nota}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Botão de submeter no final para alunos */}
          {userRole === 'aluno' && lista.status === 'publicada' && (
            <div className="text-center py-6">
              <Button 
                onClick={() => setAbaSelecionada('editor')}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold"
                size="lg"
              >
                💻 Ir para Editor e Submeter
              </Button>
              <p className="text-sm text-gray-600 mt-2">
                Clique aqui para abrir o editor de código e submeter sua solução
              </p>
            </div>
          )}
        </div>
      )}

      {/* Aba Editor */}
      {abaSelecionada === 'editor' && userRole === 'aluno' && lista.status === 'publicada' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Submeter Solução</h2>
                <p className="text-gray-600 mt-1">Escreva seu código e submeta para avaliação</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => setAbaSelecionada('problema')}
              >
                📖 Ver Problema
              </Button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Linguagem de Programação
              </label>
              <select
                value={linguagem}
                onChange={(e) => setLinguagem(e.target.value)}
                className="w-48 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Fonte
              </label>
              <textarea
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Digite seu código aqui..."
                rows={20}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              />
            </div>

            <div className="flex gap-3 justify-center">
              <Button 
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
                size="lg"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submetendo...
                  </>
                ) : (
                  '🚀 Submeter Solução'
                )}
              </Button>
              <Button variant="outline" onClick={() => setCodigo('')} size="lg">
                🗑️ Limpar Código
              </Button>
            </div>

            {submitting && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <div>
                    <p className="text-blue-800 font-medium">Processando sua submissão...</p>
                    <p className="text-blue-600 text-sm">Aguarde enquanto testamos seu código</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Aba Submissões */}
      {abaSelecionada === 'submissoes' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Histórico de Submissões</h2>
            
            {submissoes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Nenhuma submissão encontrada.</p>
                {userRole === 'aluno' && lista.status === 'publicada' && (
                  <Button 
                    className="mt-4"
                    onClick={() => setAbaSelecionada('editor')}
                  >
                    Fazer Primeira Submissão
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {submissoes.map((submissao) => (
                  <div key={submissao.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">
                          Tentativa #{submissao.tentativa}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submissao.status)}`}>
                          {submissao.status === 'aceita' ? 'Aceita' :
                           submissao.status === 'erro' ? 'Erro' :
                           submissao.status === 'pendente' ? 'Pendente' : 
                           submissao.status === 'tempo_excedido' ? 'Tempo Excedido' : 'Erro de Compilação'}
                        </span>
                        <span className="text-sm text-gray-600">
                          {submissao.linguagem}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{formatDate(submissao.submittedAt)}</span>
                        <span>{submissao.pontuacao}/{questao.pontos} pts</span>
                        {submissao.tempoExecucao && (
                          <span>{submissao.tempoExecucao}s</span>
                        )}
                        {submissao.memoriaUsada && (
                          <span>{submissao.memoriaUsada}MB</span>
                        )}
                      </div>
                    </div>

                    {submissao.feedback && (
                      <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                        <span className="font-medium">Feedback:</span> {submissao.feedback}
                      </div>
                    )}

                    {submissao.testeCases && submissao.testeCases.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Casos de Teste:</span>
                        <div className="mt-1 space-y-2">
                          {submissao.testeCases.map((teste) => (
                            <div key={teste.numero} className="flex items-center gap-2 text-xs">
                              <span className={`px-2 py-1 rounded-full font-medium ${
                                teste.status === 'aceito' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                              }`}>
                                Teste {teste.numero}
                              </span>
                              {teste.status !== 'aceito' && (
                                <span className="text-gray-600">
                                  Esperado: {teste.saidaEsperada}, Obtido: {teste.saidaObtida}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        Ver Código Submetido
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-50 p-3 rounded border font-mono overflow-x-auto">
                        {submissao.codigo}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
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
