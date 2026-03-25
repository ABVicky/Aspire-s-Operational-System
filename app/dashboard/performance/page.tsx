'use client';

import { useEffect, useState } from 'react';
import { User, ActivityItem, Task } from '@/lib/types';
import { getUsers, getTasks, updateUser } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Skeleton, Avatar, EmptyState, MentionInput } from '@/components/shared';
import HierarchyTree from '@/components/dashboard/HierarchyTree';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, TrendingUp, Target, MessageSquare, 
  Search, Filter, ChevronRight, Star,
  Award, BarChart3, Clock, AlertCircle
} from 'lucide-react';
import { formatDuration, formatRelativeTime, cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function PerformancePage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [remark, setRemark] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    getUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setDetailsLoading(true);
      getTasks().then(tasks => {
        const filtered = tasks.filter(t => t.assigneeId === selectedUser.id);
        setUserTasks(filtered);
      }).finally(() => setDetailsLoading(false));
    }
  }, [selectedUser]);

  const handleUpdateRating = async (newRating: number) => {
    if (!selectedUser) return;
    setIsUpdating(true);
    try {
      await updateUser({ id: selectedUser.id, rating: newRating });
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, rating: newRating } : u));
      setSelectedUser({ ...selectedUser, rating: newRating });
      toast.success(`Rating updated for ${selectedUser.name}`);
    } catch (err) {
      toast.error('Failed to update rating');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddRemark = async () => {
    if (!remark.trim() || !selectedUser) return;
    // In a real app, this would be a separate "Remarks" or "Feedback" entity
    // For now, we'll toast it as a mock implementation
    toast.success(`Remark added for ${selectedUser.name}: "${remark}"`);
    setRemark('');
  };

  if (loading) return <div className="p-8"><Skeleton className="h-[600px] rounded-[2.5rem]" /></div>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-20">
      {/* Left Column: Hierarchy */}
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 p-6 shadow-premium h-full">
          <div className="mb-8">
            <h2 className="text-xl font-black tracking-tight font-display">Organization</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Hierarchical View</p>
          </div>
          <HierarchyTree 
            users={users} 
            onSelect={setSelectedUser} 
            selectedUserId={selectedUser?.id}
            currentRole={currentUser?.role}
            currentUserId={currentUser?.id}
          />
        </div>
      </div>

      {/* Right Column: Details */}
      <div className="xl:col-span-8">
        <AnimatePresence mode="wait">
          {selectedUser ? (
            <motion.div
              key={selectedUser.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* User Header Card */}
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 shadow-premium overflow-hidden relative group">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <Avatar name={selectedUser.name} src={selectedUser.avatar} size="lg" className="ring-4 ring-indigo-500/10" />
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black tracking-tighter font-display">{selectedUser.name}</h2>
                      <div className="flex items-center gap-3 mt-2">
                         <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/50">
                           {selectedUser.role}
                         </span>
                         <span className="text-xs text-slate-400 font-bold">{selectedUser.department}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-3xl border border-slate-100 dark:border-white/5">
                    <div className="text-center px-4 border-r border-slate-200 dark:border-white/10">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Grade</p>
                      <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-display">{selectedUser.rating || 0}</p>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Tasks</p>
                      <p className="text-2xl font-black text-slate-950 dark:text-white font-display">{userTasks.length}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Rating Update */}
                 <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 p-6 shadow-premium">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                       <Star className="w-4 h-4 text-amber-500" /> Assign Performance Rating
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                       {[20, 40, 60, 80, 100].map(val => (
                          <button
                            key={val}
                            disabled={isUpdating}
                            onClick={() => handleUpdateRating(val)}
                            className={cn(
                              "py-3 rounded-xl font-black text-sm transition-all border",
                              selectedUser.rating === val 
                                ? "bg-indigo-600 border-indigo-500 text-white" 
                                : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-indigo-500"
                            )}
                          >
                            {val}
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Remarks System */}
                 <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 p-6 shadow-premium overflow-visible">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                       <MessageSquare className="w-4 h-4 text-indigo-500" /> Add Remark/Observation
                    </h3>
                    <div className="flex gap-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 focus-within:ring-2 ring-indigo-500/20">
                       <MentionInput 
                         value={remark}
                         onChange={setRemark}
                         onSend={handleAddRemark}
                         users={users}
                         placeholder="Type observation here... (type @ to mention)"
                         className="flex-1"
                       />
                       <button 
                         onClick={handleAddRemark}
                         className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all self-end"
                       >
                         Post
                       </button>
                    </div>
                 </div>
              </div>

              {/* Task Activity */}
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-premium">
                 <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20">
                    <h3 className="text-lg font-black tracking-tight font-display">Assigned Tasks</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Operational view</p>
                 </div>
                 <div className="p-6">
                    {detailsLoading ? (
                      <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
                    ) : userTasks.length === 0 ? (
                      <EmptyState 
                        icon={<AlertCircle className="w-8 h-8 text-slate-200" />}
                        title="No tasks assigned" 
                        description="This user doesn't have any active tasks." 
                      />
                    ) : (
                      <div className="space-y-3">
                        {userTasks.map(task => (
                          <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-white/5 group">
                             <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-2 h-2 rounded-full",
                                  task.status === 'done' ? 'bg-green-500' : 'bg-indigo-500 blink'
                                )} />
                                <div>
                                   <p className="text-sm font-black text-slate-950 dark:text-white truncate max-w-[200px]">{task.title}</p>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{task.projectName}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-tighter px-2 py-1 bg-white dark:bg-slate-900 rounded-lg text-slate-500">
                                   {task.status}
                                </span>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center">
               <EmptyState 
                 icon={<Zap className="w-16 h-16 text-indigo-100 dark:text-slate-800" />}
                 title="Select a Team Member"
                 description="Select a manager or member from the organization tree to view detailed performance metrics and assign grades."
               />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
