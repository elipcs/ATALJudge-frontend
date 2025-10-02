// Tipos para o sistema de arranjos de questões

export interface QuestionGroup {
  id: string;
  name: string;
  questions: string[]; // IDs das questões
  minRequired: number; // Mínimo de questões a serem resolvidas do grupo
  pointsPerQuestion: number; // Pontos por questão resolvida
  color: string; // Cor do grupo para interface
}

export interface QuestionArrangement {
  id: string;
  name: string;
  description: string;
  groups: QuestionGroup[];
  requireAllGroups: boolean; // Se true, precisa resolver questões de todos os grupos
  maxScore: number; // Nota máxima possível (ex: 10)
  passingScore: number; // Nota mínima para aprovação
}

export interface GroupResult {
  questionsSolved: string[];
  points: number;
  completed: boolean;
  progress: string;
  groupInfo: QuestionGroup;
}

export interface ArrangementResult {
  completed: boolean;
  groups: { [groupId: string]: GroupResult };
  totalScore: number;
  finalGrade: number; // Nota final calculada (0-10)
  requirementsMet: boolean;
}
