'use client';

import { User } from '@/lib/types';
import { Avatar } from '@/components/shared';
import { motion } from 'framer-motion';
import { ChevronRight, Shield, Star, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HierarchyTreeProps {
  users: User[];
  onSelect: (user: User) => void;
  selectedUserId?: string;
  currentRole?: string;
  currentUserId?: string;
}

export default function HierarchyTree({ users, onSelect, selectedUserId, currentRole, currentUserId }: HierarchyTreeProps) {
  // Organize users into hierarchy
  const admins = users.filter(u => u.role === 'admin');
  const managers = users.filter(u => u.role === 'manager');
  
  // Filter managers if current user is a manager (only show self)
  const visibleManagers = currentRole === 'admin' ? managers : managers.filter(m => m.id === currentUserId);
  
  const getMembersForManager = (managerId: string) => {
    return users.filter(u => u.role === 'member' && u.managerId === managerId);
  };

  const unassignedMembers = users.filter(u => u.role === 'member' && (!u.managerId || !managers.find(m => m.id === u.managerId)));

  return (
    <div className="space-y-8">
      {/* Admins (only for admins) */}
      {currentRole === 'admin' && admins.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <Shield className="w-4 h-4 text-purple-500" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Administrators</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {admins.map(admin => (
              <UserCard 
                key={admin.id} 
                user={admin} 
                isSelected={selectedUserId === admin.id}
                onClick={() => onSelect(admin)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Managers & Their Teams */}
      <section>
        <div className="flex items-center gap-2 mb-4 px-2">
          <Users className="w-4 h-4 text-indigo-500" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Management & Teams</h3>
        </div>
        <div className="space-y-6">
          {visibleManagers.map(manager => (
            <div key={manager.id} className="space-y-3">
              <UserCard 
                user={manager} 
                isSelected={selectedUserId === manager.id}
                onClick={() => onSelect(manager)}
              />
              <div className="pl-8 border-l-2 border-slate-100 dark:border-white/5 space-y-3 ml-6">
                {getMembersForManager(manager.id).map(member => (
                  <UserCard 
                    key={member.id} 
                    user={member} 
                    isSelected={selectedUserId === member.id}
                    onClick={() => onSelect(member)}
                    isSmall
                  />
                ))}
                {getMembersForManager(manager.id).length === 0 && (
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-4">No direct reports</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Unassigned/Others (for Admins) */}
      {currentRole === 'admin' && unassignedMembers.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <Users className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Unassigned Members</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {unassignedMembers.map(member => (
              <UserCard 
                key={member.id} 
                user={member} 
                isSelected={selectedUserId === member.id}
                onClick={() => onSelect(member)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function UserCard({ user, isSelected, onClick, isSmall }: { user: User, isSelected: boolean, onClick: () => void, isSmall?: boolean }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, x: 4 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group",
        isSelected 
          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-500/30"
      )}
    >
      <Avatar name={user.name} src={user.avatar} size={isSmall ? "sm" : "md"} className={isSelected ? "ring-2 ring-white/20" : ""} />
      <div className="flex-1 min-w-0">
        <h4 className={cn("font-black tracking-tight truncate font-display", isSmall ? "text-xs" : "text-sm")}>
          {user.name}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn("text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md", isSelected ? "bg-white/10" : "bg-slate-100 dark:bg-slate-800 text-slate-500")}>
            {user.role}
          </span>
          <div className="flex items-center gap-0.5 text-amber-500">
            <Star className="w-2 h-2 fill-current" />
            <span className={cn("text-[9px] font-black", isSelected ? "text-white" : "text-slate-600 dark:text-slate-400")}>{user.rating || 0}</span>
          </div>
        </div>
      </div>
      <ChevronRight className={cn("w-4 h-4 transition-transform group-hover:translate-x-1", isSelected ? "text-white/50" : "text-slate-300")} />
    </motion.div>
  );
}
