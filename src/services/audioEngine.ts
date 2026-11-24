import { getCharacterById } from '../data/characters';
import { getWorldById } from '../data/worlds';
import type { AudioSettings, CharacterId, WorldId } from '../types/game';

class WonderAudioEngine {
  private ctx: AudioContext | null = null;
  private musicTimer: number | null = null;
  private musicStep = 0;
  private currentWorldId: WorldId = 1;
  private settings: AudioSettings = {
    musicEnabled: true,
    sfxEnabled: true,
    voiceEnabled: true,
    reducedMotion: false,
  };

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public updateSettings(next: AudioSettings): void {
    const prevMusic = this.settings.musicEnabled;
    this.settings = { ...next };
    if (!next.musicEnabled) {
      this.stopMusic();
    } else if (!prevMusic && next.musicEnabled) {
      this.startWorldMusic(this.currentWorldId);
    }
    if (!next.voiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public unlockAudio(): void {
    this.ensureContext();
    if (this.settings.musicEnabled && this.musicTimer === null) {
      this.startWorldMusic(this.currentWorldId);
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.08,
    delay = 0
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  public playTap(): void {
    if (!this.settings.sfxEnabled) return;
    this.playTone(587.33, 0.09, 'triangle', 0.09, 0);
    this.playTone(880, 0.08, 'sine', 0.05, 0.03);
  }

  public playNote(freq: number): void {
    if (!this.settings.sfxEnabled) return;
    this.playTone(freq, 0.28, 'triangle', 0.12, 0);
    this.playTone(freq * 2, 0.18, 'sine', 0.04, 0);
  }

  public playSuccess(): void {
    if (!this.settings.sfxEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.22, 'triangle', 0.1, idx * 0.07);
    });
  }

  public playGentleTryAgain(): void {
    if (!this.settings.sfxEnabled) return;
    // Soft, friendly wooden marimba nudge — never a harsh buzzer
    this.playTone(329.63, 0.14, 'sine', 0.07, 0);
    this.playTone(293.66, 0.18, 'sine', 0.06, 0.09);
  }

  public playLevelComplete(): void {
    if (!this.settings.sfxEnabled) return;
    const melody = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    const times = [0, 0.1, 0.2, 0.32, 0.48, 0.6];
    melody.forEach((n, i) => {
      this.playTone(n, 0.32, 'triangle', 0.11, times[i]);
    });
  }

  public playCharacterVoiceChirp(charId: CharacterId): void {
    if (!this.settings.sfxEnabled) return;
    const baseMap: Record<CharacterId, number> = {
      wobble: 440,
      twinkle: 660,
      bubbles: 520,
      coco: 392,
      pip: 740,
    };
    const base = baseMap[charId] ?? 440;
    this.playTone(base, 0.1, 'sine', 0.08, 0);
    this.playTone(base * 1.25, 0.12, 'triangle', 0.08, 0.08);
  }

  public startWorldMusic(worldId: WorldId): void {
    this.currentWorldId = worldId;
    if (!this.settings.musicEnabled) return;
    this.stopMusic();
    if (typeof window === 'undefined') return;

    const world = getWorldById(worldId);
    const chord = world.ambientChordHz;

    this.musicTimer = window.setInterval(() => {
      if (!this.settings.musicEnabled || !this.ctx || this.ctx.state !== 'running') return;
      const pattern = [0, 1, 2, 3, 2, 1, 0, 2];
      const idx = pattern[this.musicStep % pattern.length];
      const note = chord[idx % chord.length];
      this.playTone(note, 0.55, 'sine', 0.025, 0);
      if (this.musicStep % 4 === 0) {
        this.playTone(chord[0] * 0.5, 0.9, 'triangle', 0.02, 0);
      }
      this.musicStep++;
    }, 680);
  }

  public stopMusic(): void {
    if (this.musicTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  public speakCue(text: string, characterId: CharacterId = 'wobble'): void {
    if (!this.settings.voiceEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      const char = getCharacterById(characterId);
      utter.pitch = char.voicePitch;
      utter.rate = char.voiceRate;
      utter.volume = 0.85;
      const voices = window.speechSynthesis.getVoices();
      const friendlyVoice =
        voices.find((v) => v.lang.startsWith('en') && /natural|samantha|aria|google/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('en'));
      if (friendlyVoice) utter.voice = friendlyVoice;
      window.speechSynthesis.speak(utter);
    } catch {
      // Speech API optional if browser blocks autoplay
    }
  }
}

export const audioEngine = new WonderAudioEngine();
