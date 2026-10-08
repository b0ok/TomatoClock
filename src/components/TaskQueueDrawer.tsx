import React, { useState } from 'react';
import { TaskItem, ThemeMode } from '../types';
import { X, Plus, Trash2, CheckCircle2, Play, Circle, ListTodo, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TaskQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  activeTaskId: string | null;
  onSelectActiveTask: (id: string) => void;
  onAddTask: (title: string) => void;
  onDeleteTask: (id: string) => void;
  onClearCompleted: () => void;
  theme: ThemeMode;
}

export const TaskQueueDrawer: React.FC<TaskQueueDrawerProps> = ({
  isOpen,
  onClose,
  tasks,
  activeTaskId,
  onSelectActiveTask,
  onAddTask,
  onDeleteTask,
  onClearCompleted,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [newTaskTitle, setNewTaskTitle] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    soundManager.playClick();
    onAddTask(newTaskTitle.trim());
    setNewTaskTitle('');
  };

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div
      id="task-queue-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="task-queue-container"
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden max-h-[85vh] flex flex-col ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? 'border-zinc-800 bg-zinc-900/80' : 'border-zinc-100 bg-zinc-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Focus Task Queue</h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Pick ONE task to bring into your focus view
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Task Input */}
        <form onSubmit={handleCreate} className="p-4 border-b border-zinc-800/80 flex gap-2">
          <input
            id="new-task-queue-input"
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add another task..."
            className={`flex-1 px-3.5 py-2 rounded-xl border text-xs outline-none ${
              isDark
                ? 'bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-rose-500'
                : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:border-rose-600'
            }`}
          />
          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Tasks List */}
        <div className="overflow-y-auto px-5 py-4 space-y-4 flex-1">
          {/* Pending Tasks */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Ready to Tackle ({pendingTasks.length})
            </div>

            {pendingTasks.length === 0 ? (
              <div className="p-4 rounded-2xl border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                No upcoming tasks. Add one above!
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map((t) => {
                  const isActive = t.id === activeTaskId;
                  const stepCount = t.microSteps.length;
                  const doneSteps = t.microSteps.filter((s) => s.completed).length;

                  return (
                    <div
                      key={t.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        isActive
                          ? isDark
                            ? 'bg-rose-500/10 border-rose-500/40 ring-1 ring-rose-500/30'
                            : 'bg-rose-50 border-rose-300 ring-1 ring-rose-200'
                          : isDark
                          ? 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                          : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold truncate text-zinc-100">
                            {t.title}
                          </span>
                          {isActive && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500 text-white shrink-0">
                              Active Focus
                            </span>
                          )}
                        </div>

                        {stepCount > 0 && (
                          <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>
                              {doneSteps}/{stepCount} micro-steps completed
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!isActive ? (
                          <button
                            type="button"
                            onClick={() => {
                              soundManager.playClick();
                              onSelectActiveTask(t.id);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-500 hover:text-white text-zinc-200 text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Focus</span>
                          </button>
                        ) : (
                          <span className="text-xs text-rose-400 font-medium px-2">
                            Focusing now
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            soundManager.playClick();
                            onDeleteTask(t.id);
                          }}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Tasks (Dopamine log) */}
          {completedTasks.length > 0 && (
            <div className="pt-3 border-t border-zinc-800/60">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed Tasks ({completedTasks.length})</span>
                </div>
                <button
                  type="button"
                  onClick={onClearCompleted}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Clear finished
                </button>
              </div>

              <div className="space-y-1.5">
                {completedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800/50 flex items-center justify-between opacity-70 text-xs text-zinc-400"
                  >
                    <span className="line-through">{t.title}</span>
                    <span className="text-[10px] text-emerald-500 font-semibold">+50 XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
