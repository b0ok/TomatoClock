import React from 'react';
import { Settings, Moon, Sun, Volume2, VolumeX, Keyboard, Timer, Brain, Sparkles, TrendingUp } from 'lucide-react';
import { ThemeMode } from '../types';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  onOpenInsights: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenParkingLot: () => void;
  parkingLotCount: number;
  dopaminePoints: number;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenSettings,
  onOpenShortcuts,
  onOpenInsights,
  soundEnabled,
  onToggleSound,
  onOpenParkingLot,
  parkingLotCount,
  dopaminePoints,
}) => {
  const isDark = theme === 'dark';

  return (
    <header
      id="app-header"
      className="w-full max-w-2xl mx-auto flex items-center justify-between py-4 px-4 sm:px-6"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shadow-sm ${
            isDark
              ? 'bg-zinc-800/80 border border-zinc-700/60 text-rose-400'
              : 'bg-white border border-zinc-200 text-rose-500 shadow-sm'
          }`}
        >
          <Timer className="w-5 h-5" />
        </div>
        <div>
          <h1
            className={`text-lg font-bold tracking-tight transition-colors flex items-center gap-2 ${
              isDark ? 'text-zinc-100' : 'text-zinc-900'
            }`}
          >
            <span>TomatoClock</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
              ADHD Flow
            </span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Weekly Insights Button */}
        <button
          id="weekly-insights-btn"
          type="button"
          onClick={() => {
            soundManager.playClick();
            onOpenInsights();
          }}
          title="Weekly Insights: View 7-day Pomodoro & Dopamine trends"
          className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
            isDark
              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-rose-400" />
          <span className="hidden sm:inline">Insights</span>
        </button>

        {/* Dopamine XP Badge */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${
            isDark
              ? 'bg-zinc-900/90 border-amber-500/30 text-amber-300'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
          title="Dopamine XP: Earned by completing micro-steps and focus sessions"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
          <span className="font-mono-numbers">{dopaminePoints} XP</span>
        </div>

        {/* Thought Parking Lot (Brain Dump) Button */}
        <button
          id="parking-lot-btn"
          type="button"
          onClick={onOpenParkingLot}
          title="Distraction Parking Lot: Park random thoughts without breaking focus"
          className={`relative p-2 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
            isDark
              ? 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/30'
              : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
          }`}
        >
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="hidden sm:inline">Brain Dump</span>
          {parkingLotCount > 0 && (
            <span className="min-w-4 h-4 px-1 rounded-full text-[10px] font-bold bg-purple-500 text-white flex items-center justify-center">
              {parkingLotCount}
            </span>
          )}
        </button>

        <button
          id="toggle-sound-btn"
          type="button"
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute sound notification' : 'Enable sound notification'}
          className={`p-2 rounded-xl text-sm font-medium transition-colors ${
            isDark
              ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
          aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
        </button>

        <button
          id="shortcuts-btn"
          type="button"
          onClick={onOpenShortcuts}
          title="Keyboard shortcuts"
          className={`p-2 rounded-xl text-sm font-medium transition-colors ${
            isDark
              ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
          aria-label="View keyboard shortcuts"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        <button
          id="toggle-theme-btn"
          type="button"
          onClick={onToggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`p-2 rounded-xl text-sm font-medium transition-colors ${
            isDark
              ? 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-800/70'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          id="open-settings-btn"
          type="button"
          onClick={onOpenSettings}
          title="Customize intervals & presets"
          className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
            isDark
              ? 'bg-zinc-800/90 hover:bg-zinc-700/80 text-zinc-200 border-zinc-700/60'
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
          }`}
          aria-label="Open timer settings"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>
    </header>
  );
};
