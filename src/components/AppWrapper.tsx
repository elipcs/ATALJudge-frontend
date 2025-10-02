'use client';

import { usePathname } from 'next/navigation';

import UniversalLayout from '@/components/UniversalLayout';
import { UserRoleProvider } from '@/contexts/UserRoleContext';
import AuthGuard from '@/components/AuthGuard';

// Páginas que devem ter layout de navegação
const PROTECTED_ROUTES = [
  '/turmas',
  '/listas',
  '/convites',
  '/submissoes',
  '/configuracoes',
  '/perfil',
  '/home'
];

// Páginas que NÃO devem ter layout de navegação
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/login',
  '/cadastro',
  '/esqueci-senha',
  '/reset-senha',
  '/not-found'
];

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <UserRoleProvider>
        <AppWrapperContent>{children}</AppWrapperContent>
      </UserRoleProvider>
    </AuthGuard>
  );
}

function AppWrapperContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Verificar se a rota atual deve ter layout de navegação
  const shouldHaveNavigation = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Verificar se é uma rota pública que não deve ter navegação
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );



  // Se for uma rota pública, renderizar sem layout
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Se a rota deve ter navegação, usar o UniversalLayout
  if (shouldHaveNavigation) {
    // Extrair a página atual do pathname
    const currentPage = pathname === '/' || pathname === '/home' ? 'home' : 
                       pathname.replace('/', '').split('/')[0] || 'home';
    
    return (
      <UniversalLayout currentPage={currentPage}>
        {children}
      </UniversalLayout>
    );
  }

  // Fallback para rotas não categorizadas
  return <>{children}</>;
}
