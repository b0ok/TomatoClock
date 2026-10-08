import { SoundType, AmbientNoiseType } from '../types';

class SoundController {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private tickInterval: number | null = null;
  private currentAmbientType: AmbientNoiseType = 'off';

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // --- Ambient Noise Generation (Brown, Pink, Rain, Tick) ---

  public setAmbientNoise(type: AmbientNoiseType, volume: number = 0.5) {
    this.currentAmbientType = type;
    this.stopAmbientNoise();

    if (type === 'off' || volume <= 0) {
      return;
    }

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const clampedVol = Math.max(0, Math.min(1, volume));

      if (type === 'tick') {
        // Soft focus metronome (1 tick every second)
        this.startMetronome(clampedVol);
        return;
      }

      const sampleRate = ctx.sampleRate;
      const bufferLength = sampleRate * 4; // 4 seconds looped buffer
      const buffer = ctx.createBuffer(2, bufferLength, sampleRate);

      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      if (type === 'brown') {
        // Brownian noise (integration of white noise)
        let lastLeft = 0;
        let lastRight = 0;
        for (let i = 0; i < bufferLength; i++) {
          const whiteL = Math.random() * 2 - 1;
          const whiteR = Math.random() * 2 - 1;
          lastLeft = (lastLeft + 0.02 * whiteL) / 1.02;
          lastRight = (lastRight + 0.02 * whiteR) / 1.02;
          left[i] = lastLeft * 3.2;
          right[i] = lastRight * 3.2;
        }
      } else if (type === 'pink') {
        // Pink noise (1/f spectral density)
        let b0L = 0, b1L = 0, b2L = 0, b3L = 0, b4L = 0, b5L = 0, b6L = 0;
        let b0R = 0, b1R = 0, b2R = 0, b3R = 0, b4R = 0, b5R = 0, b6R = 0;
        for (let i = 0; i < bufferLength; i++) {
          const whiteL = Math.random() * 2 - 1;
          const whiteR = Math.random() * 2 - 1;

          b0L = 0.99886 * b0L + whiteL * 0.0555179;
          b1L = 0.99332 * b1L + whiteL * 0.0750759;
          b2L = 0.96900 * b2L + whiteL * 0.1538520;
          b3L = 0.86650 * b3L + whiteL * 0.3104856;
          b4L = 0.55000 * b4L + whiteL * 0.5329522;
          b5L = -0.7616 * b5L - whiteL * 0.0168980;
          left[i] = (b0L + b1L + b2L + b3L + b4L + b5L + b6L + whiteL * 0.5362) * 0.12;
          b6L = whiteL * 0.115926;

          b0R = 0.99886 * b0R + whiteR * 0.0555179;
          b1R = 0.99332 * b1R + whiteR * 0.0750759;
          b2R = 0.96900 * b2R + whiteR * 0.1538520;
          b3R = 0.86650 * b3R + whiteR * 0.3104856;
          b4R = 0.55000 * b4R + whiteR * 0.5329522;
          b5R = -0.7616 * b5R - whiteR * 0.0168980;
          right[i] = (b0R + b1R + b2R + b3R + b4R + b5R + b6R + whiteR * 0.5362) * 0.12;
          b6R = whiteR * 0.115926;
        }
      } else if (type === 'white') {
        // Crisp White Noise
        for (let i = 0; i < bufferLength; i++) {
          left[i] = (Math.random() * 2 - 1) * 0.35;
          right[i] = (Math.random() * 2 - 1) * 0.35;
        }
      } else if (type === 'stream') {
        // Forest Stream: gentle filtered gurgles and water flow
        let streamL = 0, streamR = 0;
        for (let i = 0; i < bufferLength; i++) {
          const wL = Math.random() * 2 - 1;
          const wR = Math.random() * 2 - 1;
          streamL = (streamL + 0.05 * wL) / 1.05;
          streamR = (streamR + 0.05 * wR) / 1.05;
          // Soft rhythmic water babble pulsation
          const ripple = Math.sin((i / sampleRate) * 1.8 * Math.PI) * 0.15 + 0.85;
          left[i] = streamL * 2.5 * ripple;
          right[i] = streamR * 2.5 * ripple;
        }
      } else if (type === 'cafe') {
        // Warm Coffee Shop Murmur: warm filtered frequencies with gentle room presence
        let cL = 0, cR = 0;
        for (let i = 0; i < bufferLength; i++) {
          const wL = Math.random() * 2 - 1;
          const wR = Math.random() * 2 - 1;
          cL = (cL + 0.015 * wL) / 1.015;
          cR = (cR + 0.015 * wR) / 1.015;
          const cupClink = Math.random() > 0.9992 ? (Math.random() - 0.5) * 0.18 : 0;
          left[i] = cL * 2.8 + cupClink;
          right[i] = cR * 2.8 + cupClink;
        }
      } else if (type === 'rain') {
        // Rain: Pink noise with soft random water droplet crackles
        let lastL = 0, lastR = 0;
        for (let i = 0; i < bufferLength; i++) {
          const whiteL = Math.random() * 2 - 1;
          const whiteR = Math.random() * 2 - 1;
          lastL = (lastL + 0.03 * whiteL) / 1.03;
          lastR = (lastR + 0.03 * whiteR) / 1.03;
          // occasional droplet
          const dropL = Math.random() > 0.994 ? (Math.random() - 0.5) * 0.25 : 0;
          const dropR = Math.random() > 0.994 ? (Math.random() - 0.5) * 0.25 : 0;
          left[i] = (lastL * 2.2 + dropL);
          right[i] = (lastR * 2.2 + dropR);
        }
      }

      // Smooth loop boundaries
      const fadeSamples = 400;
      for (let i = 0; i < fadeSamples; i++) {
        const factor = i / fadeSamples;
        left[i] *= factor;
        left[bufferLength - 1 - i] *= factor;
        right[i] *= factor;
        right[bufferLength - 1 - i] *= factor;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      if (type === 'brown') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);
      } else if (type === 'pink') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, ctx.currentTime);
      } else if (type === 'white') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3200, ctx.currentTime);
      } else if (type === 'cafe') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, ctx.currentTime);
      } else {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, ctx.currentTime);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(clampedVol * 0.45, ctx.currentTime);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start();
      this.ambientSource = source;
      this.ambientGain = gain;
      this.ambientFilter = filter;
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public updateAmbientVolume(volume: number) {
    if (this.ambientGain && this.ctx) {
      try {
        const clamped = Math.max(0, Math.min(1, volume));
        this.ambientGain.gain.setValueAtTime(clamped * 0.45, this.ctx.currentTime);
      } catch {
        // ignore
      }
    }
  }

  private startMetronome(vol: number) {
    if (this.tickInterval) clearInterval(this.tickInterval);
    const playTick = () => {
      try {
        const ctx = this.getContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.02);

        gain.gain.setValueAtTime(vol * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.025);
      } catch {
        // ignore
      }
    };
    playTick();
    this.tickInterval = window.setInterval(playTick, 1000);
  }

  public stopAmbientNoise() {
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
        this.ambientSource.disconnect();
      } catch {
        // ignore
      }
      this.ambientSource = null;
    }
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
    if (this.ambientFilter) {
      this.ambientFilter.disconnect();
      this.ambientFilter = null;
    }
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  // --- Dopamine & Feedback SFX ---

  /** Celebratory fanfare on task / big session completion */
  public playCelebration(volume: number = 0.7) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume * 0.6, now);
      masterGain.connect(ctx.destination);

      // C major arpeggio / celebratory fanfare: C5, E5, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.3, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.6);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.65);
      });
    } catch {
      // ignore
    }
  }

  /** Tactile bubble pop when checking off a micro-step */
  public playCheck(volume: number = 0.6) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

      gain.gain.setValueAtTime(volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // ignore
    }
  }

  /** Dopamine sparkles / streak point audio */
  public playDopamineSparkle(volume: number = 0.5) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);

        gain.gain.setValueAtTime(volume * 0.2, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.4);
      });
    } catch {
      // ignore
    }
  }

  public playNotification(type: SoundType = 'gentle-bell', volume: number = 0.8) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), now);
      masterGain.connect(ctx.destination);

      if (type === 'gentle-bell') {
        const freqs = [587.33, 880.0, 1174.66, 1760.0];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);

          gain.gain.setValueAtTime(0, now + i * 0.08);
          gain.gain.linearRampToValueAtTime(0.25 / (i + 1), now + i * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 1.8);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 2.0);
        });
      } else if (type === 'marimba') {
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);

          gain.gain.setValueAtTime(0.3, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.6);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.7);
        });
      } else if (type === 'zen-bowl') {
        const fundamental = 261.63;
        const partials = [1, 2.76, 5.4, 8.9];
        partials.forEach((mult, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(fundamental * mult, now);

          gain.gain.setValueAtTime(0.3 / (i + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 3.2);
        });
      } else {
        const freqs = [880, 1174.66];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0.2, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.2);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.25);
        });
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public playClick(volume: number = 0.2) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

      gain.gain.setValueAtTime(volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Ignore click audio error
    }
  }
}

export const soundManager = new SoundController();
