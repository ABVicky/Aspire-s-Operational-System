import {
  User, Project, Task, Client, Comment, TimeLog, DashboardStats,
  CalendarEvent, Lead, Approval, ApprovalStatus,
} from './types';
import { generateId } from './utils';

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  // ── SUPER ADMINS ──────────────────────────────────────────────────────────
  {
    id: 'emp001', name: 'Aashutosh Jaiswal', email: 'ceo@aspire.com',
    phone: '9876543210', department: 'CEO', role: 'admin',
    employeeType: 'full_time', joiningDate: '2019-01-01',
    avatar: 'https://drive.google.com/uc?id=1w2O-Kir4YUOGdF_W4R3yxcuZS9nBVWya',
    createdAt: '2019-01-01T00:00:00Z',
  },
  {
    id: 'emp031', name: 'Atisha Tibrewal', email: 'coo@aspire.com',
    department: 'COO', role: 'admin', salary: 1000000,
    employeeType: 'full_time', joiningDate: '2019-01-01',
    createdAt: '2019-01-01T00:00:00Z',
  },

  // ── MANAGERS ──────────────────────────────────────────────────────────────
  {
    id: 'emp002', name: 'Prachi Tiwari', email: 'prachitiwari8282@gmail.com',
    phone: '8910993398', department: 'HR', role: 'manager', salary: 20000,
    employeeType: 'full_time', managerId: 'emp001', joiningDate: '2025-12-08',
    createdAt: '2025-12-08T00:00:00Z',
  },
  {
    id: 'emp009', name: 'Harshita Agrawal', email: 'harshitaagrawal49183@gmail.com',
    phone: '9903587017', department: 'BDM', role: 'manager', salary: 150000,
    employeeType: 'full_time', managerId: 'emp002', joiningDate: '2025-01-01',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'emp025', name: 'Trisagni Mukherjee', email: 'trisagnim@gmail.com',
    department: 'GRAPHICS', role: 'manager', salary: 23000,
    employeeType: 'full_time', managerId: 'emp002', joiningDate: '2023-12-01',
    createdAt: '2023-12-01T00:00:00Z',
  },
  {
    id: 'emp029', name: 'Melanie Savyell', email: 'melaniesavyell@gmail.com',
    phone: '6291497830', department: 'CONTENT HEAD', role: 'manager', salary: 150000,
    employeeType: 'full_time', managerId: 'emp002', joiningDate: '2023-07-24',
    createdAt: '2023-07-24T00:00:00Z',
  },
  {
    id: 'emp022', name: 'Pradip Kumar Das', email: 'finance@aspire.com',
    phone: '9836839893', department: 'ACCOUNTS', role: 'manager', salary: 20000,
    employeeType: 'full_time', joiningDate: '2024-04-22',
    createdAt: '2024-04-22T00:00:00Z',
  },

  // ── EMPLOYEES ─────────────────────────────────────────────────────────────
  {
    id: 'emp003', name: 'Soumyanetra Mitra', email: 'soumyanetra1@gmail.com',
    phone: '9432314638', department: 'GRAPHICS', role: 'member', salary: 20000,
    employeeType: 'full_time', managerId: 'emp002', joiningDate: '2024-05-14',
    createdAt: '2024-05-14T00:00:00Z',
  },
  {
    id: 'emp004', name: 'Shivam Saha', email: 'shivamsaha657@gmail.com',
    phone: '9073244782', department: 'DME', role: 'member', salary: 150000,
    employeeType: 'full_time', joiningDate: '2025-03-10',
    createdAt: '2025-03-10T00:00:00Z',
  },
  {
    id: 'emp005', name: 'Uditi Das', email: 'uditidas92@gmail.com',
    phone: '9007917224', department: 'GRAPHICS', role: 'member', salary: 23000,
    employeeType: 'full_time', joiningDate: '2024-02-01',
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'emp006', name: 'Akshita Singh', email: 'sakshita237@gmail.com',
    phone: '8961613008', department: 'SME', role: 'member', salary: 25000,
    employeeType: 'full_time', joiningDate: '2025-11-10',
    createdAt: '2025-11-10T00:00:00Z',
  },
  {
    id: 'emp007', name: 'Niloy Roy', email: 'niloyroy555@gmail.com',
    phone: '7980365851', department: 'VIDEO EDITOR', role: 'member', salary: 20000,
    employeeType: 'full_time', joiningDate: '2025-12-02',
    avatar: 'https://drive.google.com/uc?id=1DgPO0Onk0ed3KUmscUYr0ERyHK0fnt0Q',
    createdAt: '2025-12-02T00:00:00Z',
  },
  {
    id: 'emp008', name: 'Amit Sur', email: 'amitsur0007@gmail.com',
    phone: '8001791570', department: 'GRAPHICS', role: 'member', salary: 20000,
    employeeType: 'full_time', joiningDate: '2025-03-03',
    createdAt: '2025-03-03T00:00:00Z',
  },
  {
    id: 'emp010', name: 'Kallol Roy', email: 'kallol.roy20@gmail.com',
    phone: '9038726144', department: 'VIDEO EDITOR', role: 'member', salary: 23000,
    employeeType: 'full_time', joiningDate: '2025-09-15',
    createdAt: '2025-09-15T00:00:00Z',
  },
  {
    id: 'emp011', name: 'Ashish Rajan', email: 'ashish89ranjan1998@gmail.com',
    phone: '6375779105', department: 'WEBSITE DEVELOPER', role: 'member', salary: 25000,
    employeeType: 'full_time', joiningDate: '2024-10-16',
    createdAt: '2024-10-16T00:00:00Z',
  },
  {
    id: 'emp012', name: 'Trishala Singh', email: 'trishalasinghh17@gmail.com',
    phone: '7439621773', department: 'INTERN', role: 'member', salary: 20000,
    employeeType: 'full_time', joiningDate: '2026-01-19',
    createdAt: '2026-01-19T00:00:00Z',
  },
  {
    id: 'emp013', name: 'Vicky Prasad Mahato', email: 'vickyprasadmahato34@gmail.com',
    phone: '6291252407', department: 'Management', role: 'member', salary: 20000,
    employeeType: 'full_time', joiningDate: '2026-01-19',
    avatar: 'https://drive.google.com/uc?id=1YWJbK4zB0a-bon1utnqYkjlL43uK0q__',
    createdAt: '2026-01-19T00:00:00Z',
  },
  {
    id: 'emp014', name: 'Anushmita Das Gupta', email: 'anushmitadasgupta@gmail.com',
    phone: '9836518729', department: 'Jr. SME & CC', role: 'member', salary: 150000,
    employeeType: 'full_time', joiningDate: '2026-01-19',
    createdAt: '2026-01-19T00:00:00Z',
  },
  {
    id: 'emp015', name: 'Dibyani Bhattacharya', email: 'divyabhatta.2001@gmail.com',
    phone: '8276843499', department: 'INTERN', role: 'member', salary: 23000,
    employeeType: 'full_time', joiningDate: '2026-01-27',
    createdAt: '2026-01-27T00:00:00Z',
  },
  {
    id: 'emp016', name: 'Dibya Debasmita Pradhan', email: 'dibyadebasmitap@gmail.com',
    phone: '7003118229', department: 'INTERN', role: 'member', salary: 25000,
    employeeType: 'full_time', joiningDate: '2026-01-20',
    createdAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'emp017', name: 'Mehuli Das', email: 'mehuli.das.bms24@tha.edu.in',
    phone: '7439934447', department: 'SMM', role: 'member', salary: 20000,
    employeeType: 'full_time', joiningDate: '2026-02-02',
    createdAt: '2026-02-02T00:00:00Z',
  },
  {
    id: 'emp018', name: 'Annawasha Naskar', email: 'annawasha1927@gmail.com',
    phone: '9804114784', department: 'CONTENT WRITER', role: 'member', salary: 20000,
    employeeType: 'full_time', joiningDate: '2026-02-02',
    createdAt: '2026-02-02T00:00:00Z',
  },
  {
    id: 'emp019', name: 'Ani Kumari', email: 'designeraspire001@gmail.com',
    phone: '8825349787', department: 'SEO & DME', role: 'member', salary: 150000,
    employeeType: 'full_time', joiningDate: '2026-02-09',
    createdAt: '2026-02-09T00:00:00Z',
  },
  {
    id: 'emp020', name: 'Archana Kedia', email: 'archanakedia33@gmail.com',
    phone: '8910885581', department: 'SME', role: 'member', salary: 23000,
    employeeType: 'full_time', joiningDate: '2026-02-23',
    createdAt: '2026-02-23T00:00:00Z',
  },
  {
    id: 'emp021', name: 'Aman Jaiswal', email: 'amanjaiswaal26@gmail.com',
    phone: '9748577864', department: 'DME', role: 'member', salary: 25000,
    employeeType: 'full_time', joiningDate: '2026-03-02',
    createdAt: '2026-03-02T00:00:00Z',
  },
  {
    id: 'emp023', name: 'Achelal Gaun', email: '',
    phone: '8777269529', department: 'Operations', role: 'member', salary: 20000,
    employeeType: 'full_time', joiningDate: '2021-03-02',
    createdAt: '2021-03-02T00:00:00Z',
  },
  {
    id: 'emp024', name: 'Soma Ram', email: 'sanusomaram2017@gmail.com',
    department: 'BACK OFFICE', role: 'member', salary: 150000,
    employeeType: 'full_time', joiningDate: '2025-11-10',
    createdAt: '2025-11-10T00:00:00Z',
  },
  {
    id: 'emp026', name: 'Tarun Paul', email: 'tarunpaul378@gmail.com',
    phone: '9330381272', department: 'GRAPHICS', role: 'member', salary: 25000,
    employeeType: 'full_time', joiningDate: '2024-05-28',
    createdAt: '2024-05-28T00:00:00Z',
  },
  {
    id: 'emp027', name: 'Sakshi Khemka', email: 'khemkasakshi2002@gmail.com',
    phone: '9331655005', department: 'SME', role: 'member', salary: 20000,
    employeeType: 'full_time', joiningDate: '2025-10-15',
    createdAt: '2025-10-15T00:00:00Z',
  },
  {
    id: 'emp028', name: 'Swapner Akash', email: 'swapnerakash666@gmail.com',
    phone: '9593623382', department: 'PHOTOGRAPHER', role: 'member', salary: 20000,
    employeeType: 'full_time', joiningDate: '2024-11-18',
    avatar: 'https://drive.google.com/uc?id=1mXiIyYaNOycGl8KLUAcuCiXk4_78Wdrd',
    createdAt: '2024-11-18T00:00:00Z',
  },
  {
    id: 'emp030', name: 'Md Imran', email: 'hunk700359@gmail.com',
    phone: '9831931344', department: 'VIDEO EDITOR', role: 'member', salary: 23000,
    employeeType: 'full_time', joiningDate: '2025-09-20',
    createdAt: '2025-09-20T00:00:00Z',
  },
];

