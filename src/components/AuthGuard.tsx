"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { getToken, getRefreshToken, isTokenExpired, refreshAccessToken } from "@/services/auth";
import AuthLoadingTimeout from "./AuthLoadingTimeout";

interface AuthGuardProps {
  children: React.ReactNode;
}

// Rotas que requerem autenticação (mesmas que usam barra de navegação)
const PROTECTED_ROUTES = [
  '/home',
  '/turmas',
  '/listas',
  '/convites',
  '/submissoes',
  '/configuracoes',
  '/perfil'
];

// Rotas públicas (não requerem autenticação)
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/cadastro',
  '/esqueci-senha',
  '/reset-senha',
  '/not-found',
  '/api' // Rotas da API também são públicas
];

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Verificar se é uma rota pública imediatamente
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  const [isChecking, setIsChecking] = useState(!isPublicRoute);
  const [isAuthenticated, setIsAuthenticated] = useState(isPublicRoute);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (isPublicRoute) {
        return;
      }

      const isProtectedRoute = PROTECTED_ROUTES.some(route => 
        pathname === route || pathname.startsWith(route + '/')
      );

      if (!isProtectedRoute) {
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }

      // Criar timeout para verificação de autenticação
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: Verificação de autenticação demorou muito'));
        }, 10000);
      });

      const authPromise = async (): Promise<boolean> => {
        const token = getToken();
        const refreshToken = getRefreshToken();

        if (!token && !refreshToken) {
          return false;
        }

        if (token) {
          if (isTokenExpired(token)) {
            if (refreshToken) {
              const newToken = await refreshAccessToken();
              return !!newToken;
            } else {
              return false;
            }
          } else {
            return true;
          }
        } else if (refreshToken) {
          const newToken = await refreshAccessToken();
          return !!newToken;
        }

        return false;
      };

      try {
        // Executar verificação com timeout
        const isAuth = await Promise.race([authPromise(), timeoutPromise]);
        
        if (!isAuth) {
          router.replace("/login");
          return;
        }

        setIsAuthenticated(true);
        setIsChecking(false);
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        setHasTimedOut(true);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, pathname, isPublicRoute]);

  // Mostrar timeout se ocorreu
  if (hasTimedOut) {
    return (
      <AuthLoadingTimeout
        timeoutMs={10000}
        message="Timeout na verificação de autenticação"
        onTimeout={() => router.push("/login")}
      />
    );
  }

  // Mostrar loading durante verificação
  if (isChecking) {
    return (
      <AuthLoadingTimeout
        timeoutMs={10000}
        message="Verificando autenticação..."
      />
    );
  }

  // Se não está autenticado, não renderizar nada (redirecionamento já foi feito)
  if (!isAuthenticated) {
    return null;
  }

  // Se está autenticado, renderizar o conteúdo
  return <>{children}</>;
}
