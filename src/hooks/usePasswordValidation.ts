import { useState, useMemo } from "react";

export interface PasswordValidation {
  minLength: boolean;
  hasLetters: boolean;
  hasNumbers: boolean;
  hasUppercase: boolean;
}

export function usePasswordValidation() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validation = useMemo((): PasswordValidation => ({
    minLength: password.length >= 8,
    hasLetters: /[a-zA-Z]/.test(password),
    hasNumbers: /[0-9]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
  }), [password]);

  const isValid = useMemo(() => {
    return validation.minLength && 
           validation.hasLetters && 
           validation.hasNumbers && 
           validation.hasUppercase &&
           password === confirmPassword;
  }, [validation, password, confirmPassword]);

  const getValidationError = (): string | null => {
    if (!validation.minLength) {
      return "Senha deve ter pelo menos 8 caracteres";
    }
    if (!validation.hasLetters) {
      return "Senha deve conter letras";
    }
    if (!validation.hasNumbers) {
      return "Senha deve conter números";
    }
    if (!validation.hasUppercase) {
      return "Senha deve conter pelo menos 1 letra maiúscula";
    }
    if (password !== confirmPassword) {
      return "As senhas não coincidem";
    }
    return null;
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    validation,
    isValid,
    getValidationError,
  };
}
