"use client";
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import tokensData from "../../mocks/invite_tokens.json";
import classData from "../../mocks/classes.json";

export interface ConviteMock {
  _id: { $oid: string };
  type: 'aluno' | 'monitor' | 'professor';
  token: string;
  link: string;
  created_at: string;
  expires_at: string;
  used: boolean;
  max_uses: number;
  current_uses: number;
  class_id?: { $oid: string };
  class_name?: string;
  created_by: { $oid: string };
}

export interface TurmaMock {
  id: string;
  name: string;
  professorId: string;
  professorName: string;
  criadaEm: string;
  alunosCount: number;
  ativa: boolean;
  codigo?: string;
  descricao?: string;
}

// Dados dos mocks
const mockConvites: ConviteMock[] = tokensData as ConviteMock[];
const mockTurmas: TurmaMock[] = classData as TurmaMock[];

// Funções auxiliares
function getConvitesByTurmaId(turmaId: string): ConviteMock[] {
  return mockConvites.filter(convite => convite.class_id?.$oid === turmaId);
}

function generateMockToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function createMockConvite(
  type: 'aluno' | 'monitor' | 'professor',
  criadoPor: string,
  maxUsos: number = 1,
  diasExpiracao: number = 7,
  turmaId?: string
): ConviteMock {
  const _id = { $oid: `651200000000000000800${(mockConvites.length + 1).toString().padStart(2, '0')}` };
  const token = generateMockToken();
  const link = `http://localhost:3000/cadastro?token=${token}`;
  const created_at = new Date().toISOString();
  const expires_at = new Date(Date.now() + diasExpiracao * 24 * 60 * 60 * 1000).toISOString();
  
  let class_name: string | undefined;
  let class_id: { $oid: string } | undefined;
  if (turmaId) {
    const turma = getTurmaById(turmaId);
    class_name = turma?.name;
    class_id = { $oid: turmaId };
  }
  
  return {
    _id,
    type,
    token,
    link,
    created_at,
    expires_at,
    used: false,
    max_uses: maxUsos,
    current_uses: 0,
    class_id,
    class_name,
    created_by: { $oid: criadoPor }
  };
}

function getTurmaById(id: string): TurmaMock | undefined {
  return mockTurmas.find(turma => turma.id === id);
}

function getAlunosByTurmaId(turmaId: string): any[] {
  return [];
}

function getTurmasAtivas(): TurmaMock[] {
  return mockTurmas.filter(turma => turma.ativa);
}

interface Convite {
  id: string;
  tipo: 'aluno' | 'monitor' | 'professor';
  token: string;
  link: string;
  criadoEm: string;
  expiraEm: string;
  usado: boolean;
  maxUsos: number;
  usosAtuais: number;
  turmaId?: string;
  turmaNome?: string;
}