export const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'TechCorp India', email: 'contact@techcorp.in', phone: '+91-9876543210', company: 'TechCorp India Pvt. Ltd.', paymentStatus: 'paid', createdAt: '2024-01-10T09:00:00Z', updatedAt: '2024-03-01T09:00:00Z' },
  { id: 'c2', name: 'RetailHub', email: 'info@retailhub.com', phone: '+91-9123456789', company: 'RetailHub Solutions', paymentStatus: 'partial', createdAt: '2024-02-01T09:00:00Z', updatedAt: '2024-03-05T09:00:00Z' },
  { id: 'c3', name: 'FinanceFirst', email: 'hello@financefirst.io', company: 'FinanceFirst Ltd.', paymentStatus: 'pending', createdAt: '2024-02-20T09:00:00Z', updatedAt: '2024-02-20T09:00:00Z' },
  { id: 'c4', name: 'HealthPlus', email: 'projects@healthplus.org', company: 'HealthPlus Clinics', paymentStatus: 'overdue', createdAt: '2024-03-01T09:00:00Z', updatedAt: '2024-03-01T09:00:00Z' },
];

export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: 'TechCorp Rebrand', clientId: 'c1', clientName: 'TechCorp India', status: 'active', startDate: '2024-02-01', dueDate: '2024-04-30', description: 'Full brand identity overhaul including logo, guidelines, and website.', createdAt: '2024-02-01T09:00:00Z', updatedAt: '2024-03-10T09:00:00Z' },
  { id: 'p2', name: 'RetailHub E-commerce', clientId: 'c2', clientName: 'RetailHub', status: 'active', startDate: '2024-02-15', dueDate: '2024-05-15', description: 'Build a multi-vendor e-commerce platform with inventory management.', createdAt: '2024-02-15T09:00:00Z', updatedAt: '2024-03-08T09:00:00Z' },
  { id: 'p3', name: 'FinanceFirst Dashboard', clientId: 'c3', clientName: 'FinanceFirst', status: 'planning', startDate: '2024-03-01', dueDate: '2024-06-01', description: 'Analytics dashboard for financial performance tracking.', createdAt: '2024-03-01T09:00:00Z', updatedAt: '2024-03-01T09:00:00Z' },
  { id: 'p4', name: 'HealthPlus Mobile App', clientId: 'c4', clientName: 'HealthPlus', status: 'on-hold', startDate: '2024-01-15', dueDate: '2024-04-15', description: 'Patient-facing mobile app for appointment booking.', createdAt: '2024-01-15T09:00:00Z', updatedAt: '2024-02-28T09:00:00Z' },
  { id: 'p5', name: 'TechCorp SEO Campaign', clientId: 'c1', clientName: 'TechCorp India', status: 'completed', startDate: '2024-01-01', dueDate: '2024-02-28', description: '3-month SEO and content strategy campaign.', createdAt: '2024-01-01T09:00:00Z', updatedAt: '2024-02-28T09:00:00Z' },
];

