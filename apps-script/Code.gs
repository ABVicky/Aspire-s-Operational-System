/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║               ASPIRE OS — GOOGLE APPS SCRIPT BACKEND             ║
 * ║                  Aspire Digital Media · 2024                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * DEPLOYMENT INSTRUCTIONS:
 *  1. Open Google Sheets spreadsheet
 *  2. Extensions → Apps Script → paste this code
 *  3. Click Deploy → New Deployment → Web App
 *  4. Execute as: Me | Who has access: Anyone
 *  5. Copy the Web App URL → set as NEXT_PUBLIC_APPS_SCRIPT_URL in Vercel
 *
 * REQUIRED SHEETS (exact names):
 *  Users | Projects | Tasks | Clients | TimeLogs | Comments
 */

// ─── Sheet Names ──────────────────────────────────────────────────────────────
const SHEETS = {
  USERS: 'Users',
  PROJECTS: 'Projects',
  TASKS: 'Tasks',
  CLIENTS: 'Clients',
  TIME_LOGS: 'TimeLogs',
  COMMENTS: 'Comments',
  LEADS: 'Leads',
  CALENDAR_EVENTS: 'CalendarEvents',
  APPROVALS: 'Approvals',
};

// ─── CORS Headers ─────────────────────────────────────────────────────────────
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(data, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(message) {
  return jsonResponse({ error: message });
}

// ─── Entry Points ─────────────────────────────────────────────────────────────

function doGet(e) {
  try {
    const action = e.parameter.action;
    const params = e.parameter;

    switch (action) {
      case 'getUsers':        return jsonResponse(getUsers());
      case 'getProjects':     return jsonResponse(getProjects());
      case 'getTasks':        return jsonResponse(getTasks(params.projectId, params.userId));
      case 'getClients':      return jsonResponse(getClients());
      case 'getComments':     return jsonResponse(getComments(params.taskId));
      case 'getTimeLogs':     return jsonResponse(getTimeLogs(params.taskId, params.projectId));
      case 'getLeads':        return jsonResponse(getLeads());
      case 'getCalendarEvents': return jsonResponse(getCalendarEvents());
      case 'getDashboardStats': return jsonResponse(getDashboardStats(params.userId));
      case 'setup':          setupDatabase(); return jsonResponse({ success: true, message: 'Database initialized!' });
      default:                return errorResponse('Unknown action: ' + action);
    }
  } catch (err) {
    return errorResponse(err.toString());
  }
}

// ─── Automations ──────────────────────────────────────────────────────────────

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 Aspire OS')
    .addItem('Initialize Database', 'setupDatabase')
    .addSeparator()
    .addItem('Clear Cache', 'manualClearCache')
    .addToUi();
}

function manualClearCache() {
  const keys = ['users', 'projects', 'tasks', 'clients', 'leads', 'calendarEvents'];
  keys.forEach(k => { invalidateCache(k); });
  SpreadsheetApp.getUi().alert('Cache cleared successfully!');
}

