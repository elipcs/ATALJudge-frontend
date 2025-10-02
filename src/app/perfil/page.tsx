"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import PageHeader from "../../components/PageHeader";
import { useUserRole } from "../../hooks/useUserRole";
import { profileApi, ProfileData, UpdateProfileData, ChangePasswordData } from "../../services/profile";
import { translateUserRole, getRoleColor } from "../../utils/roleTranslations";



export default function PerfilPage() {
  const router = useRouter();
  const { userRole, isLoading: isLoadingRole } = useUserRole();
  const [usuario, setUsuario] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('perfil');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [buttonSuccess, setButtonSuccess] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await profileApi.getProfile();
      
      const profileData = (response as { data?: ProfileData }).data || response;
      
      setUsuario(profileData);
    } catch (error) {
      console.error('PerfilPage: Erro ao carregar dados:', error);
      if (error instanceof Error && (error.message.includes('Não autorizado') || error.message.includes('Token expirado'))) {
        router.push('/login');
        return;
      }
      
      // Verificar se é erro de conexão com o backend
      if (error instanceof Error && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.message.includes('fetch')
      )) {
        setError('Erro de conexão: Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:5000');
      } else {
        setError('Erro ao carregar dados do perfil. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);


  useEffect(() => {
    // Definir título da página
    document.title = "Meu Perfil | AtalJudge";
  }, []);

  useEffect(() => {    // Wait for userRole loading before loading data
    if (!isLoadingRole && userRole) {
      loadData();
    }
  }, [userRole, isLoadingRole, loadData]);


  async function saveProfile() {
    if (!usuario) {
      return;
    }

    if (!usuario.name || usuario.name.trim().length === 0) {
      setError('O nome é obrigatório');
      return;
    }

    if (usuario.name.trim().length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres');
      return;
    }

    // Specific validation for students
    if (usuario.role === 'student') {
      if (!usuario.student_registration || usuario.student_registration.trim().length === 0) {
        setError('A matrícula é obrigatória para estudantes');
        return;
      }
      
      // Validar se a matrícula tem exatamente 9 ou 11 dígitos
      const registrationDigits = usuario.student_registration.replace(/\D/g, ''); // Remove caracteres não numéricos
      if (registrationDigits.length !== 9 && registrationDigits.length !== 11) {
        setError('A matrícula deve ter exatamente 9 ou 11 dígitos');
        return;
      }
    }


    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const updateData: UpdateProfileData = {
        name: usuario.name,
        student_registration: usuario.student_registration
      };

      const response = await profileApi.updateProfile(updateData);
      
      const updatedProfile = (response as { data?: ProfileData }).data || response;
      setUsuario(updatedProfile);

      setButtonSuccess(true);
      setTimeout(() => setButtonSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      if (error instanceof Error && (error.message.includes('Não autorizado') || error.message.includes('Token expirado'))) {
        router.push('/login');
        return;
      }
      
      // Verificar se é erro de conexão com o backend
      if (error instanceof Error && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.message.includes('fetch')
      )) {
        setError('Erro de conexão: Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:5000');
      } else {
        setError(error instanceof Error ? error.message : 'Erro ao salvar perfil. Tente novamente.');
      }
    } finally {
      setSaving(false);
    }
  }


  // Função de validação de senha igual ao cadastro
  function validatePassword(password: string) {
    return {
      minLength: password.length >= 8,
      hasLetters: /[a-zA-Z]/.test(password),
      hasNumbers: /[0-9]/.test(password),
      hasUppercase: /[A-Z]/.test(password)
    };
  }

  async function changePassword() {
    // Validar se a nova senha é diferente da senha atual (primeira validação)
    if (currentPassword && newPassword && currentPassword === newPassword) {
      setError('A nova senha não pode ser igual à senha atual');
      return;
    }

    if (!currentPassword || !newPassword) {
      setError('Preencha todos os campos de senha');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A confirmação da senha não confere');
      return;
    }

    // Validação de senha igual ao cadastro
    const isPasswordValid = validatePassword(newPassword);
    if (!isPasswordValid.minLength) {
      setError("Senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (!isPasswordValid.hasLetters) {
      setError("Senha deve conter letras");
      return;
    }
    if (!isPasswordValid.hasNumbers) {
      setError("Senha deve conter números");
      return;
    }
    if (!isPasswordValid.hasUppercase) {
      setError("Senha deve conter pelo menos 1 letra maiúscula");
      return;
    }

    try {
      setChangingPassword(true);
      setError('');
      setSuccess('');
      
      const changePasswordData: ChangePasswordData = {
        currentPassword: currentPassword,
        newPassword: newPassword,
        userId: usuario?.id
      };

      await profileApi.changePassword(changePasswordData);

      setButtonSuccess(true);
      setTimeout(() => setButtonSuccess(false), 3000);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      if (error instanceof Error && (error.message.includes('Não autorizado') || error.message.includes('Token expirado'))) {
        router.push('/login');
        return;
      }
      
      // Verificar se é erro de conexão com o backend
      if (error instanceof Error && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.message.includes('fetch')
      )) {
        setError('Erro de conexão: Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:5000');
      } else {
        // Mostrar a mensagem específica do backend
        const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar senha';
        setError(errorMessage);
      }
    } finally {
      setChangingPassword(false);
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 2MB');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const response = await profileApi.uploadAvatar(file);
      const result = (response as { data?: { avatarUrl: string } }).data || response;
      if (usuario) {
        setUsuario({ ...usuario, avatar_url: result.avatarUrl });
        setButtonSuccess(true);
        setTimeout(() => setButtonSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      if (error instanceof Error && (error.message.includes('Não autorizado') || error.message.includes('Token expirado'))) {
        router.push('/login');
        return;
      }
      
      // Verificar se é erro de conexão com o backend
      if (error instanceof Error && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.message.includes('fetch')
      )) {
        setError('Erro de conexão: Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:5000');
      } else {
        setError(error instanceof Error ? error.message : 'Erro ao fazer upload do avatar. Tente novamente.');
      }
    }
  }

  
  if (loading || isLoadingRole) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Carregando perfil...</h1>
            <p className="text-slate-600">Preparando suas informações pessoais</p>
          </div>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-xl shadow-lg border border-red-200 mx-auto mb-6 w-fit">
              <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">
              Erro ao carregar perfil
            </h1>
            <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-lg mx-auto mb-8">
              Não foi possível carregar os dados do seu perfil.
            </p>
            <button
              onClick={loadData}
              className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02] py-3 px-6 rounded-xl"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <PageHeader
        title="Meu Perfil"
        description="Gerencie suas informações pessoais e configurações"
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
        iconColor="purple"
      />



      {/* Tabs */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-2 mb-6">
        <nav className="flex space-x-2">
          {[
            { id: 'perfil', label: 'Informações Pessoais' },
            { id: 'seguranca', label: 'Segurança' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? `shadow-sm border ${
                      usuario.role === 'professor' ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200' :
                      usuario.role === 'student' ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200' :
                      'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200'
                    }`
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'perfil' && (
        <div className="space-y-6">
          {/* Card Principal do Perfil */}
          <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          {/* Avatar */}
              <div className="relative">
                <div className={`w-32 h-32 rounded-3xl shadow-lg overflow-hidden border-4 border-white ${
                  usuario.role === 'professor' ? 'bg-gradient-to-r from-purple-50 to-purple-100' :
                  usuario.role === 'student' ? 'bg-gradient-to-r from-blue-50 to-blue-100' :
                  'bg-gradient-to-r from-green-50 to-green-100'
                }`}>
                  {usuario.avatar_url ? (
                    <Image 
                      src={usuario.avatar_url} 
                      alt="Avatar" 
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-4xl font-bold ${
                      usuario.role === 'professor' ? 'text-purple-600 bg-gradient-to-br from-purple-100 to-purple-200' :
                      usuario.role === 'student' ? 'text-blue-600 bg-gradient-to-br from-blue-100 to-blue-200' :
                      'text-green-600 bg-gradient-to-br from-green-100 to-green-200'
                    }`}>
                      {usuario.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <label className={`absolute -bottom-2 -right-2 text-white p-3 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${
                  usuario.role === 'professor' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                  usuario.role === 'student' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  'bg-gradient-to-r from-green-500 to-green-600'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadAvatar}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Informações Básicas */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-3xl font-bold text-slate-900">{usuario.name || 'Usuário'}</h2>
                  <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${getRoleColor(usuario.role).bg} ${getRoleColor(usuario.role).text} border ${getRoleColor(usuario.role).border}`}>
                    {translateUserRole(usuario.role)}
                  </span>
                </div>
                <p className="text-slate-600 text-lg mb-4">{usuario.email}</p>
                
                {usuario.role === 'student' && usuario.student_registration && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    Matrícula: {usuario.student_registration}
                  </div>
                )}
              </div>

              {/* Informações de Conta */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 text-sm text-slate-600">
                <div className="mb-3">
                  <strong className="text-slate-900">Cadastrado em:</strong><br />
                  {new Date(usuario.created_at).toLocaleDateString('pt-BR', {
                    timeZone: 'America/Sao_Paulo'
                  })}
                </div>
                {usuario.last_login && (
                <div>
                    <strong className="text-slate-900">Último login:</strong><br />
                    {new Date(usuario.last_login).toLocaleString('pt-BR', {
                      timeZone: 'America/Sao_Paulo'
                    })}
                </div>
                )}
              </div>
            </div>
          </Card>

          {/* Formulário de Edição */}
          <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-600 rounded-xl border border-purple-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              </div>
              Editar Informações
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={usuario.name}
                    onChange={e => setUsuario({ ...usuario, name: e.target.value })}
                    className={`h-12 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl ${!usuario.name || usuario.name.trim().length < 2 ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Digite seu nome completo"
                  />
                  {(!usuario.name || usuario.name.trim().length < 2) && (
                    <p className="text-xs text-red-500 mt-2">Nome é obrigatório (mínimo 2 caracteres)</p>
                  )}
                </div>
                
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Email</label>
                  <Input
                    value={usuario.email}
                    disabled
                    className="h-12 bg-slate-100 text-slate-500 rounded-xl"
                  />
                  <p className="text-xs text-slate-500 mt-2">O email não pode ser alterado</p>
                </div>
              </div>

              {usuario.role === 'student' && (
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Matrícula <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={usuario.student_registration || ''}
                    onChange={e => setUsuario({ ...usuario, student_registration: e.target.value })}
                    placeholder="Digite sua matrícula (9 ou 11 dígitos)"
                    className={`h-12 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl ${
                      !usuario.student_registration || 
                      usuario.student_registration.trim().length === 0 ||
                      (usuario.student_registration.replace(/\D/g, '').length !== 9 && usuario.student_registration.replace(/\D/g, '').length !== 11)
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : ''
                    }`}
                  />
                  {(!usuario.student_registration || 
                    usuario.student_registration.trim().length === 0 ||
                    (usuario.student_registration.replace(/\D/g, '').length !== 9 && usuario.student_registration.replace(/\D/g, '').length !== 11)) && (
                    <p className="text-xs text-red-500 mt-2">Matrícula deve ter exatamente 9 ou 11 dígitos</p>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={() => {
                    saveProfile();
                  }} 
                  disabled={
                    saving || 
                    !usuario.name || 
                    usuario.name.trim().length < 2 || 
                    (usuario.role === 'student' && (
                      !usuario.student_registration || 
                      usuario.student_registration.trim().length === 0 ||
                      (usuario.student_registration.replace(/\D/g, '').length !== 9 && usuario.student_registration.replace(/\D/g, '').length !== 11)
                    ))
                  } 
                  className={`shadow-sm hover:shadow-md font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none px-8 py-3 rounded-xl ${
                    buttonSuccess 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-600' 
                      : usuario.role === 'professor' ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200' :
                        usuario.role === 'student' ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200' :
                        'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200'
                  }`}
                >
                  {saving ? (
                    <>
                      <div className={`animate-spin rounded-full h-4 w-4 border-2 border-t-transparent mr-2 ${
                        usuario.role === 'professor' ? 'border-purple-600' :
                        usuario.role === 'student' ? 'border-blue-600' :
                        'border-green-600'
                      }`}></div>
                      Salvando...
                    </>
                  ) : buttonSuccess ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Salvo com Sucesso!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Salvar Alterações
                    </>
                  )}
                </Button>
                </div>
            </div>
          </Card>
        </div>
      )}


      {activeTab === 'seguranca' && (
        <div className="space-y-6">

          <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className={`p-3 rounded-xl border ${
                usuario.role === 'professor' ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-600 border-purple-200' :
                usuario.role === 'student' ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 border-blue-200' :
                'bg-gradient-to-r from-green-50 to-green-100 text-green-600 border-green-200'
              }`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-900">Alterar Senha</h4>
                <p className="text-slate-600">Mantenha sua conta segura com uma senha forte</p>
              </div>
        </div>

            <div className="space-y-6 max-w-4xl">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-slate-900 mb-3">Senha Atual</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}  
                  placeholder="Digite sua senha atual"
                  className="h-12 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
              />
            </div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Nova Senha</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                    className="h-12 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
                />
                  <p className="text-xs text-slate-500 mt-2">Mínimo de 8 caracteres, com letras, números e pelo menos 1 maiúscula</p>
              </div>
              
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Confirmar Nova Senha</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    className="h-12 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
                />
              </div>
              </div>

              <Button 
                onClick={changePassword} 
                disabled={changingPassword}
                className={`w-full shadow-sm hover:shadow-md font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none py-3 rounded-xl ${
                  buttonSuccess 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-600' 
                    : usuario.role === 'professor' ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200' :
                      usuario.role === 'student' ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200' :
                      'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200'
                }`}
              >
                {changingPassword ? (
                  <>
                    <div className={`animate-spin rounded-full h-4 w-4 border-2 border-t-transparent mr-2 ${
                      usuario.role === 'professor' ? 'border-purple-600' :
                      usuario.role === 'student' ? 'border-blue-600' :
                      'border-green-600'
                    }`}></div>
                    Alterando...
                  </>
                ) : buttonSuccess ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Senha Alterada!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Alterar Senha
                  </>
                )}
            </Button>
          </div>
        </Card>
        </div>
      )}

      
      {/* Toast de Erro - Parte Inferior da Tela */}
      {error && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
