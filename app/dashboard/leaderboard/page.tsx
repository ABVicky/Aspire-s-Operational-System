'use client';

import { useEffect, useState } from 'react';
import { User } from '@/lib/types';
import { getUsers } from '@/lib/api';
import { Skeleton, Avatar, EmptyState } from '@/components/shared';
import { Trophy, Medal, Target, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers().then(data => {
      // Sort by rating descending
      const sorted = [...data].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setUsers(sorted);
    }).finally(() => setLoading(false));
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-slate-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-black text-slate-400">#{index + 1}</span>;
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-indigo-600/20">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight font-display">Leaderboard</h1>
          <p className="text-indigo-100/80 font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
            <Target className="w-5 h-5" /> Performance Rankings
          </p>
        </div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-[100px]" />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-3xl" />)}
        </div>
      ) : users.length === 0 ? (
        <EmptyState 
          icon={<Trophy className="w-12 h-12 text-slate-300" />}
          title="No data available"
          description="Performance ratings haven't been assigned yet."
        />
      ) : (
        <div className="grid gap-4">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-6 p-6 md:p-8 rounded-[2rem] border transition-all ${
                index === 0 
                  ? 'bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-950/20 dark:to-slate-900 border-yellow-200 dark:border-yellow-900/40 shadow-xl shadow-yellow-500/5' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 shadow-sm'
              }`}
            >
              <div className="w-12 flex justify-center shrink-0">
                {getRankIcon(index)}
              </div>

              <Avatar name={user.name} src={user.avatar} size="lg" className={index === 0 ? 'ring-4 ring-yellow-400' : ''} />

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-slate-950 dark:text-white font-display truncate">{user.name}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{user.role}</p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-2xl md:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-display">
                  {user.rating || 0}<span className="text-xs opacity-50 ml-1">pts</span>
                </div>
                <div className="flex items-center justify-end gap-1 mt-1 font-black text-[10px] uppercase tracking-tighter">
                   {index < 2 ? (
                     <span className="text-green-500 flex items-center"><ChevronUp className="w-3 h-3" /> Trending</span>
                   ) : index > 5 ? (
                     <span className="text-red-500 flex items-center"><ChevronDown className="w-3 h-3" /> Dropping</span>
                   ) : (
                     <span className="text-slate-400 flex items-center"><Minus className="w-3 h-3" /> Stable</span>
                   )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
