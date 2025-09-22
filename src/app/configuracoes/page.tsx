"use client";
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

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
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoSistema[]>([]);
  const [configJudge, setConfigJudge] = useState<ConfiguracaoJudge>({
    tempoLimiteDefault: 5000,
    memoriaLimiteDefault: 256,
    linguagensHabilitadas: ['python', 'java', 'cpp', 'c'],
    compiladores: {},
    maxSubmissoesPorMinuto: 10,
    maxTamanhoArquivo: 10
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

  const languageOptions = [
    { value: 'python', label: 'Python 3' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'javascript', label: 'JavaScript (Node.js)' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' }
  ];

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const configuracoesPorCategoria = configuracoes.reduce((acc, config) => {
    if (!acc[config.categoria]) acc[config.categoria] = [];
    acc[config.categoria].push(config);
    return acc;
  }, {} as Record<string, ConfiguracaoSistema[]>);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-gray-600">Gerencie as configurações gerais do AtalJudge.</p>
        </div>
        
        <Button onClick={salvarConfiguracoes} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'sistema', label: 'Sistema' },
            { id: 'judge', label: 'Judge Online' },
            { id: 'notificacoes', label: 'Notificações' },
            { id: 'manutencao', label: 'Manutenção' }
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
      {tabAtiva === 'sistema' && (
        <div>
          {Object.entries(configuracoesPorCategoria).map(([categoria, configs]) => (
            <Card key={categoria} className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                {categoria.replace('_', ' ')}
              </h3>
              <div className="space-y-4">
                {configs.map(config => (
                  <div key={config.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {config.chave.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      <p className="text-xs text-gray-500">{config.descricao}</p>
                    </div>
                    
                    <div>
                      {config.tipo === 'boolean' ? (
                        <select
                          value={config.valor}
                          onChange={e => updateConfiguracao(config.id, e.target.value)}
                          disabled={!config.editavel}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
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
                        />
                      ) : (
                        <Input
                          type="text"
                          value={config.valor}
                          onChange={e => updateConfiguracao(config.id, e.target.value)}
                          disabled={!config.editavel}
                        />
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      {config.editavel ? 'Editável' : 'Somente leitura'}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tabAtiva === 'judge' && (
        <div>
          {/* Configurações de Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Limites de Execução</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tempo Limite Padrão (ms)
                </label>
                <Input
                  type="number"
                  value={configJudge.tempoLimiteDefault}
                  onChange={e => setConfigJudge(prev => ({
                    ...prev,
                    tempoLimiteDefault: parseInt(e.target.value)
                  }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Memória Limite Padrão (MB)
                </label>
                <Input
                  type="number"
                  value={configJudge.memoriaLimiteDefault}
                  onChange={e => setConfigJudge(prev => ({
                    ...prev,
                    memoriaLimiteDefault: parseInt(e.target.value)
                  }))}
                />
              </div>
            </div>
          </Card>

          {/* Linguagens Habilitadas */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Linguagens Habilitadas</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {languageOptions.map(lang => (
                <label key={lang.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={configJudge.linguagensHabilitadas.includes(lang.value)}
                    onChange={() => handleLanguageToggle(lang.value)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{lang.label}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Configurações de Rate Limiting */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Controle de Submissões</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Máx. Submissões por Minuto
                </label>
                <Input
                  type="number"
                  value={configJudge.maxSubmissoesPorMinuto}
                  onChange={e => setConfigJudge(prev => ({
                    ...prev,
                    maxSubmissoesPorMinuto: parseInt(e.target.value)
                  }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamanho Máx. do Arquivo (MB)
                </label>
                <Input
                  type="number"
                  value={configJudge.maxTamanhoArquivo}
                  onChange={e => setConfigJudge(prev => ({
                    ...prev,
                    maxTamanhoArquivo: parseInt(e.target.value)
                  }))}
                />
              </div>
            </div>
          </Card>

          {/* Teste de Conexão */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagnósticos</h3>
            <div className="flex gap-4">
              <Button onClick={testarConexaoJudge} variant="outline">
                Testar Conexão com Judge
              </Button>
            </div>
          </Card>
        </div>
      )}

      {tabAtiva === 'notificacoes' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Notificação</h3>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={notificacoes.emailSubmissao}
                onChange={e => setNotificacoes(prev => ({
                  ...prev,
                  emailSubmissao: e.target.checked
                }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Email para Novas Submissões
                </span>
                <p className="text-xs text-gray-500">
                  Receba emails quando estudantes fizerem submissões
                </p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={notificacoes.emailNovaLista}
                onChange={e => setNotificacoes(prev => ({
                  ...prev,
                  emailNovaLista: e.target.checked
                }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Email para Novas Listas Publicadas
                </span>
                <p className="text-xs text-gray-500">
                  Notifique estudantes quando publicar novas listas
                </p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={notificacoes.emailDeadline}
                onChange={e => setNotificacoes(prev => ({
                  ...prev,
                  emailDeadline: e.target.checked
                }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Lembrete de Deadline
                </span>
                <p className="text-xs text-gray-500">
                  Lembrete automático 24h antes do prazo das listas
                </p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={notificacoes.pushNotifications}
                onChange={e => setNotificacoes(prev => ({
                  ...prev,
                  pushNotifications: e.target.checked
                }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Notificações Push
                </span>
                <p className="text-xs text-gray-500">
                  Ativar notificações push no navegador
                </p>
              </div>
            </label>
          </div>
        </Card>
      )}

      {tabAtiva === 'manutencao' && (
        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ferramentas de Manutenção</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Limpar Cache do Sistema</h4>
                  <p className="text-xs text-gray-500">Remove dados em cache para melhorar performance</p>
                </div>
                <Button onClick={limparCache} variant="outline">Limpar Cache</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Backup do Banco de Dados</h4>
                  <p className="text-xs text-gray-500">Gera backup completo do banco de dados</p>
                </div>
                <Button variant="outline">Gerar Backup</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Verificar Integridade</h4>
                  <p className="text-xs text-gray-500">Verifica a integridade dos dados do sistema</p>
                </div>
                <Button variant="outline">Verificar</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
