import React, { useState } from 'react';
import { ParkingLotItem, ThemeMode } from '../types';
import { X, Send, Brain, ArrowUpRight, Trash2, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface ParkingLotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: ParkingLotItem[];
  onAddItem: (content: string) => void;
  onDeleteItem: (id: string) => void;
  onPromoteToTask: (item: ParkingLotItem) => void;
  theme: ThemeMode;
}

export const ParkingLotDrawer: React.FC<ParkingLotDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onAddItem,
  onDeleteItem,
  onPromoteToTask,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    soundManager.playClick();
    onAddItem(input.trim());
    setInput('');
  };

  return (
    <div
      id="parking-lot-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="parking-lot-container"
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden max-h-[85vh] flex flex-col ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? 'border-zinc-800 bg-zinc-900/80' : 'border-zinc-100 bg-zinc-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Thought Parking Lot</h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Park distracting thoughts so you don&apos;t lose focus
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-4 border-b border-zinc-800/80 flex gap-2">
          <input
            id="park-thought-input"
            type="text"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Offload a random thought / idea..."
            className={`flex-1 px-3.5 py-2 rounded-xl border text-xs outline-none ${
              isDark
                ? 'bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-purple-400'
                : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:border-purple-500'
            }`}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Park</span>
          </button>
        </form>

        {/* List of parked thoughts */}
        <div className="overflow-y-auto px-4 py-3 space-y-2 flex-1">
          {items.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 space-y-1">
              <CheckCircle2 className="w-6 h-6 mx-auto text-zinc-600 mb-1" />
              <div>Your mental parking lot is clear!</div>
              <div className="text-[11px] text-zinc-600">
                Whenever a random task or worry pops into your head, dump it here.
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                  isDark ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <span className="text-xs leading-relaxed text-zinc-200 flex-1">
                  {item.content}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      onPromoteToTask(item);
                    }}
                    title="Turn into a focus task"
                    className="p-1.5 rounded-lg text-purple-400 hover:bg-purple-500/10 transition-colors"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      onDeleteItem(item.id);
                    }}
                    title="Dismiss"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div
          className={`px-6 py-3 border-t text-[11px] text-center ${
            isDark ? 'border-zinc-800 bg-zinc-900/60 text-zinc-500' : 'border-zinc-100 bg-zinc-50 text-zinc-400'
          }`}
        >
          Parked thoughts don&apos;t distract you. Review them after your focus session!
        </div>
      </div>
    </div>
  );
};
