export interface Example {
  input: string;
  output: string;
}

export interface QuestionMock {
  id: string;
  title: string;
  statement: string;
  input: string;
  output: string;
  examples: Example[];
  tags: string[];
  timeLimit: string;
  memoryLimit: string;
  editorial: string;
  letter: string;
  origin: string;
  code: string;
  stats: { solved: number; total: number };
  status: string;
  difficulty: "fácil" | "média" | "difícil";
  description?: string;
  note?: string;
}

export interface ListMock {
  id: string;
  title: string;
  description: string;
  questions: QuestionMock[];
  startDate: string;
  endDate: string;
}

export const mockLists: ListMock[] = [
  {
    id: "1",
    title: "Lista 1: Introdução",
    description: "Primeira lista de exercícios de lógica e algoritmos.",
    questions: [
      {
        id: "1",
        title: "Soma Simples",
        description: "Calcule a soma de dois números.",
        statement: "Dado dois números inteiros, calcule e imprima a soma deles.",
        input: "Dois inteiros A e B.",
        output: "Um inteiro representando a soma de A e B.",
        examples: [
          { input: "2 3", output: "5" },
          { input: "10 -2", output: "8" }
        ],
        note: "Os valores podem ser negativos.",
        tags: ["soma", "iniciante"],
        timeLimit: "1000 ms",
        memoryLimit: "256 MB",
        editorial: "https://exemplo.com/editorial-soma",
        letter: "A",
        origin: "AtalJudge",
        code: "1001A",
        stats: { solved: 49, total: 95 },
        status: "Resolvido",
        difficulty: "fácil",
        lastScore: 10 // Perfeito (verde escuro)
      },
      {
        id: "2",
        title: "Maior Número",
        description: "Encontre o maior entre três números.",
        statement: "Dado três números inteiros, imprima o maior deles.",
        input: "Três inteiros X, Y, Z.",
        output: "O maior valor dentre X, Y e Z.",
        examples: [
          { input: "1 2 3", output: "3" },
          { input: "-5 0 -2", output: "0" }
        ],
        note: "Pode haver números iguais.",
        tags: ["comparação", "iniciante"],
        timeLimit: "1000 ms",
        memoryLimit: "256 MB",
        editorial: "https://exemplo.com/editorial-maior",
        letter: "B",
        origin: "AtalJudge",
        code: "1002B",
        stats: { solved: 47, total: 79 },
        status: "Resolvido",
        difficulty: "fácil",
        lastScore: 8 // Resolvido (verde claro)
      },
      {
        id: "3",
        title: "Fatorial",
        description: "Calcule o fatorial de um número.",
        statement: "Dado um inteiro N, calcule o fatorial de N.",
        input: "Um inteiro N (0 <= N <= 12).",
        output: "O valor de N! (fatorial de N).",
        examples: [
          { input: "5", output: "120" },
          { input: "0", output: "1" }
        ],
        note: "0! = 1 por definição.",
        tags: ["fatorial", "recursão"],
        timeLimit: "1000 ms",
        memoryLimit: "256 MB",
        editorial: "https://exemplo.com/editorial-fatorial",
        letter: "C",
        origin: "AtalJudge",
        code: "1003C",
        stats: { solved: 42, total: 119 },
        status: "Resolvido",
        difficulty: "média",
        lastScore: 3 // Tentado (amarelo)
      },
      {
        id: "8",
        title: "Questão Não Tentada",
        description: "Exemplo de questão sem submissão.",
        statement: "Apenas um exemplo para mostrar o label cinza.",
        input: "-",
        output: "-",
        examples: [
          { input: "-", output: "-" }
        ],
        tags: ["exemplo"],
        timeLimit: "1000 ms",
        memoryLimit: "256 MB",
        editorial: "-",
        letter: "D",
        origin: "AtalJudge",
        code: "1004D",
        stats: { solved: 0, total: 0 },
        status: "Não tentado",
        difficulty: "fácil"
        // lastScore ausente (cinza)
      },
    ],
    startDate: "2024-08-20 09:05",
    endDate: "2024-08-27 09:05",
  },
  {
    id: "2",
    title: "Lista 2: Estruturas de Dados",
  description: "Exercícios sobre arrays, lista e filas.",
    questions: [
      {
        id: "4",
        title: "Busca Linear",
        description: "Implemente a busca linear em um array.",
        statement: "Dado um array de N inteiros e um valor X, determine se X está presente no array.",
        input: "O primeiro inteiro N, seguido de N inteiros do array, e depois o inteiro X.",
        output: "'SIM' se X estiver no array, 'NAO' caso contrário.",
        examples: [
          { input: "5\n1 2 3 4 5\n3", output: "SIM" },
          { input: "4\n10 20 30 40\n25", output: "NAO" }
        ],
        note: "A busca deve ser linear, não use métodos de busca binária.",
        tags: ["busca", "array"],
        timeLimit: "1000 ms",
        memoryLimit: "256 MB",
        editorial: "https://exemplo.com/editorial-busca",
        letter: "A",
        origin: "AtalJudge",
        code: "2001A",
        stats: { solved: 22, total: 185 },
        status: "Resolvido",
        difficulty: "fácil"
      },
      {
        id: "5",
        title: "Fila Circular",
        description: "Implemente uma fila circular.",
        statement: "Implemente uma estrutura de fila circular com operações de inserção e remoção.",
        input: "Número de operações seguido das operações (push X, pop).",
        output: "Resultado das operações de remoção.",
        examples: [
          { input: "5\npush 1\npush 2\npop\npush 3\npop", output: "1\n2" }
        ],
        note: "A fila deve ser circular, ou seja, reutilizar posições vazias.",
        tags: ["fila", "estrutura de dados"],
        timeLimit: "2000 ms",
        memoryLimit: "256 MB",
        editorial: "https://exemplo.com/editorial-fila",
        letter: "B",
        origin: "AtalJudge",
        code: "2002B",
        stats: { solved: 18, total: 60 },
        status: "Resolvido",
        difficulty: "média"
      },
    ],
    startDate: "2024-09-01 10:00",
    endDate: "2024-09-08 10:00",
  },
  {
    id: "3",
    title: "Lista 3: Algoritmos de Ordenação",
    description: "Problemas de ordenação clássicos.",
    questions: [
      {
        id: "6",
        title: "Bubble Sort",
        description: "Implemente o algoritmo Bubble Sort.",
        statement: "Dado um array de N inteiros, ordene-o usando o algoritmo Bubble Sort.",
        input: "O inteiro N seguido de N inteiros.",
        output: "O array ordenado em ordem crescente.",
        examples: [
          { input: "5\n5 4 3 2 1", output: "1 2 3 4 5" }
        ],
        note: "Implemente o algoritmo manualmente.",
        tags: ["ordenação", "bubble sort"],
        timeLimit: "2000 ms",
        memoryLimit: "256 MB",
        editorial: "https://exemplo.com/editorial-bubble",
        letter: "A",
        origin: "AtalJudge",
        code: "3001A",
        stats: { solved: 10, total: 50 },
        status: "Resolvido",
        difficulty: "fácil"
      },
      {
        id: "7",
        title: "Quick Sort",
        description: "Implemente o algoritmo Quick Sort.",
        statement: "Dado um array de N inteiros, ordene-o usando o algoritmo Quick Sort.",
        input: "O inteiro N seguido de N inteiros.",
        output: "O array ordenado em ordem crescente.",
        examples: [
          { input: "5\n3 1 4 2 5", output: "1 2 3 4 5" }
        ],
        note: "Implemente o algoritmo manualmente.",
        tags: ["ordenação", "quick sort"],
        timeLimit: "2000 ms",
        memoryLimit: "256 MB",
        editorial: "https://exemplo.com/editorial-quick",
        letter: "B",
        origin: "AtalJudge",
        code: "3002B",
        stats: { solved: 5, total: 40 },
        status: "Resolvido",
        difficulty: "difícil"
      },
    ],
    startDate: "2024-09-15 14:00",
    endDate: "2024-09-22 14:00",
  },
];
