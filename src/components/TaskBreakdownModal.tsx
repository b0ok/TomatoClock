import React, { useState } from 'react';
import { TaskItem, ThemeMode, MicroStep } from '../types';
import { X, Sparkles, Plus, Trash2, CheckCircle2, Circle, ArrowRight, Wand2 } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TaskBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem | null;
  onSaveMicroSteps: (taskId: string, steps: MicroStep[]) => void;
  theme: ThemeMode;
}

const TEMPLATES: Array<{
  name: string;
  category: string;
  icon: string;
  steps: string[];
}> = [
  {
    name: 'Reply to Message / Email',
    category: 'Communication',
    icon: '✉️',
    steps: [
      'Open the email client or chat app',
      'Read the message through just once (no pressure)',
      'Draft 2 short bullet points for your answer',
      'Turn bullets into sentences & hit Send',
    ],
  },
  {
    name: '5-Min Desk / Room Reset',
    category: 'Environment',
    icon: '🧹',
    steps: [
      'Throw away any wrappers, bottles, or trash',
      'Carry dirty cups/plates to the sink',
      'Stack stray papers or notebooks neatly',
      'Fill a fresh glass of water',
    ],
  },
  {
    name: 'Writing / Document Draft',
    category: 'Creative',
    icon: '📝',
    steps: [
      'Open a fresh document & type the title',
      'Write 3 simple bullet points of the main idea',
      'Draft one imperfect paragraph (turn off inner editor)',
      'Review and format headings',
    ],
  },
  {
    name: 'Coding / Bug Fix',
    category: 'Tech',
    icon: '💻',
    steps: [
      'Open terminal & reproduce error or open file',
      'Inspect the relevant function or stack trace',
      'Write the simplest minimal fix',
      'Run verification build / test',
    ],
  },
  {
    name: 'Study / Read Chapter',
    category: 'Learning',
    icon: '📚',
    steps: [
      'Open notes and navigate to chapter',
      'Skim section headings, diagrams, and summary',
      'Read 2 pages actively',
      'Write 2 key bullet points in your own words',
    ],
  },
  {
    name: 'Avoided Phone Call',
    category: 'Life Admin',
    icon: '📞',
    steps: [
      'Find the phone number and write it down',
      'Jot down 1 sentence of what you need to ask',
      'Dial the number (it will take less than 3 minutes)',
      'Note down confirmation or next steps',
    ],
  },
];

export const TaskBreakdownModal: React.FC<TaskBreakdownModalProps> = ({
  isOpen,
  onClose,
  task,
  onSaveMicroSteps,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [steps, setSteps] = useState<MicroStep[]>(() => task?.microSteps || []);
  const [newStepText, setNewStepText] = useState('');

  // Synchronize when task changes
  React.useEffect(() => {
    if (task) {
      setSteps(task.microSteps);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepText.trim()) return;
    const newStep: MicroStep = {
      id: `ms-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newStepText.trim(),
      completed: false,
    };
    setSteps((prev) => [...prev, newStep]);
    setNewStepText('');
    soundManager.playClick();
  };

  const handleApplyTemplate = (templateSteps: string[]) => {
    const generated: MicroStep[] = templateSteps.map((title, i) => ({
      id: `ms-${Date.now()}-${i}`,
      title,
      completed: false,
    }));
    setSteps(generated);
    soundManager.playDopamineSparkle();
  };

  const handleToggleStep = (id: string) => {
    soundManager.playCheck();
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteStep = (id: string) => {
    soundManager.playClick();
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    soundManager.playClick();
    onSaveMicroSteps(task.id, steps);
    onClose();
  };

  return (
    <div
      id="breakdown-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="breakdown-modal-container"
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${
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
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Micro-Step Deconstructor</h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Turn intimidation into tiny 2-minute steps
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

        {/* Content Body */}
        <div className="overflow-y-auto px-6 py-4 space-y-5 flex-1">
          {/* Target Task Title */}
          <div
            className={`p-3 rounded-2xl border ${
              isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
              Breaking Down Task:
            </span>
            <div className="text-sm font-bold mt-0.5 text-zinc-100">{task.title}</div>
          </div>

          {/* Quick 1-Click Templates */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                1-Click ADHD Deconstruction Templates
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl.steps)}
                  className={`p-2.5 rounded-xl border text-left transition-all group ${
                    isDark
                      ? 'bg-zinc-800/40 border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800'
                      : 'bg-zinc-50 border-zinc-200 hover:border-amber-400 hover:bg-amber-50/50'
                  }`}
                >
                  <div className="text-base mb-1">{tpl.icon}</div>
                  <div className="text-xs font-semibold line-clamp-1 group-hover:text-amber-400">
                    {tpl.name}
                  </div>
                  <div className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {tpl.steps.length} steps
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Micro-Steps List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Micro-Steps ({steps.length})
              </span>
              <span className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {steps.filter((s) => s.completed).length} of {steps.length} done
              </span>
            </div>

            {steps.length === 0 ? (
              <div className="p-4 rounded-2xl border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                No micro-steps yet. Add one below or click a template above!
              </div>
            ) : (
              <div className="space-y-1.5">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors ${
                      step.completed
                        ? isDark
                          ? 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
                          : 'bg-zinc-50 border-zinc-200 opacity-60'
                        : isDark
                        ? 'bg-zinc-800/50 border-zinc-700/60'
                        : 'bg-white border-zinc-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleStep(step.id)}
                      className="text-emerald-400 shrink-0"
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <span className="text-xs font-mono-numbers text-zinc-500 shrink-0">
                      #{index + 1}
                    </span>
                    <span
                      className={`text-xs flex-1 ${
                        step.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                      }`}
                    >
                      {step.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteStep(step.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1 rounded transition-colors"
                      title="Remove step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Custom Step Input */}
            <form onSubmit={handleAddStep} className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                placeholder="Add a tiny 2-min step..."
                className={`flex-1 px-3 py-2 text-xs rounded-xl border outline-none ${
                  isDark
                    ? 'bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400'
                    : 'bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500'
                }`}
              />
              <button
                type="submit"
                disabled={!newStepText.trim()}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-end gap-2 px-6 py-4 border-t ${
            isDark ? 'border-zinc-800 bg-zinc-900/80' : 'border-zinc-100 bg-zinc-50'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
              isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold shadow-md shadow-rose-950/40 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Save & Focus</span>
          </button>
        </div>
      </div>
    </div>
  );
};