export const MOCK_TASKS: Task[] = [
  { id: 't1', projectId: 'p1', projectName: 'TechCorp Rebrand', title: 'Design new logo concepts', description: 'Create 5 initial logo concepts for client review. Focus on modern, minimal aesthetic.', assigneeId: 'emp002', assigneeName: 'Prachi Tiwari', status: 'done', priority: 'high', dueDate: '2024-03-05', createdAt: '2024-02-01T10:00:00Z', updatedAt: '2024-03-05T14:00:00Z' },
  { id: 't2', projectId: 'p1', projectName: 'TechCorp Rebrand', title: 'Brand guidelines document', description: 'Create comprehensive brand guidelines covering typography, colors, imagery, and usage.', assigneeId: 'emp002', assigneeName: 'Prachi Tiwari', status: 'in-progress', priority: 'high', dueDate: '2024-03-25', createdAt: '2024-02-10T10:00:00Z', updatedAt: '2024-03-12T09:00:00Z' },
  { id: 't3', projectId: 'p1', projectName: 'TechCorp Rebrand', title: 'Website redesign wireframes', description: 'Create low and high-fidelity wireframes for all key pages.', assigneeId: 'emp003', assigneeName: 'Soumyanetra Mitra', status: 'review', priority: 'medium', dueDate: '2024-03-20', createdAt: '2024-02-15T10:00:00Z', updatedAt: '2024-03-18T16:00:00Z' },
  { id: 't4', projectId: 'p2', projectName: 'RetailHub E-commerce', title: 'Set up Next.js project', description: 'Initialize the project with all required dependencies and folder structure.', assigneeId: 'emp003', assigneeName: 'Soumyanetra Mitra', status: 'done', priority: 'urgent', dueDate: '2024-02-20', createdAt: '2024-02-15T10:00:00Z', updatedAt: '2024-02-19T17:00:00Z' },
  { id: 't5', projectId: 'p2', projectName: 'RetailHub E-commerce', title: 'Product listing page UI', description: 'Build the product grid with filters, sorting and pagination.', assigneeId: 'emp004', assigneeName: 'Shivam Saha', status: 'in-progress', priority: 'high', dueDate: '2024-03-30', createdAt: '2024-02-20T10:00:00Z', updatedAt: '2024-03-10T10:00:00Z' },
  { id: 't6', projectId: 'p2', projectName: 'RetailHub E-commerce', title: 'Shopping cart & checkout', description: 'Implement cart state management and multi-step checkout flow.', assigneeId: 'emp003', assigneeName: 'Soumyanetra Mitra', status: 'todo', priority: 'high', dueDate: '2024-04-15', createdAt: '2024-02-25T10:00:00Z', updatedAt: '2024-02-25T10:00:00Z' },
  { id: 't7', projectId: 'p3', projectName: 'FinanceFirst Dashboard', title: 'Requirements gathering', description: 'Meet with client to document all dashboard requirements and KPIs.', assigneeId: 'emp001', assigneeName: 'Aashutosh Jaiswal', status: 'in-progress', priority: 'medium', dueDate: '2024-03-25', createdAt: '2024-03-01T10:00:00Z', updatedAt: '2024-03-12T10:00:00Z' },
  { id: 't8', projectId: 'p2', projectName: 'RetailHub E-commerce', title: 'Payment gateway integration', description: 'Integrate Razorpay for payment processing.', assigneeId: 'emp004', assigneeName: 'Shivam Saha', status: 'todo', priority: 'urgent', dueDate: '2024-04-20', createdAt: '2024-03-01T10:00:00Z', updatedAt: '2024-03-01T10:00:00Z' },
];

