/**
 * Constantes centralizadas do projeto
 */

// Configurações de linguagens de programação
export const PROGRAMMING_LANGUAGES = {
  PYTHON: 'python',
  JAVA: 'java'
} as const;

export const LANGUAGE_OPTIONS = [
  { value: PROGRAMMING_LANGUAGES.PYTHON, label: 'Python' },
  { value: PROGRAMMING_LANGUAGES.JAVA, label: 'Java' }
];

// Status de listas
export const LIST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CLOSED: 'closed'
} as const;

export const LIST_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os status' },
  { value: LIST_STATUS.PUBLISHED, label: 'Publicadas' },
  { value: LIST_STATUS.DRAFT, label: 'Rascunhos' }
];

// Status de submissões
export const SUBMISSION_STATUS = {
  SUBMITTED: 'submitted',
  FAILED: 'failed',
  PENDING: 'pending',
  RUNNING: 'running',
  QUEUE: 'queue'
} as const;

export const SUBMISSION_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os status' },
  { value: SUBMISSION_STATUS.SUBMITTED, label: 'Aceitas' },
  { value: SUBMISSION_STATUS.FAILED, label: 'Rejeitadas' }
];

// Roles de usuário
export const USER_ROLES = {
  STUDENT: 'student',
  PROFESSOR: 'professor',
  ASSISTANT: 'assistant'
} as const;

// Configurações padrão do sistema
export const DEFAULT_CONFIG = {
  TIME_LIMIT: 5000, // 5 segundos
  MEMORY_LIMIT: 256, // 256MB
  MAX_SUBMISSIONS_PER_MINUTE: 10,
  MAX_FILE_SIZE: 10, // 10MB
  DEFAULT_POINTS: 10
} as const;

// Configurações de notificação
export const NOTIFICATION_CONFIG = {
  EMAIL_SUBMISSION: 'emailSubmissao',
  EMAIL_NEW_LIST: 'emailNovaLista',
  EMAIL_DEADLINE: 'emailDeadline',
  PUSH_NOTIFICATIONS: 'pushNotifications'
} as const;

// Mensagens padrão
export const MESSAGES = {
  LOADING: 'Carregando...',
  ERROR_GENERIC: 'Ocorreu um erro inesperado',
  ERROR_LOADING_DATA: 'Erro ao carregar dados',
  ERROR_LOADING_USER: 'Erro ao carregar usuário',
  ERROR_LOADING_SUBMISSIONS: 'Erro ao carregar submissões',
  ERROR_LOADING_LISTS: 'Erro ao carregar listas',
  ERROR_LOADING_NOTICES: 'Erro ao carregar avisos',
  ERROR_LOADING_STATISTICS: 'Erro ao carregar estatísticas',
  SUCCESS_SAVED: 'Dados salvos com sucesso',
  SUCCESS_CREATED: 'Criado com sucesso',
  SUCCESS_UPDATED: 'Atualizado com sucesso',
  SUCCESS_DELETED: 'Excluído com sucesso'
} as const;

// Configurações de UI
export const UI_CONFIG = {
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  MODAL_Z_INDEX: 50,
  DROPDOWN_Z_INDEX: 10
} as const;

// Configurações de paginação
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  MAX_PAGE_SIZE: 100
} as const;

// Configurações de validação
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  TITLE_MAX_LENGTH: 200
} as const;

// Configurações de cache
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutos
  LONG_TTL: 30 * 60 * 1000, // 30 minutos
  SHORT_TTL: 1 * 60 * 1000 // 1 minuto
} as const;

// Configurações de API
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 segundo
} as const;

// Configurações de tema
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: 'blue',
    SECONDARY: 'slate',
    SUCCESS: 'green',
    WARNING: 'yellow',
    ERROR: 'red',
    INFO: 'blue'
  },
  BORDER_RADIUS: {
    SM: 'rounded-lg',
    MD: 'rounded-xl',
    LG: 'rounded-2xl',
    XL: 'rounded-3xl'
  }
} as const;
