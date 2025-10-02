"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthLayout, AuthForm, AuthInput, AlertMessage, AuthFooter } from "../../components/auth";
import { setTokens, getToken, isTokenExpired } from "../../services/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      if (token && !isTokenExpired(token)) {
        // Usuário já autenticado, redirecionar para home
        router.push("/home");
        return;
      }
      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const requestBody = { email, password };
      
      const res = await fetch('/api/auth/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Credenciais inválidas");
      }
      const data = await res.json();
      
      // Salvar tanto o access token quanto o refresh token
      if (data.access_token) {
        setTokens(data.access_token, data.refresh_token || "");
        router.push("/home");
      } else if (data.token) {
        // Fallback para compatibilidade com backend antigo
        setTokens(data.token, data.refresh_token || "");
        router.push("/home");
      } else {
        throw new Error("Token não recebido do servidor");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao autenticar";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const loginIcon = (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  );

  // Não mostrar nada enquanto verifica autenticação
  if (checkingAuth) {
    return null;
  }

  return (
    <AuthLayout 
      title="Entrar na plataforma"
      subtitle="Acesse sua conta para continuar"
    >
      <AuthForm
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Entrar"
        submitIcon={loginIcon}
      >
        <AuthInput
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
        />
        
        <AuthInput
          type="password"
          placeholder="Senha"
          value={password}
          onChange={setPassword}
          required
          autoComplete="current-password"
        />
      </AuthForm>

      <AlertMessage type="error" message={error} />

      <AuthFooter 
        links={[
          { text: "Esqueci minha senha", href: "/esqueci-senha" },
          { text: "Criar conta", href: "/cadastro" }
        ]}
      />
    </AuthLayout>
  );
}
