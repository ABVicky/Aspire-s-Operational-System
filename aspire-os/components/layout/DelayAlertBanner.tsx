'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Task, Lead, Project } from '@/lib/types';
import { getTasks, getLeads, getProjects } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface DelayItem {
  type: 'task' | 'lead' | 'project';
  label: string;
  memberId: string;
  memberName: string;
  daysOverdue: number;
  dueName: string;
}

const DELAY_THRESHOLD_DAYS = 3;

function daysBetween(dateStr: string, now: Date) {
  const d = new Date(dateStr);
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DelayAlertBanner() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<DelayItem[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const constraintsRef = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return { current: document.body };
  }, []); // Mock for SSR

  const checkDelays = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    const now = new Date();
    const found: DelayItem[] = [];

    try {
      const [tasks, leads, projects] = await Promise.all([getTasks(), getLeads(), getProjects()]);

      // Overdue tasks (not done, past dueDate by 3+ days)
      tasks.forEach(t => {
        if (t.status === 'done' || !t.dueDate || !t.assigneeName || !t.assigneeId) return;
        const days = daysBetween(t.dueDate, now);
        if (days >= DELAY_THRESHOLD_DAYS) {
          found.push({ type: 'task', label: t.title, memberId: t.assigneeId, memberName: t.assigneeName, daysOverdue: days, dueName: 'Task' });
        }
      });

      // Stale leads (not won/lost, not updated in 3+ days)
      leads.forEach(l => {
        if (l.status === 'won' || l.status === 'lost' || !l.assigneeId || !l.assigneeName) return;
        const days = daysBetween(l.updatedAt, now);
        if (days >= DELAY_THRESHOLD_DAYS) {
          found.push({ type: 'lead', label: l.name, memberId: l.assigneeId, memberName: l.assigneeName, daysOverdue: days, dueName: 'Lead' });
        }
      });

      // Overdue projects (not completed/cancelled, past dueDate by 3+ days)
      projects.forEach(p => {
        if (!p.dueDate || p.status === 'completed' || p.status === 'cancelled') return;
        const days = daysBetween(p.dueDate, now);
        if (days >= DELAY_THRESHOLD_DAYS) {
          found.push({ type: 'project', label: p.name, memberId: p.clientId, memberName: p.clientName || 'Unknown', daysOverdue: days, dueName: 'Project' });
        }
      });

      setAlerts(found);
    } catch (e) {
      // Silently fail — delays are non-critical
    } finally {
      setLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    checkDelays();
  }, [checkDelays]);

  // Group alerts by member
  const byMember = alerts.reduce<Record<string, { name: string; items: DelayItem[] }>>((acc, a) => {
    if (!acc[a.memberId]) acc[a.memberId] = { name: a.memberName, items: [] };
    acc[a.memberId].items.push(a);
    return acc;
  }, {});

  const memberCount = Object.keys(byMember).length;

  if (!loaded || alerts.length === 0 || dismissed || user?.role !== 'admin') return null;

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragConstraints={constraintsRef as any}
        dragElastic={0.05}
        dragMomentum={false}
        initial={{ opacity: 0, y: -20, x: "-50%" }}
        animate={{ opacity: 1, y: 0, x: "-50%" }}
        exit={{ opacity: 0, y: -20, x: "-50%" }}
        className="fixed top-[calc(var(--topbar-height)+1rem)] left-1/2 z-50 w-[95vw] max-w-xl shadow-2xl shadow-red-600/20 cursor-grab active:cursor-grabbing"
      >
        <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800/50 rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 bg-red-600 px-5 py-4">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm">⚠️ Delay Alert — {memberCount} {memberCount === 1 ? 'Member' : 'Members'}</p>
              <p className="text-red-200 text-[11px] font-medium">{alerts.length} {alerts.length === 1 ? 'item is' : 'items are'} overdue by {DELAY_THRESHOLD_DAYS}+ days</p>
            </div>
            <button onClick={() => setExpanded(e => !e)} className="p-1.5 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button onClick={() => setDismissed(true)} className="p-1.5 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body — member list */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
                  {Object.entries(byMember).map(([memberId, { name, items }]) => (
                    <div key={memberId} className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-xl bg-red-600 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                          {name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-red-900 dark:text-red-200">{name}</p>
                          <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                            {items.length} {items.length === 1 ? 'item' : 'items'} delayed
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="text-[9px] font-black uppercase tracking-wider text-red-500 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded-md shrink-0">{item.dueName}</span>
                            <span className="font-bold text-red-800 dark:text-red-300 truncate">{item.label}</span>
                            <span className="ml-auto shrink-0 flex items-center gap-1 text-red-500 font-black">
                              <Clock className="w-3 h-3" /> {item.daysOverdue}d late
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-4">
                  <button onClick={() => setDismissed(true)} className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">
                    Dismiss All
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
