import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import next from '@next/eslint-plugin-next';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/build/**',
      '**/.vercel/**',
      '**/dist/**',
      '**/.turbo/**'
    ]
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        // Navegador
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        
        // Fetch API
        fetch: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        HeadersInit: 'readonly',
        RequestInit: 'readonly',
        
        // URL e codificação
        URL: 'readonly',
        URLSearchParams: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        
        // Timers
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        
        // Performance
        performance: 'readonly',
        
        // Abort
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        
        // DOM Elements
        Element: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLParagraphElement: 'readonly',
        HTMLHeadingElement: 'readonly',
        
        // Events
        Event: 'readonly',
        EventTarget: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        
        // Outros
        Blob: 'readonly',
        FormData: 'readonly',
        FileReader: 'readonly',
        
        // React/JSX
        React: 'readonly',
        JSX: 'readonly',
        
        // Node.js (para tipos/variáveis)
        NodeJS: 'readonly',
        Function: 'readonly',
        process: 'readonly',
        module: 'readonly',
        __filename: 'readonly',
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      '@next/next': next
    },
    rules: {
      ...js.configs.recommended.rules,
      
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      
      // Desabilitar regra base em favor da versão TS
      'no-unused-vars': 'off',
      
      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      
      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      
      // Next.js
      '@next/next/no-html-link-for-pages': 'off',
      
      // Console
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      
      // Imports
      'no-duplicate-imports': 'warn',
      
      // Geral
      'no-undef': 'error',
      'no-prototype-builtins': 'error'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];
