export { default as WelcomeHeader } from './WelcomeHeader';
export { default as QuickActions } from './QuickActions';
export { default as SubmissionsTable } from './SubmissionsTable';
export { default as ListsComponent } from './ListsComponent';
export { default as SystemNotices } from './SystemNotices';
export { default as UserActions } from './UserActions';
export { default as SystemNoticesComponent } from './SystemNoticesComponent';
export { default as StudentHome } from './StudentHome';
export { default as StaffHome } from './StaffHome';

// Re-export types from central types file
export type { 
  User, 
  UserRole, 
  Student, 
  Class, 
  QuickAction, 
  SystemNotice,
  WelcomeHeaderProps,
  QuickActionsProps,
  UserActionsProps,
  StudentHomeProps,
  ProfessorHomeProps,
  MonitorHomeProps,
  SubmissionsTableProps
} from '../../types';
