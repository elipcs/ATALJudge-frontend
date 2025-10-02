"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

import { AuthLayout, RegistrationForm, TokenValidation, AlertMessage, AuthFooter } from "../../components/auth";
import { getToken, isTokenExpired } from "../../services/auth";

interface TokenInfo {
  role: 'student' | 'assistant' | 'professor';
  class_id?: string;
  class_name?: string;
  professor?: string;
  valid: boolean;
  expires: string;
}

function UserRegistrationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string>("");
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [error, setError] = useState("");
  const [isRegistrationFinished, setIsRegistrationFinished] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Inicializar estado sem verificar autenticação
  useEffect(() => {
    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  function validatePassword(password: string) {
    return {
      minLength: password.length >= 8,
      hasLetters: /[a-zA-Z]/.test(password),
      hasNumbers: /[0-9]/.test(password),
      hasUppercase: /[A-Z]/.test(password)
    };
  }

  async function handleSubmit(formData: {
    name: string;
    email: string;
    studentRegistration?: string;
    password: string;
    confirmPassword: string;
  }) {
    setError("");

    if (!formData.name.trim()) {
      setError("Nome é obrigatório");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email é obrigatório");
      return;
    }
    if (tokenInfo?.role === 'student' && !formData.studentRegistration?.trim()) {
      setError("Matrícula é obrigatória");
      return;
    }
    
    if (tokenInfo?.role === 'student' && formData.studentRegistration?.trim()) {
      const studentRegistrationNumeric = formData.studentRegistration.replace(/\D/g, '');
      if (studentRegistrationNumeric.length !== 9 && studentRegistrationNumeric.length !== 11) {
        setError("Matrícula deve ter exatamente 9 ou 11 dígitos");
        return;
      }
    }
    
    const isPasswordValid = validatePassword(formData.password);
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
    
    if (formData.password !== formData.confirmPassword) {
      setError("Senhas não conferem");
      return;
    }

    try {      
      const requestBody = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: tokenInfo?.role,
        student_registration: formData.studentRegistration,
        class_id: tokenInfo?.class_id
      };
           
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro ao realizar cadastro");
        return;
      }
      
      setIsRegistrationFinished(true);
      
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            router.push('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch {
      setError("Erro ao realizar cadastro");
    }
  }

  const getRoleTitle = () => {
    switch (tokenInfo?.role) {
      case 'student': return 'Cadastro de Aluno';
      case 'assistant': return 'Cadastro de Monitor';
      case 'professor': return 'Cadastro de Professor';
      default: return 'Cadastro';
    }
  };

  if (isRegistrationFinished) {
    return (
      <AuthLayout 
        title="Cadastro Realizado!"
        subtitle={`Seu cadastro foi concluído com sucesso. Você será redirecionado automaticamente para a página de login em ${countdown} segundo${countdown !== 1 ? 's' : ''}...`}
        showLogo={false}
      >
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold animate-bounce">
              {countdown}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Próximos Passos:</h3>
              <ul className="text-sm text-green-700 space-y-1 text-left">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Faça login com suas credenciais
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Explore a plataforma ATAL JUDGE
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Comece a resolver exercícios
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => router.push('/login')} 
                className="flex-1 h-11 rounded-md bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Ir para Login Agora
              </button>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Não mostrar nada enquanto verifica autenticação
  if (checkingAuth) {
    return null;
  }

  return (
    <TokenValidation 
      token={token} 
      onTokenValidated={setTokenInfo}
    >
      <AuthLayout 
        title={getRoleTitle()}
        subtitle="Preencha os dados abaixo para finalizar seu cadastro"
      >
        <RegistrationForm
          onSubmit={handleSubmit}
          tokenInfo={tokenInfo || undefined}
        />

        <AlertMessage type="error" message={error} />

        <AuthFooter 
          links={[
            { text: "Já possui conta? Fazer login", href: "/login" }
          ]}
        />
      </AuthLayout>
    </TokenValidation>
  );
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={null}>
      <UserRegistrationForm />
    </Suspense>
  );
}