'use client';

import { useState, useEffect } from 'react';
import { Lead, LeadStatus } from '@/lib/types';
import { getUsers, createLead, updateLead } from '@/lib/api';
import { Modal } from './Modal';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
  onSuccess: (lead: Lead) => void;
}

export function LeadModal({ isOpen, onClose, lead, onSuccess }: LeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '', company: '', email: '', phone: '', source: '', status: 'new', value: undefined, notes: '',
  });

  const isEdit = !!lead;

  useEffect(() => {
    if (isOpen) {
      getUsers().then(setUsers);
      if (lead) setFormData(lead);
      else setFormData({ name: '', company: '', email: '', phone: '', source: '', status: 'new', value: undefined, notes: '' });
    }
  }, [isOpen, lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) { toast.error('Lead name is required'); return; }
    setLoading(true);
    try {
      const assignee = users.find(u => u.id === formData.assigneeId);
      const payload = { ...formData, assigneeName: assignee?.name } as any;
      const res = isEdit ? await updateLead(lead!.id, payload) : await createLead(payload);
      toast.success(isEdit ? 'Lead updated' : 'Lead created');
      onSuccess(res);
      onClose();
    } catch (err: any) { toast.error(err.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:text-white";
  const labelClass = "block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 ml-1";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Update Lead' : 'Add New Lead'} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Lead Name *</label>
            <input required type="text" placeholder="e.g. Ramesh Gupta" className={inputClass}
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Company</label>
            <input type="text" placeholder="Acme Corp" className={inputClass}
              value={formData.company || ''} onChange={e => setFormData({ ...formData, company: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Source</label>
            <select className={inputClass} value={formData.source || ''} onChange={e => setFormData({ ...formData, source: e.target.value })}>
              <option value="">Select source</option>
              {['LinkedIn', 'Referral', 'Website', 'Cold Call', 'Instagram', 'Email', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" placeholder="lead@company.com" className={inputClass}
              value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input type="tel" placeholder="+91-9876543210" className={inputClass}
              value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Deal Value (₹)</label>
            <input type="number" placeholder="0" className={inputClass}
              value={formData.value || ''} onChange={e => setFormData({ ...formData, value: Number(e.target.value) })} />
          </div>
          <div>
            <label className={labelClass}>Assign To</label>
            <select className={inputClass} value={formData.assigneeId || ''} onChange={e => setFormData({ ...formData, assigneeId: e.target.value })}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Notes</label>
            <textarea rows={3} placeholder="Key requirements, next steps, contact notes..." className={`${inputClass} resize-none`}
              value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? 'Update Lead' : 'Add Lead'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
