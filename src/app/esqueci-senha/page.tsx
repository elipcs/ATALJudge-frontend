"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthLayout, AuthForm, AuthInput, AlertMessage, AuthFooter } from "../../components/auth";
import { getToken, isTokenExpired } from "../../services/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
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
    setMessage("");
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Erro ao solicitar recuperação");
      setMessage("Se o e-mail existir, você receberá instruções para redefinir a senha.");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao solicitar recuperação";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const sendIcon = (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  // Não mostrar nada enquanto verifica autenticação
  if (checkingAuth) {
    return null;
  }

  return (
    <AuthLayout 
      title="Recuperar senha"
      subtitle="Informe seu e-mail para receber o link de redefinição"
    >
      <AuthForm
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Enviar link de recuperação"
        submitIcon={sendIcon}
      >
        <AuthInput
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
        />
      </AuthForm>

      <AlertMessage type="success" message={message} />
      <AlertMessage type="error" message={error} />

      <AuthFooter 
        links={[
          { text: "Voltar para Login", href: "/login", variant: "outline" }
        ]}
      />
    </AuthLayout>
  );
}
