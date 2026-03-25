'use client';

import { useEffect, useState, useMemo } from 'react';
import { getDashboardStats, getUsers } from '@/lib/api';
import { DashboardStats, User } from '@/lib/types';
import { StatCard, Skeleton, Avatar, ProjectModal, ChartSkeleton, TableSkeleton } from '@/components/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  FolderKanban, CheckSquare, Clock, TrendingUp,
  Plus, Calendar, MoreHorizontal, ArrowUpRight,
  Target, Zap, Activity
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { formatDuration, formatRelativeTime, cn } from '@/lib/utils';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'7D' | '30D'>('7D');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        getDashboardStats(),
        getUsers()
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const memoizedLineData = useMemo(() => ({
    labels: stats?.timeLoggedByDay.slice(timeRange === '7D' ? -7 : -30).map(d => d.date.split('-').slice(1).join('/')) || [],
    datasets: [{
      label: 'Hours',
      data: stats?.timeLoggedByDay.slice(timeRange === '7D' ? -7 : -30).map(d => d.hours) || [],
      borderColor: '#6366f1',
      backgroundColor: (context: any) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        return gradient;
      },
      fill: true,
      tension: 0.45,
      pointRadius: timeRange === '30D' ? 4 : 6,
      pointHoverRadius: timeRange === '30D' ? 6 : 8,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#6366f1',
      pointBorderWidth: 3,
    }]
  }), [stats, timeRange]);

  const memoizedBarData = useMemo(() => ({
    labels: ['Backlog', 'Active', 'Review', 'Done'],
    datasets: [{
      label: 'Tasks',
      data: [
        stats?.tasksByStatus.todo || 0,
        stats?.tasksByStatus['in-progress'] || 0,
        stats?.tasksByStatus.review || 0,
        stats?.tasksByStatus.done || 0,
      ],
      backgroundColor: ['#ef4444', '#6366f1', '#fbbf24', '#10b981'],
      borderRadius: 12,
      barThickness: 32,
    }]
  }), [stats]);

  const chartOptions: any = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        titleFont: { size: 12, family: 'sans-serif', weight: 'bold' },
        bodyFont: { size: 12 },
        cornerRadius: 12,
        displayColors: false,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11, weight: '600' }, color: '#94a3b8' } },
      y: { grid: { borderDash: [5, 5], color: '#f1f5f9' }, ticks: { font: { size: 11, weight: '600' }, color: '#94a3b8' } }
    }
  }), []);

  const container: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.3 } }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 md:space-y-12 pb-12 page-fade-in"
    >
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <motion.h1
            variants={item}
            className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight font-display"
          >
            Hello, {user?.name.split(' ')[0]}!
          </motion.h1>
          <motion.p variants={item} className="text-slate-500 dark:text-slate-400 font-medium mt-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            {user?.role === 'admin' ? 'Full platform analytics active.' : 
             user?.role === 'manager' ? 'Track your team\'s progress here.' :
             'Your personal workspace is ready.'}
          </motion.p>
        </div>
        <motion.button
          variants={item}
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsProjectModalOpen(true)}
          className="group flex items-center justify-center gap-2.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-premium shadow-xl shadow-indigo-600/30 text-sm tracking-tight border border-white/10"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span>New Project</span>
        </motion.button>
      </div>

      {/* Optimized Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {loading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-[2rem]" />)
        ) : (
          <>
            <StatCard title="Total Projects" value={stats?.totalProjects || 0} icon={<FolderKanban className="w-5 h-5" />} color="blue" trend={stats?.projectsTrend} href="/dashboard/projects" />
            <StatCard title="Active Backlog" value={stats?.activeTasks || 0} icon={<Zap className="w-5 h-5" />} color="amber" trend={stats?.tasksTrend} href="/dashboard/tasks" />
            <StatCard title="Velocity" value={stats?.completionRate || '0%'} icon={<Target className="w-5 h-5" />} color="green" href="/dashboard/time" />
          </>
        )}
      </motion.div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-10">
        {/* Work Intensity Card */}
        <motion.div
          variants={item}
          className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 p-6 md:p-10 shadow-premium hover:shadow-hover transition-all group"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-950 dark:text-white tracking-tight font-display">Work Intensity</h2>
              <p className="text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1 opacity-70">
                {timeRange === '7D' ? 'Weekly' : 'Monthly'} activity trends
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/40 p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/5">
              <button 
                onClick={() => setTimeRange('7D')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                  timeRange === '7D' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/10" : "text-slate-400 hover:text-slate-600"
                )}
              >
                7D
              </button>
              <button 
                onClick={() => setTimeRange('30D')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                  timeRange === '30D' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/10" : "text-slate-400 hover:text-slate-600"
                )}
              >
                30D
              </button>
            </div>
          </div>
          <div className="h-[300px] md:h-[380px]">
            {loading ? <ChartSkeleton /> : <Line data={memoizedLineData} options={chartOptions} />}
          </div>
        </motion.div>

        {/* Task Distribution Card */}
        <motion.div
          variants={item}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 p-6 md:p-10 shadow-premium hover:shadow-hover transition-all"
        >
          <div className="mb-10">
            <h2 className="text-xl md:text-2xl font-black text-slate-950 dark:text-white tracking-tight font-display">Capacity</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1 opacity-70">Tasks by status</p>
          </div>
          <div className="h-[300px] md:h-[380px] flex items-end">
            {loading ? <ChartSkeleton /> : <Bar data={memoizedBarData} options={chartOptions} />}
          </div>
        </motion.div>
      </div>

      {/* Bottom Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        <motion.div
          variants={item}
          className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 overflow-hidden shadow-premium"
        >
          <div className="p-8 md:p-10 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-950 dark:text-white tracking-tight font-display">Recent Activity</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.15em] mt-1">Live workspace updates</p>
            </div>
            <Link href="/dashboard/tasks" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/30 px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-premium hover:shadow-lg hover:shadow-indigo-500/10 border border-indigo-100 dark:border-indigo-900/50">
              View All
            </Link>
          </div>
          <div className="p-4 md:p-8">
            {loading ? (
              <TableSkeleton rows={4} />
            ) : (
              <div className="space-y-2">
                {stats?.recentActivity.map((act, index) => (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link
                      href={act.type.includes('task') ? `/dashboard/tasks?task=${act.entityId}` : act.type.includes('project') ? `/dashboard/projects?id=${act.entityId}` : '#'}
                      className="flex items-center gap-4 md:gap-6 p-4 md:p-5 rounded-3xl hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-premium group border border-transparent hover:border-slate-100 dark:hover:border-white/5"
                    >
                      <Avatar 
                        name={act.userName} 
                        src={users.find(u => u.id === act.userId)?.avatar}
                        size="md" 
                        className="ring-4 ring-slate-100 dark:ring-slate-800 group-hover:ring-white dark:group-hover:ring-slate-700 transition-premium shadow-sm" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                          <span className="font-bold text-slate-950 dark:text-white">{act.userName}</span>
                          <span className="mx-1.5 opacity-60 font-bold">{act.message}</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-100/50 dark:border-indigo-900/50 inline-block">{act.entityName}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-2.5">
                          <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{formatRelativeTime(act.createdAt)}</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-indigo-400/80">{act.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm transition-premium shrink-0">
                        <ArrowUpRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Community/Support Placeholder */}
        <motion.div
          variants={item}
          className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/30 group"
        >
          <div className="relative z-10 h-full flex flex-col">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
              className="w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-xl flex items-center justify-center mb-10 border border-white/20 shadow-inner shadow-white/5"
            >
              <Calendar className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-black mb-4 tracking-tighter font-display">Agency Sync</h2>
            <p className="text-indigo-100/80 text-base leading-relaxed mb-auto font-bold">Reviewing this month's growth and upcoming milestones.</p>

            <div className="mt-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex -space-x-3">
                  {users.slice(0, 4).map((u) => (
                    <Avatar 
                      key={u.id}
                      name={u.name}
                      src={u.avatar}
                      size="sm"
                      className="w-11 h-11 border-4 border-indigo-600 shadow-lg"
                    />
                  ))}
                </div>
                <span className="text-sm font-black text-indigo-100">+{Math.max(0, users.length - 4)} more</span>
              </div>
              <Link href="/dashboard/calendar" className="w-full py-5 bg-white text-indigo-600 font-bold rounded-3xl hover:bg-slate-50 transition-premium shadow-2xl shadow-black/10 active:scale-95 text-sm uppercase tracking-widest flex items-center justify-center">
                Sync Now
              </Link>
            </div>
          </div>
          {/* Decorative gradients */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-400 rounded-full blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity" />
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-[60px] opacity-20" />
        </motion.div>
      </div>

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSuccess={() => loadData()}
      />
    </motion.div>
  );
}
