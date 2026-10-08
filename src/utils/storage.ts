import { TimerSettings, TimerStats, ThemeMode, IntervalPreset, TaskItem, ParkingLotItem } from '../types';

export const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  soundEnabled: true,
  soundVolume: 0.75,
  soundType: 'gentle-bell',
  ambientNoise: 'off',
  ambientVolume: 0.45,
};

export const PRESETS: IntervalPreset[] = [
  {
    id: 'adhd-kickstart',
    name: '5-Min Kickstart',
    badge: 'ADHD Trick',
    description: '5m sprint · 2m rest (Overcomes task paralysis)',
    work: 5,
    shortBreak: 2,
    longBreak: 5,
    interval: 3,
  },
  {
    id: 'quick-sprint',
    name: '15-Min Sprint',
    badge: 'Short Burst',
    description: '15m work · 3m rest (For low energy days)',
    work: 15,
    shortBreak: 3,
    longBreak: 10,
    interval: 4,
  },
  {
    id: 'classic',
    name: '25-Min Classic',
    badge: 'Standard',
    description: '25m work · 5m rest · 15m long rest',
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    interval: 4,
  },
  {
    id: 'deep-flow',
    name: '45-Min Hyperfocus',
    badge: 'Flow State',
    description: '45m work · 10m rest · 20m long rest',
    work: 45,
    shortBreak: 10,
    longBreak: 20,
    interval: 3,
  },
];

const SETTINGS_KEY = 'adhd_pomodoro_settings_v2';
const THEME_KEY = 'adhd_pomodoro_theme_v2';
const STATS_KEY = 'adhd_pomodoro_stats_v2';
const TASKS_KEY = 'adhd_pomodoro_tasks_v2';
const ACTIVE_TASK_KEY = 'adhd_pomodoro_active_task_v2';
const PARKING_LOT_KEY = 'adhd_pomodoro_parking_lot_v2';

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'init-task-1',
    title: 'Respond to urgent email / message',
    completed: false,
    createdAt: Date.now() - 3600000,
    microSteps: [
      { id: 'ms-1', title: 'Open email client or app', completed: true },
      { id: 'ms-2', title: 'Read the message through just once', completed: false },
      { id: 'ms-3', title: 'Draft 2 brief bullet points of reply', completed: false },
      { id: 'ms-4', title: 'Proofread quickly and press Send', completed: false },
    ],
  },
  {
    id: 'init-task-2',
    title: 'Clear workspace clutter (5 min reset)',
    completed: false,
    createdAt: Date.now() - 1800000,
    microSteps: [
      { id: 'ms-21', title: 'Pick up 3 dirty mugs/glasses to the sink', completed: false },
      { id: 'ms-22', title: 'Throw away any trash/scraps on the desk', completed: false },
      { id: 'ms-23', title: 'Fill a fresh glass of cold water', completed: false },
    ],
  },
];

export const INITIAL_PARKING_LOT: ParkingLotItem[] = [
  {
    id: 'park-1',
    content: 'Check laundry in 2 hours',
    createdAt: Date.now() - 1200000,
  },
];

export function loadSettings(): TimerSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: TimerSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // default to calm dark interface
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme: ThemeMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}

export function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate realistic initial 7-day history so new users have visual momentum
export function getInitialHistory(todayKey: string): Record<string, import('../types').DailyStatRecord> {
  const history: Record<string, import('../types').DailyStatRecord> = {};
  const today = new Date();
  
  // Sample realistic past day patterns: 3 pomodoros, 4 pomodoros, rest day, 5 pomodoros etc.
  const sampleData = [
    { daysAgo: 6, pomodoros: 3, dopamine: 120, mins: 75, tasks: 2 },
    { daysAgo: 5, pomodoros: 4, dopamine: 160, mins: 100, tasks: 3 },
    { daysAgo: 4, pomodoros: 2, dopamine: 80, mins: 50, tasks: 1 },
    { daysAgo: 3, pomodoros: 5, dopamine: 210, mins: 125, tasks: 4 },
    { daysAgo: 2, pomodoros: 1, dopamine: 50, mins: 25, tasks: 1 },
    { daysAgo: 1, pomodoros: 4, dopamine: 180, mins: 100, tasks: 3 },
  ];

  sampleData.forEach(({ daysAgo, pomodoros, dopamine, mins, tasks }) => {
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const k = `${y}-${m}-${day}`;
    history[k] = {
      date: k,
      completedPomodoros: pomodoros,
      dopaminePoints: dopamine,
      focusSeconds: mins * 60,
      tasksCompleted: tasks,
    };
  });

  // Today
  history[todayKey] = {
    date: todayKey,
    completedPomodoros: 2,
    dopaminePoints: 60,
    focusSeconds: 3000,
    tasksCompleted: 1,
  };

  return history;
}