export const MOCK_COMMENTS: Comment[] = [
  { id: 'cm1', taskId: 't2', userId: 'emp001', userName: 'Aashutosh Jaiswal', text: 'Please use the color palette shared in the brand.pdf file. Ensure WCAG AA compliance.', createdAt: '2024-03-10T10:00:00Z' },
  { id: 'cm2', taskId: 't2', userId: 'emp002', userName: 'Prachi Tiwari', text: 'Understood! Working on the typography section first. Will share a draft by EOD.', createdAt: '2024-03-10T11:30:00Z' },
  { id: 'cm3', taskId: 't3', userId: 'emp001', userName: 'Aashutosh Jaiswal', text: 'The wireframes look great! Minor feedback: increase spacing on the hero section.', createdAt: '2024-03-18T17:00:00Z' },
];

export const MOCK_TIME_LOGS: TimeLog[] = [
  { id: 'tl1', taskId: 't1', projectId: 'p1', userId: 'emp002', userName: 'Prachi Tiwari', startTime: '2024-02-20T09:00:00Z', endTime: '2024-02-20T13:00:00Z', duration: 14400, notes: 'Initial concept sketches', createdAt: '2024-02-20T13:00:00Z' },
  { id: 'tl2', taskId: 't1', projectId: 'p1', userId: 'emp002', userName: 'Prachi Tiwari', startTime: '2024-02-21T09:00:00Z', endTime: '2024-02-21T12:30:00Z', duration: 12600, notes: 'Refined top 3 concepts', createdAt: '2024-02-21T12:30:00Z' },
  { id: 'tl3', taskId: 't2', projectId: 'p1', userId: 'emp002', userName: 'Prachi Tiwari', startTime: '2024-03-11T10:00:00Z', endTime: '2024-03-11T16:00:00Z', duration: 21600, notes: 'Typography and color sections', createdAt: '2024-03-11T16:00:00Z' },
  { id: 'tl4', taskId: 't5', projectId: 'p2', userId: 'emp004', userName: 'Shivam Saha', startTime: '2024-03-10T09:00:00Z', endTime: '2024-03-10T17:30:00Z', duration: 30600, notes: 'Product grid component', createdAt: '2024-03-10T17:30:00Z' },
];

