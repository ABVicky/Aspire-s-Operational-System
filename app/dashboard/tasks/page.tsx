'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Task, Project, User, TaskStatus, Priority } from '@/lib/types';
import { getTasks, getProjects, getUsers, createTask, updateTask, deleteTask } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { StatusBadge, PriorityBadge, Skeleton, EmptyState, Avatar } from '@/components/shared';
import TaskDetailsPanel from '@/components/tasks/TaskDetailsPanel';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import { Plus, CheckSquare, Search, X, Loader2, Pencil, Trash2, LayoutList, Columns, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const STATUS_OPTIONS: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];
const PRIORITY_OPTIONS: Priority[] = ['low', 'medium', 'high', 'urgent'];
const EMPTY_FORM = {
  title: '', description: '', projectId: '', assigneeId: '', status: 'todo' as TaskStatus,
  priority: 'medium' as Priority, dueDate: '',
};

function TasksPageInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const projectFilter = searchParams.get('project') || '';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterProject, setFilterProject] = useState(projectFilter);
  const [filterMine, setFilterMine] = useState(true); // Default to My Tasks
  const [view, setView] = useState<'list' | 'kanban'>('kanban');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, p, u] = await Promise.all([getTasks(), getProjects(), getUsers()]);
      setTasks(t); setProjects(p); setUsers(u);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { 
    async function loadAndSelect() {
      await load();
      const taskId = searchParams.get('task');
      if (taskId) {
        // We need to wait for tasks to be loaded
      }
    }
    loadAndSelect();
  }, [load, searchParams]);

  // Handle auto-selection after tasks are loaded
  useEffect(() => {
    const taskId = searchParams.get('task');
    if (taskId && tasks.length > 0) {
      const task = tasks.find(t => t.id === taskId);
      if (task) setSelectedTask(task);
    }
  }, [searchParams, tasks]);

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setModalOpen(true); };
  const openEdit = (t: Task) => {
    setForm({ title: t.title, description: t.description || '', projectId: t.projectId, assigneeId: t.assigneeId || '', status: t.status, priority: t.priority, dueDate: t.dueDate || '' });
    setEditing(t); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Task title is required.'); return; }
    setSaving(true);
    try {
      const assignee = users.find(u => u.id === form.assigneeId);
      const project = projects.find(p => p.id === form.projectId);
      const payload = { 
        ...form, 
        assigneeName: assignee?.name, 
        projectName: project?.name,
        // Set creator only on first save
        ...(!editing && user ? { creatorId: user.id, creatorName: user.name } : {})
      };
      if (editing) {
        const updated = await updateTask(editing.id, payload);
        setTasks(prev => prev.map(t => t.id === editing.id ? updated : t));
        if (selectedTask?.id === editing.id) setSelectedTask(updated);
        toast.success('Task updated.');
      } else {
        const created = await createTask(payload as Parameters<typeof createTask>[0]);
        setTasks(prev => [created, ...prev]);
        toast.success('Task created!');
      }
      setModalOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to save.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    setDeletingId(id);
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      if (selectedTask?.id === id) setSelectedTask(null);
      toast.success('Task deleted.');
    } catch { toast.error('Failed to delete.'); }
    finally { setDeletingId(null); }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    if (selectedTask?.id === taskId) setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
    try {
      await updateTask(taskId, { status: newStatus });
    } catch {
      toast.error('Failed to update status.');
      load();
    }
  };

  const filtered = tasks.filter(t => {
    const q = search.toLowerCase();
    const matchesSearch = t.title.toLowerCase().includes(q) || (t.projectName || '').toLowerCase().includes(q);
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesProject = !filterProject || t.projectId === filterProject;
    const matchesMine = !filterMine || (user && (t.assigneeId === user.id || t.creatorId === user.id));
    return matchesSearch && matchesStatus && matchesProject && matchesMine;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-sm text-slate-500 mt-0.5">{tasks.length} total tasks</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-indigo-500/20">
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* Filters + View toggle */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-600 dark:text-slate-400">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." className="bg-transparent outline-none flex-1 placeholder-slate-400 dark:text-white" />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-slate-400" /></button>}
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as TaskStatus | 'all')} className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-600 dark:text-slate-400 outline-none cursor-pointer">
          <option value="all" className="dark:bg-slate-900">All statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="dark:bg-slate-900">{s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-600 dark:text-slate-400 outline-none cursor-pointer">
          <option value="" className="dark:bg-slate-900">All projects</option>
          {projects.map(p => <option key={p.id} value={p.id} className="dark:bg-slate-900">{p.name}</option>)}
        </select>

        <button 
          onClick={() => setFilterMine(!filterMine)}
          className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
            filterMine 
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none' 
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300'
          }`}
        >
          {filterMine ? 'My Tasks' : 'All Tasks'}
        </button>

        <div className="ml-auto flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl">
          <button onClick={() => setView('kanban')} className={`p-1.5 rounded-lg transition-colors ${view === 'kanban' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}><Columns className="w-4 h-4" /></button>
          <button onClick={() => setView('list')} className={`p-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}><LayoutList className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : view === 'kanban' ? (
        <KanbanBoard tasks={filtered} users={users} onStatusChange={handleStatusChange} onTaskClick={setSelectedTask} onEdit={openEdit} onDelete={handleDelete} />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState icon={<CheckSquare className="w-6 h-6" />} title="No tasks found" description="Create your first task or adjust your filters." action={<button onClick={openCreate} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500 transition-colors">New Task</button>} />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/40">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Task</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">Project</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden xl:table-cell">Assignee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">Due</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {filtered.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer" onClick={() => setSelectedTask(task)}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">{task.title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-slate-500 dark:text-slate-400 text-xs">{task.projectName}</td>
                    <td className="px-4 py-3.5">
                      <select value={task.status} onChange={e => { e.stopPropagation(); handleStatusChange(task.id, e.target.value as TaskStatus); }} onClick={e => e.stopPropagation()} className="text-xs bg-transparent dark:text-slate-300 outline-none cursor-pointer border-0 focus:ring-0 p-0">
                        {STATUS_OPTIONS.map(s => <option key={s} value={s} className="dark:bg-slate-900">{s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell"><PriorityBadge priority={task.priority} /></td>
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      {task.assigneeName ? (
                        <div className="flex items-center gap-2">
                          <Avatar 
                            name={task.assigneeName} 
                            src={users.find(u => u.id === task.assigneeId)?.avatar} 
                            size="sm" 
                          />
                          <span className="text-xs text-slate-600 dark:text-slate-400">{task.assigneeName}</span>
                        </div>
                      ) : <span className="text-slate-300 dark:text-slate-600 text-xs">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-slate-500 dark:text-slate-400 text-xs">{formatDate(task.dueDate)}</td>
                    <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button onClick={() => openEdit(task)} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(task.id)} disabled={deletingId === task.id} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors">
                          {deletingId === task.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Task Details Panel */}
      {selectedTask && (
        <TaskDetailsPanel
          task={selectedTask}
          users={users}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={(updated) => {
            setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
            setSelectedTask(updated);
          }}
        />
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/5">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">{editing ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title" className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Task description..." className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Project</label>
                  <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950/40 dark:text-white">
                    <option value="" className="dark:bg-slate-900">None</option>
                    {projects.map(p => <option key={p.id} value={p.id} className="dark:bg-slate-900">{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Assignee</label>
                  <select value={form.assigneeId} onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950/40 dark:text-white">
                    <option value="" className="dark:bg-slate-900">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id} className="dark:bg-slate-900">{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))} className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950/40 dark:text-white">
                    {STATUS_OPTIONS.map(s => <option key={s} value={s} className="dark:bg-slate-900">{s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))} className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950/40 dark:text-white">
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p} className="dark:bg-slate-900">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : editing ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>}>
      <TasksPageInner />
    </Suspense>
  );
}