// Calculate daily streak from history ending at todayKey or yesterday
export function calculateStreakFromHistory(history: Record<string, import('../types').DailyStatRecord>, todayKey: string): number {
  let streak = 0;
  const today = new Date();
  
  // Check if today has at least 1 completed pomodoro
  const todayRecord = history[todayKey];
  const completedToday = todayRecord && todayRecord.completedPomodoros > 0;
  
  if (completedToday) {
    streak = 1;
  }

  // Count backwards day by day
  let dayOffset = completedToday ? 1 : 1;
  while (true) {
    const d = new Date(today);
    d.setDate(today.getDate() - dayOffset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${day}`;
    
    const dayRecord = history[key];
    if (dayRecord && dayRecord.completedPomodoros > 0) {
      streak += 1;
      dayOffset += 1;
    } else {
      break;
    }
  }

  return streak;
}

export function loadStats(): TimerStats {
  const todayKey = getTodayKey();
  const initialHistory = getInitialHistory(todayKey);
  const initialStreak = calculateStreakFromHistory(initialHistory, todayKey);

  const initial: TimerStats = {
    completedPomodoros: 2,
    currentIntervalIndex: 3,
    totalFocusSeconds: 3000,
    dopaminePoints: 60, // starter encouragement points
    tasksCompleted: 1,
    dailyStreak: initialStreak,
    history: initialHistory,
    lastActiveDate: todayKey,
  };
  if (typeof window === 'undefined') return initial;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw);
    const merged: TimerStats = { ...initial, ...parsed };

    // Ensure history exists
    if (!merged.history || Object.keys(merged.history).length === 0) {
      merged.history = getInitialHistory(todayKey);
    }

    // Ensure today's record exists in history
    if (!merged.history[todayKey]) {
      merged.history[todayKey] = {
        date: todayKey,
        completedPomodoros: merged.completedPomodoros,
        dopaminePoints: merged.dopaminePoints,
        focusSeconds: merged.totalFocusSeconds,
        tasksCompleted: merged.tasksCompleted,
      };
    }

    // Calculate streak accurately from history
    merged.dailyStreak = calculateStreakFromHistory(merged.history, todayKey);

    return merged;
  } catch {
    return initial;
  }
}

export function saveStats(stats: TimerStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function loadTasks(): TaskItem[] {
  if (typeof window === 'undefined') return INITIAL_TASKS;
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return INITIAL_TASKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TASKS;
  } catch {
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: TaskItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // ignore
  }
}

export function loadActiveTaskId(): string | null {
  if (typeof window === 'undefined') return 'init-task-1';
  try {
    return localStorage.getItem(ACTIVE_TASK_KEY) || 'init-task-1';
  } catch {
    return 'init-task-1';
  }
}

export function saveActiveTaskId(id: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (id) {
      localStorage.setItem(ACTIVE_TASK_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_TASK_KEY);
    }
  } catch {
    // ignore
  }
}

export function loadParkingLot(): ParkingLotItem[] {
  if (typeof window === 'undefined') return INITIAL_PARKING_LOT;
  try {
    const raw = localStorage.getItem(PARKING_LOT_KEY);
    if (!raw) return INITIAL_PARKING_LOT;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_PARKING_LOT;
  } catch {
    return INITIAL_PARKING_LOT;
  }
}

export function saveParkingLot(items: ParkingLotItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PARKING_LOT_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}
