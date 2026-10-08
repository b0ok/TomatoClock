import React, { useState } from 'react';
import { TaskItem, ThemeMode } from '../types';
import {
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  ArrowRight,
  ListTodo,
  Check,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

interface ActiveTaskCardProps {
  task: TaskItem | null;
  theme: ThemeMode;
  onOpenTaskBreakdown: () => void;
  onOpenTaskQueue: () => void;
  onToggleMicroStep: (stepId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onCreateQuickTask: (title: string) => void;
}

export const ActiveTaskCard: React.FC<ActiveTaskCardProps> = ({
  task,
  theme,
  onOpenTaskBreakdown,
  onOpenTaskQueue,
  onToggleMicroStep,
  onCompleteTask,
  onCreateQuickTask,
}) => {
  const isDark = theme === 'dark';
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onCreateQuickTask(quickInput.trim());
    setQuickInput('');
  };

  const handleCompleteCurrentTask = () => {
    if (!task) return;
    soundManager.playCelebration();
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#f43f5e', '#fbbf24', '#34d399', '#38bdf8', '#a855f7'],
      });
    } catch {
      // ignore
    }
    onCompleteTask(task.id);
  };

  const handleStepCheck = (stepId: string) => {
    soundManager.playCheck();
    onToggleMicroStep(stepId);
  };

  if (!task) {
    return (
      <div
        id="empty-task-anchor"
        className={`w-full max-w-xl mx-auto p-5 rounded-3xl border transition-all ${
          isDark
            ? 'bg-zinc-900/60 border-zinc-800/90 text-zinc-300'
            : 'bg-white border-zinc-200 text-zinc-800 shadow-sm'
        }`}
      >
        <div className="text-center mb-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-400 mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-100">What is ONE thing you want to focus on?</h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            ADHD golden rule: Pick a single micro-goal to eliminate overwhelm.
          </p>
        </div>

        <form onSubmit={handleQuickSubmit} className="flex items-center gap-2">
          <input
            id="quick-task-input"
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="e.g. Write 1 paragraph, Wash dishes, Call doctor..."
            className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition-colors ${
              isDark
                ? 'bg-zinc-950/80 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-rose-500'
                : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:border-rose-600'
            }`}
          />
          <button
            type="submit"
            disabled={!quickInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Set Focus</span>
          </button>
        </form>

        <div className="mt-3 flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenTaskQueue}
            className={`text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Or choose from task queue</span>
          </button>
        </div>
      </div>
    );
  }

  const completedStepsCount = task.microSteps.filter((s) => s.completed).length;
  const totalSteps = task.microSteps.length;
  const progressPercent = totalSteps > 0 ? (completedStepsCount / totalSteps) * 100 : 0;
  const nextUnfinishedStep = task.microSteps.find((s) => !s.completed);

  return (
    <div
      id="active-task-card"
      className={`w-full max-w-xl mx-auto p-4 sm:p-5 rounded-3xl border transition-all ${
        isDark
          ? 'bg-zinc-900/80 border-zinc-800 text-zinc-100 shadow-lg shadow-black/30'
          : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
      }`}
    >
      {/* Top Header: Badge and Task List Launcher */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
            Current Single Focus
          </span>
          {totalSteps > 0 && (
            <span className={`text-xs font-mono-numbers ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {completedStepsCount}/{totalSteps} steps
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenTaskBreakdown}
            title="Break this task down into 2-minute steps"
            className={`px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1 border transition-colors ${
              isDark
                ? 'bg-zinc-800/80 hover:bg-zinc-700 text-amber-300 border-amber-500/30'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Break it down</span>
          </button>

          <button
            type="button"
            onClick={onOpenTaskQueue}
            title="Switch or view all tasks"
            className={`p-1.5 rounded-xl border transition-colors ${
              isDark
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200'
            }`}
            aria-label="Open task list"
          >
            <ListTodo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Task Title */}
      <div className="mb-3">
        <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-100">
          {task.title}
        </h2>
      </div>

      {/* Micro-Step Progress Bar (if steps exist) */}
      {totalSteps > 0 && (
        <div className="w-full bg-zinc-800/70 h-1.5 rounded-full overflow-hidden mb-3.5">
          <div
            className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* The ONE Next Step (ADHD Micro-Stepping Focus) */}
      {nextUnfinishedStep ? (
        <div
          className={`p-3 sm:p-3.5 rounded-2xl border transition-all mb-3.5 ${
            isDark
              ? 'bg-zinc-950/70 border-emerald-500/30'
              : 'bg-emerald-50/70 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            <ArrowRight className="w-3 h-3 animate-pulse" />
            <span>Next Micro-Step (Low-Friction Action):</span>
          </div>
          <div className="flex items-start gap-3 mt-1.5">
            <button
              type="button"
              onClick={() => handleStepCheck(nextUnfinishedStep.id)}
              className={`p-1 rounded-lg transition-transform active:scale-90 text-emerald-400 hover:text-emerald-300`}
              title="Mark step complete (+10 Dopamine XP)"
              aria-label="Check micro-step"
            >
              <Circle className="w-5 h-5 hover:fill-emerald-500/20" />
            </button>
            <span className="text-sm font-medium leading-relaxed text-zinc-200 flex-1 pt-0.5">
              {nextUnfinishedStep.title}
            </span>
          </div>
        </div>
      ) : totalSteps > 0 ? (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center mb-3.5">
          <div className="text-xs font-semibold text-emerald-300 flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>All micro-steps completed! Ready to finish task.</span>
          </div>
        </div>
      ) : (
        <div
          onClick={onOpenTaskBreakdown}
          className={`p-2.5 rounded-xl border border-dashed cursor-pointer transition-colors text-xs text-center mb-3.5 ${
            isDark
              ? 'border-zinc-700 hover:border-amber-400/50 text-zinc-400 hover:text-amber-300'
              : 'border-zinc-300 hover:border-amber-500 text-zinc-500 hover:text-amber-700'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Feeling stuck or overwhelmed? Click here to break into 2-min steps
          </span>
        </div>
      )}

      {/* Task Action Bar */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/60">
        <button
          type="button"
          onClick={onOpenTaskQueue}
          className={`text-xs transition-colors ${
            isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Switch Task
        </button>

        <button
          id="complete-task-btn"
          type="button"
          onClick={handleCompleteCurrentTask}
          className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all active:scale-95 shadow-md shadow-emerald-950/40"
        >
          <Trophy className="w-3.5 h-3.5 fill-current" />
          <span>Complete Task (+50 XP)</span>
        </button>
      </div>
    </div>
  );
};
