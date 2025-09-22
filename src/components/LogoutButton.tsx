"use client";
import { removeToken } from "@/services/auth";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  isCollapsed?: boolean;
}

export default function LogoutButton({ isCollapsed = false }: LogoutButtonProps) {
  const router = useRouter();
  
  function handleLogout() {
    removeToken();
    // Limpar dados adicionais do localStorage
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    router.push("/login");
  }
  
  return (
    <button
      onClick={handleLogout}
      className={`flex ${isCollapsed ? 'justify-center items-center' : 'items-center gap-3'} text-sm font-medium rounded-lg transition-all duration-300 ease-in-out relative group text-red-600 hover:text-red-700 hover:bg-red-50 ${
        isCollapsed ? 'w-12 h-12' : 'px-3 py-3 w-full justify-start'
      }`}
      title={isCollapsed ? "Sair" : undefined}
    >
      <span className={`text-red-500 flex-shrink-0 transition-colors duration-300 ease-in-out ${isCollapsed ? 'mx-auto' : ''}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </span>
      <span className={`truncate transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
      }`}>
        Sair
      </span>
      {/* Tooltip para modo colapsado */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
          Sair
        </div>
      )}
    </button>
  );
}
