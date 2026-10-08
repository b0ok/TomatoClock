import React, { useState } from 'react';
import {
  TimerStats,
  ThemeMode,
  DailyStatRecord,
} from '../types';
import {
  X,
  TrendingUp,
  Sparkles,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Info,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface WeeklyInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TimerStats;
  theme: ThemeMode;
}

export const WeeklyInsightsModal: React.FC<WeeklyInsightsModalProps> = ({
  isOpen,
  onClose,
  stats,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [activeMetric, setActiveMetric] = useState<'both' | 'pomodoros' | 'dopamine'>('both');

  if (!isOpen) return null;

  // Safe fallbacks from current stats
  const currentPomodoros = stats?.completedPomodoros ?? 0;
  const currentDopamine = stats?.dopaminePoints ?? 0;
  const currentSeconds = stats?.totalFocusSeconds ?? 0;
  const currentTasks = stats?.tasksCompleted ?? 0;
  const currentStreak = stats?.dailyStreak ?? 0;

  // Prepare 7-day data ending today
  const history = stats?.history || {};
  const today = new Date();
  
  const last7Days: {
    dateKey: string;
    dayLabel: string;
    fullDateLabel: string;
    record: DailyStatRecord;
    isToday: boolean;
  }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    
    // Day label: 'Mon', 'Tue' etc.
    const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });
    const fullDateLabel = d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });

    const isCurrentDay = i === 0;

    let rec = history[dateKey];
    if (!rec) {
      if (isCurrentDay) {
        // Today defaults from current stats if not yet archived in history
        rec = {
          date: dateKey,
          completedPomodoros: currentPomodoros,
          dopaminePoints: currentDopamine,
          focusSeconds: currentSeconds,
          tasksCompleted: currentTasks,
        };
      } else {
        rec = {
          date: dateKey,
          completedPomodoros: 0,
          dopaminePoints: 0,
          focusSeconds: 0,
          tasksCompleted: 0,
        };
      }
    } else if (isCurrentDay) {
      // Ensure current day reflects current active stats accurately
      rec = {
        date: dateKey,
        completedPomodoros: Math.max(rec.completedPomodoros, currentPomodoros),
        dopaminePoints: Math.max(rec.dopaminePoints, currentDopamine),
        focusSeconds: Math.max(rec.focusSeconds, currentSeconds),
        tasksCompleted: Math.max(rec.tasksCompleted, currentTasks),
      };
    }

    last7Days.push({
      dateKey,
      dayLabel,
      fullDateLabel,
      record: rec,
      isToday: isCurrentDay,
    });
  }

  // Aggregate sums over the 7-day period
  const total7DayPomodoros = last7Days.reduce((acc, curr) => acc + (curr.record?.completedPomodoros || 0), 0);
  const total7DayDopamine = last7Days.reduce((acc, curr) => acc + (curr.record?.dopaminePoints || 0), 0);
  const total7DaySeconds = last7Days.reduce((acc, curr) => acc + (curr.record?.focusSeconds || 0), 0);
  const total7DayTasks = last7Days.reduce((acc, curr) => acc + (curr.record?.tasksCompleted || 0), 0);

  const total7DayHours = (total7DaySeconds / 3600).toFixed(1);
  const avgPomodorosPerDay = (total7DayPomodoros / 7).toFixed(1);

  // Calculate maximums for bar scale sizing
  const maxPomodoroInWeek = Math.max(...last7Days.map((d) => d.record?.completedPomodoros || 0), 4);
  const maxDopamineInWeek = Math.max(...last7Days.map((d) => d.record?.dopaminePoints || 0), 100);

  // Active days count
  const activeDaysCount = last7Days.filter((d) => (d.record?.completedPomodoros || 0) > 0 || (d.record?.dopaminePoints || 0) > 0).length;

  return (
    <div
      id="weekly-insights-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm transition-opacity overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="weekly-insights-modal"
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden transition-all my-auto flex flex-col ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-black/80'
            : 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-300/50'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">Weekly Insights</h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                7-day trajectory for focus sessions & dopamine milestones
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark
                ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
            aria-label="Close insights modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Key Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Pomodoros */}
            <div
              className={`p-3.5 rounded-2xl border transition-colors ${
                isDark ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold mb-1">
                <Award className="w-3.5 h-3.5" />
                <span>Pomodoros</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono-numbers tracking-tight">
                {total7DayPomodoros}
              </div>
              <div className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                avg {avgPomodorosPerDay} / day
              </div>
            </div>

            {/* 2. Dopamine Points */}
            <div
              className={`p-3.5 rounded-2xl border transition-colors ${
                isDark ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dopamine Points</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono-numbers text-amber-400 tracking-tight">
                +{total7DayDopamine}
              </div>
              <div className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                earned reward XP
              </div>
            </div>

            {/* 3. Focus Hours */}
            <div
              className={`p-3.5 rounded-2xl border transition-colors ${
                isDark ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Focus Hours</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono-numbers tracking-tight">
                {total7DayHours}h
              </div>
              <div className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                total deep time
              </div>
            </div>

            {/* 4. Active Momentum */}
            <div
              className={`p-3.5 rounded-2xl border transition-colors ${
                isDark ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Active Days</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono-numbers tracking-tight">
                {activeDaysCount} <span className="text-xs font-normal text-zinc-500">/ 7</span>
              </div>
              <div className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {currentStreak > 0 ? `🔥 ${currentStreak}-day streak` : 'consistent flow'}
              </div>
            </div>
          </div>

          {/* Interactive Metric Switcher */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
            <div>
              <h3 className="text-sm font-semibold">Last 7 Days Activity</h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Visualizing your day-by-day effort without shame or burnout pressure
              </p>
            </div>

            <div
              className={`flex items-center p-1 rounded-xl border text-xs ${
                isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setActiveMetric('both');
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  activeMetric === 'both'
                    ? isDark
                      ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                      : 'bg-white text-zinc-900 shadow-xs'
                    : isDark
                    ? 'text-zinc-400 hover:text-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Combined
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setActiveMetric('pomodoros');
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  activeMetric === 'pomodoros'
                    ? isDark
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-rose-100 text-rose-800'
                    : isDark
                    ? 'text-zinc-400 hover:text-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Pomodoros
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setActiveMetric('dopamine');
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  activeMetric === 'dopamine'
                    ? isDark
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-amber-100 text-amber-800'
                    : isDark
                    ? 'text-zinc-400 hover:text-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Dopamine Points
              </button>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border ${
              isDark ? 'bg-zinc-950/70 border-zinc-800/80' : 'bg-zinc-50/70 border-zinc-200'
            }`}
          >
            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-xs mb-6 justify-end">
              {(activeMetric === 'both' || activeMetric === 'pomodoros') && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
                  <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                    Pomodoros Completed
                  </span>
                </div>
              )}
              {(activeMetric === 'both' || activeMetric === 'dopamine') && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
                  <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                    Dopamine Points
                  </span>
                </div>
              )}
            </div>

            {/* Bars Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 sm:h-56 pt-4 pb-2 border-b border-zinc-800/60">
              {last7Days.map((item) => {
                const pomodoroHeight = Math.max(
                  item.record.completedPomodoros > 0
                    ? Math.round((item.record.completedPomodoros / maxPomodoroInWeek) * 100)
                    : 4,
                  item.record.completedPomodoros > 0 ? 12 : 4
                );

                const dopamineHeight = Math.max(
                  item.record.dopaminePoints > 0
                    ? Math.round((item.record.dopaminePoints / maxDopamineInWeek) * 100)
                    : 4,
                  item.record.dopaminePoints > 0 ? 12 : 4
                );

                return (
                  <div key={item.dateKey} className="flex flex-col items-center h-full justify-end group">
                    {/* Tooltip / value preview on hover */}
                    <div className="text-[10px] font-mono-numbers text-center mb-1 text-zinc-400 opacity-90 group-hover:opacity-100 transition-opacity">
                      {activeMetric === 'pomodoros' && `${item.record.completedPomodoros}`}
                      {activeMetric === 'dopamine' && `${item.record.dopaminePoints}`}
                      {activeMetric === 'both' && (
                        <span>
                          <span className="text-rose-400">{item.record.completedPomodoros}</span>
                          <span className="text-zinc-600"> / </span>
                          <span className="text-amber-400">{item.record.dopaminePoints}</span>
                        </span>
                      )}
                    </div>

                    {/* Bar container */}
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full max-h-40">
                      {/* Pomodoro Bar */}
                      {(activeMetric === 'both' || activeMetric === 'pomodoros') && (
                        <div
                          className={`w-full max-w-[18px] sm:max-w-[24px] rounded-t-lg transition-all duration-300 relative group-hover:brightness-110 ${
                            item.record.completedPomodoros > 0
                              ? 'bg-rose-500 shadow-xs shadow-rose-900/30'
                              : isDark
                              ? 'bg-zinc-800/40'
                              : 'bg-zinc-200/50'
                          }`}
                          style={{ height: `${pomodoroHeight}%` }}
                          title={`${item.fullDateLabel}: ${item.record.completedPomodoros} Pomodoro sessions`}
                        />
                      )}

                      {/* Dopamine Bar */}
                      {(activeMetric === 'both' || activeMetric === 'dopamine') && (
                        <div
                          className={`w-full max-w-[18px] sm:max-w-[24px] rounded-t-lg transition-all duration-300 relative group-hover:brightness-110 ${
                            item.record.dopaminePoints > 0
                              ? 'bg-amber-400 shadow-xs shadow-amber-900/30'
                              : isDark
                              ? 'bg-zinc-800/40'
                              : 'bg-zinc-200/50'
                          }`}
                          style={{ height: `${dopamineHeight}%` }}
                          title={`${item.fullDateLabel}: ${item.record.dopaminePoints} Dopamine XP earned`}
                        />
                      )}
                    </div>

                    {/* Day labels below bar */}
                    <div className="text-center mt-2.5">
                      <div
                        className={`text-xs font-semibold ${
                          item.isToday
                            ? 'text-rose-400 underline underline-offset-4 decoration-rose-500'
                            : isDark
                            ? 'text-zinc-300'
                            : 'text-zinc-700'
                        }`}
                      >
                        {item.dayLabel}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono-numbers">
                        {item.fullDateLabel}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Daily detail breakdown table */}
            <div className="mt-4 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                Detailed Log
              </h4>
              <div className="divide-y divide-zinc-800/50 text-xs">
                {last7Days.map((item) => (
                  <div
                    key={`row-${item.dateKey}`}
                    className={`py-2 px-2 flex items-center justify-between rounded-lg transition-colors ${
                      item.isToday
                        ? isDark
                          ? 'bg-rose-500/10 text-zinc-100'
                          : 'bg-rose-50 text-zinc-900 font-medium'
                        : isDark
                        ? 'hover:bg-zinc-900/50 text-zinc-300'
                        : 'hover:bg-zinc-100/60 text-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{item.dayLabel}</span>
                      <span className="text-zinc-500">({item.fullDateLabel})</span>
                      {item.isToday && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-300">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 font-mono-numbers">
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-rose-400" />
                        <span>{item.record.completedPomodoros}</span>
                        <span className="text-zinc-500 text-[10px]">sessions</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Sparkles className="w-3 h-3" />
                        <span>+{item.record.dopaminePoints}</span>
                        <span className="text-amber-500/70 text-[10px]">XP</span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-400">
                        <Clock className="w-3 h-3" />
                        <span>{Math.floor(item.record.focusSeconds / 60)}m</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Neurodiversity / ADHD Friendly Wisdom Note */}
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
              isDark
                ? 'bg-zinc-950 border-zinc-800/80 text-zinc-400'
                : 'bg-zinc-50 border-zinc-200 text-zinc-600'
            }`}
          >
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-zinc-200">
                Non-Linear Progress is completely normal
              </p>
              <p>
                ADHD productivity naturally ebbs and flows depending on sleep, executive energy, and hyperfocus waves.
                Zero-pomodoro days are valid rest days. Consistency in showing up matters more than rigid streaks.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isDark
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
