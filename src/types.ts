export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export type SoundType = 'gentle-bell' | 'marimba' | 'zen-bowl' | 'digital';

export type AmbientNoiseType = 'off' | 'brown' | 'pink' | 'rain' | 'tick' | 'white' | 'stream' | 'cafe';

export interface MicroStep {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  microSteps: MicroStep[];
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}

export interface ParkingLotItem {
  id: string;
  content: string;
  createdAt: number;
}

export interface TimerSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // count of work sessions before long break
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  soundType: SoundType;
  ambientNoise: AmbientNoiseType;
  ambientVolume: number;
}

export interface DailyStatRecord {
  date: string; // YYYY-MM-DD
  completedPomodoros: number;
  dopaminePoints: number;
  focusSeconds: number;
  tasksCompleted: number;
}

export interface TimerStats {
  completedPomodoros: number;
  currentIntervalIndex: number; // 1 to settings.longBreakInterval
  totalFocusSeconds: number;
  dopaminePoints: number;
  tasksCompleted: number;
  dailyStreak: number;
  // Daily history mapping (dateKey: 'YYYY-MM-DD' -> DailyStatRecord)
  history?: Record<string, DailyStatRecord>;
  lastActiveDate?: string; // YYYY-MM-DD to detect new days
}

export type ThemeMode = 'dark' | 'light';

export interface IntervalPreset {
  id: string;
  name: string;
  badge?: string;
  description: string;
  work: number;
  shortBreak: number;
  longBreak: number;
  interval: number;
}

