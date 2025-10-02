"use client";

import { useState, useEffect } from "react";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import PageHeader from "../../components/PageHeader";
import { useUserRole } from "../../hooks/useUserRole";
import { LANGUAGE_OPTIONS, DEFAULT_CONFIG } from "../../constants";

interface ConfiguracaoSistema {
  id: string;
  chave: string;
  valor: string;
  tipo: 'string' | 'number' | 'boolean' | 'json';
  categoria: string;
  descricao: string;
  editavel: boolean;
}

interface ConfiguracaoJudge {
  tempoLimiteDefault: number;
  memoriaLimiteDefault: number;
  linguagensHabilitadas: string[];
  compiladores: { [key: string]: string };
  maxSubmissoesPorMinuto: number;
  maxTamanhoArquivo: number;
}

interface NotificacaoConfig {
  emailSubmissao: boolean;
  emailNovaLista: boolean;
  emailDeadline: boolean;
  pushNotifications: boolean;
}

export default function ConfiguracoesPage() {
  const { userRole, isLoading } = useUserRole();
  
  // Todos os hooks devem ser chamados antes de qualquer return condicional
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoSistema[]>([]);
  const [configJudge, setConfigJudge] = useState<ConfiguracaoJudge>({
    tempoLimiteDefault: DEFAULT_CONFIG.TIME_LIMIT,
    memoriaLimiteDefault: DEFAULT_CONFIG.MEMORY_LIMIT,
    linguagensHabilitadas: ['python', 'java'],
    compiladores: {},
    maxSubmissoesPorMinuto: DEFAULT_CONFIG.MAX_SUBMISSIONS_PER_MINUTE,
    maxTamanhoArquivo: DEFAULT_CONFIG.MAX_FILE_SIZE
  });
  const [notificacoes, setNotificacoes] = useState<NotificacaoConfig>({
    emailSubmissao: true,
    emailNovaLista: true,
    emailDeadline: true,
    pushNotifications: false
  });
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [tabAtiva, setTabAtiva] = useState('sistema');


  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  // Verificar se o usuário tem permissão para acessar configurações (apenas professores)
  if (!isLoading && userRole !== 'professor') {
    window.location.href = '/nao-autorizado';
    return null;
  }

  async function carregarConfiguracoes() {
    try {
      setLoading(true);
      const [configRes, judgeRes, notifRes] = await Promise.all([
        fetch('/api/sistema/configuracoes'),
        fetch('/api/sistema/judge-config'),
        fetch('/api/sistema/notificacoes-config')
      ]);

      if (configRes.ok) {
        const configData = await configRes.json();
        setConfiguracoes(configData);
      }

      if (judgeRes.ok) {
        const judgeData = await judgeRes.json();
        setConfigJudge(judgeData);
      }

      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotificacoes(notifData);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  }

  async function salvarConfiguracoes() {
    try {
      setSalvando(true);
      
      const promises = [];
      
      if (tabAtiva === 'sistema') {
        promises.push(
          fetch('/api/sistema/configuracoes', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(configuracoes)
          })
        );
      } else if (tabAtiva === 'judge') {
        promises.push(
          fetch('/api/sistema/judge-config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(configJudge)
          })
        );
      } else if (tabAtiva === 'notificacoes') {
        promises.push(
          fetch('/api/sistema/notificacoes-config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notificacoes)
          })
        );
      }

      const responses = await Promise.all(promises);
      
      if (responses.every(res => res.ok)) {
        alert('Configurações salvas com sucesso!');
      } else {
        throw new Error('Erro ao salvar algumas configurações');
      }
    } catch (error) {
      alert('Erro ao salvar configurações: ' + error);
    } finally {
      setSalvando(false);
    }
  }

  async function testarConexaoJudge() {
    try {
      const response = await fetch('/api/sistema/testar-judge', {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Teste bem-sucedido! Tempo de resposta: ${result.tempoResposta}ms`);
      } else {
        throw new Error('Falha na conexão com o Judge');
      }
    } catch (error) {
      alert('Erro ao testar Judge: ' + error);
    }
  }

  async function limparCache() {
    try {
      const response = await fetch('/api/sistema/limpar-cache', {
        method: 'POST'
      });

      if (response.ok) {
        alert('Cache limpo com sucesso!');
      } else {
        throw new Error('Erro ao limpar cache');
      }
    } catch (error) {
      alert('Erro ao limpar cache: ' + error);
    }
  }

  function updateConfiguracao(id: string, valor: string) {
    setConfiguracoes(prev => 
      prev.map(config => 
        config.id === id ? { ...config, valor } : config
      )
    );
  }

  function handleLanguageToggle(language: string) {
    setConfigJudge(prev => ({
      ...prev,
      linguagensHabilitadas: prev.linguagensHabilitadas.includes(language)
        ? prev.linguagensHabilitadas.filter(l => l !== language)
        : [...prev.linguagensHabilitadas, language]
    }));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Carregando configurações...</h1>
            <p className="text-slate-600">Preparando as configurações do sistema</p>
          </div>
        </div>
      </div>
    );
  }

  const configuracoesPorCategoria = configuracoes.reduce((acc, config) => {
    if (!acc[config.categoria]) acc[config.categoria] = [];
    acc[config.categoria].push(config);
    return acc;
  }, {} as Record<string, ConfiguracaoSistema[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <PageHeader
        title="Configurações do Sistema"
        description="Gerencie as configurações gerais do AtalJudge"
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
        iconColor="gray"
      >
        <Button 
          onClick={salvarConfiguracoes} 
          disabled={salvando}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {salvando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
              Salvando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Salvar Configurações
            </>
          )}
        </Button>
      </PageHeader>

      {/* Tabs */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-2 mb-6">
        <nav className="flex space-x-2">
          {[
            { id: 'sistema', label: 'Sistema' },
            { id: 'judge', label: 'Judge Online' },
            { id: 'notificacoes', label: 'Notificações' },
            { id: 'manutencao', label: 'Manutenção' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTabAtiva(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                tabAtiva === tab.id
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      {tabAtiva === 'sistema' && (
        <div className="space-y-6">
          {Object.entries(configuracoesPorCategoria).map(([categoria, configs]) => (
            <Card key={categoria} className="bg-white border-slate-200 rounded-3xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6 capitalize">
                {categoria.replace('_', ' ')}
              </h3>
              <div className="space-y-6">
                {configs.map(config => (
                  <div key={config.id} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                          {config.chave.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                        <p className="text-sm text-slate-600">{config.descricao}</p>
                      </div>
                      
                      <div>
                        {config.tipo === 'boolean' ? (
                          <select
                            value={config.valor}
                            onChange={e => updateConfiguracao(config.id, e.target.value)}
                            disabled={!config.editavel}
                            className="w-full h-12 px-4 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 rounded-xl disabled:bg-slate-100 disabled:text-slate-500"
                          >
                            <option value="true">Ativado</option>
                            <option value="false">Desativado</option>
                          </select>
                        ) : config.tipo === 'number' ? (
                          <Input
                            type="number"
                            value={config.valor}
                            onChange={e => updateConfiguracao(config.id, e.target.value)}
                            disabled={!config.editavel}
                            className="h-12 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl disabled:bg-slate-100 disabled:text-slate-500"
                          />
                        ) : (
                          <Input
                            type="text"
                            value={config.valor}
                            onChange={e => updateConfiguracao(config.id, e.target.value)}
                            disabled={!config.editavel}
                            className="h-12 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl disabled:bg-slate-100 disabled:text-slate-500"
                          />
                        )}
                      </div>
                      
                      <div className="text-sm">
                        <span className={`px-3 py-1 rounded-xl text-xs font-medium ${
                          config.editavel 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200'
                            : 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {config.editavel ? 'Editável' : 'Somente leitura'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tabAtiva === 'judge' && (
        <div className="space-y-6">
          {/* Configurações de Performance */}
          <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Limites de Execução</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Tempo Limite Padrão (ms)
                </label>
                <Input
                  type="number"
                  value={configJudge.tempoLimiteDefault}
                  onChange={e => setConfigJudge(prev => ({
                    ...prev,
                    tempoLimiteDefault: parseInt(e.target.value)
                  }))}
                  className="h-12 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
                />
              </div>
              
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Memória Limite Padrão (MB)
                </label>
                <Input
                  type="number"
                  value={configJudge.memoriaLimiteDefault}
                  onChange={e => setConfigJudge(prev => ({
                    ...prev,
                    memoriaLimiteDefault: parseInt(e.target.value)
                  }))}
                  className="h-12 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
                />
              </div>
            </div>
          </Card>

          {/* Linguagens Habilitadas */}
          <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Linguagens Habilitadas</h3>
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {LANGUAGE_OPTIONS.map((lang: { value: string; label: string }) => (
                  <label key={lang.value} className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-all duration-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configJudge.linguagensHabilitadas.includes(lang.value)}
                      onChange={() => handleLanguageToggle(lang.value)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-slate-700">{lang.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </Card>

          {/* Configurações de Rate Limiting */}
          <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Controle de Submissões</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Máx. Submissões por Minuto
                </label>
                <Input
                  type="number"
                  value={configJudge.maxSubmissoesPorMinuto}
                  onChange={e => setConfigJudge(prev => ({
                    ...prev,
                    maxSubmissoesPorMinuto: parseInt(e.target.value)
                  }))}
                  className="h-12 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
                />
              </div>
              
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Tamanho Máx. do Arquivo (MB)
                </label>
                <Input
                  type="number"
                  value={configJudge.maxTamanhoArquivo}
                  onChange={e => setConfigJudge(prev => ({
                    ...prev,
                    maxTamanhoArquivo: parseInt(e.target.value)
                  }))}
                  className="h-12 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
                />
              </div>
            </div>
          </Card>

          {/* Teste de Conexão */}
          <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Diagnósticos</h3>
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
              <div className="flex gap-4">
                <Button 
                  onClick={testarConexaoJudge} 
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Testar Conexão com Judge
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tabAtiva === 'notificacoes' && (
        <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Configurações de Notificação</h3>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
              <label className="flex items-center space-x-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificacoes.emailSubmissao}
                  onChange={e => setNotificacoes(prev => ({
                    ...prev,
                    emailSubmissao: e.target.checked
                  }))}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-900">
                    Email para Novas Submissões
                  </span>
                  <p className="text-sm text-slate-600 mt-1">
                    Receba emails quando estudantes fizerem submissões
                  </p>
                </div>
              </label>
            </div>

            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
              <label className="flex items-center space-x-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificacoes.emailNovaLista}
                  onChange={e => setNotificacoes(prev => ({
                    ...prev,
                    emailNovaLista: e.target.checked
                  }))}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-900">
                    Email para Novas Listas Publicadas
                  </span>
                  <p className="text-sm text-slate-600 mt-1">
                    Notifique estudantes quando publicar novas listas
                  </p>
                </div>
              </label>
            </div>

            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
              <label className="flex items-center space-x-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificacoes.emailDeadline}
                  onChange={e => setNotificacoes(prev => ({
                    ...prev,
                    emailDeadline: e.target.checked
                  }))}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-900">
                    Lembrete de Deadline
                  </span>
                  <p className="text-sm text-slate-600 mt-1">
                    Lembrete automático 24h antes do prazo das listas
                  </p>
                </div>
              </label>
            </div>

            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
              <label className="flex items-center space-x-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificacoes.pushNotifications}
                  onChange={e => setNotificacoes(prev => ({
                    ...prev,
                    pushNotifications: e.target.checked
                  }))}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-900">
                    Notificações Push
                  </span>
                  <p className="text-sm text-slate-600 mt-1">
                    Ativar notificações push no navegador
                  </p>
                </div>
              </label>
            </div>
          </div>
        </Card>
      )}

      {tabAtiva === 'manutencao' && (
        <div className="space-y-6">
          <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Ferramentas de Manutenção</h3>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Limpar Cache do Sistema</h4>
                    <p className="text-sm text-slate-600">Remove dados em cache para melhorar performance</p>
                  </div>
                  <Button 
                    onClick={limparCache} 
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Limpar Cache
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Backup do Banco de Dados</h4>
                    <p className="text-sm text-slate-600">Gera backup completo do banco de dados</p>
                  </div>
                  <Button 
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Gerar Backup
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Verificar Integridade</h4>
                    <p className="text-sm text-slate-600">Verifica a integridade dos dados do sistema</p>
                  </div>
                  <Button 
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verificar
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
