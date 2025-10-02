import { getMockData } from './mockData';

// Interfaces para a API
export interface QuestionList {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  classId: string;
  className: string;
  questions: number;
  submissions: number;
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
  updatedAt: string;
  calculatedStatus: 'next' | 'open' | 'closed';
}

export interface Class {
  id: string;
  name: string;
  active: boolean;
}

export interface CreateListRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  classIds: string[];
}

export interface UpdateListRequest {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: 'draft' | 'published' | 'closed';
}

export interface ListFilters {
  search?: string;
  classId?: string;
  status?: 'all' | 'draft' | 'published' | 'closed';
}

export interface ListStats {
  total: number;
  published: number;
  drafts: number;
  closed: number;
}

// Função para calcular status baseado nas datas
const calculateListStatus = (startDate: string, endDate: string, originalStatus: string): 'next' | 'open' | 'closed' => {
  if (originalStatus === 'draft') return 'next';
  
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Ajustar para considerar o final do dia para a data de encerramento
  end.setHours(23, 59, 59, 999);
  
  if (now < start) return 'next';
  else if (now >= start && now <= end) return 'open';
  else return 'closed';
};

// Função para converter dados mock para formato da API
const convertMockToList = (mockList: Record<string, unknown>, mockClass: Record<string, unknown>): QuestionList => {
  const calculatedStatus = calculateListStatus(
    String(mockList.start_date),
    String(mockList.end_date),
    String(mockList.status)
  );
  
  return {
    id: String(mockList.id),
    title: String(mockList.title),
    description: typeof mockList.description === 'string' ? mockList.description : undefined,
    startDate: typeof mockList.start_date === 'string' ? mockList.start_date : '',
    endDate: typeof mockList.end_date === 'string' ? mockList.end_date : '',
    classId: typeof mockClass.id === 'string' ? mockClass.id : '',
    className: typeof mockClass.name === 'string' ? mockClass.name : '',
    questions: Array.isArray(mockList.questions) ? mockList.questions.length : 0,
    submissions: Math.floor(Math.random() * 200),
    status: mockList.status === 'published' ? 'published' : mockList.status === 'Draft' ? 'draft' : 'closed',
    calculatedStatus,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  };
};

// Simulação de delay de rede
const simulateNetworkDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));


// API Service
export class ListsApiService {
  private static instance: ListsApiService;
  private lists: QuestionList[] = [];
  private classes: Class[] = [];
  private initialized = false;

  private constructor() {}

  public static getInstance(): ListsApiService {
    if (!ListsApiService.instance) {
      ListsApiService.instance = new ListsApiService();
    }
    return ListsApiService.instance;
  }

  // Inicializar dados (simula carregamento inicial)
  private async initializeData(): Promise<void> {
    if (this.initialized) return;

    await simulateNetworkDelay(300);

    const mockListsData = getMockData.questionLists();
    const mockClassesData = getMockData.classes() ?? [];

    this.lists = (mockListsData as unknown as Record<string, unknown>[]).map((mockList: Record<string, unknown>, index: number) => {
      const mockClass = mockClassesData[index % mockClassesData.length] ?? {};
      return convertMockToList(mockList, mockClass as unknown as Record<string, unknown>);
    });
    this.classes = Array.isArray(mockClassesData)
      ? (mockClassesData as unknown as Record<string, unknown>[]).map((c: Record<string, unknown>) => ({
          id: String(c.id),
          name: String(c.name),
          active: true
        }))
      : [];

    this.initialized = true;
  }

