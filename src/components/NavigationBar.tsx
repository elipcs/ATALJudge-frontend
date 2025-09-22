"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useUserRole, UserRole } from "../hooks/useUserRole";
import LogoutButton from "./LogoutButton";

interface NavigationBarProps {
  currentPage?: string;
}

interface NavigationLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  key: string;
  roles: UserRole[];
}

export default function NavigationBar({ currentPage }: NavigationBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { userRole, isLoading, setUserRole } = useUserRole();

  // Carregar estado do localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  // Função para alternar tipo de usuário (apenas para testes)
  const switchUserRole = () => {
    const types: UserRole[] = ['professor', 'student', 'assistant'];
    const currentIndex = types.indexOf(userRole);
    const nextIndex = (currentIndex + 1) % types.length;
    setUserRole(types[nextIndex]);
  };

  // Salvar estado no localStorage e atualizar CSS variable
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', newState.toString());
    
    // Atualizar CSS variable
    document.documentElement.style.setProperty(
      '--sidebar-width',
      newState ? '4rem' : '16rem'
    );
  };

  // Definir todos os links disponíveis no sistema
  const allNavigationLinks: NavigationLink[] = [
    { 
      href: "/home", 
      label: "Home", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      key: "home",
      roles: ['professor', 'student', 'assistant']
    },
    { 
      href: "/listas", 
      label: "Listas", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      key: "listas",
      roles: ['professor', 'student', 'assistant']
    },
    { 
      href: "/turmas", 
      label: "Turmas", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      key: "turmas",
      roles: ['professor', 'student', 'assistant']
    },
    { 
      href: "/submissoes", 
      label: "Submissões", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      key: "submissoes",
      roles: ['professor', 'student', 'assistant']
    },
    { 
      href: "/convites", 
      label: "Convites", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      key: "convites",
      roles: ['professor'] // Apenas professores podem gerenciar convites
    },
    { 
      href: "/perfil", 
      label: "Perfil", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      key: "perfil",
      roles: ['professor', 'student', 'assistant']
    },
    { 
      href: "/configuracoes", 
      label: "Configurações", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      key: "configuracoes",
      roles: ['professor']
    }
  ];

  // Função para obter links baseados no tipo de usuário
  const getLinksForUserRole = (): NavigationLink[] => {
    return allNavigationLinks.filter(link => link.roles.includes(userRole));
  };

  const links = getLinksForUserRole();

  const getCurrentKey = () => {
    if (currentPage) return currentPage;
    if (pathname === "/home") return "home";
    if (pathname === "/perfil" || pathname === "/home/perfil") return "perfil";
    if (pathname.includes("/turmas")) return "turmas";
    if (pathname.includes("/convites")) return "convites";
    if (pathname.includes("/configuracoes")) return "configuracoes";
    if (pathname.includes("/listas")) return "listas";
    if (pathname.includes("/submissoes")) return "submissoes";
    return "";
  };

  const activeKey = getCurrentKey();

  // Função para obter o nome do tipo de usuário para exibição
  const getUserRoleLabel = (): string => {
    switch (userRole) {
      case 'professor': return 'Professor';
      case 'student': return 'Aluno';
      case 'assistant': return 'Monitor';
      default: return 'Usuário';
    }
  };

  // Mostrar loading enquanto detecta o tipo de usuário
  if (isLoading) {
    return (
      <nav className={`h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <style jsx global>{`
        :root {
          --sidebar-width: ${isCollapsed ? '4rem' : '16rem'};
        }
      `}</style>
      <nav className={`h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'p-2' : 'p-4'}`}>
          {/* Header com logo e botão de toggle */}
          <div className={`mb-6 transition-all duration-300 ease-in-out ${isCollapsed ? 'space-y-2' : 'flex items-center justify-between'}`}>
            {/* Logo sempre visível */}
            <div className={`flex items-center transition-all duration-300 ease-in-out ${isCollapsed ? 'justify-center' : 'justify-start ml-4'}`}>
              <Link href="/home" className="flex-shrink-0 hover:opacity-80 transition-opacity duration-200">
                {isCollapsed ? (
                  <div className="transition-all duration-300 ease-in-out cursor-pointer w-10 h-10 flex items-center justify-center text-blue-600 mx-auto" title="Ir para página inicial">
                     <svg 
                      className="w-6 h-6 transition-transform duration-200 hover:scale-110" 
                      fill="currentColor" 
                      stroke="none" 
                      viewBox="0 0 500 500"
                    >
                      <g transform="translate(0,500) scale(0.1,-0.1)">
                        <path d="M2486 4613 c-39 -10 -93 -53 -195 -154 -115 -115 -140 -158 -141 -238 0 -85 25 -124 173 -266 73 -70 195 -188 272 -263 77 -76 199 -193 270 -261 72 -69 186 -179 255 -246 145 -141 181 -160 282 -153 37 2 79 12 101 23 50 27 261 238 283 284 25 52 23 126 -5 183 -25 49 -142 167 -591 598 -134 129 -293 282 -353 340 -128 124 -191 161 -277 159 -30 -1 -64 -4 -74 -6z"/>
                        <path d="M1784 3414 c-225 -229 -410 -421 -412 -428 -1 -6 170 -183 380 -393 442 -441 434 -433 455 -433 17 0 826 799 845 834 10 18 -12 42 -183 209 -107 104 -294 288 -415 408 -137 136 -229 219 -241 219 -13 0 -166 -148 -429 -416z"/>
                        <path d="M1004 2909 c-40 -15 -74 -43 -160 -132 -117 -119 -134 -150 -134 -239 0 -93 22 -119 482 -579 396 -395 434 -430 486 -449 67 -25 135 -24 197 5 54 25 248 219 269 269 22 53 21 147 -3 194 -16 32 -177 193 -831 833 -122 119 -192 142 -306 98z"/>
                        <path d="M2760 2478 c-83 -84 -150 -155 -150 -158 0 -5 7 -13 194 -215 61 -66 134 -145 161 -175 28 -30 80 -86 116 -125 36 -38 86 -92 111 -120 24 -27 105 -115 179 -195 74 -80 175 -190 224 -245 50 -54 119 -131 155 -170 36 -38 112 -122 170 -185 247 -271 300 -310 431 -318 67 -4 84 -1 134 22 66 30 193 148 233 216 24 40 27 55 27 140 0 147 -1 148 -386 481 -138 120 -350 301 -459 393 -14 11 -55 46 -90 77 -75 64 -88 75 -191 161 -251 209 -516 432 -590 495 -47 40 -93 73 -103 73 -9 0 -84 -68 -166 -152z"/>
                        <path d="M780 1182 c-19 -9 -45 -32 -57 -51 -20 -30 -23 -47 -23 -132 l0 -99 -70 0 c-87 0 -129 -17 -166 -66 -28 -36 -29 -42 -32 -163 -2 -116 -1 -129 20 -165 13 -21 39 -47 58 -57 33 -18 82 -19 1125 -19 1070 0 1091 0 1123 20 61 37 72 70 72 210 0 193 -29 232 -176 239 l-84 3 0 92 c0 113 -17 151 -80 184 l-44 22 -816 0 c-756 0 -818 -1 -850 -18z"/>
                      </g>
                    </svg>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <svg 
                      className="w-24 h-14 text-blue-600 transition-transform duration-200 hover:scale-110" 
                      fill="currentColor" 
                      stroke="none" 
                      viewBox="0 0 666 375"
                    >
                      <g transform="translate(0.000000,375.000000) scale(0.100000,-0.100000)">
                        <path d="M1267 2914 c-60 -40 -97 -99 -97 -153 l0 -45 258 -259 c141 -142 269 -265 284 -273 15 -8 43 -14 63 -14 32 0 47 9 106 66 75 73 91 111 69 163 -6 16 -71 85 -143 153 -268 252 -393 365 -414 376 -36 19 -86 14 -126 -14z"/>
                        <path d="M3016 2802 c-3 -5 -66 -171 -141 -368 -74 -198 -140 -370 -146 -384 -19 -43 -79 -212 -79 -221 0 -5 51 -9 114 -9 l114 0 35 98 35 97 192 0 193 0 32 -95 32 -95 122 -3 c114 -2 122 -1 117 15 -3 10 -86 232 -184 493 l-179 475 -126 3 c-69 1 -128 -1 -131 -6z m193 -414 c32 -97 57 -179 53 -182 -3 -3 -59 -6 -124 -6 -89 0 -118 3 -118 13 0 15 105 330 115 347 4 6 9 10 11 8 2 -2 30 -83 63 -180z"/>
                        <path d="M3560 2715 l0 -95 150 0 150 0 0 -400 0 -400 115 0 115 0 0 400 0 400 145 0 145 0 0 95 0 95 -410 0 -410 0 0 -95z"/>
                        <path d="M4675 2768 c-9 -24 -75 -196 -145 -383 -70 -187 -147 -388 -169 -448 -23 -59 -41 -110 -41 -112 0 -3 52 -4 116 -3 l116 3 35 98 35 97 193 0 193 0 33 -100 33 -100 118 0 c78 0 118 4 118 11 0 9 -40 118 -235 629 -35 91 -78 207 -96 257 l-34 93 -126 0 -127 0 -17 -42z m204 -372 c33 -99 58 -183 55 -188 -6 -10 -244 -11 -244 0 0 12 122 373 126 370 1 -2 30 -84 63 -182z"/>
                        <path d="M5440 2315 l0 -495 340 0 340 0 0 95 0 95 -225 0 -225 0 0 400 0 400 -115 0 -115 0 0 -495z"/>
                        <path d="M957 2392 l-207 -207 214 -214 c117 -117 218 -212 224 -210 18 7 422 391 422 402 0 10 -430 436 -440 437 -3 0 -99 -93 -213 -208z"/>
                        <path d="M473 2107 c-62 -63 -73 -78 -73 -108 0 -19 7 -46 17 -59 28 -42 506 -521 535 -536 60 -31 107 -13 186 69 43 46 52 62 52 92 0 20 -6 48 -14 63 -22 41 -517 529 -549 541 -58 22 -77 15 -154 -62z"/>
                        <path d="M1447 1902 l-88 -88 248 -265 c136 -145 297 -315 358 -376 l110 -113 53 0 c49 0 56 3 103 47 58 55 79 89 79 133 0 49 -23 81 -112 161 -45 41 -139 126 -208 189 -310 284 -441 400 -448 400 -4 0 -47 -40 -95 -88z"/>
                        <path d="M5054 1561 c-58 -15 -128 -55 -171 -97 -149 -149 -149 -436 0 -585 85 -86 204 -122 328 -101 84 15 131 37 182 89 66 65 90 124 95 231 l4 92 -171 0 -171 0 0 -60 0 -60 90 0 c87 0 90 -1 90 -23 0 -31 -43 -88 -83 -109 -45 -24 -137 -23 -186 2 -114 58 -154 227 -87 364 36 74 88 109 170 114 52 3 66 0 96 -20 19 -13 44 -38 55 -55 20 -32 20 -32 108 -33 l87 0 -6 28 c-20 88 -73 151 -167 199 -42 21 -68 27 -142 29 -49 2 -104 0 -121 -5z"/>
                        <path d="M2888 1254 l-3 -296 -24 -19 c-31 -26 -95 -25 -121 1 -11 11 -23 38 -26 60 l-7 41 -76 -3 -76 -3 -3 -32 c-9 -96 69 -199 168 -223 138 -33 292 34 320 140 5 19 10 169 12 333 l3 297 -82 0 -82 0 -3 -296z"/>
                        <path d="M3202 1263 c3 -278 4 -290 26 -335 30 -60 90 -112 156 -135 76 -27 245 -25 306 3 66 31 110 72 136 129 23 49 24 57 24 338 l0 287 -80 0 -80 0 0 -265 c0 -293 -4 -315 -64 -351 -42 -26 -160 -27 -199 -1 -61 40 -61 44 -58 343 l2 274 -86 0 -87 0 4 -287z"/>
                        <path d="M4000 1166 l0 -386 153 0 c83 0 179 4 211 10 126 20 226 95 280 210 27 59 30 75 31 165 0 80 -4 112 -23 160 -32 85 -86 145 -169 186 l-68 34 -207 3 -208 4 0 -386z m392 216 c89 -44 135 -162 109 -283 -25 -117 -105 -169 -263 -169 l-78 0 0 233 c0 129 3 237 8 241 4 5 45 6 92 4 62 -3 98 -10 132 -26z"/>
                        <path d="M5630 1165 l0 -385 243 0 c134 0 246 2 248 4 2 2 3 36 1 75 l-4 71 -169 0 -169 0 0 80 0 80 149 0 149 0 6 31 c3 17 6 49 6 70 l0 39 -150 0 -150 0 0 90 0 90 164 0 163 0 7 38 c3 20 6 52 6 70 l0 32 -250 0 -250 0 0 -385z"/>
                        <path d="M516 1134 c-12 -11 -16 -36 -16 -90 l0 -74 -44 0 c-63 0 -76 -22 -76 -123 0 -130 -67 -117 585 -117 653 0 585 -14 585 123 0 99 -12 117 -78 117 l-42 0 0 74 c0 54 -4 79 -16 90 -14 14 -68 16 -449 16 -381 0 -435 -2 -449 -16z"/>
                      </g>
                    </svg>
                  </div>
                )}
              </Link>
            </div>

            {/* Botão de toggle */}
            <div className={`flex justify-center ${isCollapsed ? '' : 'justify-end'}`}>
              <button
                onClick={toggleCollapse}
                className={`hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ${isCollapsed ? 'w-12 h-12 flex items-center justify-center' : 'p-2'}`}
                title={isCollapsed ? "Expandir menu" : "Retrair menu"}
              >
                <svg 
                  className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                    isCollapsed ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Botão de teste para alternar tipo de usuário */}
          {!isCollapsed && (
            <div className="mb-4 px-3">
              <button
                onClick={switchUserRole}
                className="w-full px-3 py-2 text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-blue-200 transition-all duration-200 border border-purple-300 font-medium shadow-sm"
                title="Alternar tipo de usuário (teste)"
              >
                🔄 Testar como {userRole === 'professor' ? 'Aluno' : userRole === 'student' ? 'Monitor' : 'Professor'}
              </button>
              <div className="text-xs text-center mt-1 text-gray-500">
                Atual: <span className="font-medium text-purple-600">{getUserRoleLabel()}</span>
              </div>
            </div>
          )}

          {/* Indicador do tipo de usuário para modo colapsado */}
          {isCollapsed && (
            <div className="mb-4 flex justify-center">
              <button
                onClick={switchUserRole}
                className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-blue-200 transition-all duration-200 border border-purple-300 text-sm font-bold relative group shadow-sm"
                title={`Alternar tipo: ${getUserRoleLabel()}`}
              >
                {userRole === 'professor' ? 'P' : userRole === 'student' ? 'A' : 'M'}
                {/* Tooltip para modo colapsado */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {getUserRoleLabel()} - Clique para alternar
                </div>
              </button>
            </div>
          )}

          {/* Links de navegação */}
          <div className={`space-y-2 ${isCollapsed ? '' : ''}`}>
            {links.map((link) => {
              const isActive = activeKey === link.key;
              return (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex ${isCollapsed ? 'justify-center items-center' : 'items-center gap-3'} text-sm font-medium rounded-lg transition-all duration-300 ease-in-out relative group ${
                      isActive
                        ? "bg-gray-100 text-gray-900 border border-gray-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    } ${isCollapsed ? 'w-12 h-12' : 'px-3 py-3'}`}
                    title={isCollapsed ? link.label : undefined}
                  >
                    <span className={`${isActive ? "text-gray-700" : "text-gray-400"} flex-shrink-0 transition-colors duration-300 ease-in-out ${isCollapsed ? 'mx-auto' : ''}`}>
                      {link.icon}
                    </span>
                    <span className={`truncate transition-all duration-300 ease-in-out overflow-hidden ${
                      isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
                    }`}>
                      {link.label}
                    </span>
                    {/* Tooltip para modo colapsado */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                        {link.label}
                      </div>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Botão de logout */}
          <div className={`mt-8 pt-4 border-t border-gray-200 transition-all duration-300 ${
            isCollapsed ? 'mt-4 pt-2' : 'mt-8 pt-4'
          }`}>
            <LogoutButton isCollapsed={isCollapsed} />
          </div>
        </div>
      </nav>
    </>
  );
}