// ─── API Service ─────────────────────────────────────────────────────────────

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL?.trim();
const USE_MOCK = !APPS_SCRIPT_URL;

async function callAPI<T>(action: string, params: Record<string, unknown> = {}): Promise<T> {
  if (USE_MOCK) {
    throw new Error('Mock mode: use mock data directly');
  }
  const url = new URL(APPS_SCRIPT_URL!);
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
  if (USE_MOCK) throw new Error('Mock mode');
  const res = await fetch(APPS_SCRIPT_URL!, {
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
  if (USE_MOCK) return MOCK_USERS;
  return callAPI<User[]>('getUsers');
}

export async function login(email: string, password: string): Promise<User> {
  if (USE_MOCK) {
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('No account found with this email address.');
    // In mock mode accept any password; in real mode Apps Script validates
    return user;
  }
  return postAPI<User>('login', { email, password });
}

export async function updateUser(u: Partial<User> & { id: string }): Promise<User> {
  if (USE_MOCK) {
    const idx = MOCK_USERS.findIndex(x => x.id === u.id);
    if (idx === -1) throw new Error('User not found');
    MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...u };
    return MOCK_USERS[idx];
  }
  return postAPI<User>('updateUser', u);
}

export async function uploadAvatar(userId: string, base64: string, fileName: string): Promise<{ avatar: string }> {
  if (USE_MOCK) {
    const idx = MOCK_USERS.findIndex(x => x.id === userId);
    if (idx === -1) throw new Error('User not found');
    MOCK_USERS[idx].avatar = base64; // In mock just store data URL
    return { avatar: base64 };
  }
  return postAPI<{ avatar: string }>('uploadAvatar', { userId, base64, fileName });
}

// ─── Projects ────────────────────────────────────────────────────────────────

let _projectsCache: Project[] | null = null;

export async function getProjects(): Promise<Project[]> {
  if (USE_MOCK) {
    await delay(300);
    return MOCK_PROJECTS;
  }
  const data = await callAPI<Project[]>('getProjects');
  _projectsCache = data;
  return data;
}

export async function createProject(payload: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const now = new Date().toISOString();
  const newProject: Project = { ...payload, id: generateId(), createdAt: now, updatedAt: now };
  if (USE_MOCK) { await delay(400); MOCK_PROJECTS.push(newProject); return newProject; }
  return postAPI<Project>('createProject', newProject);
}

export async function updateProject(id: string, payload: Partial<Project>): Promise<Project> {
  const now = new Date().toISOString();
  if (USE_MOCK) {
    await delay(300);
    const idx = MOCK_PROJECTS.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    MOCK_PROJECTS[idx] = { ...MOCK_PROJECTS[idx], ...payload, updatedAt: now };
    return MOCK_PROJECTS[idx];
  }
  return postAPI<Project>('updateProject', { id, ...payload, updatedAt: now });
}

export async function deleteProject(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    const idx = MOCK_PROJECTS.findIndex((p) => p.id === id);
    if (idx !== -1) MOCK_PROJECTS.splice(idx, 1);
    return;
  }
  await postAPI<void>('deleteProject', { id });
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export async function getTasks(projectId?: string): Promise<Task[]> {
  if (USE_MOCK) {
    await delay(300);
    return projectId ? MOCK_TASKS.filter((t) => t.projectId === projectId) : MOCK_TASKS;
  }
  return callAPI<Task[]>('getTasks', projectId ? { projectId } : {});
}

export async function createTask(payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const now = new Date().toISOString();
  const newTask: Task = { ...payload, id: generateId(), createdAt: now, updatedAt: now };
  if (USE_MOCK) { await delay(400); MOCK_TASKS.push(newTask); return newTask; }
  return postAPI<Task>('createTask', newTask);
}

export async function updateTask(id: string, payload: Partial<Task>): Promise<Task> {
  const now = new Date().toISOString();
  if (USE_MOCK) {
    await delay(300);
    const idx = MOCK_TASKS.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Task not found');
    MOCK_TASKS[idx] = { ...MOCK_TASKS[idx], ...payload, updatedAt: now };
    return MOCK_TASKS[idx];
  }
  return postAPI<Task>('updateTask', { id, ...payload, updatedAt: now });
}

export async function deleteTask(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    const idx = MOCK_TASKS.findIndex((t) => t.id === id);
    if (idx !== -1) MOCK_TASKS.splice(idx, 1);
    return;
  }
  await postAPI<void>('deleteTask', { id });
}

