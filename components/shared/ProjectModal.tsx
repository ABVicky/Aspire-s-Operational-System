'use client';

import { useState, useEffect } from 'react';
import { Project, Client, ProjectStatus } from '@/lib/types';
import { createProject, updateProject } from '@/lib/api';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Modal } from './Modal';
import { toast } from 'sonner';
import { Loader2, Calendar, Briefcase, User, Info, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onSuccess: (project: Project) => void;
}

export function ProjectModal({ isOpen, onClose, project, onSuccess }: ProjectModalProps) {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const { clients, addLocalProject, updateLocalProject } = useData();
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    clientId: '',
    status: 'planning',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    description: '',
  });

  const isEdit = !!project;

  useEffect(() => {
    if (isOpen) {
      if (project) {
        setFormData(project);
      } else {
        setFormData({
          name: '',
          clientId: '',
          status: 'planning',
          startDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          description: '',
        });
      }
    }
  }, [isOpen, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.clientId) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const client = clients.find(c => c.id === formData.clientId);
      const payload = {
        ...formData,
        clientName: client?.name || '',
        ...(!isEdit && currentUser ? { creatorId: currentUser.id, creatorName: currentUser.name } : {}),
      } as any;

      if (isEdit) {
        const res = await updateProject(project!.id, payload);
        updateLocalProject(res);
        toast.success('Project updated successfully');
        onSuccess(res);
      } else {
        const res = await createProject(payload);
        addLocalProject(res);
        toast.success('Project created successfully');
        onSuccess(res);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const { users } = useData();

  const inputClass = "w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400";
  const labelClass = "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Project' : 'Launch New Project'} maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Name */}
          <div className="md:col-span-2">
            <label className={labelClass}><Briefcase className="w-3 h-3" /> Project Identity</label>
            <input
              type="text"
              required
              placeholder="e.g. Website Redesign 2024"
              className={inputClass}
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Client Selector */}
          <div>
            <label className={labelClass}><User className="w-3 h-3" /> Client Partner</label>
            <select
              required
              className={inputClass}
              value={formData.clientId}
              onChange={e => setFormData({ ...formData, clientId: e.target.value })}
            >
              <option value="">Select a client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
              ))}
            </select>
          </div>

          {/* Assignee / Project Lead */}
          <div>
            <label className={labelClass}><User className="w-3 h-3" /> Project Lead</label>
            <select
              className={inputClass}
              value={formData.assigneeId || ''}
              onChange={e => {
                const u = users.find(user => user.id === e.target.value);
                setFormData({ ...formData, assigneeId: e.target.value, assigneeName: u?.name || '' });
              }}
            >
              <option value="">Unassigned (Private Draft)</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}><Target className="w-3 h-3" /> Initial Status</label>
            <select
              className={inputClass}
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Dates */}
          <div>
            <label className={labelClass}><Calendar className="w-3 h-3" /> Start Date</label>
            <input
              type="date"
              className={inputClass}
              value={formData.startDate}
              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>

          <div>
            <label className={labelClass}><Calendar className="w-3 h-3 text-rose-500" /> Deadline</label>
            <input
              type="date"
              className={cn(inputClass, "border-rose-100 bg-rose-50/20")}
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className={labelClass}><Info className="w-3 h-3" /> Strategy & Vision</label>
            <textarea
              rows={4}
              placeholder="Define the scope, goals, and core requirements for this project..."
              className={cn(inputClass, "resize-none")}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-[1.5rem] transition-all text-xs uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-[1.5rem] transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs uppercase tracking-widest border border-white/10"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? 'Update Project' : 'Initiate Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