export default function ConvitesPage() {
  const [convites, setConvites] = useState<Convite[]>([]);
  const [tipo, setTipo] = useState<'aluno' | 'monitor' | 'professor'>('aluno');
  const [turmaId, setTurmaId] = useState('');
  const [maxUsos, setMaxUsos] = useState(1);
  const [diasExpiracao, setDiasExpiracao] = useState(7);
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<{id: string; nome: string}[]>([]);

  // Carregar convites e turmas ao montar o componente
  useEffect(() => {
    carregarConvites();
    carregarTurmas();
  }, []);

  async function carregarConvites() {
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Usar mocks em vez de API real
      const convitesFormatados = mockConvites.map(convite => ({
        id: convite._id.$oid,
        tipo: convite.type,
        token: convite.token,
        link: convite.link,
        criadoEm: convite.created_at,
        expiraEm: convite.expires_at,
        usado: convite.used,
        maxUsos: convite.max_uses,
        usosAtuais: convite.current_uses,
        turmaId: convite.class_id?.$oid,
        turmaNome: convite.class_name
      }));
      
      // Ordenar convites: não usados primeiro, depois usados
      const convitesOrdenados = convitesFormatados.sort((a, b) => {
        // Primeiro critério: convites não usados vêm primeiro
        if (a.usado !== b.usado) {
          return a.usado ? 1 : -1;
        }
        // Segundo critério: mais recentes primeiro
        return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
      });
      
      setConvites(convitesOrdenados);
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
    }
  }

  async function carregarTurmas() {
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Usar mocks em vez de API real
      const turmasAtivas = getTurmasAtivas();
      const turmasFormatadas = turmasAtivas.map(turma => ({
        id: turma.id,
        nome: turma.name
      }));
      
      setTurmasDisponiveis(turmasFormatadas);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  }

  async function gerarConvite() {
    setLoading(true);
    try {
      // Validações específicas por tipo
      if (tipo === 'aluno') {
        if (!turmaId) {
          alert('Selecione uma turma para convites de aluno');
          return;
        }
        if (turmasDisponiveis.length === 0) {
          alert('Você precisa criar pelo menos uma turma ativa antes de gerar convites para alunos');
          return;
        }
      }

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Criar convite usando mock
      const novoConviteMock = createMockConvite(
        tipo,
        "6500000000000000002001", // ID da professora Melina Mongiovi
        maxUsos,
        diasExpiracao,
        tipo === 'aluno' ? turmaId : undefined
      );
      
      // Adicionar ao mock global (simulação)
      mockConvites.unshift(novoConviteMock);
      
      const conviteFormatado = {
        id: novoConviteMock._id.$oid,
        tipo: novoConviteMock.type,
        token: novoConviteMock.token,
        link: novoConviteMock.link,
        criadoEm: novoConviteMock.created_at,
        expiraEm: novoConviteMock.expires_at,
        usado: novoConviteMock.used,
        maxUsos: novoConviteMock.max_uses,
        usosAtuais: novoConviteMock.current_uses,
        turmaId: novoConviteMock.class_id?.$oid,
        turmaNome: novoConviteMock.class_name
      };
      
      setConvites(prev => {
        const novosConvites = [conviteFormatado, ...prev];
        // Reordenar: não usados primeiro, depois usados
        return novosConvites.sort((a, b) => {
          // Primeiro critério: convites não usados vêm primeiro
          if (a.usado !== b.usado) {
            return a.usado ? 1 : -1;
          }
          // Segundo critério: mais recentes primeiro
          return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
        });
      });
      
      // Resetar formulário
      setTurmaId('');
    } catch (error) {
      alert('Erro ao gerar convite: ' + error);
    } finally {
      setLoading(false);
    }
  }

  async function copiarLink(link: string, id: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(id);
      setTimeout(() => setCopiado(null), 2000);
    } catch (error) {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiado(id);
      setTimeout(() => setCopiado(null), 2000);
    }
  }

  async function revogarConvite(id: string) {
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Remover do mock
      const conviteIndex = mockConvites.findIndex(c => c._id.$oid === id);
      if (conviteIndex !== -1) {
        mockConvites.splice(conviteIndex, 1);
      }
      
      setConvites(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      alert('Erro ao revogar convite: ' + error);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Convites</h1>
          <p className="text-gray-600">Crie links de convite para alunos, monitores e professores se cadastrarem.</p>
        </div>
      </div>

        {/* Formulário de Geração */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Gerar Novo Convite</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select 
                value={tipo} 
                onChange={e => {
                  setTipo(e.target.value as 'aluno' | 'monitor' | 'professor');
                  // Resetar turmaId quando mudar tipo
                  if (e.target.value !== 'aluno') {
                    setTurmaId('');
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="aluno">Aluno</option>
                <option value="monitor">Monitor</option>
                <option value="professor">Professor</option>
              </select>
            </div>

            {tipo === 'aluno' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
                <select 
                  value={turmaId} 
                  onChange={e => setTurmaId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Selecione uma turma</option>
                  {turmasDisponiveis.map(turma => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome}
                    </option>
                  ))}
                </select>
                {turmasDisponiveis.length === 0 && (
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Você precisa <a href="/turmas" className="underline">criar uma turma</a> primeiro
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Máx. Usos</label>
              <Input 
                type="number" 
                value={maxUsos} 
                onChange={e => setMaxUsos(parseInt(e.target.value))}
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expira em (dias)</label>
              <Input 
                type="number" 
                value={diasExpiracao} 
                onChange={e => setDiasExpiracao(parseInt(e.target.value))}
                min="1"
                max="30"
              />
            </div>
          </div>

          <Button onClick={gerarConvite} disabled={loading} className="w-full md:w-auto">
            {loading ? 'Gerando...' : 'Gerar Convite'}
          </Button>
        </Card>

        {/* Lista de Convites */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Convites Criados</h2>
          
          {convites.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              Nenhum convite criado ainda.
            </Card>
          ) : (
            <div className="space-y-4">
              {convites.map(convite => (
                <Card key={convite.id} className={`p-6 ${convite.usado ? 'opacity-70 bg-gray-50' : ''}`}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Informações Principais */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          convite.tipo === 'aluno' ? 'bg-blue-100 text-blue-800' :
                          convite.tipo === 'monitor' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {convite.tipo.charAt(0).toUpperCase() + convite.tipo.slice(1)}
                        </span>
                        
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          convite.usado ? 'bg-red-100 text-red-800' : 
                          new Date(convite.expiraEm) < new Date() ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {convite.usado ? (
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                              </svg>
                              Usado
                            </span>
                          ) : 
                           new Date(convite.expiraEm) < new Date() ? (
                             <span className="flex items-center gap-1">
                               <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                 <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                               </svg>
                               Expirado
                             </span>
                           ) : (
                             <span className="flex items-center gap-1">
                               <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                               </svg>
                               Ativo
                             </span>
                           )}
                        </span>
                        
                        <span className="text-sm text-gray-500">
                          Usos: {convite.usosAtuais}/{convite.maxUsos}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Data de Criação</p>
                          <p className="text-sm font-medium">
                            <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                            </svg>
                            {new Date(convite.criadoEm).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Data de Expiração</p>
                          <p className="text-sm font-medium">
                            <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                            </svg>
                            {new Date(convite.expiraEm).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      {convite.turmaId && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">Turma Associada</p>
                          <p className="text-sm font-medium text-indigo-600">
                            <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                            </svg>
                            {convite.turmaNome || convite.turmaId}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-gray-500 mb-2">Link do Convite</p>
                        <div className="bg-gray-50 p-3 rounded-lg border text-sm font-mono break-all">
                          {convite.link}
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-3 lg:justify-start">
                      <Button
                        onClick={() => copiarLink(convite.link, convite.id)}
                        className={`w-full ${copiado === convite.id ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        {copiado === convite.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copiado!
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copiar Link
                          </span>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => revogarConvite(convite.id)}
                        disabled={convite.usado || new Date(convite.expiraEm) < new Date()}
                        className="w-full border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Revogar
                        </span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
