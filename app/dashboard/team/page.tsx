'use client';

import { useEffect, useState } from 'react';
import { User } from '@/lib/types';
import { getUsers } from '@/lib/api';
import { Skeleton, Avatar, EmptyState } from '@/components/shared';
import { Users, Mail, Shield, MoreHorizontal, ChevronRight, Phone, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const ROLE_COLORS = {
  admin: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/30 shadow-sm shadow-purple-100 dark:shadow-none',
  manager: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/30 shadow-sm shadow-blue-100 dark:shadow-none',
  member: 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 shadow-sm shadow-slate-100 dark:shadow-none',
};

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Team Directory</h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">{users.length} registered members</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44 md:h-48 rounded-3xl" />)}
        </div>
      ) : users.length === 0 ? (
        <EmptyState 
          icon={<Users className="w-10 h-10 text-slate-200" />} 
          title="No team members" 
          description="Add users to the database to see them listed here." 
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {users.map(user => (
            <div 
              key={user.id} 
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 p-5 md:p-6 shadow-sm hover:shadow-md transition-all group flex flex-col gap-5 active:scale-[0.98] cursor-pointer"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar name={user.name} src={user.avatar} size="lg" className="shadow-lg shadow-slate-200/50 dark:shadow-none" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-slate-900 shadow-sm" />
                  </div>
                  <div className="min-w-0 pr-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base md:text-lg tracking-tight truncate mb-0.5">{user.name}</h3>
                    <p className="text-[11px] font-black text-indigo-600/80 dark:text-indigo-400/80 uppercase tracking-widest leading-none mb-2">
                      {user.department || 'General'}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border leading-none ${ROLE_COLORS[user.role]}`}>
                        <Shield className="w-2.5 h-2.5" />
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 rounded-xl transition-all shrink-0 border border-transparent hover:border-slate-100 dark:hover:border-white/5">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Contact Info */}
              <div className="flex flex-col gap-2 pt-1">
                <a 
                  href={`mailto:${user.email}`} 
                  className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100/50 dark:border-white/5 rounded-2xl text-xs md:text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all group/link"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-7 h-7 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center border border-slate-200/50 dark:border-white/10 group-hover/link:text-indigo-500 dark:group-hover/link:text-indigo-400 transition-colors shrink-0">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate font-bold tracking-tight">{user.email || 'No email provided'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all" />
                </a>

                {user.phone && (
                  <a 
                    href={`tel:${user.phone}`} 
                    className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100/50 dark:border-white/5 rounded-2xl text-xs md:text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-100 dark:hover:border-emerald-500/30 transition-all group/phone"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-7 h-7 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center border border-slate-200/50 dark:border-white/10 group-hover/phone:text-emerald-500 dark:group-hover/phone:text-emerald-400 transition-colors shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate font-bold tracking-tight">{user.phone}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-40 group-hover/phone:opacity-100 group-hover/phone:translate-x-1 transition-all" />
                  </a>
                )}
              </div>

              {/* Stats/Status */}
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-1 mt-auto">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> 
                  Joined {user.joiningDate ? format(new Date(user.joiningDate), 'MMM yyyy') : 'Recently'}
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
