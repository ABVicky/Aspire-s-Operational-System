'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Project, Task, TimeLog } from '@/lib/types';
import { getProjects, getTasks, getTimeLogs, logTime } from '@/lib/api';
import { formatDuration, formatRelativeTime } from '@/lib/utils';
import { Skeleton } from '@/components/shared';
import { Play, Square, Clock, Loader2, BarChart3, Briefcase, ListChecks, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function TimeTrackerPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [notes, setNotes] = useState('');
  const [timerActive, setTimerActive] = useState(false);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const [timerDisplay, setTimerDisplay] = useState('00:00:00');
  const [stopping, setStopping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, t, logs] = await Promise.all([getProjects(), getTasks(), getTimeLogs()]);
      setProjects(p); setTasks(t); setTimeLogs(logs);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Timer tick
  useEffect(() => {
    if (timerActive && timerStart) {
      timerRef.current = setInterval(() => {
        const diff = Math.floor((Date.now() - timerStart.getTime()) / 1000);
        const h = String(Math.floor(diff / 3600)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const s = String(diff % 60).padStart(2, '0');
        setTimerDisplay(`${h}:${m}:${s}`);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, timerStart]);

  const startTimer = () => {
    if (!selectedTaskId) { toast.error('Please select a task first.'); return; }
    setTimerStart(new Date());
    setTimerActive(true);
    toast.info('Timer started!');
  };

  const stopTimer = async () => {
    if (!timerStart || !user) return;
    setStopping(true);
    const endTime = new Date();
    const durationSecs = Math.floor((endTime.getTime() - timerStart.getTime()) / 1000);
    const task = tasks.find(t => t.id === selectedTaskId);
    try {
      const log = await logTime({
        taskId: selectedTaskId,
        projectId: selectedProjectId || task?.projectId || '',
        userId: user.id,
        userName: user.name,
        startTime: timerStart.toISOString(),
        endTime: endTime.toISOString(),
        duration: durationSecs,
        notes,
      });
      setTimeLogs(prev => [log, ...prev]);
      toast.success(`Logged ${formatDuration(durationSecs)}!`);
      setNotes('');
    } catch { toast.error('Failed to save time log.'); }
    finally {
      setTimerActive(false); setTimerStart(null); setTimerDisplay('00:00:00'); setStopping(false);
    }
  };

  const filteredTasks = selectedProjectId ? tasks.filter(t => t.projectId === selectedProjectId) : tasks;

  // Stats
  const totalTimeAll = timeLogs.reduce((a, l) => a + (l.duration || 0), 0);
  const todayLogs = timeLogs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString());
  const todayTime = todayLogs.reduce((a, l) => a + (l.duration || 0), 0);

  // Per-project breakdown
  const projectTotals = projects.map(p => ({
    ...p,
    total: timeLogs.filter(l => l.projectId === p.id).reduce((a, l) => a + (l.duration || 0), 0),
  })).filter(p => p.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Time Tracker</h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">Track and log work sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Timer UI Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm p-5 md:p-8 space-y-6 md:space-y-8">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-widest"><Clock className="w-4 h-4 text-indigo-500" /> New Log Session</h2>

            {/* Selection Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"><Briefcase className="w-3.5 h-3.5" /> Project</label>
                <div className="relative">
                  <select value={selectedProjectId} onChange={e => { setSelectedProjectId(e.target.value); setSelectedTaskId(''); }} className="w-full pl-4 pr-10 py-3 md:py-3.5 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none shadow-sm cursor-pointer disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-400" disabled={timerActive}>
                    <option value="" className="dark:bg-slate-900">All active projects</option>
                    {projects.map(p => <option key={p.id} value={p.id} className="dark:bg-slate-900">{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"><ListChecks className="w-3.5 h-3.5" /> Task Requirement *</label>
                <div className="relative">
                  <select value={selectedTaskId} onChange={e => setSelectedTaskId(e.target.value)} className="w-full pl-4 pr-10 py-3 md:py-3.5 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none shadow-sm cursor-pointer disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-400" disabled={timerActive}>
                    <option value="" className="dark:bg-slate-900">Choose task assignment...</option>
                    {filteredTasks.map(t => <option key={t.id} value={t.id} className="dark:bg-slate-900">{t.title}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Working on Notes (optional)</label>
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="What are you focusing on?" className="w-full px-4 py-3 md:py-3.5 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm disabled:bg-slate-50 dark:disabled:bg-slate-900 font-medium" disabled={timerActive} />
            </div>

            {/* Timer Visualizer */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 md:p-12 flex flex-col items-center gap-6 md:gap-8 shadow-xl shadow-indigo-600/20 relative overflow-hidden">
              <p className="text-6xl md:text-8xl font-bold text-white font-mono tracking-tighter drop-shadow-md z-10">{timerDisplay}</p>
              {!timerActive ? (
                <button 
                  onClick={startTimer} 
                  className="z-10 flex items-center gap-3 px-10 py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-lg active:scale-95 text-lg"
                >
                  <Play className="w-5 h-5" fill="currentColor" /> Start Session
                </button>
              ) : (
                <button 
                  onClick={stopTimer} 
                  disabled={stopping} 
                  className="z-10 flex items-center gap-3 px-10 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-400 disabled:opacity-60 transition-all shadow-lg active:scale-95 text-lg border border-red-400"
                >
                  {stopping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Square className="w-5 h-5" fill="currentColor" />}
                  {stopping ? 'Saving Log...' : 'Finish & Save'}
                </button>
              )}
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20" />
            </div>

            {/* Dynamic Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-4 md:p-6 text-center border border-slate-100 dark:border-white/5 flex flex-col justify-center">
                <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Today Total</p>
                <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tabular-nums">{formatDuration(todayTime)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-4 md:p-6 text-center border border-slate-100 dark:border-white/5 flex flex-col justify-center">
                <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Cumulative Time</p>
                <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tabular-nums">{formatDuration(totalTimeAll)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-4 md:p-6 text-center border border-slate-100 dark:border-white/5 flex flex-col justify-center">
                <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Total Sessions</p>
                <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tabular-nums">{timeLogs.length}</p>
              </div>
            </div>
          </div>

          {/* History Column */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm p-5 md:p-8">
            <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-widest"><Clock className="w-4 h-4 text-indigo-500" /> Recent Log History</h3>
            {loading ? (
              <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
            ) : timeLogs.length === 0 ? (
              <div className="text-center py-10 opacity-40">
                <Clock className="w-10 h-10 mx-auto mb-3" />
                <p className="text-sm font-medium">No activity log found.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {timeLogs.slice(0, 10).map(log => {
                  const task = tasks.find(t => t.id === log.taskId);
                  return (
                    <div key={log.id} className="flex items-center justify-between py-3.5 px-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-white/5 rounded-2xl hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all cursor-default">
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight">{task?.title || 'System Task'}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{log.userName}</span>
                          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:block" />
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{formatRelativeTime(log.createdAt)}</span>
                        </div>
                        {log.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium italic line-clamp-1">{log.notes}</p>}
                      </div>
                      <span className="text-base md:text-lg font-bold text-indigo-600 dark:text-indigo-400 tabular-nums shrink-0">{formatDuration(log.duration || 0)}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {timeLogs.length > 10 && (
              <button className="w-full mt-6 py-3.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-2xl transition-all flex items-center justify-center gap-2 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/20">
                Load More Archives <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Breakdown Sidebar Column */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm p-6 md:p-8 h-fit lg:sticky lg:top-24">
          <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2 uppercase tracking-widest"><BarChart3 className="w-4 h-4 text-indigo-500" /> Project Weighting</h3>
          {loading ? (
            <div className="space-y-6">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
          ) : projectTotals.length === 0 ? (
            <div className="text-center py-10 opacity-40">
              <BarChart3 className="w-8 h-8 mx-auto mb-2" />
              <p className="text-xs font-medium uppercase tracking-widest">No data mapped</p>
            </div>
          ) : (
            <div className="space-y-6">
              {projectTotals.map(p => (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 truncate pr-4">{p.name}</span>
                    <span className="text-xs md:text-sm font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{formatDuration(p.total)}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-indigo-500 rounded-full shadow-lg transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(100, (p.total / totalTimeAll) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
