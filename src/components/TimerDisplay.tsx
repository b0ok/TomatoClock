import React from 'react';
import { TimerMode, ThemeMode } from '../types';
import { Edit3, CheckCircle2 } from 'lucide-react';

interface TimerDisplayProps {
  mode: TimerMode;
  timeLeft: number;
  totalDuration: number;
  isRunning: boolean;
  theme: ThemeMode;
  currentIntervalIndex: number;
  totalIntervals: number;
  currentTask: string;
  onChangeTask: (task: string) => void;
  onFastForwardMinute: (deltaMinutes: number) => void;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  mode,
  timeLeft,
  totalDuration,
  isRunning,
  theme,
  currentIntervalIndex,
  totalIntervals,
  currentTask,
  onChangeTask,
  onFastForwardMinute,
}) => {
  const isDark = theme === 'dark';

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress: 1 when just started, 0 when finished
  const progressRatio = totalDuration > 0 ? Math.max(0, Math.min(1, timeLeft / totalDuration)) : 0;

  // SVG Circle parameters
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const getModeTheme = () => {
    switch (mode) {
      case 'work':
        return {
          color: isDark ? '#fb7185' : '#e11d48', // rose-400 : rose-600
          trackColor: isDark ? 'rgba(244, 63, 94, 0.12)' : 'rgba(244, 63, 94, 0.08)',
          glow: isDark ? 'drop-shadow(0 0 16px rgba(244, 63, 94, 0.25))' : 'none',
          label: 'Focus Session',
          badgeClass: isDark ? 'text-rose-300 bg-rose-500/15 border-rose-500/30' : 'text-rose-700 bg-rose-50 border-rose-200',
        };
      case 'shortBreak':
        return {
          color: isDark ? '#34d399' : '#059669', // emerald-400 : emerald-600
          trackColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
          glow: isDark ? 'drop-shadow(0 0 16px rgba(16, 185, 129, 0.25))' : 'none',
          label: 'Short Break',
          badgeClass: isDark ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30' : 'text-emerald-700 bg-emerald-50 border-emerald-200',
        };
      case 'longBreak':
        return {
          color: isDark ? '#38bdf8' : '#0284c7', // sky-400 : sky-600
          trackColor: isDark ? 'rgba(14, 165, 233, 0.12)' : 'rgba(14, 165, 233, 0.08)',
          glow: isDark ? 'drop-shadow(0 0 16px rgba(14, 165, 233, 0.25))' : 'none',
          label: 'Long Break',
          badgeClass: isDark ? 'text-sky-300 bg-sky-500/15 border-sky-500/30' : 'text-sky-700 bg-sky-50 border-sky-200',
        };
    }
  };

  const currentModeInfo = getModeTheme();

  return (
    <div className="flex flex-col items-center justify-center w-full my-4 sm:my-6">
      {/* Central Progress Ring */}
      <div className="relative flex items-center justify-center w-[300px] h-[300px] sm:w-[340px] sm:h-[340px]">
        <svg
          className="w-full h-full -rotate-90 transform"
          viewBox="0 0 320 320"
        >
          {/* Background circle track */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            strokeWidth="9"
            fill="transparent"
            stroke={currentModeInfo.trackColor}
          />
          {/* Animated progress circle */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            strokeWidth="9"
            strokeLinecap="round"
            fill="transparent"
            stroke={currentModeInfo.color}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: isRunning ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.35s ease',
              filter: isRunning ? currentModeInfo.glow : undefined,
            }}
          />
        </svg>

        {/* Center content inside ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto select-none">
          {/* Mode Pill Badge */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border mb-2 transition-colors ${currentModeInfo.badgeClass}`}
          >
            {currentModeInfo.label}
          </div>

          {/* Large Countdown Digits */}
          <div
            id="timer-display"
            className={`font-mono-numbers text-6xl sm:text-7xl font-bold tracking-tight transition-colors ${
              isDark ? 'text-zinc-100' : 'text-zinc-900'
            }`}
          >
            {formattedTime}
          </div>

          {/* Running Status & Round indicator */}
          <div className="flex items-center gap-2 mt-3">
            <span
              className={`inline-block w-2 h-2 rounded-full transition-colors ${
                isRunning
                  ? mode === 'work'
                    ? 'bg-rose-500 animate-pulse'
                    : mode === 'shortBreak'
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-sky-500 animate-pulse'
                  : isDark
                  ? 'bg-zinc-600'
                  : 'bg-zinc-400'
              }`}
            />
            <span
              className={`text-xs font-medium tracking-wide uppercase ${
                isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`}
            >
              {isRunning ? 'Running' : timeLeft === totalDuration ? 'Ready' : 'Paused'}
            </span>
          </div>

          {/* Interval Cycle Progress Dots */}
          <div className="flex items-center gap-1.5 mt-3" title={`Cycle: Interval ${currentIntervalIndex} of ${totalIntervals}`}>
            {Array.from({ length: totalIntervals }).map((_, index) => {
              const isFilled = index + 1 < currentIntervalIndex;
              const isCurrent = index + 1 === currentIntervalIndex;
              return (
                <div
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    isFilled
                      ? 'bg-rose-500 ring-2 ring-rose-500/20'
                      : isCurrent
                      ? isDark
                        ? 'bg-rose-400 ring-2 ring-rose-400/40 scale-110'
                        : 'bg-rose-600 ring-2 ring-rose-600/30 scale-110'
                      : isDark
                      ? 'bg-zinc-800 border border-zinc-700'
                      : 'bg-zinc-200 border border-zinc-300'
                  }`}
                />
              );
            })}
          </div>
          <span className={`text-[11px] mt-1 font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Round {currentIntervalIndex} of {totalIntervals}
          </span>
        </div>
      </div>

      {/* Quick Adjust Buttons (+1m / +5m) */}
      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={() => onFastForwardMinute(1)}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
            isDark
              ? 'bg-zinc-800/70 border-zinc-700/60 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100'
              : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
          }`}
          title="Add 1 minute to current timer"
        >
          +1 min
        </button>
        <button
          type="button"
          onClick={() => onFastForwardMinute(5)}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
            isDark
              ? 'bg-zinc-800/70 border-zinc-700/60 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100'
              : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
          }`}
          title="Add 5 minutes to current timer"
        >
          +5 min
        </button>
      </div>

      {/* Current Task / Intention Anchor */}
      <div className="w-full max-w-sm mt-4 px-3">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
            isDark
              ? 'bg-zinc-900/70 border-zinc-800/80 focus-within:border-zinc-600'
              : 'bg-white border-zinc-200 focus-within:border-zinc-400 shadow-xs'
          }`}
        >
          <CheckCircle2
            className={`w-4 h-4 shrink-0 transition-colors ${
              currentTask.trim()
                ? isDark
                  ? 'text-rose-400'
                  : 'text-rose-600'
                : isDark
                ? 'text-zinc-600'
                : 'text-zinc-400'
            }`}
          />
          <input
            id="current-task-input"
            type="text"
            value={currentTask}
            onChange={(e) => onChangeTask(e.target.value)}
            placeholder="Focus objective (e.g. Write report draft)..."
            className={`w-full bg-transparent text-sm outline-none placeholder:text-xs tracking-tight ${
              isDark
                ? 'text-zinc-200 placeholder:text-zinc-600'
                : 'text-zinc-800 placeholder:text-zinc-400'
            }`}
            maxLength={75}
          />
          {currentTask.trim() ? (
            <button
              type="button"
              onClick={() => onChangeTask('')}
              className={`text-xs p-1 rounded transition-colors ${
                isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'
              }`}
              title="Clear objective"
            >
              ×
            </button>
          ) : (
            <Edit3 className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} />
          )}
        </div>
      </div>
    </div>
  );
};
