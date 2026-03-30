'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SidebarProvider } from '@/context/SidebarContext';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import BottomNav from '@/components/layout/BottomNav';
import DelayAlertBanner from '@/components/layout/DelayAlertBanner';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !user && mounted) {
      router.push('/login');
    }
  }, [user, isLoading, router, mounted]);

  if (isLoading || !mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-slate-950 transition-colors duration-500">
        <Sidebar aria-label="Sidebar navigation" />
        <div className="flex flex-col flex-1 w-full min-w-0 transition-all duration-300">
          <Topbar />
          <DelayAlertBanner />
          <main 
            className="flex-1 pt-2 md:pt-4 transition-all duration-300 lg:pl-[var(--sidebar-width)]"
            style={{ 
              marginTop: 'var(--topbar-height)',
              paddingBottom: 'calc(var(--bottom-nav-height, 0px) + max(1.5rem, env(safe-area-inset-bottom)))'
            }}
          >
            <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-10 py-4 md:py-6">
              {children}
            </div>
          </main>
          <BottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
