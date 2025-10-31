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

## 🔧 Setup

### Pré-requisitos

- Node.js 20+
- npm ou yarn
- Backend Flask rodando em `http://localhost:5000`

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Crie um arquivo .env.local com:
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Desenvolvimento

```bash
# Rodar em modo desenvolvimento
npm run dev

# Verificar tipos
npm run type-check

# Lint
npm run lint
```

### Build

```bash
# Build para produção
npm run build

# Rodar build
npm start
```

## 🏗️ Arquitetura

O frontend chama o **backend diretamente** sem API routes intermediárias:

```
Frontend → Backend Flask
```

- **Cliente HTTP**: `src/config/api.ts`
- **Services**: Camada que consome a API
- **Hooks**: Lógica de estado e efeitos
- **Components**: UI pura

## 📚 Documentação

- [SETUP.md](SETUP.md) - Guia de configuração completo
- [CONTRIBUTING.md](CONTRIBUTING.md) - Guia de contribuição
- [docs/ARCHITECTURE.md](docs/analise-arquitetural.md) - Análise arquitetural

## ✨ Funcionalidades

- ✅ Autenticação com JWT (access + refresh tokens)
- ✅ Cadastro por convite (professor/aluno/monitor)
- ✅ Gerenciamento de turmas
- ✅ Criação e edição de listas de questões
- ✅ Sistema de pontuação configurável
- ✅ Submissão e avaliação de código (Judge0)
- ✅ Restrição por IP
- ✅ Reset de senha por e-mail

## 🤝 Como Contribuir

Leia o [guia de contribuição](CONTRIBUTING.md) para entender:
- Padrões de código
- Convenções de nomenclatura
- Como abrir PRs
- Estrutura de commits

## 📝 Licença

Este projeto é parte do sistema AtalJudge.

---

**Desenvolvido com ❤️ para educação em programação**