function setupDatabase() {
  Object.values(SHEETS).forEach(name => {
    getSheet(name);
  });
  
  // Create default admin if Users is empty
  const userSheet = getSheet(SHEETS.USERS);
  if (userSheet.getLastRow() < 2) {
    // IMPORTANT: must match `initSheet()` header order:
    // ['id', 'name', 'email', 'password', 'role', 'managerId', 'rating', 'phone', 'department', 'avatar', 'createdAt']
    const admin = [
      'u_1',
      'Aspire Admin',
      'admin@aspire.os',
      'admin123',
      'admin',
      '', // managerId
      '', // rating
      '888-000-0000', // phone
      'Creative', // department
      '', // avatar
      new Date().toISOString(), // createdAt
    ];
    userSheet.appendRow(admin);
  }
  
  SpreadsheetApp.getUi().alert('✅ Aspire OS Database Successfully Initialized!\nAll required tabs and formatting have been applied.');
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    switch (action) {
      case 'login':          return jsonResponse(login(body.email, body.password));
      case 'createProject':  return jsonResponse(createProject(body));
      case 'updateProject':  return jsonResponse(updateProject(body));
      case 'deleteProject':  deleteProject(body.id); return jsonResponse({ success: true });
      case 'createTask':     return jsonResponse(createTask(body));
      case 'updateTask':     return jsonResponse(updateTask(body));
      case 'deleteTask':     deleteTask(body.id); return jsonResponse({ success: true });
      case 'createClient':   return jsonResponse(createClient(body));
      case 'updateClient':   return jsonResponse(updateClient(body));
      case 'deleteClient':   deleteClient(body.id); return jsonResponse({ success: true });
      case 'addComment':     return jsonResponse(addComment(body));
      case 'logTime':        return jsonResponse(logTime(body));
      case 'updateUser':     return jsonResponse(updateUser(body));
      case 'uploadAvatar':   return jsonResponse(uploadAvatar(body.userId, body.base64, body.fileName));
      case 'createLead':              return jsonResponse(createLead(body));
      case 'updateLead':              return jsonResponse(updateLead(body));
      case 'deleteLead':              deleteLead(body.id); return jsonResponse({ success: true });
      case 'createCalendarEvent':    return jsonResponse(createCalendarEvent(body));
      case 'updateCalendarEvent':    return jsonResponse(updateCalendarEvent(body));
      case 'deleteCalendarEvent':    deleteCalendarEvent(body.id); return jsonResponse({ success: true });
      case 'requestApproval':         return jsonResponse(requestApproval(body));
      case 'submitApproval':          return jsonResponse(submitApproval(body));
      default:               return errorResponse('Unknown action: ' + action);
    }
  } catch (err) {
    return errorResponse(err.toString());
  }
}

// ─── Sheet Helpers ─────────────────────────────────────────────────────────────

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    // Auto-create the sheet if it doesn't exist
    sheet = ss.insertSheet(name);
    initSheet(sheet, name);
  }
  return sheet;
}

function initSheet(sheet, name) {
  const headers = {
    [SHEETS.USERS]:     ['id', 'name', 'email', 'password', 'role', 'managerId', 'rating', 'phone', 'department', 'avatar', 'createdAt'],
    [SHEETS.PROJECTS]:  ['id', 'name', 'clientId', 'clientName', 'status', 'startDate', 'dueDate', 'description', 'creatorId', 'creatorName', 'assigneeId', 'assigneeName', 'createdAt', 'updatedAt'],
    [SHEETS.TASKS]:     ['id', 'projectId', 'projectName', 'title', 'description', 'assigneeId', 'assigneeName', 'creatorId', 'creatorName', 'status', 'priority', 'dueDate', 'checklist', 'createdAt', 'updatedAt'],
    [SHEETS.CLIENTS]:   ['id', 'name', 'email', 'phone', 'company', 'paymentStatus', 'createdAt', 'updatedAt'],
    [SHEETS.TIME_LOGS]: ['id', 'taskId', 'projectId', 'userId', 'userName', 'startTime', 'endTime', 'duration', 'notes', 'createdAt'],
    [SHEETS.COMMENTS]:  ['id', 'taskId', 'userId', 'userName', 'text', 'createdAt'],
    [SHEETS.LEADS]: [
      'id', 'name', 'company', 'email', 'phone', 'source', 'status', 'value', 'notes', 'assigneeId', 'assigneeName', 'createdAt', 'updatedAt'
    ],
    [SHEETS.CALENDAR_EVENTS]: [
      'id', 'title', 'type', 'description', 'date', 'time', 'platform',
      'assigneeId', 'assigneeName', 'creatorId', 'creatorName', 'projectId', 'projectName', 'clientId', 'clientName',
      'createdAt', 'updatedAt'
    ],
    [SHEETS.APPROVALS]: [
      'id', 'taskId', 'approverId', 'approverName', 'status', 'remark', 'createdAt', 'updatedAt'
    ],
  };
  const h = headers[name];
  if (h) {
    sheet.appendRow(h);
    // Format Header
    const range = sheet.getRange(1, 1, 1, h.length);
    range.setFontWeight('bold')
         .setBackground('#1e293b') // slate-800
         .setFontColor('#ffffff')
         .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    sheet.setTabColor('#4f46e5'); // indigo-600
  }
}

