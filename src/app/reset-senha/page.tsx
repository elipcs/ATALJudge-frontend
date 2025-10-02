"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { AuthLayout, AuthForm, AuthInput, AlertMessage, AuthFooter, PasswordValidation } from "../../components/auth";
import { Button } from "../../components/ui/button";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  function validatePassword(password: string) {
    return {
      minLength: password.length >= 8,
      hasLetters: /[a-zA-Z]/.test(password),
      hasNumbers: /[0-9]/.test(password),
      hasUppercase: /[A-Z]/.test(password)
    };
  }

  const passwordValidation = validatePassword(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validations
    if (!passwordValidation.minLength) {
      setError("Senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (!passwordValidation.hasLetters) {
      setError("Senha deve conter letras");
      return;
    }
    if (!passwordValidation.hasNumbers) {
      setError("Senha deve conter números");
      return;
    }
    if (!passwordValidation.hasUppercase) {
      setError("Senha deve conter pelo menos 1 letra maiúscula");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) throw new Error("Erro ao redefinir senha");
      setSuccess("Senha redefinida com sucesso!");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || "Erro ao redefinir senha");
    } finally {
      setLoading(false);
    }
  }

  const resetIcon = (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="white" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  // Success State
  if (success) {
    return (
      <AuthLayout 
        title="Senha redefinida com sucesso!"
        subtitle="Você será redirecionado para a página de login em alguns segundos..."
        showLogo={false}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <Link href="/login">
            <Button size="lg" className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
              Ir para o login agora
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Redefinir senha"
      subtitle="Digite e confirme sua nova senha para acessar a plataforma"
    >
      <AuthForm
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Redefinir senha"
        submitIcon={resetIcon}
      >
        <div>
          <AuthInput
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={setPassword}
            required
            autoComplete="new-password"
          />
          <PasswordValidation password={password} />
        </div>
        
        <AuthInput
          type="password"
          placeholder="Confirme a nova senha"
          value={confirmPassword}
          onChange={setConfirmPassword}
          required
          autoComplete="new-password"
        />
      </AuthForm>

      <AlertMessage type="error" message={error} />

      <AuthFooter 
        links={[
          { text: "Voltar para Login", href: "/login", variant: "outline" }
        ]}
      />
    </AuthLayout>
  );
}

export default function PasswordResetPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
