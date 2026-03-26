import {
  User, Project, Task, Client, Comment, TimeLog, DashboardStats,
  CalendarEvent, Lead, Approval, ApprovalStatus,
} from './types';
import { generateId } from './utils';

// ─── API Service ─────────────────────────────────────────────────────────────

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL?.trim();

/** Flag to indicate if we are in mock mode (now always false when URL is provided) */
export const USE_MOCK = false;

async function callAPI<T>(action: string, params: Record<string, unknown> = {}): Promise<T> {
  if (!APPS_SCRIPT_URL) throw new Error('API URL not configured in .env.local');
  
  const url = new URL(APPS_SCRIPT_URL);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) url.searchParams.set(k, String(v));
  });

  const res = await fetch(url.toString(), { method: 'GET' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data as T;
}

async function postAPI<T>(action: string, body: object): Promise<T> {
  if (!APPS_SCRIPT_URL) throw new Error('API URL not configured in .env.local');
  
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...body }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data as T;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  return callAPI<User[]>('getUsers');
}

export async function login(email: string, password: string): Promise<User> {
  return postAPI<User>('login', { email, password });
}

export async function updateUser(u: Partial<User> & { id: string }): Promise<User> {
  return postAPI<User>('updateUser', u);
}

export async function uploadAvatar(userId: string, base64: string, fileName: string): Promise<{ avatar: string }> {
  return postAPI<{ avatar: string }>('uploadAvatar', { userId, base64, fileName });
}

// ─── Projects ────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  return callAPI<Project[]>('getProjects');
}

export async function createProject(payload: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const now = new Date().toISOString();
  const newProject: Project = { ...payload, id: generateId(), createdAt: now, updatedAt: now };
  return postAPI<Project>('createProject', newProject);
}

export async function updateProject(id: string, payload: Partial<Project>): Promise<Project> {
  const now = new Date().toISOString();
  return postAPI<Project>('updateProject', { id, ...payload, updatedAt: now });
}

export async function deleteProject(id: string): Promise<void> {
  await postAPI<void>('deleteProject', { id });
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export async function getTasks(projectId?: string): Promise<Task[]> {
  return callAPI<Task[]>('getTasks', projectId ? { projectId } : {});
}

export async function createTask(payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const now = new Date().toISOString();
  const newTask: Task = { ...payload, id: generateId(), createdAt: now, updatedAt: now };
  return postAPI<Task>('createTask', newTask);
}

export async function updateTask(id: string, payload: Partial<Task>): Promise<Task> {
  const now = new Date().toISOString();
  return postAPI<Task>('updateTask', { id, ...payload, updatedAt: now });
}

export async function deleteTask(id: string): Promise<void> {
  await postAPI<void>('deleteTask', { id });
}

// ─── Clients ─────────────────────────────────────────────────────────────────

export async function getClients(): Promise<Client[]> {
  return callAPI<Client[]>('getClients');
}

export async function createClient(payload: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
  const now = new Date().toISOString();
  const newClient: Client = { ...payload, id: generateId(), createdAt: now, updatedAt: now };
  return postAPI<Client>('createClient', newClient);
}

export async function updateClient(id: string, payload: Partial<Client>): Promise<Client> {
  const now = new Date().toISOString();
  return postAPI<Client>('updateClient', { id, ...payload, updatedAt: now });
}

export async function deleteClient(id: string): Promise<void> {
  await postAPI<void>('deleteClient', { id });
}

// ─── Comments ────────────────────────────────────────────────────────────────

export async function getComments(taskId: string): Promise<Comment[]> {
  return callAPI<Comment[]>('getComments', { taskId });
}

export async function addComment(payload: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
  const now = new Date().toISOString();
  const newComment: Comment = { ...payload, id: generateId(), createdAt: now };
  return postAPI<Comment>('addComment', { ...newComment });
}

// ─── Time Logs ───────────────────────────────────────────────────────────────

export async function getTimeLogs(taskId?: string, projectId?: string): Promise<TimeLog[]> {
  return callAPI<TimeLog[]>('getTimeLogs', { taskId, projectId });
}

export async function logTime(payload: Omit<TimeLog, 'id' | 'createdAt'>): Promise<TimeLog> {
  const now = new Date().toISOString();
  const newLog: TimeLog = { ...payload, id: generateId(), createdAt: now };
  return postAPI<TimeLog>('logTime', { ...newLog });
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  return callAPI<DashboardStats>('getDashboardStats');
}

// ─── Calendar Events ─────────────────────────────────────────────────────────

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  return callAPI<CalendarEvent[]>('getCalendarEvents');
}

export async function createCalendarEvent(payload: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
  const now = new Date().toISOString();
  const ev: CalendarEvent = { ...payload, id: generateId(), createdAt: now, updatedAt: now };
  return postAPI<CalendarEvent>('createCalendarEvent', ev);
}

export async function updateCalendarEvent(id: string, payload: Partial<CalendarEvent>): Promise<CalendarEvent> {
  const now = new Date().toISOString();
  return postAPI<CalendarEvent>('updateCalendarEvent', { id, ...payload, updatedAt: now });
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  await postAPI<void>('deleteCalendarEvent', { id });
}

// ─── Leads ───────────────────────────────────────────────────────────────────

export async function getLeads(): Promise<Lead[]> {
  return callAPI<Lead[]>('getLeads');
}

export async function createLead(payload: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
  const now = new Date().toISOString();
  const lead: Lead = { ...payload, id: generateId(), createdAt: now, updatedAt: now };
  return postAPI<Lead>('createLead', lead);
}

export async function updateLead(id: string, payload: Partial<Lead>): Promise<Lead> {
  const now = new Date().toISOString();
  return postAPI<Lead>('updateLead', { id, ...payload, updatedAt: now });
}

export async function deleteLead(id: string): Promise<void> {
  await postAPI<void>('deleteLead', { id });
}

// ─── Approvals ───────────────────────────────────────────────────────────────

export async function requestApproval(taskId: string, approverIds: string[], approverNames: string[]): Promise<Task> {
  const now = new Date().toISOString();
  const approvals: Approval[] = approverIds.map((id, i) => ({
    id: generateId(),
    taskId,
    approverId: id,
    approverName: approverNames[i] || id,
    status: 'pending',
    createdAt: now,
  }));
  return postAPI<Task>('requestApproval', { taskId, approverIds, approverNames, approvals });
}

export async function submitApproval(taskId: string, approverId: string, status: ApprovalStatus, remark?: string): Promise<Task> {
  return postAPI<Task>('submitApproval', { taskId, approverId, status, remark });
}
