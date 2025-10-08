import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired } from '../services/auth';

export function useAuthCheck() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      if (token && !isTokenExpired(token)) {
        router.push("/home");
        return;
      }
      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  return { checkingAuth };
}
