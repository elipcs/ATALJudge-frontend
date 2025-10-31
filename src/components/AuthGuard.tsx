"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { authApi } from "@/services/auth";
import { logger } from "@/utils/logger";

interface AuthGuardProps {
  children: React.ReactNode;
}

const PROTECTED_ROUTES = [
  '/home',
  '/turmas',
  '/listas',
  '/convites',
  '/submissoes',
  '/configuracoes',
  '/perfil'
];

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/cadastro',
  '/esqueci-senha',
  '/reset-senha',
  '/not-found',
  '/api'
];

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      logger.debug('Verificando autenticação', { pathname });
      
      const isPublicRoute = PUBLIC_ROUTES.some(route => 
        pathname === route || pathname.startsWith(route + '/')
      );

      if (isPublicRoute) {
        logger.debug('Rota pública, permitindo acesso');
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }

      const isProtectedRoute = PROTECTED_ROUTES.some(route => 
        pathname === route || pathname.startsWith(route + '/')
      );

      if (!isProtectedRoute) {
        logger.debug('Rota não protegida, permitindo acesso');
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }

      logger.debug('Rota protegida, verificando autenticação');
      
      try {
        const isAuth = await authApi.checkAuthentication();
        logger.debug('Resultado da verificação', { isAuth });
        
        if (!isAuth) {
          logger.info('Não autenticado, redirecionando para /login');
          setIsChecking(false);
          router.replace("/login");
          return;
        }

        logger.debug('Autenticado com sucesso');
        setIsAuthenticated(true);
        setIsChecking(false);
      } catch (error) {
        logger.error('Erro na verificação de autenticação', { error });
        setIsChecking(false);
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}