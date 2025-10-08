import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, setTokens } from '../services/auth';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    setError('');
    setLoading(true);
    
    try {
      const { accessToken, refreshToken } = await login(email, password);
      
      // Salvar tokens e redirecionar
      setTokens(accessToken, refreshToken);
      router.push("/home");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao autenticar";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleLogin,
    loading,
    error,
    setError
  };
}
