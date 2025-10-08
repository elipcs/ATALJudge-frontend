import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePasswordValidation } from "./usePasswordValidation";

export function useResetPassword(token: string | null) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isValid,
    getValidationError,
  } = usePasswordValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = getValidationError();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      
      if (!res.ok) {
        throw new Error("Erro ao redefinir senha");
      }
      
      setSuccess("Senha redefinida com sucesso!");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || "Erro ao redefinir senha");
    } finally {
      setLoading(false);
    }
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    success,
    loading,
    isValid,
    handleSubmit,
  };
}
