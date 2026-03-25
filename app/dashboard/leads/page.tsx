'use client';

import { useEffect, useState, useCallback } from 'react';
import { Lead, LeadStatus } from '@/lib/types';
import { getLeads, updateLead, deleteLead } from '@/lib/api';
import { LeadModal } from '@/components/shared/LeadModal';
import { Avatar, EmptyState } from '@/components/shared';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, MoreVertical, Trash2, Pencil, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PIPELINE_STAGES: { id: LeadStatus; label: string; color: string; bg: string; dot: string }[] = [
  { id: 'new',         label: 'New Lead',     color: 'text-slate-600',  bg: 'bg-slate-50 dark:bg-slate-800/30',     dot: 'bg-slate-400' },
  { id: 'contacted',  label: 'Contacted',    color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20',       dot: 'bg-blue-500' },
  { id: 'proposal',   label: 'Proposal',     color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20',   dot: 'bg-purple-500' },
  { id: 'negotiation',label: 'Negotiation',  color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-900/20',    dot: 'bg-amber-500' },
  { id: 'won',        label: 'Won 🎉',       color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20',    dot: 'bg-green-500' },
  { id: 'lost',       label: 'Lost',         color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20',        dot: 'bg-red-400' },
];

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const canAccess = user?.role === 'admin' || user?.subRole === 'bde';
  const load = useCallback(async () => {
    setLoading(true);
    try { setLeads(await getLeads()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (!canAccess) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState icon={<TrendingUp className="w-14 h-14 text-slate-200" />} title="Access Restricted" description="Only Admins and BDE members can access the Leads dashboard." />
      </div>
    );
  }

  const getStageLead = (status: LeadStatus) => leads.filter(l => l.status === status);
  const totalPipelineValue = leads.reduce((s, l) => s + (l.value || 0), 0);
  const wonValue = leads.filter(l => l.status === 'won').reduce((s, l) => s + (l.value || 0), 0);

  const handleStageMove = async (leadId: string, status: LeadStatus) => {
    setMovingId(leadId);
    try {
      const updated = await updateLead(leadId, { status });
      setLeads(prev => prev.map(l => l.id === leadId ? updated : l));
    } catch { toast.error('Failed to move lead'); } finally { setMovingId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead permanently?')) return;
    try { await deleteLead(id); toast.success('Lead deleted'); load(); } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight font-display">Lead Pipeline</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{leads.length} leads · ₹{totalPipelineValue.toLocaleString()} pipeline · ₹{wonValue.toLocaleString()} closed</p>
        </div>
        <button onClick={() => { setEditingLead(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-sm transition-all shadow-lg shadow-indigo-600/30 active:scale-95">
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      {/* Pipeline */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
        {PIPELINE_STAGES.map(stage => {
          const stageLeads = getStageLead(stage.id);
          return (
            <div key={stage.id} className="shrink-0 w-[85vw] sm:w-72 snap-center flex flex-col gap-3">
              {/* Stage header */}
              <div className={cn('flex items-center gap-2 px-4 py-3 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-sm', stage.bg)}>
                <div className={cn('w-2.5 h-2.5 rounded-full', stage.dot)} />
                <span className={cn('text-sm font-black tracking-tight', stage.color)}>{stage.label}</span>
                <span className="ml-auto text-xs font-black text-slate-400 bg-white/70 dark:bg-white/10 px-2 py-0.5 rounded-full">{stageLeads.length}</span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-3 min-h-[80px]">
                {stageLeads.map(lead => (
                  <motion.div key={lead.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-4 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white tracking-tight truncate">{lead.name}</h4>
                        {lead.company && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 truncate">{lead.company}</p>}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                        <button onClick={() => { setEditingLead(lead); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-all">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(lead.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {lead.value && (
                      <div className="flex items-center gap-1 text-sm font-black text-indigo-600 dark:text-indigo-400 mb-3">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {lead.value.toLocaleString()}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                        {lead.source && <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded-md">{lead.source}</span>}
                        {lead.assigneeName && <span>{lead.assigneeName.split(' ')[0]}</span>}
                      </div>
                    </div>

                    {/* Move stage buttons */}
                    {movingId !== lead.id && (
                      <div className="mt-3 pt-3 border-t border-slate-50 dark:border-white/5">
                        <select
                          value={lead.status}
                          onChange={e => handleStageMove(lead.id, e.target.value as LeadStatus)}
                          className="w-full text-[10px] font-black uppercase tracking-wider py-1.5 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-xl focus:outline-none text-slate-500 cursor-pointer"
                        >
                          {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                      </div>
                    )}
                  </motion.div>
                ))}
                {stageLeads.length === 0 && (
                  <div className="flex items-center justify-center min-h-[80px] border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl">
                    <p className="text-[10px] text-slate-300 dark:text-slate-700 font-black uppercase tracking-wider">Empty</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <LeadModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingLead(null); }}
        lead={editingLead}
        onSuccess={load}
      />
    </div>
  );
}
