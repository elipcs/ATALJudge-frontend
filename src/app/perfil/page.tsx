"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { getToken } from "../../services/auth";
import { useUserRole } from "../../hooks/useUserRole";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: 'professor' | 'aluno' | 'monitor';
  avatar?: string;
  biografia?: string;
  instituicao?: string;
  departamento?: string;
  titulo?: string;
  criadoEm: string;
  ultimoLogin: string;
}

interface EstatisticasProfessor {
  totalTurmas: number;
  totalEstudantes: number;
  totalListas: number;
  totalSubmissoes: number;
  taxaSucessoGeral: number;
  estudantesAtivos: number;
}

interface EstatisticasAluno {
  totalSubmissoes: number;
  submissoesAceitas: number;
  totalListas: number;
  listasCompletas: number;
  taxaSucesso: number;
  posicaoRanking: number;
}

interface EstatisticasMonitor {
  totalTurmas: number;
  totalEstudantes: number;
  totalListas: number;
  totalSubmissoes: number;
  taxaSucessoGeral: number;
  estudantesAtivos: number;
}

interface ConfiguracaoPrivacidade {
  perfilPublico: boolean;
  mostrarEstatisticas: boolean;
  receberEmails: boolean;
  notificacoesPush: boolean;
}

export default function PerfilPage() {
  const router = useRouter();
  const { userRole, isLoading: isLoadingRole } = useUserRole();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [estatisticas, setEstatisticas] = useState<EstatisticasProfessor | EstatisticasAluno | EstatisticasMonitor | null>(null);
  const [privacidade, setPrivacidade] = useState<ConfiguracaoPrivacidade>({
    perfilPublico: true,
    mostrarEstatisticas: true,
    receberEmails: true,
    notificacoesPush: false
  });
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [tabAtiva, setTabAtiva] = useState('perfil');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    // Aguardar o carregamento do userRole antes de carregar os dados
    if (!isLoadingRole && userRole) {
      carregarDados();
    }
  }, [router, userRole, isLoadingRole]);

  async function carregarDados() {
    try {
      setLoading(true);
      setErro('');
      
      // Usar o userRole do hook em vez de query parameter
      const tipoUsuario = userRole;
      
      const headers = {
        'Content-Type': 'application/json'
      };

      const [perfilRes, estatisticasRes, privacidadeRes] = await Promise.all([
        fetch(`/api/usuarios/perfil?tipo=${tipoUsuario}`, { headers }),
        fetch(`/api/usuarios/estatisticas?tipo=${tipoUsuario}`, { headers }),
        fetch(`/api/usuarios/privacidade?tipo=${tipoUsuario}`, { headers })
      ]);

      if (perfilRes.ok) {
        const perfilData = await perfilRes.json();
        setUsuario(perfilData);
      } else if (perfilRes.status === 401) {
        // router.push('/login'); // Comentado temporariamente
        throw new Error('Erro de autenticação');
      } else {
        throw new Error('Erro ao carregar perfil');
      }

      if (estatisticasRes.ok) {
        const estatisticasData = await estatisticasRes.json();
        setEstatisticas(estatisticasData);
      }

      if (privacidadeRes.ok) {
        const privacidadeData = await privacidadeRes.json();
        setPrivacidade(privacidadeData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados do perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function salvarPerfil() {
    if (!usuario) return;

    try {
      setSalvando(true);
      setErro('');
      setSucesso('');
      
      const tipoUsuario = userRole;
      
      const response = await fetch(`/api/usuarios/perfil?tipo=${tipoUsuario}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: usuario.nome,
          biografia: usuario.biografia,
          instituicao: usuario.instituicao,
          departamento: usuario.departamento,
          titulo: usuario.titulo
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          // router.push('/login'); // Comentado temporariamente
          throw new Error('Erro de autenticação');
        }
        throw new Error('Erro ao salvar perfil');
      }

      setSucesso('Perfil atualizado com sucesso!');
      setTimeout(() => setSucesso(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setErro('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  async function salvarPrivacidade() {
    try {
      setSalvando(true);
      setErro('');
      setSucesso('');
      
      const tipoUsuario = userRole;
      
      const response = await fetch(`/api/usuarios/privacidade?tipo=${tipoUsuario}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(privacidade)
      });

      if (!response.ok) {
        if (response.status === 401) {
          // router.push('/login'); // Comentado temporariamente
          throw new Error('Erro de autenticação');
        }
        throw new Error('Erro ao salvar configurações');
      }

      setSucesso('Configurações de privacidade atualizadas!');
      setTimeout(() => setSucesso(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setErro('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  async function alterarSenha() {
    if (!senhaAtual || !novaSenha) {
      setErro('Preencha todos os campos de senha');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('A confirmação da senha não confere');
      return;
    }

    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setAlterandoSenha(true);
      setErro('');
      setSucesso('');
      
      const tipoUsuario = userRole;
      
      const response = await fetch(`/api/usuarios/alterar-senha?tipo=${tipoUsuario}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senhaAtual,
          novaSenha
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          // router.push('/login'); // Comentado temporariamente
          throw new Error('Erro de autenticação');
        }
        const error = await response.json();
        throw new Error(error.message || 'Erro ao alterar senha');
      }

      setSucesso('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setTimeout(() => setSucesso(''), 3000);
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setErro('Erro ao alterar senha. Verifique sua senha atual.');
    } finally {
      setAlterandoSenha(false);
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErro('A imagem deve ter no máximo 2MB');
      return;
    }

    try {
      setErro('');
      setSucesso('');
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      const tipoUsuario = userRole;
      
      const response = await fetch(`/api/usuarios/avatar?tipo=${tipoUsuario}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          // router.push('/login'); // Comentado temporariamente
          throw new Error('Erro de autenticação');
        }
        throw new Error('Erro ao fazer upload do avatar');
      }

      const result = await response.json();
      if (usuario) {
        setUsuario({ ...usuario, avatar: result.avatarUrl });
        setSucesso('Avatar atualizado com sucesso!');
        setTimeout(() => setSucesso(''), 3000);
      }
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      setErro('Erro ao fazer upload do avatar. Tente novamente.');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Erro ao carregar dados do perfil</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e configurações.</p>
        </div>
      </div>

      {/* Alertas de Sucesso e Erro */}
      {sucesso && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {sucesso}
        </div>
      )}
      
      {erro && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {erro}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'perfil', label: 'Informações Pessoais' },
            { id: 'estatisticas', label: 'Estatísticas' },
            { id: 'seguranca', label: 'Segurança' },
            { id: 'privacidade', label: 'Privacidade' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTabAtiva(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                tabAtiva === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      {tabAtiva === 'perfil' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar */}
          <Card className="p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 overflow-hidden">
                  {usuario.avatar ? (
                    <img 
                      src={usuario.avatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl">
                      {usuario.nome.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full cursor-pointer hover:bg-indigo-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadAvatar}
                    className="hidden"
                  />
                </label>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{usuario.nome}</h3>
              <p className="text-sm text-gray-600 capitalize">{usuario.tipo}</p>
            </div>
          </Card>

          {/* Informações */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <Input
                    value={usuario.nome}
                    onChange={e => setUsuario({ ...usuario, nome: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input
                    value={usuario.email}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instituição</label>
                  <Input
                    value={usuario.instituicao || ''}
                    onChange={e => setUsuario({ ...usuario, instituicao: e.target.value })}
                    placeholder="Ex: Universidade Federal..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                  <Input
                    value={usuario.departamento || ''}
                    onChange={e => setUsuario({ ...usuario, departamento: e.target.value })}
                    placeholder="Ex: Ciência da Computação"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título/Cargo</label>
                <Input
                  value={usuario.titulo || ''}
                  onChange={e => setUsuario({ ...usuario, titulo: e.target.value })}
                  placeholder="Ex: Professor Doutor, Mestrando..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biografia</label>
                <textarea
                  value={usuario.biografia || ''}
                  onChange={e => setUsuario({ ...usuario, biografia: e.target.value })}
                  placeholder="Conte um pouco sobre você..."
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <strong>Cadastrado em:</strong> {new Date(usuario.criadoEm).toLocaleDateString('pt-BR')}
                </div>
                <div>
                  <strong>Último login:</strong> {new Date(usuario.ultimoLogin).toLocaleString('pt-BR')}
                </div>
              </div>

              <Button onClick={salvarPerfil} disabled={salvando} className="w-full md:w-auto">
                {salvando ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {tabAtiva === 'estatisticas' && estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usuario?.tipo === 'professor' && (
            <>
              <Card className="p-6">
                <div className="text-2xl font-bold text-indigo-600">{(estatisticas as EstatisticasProfessor).totalTurmas}</div>
                <div className="text-sm text-gray-600">Turmas Criadas</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-2xl font-bold text-green-600">{(estatisticas as EstatisticasProfessor).totalEstudantes}</div>
                <div className="text-sm text-gray-600">Estudantes</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-2xl font-bold text-blue-600">{(estatisticas as EstatisticasProfessor).totalListas}</div>
                <div className="text-sm text-gray-600">Listas Criadas</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-2xl font-bold text-purple-600">{(estatisticas as EstatisticasProfessor).totalSubmissoes}</div>
                <div className="text-sm text-gray-600">Submissões Recebidas</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-2xl font-bold text-yellow-600">{(estatisticas as EstatisticasProfessor).taxaSucessoGeral.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Taxa de Sucesso</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-2xl font-bold text-red-600">{(estatisticas as EstatisticasProfessor).estudantesAtivos}</div>
                <div className="text-sm text-gray-600">Estudantes Ativos</div>
              </Card>
            </>
          )}

          {usuario?.tipo === 'aluno' && (
            <>
              <Card className="p-6">
                <div className="text-2xl font-bold text-indigo-600">{(estatisticas as EstatisticasAluno).totalSubmissoes}</div>
                <div className="text-sm text-gray-600">Total de Submissões</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-2xl font-bold text-green-600">{(estatisticas as EstatisticasAluno).submissoesAceitas}</div>
                <div className="text-sm text-gray-600">Submissões Aceitas</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-2xl font-bold text-blue-600">{(estatisticas as EstatisticasAluno).totalListas}</div>
                <div className="text-sm text-gray-600">Listas Disponíveis</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-2xl font-bold text-purple-600">{(estatisticas as EstatisticasAluno).listasCompletas}</div>
                <div className="text-sm text-gray-600">Listas Completas</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-2xl font-bold text-yellow-600">{(estatisticas as EstatisticasAluno).taxaSucesso.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Taxa de Sucesso</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-2xl font-bold text-red-600">#{(estatisticas as EstatisticasAluno).posicaoRanking}</div>
                <div className="text-sm text-gray-600">Posição no Ranking</div>
              </Card>
            </>
          )}

          {usuario?.tipo === 'monitor' && (
            <>
              <Card className="p-6">
                <div className="text-2xl font-bold text-indigo-600">{(estatisticas as EstatisticasMonitor).totalTurmas}</div>
                <div className="text-sm text-gray-600">Turmas Monitoradas</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-2xl font-bold text-green-600">{(estatisticas as EstatisticasMonitor).totalEstudantes}</div>
                <div className="text-sm text-gray-600">Estudantes Assistidos</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-2xl font-bold text-blue-600">{(estatisticas as EstatisticasMonitor).totalListas}</div>
                <div className="text-sm text-gray-600">Listas Acompanhadas</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-2xl font-bold text-purple-600">{(estatisticas as EstatisticasMonitor).totalSubmissoes}</div>
                <div className="text-sm text-gray-600">Submissões Avaliadas</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-2xl font-bold text-yellow-600">{(estatisticas as EstatisticasMonitor).taxaSucessoGeral.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Taxa de Sucesso</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-2xl font-bold text-red-600">{(estatisticas as EstatisticasMonitor).estudantesAtivos}</div>
                <div className="text-sm text-gray-600">Estudantes Ativos</div>
              </Card>
            </>
          )}
        </div>
      )}

      {tabAtiva === 'seguranca' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
              <Input
                type="password"
                value={senhaAtual}
                onChange={e => setSenhaAtual(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
              <Input
                type="password"
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
              <Input
                type="password"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
              />
            </div>

            <Button onClick={alterarSenha} disabled={alterandoSenha}>
              {alterandoSenha ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>
        </Card>
      )}

      {tabAtiva === 'privacidade' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Privacidade</h3>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={privacidade.perfilPublico}
                onChange={e => setPrivacidade(prev => ({
                  ...prev,
                  perfilPublico: e.target.checked
                }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Perfil Público</span>
                <p className="text-xs text-gray-500">Permitir que outros vejam seu perfil</p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={privacidade.mostrarEstatisticas}
                onChange={e => setPrivacidade(prev => ({
                  ...prev,
                  mostrarEstatisticas: e.target.checked
                }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Mostrar Estatísticas</span>
                <p className="text-xs text-gray-500">Exibir suas estatísticas publicamente</p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={privacidade.receberEmails}
                onChange={e => setPrivacidade(prev => ({
                  ...prev,
                  receberEmails: e.target.checked
                }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Receber Emails</span>
                <p className="text-xs text-gray-500">Receber notificações por email</p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={privacidade.notificacoesPush}
                onChange={e => setPrivacidade(prev => ({
                  ...prev,
                  notificacoesPush: e.target.checked
                }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Notificações Push</span>
                <p className="text-xs text-gray-500">Receber notificações no navegador</p>
              </div>
            </label>

            <Button onClick={salvarPrivacidade} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