  // Buscar todas as listas
  async getLists(filters?: ListFilters, userRole?: string): Promise<QuestionList[]> {
    await this.initializeData();
    await simulateNetworkDelay(200);

    let filteredLists = [...this.lists];

    // Filtrar por tipo de usuário
    if (userRole === 'student') {
      const studentClassId = '6500000000000000003001'; // Em um sistema real, isso viria do contexto do usuário
      filteredLists = this.lists.filter(list => 
        list.classId === studentClassId && list.status === 'published'
      );
    }

    // Aplicar filtros
    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredLists = filteredLists.filter(list =>
          list.title.toLowerCase().includes(searchLower) ||
          list.description?.toLowerCase().includes(searchLower) ||
          list.className.toLowerCase().includes(searchLower)
        );
      }

      if (filters.classId) {
        filteredLists = filteredLists.filter(list => list.classId === filters.classId);
      }

      if (filters.status && filters.status !== 'all') {
        filteredLists = filteredLists.filter(list => list.status === filters.status);
      }
    }

    return filteredLists;
  }

  // Buscar lista por ID
  async getListById(id: string): Promise<QuestionList | null> {
    await this.initializeData();
    await simulateNetworkDelay(150);

    return this.lists.find(list => list.id === id) || null;
  }

  // Buscar todas as turmas
  async getClasses(): Promise<Class[]> {
    await this.initializeData();
    await simulateNetworkDelay(100);

    return [...this.classes];
  }

  // Criar nova lista
  async createList(listData: CreateListRequest): Promise<QuestionList> {
    await this.initializeData();
    await simulateNetworkDelay(800);

    const newList: QuestionList = {
      id: `lista_${Date.now()}`,
      title: listData.title,
      description: listData.description,
      startDate: listData.startDate || new Date().toISOString(),
      endDate: listData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      classId: listData.classIds[0] || this.classes[0]?.id || '',
      className: this.classes.find(c => c.id === listData.classIds[0])?.name || this.classes[0]?.name || '',
      questions: 0,
      submissions: 0,
      status: 'draft',
      calculatedStatus: 'next',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.lists.unshift(newList);
    return newList;
  }

  // Atualizar lista
  async updateList(id: string, updates: UpdateListRequest): Promise<QuestionList> {
    await this.initializeData();
    await simulateNetworkDelay(600);

    const listIndex = this.lists.findIndex(list => list.id === id);
    if (listIndex === -1) {
      throw new Error('Lista não encontrada');
    }

    const updatedList = {
      ...this.lists[listIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Recalcular status se necessário
    if (updates.startDate || updates.endDate || updates.status) {
      updatedList.calculatedStatus = calculateListStatus(
        updatedList.startDate,
        updatedList.endDate,
        updatedList.status
      );
    }

    this.lists[listIndex] = updatedList;
    return updatedList;
  }

  // Deletar lista
  async deleteList(id: string): Promise<void> {
    await this.initializeData();
    await simulateNetworkDelay(400);

    const listIndex = this.lists.findIndex(list => list.id === id);
    if (listIndex === -1) {
      throw new Error('Lista não encontrada');
    }

    this.lists.splice(listIndex, 1);
  }

  // Buscar estatísticas
  async getStats(): Promise<ListStats> {
    await this.initializeData();
    await simulateNetworkDelay(100);

    const total = this.lists.length;
    const published = this.lists.filter(l => l.status === 'published').length;
    const drafts = this.lists.filter(l => l.status === 'draft').length;
    const closed = this.lists.filter(l => l.status === 'closed').length;

    return { total, published, drafts, closed };
  }

  // Duplicar lista
  async duplicateList(id: string): Promise<QuestionList> {
    await this.initializeData();
    await simulateNetworkDelay(500);

    const originalList = this.lists.find(list => list.id === id);
    if (!originalList) {
      throw new Error('Lista não encontrada');
    }

    const duplicatedList: QuestionList = {
      ...originalList,
      id: `lista_${Date.now()}`,
      title: `${originalList.title} (Cópia)`,
      status: 'draft',
      calculatedStatus: 'next',
      questions: 0,
      submissions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.lists.unshift(duplicatedList);
    return duplicatedList;
  }
}

// Instância singleton
export const listsApi = ListsApiService.getInstance();
