'use client';

import { useEffect, useState, useCallback } from 'react';
import { CalendarEvent, CalendarEventType, User } from '@/lib/types';
import { getCalendarEvents, deleteCalendarEvent, getUsers } from '@/lib/api';
import { CalendarEventModal } from '@/components/shared/CalendarEventModal';
import { Avatar } from '@/components/shared';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Trash2, Camera, FileText, Users, Flag, CalendarDays, Lock, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/** Event types that are restricted to the assigned project's manager + member only. */
const RESTRICTED_EVENT_TYPES: CalendarEventType[] = ['post', 'deadline'];

const EVENT_CONFIG: Record<CalendarEventType, { color: string; bg: string; dot: string; label: string; icon: any }> = {
  post:     { color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700/40', dot: 'bg-purple-500', label: 'Social Post', icon: FileText },
  shoot:    { color: 'text-amber-700 dark:text-amber-300',   bg: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700/40',     dot: 'bg-amber-500',  label: 'Shoot',       icon: Camera },
  meeting:  { color: 'text-blue-700 dark:text-blue-300',     bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700/40',         dot: 'bg-blue-500',   label: 'Meeting',     icon: Users },
  deadline: { color: 'text-red-700 dark:text-red-300',       bg: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700/40',             dot: 'bg-red-500',    label: 'Deadline',    icon: Flag },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarPage() {
  const { user: currentUser } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [evs, users] = await Promise.all([getCalendarEvents(), getUsers()]);
      setEvents(evs);
      setAllUsers(users);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  /**
   * Returns true if the current user can see this event.
   * - shoot / meeting  → visible to EVERYONE
   * - post / deadline  → visible only to: admin, the assignee, and the assignee's manager
   */
  const canSeeEvent = useCallback((event: CalendarEvent): boolean => {
    if (!RESTRICTED_EVENT_TYPES.includes(event.type)) return true; // shoot / meeting
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (event.assigneeId === currentUser.id) return true; // I am the assignee
    // I am the manager of the assignee
    const assignee = allUsers.find(u => u.id === event.assigneeId);
    if (assignee && assignee.managerId === currentUser.id) return true;
    return false;
  }, [currentUser, allUsers]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const getDayEvents = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr && canSeeEvent(e));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try { await deleteCalendarEvent(id); toast.success('Event deleted'); load(); } catch { toast.error('Failed to delete'); }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const openCreate = (dateStr: string) => { setSelectedDate(dateStr); setEditingEvent(null); setIsModalOpen(true); };
  const openEdit = (event: CalendarEvent) => { setEditingEvent(event); setIsModalOpen(true); };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight font-display">Content Calendar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {events.filter(canSeeEvent).length} events scheduled
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden md:flex items-center gap-5">
            {Object.entries(EVENT_CONFIG).map(([type, cfg]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{cfg.label}</span>
                {RESTRICTED_EVENT_TYPES.includes(type as CalendarEventType) ? (
                  <Lock className="w-3 h-3 text-slate-400" aria-label="Project members only" role="img" />
                ) : (
                  <Globe className="w-3 h-3 text-slate-400" aria-label="Visible to everyone" role="img" />
                )}
              </div>
            ))}
          </div>
          <button onClick={() => { setEditingEvent(null); setSelectedDate(today); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-sm transition-all shadow-lg shadow-indigo-600/30 active:scale-95">
            <Plus className="w-4 h-4" /> Schedule Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-premium">
        {/* Month Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <ChevronLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-black tracking-tight font-display">{MONTHS[month]} {year}</h2>
          </div>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-white/5">
          {DAYS.map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7">
          {/* Empty slots before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-slate-50 dark:border-white/5 bg-slate-50/30 dark:bg-slate-950/10" />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = getDayEvents(day);
            const isToday = dateStr === today;

            return (
              <div
                key={day}
                onClick={() => openCreate(dateStr)}
                className={cn(
                  'min-h-[100px] border-b border-r border-slate-100 dark:border-white/5 p-2 cursor-pointer transition-all group',
                  isToday ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                )}
              >
                <div className={cn(
                  'w-7 h-7 flex items-center justify-center rounded-xl text-sm font-black mb-1 transition-all',
                  isToday
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-700 dark:text-slate-300 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/40 group-hover:text-indigo-600'
                )}>
                  {day}
                </div>
                <div className="space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 3).map(event => {
                    const cfg = EVENT_CONFIG[event.type];
                    return (
                      <div
                        key={event.id}
                        onClick={e => { e.stopPropagation(); setSelectedEvent(event); }}
                        className={cn('flex items-center gap-1.5 text-[10px] font-black rounded-lg px-2 py-1 border truncate', cfg.bg, cfg.color)}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
                        <span className="truncate">{event.title}</span>
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <p className="text-[9px] text-slate-400 font-black px-2">+{dayEvents.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Detail Panel */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
            >
              {(() => {
                const cfg = EVENT_CONFIG[selectedEvent.type];
                const Icon = cfg.icon;
                return (
                  <div>
                    <div className={cn('px-6 py-5 flex items-start gap-4', selectedEvent.type === 'post' ? 'bg-purple-600' : selectedEvent.type === 'shoot' ? 'bg-amber-500' : selectedEvent.type === 'meeting' ? 'bg-blue-600' : 'bg-red-600')}>
                      <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[10px] text-white/70 font-black uppercase tracking-widest">{cfg.label}</p>
                          {RESTRICTED_EVENT_TYPES.includes(selectedEvent.type) ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-wider text-white/80">
                              <Lock className="w-2.5 h-2.5" /> Project Only
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-wider text-white/80">
                              <Globe className="w-2.5 h-2.5" /> Everyone
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-black text-white tracking-tight truncate">{selectedEvent.title}</h3>
                      </div>
                      <button onClick={() => setSelectedEvent(null)} className="text-white/60 hover:text-white transition-colors text-xl font-bold">×</button>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Date & Time</p>
                          <p className="font-black text-slate-900 dark:text-white">{selectedEvent.date} {selectedEvent.time && `at ${selectedEvent.time}`}</p>
                        </div>
                        {selectedEvent.platform && (
                          <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Platform</p>
                            <p className="font-black text-slate-900 dark:text-white">{selectedEvent.platform}</p>
                          </div>
                        )}
                        {selectedEvent.assigneeName && (
                          <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Assigned to</p>
                            <p className="font-black text-slate-900 dark:text-white">{selectedEvent.assigneeName}</p>
                          </div>
                        )}
                        {selectedEvent.projectName && (
                          <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Project</p>
                            <p className="font-black text-slate-900 dark:text-white truncate">{selectedEvent.projectName}</p>
                          </div>
                        )}
                      </div>
                      {selectedEvent.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium bg-slate-50 dark:bg-slate-850 rounded-xl p-3 border border-slate-100 dark:border-white/5">{selectedEvent.description}</p>
                      )}
                      <div className="flex gap-3 pt-2">
                        <button onClick={() => { openEdit(selectedEvent); setSelectedEvent(null); }}
                          className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all">
                          Edit
                        </button>
                        <button onClick={() => { handleDelete(selectedEvent.id); setSelectedEvent(null); }}
                          className="flex-1 py-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-red-100 transition-all border border-red-200 dark:border-red-800/30">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CalendarEventModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingEvent(null); }}
        event={editingEvent}
        defaultDate={selectedDate || today}
        onSuccess={load}
      />
    </div>
  );
}
