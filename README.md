# 🍅 TomatoClock

> **ADHD-Optimized Productivity & Pomodoro Timer**  
> *Sustain deep focus with sensory soundscapes, micro-step task decomposition, a distraction parking lot, dopamine gamification, and weekly insight analytics.*

---

## 📖 Overview

**TomatoClock** is a modern, sensory-friendly Pomodoro and deep-work companion engineered specifically for neurodivergent minds and focus seekers. Traditional timers often increase cognitive friction with rigid workflows; TomatoClock eliminates overwhelm by pairing customizable focus intervals with real-time synthesized sensory audio, sub-step task decomposition, rapid distraction capture, and rewarding dopamine mechanics.

---

## ✨ Key Features

### 🎧 Procedural Sensory Soundscapes
- **Zero-loop procedural audio** synthesized on-the-fly using the Web Audio API (no repetitive audio loops or abrupt cutoffs).
- **Sound palette**:
  - 🌊 **Brown Noise**: Deep low-frequency warmth that drowns out wandering thoughts.
  - 🌸 **Pink Noise**: Balanced frequencies for calm, steady concentration.
  - 🌧️ **Rain Ambience**: Soft falling drops with randomized water texture.
  - ⏰ **Rhythmic Tick**: Gentle, soothing analog metronome cadence.
  - 💨 **White Noise**: Crisp, broad spectrum masking for noisy environments.
  - 💧 **Rolling Stream**: Organic, flowing water dynamics.
  - ☕ **Café Ambience**: Warm coffee shop chatter and distant acoustic warmth.
- **Enhanced Horizontal Navigation**: Dedicated smooth scrollbar with custom thumb styles and quick left/right arrow scroll controls.
- Independent volume slider and instant master mute toggle.

### 🎯 ADHD-Optimized Workflow
- **Single-Task Spotlight**: Pin a single active task front-and-center to ward off multi-tasking and paralysis.
- **Micro-Step Task Breakdown**: Decompose daunting tasks into bite-sized sub-steps with instant dopamine feedback upon completion.
- **Distraction Parking Lot**: Jot down intrusive thoughts, random ideas, or errands in an off-canvas drawer without leaving your flow state.
- **Task Queue & Planning**: Prioritize upcoming tasks, tag them, and assign estimated Pomodoros.

### 📊 Weekly Insights & Daily Streaks
- **7-Day Trend Visualizations**:
  - Interactive comparative bar charts for Pomodoro sessions completed and Dopamine XP earned across the last 7 days.
  - Daily breakdown records detailing session counts, focus minutes, and daily milestones.
- **Daily Streak Tracker (`🔥 Streak: Xd`)**:
  - Automatically increments every consecutive day with at least one completed Pomodoro session.
  - Visible on the persistent `StatsBar` with theme-adaptive contrast.

### 🎮 Dopamine Gamification & Audio Feedback
- Earn Dopamine XP points for finishing focus intervals, checking off micro-steps, and completing active tasks.
- Celebratory confetti bursts and crisp synthesized chime sound effects upon reaching milestones.

### ⚡ Power User Experience
- **Fluid Themes**: Dark Mode and Light Mode with high-contrast readability.
- **Keyboard Shortcuts**:
  - `Space` — Start / Pause timer
  - `S` — Skip current interval
  - `R` — Reset timer
  - `M` — Mute / Unmute audio
  - `T` — Cycle Light/Dark theme
  - `P` — Open Distraction Parking Lot
  - `Q` — Open Task Queue
  - `?` — View Keyboard Shortcuts Modal
- Responsive layout optimized for desktop and mobile displays.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/) & [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Audio Engine**: Native Web Audio API (`AudioContext`, Biquad Filters, Buffer Sources)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `bun`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/tomatoclock.git
   cd tomatoclock
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Lint / Type Check**:
   ```bash
   npm run lint
   ```

---

## 📁 Project Structure

```
├── public/                 # Static assets and icons
├── src/
│   ├── components/         # Modular UI components
│   │   ├── ActiveTaskCard.tsx        # Active focus task & micro-steps
│   │   ├── AmbientNoiseControl.tsx   # Audio soundscapes & horizontal scroll
│   │   ├── Controls.tsx              # Play, pause, skip, and reset buttons
│   │   ├── Header.tsx                # Branding, quick actions, & insights trigger
│   │   ├── ModeSelector.tsx          # Pomodoro / Short Break / Long Break
│   │   ├── ParkingLotDrawer.tsx      # Distraction capture notepad
│   │   ├── SettingsModal.tsx         # Interval durations & preferences
│   │   ├── ShortcutsModal.tsx        # Keyboard cheat sheet
│   │   ├── StatsBar.tsx              # Focus time, streak, and dopamine counter
│   │   ├── TaskBreakdownModal.tsx    # Sub-step task decomposition
│   │   ├── TaskQueueDrawer.tsx       # Backlog and task management
│   │   ├── TimerDisplay.tsx          # Circular countdown ring & time display
│   │   └── WeeklyInsightsModal.tsx   # 7-day analytics & streak reporting
│   ├── utils/
│   │   ├── audio.ts                  # Synthesized procedural Web Audio engine
│   │   └── storage.ts                # Local storage persistence & streak logic
│   ├── types.ts                      # Shared TypeScript definitions
│   ├── index.css                     # Global styles, fonts, & custom scrollbars
│   ├── App.tsx                       # Main application state & keyboard listeners
│   └── main.tsx                      # React root entry point
├── index.html              # HTML shell & SEO meta tags
├── metadata.json           # Application metadata & description
├── package.json            # Project manifest & scripts
└── tsconfig.json           # TypeScript configuration
```

---

## 🧠 Design Philosophy

1. **Zero Overwhelm**: One primary task visible at a time. No complex project hierarchies or intimidating kanban boards during focus sessions.
2. **Sensory Regulation**: Pure procedural noise masking distractions without loop fatigue.
3. **Frictionless Capture**: Immediate parking of tangential thoughts so the working memory can stay dedicated to the task at hand.
4. **Forgiving Progress**: Gamified dopamine rewards celebrate small wins without penalizing pauses or breaks.

---

## 📄 License

MIT License © 2026 TomatoClock Contributors. Free and open source for all deep workers.
