'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';
import { Search, Settings, Command, Menu, ChevronDown, User, LogOut, Sun, Moon } from 'lucide-react';
import { Avatar, ProfileModal, LogoutModal, SyncStatus } from '@/components/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export default function Topbar() {
  const { user, logout } = useAuth();
  const { toggle } = useSidebar();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
    <header 
      className="fixed top-0 right-0 left-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-white/5 lg:left-[var(--sidebar-width)] transition-all duration-300"
      style={{ height: 'var(--topbar-height)' }}
    >
      <div className="h-full px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Search */}
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <button
            onClick={toggle}
            className="lg:hidden p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95 text-slate-600 dark:text-slate-400"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button className="md:hidden p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95 text-slate-400">
            <Search className="w-5 h-5" />
          </button>

          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-100/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200/40 dark:border-white/5 transition-all w-full max-w-sm group cursor-text">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            <span className="text-sm text-slate-400 dark:text-slate-500 font-medium flex-1">Global Search...</span>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] font-black text-slate-400 dark:text-slate-500 shadow-sm leading-none shrink-0 uppercase">
              <Command className="w-2.5 h-2.5" /> K
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 md:gap-4">
          <div className="hidden lg:block">
            <SyncStatus />
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              {mounted && (
                theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />
              )}
            </button>
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="hidden sm:flex p-2.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group"
            >
              <Settings className="w-5 h-5 transition-transform group-hover:rotate-90" />
            </button>
          </div>

          <div className="h-8 w-[1px] bg-slate-200/60 hidden sm:block mx-1" />

          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className={cn(
                "flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl transition-all active:scale-95 group",
                showProfile ? "bg-slate-100 dark:bg-slate-800 shadow-inner" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
              )}
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 dark:text-white leading-tight font-display tracking-tight">{user?.name?.split(' ')[0]}</p>
                <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.1em] mt-0.5 opacity-80">{user?.role}</p>
              </div>
              <Avatar name={user?.name || ''} src={user?.avatar} size="md" className="ring-4 ring-indigo-500/5 group-hover:ring-indigo-500/10 transition-all border-indigo-100 active:ring-indigo-500/20 shadow-sm" />
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", showProfile && "rotate-180")} />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl shadow-slate-200/80 dark:shadow-black/50 p-2 overflow-hidden z-50 origin-top-right transition-colors"
                >
                  <div className="p-4 border-b border-slate-50 dark:border-white/5 flex items-center gap-3">
                    <Avatar name={user?.name || ''} src={user?.avatar} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate font-display tracking-tight">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="p-2 grid gap-1">
                    <button 
                      onClick={() => { setIsProfileModalOpen(true); setShowProfile(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-2xl transition-all text-left"
                    >
                      <User className="w-4 h-4 opacity-50" />
                      View Profile
                    </button>
                    <div className="my-1 border-t border-slate-50 dark:border-white/5" />
                    <button 
                      onClick={() => setIsLogoutModalOpen(true)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all text-left"
                    >
                      <LogOut className="w-4 h-4 opacity-50" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>

    <ProfileModal 
      isOpen={isProfileModalOpen} 
      onClose={() => setIsProfileModalOpen(false)} 
    />

    <LogoutModal 
      isOpen={isLogoutModalOpen}
      onClose={() => setIsLogoutModalOpen(false)}
      onConfirm={logout}
    />
    </>
  );
}
