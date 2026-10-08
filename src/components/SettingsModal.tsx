import React, { useState } from 'react';
import { X, Volume2, Sparkles, Sliders, BellRing, Play } from 'lucide-react';
import { TimerSettings, SoundType, ThemeMode } from '../types';
import { PRESETS, DEFAULT_SETTINGS } from '../utils/storage';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TimerSettings;
  onSaveSettings: (newSettings: TimerSettings) => void;
  theme: ThemeMode;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  theme,
}) => {
  const isDark = theme === 'dark';

  const [form, setForm] = useState<TimerSettings>({ ...settings });

  if (!isOpen) return null;

  const handleApplyPreset = (work: number, shortBreak: number, longBreak: number, interval: number) => {
    setForm((prev) => ({
      ...prev,
      workDuration: work,
      shortBreakDuration: shortBreak,
      longBreakDuration: longBreak,
      longBreakInterval: interval,
    }));
  };

  const handleTestSound = () => {
    soundManager.playNotification(form.soundType, form.soundVolume);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    onClose();
  };

  const handleResetDefaults = () => {
    setForm({ ...DEFAULT_SETTINGS });
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        id="settings-modal-container"
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all max-h-[90vh] flex flex-col ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? 'border-zinc-800 bg-zinc-900/80' : 'border-zinc-100 bg-zinc-50/80'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-zinc-800 text-rose-400' : 'bg-rose-100 text-rose-600'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Timer Settings</h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Customize work and break intervals
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto px-6 py-5 space-y-6 flex-1">
          {/* Quick Presets Section */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Interval Presets
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => {
                const isSelected =
                  form.workDuration === p.work &&
                  form.shortBreakDuration === p.shortBreak &&
                  form.longBreakDuration === p.longBreak &&
                  form.longBreakInterval === p.interval;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPreset(p.work, p.shortBreak, p.longBreak, p.interval)}
                    className={`p-2.5 text-left rounded-xl border transition-all text-xs ${
                      isSelected
                        ? isDark
                          ? 'border-rose-500 bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/40'
                          : 'border-rose-500 bg-rose-50 text-rose-800 ring-1 ring-rose-300'
                        : isDark
                        ? 'border-zinc-800 bg-zinc-800/40 text-zinc-300 hover:bg-zinc-800'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="font-semibold">{p.name}</div>
                    <div className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {p.work}m / {p.shortBreak}m / {p.longBreak}m
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customizable Intervals */}
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Custom Interval Durations (Minutes)
            </span>

            {/* Work Duration */}
            <div
              className={`p-3.5 rounded-2xl border transition-colors ${
                isDark ? 'bg-zinc-800/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="work-duration-input" className="text-sm font-medium flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  Work / Focus Duration
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    id="work-duration-input"
                    type="number"
                    min={1}
                    max={120}
                    value={form.workDuration}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        workDuration: Math.max(1, Math.min(120, parseInt(e.target.value) || 1)),
                      })
                    }
                    className={`w-16 px-2 py-1 text-center font-mono-numbers text-sm font-bold rounded-lg border outline-none ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                        : 'bg-white border-zinc-300 text-zinc-900'
                    }`}
                  />
                  <span className="text-xs text-zinc-500">min</span>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={90}
                step={1}
                value={form.workDuration}
                onChange={(e) => setForm({ ...form, workDuration: Number(e.target.value) })}
                className="w-full accent-rose-500 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Short Break Duration */}
            <div
              className={`p-3.5 rounded-2xl border transition-colors ${
                isDark ? 'bg-zinc-800/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="short-break-input" className="text-sm font-medium flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Short Break Duration
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    id="short-break-input"
                    type="number"
                    min={1}
                    max={45}
                    value={form.shortBreakDuration}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        shortBreakDuration: Math.max(1, Math.min(45, parseInt(e.target.value) || 1)),
                      })
                    }
                    className={`w-16 px-2 py-1 text-center font-mono-numbers text-sm font-bold rounded-lg border outline-none ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                        : 'bg-white border-zinc-300 text-zinc-900'
                    }`}
                  />
                  <span className="text-xs text-zinc-500">min</span>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={form.shortBreakDuration}
                onChange={(e) => setForm({ ...form, shortBreakDuration: Number(e.target.value) })}
                className="w-full accent-emerald-500 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Long Break Duration */}
            <div
              className={`p-3.5 rounded-2xl border transition-colors ${
                isDark ? 'bg-zinc-800/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="long-break-input" className="text-sm font-medium flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                  Long Break Duration
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    id="long-break-input"
                    type="number"
                    min={1}
                    max={60}
                    value={form.longBreakDuration}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        longBreakDuration: Math.max(1, Math.min(60, parseInt(e.target.value) || 1)),
                      })
                    }
                    className={`w-16 px-2 py-1 text-center font-mono-numbers text-sm font-bold rounded-lg border outline-none ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                        : 'bg-white border-zinc-300 text-zinc-900'
                    }`}
                  />
                  <span className="text-xs text-zinc-500">min</span>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={45}
                step={1}
                value={form.longBreakDuration}
                onChange={(e) => setForm({ ...form, longBreakDuration: Number(e.target.value) })}
                className="w-full accent-sky-500 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Long Break Interval Cycles */}
            <div
              className={`p-3.5 rounded-2xl border transition-colors ${
                isDark ? 'bg-zinc-800/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Long Break Interval</div>
                  <div className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Number of focus sessions before taking a long break
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setForm({ ...form, longBreakInterval: num })}
                      className={`w-8 h-8 rounded-lg text-xs font-bold font-mono-numbers transition-colors ${
                        form.longBreakInterval === num
                          ? isDark
                            ? 'bg-rose-500 text-white'
                            : 'bg-rose-600 text-white'
                          : isDark
                          ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Automation Toggles */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Automation
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                  isDark ? 'bg-zinc-800/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <span className="text-xs font-medium">Auto-start Breaks</span>
                <input
                  type="checkbox"
                  checked={form.autoStartBreaks}
                  onChange={(e) => setForm({ ...form, autoStartBreaks: e.target.checked })}
                  className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                />
              </label>

              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                  isDark ? 'bg-zinc-800/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <span className="text-xs font-medium">Auto-start Work</span>
                <input
                  type="checkbox"
                  checked={form.autoStartWork}
                  onChange={(e) => setForm({ ...form, autoStartWork: e.target.checked })}
                  className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Sound & Notifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Notification Sound
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={form.soundEnabled}
                  onChange={(e) => setForm({ ...form, soundEnabled: e.target.checked })}
                  className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                />
                <span>Enabled</span>
              </label>
            </div>

            {form.soundEnabled && (
              <div
                className={`p-3.5 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-zinc-800/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <select
                    value={form.soundType}
                    onChange={(e) => setForm({ ...form, soundType: e.target.value as SoundType })}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-xl border outline-none font-medium ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-200'
                        : 'bg-white border-zinc-300 text-zinc-800'
                    }`}
                  >
                    <option value="gentle-bell">Gentle Bell Chime</option>
                    <option value="marimba">Marimba Harmony</option>
                    <option value="zen-bowl">Zen Singing Bowl</option>
                    <option value="digital">Crisp Digital Beep</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleTestSound}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      isDark
                        ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-100'
                        : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Test</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-zinc-400 shrink-0" />
                  <input
                    type="range"
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    value={form.soundVolume}
                    onChange={(e) => setForm({ ...form, soundVolume: Number(e.target.value) })}
                    className="w-full accent-rose-500 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-mono-numbers w-8 text-right text-zinc-400">
                    {Math.round(form.soundVolume * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-t ${
            isDark ? 'border-zinc-800 bg-zinc-900/80' : 'border-zinc-100 bg-zinc-50/80'
          }`}
        >
          <button
            type="button"
            onClick={handleResetDefaults}
            className={`text-xs font-medium transition-colors ${
              isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
              }`}
            >
              Cancel
            </button>
            <button
              id="save-settings-btn"
              type="button"
              onClick={handleSave}
              className={`px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 ${
                isDark
                  ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-950/30'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
              }`}
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
