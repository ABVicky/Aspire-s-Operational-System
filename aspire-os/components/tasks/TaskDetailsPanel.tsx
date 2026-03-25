'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Task, User, Comment, TimeLog, TaskStatus, Priority, Approval } from '@/lib/types';
import { getComments, addComment, getTimeLogs, logTime, updateTask, requestApproval, submitApproval } from '@/lib/api';
import { formatDate, formatRelativeTime, formatDuration } from '@/lib/utils';
import { StatusBadge, PriorityBadge, Avatar, Skeleton, MentionInput } from '@/components/shared';
import { X, MessageSquare, Clock, Send, Play, Square, Loader2, ChevronDown, Calendar, User as UserIcon, Link, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];
const PRIORITY_OPTIONS: Priority[] = ['low', 'medium', 'high', 'urgent'];

interface Props {
  task: Task;
  users: User[];
  onClose: () => void;
  onTaskUpdate: (task: Task) => void;
}

type Tab = 'details' | 'comments' | 'time' | 'approval';

export default function TaskDetailsPanel({ task, users, onClose, onTaskUpdate }: Props) {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('details');
  const [comments, setComments] = useState<Comment[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingTime, setLoadingTime] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const [timerDisplay, setTimerDisplay] = useState('00:00:00');
  const [stoppingTimer, setStoppingTimer] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Approval state
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);
  const [rejectRemark, setRejectRemark] = useState('');
  const [rejectingFor, setRejectingFor] = useState<string | null>(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [localTask, setLocalTask] = useState<Task>(task);

  // Load comments
  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    try { setComments(await getComments(localTask.id)); } finally { setLoadingComments(false); }
  }, [localTask.id]);

  // Load time logs
  const loadTimeLogs = useCallback(async () => {
    setLoadingTime(true);
    try { setTimeLogs(await getTimeLogs(localTask.id)); } finally { setLoadingTime(false); }
  }, [localTask.id]);

  useEffect(() => {
    if (tab === 'comments') loadComments();
    if (tab === 'time') loadTimeLogs();
  }, [tab, loadComments, loadTimeLogs]);

  // Timer logic
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
    setTimerStart(new Date());
    setTimerActive(true);
    setTimerDisplay('00:00:00');
    toast.info('Timer started!');
  };

  const stopTimer = async () => {
    if (!timerStart || !user) return;
    setStoppingTimer(true);
    const endTime = new Date();
    const durationSecs = Math.floor((endTime.getTime() - timerStart.getTime()) / 1000);
    try {
      const log = await logTime({
        taskId: task.id,
        projectId: task.projectId,
        userId: user.id,
        userName: user.name,
        startTime: timerStart.toISOString(),
        endTime: endTime.toISOString(),
        duration: durationSecs,
        notes: '',
      });
      setTimeLogs(prev => [log, ...prev]);
      toast.success(`Logged ${formatDuration(durationSecs)}`);
    } catch {
      toast.error('Failed to save time log.');
    } finally {
      setTimerActive(false);
      setTimerStart(null);
      setTimerDisplay('00:00:00');
      setStoppingTimer(false);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || !user) return;
    setPostingComment(true);
    try {
      const comment = await addComment({ taskId: localTask.id, userId: user.id, userName: user.name, text: newComment.trim() });
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch {
      toast.error('Failed to post comment.');
    } finally { setPostingComment(false); }
  };

  const handleStatusChange = async (status: TaskStatus) => {
    if (status === 'done' && localTask.approvalRequired && !(localTask.approvals?.every(a => a.status === 'approved'))) {
      toast.error('This task requires all approvals before it can be marked as Done.');
      return;
    }
    const updated = { ...localTask, status };
    setLocalTask(updated);
    onTaskUpdate(updated);
    try { await updateTask(localTask.id, { status }); } catch { toast.error('Failed to update status.'); }
  };

  const handleRequestApproval = async () => {
    if (selectedApprovers.length === 0) { toast.error('Select at least one approver'); return; }
    setApprovalLoading(true);
    try {
      const approverUsers = users.filter(u => selectedApprovers.includes(u.id));
      const updated = await requestApproval(localTask.id, selectedApprovers, approverUsers.map(u => u.name));
      setLocalTask(updated);
      onTaskUpdate(updated);
      toast.success('Approval requested!');
    } catch (err: any) { toast.error(err.message); } finally { setApprovalLoading(false); }
  };

  const handleSubmitApproval = async (approverId: string, status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !rejectRemark.trim()) { toast.error('Please add a rejection remark'); return; }
    setApprovalLoading(true);
    try {
      const updated = await submitApproval(localTask.id, approverId, status, rejectRemark || undefined);
      setLocalTask(updated);
      onTaskUpdate(updated);
      setRejectingFor(null);
      setRejectRemark('');
      toast.success(status === 'approved' ? 'Approved!' : 'Rejected — task moved back to Todo');
    } catch (err: any) { toast.error(err.message); } finally { setApprovalLoading(false); }
  };

  const totalTaskTime = timeLogs.reduce((a, l) => a + (l.duration || 0), 0);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full lg:max-w-xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden border-l dark:border-white/5">
        {/* Header - Mobile friendly with safe-area padding */}
        <div className="flex items-start justify-between p-5 md:p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20" style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}>
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {task.projectId && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] uppercase font-bold tracking-widest border border-indigo-100">
                  <Link className="w-2.5 h-2.5" /> {task.projectName || 'Project'}
                </div>
              )}
            </div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">{task.title}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 md:p-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-90 shadow-sm shrink-0 border border-slate-200 dark:border-white/5 md:border-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-white/5 px-3 md:px-5 overflow-x-auto">
          {(['details', 'comments', 'time', ...(localTask.status === 'review' || localTask.approvalRequired ? ['approval'] : [])] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 flex-1 md:flex-initial px-4 py-4 md:py-3 text-xs md:text-sm font-bold capitalize border-b-2 transition-all ${tab === t ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
            >
              {t === 'time' ? 'Time Logs' : t === 'approval' ? '🔐 Approval' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
          {tab === 'details' && (
            <div className="p-5 md:p-8 space-y-6 md:space-y-8">
              {/* Description */}
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Description</label>
                <div className="bg-slate-50/80 dark:bg-slate-950/40 rounded-2xl p-4 md:p-5 border border-slate-100 dark:border-white/5">
                  <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {task.description || <span className="text-slate-300 dark:text-slate-600 italic">No description provided.</span>}
                  </p>
                </div>
              </div>

              {/* Meta Grid - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">Status</label>
                  <div className="relative">
                    <select 
                      value={task.status} 
                      onChange={e => handleStatusChange(e.target.value as TaskStatus)} 
                      className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none shadow-sm cursor-pointer"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s} className="dark:bg-slate-900">{s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Priority</label>
                  <div className="flex items-center h-12 px-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold"><PriorityBadge priority={task.priority} /></div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">Assignee</label>
                  <div className="flex items-center gap-3 h-12 px-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-white/5">
                    {task.assigneeName ? (
                      <>
                        <Avatar 
                          name={task.assigneeName} 
                          src={users.find(u => u.id === task.assigneeId)?.avatar} 
                          size="sm" 
                        />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{task.assigneeName}</span>
                      </>
                    ) : <span className="text-sm font-bold text-slate-300 dark:text-slate-600">Unassigned</span>}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">Target Completion</label>
                  <div className="flex items-center gap-3 h-12 px-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-white/5">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatDate(task.dueDate)}</span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="text-[10px] text-slate-400 dark:text-slate-500 space-y-2 pt-6 border-t border-slate-100 dark:border-white/5 uppercase tracking-widest font-bold">
                <p className="flex items-center justify-between">Record Created <span>{formatRelativeTime(task.createdAt)}</span></p>
                <p className="flex items-center justify-between">Last Modified <span>{formatRelativeTime(task.updatedAt)}</span></p>
              </div>
            </div>
          )}

          {tab === 'comments' && (
            <div className="flex flex-col h-full bg-slate-50/30">
              <div className="flex-1 p-5 md:p-6 space-y-6 overflow-y-auto">
                {loadingComments ? (
                  <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                      <MessageSquare className="w-6 h-6 text-slate-200" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">Collaborate with your team here.</p>
                  </div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar name={comment.userName || ''} src={comment.userAvatar} size="md" />
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between mb-1.5 px-0.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{comment.userName}</span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{formatRelativeTime(comment.createdAt)}</span>
                        </div>
                        <div className="text-sm md:text-base text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 shadow-sm rounded-2xl px-4 py-3.5 leading-relaxed font-medium">
                          {comment.text}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Comment Input - Mobile friendly bottom bar */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                <div className="flex items-end gap-3 max-w-4xl mx-auto">
                  {user && <Avatar name={user.name} src={user.avatar} size="md" className="shrink-0 mb-1" />}
                  <div className="flex-1 flex items-end gap-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl px-3 py-2.5 shadow-inner transition-focus focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-500/10 focus-within:border-indigo-200 dark:focus-within:border-indigo-500/30 overflow-visible">
                    <MentionInput
                      value={newComment}
                      onChange={setNewComment}
                      onSend={handleComment}
                      users={users}
                      placeholder="Share your thoughts... (type @ to mention)"
                      className="flex-1"
                    />
                    <button 
                      onClick={handleComment} 
                      disabled={!newComment.trim() || postingComment} 
                      className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-30 disabled:grayscale transition-all shadow-md active:scale-90 shrink-0"
                    >
                      {postingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" fill="currentColor" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'time' && (
            <div className="p-5 md:p-8 space-y-8">
              {/* Timer control */}
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-600/30">
                <div className="relative z-10 text-center">
                  <p className="text-[10px] md:text-xs font-bold text-indigo-200 uppercase tracking-widest mb-3">Live Work Timer</p>
                  <p className="text-5xl md:text-6xl font-bold font-mono tracking-tighter mb-8 drop-shadow-md">{timerDisplay}</p>
                  
                  <div className="flex justify-center">
                    {!timerActive ? (
                      <button onClick={startTimer} className="flex items-center gap-2.5 px-8 md:px-10 py-3.5 md:py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-lg active:scale-95 text-base">
                        <Play className="w-5 h-5" fill="currentColor" /> Start Log
                      </button>
                    ) : (
                      <button 
                        onClick={stopTimer} 
                        disabled={stoppingTimer} 
                        className="flex items-center gap-2.5 px-8 md:px-10 py-3.5 md:py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-400 disabled:opacity-60 transition-all shadow-lg active:scale-95 text-base border border-red-400"
                      >
                        {stoppingTimer ? <Loader2 className="w-5 h-5 animate-spin" /> : <Square className="w-5 h-5" fill="currentColor" />}
                        {stoppingTimer ? 'Processing...' : 'Complete & Save'}
                      </button>
                    )}
                  </div>
                  
                  {totalTaskTime > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Total Duration</span>
                      <span className="text-lg font-bold tabular-nums">{formatDuration(totalTaskTime)}</span>
                    </div>
                  )}
                </div>
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-30 -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400 rounded-full blur-2xl opacity-20 -ml-12 -mb-12" />
              </div>

              {/* Time logs history */}
              <div className="pb-10">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Log History</h3>
                {loadingTime ? (
                  <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
                ) : timeLogs.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <Clock className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">No time entries recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {timeLogs.map(log => (
                      <div key={log.id} className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Work Session</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{log.userName}</span>
                            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{formatRelativeTime(log.createdAt)}</span>
                          </div>
                        </div>
                        <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums ml-4">{formatDuration(log.duration || 0)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Approval Tab */}
          {tab === 'approval' && (
            <div className="p-5 md:p-8 space-y-6">
              {/* Badge */}
              <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/30 rounded-2xl p-4">
                <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                  <p className="text-sm font-black text-indigo-900 dark:text-indigo-200">
                    {localTask.approvalRequired ? 'Approval Requested' : 'Request Approval'}
                  </p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    {localTask.approvalRequired
                      ? `${localTask.approvals?.filter(a => a.status === 'approved').length || 0}/${localTask.approvals?.length || 0} approved`
                      : 'Select team members to approve this work before it moves to Done.'}
                  </p>
                </div>
              </div>

              {!localTask.approvalRequired ? (
                /* Approver Selection */
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Select Approvers</label>
                    <div className="space-y-2">
                      {users.filter(u => u.id !== user?.id).map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setSelectedApprovers(prev =>
                            prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id]
                          )}
                          className={cn(
                            'w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left',
                            selectedApprovers.includes(u.id)
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:border-indigo-300'
                          )}
                        >
                          <Avatar name={u.name} src={u.avatar} size="sm" />
                          <div className="flex-1">
                            <p className="text-sm font-black">{u.name}</p>
                            <p className="text-[10px] font-bold opacity-70 uppercase">{u.role}</p>
                          </div>
                          {selectedApprovers.includes(u.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleRequestApproval}
                    disabled={approvalLoading || selectedApprovers.length === 0}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {approvalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Request Approval from {selectedApprovers.length} {selectedApprovers.length === 1 ? 'person' : 'people'}
                  </button>
                </div>
              ) : (
                /* Approver Status List */
                <div className="space-y-3">
                  {localTask.approvals?.map(approval => {
                    const isCurrentUser = approval.approverId === user?.id;
                    const statusConfig = {
                      pending: { color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/30', label: 'Pending' },
                      approved: { color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/30', label: 'Approved' },
                      rejected: { color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/30', label: 'Rejected' },
                    }[approval.status];
                    return (
                      <div key={approval.id} className="border border-slate-100 dark:border-white/10 rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-3 p-4">
                          <Avatar name={approval.approverName} src={users.find(u => u.id === approval.approverId)?.avatar} size="sm" />
                          <div className="flex-1">
                            <p className="text-sm font-black text-slate-900 dark:text-white">{approval.approverName}</p>
                            {approval.remark && <p className="text-xs text-slate-500 mt-0.5">{approval.remark}</p>}
                          </div>
                          <span className={cn('text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border', statusConfig.color)}>
                            {statusConfig.label}
                          </span>
                        </div>
                        {isCurrentUser && approval.status === 'pending' && (
                          <div className="px-4 pb-4 space-y-2">
                            {rejectingFor === approval.id && (
                              <input
                                autoFocus
                                type="text"
                                placeholder="Add rejection remark..."
                                value={rejectRemark}
                                onChange={e => setRejectRemark(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 ring-red-500/20"
                              />
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSubmitApproval(approval.approverId, 'approved')}
                                disabled={approvalLoading}
                                className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                              </button>
                              {rejectingFor !== approval.id ? (
                                <button
                                  onClick={() => setRejectingFor(approval.id)}
                                  className="flex-1 py-2.5 bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-800/30 font-black rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSubmitApproval(approval.approverId, 'rejected')}
                                  disabled={approvalLoading}
                                  className="flex-1 py-2.5 bg-red-600 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                                >
                                  {approvalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Reject'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
