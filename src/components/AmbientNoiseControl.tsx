import React, { useRef } from 'react';
import { AmbientNoiseType, ThemeMode } from '../types';
import {
  Waves,
  CloudRain,
  Clock,
  Volume2,
  VolumeX,
  Sparkles,
  Wind,
  Droplets,
  Coffee,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface AmbientNoiseControlProps {
  currentNoise: AmbientNoiseType;
  volume: number;
  theme: ThemeMode;
  onSelectNoise: (noise: AmbientNoiseType) => void;
  onChangeVolume: (volume: number) => void;
}

export const AmbientNoiseControl: React.FC<AmbientNoiseControlProps> = ({
  currentNoise,
  volume,
  theme,
  onSelectNoise,
  onChangeVolume,
}) => {
  const isDark = theme === 'dark';
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const noiseOptions: Array<{
    id: AmbientNoiseType;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      id: 'off',
      label: 'Off',
      description: 'Mute background soundscape',
      icon: <VolumeX className="w-3.5 h-3.5" />,
      color: isDark ? 'text-zinc-400' : 'text-zinc-500',
    },
    {
      id: 'brown',
      label: 'Brown Noise',
      description: 'ADHD favorite: deep rumble to quiet mental chatter',
      icon: <Waves className="w-3.5 h-3.5" />,
      color: 'text-amber-400',
    },
    {
      id: 'pink',
      label: 'Pink Noise',
      description: 'Soft balanced waterfall spectrum',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      color: 'text-rose-400',
    },
    {
      id: 'white',
      label: 'White Noise',
      description: 'Crisp uniform static to mask distracting conversations',
      icon: <Wind className="w-3.5 h-3.5" />,
      color: 'text-zinc-300',
    },
    {
      id: 'rain',
      label: 'Gentle Rain',
      description: 'Natural soothing rainfall ambiance',
      icon: <CloudRain className="w-3.5 h-3.5" />,
      color: 'text-sky-400',
    },
    {
      id: 'stream',
      label: 'Forest Stream',
      description: 'Rippling brook water to sustain gentle executive momentum',
      icon: <Droplets className="w-3.5 h-3.5" />,
      color: 'text-cyan-400',
    },
    {
      id: 'cafe',
      label: 'Coffee Shop',
      description: 'Cozy background room warmth & soft espresso bar presence',
      icon: <Coffee className="w-3.5 h-3.5" />,
      color: 'text-orange-400',
    },
    {
      id: 'tick',
      label: 'Pacing Tick',
      description: 'Gentle 1-sec heartbeat metronome to anchor ADHD time blindness',
      icon: <Clock className="w-3.5 h-3.5" />,
      color: 'text-emerald-400',
    },
  ];

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -180, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 180, behavior: 'smooth' });
    }
  };

  return (
    <div
      id="ambient-noise-bar"
      className={`w-full max-w-xl mx-auto p-2.5 sm:p-3 rounded-2xl border transition-colors ${
        isDark
          ? 'bg-zinc-900/70 border-zinc-800/80 shadow-inner'
          : 'bg-zinc-100/90 border-zinc-200/80'
      }`}
    >
      <div className="flex flex-col gap-2">
        {/* Top bar with Label, Arrow Scroll buttons, and Volume if active */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`}
            >
              Focus Sounds
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-600'
              }`}
            >
              {noiseOptions.length - 1} options
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Scroll navigation arrows for fast browsing */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleScrollLeft}
                aria-label="Scroll focus sounds left"
                title="Scroll left"
                className={`p-1 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    : 'hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleScrollRight}
                aria-label="Scroll focus sounds right"
                title="Scroll right"
                className={`p-1 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    : 'hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Volume slider when active */}
            {currentNoise !== 'off' && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-700/50">
                <Volume2 className={`w-3.5 h-3.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                <input
                  type="range"
                  min={0.05}
                  max={1.0}
                  step={0.05}
                  value={volume}
                  onChange={(e) => onChangeVolume(Number(e.target.value))}
                  aria-label="Ambient noise volume"
                  className="w-16 sm:w-20 accent-amber-500 h-1 bg-zinc-700 rounded-lg cursor-pointer"
                />
                <span
                  className={`text-[10px] font-mono-numbers w-6 text-right ${
                    isDark ? 'text-zinc-400' : 'text-zinc-500'
                  }`}
                >
                  {Math.round(volume * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ambient Selector Pills with custom visible scroll bar */}
        <div
          ref={scrollContainerRef}
          tabIndex={0}
          aria-label="Focus sounds list"
          className="focus-sounds-scroll flex items-center gap-1.5 pb-2 pt-0.5 outline-hidden"
        >
          {noiseOptions.map((opt) => {
            const isActive = currentNoise === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onSelectNoise(opt.id);
                }}
                title={opt.description}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
                  isActive
                    ? isDark
                      ? 'bg-zinc-800 text-zinc-100 shadow-xs border border-zinc-700 ring-1 ring-amber-500/30'
                      : 'bg-white text-zinc-900 shadow-xs border border-zinc-300 ring-1 ring-amber-500/40'
                    : isDark
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 border border-transparent'
                }`}
              >
                <span className={opt.color}>{opt.icon}</span>
                <span>{opt.label}</span>
                {isActive && currentNoise !== 'off' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
