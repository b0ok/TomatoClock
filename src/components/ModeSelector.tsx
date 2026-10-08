import React from 'react';
import { TimerMode, ThemeMode } from '../types';
import { Flame, Coffee, BedDouble } from 'lucide-react';

interface ModeSelectorProps {
  mode: TimerMode;
  onSelectMode: (newMode: TimerMode) => void;
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  theme: ThemeMode;
  isRunning: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  onSelectMode,
  workDuration,
  shortBreakDuration,
  longBreakDuration,
  theme,
  isRunning,
}) => {
  const isDark = theme === 'dark';

  const modes: Array<{
    id: TimerMode;
    label: string;
    duration: number;
    icon: React.ReactNode;
    activeDark: string;
    activeLight: string;
  }> = [
    {
      id: 'work',
      label: 'Focus',
      duration: workDuration,
      icon: <Flame className="w-4 h-4" />,
      activeDark: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-950/20',
      activeLight: 'bg-rose-50 text-rose-700 border-rose-200 shadow-rose-100',
    },
    {
      id: 'shortBreak',
      label: 'Short Break',
      duration: shortBreakDuration,
      icon: <Coffee className="w-4 h-4" />,
      activeDark: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-950/20',
      activeLight: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100',
    },
    {
      id: 'longBreak',
      label: 'Long Break',
      duration: longBreakDuration,
      icon: <BedDouble className="w-4 h-4" />,
      activeDark: 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sky-950/20',
      activeLight: 'bg-sky-50 text-sky-700 border-sky-200 shadow-sky-100',
    },
  ];

  return (
    <div
      id="mode-selector"
      className={`p-1.5 rounded-2xl flex items-center justify-center gap-1 border transition-colors max-w-md mx-auto w-full ${
        isDark
          ? 'bg-zinc-900/90 border-zinc-800/80 shadow-inner'
          : 'bg-zinc-100/90 border-zinc-200/80'
      }`}
    >
      {modes.map((item) => {
        const isActive = mode === item.id;
        return (
          <button
            key={item.id}
            id={`mode-tab-${item.id}`}
            type="button"
            onClick={() => onSelectMode(item.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
              isActive
                ? `${isDark ? item.activeDark : item.activeLight} shadow-sm font-semibold`
                : isDark
                ? 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-md font-mono-numbers transition-colors ${
                isActive
                  ? isDark
                    ? 'bg-zinc-900/60 text-zinc-200'
                    : 'bg-white/80 text-zinc-700 shadow-xs'
                  : isDark
                  ? 'bg-zinc-800/50 text-zinc-500'
                  : 'bg-zinc-200/70 text-zinc-500'
              }`}
            >
              {item.duration}m
            </span>
          </button>
        );
      })}
    </div>
  );
};
