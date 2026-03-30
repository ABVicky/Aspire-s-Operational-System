'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  getTasks, getProjects, getUsers, getDashboardStats 
} from '@/lib/api';
import { 
  Task, Project, User, DashboardStats 
} from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { 
  Target, TrendingUp, AlertCircle, 
  Briefcase, CheckCircle2, Clock, Calendar, 
  ChevronLeft, BarChart3, Star, Zap, Award
} from 'lucide-react';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { cn, getInitials } from '@/lib/utils';
import { EmptyState, Avatar, Skeleton as BaseSkeleton } from '@/components/shared';
import Link from 'next/link';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement, 
  PointElement, LineElement, Title, Tooltip, Legend, Filler
);

const THEME = {
  indigo: '#4f46e5',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  violet: '#8b5cf6',
};

interface IndividualAnalyticsProps {
  memberId: string;
  isAdminView?: boolean;
}

export function IndividualAnalytics({ memberId, isAdminView = false }: IndividualAnalyticsProps) {
  const { user: currentUser } = useAuth();
  const { tasks: allTasks, projects, users, stats, loading: globalLoading } = useData();

  const data = useMemo(() => {
    const targetUser = users.find(u => u.id === memberId) || null;
    const userTasks = allTasks.filter(t => t.assigneeId === memberId);
    return { tasks: userTasks, projects, user: targetUser, stats };
  }, [memberId, allTasks, projects, users, stats]);

  const loading = globalLoading && data.tasks.length === 0;

  const metrics = useMemo(() => {
    const doneTasks = data.tasks.filter(t => t.status === 'done');
    const onTimeTasks = doneTasks.filter(t => t.dueDate && new Date(t.updatedAt) <= new Date(t.dueDate));
    const onTimeRate = doneTasks.length > 0 ? Math.round((onTimeTasks.length / doneTasks.length) * 100) : 0;
    const productivity = data.tasks.length > 0 ? Math.round((doneTasks.length / data.tasks.length) * 100) : 0;
    const avgCompletionTime = doneTasks.length > 0 ? (doneTasks.reduce((acc, t) => acc + (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime()), 0) / doneTasks.length / (1000 * 3600)).toFixed(1) : '0';

    return { onTimeRate, productivity, avgCompletionTime, total: data.tasks.length, done: doneTasks.length };
  }, [data]);

  const taskTrendData = useMemo(() => {
    // Last 7 days
    const labels = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    });
    
    return {
      labels,
      datasets: [{
        label: 'Tasks Completed',
        data: [2, 5, 3, 6, 2, 4, 3], // Mocked for individual trend depth
        borderColor: THEME.indigo,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    };
  }, []);

  const projectDistribution = useMemo(() => {
    const counts = data.projects.reduce((acc, p) => {
      const userProjectTasks = data.tasks.filter(t => t.projectId === p.id);
      if (userProjectTasks.length > 0) acc[p.name] = userProjectTasks.length;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: [THEME.indigo, THEME.emerald, THEME.amber, THEME.rose, THEME.violet],
        borderWidth: 0,
      }]
    };
  }, [data]);

  if (loading) return (
    <div className="space-y-8 max-w-7xl mx-auto py-10">
      <BaseSkeleton className="h-[200px] rounded-[3rem]" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => <BaseSkeleton key={i} className="h-32 rounded-[2rem]" />)}
      </div>
      <BaseSkeleton className="h-[400px] rounded-[3rem]" />
    </div>
  );
  if (!data.user) return <EmptyState icon={<AlertCircle />} title="Member Not Found" description="The member data could not be retrieved." />;

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Mini-Header for Admin View */}
      {isAdminView && (
        <Link href="/dashboard/analytics" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-premium group mb-4">
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Team Overview
        </Link>
      )}

      {/* Member Profile Card */}
      <div className="bg-white dark:bg-slate-900 px-8 py-10 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar name={data.user.name} src={data.user.avatar} size="lg" className="ring-4 ring-indigo-500/20" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">{data.user.id === currentUser?.id ? 'My Professional Growth' : data.user.name}</h1>
              <Award className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3 h-3 fill-current" /> {data.user.department || 'Creative'} Specialist
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-3xl border border-slate-100 dark:border-white/5">
          <div className="text-center px-4 border-r border-slate-200 dark:border-white/10 last:border-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Weekly Score</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">9.4</p>
          </div>
          <div className="text-center px-4 border-r border-slate-200 dark:border-white/10 last:border-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Accuracy</p>
            <p className="text-2xl font-black text-emerald-500">98%</p>
          </div>
        </div>
      </div>

      {/* Primary Individual Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Overall Productivity" value={`${metrics.productivity}%`} icon={<TrendingUp />} color="indigo" />
        <StatCard label="On-Time Delivery" value={`${metrics.onTimeRate}%`} icon={<Target />} color="emerald" />
        <StatCard label="Total Output" value={metrics.done} icon={<CheckCircle2 />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Productivity Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-premium">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" /> Weekly Output Trend
            </h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-lg text-[10px] font-bold">
              +12% Performance increase
            </div>
          </div>
          <div className="h-[300px]">
            <Line data={taskTrendData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false }, ticks: { font: { size: 10, weight: '700' }, color: '#94a3b8' } },
                y: { grid: { color: 'rgba(0,0,0,0.03)' }, border: { display: false }, ticks: { font: { size: 10 }, color: '#94a3b8' } }
              }
            } as any} />
          </div>
        </div>

        {/* Project Workload Distribution */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-premium flex flex-col">
          <h3 className="text-xl font-black tracking-tight mb-8">Workload Hub</h3>
          <div className="flex-1 flex items-center justify-center">
            <div className="h-[250px] w-full mt-4">
              <Doughnut data={projectDistribution} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 6, usePointStyle: true, font: { size: 10, weight: 'bold' } } } }
              } as any} />
            </div>
          </div>
        </div>
      </div>

      {/* Individual Task Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-premium overflow-hidden">
        <div className="px-8 py-8 border-b border-slate-50 dark:border-white/5">
          <h3 className="text-xl font-black tracking-tight">Recent Deliverables</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Performance breakdown of your last 5 tasks</p>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-white/5">
          {data.tasks.slice(0, 5).map(task => (
            <div key={task.id} className="px-8 py-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-all group">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  task.status === 'done' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20" : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20"
                )}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">{task.title}</p>
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase">
                    {task.projectId} • {new Date(task.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                  <Star className="w-3 h-3 fill-current" /> Perfect Delivery
                </div>
                <div className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest",
                  task.status === 'done' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                )}>
                  {task.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string | number, icon: React.ReactNode, color: string }) {
  const colors: any = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-800/20",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800/20",
    amber: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:border-amber-800/20",
    rose: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/30 dark:border-rose-800/20",
  }[color];

  return (
    <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-premium flex flex-col gap-4 transition-premium hover-premium">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-premium", colors)}>
        {icon}
      </div>
      <div>
        <h4 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none mb-1">{value}</h4>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      </div>
    </motion.div>
  );
}
