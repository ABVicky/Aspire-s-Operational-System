'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task, TaskStatus, User } from '@/lib/types';
import { StatusBadge, PriorityBadge, Avatar } from '@/components/shared';
import { formatDate } from '@/lib/utils';
import { Calendar, Pencil, Trash2, Plus, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLUMNS: { id: TaskStatus; label: string; color: string; dot: string; bg: string }[] = [
  { id: 'todo', label: 'Todo', color: 'bg-slate-100 dark:bg-slate-800/50', bg: 'bg-slate-50 dark:bg-slate-900/40', dot: 'bg-slate-400' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/20', bg: 'bg-blue-50/30 dark:bg-blue-900/10', dot: 'bg-blue-500' },
  { id: 'review', label: 'Review', color: 'bg-amber-100 dark:bg-amber-900/20', bg: 'bg-amber-50/30 dark:bg-amber-900/10', dot: 'bg-amber-500' },
  { id: 'done', label: 'Done', color: 'bg-green-100 dark:bg-green-900/20', bg: 'bg-green-50/30 dark:bg-green-900/10', dot: 'bg-green-500' },
];

interface KanbanBoardProps {
  tasks: Task[];
  users: User[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function KanbanBoard({ tasks, users, onStatusChange, onTaskClick, onEdit, onDelete }: KanbanBoardProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(true);
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as TaskStatus;
    const taskId = result.draggableId;
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      onStatusChange(taskId, newStatus);
    }
  };

  if (!enabled) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-6 -mx-6 px-6 md:mx-0 md:px-0">
        {COLUMNS.map(col => (
          <div key={col.id} className="flex flex-col shrink-0 w-72 lg:w-80">
            <div className={cn("flex items-center gap-2 px-4 py-3 rounded-2xl mb-4 border border-slate-200/50 shadow-sm", col.color)}>
              <div className={cn("w-2.5 h-2.5 rounded-full", col.dot)} />
              <span className="text-sm font-bold text-slate-800">{col.label}</span>
            </div>
            <div className="min-h-[300px] border-2 border-dashed border-slate-100 rounded-3xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory -mx-6 px-6 scrollbar-hide">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="flex flex-col shrink-0 w-[85vw] sm:w-80 md:w-72 lg:w-80 snap-center">
              {/* Column header */}
              <div className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-2xl mb-4 border border-slate-200/50 dark:border-white/5 shadow-sm transition-all",
                col.color
              )}>
                <div className={cn("w-2.5 h-2.5 rounded-full", col.dot)} />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">{col.label}</span>
                <span className="ml-auto text-xs font-bold text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-white/10 px-2.5 py-0.5 rounded-full tabular-nums">
                  {colTasks.length}
                </span>
              </div>

              {/* Droppable area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex flex-col gap-3 flex-1 min-h-[400px] rounded-3xl p-1.5 transition-all duration-300",
                      snapshot.isDraggingOver ? "bg-indigo-50/50 ring-2 ring-indigo-200 ring-dashed" : "bg-transparent"
                    )}
                  >
                    {colTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={cn(
                              "bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm cursor-pointer group transition-all duration-200",
                              snap.isDragging ? "shadow-2xl ring-2 ring-indigo-400 dark:ring-indigo-500 rotate-1 z-[100] scale-105 bg-white dark:bg-slate-800" : "hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/30",
                              "touch-manipulation"
                            )}
                            onClick={() => onTaskClick(task)}
                          >
                            {/* Card Content */}
                            <div className="flex items-center justify-between mb-3">
                              <PriorityBadge priority={task.priority} />
                              <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                <button onClick={() => onEdit(task)} className="p-2.5 md:p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                  <Pencil className="w-5 h-5 md:w-4 md:h-4" />
                                </button>
                                <button onClick={() => onDelete(task.id)} className="p-2.5 md:p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-colors">
                                  <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
                                </button>
                              </div>
                            </div>

                            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-2 line-clamp-2 tracking-tight">
                              {task.title}
                            </h3>

                            {task.projectName && (
                              <p className="text-[11px] text-indigo-500 dark:text-indigo-400 font-bold mb-3 tracking-wide truncate">{task.projectName.toUpperCase()}</p>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-50/50 dark:border-white/5">
                              <div className="flex items-center gap-2">
                                {task.assigneeName && (
                                  <Avatar 
                                    name={task.assigneeName} 
                                    src={users.find(u => u.id === task.assigneeId)?.avatar}
                                    size="sm" 
                                  />
                                )}
                                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 truncate max-w-[80px]">
                                  {task.assigneeName?.split(' ')[0] || 'Unassigned'}
                                </span>
                              </div>
                              {task.dueDate && (
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {formatDate(task.dueDate)}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {colTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex flex-col items-center justify-center min-h-[140px] border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl text-xs text-slate-300 dark:text-slate-700 gap-2">
                        <Plus className="w-4 h-4 opacity-40" />
                        <span>Empty Stage</span>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
        {/* Right side spacer to ensure the last column doesn't stick to the edge */}
        <div className="shrink-0 w-8" />
      </div>
    </DragDropContext>
  );
}
