"use client";

import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import { useUserRole } from "../../hooks/useUserRole";
import PageLoading from "../../components/PageLoading";
import { Checkbox } from "../../components/ui/checkbox";
import { Button } from "../../components/ui/button";

interface SystemReset {
  resetSubmissions: boolean;
  resetStudents: boolean;
  resetClasses: boolean;
  resetLists: boolean;
  resetMonitors: boolean;
  resetProfessors: boolean;
  resetInvites: boolean;
  confirmationText: string;
}

interface AllowedIP {
  id: string;
  ip: string;
  description: string;
  active: boolean;
  createdAt: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  studentRegistration: string;
  classId: string;
  className: string;
  submissionsCount: number;
}

export default function ConfiguracoesPage() {
  const { userRole, isLoading } = useUserRole();
  
  const [activeTab, setActiveTab] = useState('reset');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [buttonSuccess, setButtonSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [systemReset, setSystemReset] = useState<SystemReset>({
    resetSubmissions: false,
    resetStudents: false,
    resetClasses: false,
    resetLists: false,
     resetMonitors: false,
     resetProfessors: false,
     resetInvites: false,
     confirmationText: ''
  });

  const [allowedIPs, setAllowedIPs] = useState<AllowedIP[]>([]);
  const [newIP, setNewIP] = useState({ ip: '', description: '' });

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    loadData();
  }, [activeTab]);

  if (!isLoading && userRole !== 'professor') {
    window.location.href = '/nao-autorizado';
    return null;
  }

  const loadData = async () => {
    if (activeTab === 'ips') {
      await loadAllowedIPs();
    } else if (activeTab === 'students') {
      await loadStudents();
    }
  };

  const loadAllowedIPs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/config/allowed-ips');
      if (response.ok) {
        const data = await response.json();
        setAllowedIPs(data.allowedIPs || []);
      }
    } catch (error) {
      setError('Erro ao carregar IPs permitidos');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/config/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      setError('Erro ao carregar estudantes');
    } finally {
      setLoading(false);
    }
  };

  const performSystemReset = async () => {
    if (systemReset.confirmationText !== 'RESETAR') {
      setError('Digite "RESETAR" para confirmar a operação');
      return;
    }

    try {
      setSaving(true);
      setButtonSuccess(false);
      
      const response = await fetch('/api/config/system-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetSubmissions: systemReset.resetSubmissions,
          resetStudents: systemReset.resetStudents,
          resetClasses: systemReset.resetClasses,
            resetLists: systemReset.resetLists,
            resetMonitors: systemReset.resetMonitors,
            resetProfessors: systemReset.resetProfessors,
            resetInvites: systemReset.resetInvites
        })
      });

      if (response.ok) {
        setButtonSuccess(true);
        setSuccess('Reset do sistema realizado com sucesso!');
        setSystemReset({
          resetSubmissions: false,
          resetStudents: false,
          resetClasses: false,
          resetLists: false,
         resetMonitors: false,
         resetProfessors: false,
         resetInvites: false,
         confirmationText: ''
        });
        
        setTimeout(() => setButtonSuccess(false), 3000);
      } else {
        throw new Error('Erro ao realizar reset do sistema');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao realizar reset');
    } finally {
      setSaving(false);
    }
  };

  const addAllowedIP = async () => {
    if (!newIP.ip || !newIP.description) {
      setError('Preencha o IP e a descrição');
      return;
    }

    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(newIP.ip)) {
      setError('Formato de IP inválido');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/config/allowed-ips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIP)
      });

      if (response.ok) {
        setSuccess('IP adicionado com sucesso!');
        setNewIP({ ip: '', description: '' });
        await loadAllowedIPs();
      } else {
        throw new Error('Erro ao adicionar IP');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao adicionar IP');
    } finally {
      setSaving(false);
    }
  };

  const toggleIP = async (id: string) => {
    try {
      const response = await fetch(`/api/config/allowed-ips/${id}/toggle`, {
        method: 'PUT'
      });

      if (response.ok) {
        await loadAllowedIPs();
      } else {
        throw new Error('Erro ao alterar status do IP');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao alterar status');
    }
  };

  const removeIP = async (id: string) => {
    try {
      const response = await fetch(`/api/config/allowed-ips/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('IP removido com sucesso!');
        await loadAllowedIPs();
      } else {
        throw new Error('Erro ao remover IP');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao remover IP');
    }
  };

  const removeSelectedStudents = async () => {
    if (selectedStudents.length === 0) {
      setError('Selecione pelo menos um estudante');
      return;
    }

    try {
      setSaving(true);
      setButtonSuccess(false);
      
      const response = await fetch('/api/config/remove-students', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: selectedStudents })
      });

      if (response.ok) {
        setButtonSuccess(true);
        setSuccess(`${selectedStudents.length} estudante(s) removido(s) com sucesso!`);
        setSelectedStudents([]);
        await loadStudents();
        
        setTimeout(() => setButtonSuccess(false), 3000);
      } else {
        throw new Error('Erro ao remover estudantes');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao remover estudantes');
    } finally {
      setSaving(false);
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentRegistration.includes(searchTerm) ||
    student.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <PageLoading 
        message="Carregando configurações..." 
        description="Preparando as configurações do sistema" 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 p-6">
      <PageHeader
        title="Configurações do Sistema"
        description="Gerencie configurações avançadas do AtalJudge"
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
        iconColor="gray"
      />

      {/* Tabs Navigation */}
  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-2 mb-6">
        <nav className="flex space-x-2">
          {[
            { id: 'reset', label: 'Reset do Sistema' },
            { id: 'ips', label: 'IPs Permitidos' },
            { id: 'students', label: 'Gerenciar Estudantes' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-slate-200 to-slate-100 text-slate-900 border border-slate-300 shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* System Reset Tab */}
      {activeTab === 'reset' && (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Reset do Sistema
          </h3>
          
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-slate-800 font-semibold">Atenção: Esta operação não pode ser desfeita!</span>
            </div>
            <p className="text-slate-700">
              O reset do sistema irá remover permanentemente os dados selecionados. 
              Certifique-se de ter um backup antes de continuar.
            </p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-slate-600">
              Selecione os dados que deseja remover do sistema.
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSystemReset(prev => ({
                    ...prev,
                    resetSubmissions: true,
                    resetStudents: true,
                    resetClasses: true,
                    resetLists: true,
                    resetMonitors: true,
                    resetProfessors: true,
                    resetInvites: true,
                  }))
                }}
                className="text-xs"
              >
                Reset completo do sistema
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSystemReset(prev => ({
                    ...prev,
                    resetSubmissions: false,
                    resetStudents: false,
                    resetClasses: false,
                    resetLists: false,
                    resetMonitors: false,
                    resetProfessors: false,
                    resetInvites: false,
                  }))
                }}
                className="text-xs"
              >
                Limpar seleção
              </Button>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {[
              { key: 'resetSubmissions', label: 'Submissões', description: 'Remove todas as submissões dos estudantes' },
              { key: 'resetStudents', label: 'Estudantes', description: 'Remove todos os estudantes cadastrados' },
              { key: 'resetClasses', label: 'Turmas', description: 'Remove todas as turmas criadas' },
                { key: 'resetLists', label: 'Listas de Exercícios', description: 'Remove todas as listas de exercícios' },
                { key: 'resetMonitors', label: 'Monitores', description: 'Remove todos os monitores cadastrados' },
                { key: 'resetProfessors', label: 'Outros Professores', description: 'Remove todos os outros professores (exceto você)' },
                { key: 'resetInvites', label: 'Convites', description: 'Remove todos os convites pendentes e expirados' }
            ].map(item => (
              <div key={item.key} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4">
                <label className="flex items-center space-x-4 cursor-pointer">
                  <Checkbox
                    variant="danger"
                    checked={systemReset[item.key as keyof SystemReset] as boolean}
                    onChange={e => setSystemReset(prev => ({
                      ...prev,
                      [item.key]: e.target.checked
                    }))}
                    className=""
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                </label>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Confirmação: Digite "RESETAR" para confirmar
            </label>
            <input
              type="text"
              value={systemReset.confirmationText}
              onChange={e => setSystemReset(prev => ({
                ...prev,
                confirmationText: e.target.value
              }))}
              className="w-full h-12 px-4 bg-white border-slate-300 focus:border-slate-400 focus:ring-slate-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
              placeholder="Digite RESETAR para confirmar"
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={performSystemReset}
              disabled={saving || systemReset.confirmationText !== 'RESETAR'}
              variant={buttonSuccess ? "default" : "secondary"}
              size="lg"
              className={`gap-3 ${!buttonSuccess && !saving ? 'bg-slate-800 hover:bg-slate-700 text-white' : ''}`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Executando Reset...
                </>
              ) : buttonSuccess ? (
                <>
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Reset Concluído!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="white" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Executar Reset do Sistema
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Allowed IPs Tab */}
      {activeTab === 'ips' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Adicionar Novo IP
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Endereço IP
                </label>
                <input
                  type="text"
                  value={newIP.ip}
                  onChange={e => setNewIP(prev => ({ ...prev, ip: e.target.value }))}
                  className="w-full h-12 px-4 bg-white border-slate-300 focus:border-slate-400 focus:ring-slate-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
                  placeholder="192.168.1.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={newIP.description}
                  onChange={e => setNewIP(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-12 px-4 bg-white border-slate-300 focus:border-slate-400 focus:ring-slate-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
                  placeholder="Laboratório da universidade"
                />
              </div>
            </div>

            <Button
              onClick={addAllowedIP}
              disabled={saving}
              variant="secondary"
              size="lg"
              className={`gap-3 ${!saving ? 'bg-slate-800 hover:bg-slate-700 text-white' : ''}`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Adicionando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="white" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Adicionar IP
                </>
              )}
            </Button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">IPs Cadastrados</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-slate-600">Carregando IPs...</p>
              </div>
            ) : allowedIPs.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-slate-600">Nenhum IP cadastrado ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allowedIPs.map(ip => (
                  <div key={ip.id} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-slate-900">{ip.ip}</span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          ip.active 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {ip.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{ip.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Adicionado em {new Date(ip.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => toggleIP(ip.id)}
                        variant={ip.active ? "outline" : "default"}
                        size="sm"
                        className="text-xs"
                      >
                        {ip.active ? 'Desativar' : 'Ativar'}
                      </Button>
                      
                      <Button
                        onClick={() => removeIP(ip.id)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Students Management Tab */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Gerenciar Estudantes
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Buscar Estudantes
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-12 px-4 bg-white border-slate-300 focus:border-slate-400 focus:ring-slate-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
                placeholder="Busque por nome, email, matrícula ou turma..."
              />
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-slate-600">Carregando estudantes...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-slate-600">Nenhum estudante encontrado</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {filteredStudents.map(student => (
                  <div key={student.id} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4">
                    <label className="flex items-center space-x-4 cursor-pointer">
                      <Checkbox
                        variant="danger"
                        checked={selectedStudents.includes(student.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedStudents(prev => [...prev, student.id]);
                          } else {
                            setSelectedStudents(prev => prev.filter(id => id !== student.id));
                          }
                        }}
                        className=""
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-900">{student.name}</span>
                            <span className="ml-3 text-sm text-slate-600">({student.studentRegistration})</span>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
                            {student.submissionsCount} submissões
                          </span>
                        </div>
                        <div className="flex gap-4 mt-1 text-sm text-slate-600">
                          <span>{student.email}</span>
                          <span>•</span>
                          <span>Turma: {student.className}</span>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {selectedStudents.length > 0 && (
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-semibold">
                    {selectedStudents.length} estudante(s) selecionado(s) para remoção
                  </span>
                  <Button
                    onClick={removeSelectedStudents}
                    disabled={saving}
                    variant={buttonSuccess ? "default" : "secondary"}
                    size="default"
                    className="gap-3"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                        Removendo...
                      </>
                    ) : buttonSuccess ? (
                      <>
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Removidos!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remover Selecionados
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 bg-slate-700 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {error}
            </div>
            <button onClick={clearError} className="ml-4 hover:bg-slate-600 rounded p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </div>
            <button onClick={clearSuccess} className="ml-4 hover:bg-green-600 rounded p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
