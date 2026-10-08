import React from 'react';
import { TimerStats, ThemeMode } from '../types';
import { Award, Clock, Sparkles, CheckCircle2, RotateCcw, TrendingUp, Flame } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface StatsBarProps {
  stats: TimerStats;
  theme: ThemeMode;
  onResetStats: () => void;
  onOpenInsights?: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, theme, onResetStats, onOpenInsights }) => {
  const isDark = theme === 'dark';

  const totalMinutes = Math.floor(stats.totalFocusSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}h ${remainingMins}m` : `${remainingMins}m`;
  const streak = stats.dailyStreak ?? 0;

  return (
    <div
      id="stats-bar"
      className={`w-full max-w-xl mx-auto mt-6 p-3.5 sm:p-4 rounded-3xl border transition-colors ${
        isDark
          ? 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300'
          : 'bg-white/80 border-zinc-200 text-zinc-700 shadow-xs'
      }`}
    >
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 items-center text-center">
        {/* Focus Time */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Time</span>
          </div>
          <div className={`text-xs sm:text-base font-bold font-mono-numbers ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
            {timeFormatted}
          </div>
        </div>

        {/* Sessions Done */}
        <div className={`flex flex-col items-center border-l px-1 ${isDark ? 'border-zinc-800/60' : 'border-zinc-200'}`}>
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
            <Award className="w-3 h-3 text-rose-400" />
            <span>Sessions</span>
          </div>
          <div className={`text-xs sm:text-base font-bold font-mono-numbers ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
            {stats.completedPomodoros}
          </div>
        </div>

        {/* Daily Streak */}
        <div className={`flex flex-col items-center border-l px-1 ${isDark ? 'border-zinc-800/60' : 'border-zinc-200'}`}>
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
            <Flame className="w-3 h-3 text-orange-400" />
            <span>Streak</span>
          </div>
          <div className="text-xs sm:text-base font-bold font-mono-numbers text-orange-400 flex items-center gap-0.5">
            <span>{streak}</span>
            <span className="text-[10px] font-normal text-zinc-400">d</span>
          </div>
        </div>

        {/* Dopamine XP */}
        <div className={`flex flex-col items-center border-l pl-1 ${isDark ? 'border-zinc-800/60' : 'border-zinc-200'}`}>
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Dopamine</span>
          </div>
          <div className="text-xs sm:text-base font-bold font-mono-numbers text-emerald-400">
            +{stats.dopaminePoints}
          </div>
        </div>
      </div>

      {/* Insights & Reset Row */}
      <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] text-zinc-500 ${isDark ? 'border-zinc-800/60' : 'border-zinc-200'}`}>
        {onOpenInsights ? (
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onOpenInsights();
            }}
            className="text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors font-medium"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>View 7-Day Weekly Insights</span>
          </button>
        ) : (
          <span>Need a fresh start? No judgment.</span>
        )}

        {(stats.completedPomodoros > 0 || stats.totalFocusSeconds > 0) && (
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onResetStats();
            }}
            className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clean Slate</span>
          </button>
        )}
      </div>
    </div>
  );
};
