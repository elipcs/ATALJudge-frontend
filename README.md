# AtalJudge Frontend

Sistema de juiz online para questões de programação, desenvolvido com Next.js, TypeScript e Tailwind CSS.

## 🚀 Tecnologias

- **Next.js 15** (App Router) - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Estilização
- **shadcn/ui** - Componentes de UI
- **Radix UI** - Primitivos acessíveis

## 📁 Estrutura do Projeto

```
src/
├── app/              # Páginas e rotas (Next.js App Router)
├── components/       # Componentes React organizados por domínio
│   ├── auth/        # Autenticação e registro
│   ├── lists/       # Listas de questões
│   ├── questions/   # Questões e submissões
│   ├── ui/          # Componentes base (shadcn/ui)
│   └── ...
├── config/          # Configurações (API client)
├── hooks/           # Custom Hooks
├── services/        # Camada de serviços (API calls)
├── types/           # TypeScript types e interfaces
├── utils/           # Funções utilitárias
└── constants/       # Constantes da aplicação
```