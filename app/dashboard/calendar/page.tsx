'use client';

import { useEffect, useState, useCallback } from 'react';
import { CalendarEvent, CalendarEventType, User } from '@/lib/types';
import { getCalendarEvents, deleteCalendarEvent, updateCalendarEvent, getUsers } from '@/lib/api';
import { CalendarEventModal } from '@/components/shared/CalendarEventModal';
import { Avatar } from '@/components/shared';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Trash2, Camera, FileText, Users, Flag, CalendarDays, Lock, Globe, Search } from 'lucide-react';
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
  
  // New States for Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | CalendarEventType>('all');
  const [direction, setDirection] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [evs, users] = await Promise.all([getCalendarEvents(), getUsers()]);
      setEvents(evs);
      setAllUsers(users);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const canSeeEvent = useCallback((event: CalendarEvent): boolean => {
    if (!RESTRICTED_EVENT_TYPES.includes(event.type)) return true;
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (event.assigneeId === currentUser.id) return true;
    const assignee = allUsers.find(u => u.id === event.assigneeId);
    if (assignee && assignee.managerId === currentUser.id) return true;
    return false;
  }, [currentUser, allUsers]);

  const filteredEvents = events.filter(e => {
    const matchesFilter = activeFilter === 'all' || e.type === activeFilter;
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch && canSeeEvent(e);
  });

  const upcomingEvents = filteredEvents
    .filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const getDayEvents = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredEvents.filter(e => e.date === dateStr);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try { await deleteCalendarEvent(id); toast.success('Event deleted'); load(); } catch { toast.error('Failed to delete'); }
  };

  const handleDragUpdate = async (eventId: string, newDate: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event || event.date === newDate) return;

    // Optimistic update
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, date: newDate } : e));
    
    try {
      await updateCalendarEvent(eventId, { ...event, date: newDate });
      toast.success(`Rescheduled to ${newDate}`);
    } catch {
      toast.error('Failed to reschedule');
      load(); // Rollback
    }
  };

  const onDragStart = (e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData('eventId', eventId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('eventId');
    if (eventId) {
      handleDragUpdate(eventId, date);
    }
  };

  const prevMonth = () => { setDirection(-1); setCurrentDate(new Date(year, month - 1, 1)); };
  const nextMonth = () => { setDirection(1); setCurrentDate(new Date(year, month + 1, 1)); };

  const openCreate = (dateStr: string) => { setSelectedDate(dateStr); setEditingEvent(null); setIsModalOpen(true); };
  const openEdit = (event: CalendarEvent) => { setEditingEvent(event); setIsModalOpen(true); };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 }),
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-16">
      {/* Left Column: Calendar & Controls */}
      <div className="flex-1 space-y-6">
        {/* Header & Main Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Content Calendar</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Design, Schedule, Execute.</p>
          </div>
          <button onClick={() => { setEditingEvent(null); setSelectedDate(today); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-sm transition-premium shadow-xl shadow-indigo-600/20 active:scale-95">
            <Plus className="w-5 h-5" /> Schedule Event
          </button>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search deliverables..." 
              className="bg-transparent border-0 focus:ring-0 text-sm font-medium w-full dark:text-white"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-white/5">
            <button onClick={() => setActiveFilter('all')} 
              className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", 
              activeFilter === 'all' ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>All</button>
            {Object.keys(EVENT_CONFIG).map(type => (
              <button key={type} onClick={() => setActiveFilter(type as CalendarEventType)}
                className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", 
                activeFilter === type ? "bg-white dark:bg-slate-900 shadow-sm " + EVENT_CONFIG[type as CalendarEventType].color : "text-slate-500 hover:text-slate-700")}>
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-premium relative">
          {/* Month Navigator */}
          <div className="flex items-center justify-between px-8 py-6 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-4">
              <button onClick={prevMonth} className="p-2.5 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-premium border border-transparent hover:border-slate-200 dark:hover:border-white/10 shadow-sm group">
                <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" />
              </button>
              <h2 className="text-xl font-black tracking-tight w-40 text-center">{MONTHS[month]} {year}</h2>
              <button onClick={nextMonth} className="p-2.5 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-premium border border-transparent hover:border-slate-200 dark:hover:border-white/10 shadow-sm group">
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" />
              </button>
            </div>
            
            {/* View Stats Mini */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deliverables</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">{filteredEvents.length}</p>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-white/10" />
              <button onClick={() => setCurrentDate(new Date())} className="text-xs font-black text-indigo-600 hover:text-indigo-500 uppercase tracking-widest">Today</button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-slate-950/10">
            {DAYS.map(d => (
              <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">{d}</div>
            ))}
          </div>

          <div className="relative overflow-hidden min-h-[500px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={month + '-' + year}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="grid grid-cols-7"
              >
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[120px] border-b border-r border-slate-50 dark:border-white/5 bg-slate-50/20 dark:bg-slate-950/10" />
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayEvents = getDayEvents(day);
                  const isToday = dateStr === today;

                  return (
                    <div
                      key={day}
                      onClick={() => openCreate(dateStr)}
                      onDragOver={onDragOver}
                      onDrop={e => onDrop(e, dateStr)}
                      className={cn(
                        'min-h-[120px] border-b border-r border-slate-100 dark:border-white/5 p-2.5 cursor-pointer transition-premium group relative',
                        isToday ? 'bg-indigo-50/30 dark:bg-indigo-950/10' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 flex items-center justify-center rounded-2xl text-sm font-black mb-2 transition-all',
                        isToday
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                          : 'text-slate-700 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:shadow-sm group-hover:text-indigo-600'
                      )}>
                        {day}
                      </div>
                      <div className="space-y-1.5">
                        {dayEvents.map(event => {
                          const cfg = EVENT_CONFIG[event.type];
                          return (
                            <div
                              key={event.id}
                              draggable
                              onDragStart={e => onDragStart(e, event.id)}
                              onClick={e => { e.stopPropagation(); setSelectedEvent(event); }}
                              className={cn('flex items-center gap-2 p-1.5 rounded-xl border text-[9px] font-black uppercase tracking-tight shadow-sm hover:translate-x-1 transition-transform cursor-grab active:cursor-grabbing', cfg.bg, cfg.color)}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
                              <span className="truncate">{event.title}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Plus icon on hover */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-4 h-4 text-indigo-400" />
                      </div>
                    </div>
                  );
                })}
                
                {/* Pad end of month */}
                {Array.from({ length: (7 - ((firstDay + daysInMonth) % 7)) % 7 }).map((_, i) => (
                  <div key={`empty-end-${i}`} className="min-h-[120px] border-b border-r border-slate-50 dark:border-white/5 bg-slate-50/20 dark:bg-slate-950/10" />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right Column: Insights & Quick Actions */}
      <div className="w-full lg:w-80 space-y-8">
        {/* Statistics Card */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-900/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/30 transition-all duration-700" />
          <h3 className="text-xl font-black tracking-tight mb-6">Strategy Hub</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">Total Posts</p>
              <p className="text-3xl font-black">{filteredEvents.filter(e => e.type === 'post').length}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-1">Shoots</p>
              <p className="text-3xl font-black">{filteredEvents.filter(e => e.type === 'shoot').length}</p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Month Progress</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                {Math.round((new Date().getDate() / new Date(year, month + 1, 0).getDate()) * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((new Date().getDate() / new Date(year, month + 1, 0).getDate()) * 100)}%` }} className="h-full bg-emerald-500" />
            </div>
          </div>
        </div>

        {/* Upcoming deliverables feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Upcoming Focus</h3>
            <CalendarDays className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/20 rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10">
                <p className="text-xs font-bold text-slate-400">All caught up!</p>
              </div>
            ) : upcomingEvents.map(event => (
              <motion.div 
                whileHover={{ x: 8 }}
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm cursor-pointer flex items-center gap-4 group transition-premium hover:border-indigo-200 dark:hover:border-indigo-500/30"
              >
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", EVENT_CONFIG[event.type].bg)}>
                  {(() => { const Icon = EVENT_CONFIG[event.type].icon; return <Icon className="w-5 h-5" />; })()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {event.time || 'All Day'}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Legend / Access Info */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950/20 rounded-[2.5rem] border border-slate-200 dark:border-white/5">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Privacy Guide</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400"><Lock className="w-3.5 h-3.5" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 leading-none">Restricted</p>
                <p className="text-[9px] font-medium text-slate-500 mt-1 uppercase tracking-tight">Post & Deadlines (Internal Only)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400"><Globe className="w-3.5 h-3.5" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 leading-none">Public</p>
                <p className="text-[9px] font-medium text-slate-500 mt-1 uppercase tracking-tight">Shoots & Meetings (Visible to all)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedEvent(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 100 }}
              className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-lg bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-premium border border-slate-200 dark:border-white/10 overflow-hidden"
            >
              {(() => {
                const cfg = EVENT_CONFIG[selectedEvent.type];
                const Icon = cfg.icon;
                return (
                  <div className="relative">
                    <div className={cn('px-10 py-12 flex flex-col items-center text-center text-white relative', 
                      selectedEvent.type === 'post' ? 'bg-indigo-600' : selectedEvent.type === 'shoot' ? 'bg-amber-500' : selectedEvent.type === 'meeting' ? 'bg-blue-600' : 'bg-red-600')}>
                      <div className="absolute top-6 right-8">
                        <button onClick={() => setSelectedEvent(null)} className="text-white/40 hover:text-white transition-premium"><Plus className="w-8 h-8 rotate-45" /></button>
                      </div>
                      <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl border-4 border-white/20">
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70 mb-2">{cfg.label}</p>
                      <h3 className="text-3xl font-black tracking-tighter leading-tight mb-4">{selectedEvent.title}</h3>
                      <div className="flex items-center gap-3">
                        <Avatar name={selectedEvent.assigneeName || 'UN'} size="sm" className="ring-2 ring-white/30" />
                        <span className="text-xs font-black uppercase tracking-widest">{selectedEvent.assigneeName || 'Unassigned'}</span>
                      </div>
                    </div>
                    
                    <div className="p-10 space-y-8 bg-white dark:bg-slate-900">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Execution Date</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white">{new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Time Slot</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white">{selectedEvent.time || 'Flexible'}</p>
                        </div>
                        {selectedEvent.platform && (
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Platform</p>
                            <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{selectedEvent.platform}</p>
                          </div>
                        )}
                         {selectedEvent.projectName && (
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Client Project</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white truncate">{selectedEvent.projectName}</p>
                          </div>
                        )}
                        {selectedEvent.creatorName && (
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Scheduled By</p>
                            <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 truncate">{selectedEvent.creatorName}</p>
                          </div>
                        )}
                      </div>
                      
                      {selectedEvent.description && (
                        <div className="space-y-3">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Brief / Notes</p>
                          <div className="p-6 bg-slate-50 dark:bg-slate-950/40 rounded-3xl border border-slate-100 dark:border-white/5 text-sm font-medium leading-relaxed dark:text-slate-300">
                            {selectedEvent.description}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4 pt-4">
                        <button onClick={() => { openEdit(selectedEvent); setSelectedEvent(null); }}
                          className="flex-[2] py-5 bg-indigo-600 text-white font-black rounded-[2rem] text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-500 transition-premium shadow-xl shadow-indigo-600/20 active:scale-95">
                          Update deliverable
                        </button>
                        <button onClick={() => { handleDelete(selectedEvent.id); setSelectedEvent(null); }}
                          className="flex-1 py-5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-black rounded-[2rem] text-[10px] uppercase tracking-[0.1em] hover:bg-rose-100 transition-premium border border-rose-200 dark:border-rose-800/20 active:scale-95">
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
