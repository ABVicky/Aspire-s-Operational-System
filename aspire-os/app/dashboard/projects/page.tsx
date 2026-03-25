'use client';

import { useEffect, useState, useCallback } from 'react';
import { Project, Client, ProjectStatus } from '@/lib/types';
import { getProjects, getClients, createProject, updateProject, deleteProject } from '@/lib/api';
import { StatusBadge, Skeleton, EmptyState, ProjectModal } from '@/components/shared';
import { formatDate } from '@/lib/utils';
import { 
  Plus, Search, Filter, MoreVertical, Pencil, 
  Trash2, FolderKanban, Briefcase, Calendar, ChevronRight 
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([getProjects(), getClients()]);
      setProjects(p);
      setClients(c);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.clientName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Projects</h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">{filtered.length} total projects</p>
        </div>
        <button 
          onClick={() => { setEditingProject(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 md:px-5 md:py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-indigo-600/30 active:scale-95 text-sm"
        >
          <Plus className="w-5 h-5" /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center py-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects or clients..."
            className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:flex-initial">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full md:w-44 pl-10 pr-8 py-2.5 md:py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="planning" className="dark:bg-slate-900">Planning</option>
              <option value="active" className="dark:bg-slate-900">Active</option>
              <option value="on-hold" className="dark:bg-slate-900">On Hold</option>
              <option value="completed" className="dark:bg-slate-900">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects List/Table */}
      {loading ? (
        <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 md:h-16 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState 
          icon={<FolderKanban className="w-8 h-8 md:w-10 md:h-10 text-slate-200" />} 
          title="No projects found" 
          description="Refine your search or create a new project to get started." 
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">Project</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">Client</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase text-right">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center text-indigo-500 dark:text-indigo-400 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-all">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">{p.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">{p.description || 'No description provided.'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{p.clientName}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-end">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatDate(p.dueDate)}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-1">Target End</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filtered.map(p => (
              <div 
                key={p.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-5 shadow-sm active:bg-slate-50/50 dark:active:bg-slate-800 transition-all flex flex-col gap-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 rounded-2xl flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{p.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{p.clientName}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                </div>
                
                <div className="flex items-center justify-between pt-1">
                  <StatusBadge status={p.status} />
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{formatDate(p.dueDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={editingProject}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