// ─── Clients ─────────────────────────────────────────────────────────────────

export async function getClients(): Promise<Client[]> {
  if (USE_MOCK) { await delay(300); return MOCK_CLIENTS; }
  return callAPI<Client[]>('getClients');
}

export async function createClient(payload: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
  const now = new Date().toISOString();
  const newClient: Client = { ...payload, id: generateId(), createdAt: now, updatedAt: now };
  if (USE_MOCK) { await delay(400); MOCK_CLIENTS.push(newClient); return newClient; }
  return postAPI<Client>('createClient', newClient);
}

export async function updateClient(id: string, payload: Partial<Client>): Promise<Client> {
  const now = new Date().toISOString();
  if (USE_MOCK) {
    await delay(300);
    const idx = MOCK_CLIENTS.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Client not found');
    MOCK_CLIENTS[idx] = { ...MOCK_CLIENTS[idx], ...payload, updatedAt: now };
    return MOCK_CLIENTS[idx];
  }
  return postAPI<Client>('updateClient', { id, ...payload, updatedAt: now });
}

export async function deleteClient(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    const idx = MOCK_CLIENTS.findIndex((c) => c.id === id);
    if (idx !== -1) MOCK_CLIENTS.splice(idx, 1);
    return;
  }
  await postAPI<void>('deleteClient', { id });
}

// ─── Comments ────────────────────────────────────────────────────────────────

export async function getComments(taskId: string): Promise<Comment[]> {
  if (USE_MOCK) {
    await delay(200);
    return MOCK_COMMENTS.filter((c) => c.taskId === taskId);
  }
  return callAPI<Comment[]>('getComments', { taskId });
}

export async function addComment(payload: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
  const now = new Date().toISOString();
  const newComment: Comment = { ...payload, id: generateId(), createdAt: now };
  if (USE_MOCK) { await delay(300); MOCK_COMMENTS.push(newComment); return newComment; }
  return postAPI<Comment>('addComment', { ...newComment });
}

// ─── Time Logs ───────────────────────────────────────────────────────────────

export async function getTimeLogs(taskId?: string, projectId?: string): Promise<TimeLog[]> {
  if (USE_MOCK) {
    await delay(200);
    let logs = MOCK_TIME_LOGS;
    if (taskId) logs = logs.filter((l) => l.taskId === taskId);
    if (projectId) logs = logs.filter((l) => l.projectId === projectId);
    return logs;
  }
  return callAPI<TimeLog[]>('getTimeLogs', { taskId, projectId });
}

