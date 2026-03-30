'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, Project, Task, Client, CalendarEvent, DashboardStats, Lead } from '@/lib/types';
import { getUsers, getProjects, getTasks, getClients, getCalendarEvents, getDashboardStats, getLeads } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface DataContextType {
  users: User[];
  projects: Project[];
  tasks: Task[];
  clients: Client[];
  calendarEvents: CalendarEvent[];
  stats: DashboardStats | null;
  leads: Lead[];
  loading: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  refreshData: () => Promise<void>;
  updateLocalUser: (updatedUser: User) => void;
  updateLocalTask: (updatedTask: Task) => void;
  updateLocalProject: (updatedProject: Project) => void;
  addLocalTask: (task: Task) => void;
  deleteLocalTask: (id: string) => void;
  addLocalProject: (project: Project) => void;
  deleteLocalProject: (id: string) => void;
  addLocalEvent: (event: CalendarEvent) => void;
  updateLocalEvent: (event: CalendarEvent) => void;
  deleteLocalEvent: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // Enhanced Initialization: Read from localStorage immediately for "Super Fast" feel
  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('as-users');
    return saved ? JSON.parse(saved) : [];
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('as-projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('as-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [clients, setClients] = useState<Client[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('as-clients');
    return saved ? JSON.parse(saved) : [];
  });
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('as-events');
    return saved ? JSON.parse(saved) : [];
  });
  const [stats, setStats] = useState<DashboardStats | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('as-stats');
    return saved ? JSON.parse(saved) : null;
  });
  const [leads, setLeads] = useState<Lead[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('as-leads');
    return saved ? JSON.parse(saved) : [];
  });

  // Loading is only true if we have NO cached data OR it's stale (>30m)
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return true;
    const hasData = localStorage.getItem('as-tasks');
    const lastSync = localStorage.getItem('as-last-sync');
    if (!hasData || !lastSync) return true;
    const diff = Date.now() - new Date(lastSync).getTime();
    return diff > 30 * 60 * 1000; // 30 mins
  });
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('as-last-sync');
    return saved ? new Date(saved) : null;
  });
  const [initialized, setInitialized] = useState(false);

  const fetchAllData = useCallback(async (isSilent = false) => {
    if (isSyncing) return; // Prevent concurrent syncs
    
    const hasCache = !!localStorage.getItem('as-tasks');
    if (!isSilent && !hasCache) setLoading(true);
    setIsSyncing(true);

    try {
      const [u, p, t, c, e, s, l] = await Promise.all([
        getUsers(),
        getProjects(),
        getTasks(undefined, user?.id),
        getClients().catch(() => []),
        getCalendarEvents().catch(() => []),
        getDashboardStats(user?.id).catch(() => null),
        getLeads().catch(() => [])
      ]);
      
      setUsers(u);
      setProjects(p);
      setTasks(t);
      setClients(c);
      setCalendarEvents(e);
      setStats(s);
      setLeads(l);
      
      const now = new Date();
      setLastSyncTime(now);
      
      // Persist to localStorage
      localStorage.setItem('as-users', JSON.stringify(u));
      localStorage.setItem('as-projects', JSON.stringify(p));
      localStorage.setItem('as-tasks', JSON.stringify(t));
      localStorage.setItem('as-clients', JSON.stringify(c));
      localStorage.setItem('as-events', JSON.stringify(e));
      if (s) localStorage.setItem('as-stats', JSON.stringify(s));
      localStorage.setItem('as-leads', JSON.stringify(l));
      localStorage.setItem('as-last-sync', now.toISOString());

    } catch (error) {
      console.error('Failed to fetch global data:', error);
      if (!isSilent) toast.error('Failed to sync data with server');
    } finally {
      setIsSyncing(false);
      setInitialized(true);
    }
  }, [isSyncing, user?.id]);

  // Sync Strategy: Initial, 30s interval, and Tab-Focus
  useEffect(() => {
    fetchAllData();
    
    const interval = setInterval(() => {
      fetchAllData(true);
    }, 3000); // 3s for "Real-time" feel as requested

    const handleFocus = () => {
      // Refresh on tab focus if not already syncing
      fetchAllData(true);
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchAllData]);

  const updateLocalUser = useCallback((updatedUser: User) => {
    setUsers(prev => {
      const next = prev.map(u => u.id === updatedUser.id ? updatedUser : u);
      localStorage.setItem('as-users', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateLocalTask = useCallback((updatedTask: Task) => {
    setTasks(prev => {
      const next = prev.map(t => t.id === updatedTask.id ? updatedTask : t);
      localStorage.setItem('as-tasks', JSON.stringify(next));
      return next;
    });
  }, []);

  const addLocalTask = useCallback((task: Task) => {
    setTasks(prev => {
      const next = [task, ...prev];
      localStorage.setItem('as-tasks', JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteLocalTask = useCallback((id: string) => {
    setTasks(prev => {
      const next = prev.filter(t => t.id !== id);
      localStorage.setItem('as-tasks', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateLocalProject = useCallback((updatedProject: Project) => {
    setProjects(prev => {
      const next = prev.map(p => p.id === updatedProject.id ? updatedProject : p);
      localStorage.setItem('as-projects', JSON.stringify(next));
      return next;
    });
  }, []);

  const addLocalProject = useCallback((project: Project) => {
    setProjects(prev => {
      const next = [project, ...prev];
      localStorage.setItem('as-projects', JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteLocalProject = useCallback((id: string) => {
    setProjects(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem('as-projects', JSON.stringify(next));
      return next;
    });
  }, []);

  const addLocalEvent = useCallback((event: CalendarEvent) => {
    setCalendarEvents(prev => {
      const next = [event, ...prev];
      localStorage.setItem('as-events', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateLocalEvent = useCallback((event: CalendarEvent) => {
    setCalendarEvents(prev => {
      const next = prev.map(e => e.id === event.id ? event : e);
      localStorage.setItem('as-events', JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteLocalEvent = useCallback((id: string) => {
    setCalendarEvents(prev => {
      const next = prev.filter(e => e.id !== id);
      localStorage.setItem('as-events', JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    users,
    projects,
    tasks,
    clients,
    calendarEvents,
    stats,
    leads,
    loading: loading && !initialized, 
    isSyncing,
    lastSyncTime,
    refreshData: () => fetchAllData(true),
    updateLocalUser,
    updateLocalTask,
    updateLocalProject,
    addLocalTask,
    deleteLocalTask,
    addLocalProject,
    deleteLocalProject,
    addLocalEvent,
    updateLocalEvent,
    deleteLocalEvent
  }), [users, projects, tasks, clients, calendarEvents, stats, leads, loading, isSyncing, lastSyncTime, initialized, fetchAllData, updateLocalUser, updateLocalTask, updateLocalProject, addLocalTask, deleteLocalTask, addLocalProject, deleteLocalProject, addLocalEvent, updateLocalEvent, deleteLocalEvent]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
