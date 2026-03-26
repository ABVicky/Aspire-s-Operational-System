export type UserRole = 'admin' | 'manager' | 'member';
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue';

// Calendar
export type CalendarEventType = 'post' | 'shoot' | 'meeting' | 'deadline';
export type SocialPlatform = 'Instagram' | 'Facebook' | 'LinkedIn' | 'YouTube' | 'Twitter' | 'Other';

// Lead CRM
export type LeadStatus = 'new' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost';

// Approval
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subRole?: 'bde' | null;
  managerId?: string;
  rating?: number;
  phone?: string;
  department?: string;
  avatar?: string;
  salary?: number;
  joiningDate?: string;
  employeeType?: 'full_time' | 'part_time' | 'intern' | 'contract';
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName?: string;
  status: ProjectStatus;
  startDate?: string;
  dueDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Approval {
  id: string;
  taskId: string;
  approverId: string;
  approverName: string;
  status: ApprovalStatus;
  remark?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  description?: string;
  assigneeId?: string;
  assigneeName?: string;
  creatorId?: string;
  creatorName?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  // Approval workflow
  approvalRequired?: boolean;
  approverIds?: string[];
  approvals?: Approval[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
}

export interface TimeLog {
  id: string;
  taskId: string;
  projectId: string;
  userId: string;
  userName?: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in seconds
  notes?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  platform?: SocialPlatform;
  assigneeId?: string;
  assigneeName?: string;
  creatorId?: string;
  creatorName?: string;
  projectId?: string;
  projectName?: string;
  clientId?: string;
  clientName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  source?: string;
  status: LeadStatus;
  value?: number;
  notes?: string;
  assigneeId?: string;
  assigneeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  activeTasks: number;
  completedTasks: number;
  totalTimeLogged: number; // in seconds
  projectsTrend: string;
  tasksTrend: string;
  completionRate: string;
  recentActivity: ActivityItem[];
  tasksByStatus: Record<TaskStatus, number>;
  timeLoggedByDay: { date: string; hours: number }[];
}

export interface ActivityItem {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_completed' | 'comment_added' | 'time_logged' | 'project_created';
  message: string;
  userId: string;
  userName: string;
  entityId: string;
  entityName: string;
  createdAt: string;
}

export interface Session {
  user: User;
  token: string;
}