export async function logTime(payload: Omit<TimeLog, 'id' | 'createdAt'>): Promise<TimeLog> {
  const now = new Date().toISOString();
  const newLog: TimeLog = { ...payload, id: generateId(), createdAt: now };
  if (USE_MOCK) { await delay(300); MOCK_TIME_LOGS.push(newLog); return newLog; }
  return postAPI<TimeLog>('logTime', { ...newLog });
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCK) {
    await delay(400);
    const tasksByStatus = {
      'todo': MOCK_TASKS.filter((t) => t.status === 'todo').length,
      'in-progress': MOCK_TASKS.filter((t) => t.status === 'in-progress').length,
      'review': MOCK_TASKS.filter((t) => t.status === 'review').length,
      'done': MOCK_TASKS.filter((t) => t.status === 'done').length,
    };
    const totalTimeSecs = MOCK_TIME_LOGS.reduce((a, l) => a + (l.duration || 0), 0);
    return {
      totalProjects: MOCK_PROJECTS.length,
      activeProjects: MOCK_PROJECTS.filter((p) => p.status === 'active').length,
      activeTasks: MOCK_TASKS.filter((t) => t.status !== 'done').length,
      completedTasks: MOCK_TASKS.filter((t) => t.status === 'done').length,
      totalTimeLogged: totalTimeSecs,
      projectsTrend: '+2 this month',
      tasksTrend: '5 urgent',
      completionRate: '85% rate',
      tasksByStatus,
      timeLoggedByDay: Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        const hours = [5.5, 7, 6.5, 8, 4, 9, 3.5, 6, 7.5, 5, 4.5, 8.5, 6, 7, 5, 8, 9.5, 6.5, 4, 7, 5.5, 8, 6.5, 7, 9, 5, 4, 8, 7, 3.5][i % 30];
        return { date: d.toISOString().split('T')[0], hours };
      }),
      recentActivity: [
        { id: 'a1', type: 'task_updated', message: 'moved to Review', userId: 'emp003', userName: 'Soumyanetra Mitra', entityId: 't3', entityName: 'Website redesign wireframes', createdAt: '2024-03-18T16:00:00Z' },
        { id: 'a2', type: 'comment_added', message: 'commented on', userId: 'emp001', userName: 'Aashutosh Jaiswal', entityId: 't3', entityName: 'Website redesign wireframes', createdAt: '2024-03-18T17:00:00Z' },
        { id: 'a3', type: 'task_completed', message: 'completed', userId: 'emp002', userName: 'Prachi Tiwari', entityId: 't1', entityName: 'Design new logo concepts', createdAt: '2024-03-05T14:00:00Z' },
        { id: 'a4', type: 'time_logged', message: 'logged 8.5h on', userId: 'emp004', userName: 'Shivam Saha', entityId: 't5', entityName: 'Product listing page UI', createdAt: '2024-03-10T17:30:00Z' },
        { id: 'a5', type: 'project_created', message: 'created project', userId: 'emp001', userName: 'Aashutosh Jaiswal', entityId: 'p3', entityName: 'FinanceFirst Dashboard', createdAt: '2024-03-01T09:00:00Z' },
      ],
    };
  }
  return callAPI<DashboardStats>('getDashboardStats');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Calendar Events ─────────────────────────────────────────────────────────

export let MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'ev1', title: 'TechCorp Instagram Carousel', type: 'post', platform: 'Instagram', date: '2024-03-25', time: '10:00', assigneeId: 'emp003', assigneeName: 'Soumyanetra Mitra', projectId: 'p1', projectName: 'TechCorp Rebrand', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ev2', title: 'Product Shoot — HealthPlus', type: 'shoot', date: '2024-03-27', time: '09:00', assigneeId: 'emp002', assigneeName: 'Prachi Tiwari', clientId: 'c4', clientName: 'HealthPlus', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ev3', title: 'RetailHub Facebook Ad', type: 'post', platform: 'Facebook', date: '2024-03-28', time: '14:00', assigneeId: 'emp004', assigneeName: 'Shivam Saha', projectId: 'p2', projectName: 'RetailHub E-commerce', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ev4', title: 'Q1 Strategy Meeting', type: 'meeting', date: '2024-03-26', time: '11:00', assigneeId: 'emp001', assigneeName: 'Aashutosh Jaiswal', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  if (USE_MOCK) { await delay(300); return MOCK_CALENDAR_EVENTS; }
  return callAPI<CalendarEvent[]>('getCalendarEvents');
}

export async function createCalendarEvent(payload: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
  const now = new Date().toISOString();
  const ev: CalendarEvent = { ...payload, id: generateId(), createdAt: now, updatedAt: now };
  if (USE_MOCK) { await delay(300); MOCK_CALENDAR_EVENTS.push(ev); return ev; }
  return postAPI<CalendarEvent>('createCalendarEvent', ev);
}

export async function updateCalendarEvent(id: string, payload: Partial<CalendarEvent>): Promise<CalendarEvent> {
  const now = new Date().toISOString();
  if (USE_MOCK) {
    await delay(300);
    const idx = MOCK_CALENDAR_EVENTS.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Event not found');
    MOCK_CALENDAR_EVENTS[idx] = { ...MOCK_CALENDAR_EVENTS[idx], ...payload, updatedAt: now };
    return MOCK_CALENDAR_EVENTS[idx];
  }
  return postAPI<CalendarEvent>('updateCalendarEvent', { id, ...payload, updatedAt: now });
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    const idx = MOCK_CALENDAR_EVENTS.findIndex(e => e.id === id);
    if (idx !== -1) MOCK_CALENDAR_EVENTS.splice(idx, 1);
    return;
  }
  await postAPI<void>('deleteCalendarEvent', { id });
}

