# Página de Perfil - AtalJudge

## Como usar diferentes tipos de usuário

A página de perfil foi configurada para funcionar com diferentes tipos de usuários do mock. Por padrão, carrega como professor, mas você pode testar diferentes tipos:

### URLs para teste:

1. **Professor (padrão):**
   - `/perfil`
   - `/perfil?tipo=professor`
   - Usuário: Melina Mongiovi

2. **Aluno:**
   - `/perfil?tipo=aluno`
   - Usuário: João da Silva

3. **Monitor:**
   - `/perfil?tipo=monitor`
   - Usuário: Bob Monitor

## Funcionalidades implementadas:

### ✅ Autenticação
- Verificação de token antes de carregar a página
- Redirecionamento para login se não autenticado

### ✅ Perfil do Usuário
- Carrega dados do usuário atual do mock
- Permite editar informações pessoais:
  - Nome
  - Biografia
  - Instituição
  - Departamento
  - Título/Cargo
- Upload de avatar (simulado)

### ✅ Estatísticas por tipo de usuário
- **Professor**: Turmas, estudantes, listas, submissões, taxa de sucesso
- **Aluno**: Submissões, listas completas, ranking, taxa de sucesso
- **Monitor**: Turmas monitoradas, estudantes assistidos, submissões avaliadas

### ✅ Segurança
- Alteração de senha
- Validações de campos obrigatórios

### ✅ Privacidade
- Configurações de perfil público
- Controle de visibilidade de estatísticas
- Notificações por email e push

### ✅ UX/UI
- Interface responsiva
- Alertas de sucesso e erro
- Estados de loading
- Validações em tempo real

## APIs criadas:

- `GET /api/usuarios/perfil` - Buscar dados do usuário
- `PUT /api/usuarios/perfil` - Atualizar perfil
- `GET /api/usuarios/estatisticas` - Buscar estatísticas
- `GET /api/usuarios/privacidade` - Buscar configurações
- `PUT /api/usuarios/privacidade` - Atualizar configurações
- `POST /api/usuarios/alterar-senha` - Alterar senha
- `POST /api/usuarios/avatar` - Upload de avatar

Todas as APIs suportam o parâmetro `?tipo=professor|aluno|monitor` para testar diferentes tipos de usuários.