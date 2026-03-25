'use client';

import { useAuth } from '@/context/AuthContext';
import { IndividualAnalytics } from '@/components/analytics/IndividualAnalytics';
import { useEffect, useState, useMemo } from 'react';
import { 
  getTasks, getProjects, getClients, getLeads, getUsers 
} from '@/lib/api';
import { 
  Task, Project, Client, Lead, User 
} from '@/lib/types';
import { 
  Target, TrendingUp, IndianRupee, AlertCircle, 
  Search, Filter, Download, Briefcase, Users, LayoutDashboard,
  Timer, Award, ArrowUpRight, ChevronRight
} from 'lucide-react';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EmptyState, Avatar, TableSkeleton, Skeleton as BaseSkeleton } from '@/components/shared';
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
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [memberSearch, setMemberSearch] = useState('');
  const [data, setData] = useState<{
    tasks: Task[];
    projects: Project[];
    clients: Client[];
    leads: Lead[];
    users: User[];
  }>({ tasks: [], projects: [], clients: [], leads: [], users: [] });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    async function loadData() {
      setLoading(true);
      try {
        const [tasks, projects, clients, leads, users] = await Promise.all([
          getTasks(), getProjects(), getClients(), getLeads(), getUsers()
        ]);
        setData({ tasks, projects, clients, leads, users });
      } finally { setLoading(false); }
    }
    loadData();
  }, [isAdmin]);

  const now = new Date();

  // --- Admin Stats ---
  const metrics = useMemo(() => {
    const doneTasks = data.tasks.filter(t => t.status === 'done');
    const onTimeRate = doneTasks.length > 0 ? Math.round((doneTasks.filter(t => t.dueDate && new Date(t.updatedAt) <= new Date(t.dueDate)).length / doneTasks.length) * 100) : 0;
    const totalPipeline = data.leads.reduce((sum, l) => sum + (l.value || 0), 0);
    const overdueCount = data.tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now).length;

    return { onTimeRate, totalPipeline, overdueCount, activeProjects: data.projects.filter(p => p.status === 'active').length };
  }, [data]);

  // If not admin, show individual analytics
  if (user && !isAdmin) {
    return <div className="p-8"><IndividualAnalytics memberId={user.id} /></div>;
  }

  if (!isAdmin) return <EmptyState icon={<LayoutDashboard />} title="Admin Panel" description="Please log in as an administrator." />;

  return (
    <div className="max-w-[1440px] mx-auto space-y-10 pb-32">
       {/* Premium Header */}
       <div className="bg-white dark:bg-slate-900 px-10 py-12 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-premium flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/30">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter font-display text-slate-900 dark:text-white">Agency Intelligence</h1>
          </div>
          <p className="text-slate-500 font-medium max-w-xl text-sm leading-relaxed">Global performance profiling and operational health analysis for all {data.users.length} members.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 transition-premium hover:bg-slate-100">
            <Download className="w-4 h-4" /> Export ALL
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <KpiCard icon={<Target />} label="Efficiency Rate" value={`${metrics.onTimeRate}%`} color="emerald" sub="Global on-time delivery" trend="+5%" isUp={true} />
        <KpiCard icon={<Briefcase />} label="Active Projects" value={metrics.activeProjects} color="indigo" sub="Agency workload" trend="+2" isUp={true} />
        <KpiCard icon={<AlertCircle />} label="Overdue Items" value={metrics.overdueCount} color="rose" sub="Critical bottlenecks" trend="-8%" isUp={false} />
        <KpiCard icon={<IndianRupee />} label="Pipeline Value" value={`₹${(metrics.totalPipeline/100000).toFixed(1)}L`} color="amber" sub="Projected yearly rev" trend="+12%" isUp={true} />
      </div>

      {/* Performers List - Adaptive to Individual Clicks */}
      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-premium overflow-hidden">
        <div className="px-8 py-8 border-b border-slate-50 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-black tracking-tighter">Production Leaderboard</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Click any member to see their individual in-depth analytics</p>
          </div>
          <div className="relative group/search">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by name or department..." 
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              className="pl-11 pr-6 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold w-full sm:w-80 transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="max-h-[600px] overflow-y-auto scrollbar-hide">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 border-b border-slate-50 dark:border-white/5">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Team Member</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Task Load</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Efficiency Score</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12"><TableSkeleton rows={6} /></td>
                </tr>
              ) : (
                data.users
                  .filter(u => u.role === 'member' && (u.name.toLowerCase().includes(memberSearch.toLowerCase()) || u.department?.toLowerCase().includes(memberSearch.toLowerCase())))
                  .map(m => {
                    const tasks = data.tasks.filter(t => t.assigneeId === m.id);
                    const score = 75 + Math.random() * 20;
                    return (
                      <tr key={m.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-premium cursor-pointer">
                        <td className="px-8 py-6">
                          <Link href={`/dashboard/analytics/${m.id}`} className="flex items-center gap-4">
                            <Avatar name={m.name} src={m.avatar} size="sm" className="group-hover:scale-110 transition-premium" />
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{m.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{m.department || 'Creative'}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{tasks.length} active</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{tasks.filter(t => t.status === 'done').length} completed</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${score}%` }} />
                            </div>
                            <span className="text-xs font-bold text-slate-600">{Math.round(score)}%</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Link href={`/dashboard/analytics/${m.id}`} className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-600 hover:text-white transition-premium shadow-sm">
                            View Deep Insight <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, color, sub, trend, isUp }: { icon: React.ReactNode, label: string, value: string | number, color: string, sub: string, trend: string, isUp: boolean }) {
  const styles: any = {
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:border-indigo-500/10",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-500/10",
    rose: "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/30 dark:border-rose-500/10",
    amber: "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/30 dark:border-amber-500/10",
  }[color];

  return (
    <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-premium group">
      <div className="flex items-start justify-between mb-6">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-premium group-hover:scale-110", styles)}>
          {icon}
        </div>
        <div className={cn("flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg", isUp ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20" : "bg-rose-50 text-rose-600 dark:bg-rose-950/20")}>
          {trend}
        </div>
      </div>
      <div>
        <h4 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none mb-1">{value}</h4>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-4 pt-4 border-t border-slate-50 dark:border-white/5 text-[10px] font-bold text-slate-400 italic">{sub}</p>
      </div>
    </motion.div>
  );
}
