import React from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { TimerMode, ThemeMode } from '../types';

interface ControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSkip: () => void;
  mode: TimerMode;
  theme: ThemeMode;
}

export const Controls: React.FC<ControlsProps> = ({
  isRunning,
  onToggle,
  onReset,
  onSkip,
  mode,
  theme,
}) => {
  const isDark = theme === 'dark';

  const getPrimaryButtonColors = () => {
    switch (mode) {
      case 'work':
        return isDark
          ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-950/40 active:scale-95'
          : 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 active:scale-95';
      case 'shortBreak':
        return isDark
          ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold shadow-lg shadow-emerald-950/40 active:scale-95'
          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 active:scale-95';
      case 'longBreak':
        return isDark
          ? 'bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold shadow-lg shadow-sky-950/40 active:scale-95'
          : 'bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-200 active:scale-95';
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 w-full">
      {/* Reset button */}
      <button
        id="reset-timer-btn"
        type="button"
        onClick={onReset}
        title="Reset interval (Key: R)"
        className={`p-3.5 rounded-2xl border transition-all duration-150 active:scale-95 ${
          isDark
            ? 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 shadow-xs'
        }`}
        aria-label="Reset timer"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

      {/* Main Play / Pause action button */}
      <button
        id="toggle-timer-btn"
        type="button"
        onClick={onToggle}
        title={isRunning ? 'Pause timer (Key: Space)' : 'Start timer (Key: Space)'}
        className={`px-8 py-4 rounded-2xl flex items-center justify-center gap-3 text-base font-semibold transition-all duration-200 ${getPrimaryButtonColors()}`}
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
      >
        {isRunning ? (
          <>
            <Pause className="w-5 h-5 fill-current" />
            <span>PAUSE</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-current" />
            <span>START</span>
          </>
        )}
      </button>

      {/* Skip forward button */}
      <button
        id="skip-timer-btn"
        type="button"
        onClick={onSkip}
        title="Skip to next interval (Key: S)"
        className={`p-3.5 rounded-2xl border transition-all duration-150 active:scale-95 ${
          isDark
            ? 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 shadow-xs'
        }`}
        aria-label="Skip to next interval"
      >
        <SkipForward className="w-5 h-5" />
      </button>
    </div>
  );
};
