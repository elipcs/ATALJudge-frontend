export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  classId?: string;
}

export type UserRole = 'student' | 'assistant' | 'professor';

export interface Student {
  id: string;
  name: string;
  email: string;
  studentRegistration: string;
  role: string;
  classId: string;
  grades: { questionListId: string; score: number }[];
  created_at: string;
}

export interface Class {
  id: string;
  name: string;
  professor: Professor | null;
  students: Student[];
  student_count: number;
  created_at: string;
  updated_at: string;
}

export interface Professor {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Question {
  id: string;
  title: string;
  description?: string;
  statement: string;
  input: string;
  output: string;
  examples: Array<{
    input: string;
    output: string;
  }>;
  tags: string[];
  timeLimit: string;
  memoryLimit: string;
  referenceCode?: string;
  referenceLanguage?: 'python' | 'java' ;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    isPublic: boolean;
  }>;
}

export interface Submission {
  id: string;
  questionList: { id: string; name: string };
  question: { id: string; name: string };
  student: { id: string; name: string; class: { id: string; name: string } };
  status: 'pending' | 'accepted' | 'error' | 'timeout';
  score: number;
  language: string;
  code: string;
  submittedAt: string;
  verdict: string;
}

export interface Invite {
  id: string;
  role: 'student' | 'assistant' | 'professor';
  token: string;
  link: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  maxUses: number;
  currentUses: number;
  classId?: string;
  className?: string;
  createdBy: string;
  creatorName: string;
}

export interface QuestionList {
  id: string;
  title: string;
  description?: string;
  classIds: string[];
  questions: Question[];
  startDate: string;
  endDate: string;
  status: 'published' | 'draft';
  createdAt?: string;
  updatedAt?: string;
  calculatedStatus?: 'next' | 'open' | 'closed';
}

export interface QuickAction {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  hoverColor: string;
  iconColor: string;
}

export interface SystemNotice {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
}

export interface WelcomeHeaderProps {
  currentUser: User;
  title?: string;
  subtitle?: string;
  extraInfo?: React.ReactNode;
  children?: React.ReactNode;
}

export interface QuickActionsProps {
  actions: QuickAction[];
}

export interface UserActionsProps {
  userRole: string;
}

export interface StudentHomeProps {
  currentUser: User;
}

export interface ProfessorHomeProps {
  currentUser: User;
}

export interface MonitorHomeProps {
  currentUser: User;
}

export interface StaffHomeProps {
  currentUser: User;
  userRole: 'professor' | 'assistant';
}

export interface SubmissionsTableProps {
  submissions: Submission[];
  showActions?: boolean;
}

export * from './arrangement';
