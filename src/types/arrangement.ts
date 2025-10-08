
export interface QuestionGroup {
  id: string;
  name: string;
  questions: string[];
  minRequired: number;
  pointsPerQuestion: number;
  color: string;
}

export interface QuestionArrangement {
  id: string;
  name: string;
  description: string;
  groups: QuestionGroup[];
  requireAllGroups: boolean;
  maxScore: number;
  passingScore: number;
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
  finalGrade: number;
  requirementsMet: boolean;
}
