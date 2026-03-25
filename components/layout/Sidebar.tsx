'use client';

import { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { cn, getInitials } from '@/lib/utils';
import { Avatar } from '@/components/shared';
import { LogoutModal } from '@/components/shared';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users, Building2,
  Clock, Zap, LogOut, ChevronRight, X, CalendarDays, TrendingUp
} from 'lucide-react';

const NAV_ITEMS: { href: string; label: string; icon: any; roles?: string[]; subRoles?: string[] }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/dashboard/clients', label: 'Clients', icon: Building2 },
  { href: '/dashboard/team', label: 'Team', icon: Users },
  { href: '/dashboard/performance', label: 'Performance', icon: Zap, roles: ['admin', 'manager'] },
  { href: '/dashboard/analytics', label: 'Analytics', icon: LayoutDashboard, roles: ['admin', 'manager'] },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: Users },
  { href: '/dashboard/leads', label: 'Leads', icon: TrendingUp, subRoles: ['bde'], roles: ['admin'] },
  { href: '/dashboard/time', label: 'Time Tracker', icon: Clock },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isOpen, close } = useSidebar();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-md lg:hidden"
            onClick={close}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-white/5 shadow-2xl shadow-indigo-500/10',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        style={{ width: 'var(--sidebar-width)' }}
      >
        {/* Logo Container */}
        <div className="flex items-center gap-3.5 px-6 py-8">
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.05 }}
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-lg border border-slate-100 dark:border-white/5"
          >
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain p-1.5" 
              onError={(e) => {
                // If logo fails, replace with a branded symbol
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.classList.add('bg-[#b01e6a]');
                e.currentTarget.parentElement!.innerHTML = '<span class="text-white font-black text-xl">A</span>';
              }}
            />
          </motion.div>
          <div className="flex-1 overflow-hidden">
            <h1 className="text-base font-black text-slate-950 dark:text-white leading-none tracking-tight font-display">Aspire OS</h1>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-[0.15em] mt-1.5 opacity-80">Workspace 2.0</p>
          </div>
          <button 
            onClick={close} 
            className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl bg-slate-50 dark:bg-white/5 transition-all border border-slate-200 dark:border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 space-y-8 scrollbar-hide py-2">
          <div>
            <p className="px-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Navigation
            </p>
            <ul className="space-y-1.5">
              {NAV_ITEMS.filter(item => {
                if (!user) return false;
                const roleOk = !item.roles || item.roles.includes(user.role);
                const subRoleOk = !item.subRoles || item.subRoles.includes(user.subRole as string);
                // Show if role matches, OR subRoles matches (BDE members get Leads)
                return item.roles ? roleOk : (subRoleOk || !item.subRoles);
              }).map(({ href, label, icon: Icon }) => {
                const isActive = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
                return (
                  <li key={label} className="relative">
                    <Link
                      href={href}
                      onClick={close}
                      className={cn(
                        'flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all group relative z-10',
                        isActive ? 'text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-pill"
                          className="absolute inset-0 bg-indigo-600 rounded-2xl -z-10 shadow-lg shadow-indigo-600/20 border border-white/10"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                        />
                      )}
                      <Icon className={cn('w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110', isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400')} />
                      <span className="flex-1 tracking-tight">{label}</span>
                      {isActive && <motion.div initial={{ x: -10 }} animate={{ x: 0 }}><ChevronRight className="w-4 h-4 opacity-50" /></motion.div>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Improved User Card */}
        <div className="p-4 mt-auto">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-3xl backdrop-blur-sm hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer group/user">
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={user?.name || ''} src={user?.avatar} size="md" className="ring-2 ring-indigo-500/5 dark:ring-indigo-500/10" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-950 dark:text-white truncate font-display tracking-tight">{user?.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">{user?.role}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-red-500/20"
              >
                <LogOut className="w-3 h-3" /> Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
      />
    </>
  );
}
