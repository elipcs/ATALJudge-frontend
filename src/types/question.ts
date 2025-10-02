export interface Question {
  id: string;
  title: string;
  points: number;
  description: string;
  category: string;
  timeLimit: number;
  group?: string;
  statement: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  notes?: string[];
}

export interface List {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'closed';
  class: string;
}

export interface Submission {
  id: string;
  code: string;
  language: string;
  status: 'pending' | 'accepted' | 'error' | 'timeout' | 'compilation_error';
  score: number;
  attempt: number;
  submittedAt: string;
  executionTime?: number;
  memoryUsed?: number;
  feedback?: string;
  testCases?: {
    number: number;
    status: 'accepted' | 'error' | 'timeout';
    input: string;
    expectedOutput: string;
    actualOutput: string;
  }[];
}




