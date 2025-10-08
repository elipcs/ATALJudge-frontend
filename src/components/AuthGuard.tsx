"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { checkAuthentication } from "@/services/auth";

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
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Verificar se é uma rota pública
      const isPublicRoute = PUBLIC_ROUTES.some(route => 
        pathname === route || pathname.startsWith(route + '/')
      );

      if (isPublicRoute) {
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }

      // Verificar se é uma rota protegida
      const isProtectedRoute = PROTECTED_ROUTES.some(route => 
        pathname === route || pathname.startsWith(route + '/')
      );

      if (!isProtectedRoute) {
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }

      try {
        // Verificação silenciosa de autenticação
        const isAuth = await checkAuthentication();
        
        if (!isAuth) {
          router.replace("/login");
          return;
        }

        setIsAuthenticated(true);
        setIsChecking(false);
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router, pathname]);

  // Mostrar loading mínimo durante verificação para evitar tela branca
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  // Se não está autenticado, não renderizar nada (redirecionamento já foi feito)
  if (!isAuthenticated) {
    return null;
  }

  // Se está autenticado, renderizar o conteúdo
  return <>{children}</>;
}