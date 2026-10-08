/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  TimerMode,
  TimerSettings,
  TimerStats,
  ThemeMode,
  TaskItem,
  MicroStep,
  ParkingLotItem,
  AmbientNoiseType,
} from './types';
import {
  loadSettings,
  saveSettings,
  loadTheme,
  saveTheme,
  loadStats,
  saveStats,
  loadTasks,
  saveTasks,
  loadActiveTaskId,
  saveActiveTaskId,
  loadParkingLot,
  saveParkingLot,
} from './utils/storage';
import { soundManager } from './utils/audio';
import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import { TimerDisplay } from './components/TimerDisplay';
import { Controls } from './components/Controls';
import { StatsBar } from './components/StatsBar';
import { SettingsModal } from './components/SettingsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ActiveTaskCard } from './components/ActiveTaskCard';
import { AmbientNoiseControl } from './components/AmbientNoiseControl';
import { TaskBreakdownModal } from './components/TaskBreakdownModal';
import { ParkingLotDrawer } from './components/ParkingLotDrawer';
import { TaskQueueDrawer } from './components/TaskQueueDrawer';
import { WeeklyInsightsModal } from './components/WeeklyInsightsModal';
import { getTodayKey, calculateStreakFromHistory } from './utils/storage';

export default function App() {
  const [settings, setSettings] = useState<TimerSettings>(loadSettings);
  const [theme, setTheme] = useState<ThemeMode>(loadTheme);
  const [stats, setStats] = useState<TimerStats>(loadStats);
  const [tasks, setTasks] = useState<TaskItem[]>(loadTasks);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(loadActiveTaskId);
  const [parkingLot, setParkingLot] = useState<ParkingLotItem[]>(loadParkingLot);

  const [mode, setMode] = useState<TimerMode>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [currentTaskObjective, setCurrentTaskObjective] = useState('');

  // Modals & Drawers state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isParkingLotOpen, setIsParkingLotOpen] = useState(false);
  const [isTaskQueueOpen, setIsTaskQueueOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  // Active task derivation
  const activeTask = tasks.find((t) => t.id === activeTaskId && !t.completed) ||
    tasks.find((t) => !t.completed) ||
    null;

  // Helper to get duration in seconds for a specific mode
  const getDurationForMode = useCallback(
    (targetMode: TimerMode, targetSettings: TimerSettings = settings): number => {
      switch (targetMode) {
        case 'work':
          return targetSettings.workDuration * 60;
        case 'shortBreak':
          return targetSettings.shortBreakDuration * 60;
        case 'longBreak':
          return targetSettings.longBreakDuration * 60;
      }
    },
    [settings]
  );

  const [timeLeft, setTimeLeft] = useState<number>(() => getDurationForMode('work'));

  // Sync theme
  useEffect(() => {
    saveTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Persist storage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveActiveTaskId(activeTaskId);
  }, [activeTaskId]);

  useEffect(() => {
    saveParkingLot(parkingLot);
  }, [parkingLot]);

  // Sync ambient sound when setting changes
  useEffect(() => {
    if (settings.ambientNoise !== 'off') {
      soundManager.setAmbientNoise(settings.ambientNoise, settings.ambientVolume);
    } else {
      soundManager.stopAmbientNoise();
    }
    return () => {
      soundManager.stopAmbientNoise();
    };
  }, [settings.ambientNoise]);

  // Update document title with remaining time and active task
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const modeName = mode === 'work' ? 'Focus' : mode === 'shortBreak' ? 'Rest' : 'Long Rest';
    const taskSnippet = activeTask ? ` · ${activeTask.title.slice(0, 18)}` : '';
    document.title = `${formatted} - ${modeName}${taskSnippet} | tomatoclock`;
  }, [timeLeft, mode, activeTask]);

  const currentTotalDuration = getDurationForMode(mode);

  // Transition to next interval mode
  const transitionToNextMode = useCallback(() => {
    if (settings.soundEnabled) {
      soundManager.playNotification(settings.soundType, settings.soundVolume);
    }

    if (mode === 'work') {
      // Award dopamine XP for finishing a focus block
      soundManager.playDopamineSparkle();
      setStats((prev) => {
        const nextCompleted = prev.completedPomodoros + 1;
        const reachedLongBreak = prev.currentIntervalIndex >= settings.longBreakInterval;
        const nextIntervalIndex = reachedLongBreak ? 1 : prev.currentIntervalIndex + 1;
        const nextMode: TimerMode = reachedLongBreak ? 'longBreak' : 'shortBreak';

        setMode(nextMode);
        setTimeLeft(getDurationForMode(nextMode));
        setIsRunning(settings.autoStartBreaks);

        // Update 7-day history and streak
        const todayKey = getTodayKey();
        const updatedHistory = { ...(prev.history || {}) };
        const existingRecord = updatedHistory[todayKey] || {
          date: todayKey,
          completedPomodoros: 0,
          dopaminePoints: 0,
          focusSeconds: 0,
          tasksCompleted: 0,
        };

        updatedHistory[todayKey] = {
          ...existingRecord,
          completedPomodoros: existingRecord.completedPomodoros + 1,
          dopaminePoints: existingRecord.dopaminePoints + 25,
          focusSeconds: existingRecord.focusSeconds + settings.workDuration * 60,
        };

        const newStreak = calculateStreakFromHistory(updatedHistory, todayKey);

        return {
          ...prev,
          completedPomodoros: nextCompleted,
          currentIntervalIndex: nextIntervalIndex,
          dopaminePoints: prev.dopaminePoints + 25,
          dailyStreak: newStreak,
          history: updatedHistory,
          lastActiveDate: todayKey,
        };
      });
    } else {
      setMode('work');
      setTimeLeft(getDurationForMode('work'));
      setIsRunning(settings.autoStartWork);
    }
  }, [mode, settings, getDurationForMode]);

  // Main countdown timer ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            transitionToNextMode();
            return 0;
          }
          if (mode === 'work') {
            setStats((s) => ({ ...s, totalFocusSeconds: s.totalFocusSeconds + 1 }));
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode, transitionToNextMode]);

  // Switch modes
  const handleSelectMode = (newMode: TimerMode) => {
    soundManager.playClick();
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getDurationForMode(newMode));
  };

  const handleToggleTimer = () => {
    soundManager.playClick();
    setIsRunning((prev) => !prev);
  };

  const handleResetTimer = () => {
    soundManager.playClick();
    setIsRunning(false);
    setTimeLeft(getDurationForMode(mode));
  };

  const handleSkipTimer = () => {
    soundManager.playClick();
    setIsRunning(false);
    if (mode === 'work') {
      const reachedLongBreak = stats.currentIntervalIndex >= settings.longBreakInterval;
      const nextMode: TimerMode = reachedLongBreak ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      setTimeLeft(getDurationForMode(nextMode));
      setStats((prev) => ({
        ...prev,
        currentIntervalIndex: reachedLongBreak ? 1 : prev.currentIntervalIndex + 1,
      }));
    } else {
      setMode('work');
      setTimeLeft(getDurationForMode('work'));
    }
  };

  const handleFastForwardMinute = (deltaMinutes: number) => {
    soundManager.playClick();
    setTimeLeft((prev) => Math.max(1, prev + deltaMinutes * 60));
  };

  const handleSaveSettings = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    if (!isRunning) {
      setTimeLeft(getDurationForMode(mode, newSettings));
    }
  };

  const handleToggleTheme = () => {
    soundManager.playClick();
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleSound = () => {
    setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const handleResetStats = () => {
    const todayKey = getTodayKey();
    setStats((prev) => ({
      completedPomodoros: 0,
      currentIntervalIndex: 1,
      totalFocusSeconds: 0,
      dopaminePoints: 20,
      tasksCompleted: 0,
      dailyStreak: 0,
      history: prev.history,
      lastActiveDate: todayKey,
    }));
  };

  // Ambient sound selection
  const handleSelectNoise = (noise: AmbientNoiseType) => {
    setSettings((prev) => ({ ...prev, ambientNoise: noise }));
    soundManager.setAmbientNoise(noise, settings.ambientVolume);
  };

  const handleChangeAmbientVolume = (vol: number) => {
    setSettings((prev) => ({ ...prev, ambientVolume: vol }));
    soundManager.updateAmbientVolume(vol);
  };

  // Micro-step check
  const handleToggleMicroStep = (stepId: string) => {
    if (!activeTask) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === activeTask.id) {
          const updated = t.microSteps.map((s) =>
            s.id === stepId ? { ...s, completed: !s.completed } : s
          );
          return { ...t, microSteps: updated };
        }
        return t;
      })
    );
    // Award +10 Dopamine XP
    setStats((s) => ({ ...s, dopaminePoints: s.dopaminePoints + 10 }));
  };

  // Task completion
  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: true, completedAt: Date.now() } : t))
    );
    setStats((s) => ({
      ...s,
      dopaminePoints: s.dopaminePoints + 50,
      tasksCompleted: s.tasksCompleted + 1,
    }));
    // Pick the next available unfinished task
    const nextTask = tasks.find((t) => t.id !== taskId && !t.completed);
    setActiveTaskId(nextTask ? nextTask.id : null);
  };

  // Quick task creation
  const handleCreateQuickTask = (title: string) => {
    soundManager.playClick();
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title,
      microSteps: [],
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setActiveTaskId(newTask.id);
  };

  // Save micro-steps from modal
  const handleSaveMicroSteps = (taskId: string, steps: MicroStep[]) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, microSteps: steps } : t))
    );
  };

  // Distraction Parking Lot operations
  const handleAddParkingLotItem = (content: string) => {
    const newItem: ParkingLotItem = {
      id: `park-${Date.now()}`,
      content,
      createdAt: Date.now(),
    };
    setParkingLot((prev) => [newItem, ...prev]);
  };

  const handleDeleteParkingLotItem = (id: string) => {
    setParkingLot((prev) => prev.filter((i) => i.id !== id));
  };

  const handlePromoteParkingLotToTask = (item: ParkingLotItem) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: item.content,
      microSteps: [],
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setActiveTaskId(newTask.id);
    handleDeleteParkingLotItem(item.id);
    setIsParkingLotOpen(false);
  };

  // Task queue operations
  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeTaskId === id) {
      const remaining = tasks.filter((t) => t.id !== id && !t.completed);
      setActiveTaskId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleClearCompletedTasks = () => {
    soundManager.playClick();
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsRunning((prev) => !prev);
      } else if (e.code === 'KeyP') {
        e.preventDefault();
        setIsParkingLotOpen((prev) => !prev);
      } else if (e.code === 'KeyB') {
        e.preventDefault();
        if (activeTask) setIsBreakdownOpen(true);
      } else if (e.code === 'KeyQ') {
        e.preventDefault();
        setIsTaskQueueOpen((prev) => !prev);
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        setIsRunning(false);
        setTimeLeft(getDurationForMode(mode));
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        handleSkipTimer();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handleToggleSound();
      } else if (e.code === 'KeyD') {
        e.preventDefault();
        handleToggleTheme();
      } else if (e.code === 'KeyI') {
        e.preventDefault();
        setIsInsightsOpen((prev) => !prev);
      } else if (e.code === 'Escape') {
        setIsSettingsOpen(false);
        setIsShortcutsOpen(false);
        setIsBreakdownOpen(false);
        setIsParkingLotOpen(false);
        setIsTaskQueueOpen(false);
        setIsInsightsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, activeTask, getDurationForMode]);

  const isDark = theme === 'dark';

  return (
    <div
      id="pomodoro-app-root"
      className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
        isDark
          ? 'bg-zinc-950 text-zinc-100 selection:bg-rose-500/30'
          : 'bg-zinc-50 text-zinc-900 selection:bg-rose-500/20'
      }`}
    >
      {/* Top Header */}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenInsights={() => setIsInsightsOpen(true)}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenParkingLot={() => setIsParkingLotOpen(true)}
        parkingLotCount={parkingLot.length}
        dopaminePoints={stats.dopaminePoints}
      />

      {/* Main Single-Screen ADHD Focus Canvas */}
      <main className="w-full max-w-xl mx-auto px-4 flex-1 flex flex-col items-center justify-center py-2 space-y-4">
        {/* Ambient Brown/Pink Noise & Focus Audio Generator */}
        <AmbientNoiseControl
          currentNoise={settings.ambientNoise}
          volume={settings.ambientVolume}
          theme={theme}
          onSelectNoise={handleSelectNoise}
          onChangeVolume={handleChangeAmbientVolume}
        />

        {/* Mode Selector (Focus, Short Rest, Long Rest) */}
        <ModeSelector
          mode={mode}
          onSelectMode={handleSelectMode}
          workDuration={settings.workDuration}
          shortBreakDuration={settings.shortBreakDuration}
          longBreakDuration={settings.longBreakDuration}
          theme={theme}
          isRunning={isRunning}
        />

        {/* Circular Progress Ring & Countdown Display */}
        <TimerDisplay
          mode={mode}
          timeLeft={timeLeft}
          totalDuration={currentTotalDuration}
          isRunning={isRunning}
          theme={theme}
          currentIntervalIndex={stats.currentIntervalIndex}
          totalIntervals={settings.longBreakInterval}
          currentTask={currentTaskObjective}
          onChangeTask={setCurrentTaskObjective}
          onFastForwardMinute={handleFastForwardMinute}
        />

        {/* Action Controls: Start/Pause, Reset, Skip */}
        <Controls
          isRunning={isRunning}
          onToggle={handleToggleTimer}
          onReset={handleResetTimer}
          onSkip={handleSkipTimer}
          mode={mode}
          theme={theme}
        />

        {/* Single-Task Focus Card with Next Micro-Step & Breakdown Tool */}
        <ActiveTaskCard
          task={activeTask}
          theme={theme}
          onOpenTaskBreakdown={() => setIsBreakdownOpen(true)}
          onOpenTaskQueue={() => setIsTaskQueueOpen(true)}
          onToggleMicroStep={handleToggleMicroStep}
          onCompleteTask={handleCompleteTask}
          onCreateQuickTask={handleCreateQuickTask}
        />

        {/* Dopamine Stats & Clean Slate Bar */}
        <StatsBar
          stats={stats}
          theme={theme}
          onResetStats={handleResetStats}
          onOpenInsights={() => setIsInsightsOpen(true)}
        />
      </main>

      {/* Subtle Footer info */}
      <footer className="w-full text-center py-3 text-xs select-none">
        <span className={isDark ? 'text-zinc-600' : 'text-zinc-400'}>
          Press <kbd className="font-mono-numbers px-1 py-0.5 rounded border border-zinc-700/40">Space</kbd> Start/Pause · <kbd className="font-mono-numbers px-1 py-0.5 rounded border border-zinc-700/40">P</kbd> Brain Dump · <kbd className="font-mono-numbers px-1 py-0.5 rounded border border-zinc-700/40">B</kbd> Break Down · <kbd className="font-mono-numbers px-1 py-0.5 rounded border border-zinc-700/40">I</kbd> Insights
        </span>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        theme={theme}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        theme={theme}
      />

      {/* Weekly Insights Modal */}
      <WeeklyInsightsModal
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
        stats={stats}
        theme={theme}
      />

      {/* Task Micro-Stepping Deconstructor Modal */}
      <TaskBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        task={activeTask}
        onSaveMicroSteps={handleSaveMicroSteps}
        theme={theme}
      />

      {/* Thought Parking Lot (Brain Dump) Drawer */}
      <ParkingLotDrawer
        isOpen={isParkingLotOpen}
        onClose={() => setIsParkingLotOpen(false)}
        items={parkingLot}
        onAddItem={handleAddParkingLotItem}
        onDeleteItem={handleDeleteParkingLotItem}
        onPromoteToTask={handlePromoteParkingLotToTask}
        theme={theme}
      />

      {/* Task Queue Drawer */}
      <TaskQueueDrawer
        isOpen={isTaskQueueOpen}
        onClose={() => setIsTaskQueueOpen(false)}
        tasks={tasks}
        activeTaskId={activeTask ? activeTask.id : null}
        onSelectActiveTask={(id) => setActiveTaskId(id)}
        onAddTask={handleCreateQuickTask}
        onDeleteTask={handleDeleteTask}
        onClearCompleted={handleClearCompletedTasks}
        theme={theme}
      />
    </div>
  );
}