// ─── Leads ───────────────────────────────────────────────────────────────────

export let MOCK_LEADS: Lead[] = [
  { id: 'l1', name: 'Ravi Kapoor', company: 'UrbanStyle Pvt Ltd', email: 'ravi@urbanstyle.in', phone: '+91-9823456780', source: 'LinkedIn', status: 'new', value: 85000, notes: 'Interested in social media management.', assigneeId: 'emp004', assigneeName: 'Shivam Saha', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'l2', name: 'Sunita Reddy', company: 'GreenLeaf Foods', email: 'sunita@greenleaf.co', source: 'Referral', status: 'contacted', value: 120000, notes: 'Wants a full branding package.', assigneeId: 'emp004', assigneeName: 'Shivam Saha', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'l3', name: 'Mohit Jain', company: 'TechBridge', email: 'mohit@techbridge.io', source: 'Website', status: 'proposal', value: 200000, assigneeId: 'emp004', assigneeName: 'Shivam Saha', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'l4', name: 'Anjali Verma', company: 'Bloom Retail', source: 'Cold Call', status: 'won', value: 95000, assigneeId: 'emp004', assigneeName: 'Shivam Saha', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export async function getLeads(): Promise<Lead[]> {
  if (USE_MOCK) { await delay(300); return MOCK_LEADS; }
  return callAPI<Lead[]>('getLeads');
}

export async function createLead(payload: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
  const now = new Date().toISOString();
  const lead: Lead = { ...payload, id: generateId(), createdAt: now, updatedAt: now };
  if (USE_MOCK) { await delay(300); MOCK_LEADS.push(lead); return lead; }
  return postAPI<Lead>('createLead', lead);
}

export async function updateLead(id: string, payload: Partial<Lead>): Promise<Lead> {
  const now = new Date().toISOString();
  if (USE_MOCK) {
    await delay(300);
    const idx = MOCK_LEADS.findIndex(l => l.id === id);
    if (idx === -1) throw new Error('Lead not found');
    MOCK_LEADS[idx] = { ...MOCK_LEADS[idx], ...payload, updatedAt: now };
    return MOCK_LEADS[idx];
  }
  return postAPI<Lead>('updateLead', { id, ...payload, updatedAt: now });
}

export async function deleteLead(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    const idx = MOCK_LEADS.findIndex(l => l.id === id);
    if (idx !== -1) MOCK_LEADS.splice(idx, 1);
    return;
  }
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
  if (USE_MOCK) {
    await delay(300);
    const idx = MOCK_TASKS.findIndex(t => t.id === taskId);
    if (idx === -1) throw new Error('Task not found');
    MOCK_TASKS[idx] = { ...MOCK_TASKS[idx], approvalRequired: true, approverIds, approvals, updatedAt: now };
    return MOCK_TASKS[idx];
  }
  return postAPI<Task>('requestApproval', { taskId, approverIds, approverNames, approvals });
}

export async function submitApproval(taskId: string, approverId: string, status: ApprovalStatus, remark?: string): Promise<Task> {
  const now = new Date().toISOString();
  if (USE_MOCK) {
    await delay(300);
    const idx = MOCK_TASKS.findIndex(t => t.id === taskId);
    if (idx === -1) throw new Error('Task not found');
    const task = MOCK_TASKS[idx];
    const updatedApprovals = (task.approvals || []).map(a =>
      a.approverId === approverId ? { ...a, status, remark, createdAt: now } : a
    );
    // Auto-move to done if all approved
    let newStatus = task.status;
    if (status === 'rejected') {
      newStatus = 'todo';
    } else if (updatedApprovals.every(a => a.status === 'approved')) {
      newStatus = 'done';
    }
    MOCK_TASKS[idx] = { ...task, approvals: updatedApprovals, status: newStatus, updatedAt: now };
    // If rejected, add a comment automatically
    if (status === 'rejected' && remark) {
      const approver = updatedApprovals.find(a => a.approverId === approverId);
      MOCK_COMMENTS.push({ id: generateId(), taskId, userId: approverId, userName: approver?.approverName, text: `❌ Rejected: ${remark}`, createdAt: now });
    }
    return MOCK_TASKS[idx];
  }
  return postAPI<Task>('submitApproval', { taskId, approverId, status, remark });
}
