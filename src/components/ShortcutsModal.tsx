import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { ThemeMode } from '../types';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', action: 'Start or pause timer' },
    { key: 'P', action: 'Park thought (Brain Dump)' },
    { key: 'B', action: 'Break down task into micro-steps' },
    { key: 'Q', action: 'Open task queue backlog' },
    { key: 'R', action: 'Reset current interval' },
    { key: 'S', action: 'Skip to next interval' },
    { key: 'M', action: 'Mute / unmute chimes' },
    { key: 'D', action: 'Toggle dark / light theme' },
    { key: 'I', action: 'Open Weekly Insights (7-day stats)' },
    { key: 'Esc', action: 'Close any open dialog' },
  ];

  return (
    <div
      id="shortcuts-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm rounded-3xl border shadow-2xl p-6 transition-all ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold">ADHD Fast Shortcuts</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isDark
                ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between text-xs py-1"
            >
              <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                {item.action}
              </span>
              <kbd
                className={`px-2 py-1 rounded-md font-mono-numbers text-[11px] font-semibold border shadow-xs ${
                  isDark
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                    : 'bg-zinc-100 border-zinc-300 text-zinc-800'
                }`}
              >
                {item.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