function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const rawHeaders = data[0];
  const headers = rawHeaders.map(h => String(h).trim().toLowerCase());
  
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { 
      obj[h] = row[i] !== undefined ? String(row[i]) : ''; 
    });
    return obj;
  });
}

function findRowById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) return i + 1; // 1-indexed
  }
  return -1;
}

function getHeaders(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

function updateRowById(sheet, id, updateObj) {
  const rowNum = findRowById(sheet, id);
  if (rowNum === -1) throw new Error('Row not found for id: ' + id);
  
  const rawHeaders = getHeaders(sheet);
  const headers = rawHeaders.map(h => String(h).trim().toLowerCase());
  const rowRange = sheet.getRange(rowNum, 1, 1, rawHeaders.length);
  const rowValues = rowRange.getValues()[0];
  
  const rowObj = {};
  headers.forEach((h, i) => { rowObj[h] = rowValues[i]; });
  
  // Merge update (handle keys case-insensitively)
  const normalizedUpdate = {};
  Object.keys(updateObj).forEach(k => { normalizedUpdate[k.toLowerCase().trim()] = updateObj[k]; });
  
  Object.keys(normalizedUpdate).forEach(k => { 
    if (headers.indexOf(k) !== -1) {
      rowObj[k] = normalizedUpdate[k]; 
    }
  });

  const finalRow = headers.map(h => rowObj[h]);
  rowRange.setValues([finalRow]);
  return rowObj;
}

/**
 * Safer append that matches headers in the sheet.
 * This prevents data shifting if columns are added/moved.
 */
function appendRowMapped(sheet, obj) {
  const rawHeaders = getHeaders(sheet);
  const headers = rawHeaders.map(h => String(h).trim().toLowerCase());
  
  // Lowercase all keys in obj for matching
  const normalizedObj = {};
  Object.keys(obj).forEach(k => { normalizedObj[k.toLowerCase().trim()] = obj[k]; });
  
  const row = headers.map(h => {
    const val = normalizedObj[h];
    return val !== undefined && val !== null ? String(val) : '';
  });
  
  sheet.appendRow(row);
  return obj;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

function getCached(key) {
  try {
    const cache = CacheService.getScriptCache();
    const val = cache.get(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

function setCached(key, data, ttl) {
  try {
    const cache = CacheService.getScriptCache();
    cache.put(key, JSON.stringify(data), ttl || 300);
  } catch {}
}

function invalidateCache(key) {
  try { CacheService.getScriptCache().remove(key); } catch {}
}

// ─── Users ────────────────────────────────────────────────────────────────────

function getUsers() {
  const cached = getCached('users');
  if (cached) return cached;
  const sheet = getSheet(SHEETS.USERS);
  const users = sheetToObjects(sheet).map(u => ({
    id: u.id, name: u.name, email: u.email, role: u.role, managerId: u.managerId || '', rating: parseFloat(u.rating) || 0, phone: u.phone || '', department: u.department || 'Creative', avatar: u.avatar, createdAt: u.createdAt,
  }));
  Logger.log('getUsers: Returning ' + users.length + ' users. First user avatar: ' + (users[0] ? users[0].avatar : 'N/A'));
  setCached('users', users, 300);
  return users;
}

function login(email, password) {
  const sheet = getSheet(SHEETS.USERS);
  const users = sheetToObjects(sheet);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error('No account found with this email address.');
  if (user.password && user.password !== password) throw new Error('Incorrect password.');
  return { id: user.id, name: user.name, email: user.email, role: user.role, managerId: user.managerId || '', rating: parseFloat(user.rating) || 0, phone: user.phone || '', department: user.department || 'Creative', avatar: user.avatar, createdAt: user.createdAt };
}

function getUserById(id) {
  const sheet = getSheet(SHEETS.USERS);
  const users = sheetToObjects(sheet);
  return users.find(u => String(u.id) === String(id));
}

function updateUser(u) {
  const sheet = getSheet(SHEETS.USERS);
  const updated = updateRowById(sheet, u.id, u);
  invalidateCache('users');
  return { id: updated.id, name: updated.name, email: updated.email, role: updated.role, managerId: updated.managerId || '', rating: parseFloat(updated.rating) || 0, phone: updated.phone || '', department: updated.department || 'Creative', avatar: updated.avatar, createdAt: updated.createdAt };
}

function uploadAvatar(userId, base64, fileName) {
  const folderName = 'Aspire_Avatars';
  let folder;
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(folderName);
  }
  
  const contentType = base64.substring(5, base64.indexOf(';'));
  const bytes = Utilities.base64Decode(base64.split(',')[1]);
  const blob = Utilities.newBlob(bytes, contentType, fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  // Use a stable Drive "uc" URL so the frontend can render consistently.
  // (The UI already normalizes `drive.google.com` links.)
  const fileUrl = 'https://drive.google.com/uc?id=' + file.getId();
  
  // Update user with new avatar URL
  const sheet = getSheet(SHEETS.USERS);
  updateRowById(sheet, userId, { avatar: fileUrl });
  invalidateCache('users');
  
  Logger.log('uploadAvatar: Success for user ' + userId + '. URL: ' + fileUrl);
  return { avatar: fileUrl };
}

// ─── Projects ─────────────────────────────────────────────────────────────────

function getProjects() {
  const cached = getCached('projects');
  if (cached) return cached;
  const sheet = getSheet(SHEETS.PROJECTS);
  const data = sheetToObjects(sheet);
  setCached('projects', data, 120);
  return data;
}

function createProject(p) {
  const sheet = getSheet(SHEETS.PROJECTS);
  appendRowMapped(sheet, p);
  invalidateCache('projects');
  return p;
}

function updateProject(p) {
  const sheet = getSheet(SHEETS.PROJECTS);
  const updated = updateRowById(sheet, p.id, p);
  invalidateCache('projects');
  return updated;
}

function deleteProject(id) {
  const sheet = getSheet(SHEETS.PROJECTS);
  const row = findRowById(sheet, id);
  if (row !== -1) sheet.deleteRow(row);
  invalidateCache('projects');
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

function getTasks(projectId, userId) {
  const cacheKey = projectId ? `tasks_${projectId}` : 'tasks';
  const cached = getCached(cacheKey);
  if (cached && !userId) return cached; // Only use cache if no userId filter (Admin visibility needs fresh check)

  const sheet = getSheet(SHEETS.TASKS);
  let data = sheetToObjects(sheet);
  if (projectId) data = data.filter(t => t.projectId === projectId);

  // Apply Privacy Filtering: Unassigned tasks are private to the creator, UNLESS user is Admin.
  if (userId) {
    const user = getUserById(userId);
    const isAdmin = user && user.role === 'admin';
    if (!isAdmin) {
      data = data.filter(t => {
        const isUnassigned = !t.assigneeId;
        const isCreator = String(t.creatorId) === String(userId);
        return !isUnassigned || isCreator; 
      });
    }
  }

  // Attach approval workflow data for UI: `approvalRequired` + `approvals[]`.
  // This is derived from the Approvals sheet (Tasks sheet doesn't store approval details).
  const approvalsSheet = getSheet(SHEETS.APPROVALS);
  const allApprovals = sheetToObjects(approvalsSheet).map(a => normalizeApproval(a));
  const approvalsByTaskId = {};
  allApprovals.forEach(a => {
    const key = String(a.taskId);
    if (!approvalsByTaskId[key]) approvalsByTaskId[key] = [];
    approvalsByTaskId[key].push(a);
  });

  data = data.map(t => {
    const taskApprovals = approvalsByTaskId[String(t.id)] || [];
    let parsedChecklist = [];
    try {
      if (t.checklist) parsedChecklist = JSON.parse(t.checklist);
    } catch (e) {
      Logger.log('Error parsing checklist for task ' + t.id + ': ' + e);
    }
    
    return {
      ...t,
      checklist: parsedChecklist,
      approvalRequired: taskApprovals.length > 0,
      approverIds: taskApprovals.map(a => a.approverId),
      approvals: taskApprovals,
    };
  });

  if (!userId) setCached(cacheKey, data, 60);
  return data;
}

function createTask(t) {
  const sheet = getSheet(SHEETS.TASKS);
  appendRowMapped(sheet, t);
  invalidateCache('tasks'); invalidateCache(`tasks_${t.projectId}`);
  return t;
}

function updateTask(t) {
  const sheet = getSheet(SHEETS.TASKS);
  
  // Handle checklist stringification
  const payload = { ...t };
  if (payload.checklist && typeof payload.checklist !== 'string') {
    payload.checklist = JSON.stringify(payload.checklist);
  }

  // Use robust updateRowById that handles normalization and merging
  const updated = updateRowById(sheet, payload.id, payload);
  
  invalidateCache('tasks');
  if (updated.projectId) invalidateCache(`tasks_${updated.projectId}`);
  return updated;
}

function deleteTask(id) {
  const sheet = getSheet(SHEETS.TASKS);
  const row = findRowById(sheet, id);
  if (row !== -1) sheet.deleteRow(row);
  invalidateCache('tasks');
}

// ─── Clients ──────────────────────────────────────────────────────────────────

function getClients() {
  const cached = getCached('clients');
  if (cached) return cached;
  const sheet = getSheet(SHEETS.CLIENTS);
  const data = sheetToObjects(sheet);
  setCached('clients', data, 300);
  return data;
}

function createClient(c) {
  const sheet = getSheet(SHEETS.CLIENTS);
  appendRowMapped(sheet, c);
  invalidateCache('clients');
  return c;
}

function updateClient(c) {
  const sheet = getSheet(SHEETS.CLIENTS);
  const updated = updateRowById(sheet, c.id, c);
  invalidateCache('clients');
  return updated;
}

function deleteClient(id) {
  const sheet = getSheet(SHEETS.CLIENTS);
  const row = findRowById(sheet, id);
  if (row !== -1) sheet.deleteRow(row);
  invalidateCache('clients');
}

// ─── Comments ─────────────────────────────────────────────────────────────────

function getComments(taskId) {
  const sheet = getSheet(SHEETS.COMMENTS);
  const all = sheetToObjects(sheet);
  return all.filter(c => c.taskId === taskId);
}

function addComment(c) {
  const sheet = getSheet(SHEETS.COMMENTS);
  appendRowMapped(sheet, c);
  return c;
}

// ─── Time Logs ────────────────────────────────────────────────────────────────

function getTimeLogs(taskId, projectId) {
  const sheet = getSheet(SHEETS.TIME_LOGS);
  let data = sheetToObjects(sheet);
  if (taskId) data = data.filter(l => l.taskId === taskId);
  if (projectId) data = data.filter(l => l.projectId === projectId);
  // Parse duration as number
  return data.map(l => ({ ...l, duration: parseInt(l.duration) || 0 }));
}

function logTime(l) {
  const sheet = getSheet(SHEETS.TIME_LOGS);
  appendRowMapped(sheet, l);
  return l;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

function getDashboardStats(requestingUserId) {
  let projects = getProjects();
  let tasks = getTasks();
  const timeLogs = getTimeLogs();
  const comments = sheetToObjects(getSheet(SHEETS.COMMENTS));

  // Apply Privacy Filtering for Stats
  if (requestingUserId) {
    const rUser = getUserById(requestingUserId);
    const isAdmin = rUser && rUser.role === 'admin';
    
    if (!isAdmin) {
      projects = projects.filter(p => {
        const isUnassigned = !p.assigneeId;
        const isCreator = p.creatorId === requestingUserId;
        return !isUnassigned || isCreator; 
      });
      tasks = tasks.filter(t => {
        const isUnassigned = !t.assigneeId;
        const isCreator = t.creatorId === requestingUserId;
        return !isUnassigned || isCreator;
      });
    }
  }

  const tasksByStatus = { 'todo': 0, 'in-progress': 0, 'review': 0, 'done': 0 };
  tasks.forEach(t => { if (tasksByStatus[t.status] !== undefined) tasksByStatus[t.status]++; });

  const totalTimeSecs = timeLogs.reduce((a, l) => a + (parseInt(l.duration) || 0), 0);

  // Time logged by day (last 30 days for trend analysis)
  const days = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    days[key] = 0;
  }
  timeLogs.forEach(l => {
    const key = l.createdAt ? l.createdAt.split('T')[0] : '';
    if (days[key] !== undefined) days[key] += (parseInt(l.duration) || 0) / 3600;
  });

  // Recent activity (last 10 tasks updated)
  const sorted = [...tasks].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  const recentActivity = sorted.slice(0, 10).map(t => ({
    id: 'a_' + t.id,
    type: t.status === 'done' ? 'task_completed' : 'task_updated',
    message: t.status === 'done' ? 'completed' : 'updated',
    userId: t.assigneeId || '',
    userName: t.assigneeName || 'Unknown',
    entityId: t.id,
    entityName: t.title,
    createdAt: t.updatedAt,
  }));

  // Completion Rate
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const completionRateNum = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const completionRate = completionRateNum + '% rate';

  // Projects Trend (New this month)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const newProjectsThisMonth = projects.filter(p => {
    const created = p.createdAt ? new Date(p.createdAt) : null;
    return created && created.getMonth() === currentMonth && created.getFullYear() === currentYear;
  }).length;
  const projectsTrend = '+' + newProjectsThisMonth + ' this month';

  // Tasks Trend (Urgent count)
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length;
  const tasksTrend = urgentTasks + ' urgent';

  return {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    activeTasks: tasks.filter(t => t.status !== 'done').length,
    completedTasks: completedTasks,
    totalTimeLogged: totalTimeSecs,
    projectsTrend,
    tasksTrend,
    completionRate,
    tasksByStatus,
    timeLoggedByDay: Object.entries(days).map(([date, hours]) => ({ date, hours: Math.round(hours * 10) / 10 })),
    recentActivity,
  };
}

// ─── Misc helpers ──────────────────────────────────────────────────────────

function genId(prefix) {
  // Stable-ish enough IDs for created rows (approvals/comments/leads/calendar).
  const p = prefix ? String(prefix) + '_' : '';
  return p + Utilities.getUuid();
}

function normalizeApproval(a) {
  return {
    id: a.id || genId('ap'),
    taskId: a.taskId || '',
    approverId: a.approverId || '',
    approverName: a.approverName || '',
    status: a.status || 'pending',
    remark: a.remark || '',
    createdAt: a.createdAt || new Date().toISOString(),
    updatedAt: a.updatedAt || a.createdAt || new Date().toISOString(),
  };
}

function normalizeLead(l) {
  const rawValue = l.value;
  const parsedValue =
    rawValue === undefined || rawValue === null || rawValue === '' ? undefined :
      (() => {
        const n = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue);
        return Number.isFinite(n) ? n : undefined;
      })();

  return {
    id: l.id || genId('l'),
    name: l.name || '',
    company: l.company || '',
    email: l.email || '',
    phone: l.phone || '',
    source: l.source || '',
    status: l.status || 'new',
    value: parsedValue,
    notes: l.notes || '',
    assigneeId: l.assigneeId || '',
    assigneeName: l.assigneeName || '',
    createdAt: l.createdAt || new Date().toISOString(),
    updatedAt: l.updatedAt || l.createdAt || new Date().toISOString(),
  };
}

function normalizeCalendarEvent(e) {
  return {
    id: e.id || genId('ev'),
    title: e.title || '',
    type: e.type || 'post',
    description: e.description || '',
    date: e.date || '',
    time: e.time || '',
    platform: e.platform || '',
    assigneeId: e.assigneeId || '',
    assigneeName: e.assigneeName || '',
    creatorId: e.creatorId || '',
    creatorName: e.creatorName || '',
    projectId: e.projectId || '',
    projectName: e.projectName || '',
    clientId: e.clientId || '',
    clientName: e.clientName || '',
    createdAt: e.createdAt || new Date().toISOString(),
    updatedAt: e.updatedAt || e.createdAt || new Date().toISOString(),
  };
}

// ─── Leads ────────────────────────────────────────────────────────────────────

function getLeads() {
  const cached = getCached('leads');
  if (cached) return cached;
  const sheet = getSheet(SHEETS.LEADS);
  const data = sheetToObjects(sheet).map(normalizeLead);
  setCached('leads', data, 120);
  return data;
}

function createLead(l) {
  const sheet = getSheet(SHEETS.LEADS);
  appendRowMapped(sheet, l);
  invalidateCache('leads');
  return normalizeLead(l);
}

function updateLead(l) {
  const sheet = getSheet(SHEETS.LEADS);
  const updated = updateRowById(sheet, l.id, l);
  invalidateCache('leads');
  return normalizeLead(updated);
}

function deleteLead(id) {
  const sheet = getSheet(SHEETS.LEADS);
  const row = findRowById(sheet, id);
  if (row !== -1) sheet.deleteRow(row);
  invalidateCache('leads');
}

// ─── Calendar Events ─────────────────────────────────────────────────────────

function getCalendarEvents() {
  const cached = getCached('calendarEvents');
  if (cached) return cached;
  const sheet = getSheet(SHEETS.CALENDAR_EVENTS);
  const data = sheetToObjects(sheet).map(normalizeCalendarEvent);
  setCached('calendarEvents', data, 120);
  return data;
}

function createCalendarEvent(ev) {
  const sheet = getSheet(SHEETS.CALENDAR_EVENTS);
  appendRowMapped(sheet, ev);
  invalidateCache('calendarEvents');
  return normalizeCalendarEvent(ev);
}

function updateCalendarEvent(ev) {
  const sheet = getSheet(SHEETS.CALENDAR_EVENTS);
  const updated = updateRowById(sheet, ev.id, ev);
  invalidateCache('calendarEvents');
  return normalizeCalendarEvent(updated);
}

function deleteCalendarEvent(id) {
  const sheet = getSheet(SHEETS.CALENDAR_EVENTS);
  const row = findRowById(sheet, id);
  if (row !== -1) sheet.deleteRow(row);
  invalidateCache('calendarEvents');
}

// ─── Approvals (task approval workflow) ──────────────────────────────────────

function deleteApprovalsByTaskId(taskId) {
  const sheet = getSheet(SHEETS.APPROVALS);
  const values = sheet.getDataRange().getValues();
  // Column order: [id, taskId, approverId, approverName, status, remark, createdAt, updatedAt]
  for (let i = values.length - 1; i >= 1; i--) {
    if (String(values[i][1]) === String(taskId)) {
      sheet.deleteRow(i + 1); // 1-indexed
    }
  }
}

function getApprovalsForTask(taskId) {
  const sheet = getSheet(SHEETS.APPROVALS);
  const all = sheetToObjects(sheet).map(normalizeApproval);
  return all.filter(a => String(a.taskId) === String(taskId));
}

function getTaskWithApprovals(taskId) {
  const taskSheet = getSheet(SHEETS.TASKS);
  const tasks = sheetToObjects(taskSheet);
  const task = tasks.find(t => String(t.id) === String(taskId));
  if (!task) throw new Error('Task not found: ' + taskId);

  const approvals = getApprovalsForTask(taskId);
  return {
    ...task,
    approvalRequired: approvals.length > 0,
    approverIds: approvals.map(a => a.approverId),
    approvals,
  };
}

function requestApproval(body) {
  const taskId = body.taskId;
  const now = new Date().toISOString();

  const approvalsSheet = getSheet(SHEETS.APPROVALS);
  const taskSheet = getSheet(SHEETS.TASKS);
  const tasks = sheetToObjects(taskSheet);
  const task = tasks.find(t => String(t.id) === String(taskId));
  if (!task) throw new Error('Task not found: ' + taskId);

  // Replace approvals set for this task.
  deleteApprovalsByTaskId(taskId);

  const approvalsPayload = Array.isArray(body.approvals) ? body.approvals : [];
  const approverIds = Array.isArray(body.approverIds) ? body.approverIds : [];
  const approverNames = Array.isArray(body.approverNames) ? body.approverNames : [];

  const approvalsToStore = approvalsPayload.length > 0
    ? approvalsPayload
    : approverIds.map((id, i) => ({
        id: genId('ap'),
        taskId,
        approverId: id,
        approverName: approverNames[i] || id,
        status: 'pending',
        remark: '',
        createdAt: now,
      }));

  approvalsToStore.forEach(a => {
    approvalsSheet.appendRow([
      a.id || genId('ap'),
      taskId,
      a.approverId || '',
      a.approverName || '',
      a.status || 'pending',
      a.remark || '',
      a.createdAt || now,
      now,
    ]);
  });

  // Keep task status unchanged; only update `updatedAt`.
  updateRowById(taskSheet, taskId, { updatedAt: now });

  invalidateCache('tasks');
  if (task.projectId) invalidateCache(`tasks_${task.projectId}`);

  return getTaskWithApprovals(taskId);
}

function submitApproval(body) {
  const taskId = body.taskId;
  const approverId = body.approverId;
  const status = body.status;
  const remark = body.remark || '';
  const now = new Date().toISOString();

  // Update the single approver row (we need approverName for audit comments).
  const approvalsUpdate = (() => {
    const sheet = getSheet(SHEETS.APPROVALS);
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      // Column order: [id, taskId, approverId, approverName, status, remark, createdAt, updatedAt]
      if (String(values[i][1]) === String(taskId) && String(values[i][2]) === String(approverId)) {
        const rowValues = values[i];
        rowValues[4] = status;
        rowValues[5] = remark;
        rowValues[7] = now;
        sheet.getRange(i + 1, 1, 1, rowValues.length).setValues([rowValues]);
        return { approverName: rowValues[3] || '' };
      }
    }
    throw new Error('Approval not found for taskId=' + taskId + ', approverId=' + approverId);
  })();

  // Compute next task status from approval set.
  const approvals = getApprovalsForTask(taskId);
  const anyRejected = approvals.some(a => a.status === 'rejected');
  const allApproved = approvals.length > 0 && approvals.every(a => a.status === 'approved');

  const taskSheet = getSheet(SHEETS.TASKS);
  const task = sheetToObjects(taskSheet).find(t => String(t.id) === String(taskId));
  if (!task) throw new Error('Task not found: ' + taskId);

  let newStatus = task.status;
  if (anyRejected) newStatus = 'todo';
  else if (allApproved) newStatus = 'done';

  updateRowById(taskSheet, taskId, { status: newStatus, updatedAt: now });

  // If rejected, also add an audit comment (matches mock behavior).
  if (status === 'rejected' && remark) {
    const commentsSheet = getSheet(SHEETS.COMMENTS);
    commentsSheet.appendRow([
      genId('cm'),
      taskId,
      approverId,
      approvalsUpdate.approverName || '',
      `❌ Rejected: ${remark}`,
      now,
    ]);
  }

  invalidateCache('tasks');
  if (task.projectId) invalidateCache(`tasks_${task.projectId}`);

  return getTaskWithApprovals(taskId);
}
