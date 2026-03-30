'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { cn } from '@/lib/utils';
import { RefreshCcw, CheckCircle2 } from 'lucide-react';

export function SyncStatus() {
  const { isSyncing, lastSyncTime } = useData();
  const [timeAgo, setTimeAgo] = useState<string>('Just now');

  useEffect(() => {
    if (!lastSyncTime) return;

    const updateTime = () => {
      const seconds = Math.floor((Date.now() - new Date(lastSyncTime).getTime()) / 1000);
      if (seconds < 10) setTimeAgo('Just now');
      else if (seconds < 60) setTimeAgo(`${seconds}s ago`);
      else setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [lastSyncTime]);

  if (!lastSyncTime && !isSyncing) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 transition-premium">
      <div className="relative flex items-center justify-center">
        {isSyncing ? (
          <RefreshCcw className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
        ) : (
          <>
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
            <div className="relative w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </>
        )}
      </div>
      
      <div className="flex flex-col -space-y-0.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {isSyncing ? 'Syncing...' : 'Live'}
        </span>
        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
          {isSyncing ? 'Fetching real data' : `Updated ${timeAgo}`}
        </span>
      </div>
    </div>
  );
}
