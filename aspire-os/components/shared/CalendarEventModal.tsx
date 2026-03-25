'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent, CalendarEventType, SocialPlatform } from '@/lib/types';
import { getUsers, getClients, getProjects, createCalendarEvent, updateCalendarEvent } from '@/lib/api';
import { Modal } from './Modal';
import { toast } from 'sonner';
import { Loader2, Lock, Globe } from 'lucide-react';

/** These types are project-scoped: only the assignee + their manager + admin can see them. */
const RESTRICTED_TYPES = ['post', 'deadline'];

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  defaultDate?: string;
  onSuccess: (event: CalendarEvent) => void;
}

const EVENT_TYPES: { value: CalendarEventType; label: string; color: string }[] = [
  { value: 'post', label: 'Social Post', color: 'bg-purple-500' },
  { value: 'shoot', label: 'Shoot', color: 'bg-amber-500' },
  { value: 'meeting', label: 'Meeting', color: 'bg-blue-500' },
  { value: 'deadline', label: 'Deadline', color: 'bg-red-500' },
];

const PLATFORMS: SocialPlatform[] = ['Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'Twitter', 'Other'];

export function CalendarEventModal({ isOpen, onClose, event, defaultDate, onSuccess }: CalendarEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '', type: 'post', date: defaultDate || new Date().toISOString().split('T')[0],
    time: '10:00', platform: 'Instagram', description: '',
  });

  const isEdit = !!event;

  useEffect(() => {
    if (isOpen) {
      getUsers().then(setUsers);
      getClients().then(setClients);
      getProjects().then(setProjects);
      if (event) setFormData(event);
      else setFormData({ title: '', type: 'post', date: defaultDate || new Date().toISOString().split('T')[0], time: '10:00', platform: 'Instagram' });
    }
  }, [isOpen, event, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) { toast.error('Title and Date are required'); return; }
    setLoading(true);
    try {
      const assignee = users.find(u => u.id === formData.assigneeId);
      const project = projects.find(p => p.id === formData.projectId);
      const client = clients.find(c => c.id === formData.clientId);
      const payload = {
        ...formData,
        assigneeName: assignee?.name,
        projectName: project?.name,
        clientName: client?.name,
      } as any;

      const res = isEdit
        ? await updateCalendarEvent(event!.id, payload)
        : await createCalendarEvent(payload);

      toast.success(isEdit ? 'Event updated' : 'Event created');
      onSuccess(res);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:text-white";
  const labelClass = "block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 ml-1";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Calendar Event' : 'Schedule New Event'} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Event Type Selector */}
        <div>
          <label className={labelClass}>Event Type</label>
          <div className="flex gap-2 flex-wrap">
            {EVENT_TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: t.value })}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                  formData.type === t.value
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-500'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${t.color}`} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visibility notice */}
        {RESTRICTED_TYPES.includes(formData.type || '') ? (
          <div className="flex items-start gap-3 px-4 py-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-700/40 rounded-2xl">
            <Lock className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 leading-snug">
              <span className="font-black">Project-only visibility</span> — This event will only be visible to the assigned member, their manager, and admins.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-700/40 rounded-2xl">
            <Globe className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 leading-snug">
              <span className="font-black">Visible to everyone</span> — This event will appear on all team members' calendars.
            </p>
          </div>
        )}

        <div>
          <label className={labelClass}>Title</label>
          <input required type="text" placeholder="e.g. Instagram Reel — TechCorp" className={inputClass}
            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date</label>
            <input required type="date" className={inputClass} value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Time</label>
            <input type="time" className={inputClass} value={formData.time}
              onChange={e => setFormData({ ...formData, time: e.target.value })} />
          </div>
        </div>

        {formData.type === 'post' && (
          <div>
            <label className={labelClass}>Platform</label>
            <select className={inputClass} value={formData.platform}
              onChange={e => setFormData({ ...formData, platform: e.target.value as SocialPlatform })}>
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Assignee</label>
            <select className={inputClass} value={formData.assigneeId || ''}
              onChange={e => setFormData({ ...formData, assigneeId: e.target.value })}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Project (optional)</label>
            <select className={inputClass} value={formData.projectId || ''}
              onChange={e => setFormData({ ...formData, projectId: e.target.value })}>
              <option value="">None</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea rows={3} placeholder="Additional details, brief, or references..." className={`${inputClass} resize-none`}
            value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
        </div>

        <div className="pt-2 flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-2xl text-xs uppercase tracking-widest transition-all hover:bg-slate-200">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? 'Save Changes' : 'Schedule Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
