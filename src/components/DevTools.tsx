'use client';

/* eslint-disable no-console */
import { useEffect } from 'react';

type DevWindow = typeof globalThis & {
  clearAuthStorage?: () => void;
  clearAllStorage?: () => void;
};

/**
 * Componente que disponibiliza ferramentas de desenvolvimento no console
 */
export default function DevTools() {
  useEffect(() => {
    // Disponibilizar funções de limpeza no console
    const isDev = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development';
    if (typeof window !== 'undefined' && isDev) {
      /**
       * Limpar apenas dados de autenticação
       */
      (globalThis as DevWindow).clearAuthStorage = () => {
        const itemsToRemove = [
          'token',
          'refreshToken',
          'userRole',
          'user',
          'manual-userRole',
          'userName',
          'userEmail'
        ];

        console.log('🧹 Limpando localStorage de autenticação...');
        
        itemsToRemove.forEach(item => {
          if (localStorage.getItem(item)) {
            localStorage.removeItem(item);
            console.log(`  ✓ Removido: ${item}`);
          }
        });

        console.log('✅ Dados de autenticação limpos com sucesso!');
        console.log('🔄 Recarregue a página para ver as mudanças.');
      };

      /**
       * Limpar TODOS os dados do localStorage
       */
      (globalThis as DevWindow).clearAllStorage = () => {
        console.log('🧹 Limpando TODO o localStorage...');
        localStorage.clear();
        console.log('✅ localStorage completamente limpo!');
        console.log('🔄 Recarregue a página para ver as mudanças.');
      };

      console.log('🛠️  DevTools disponíveis:');
      console.log('  • clearAuthStorage() - Limpa tokens e dados de autenticação');
      console.log('  • clearAllStorage() - Limpa TODO o localStorage');
    }
  }, []);

  return null;
}

/* eslint-enable no-console */

