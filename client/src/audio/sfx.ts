// Procedural Web Audio API Sound Effects & Suspense Atmosphere Engine
// Cero loops de IA generativa: Síntesis analógica minimalista de tensión estilo Film Noir / Burocracia Kafkiana.

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public isMusicEnabled: boolean = true;

  // Music State
  private isMusicPlaying: boolean = false;
  private musicInterval: any = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private masterMusicGain: GainNode | null = null;

  constructor() {
    this.isMuted = localStorage.getItem('tribunal_muted') === 'true';
    this.isMusicEnabled = localStorage.getItem('tribunal_music_enabled') !== 'false';
  }

  public initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('tribunal_muted', String(this.isMuted));
    if (this.isMuted) {
      this.stopMusic();
    } else if (this.isMusicEnabled) {
      this.startMusic();
    }
    return this.isMuted;
  }

  public toggleMusic(): boolean {
    this.isMusicEnabled = !this.isMusicEnabled;
    localStorage.setItem('tribunal_music_enabled', String(this.isMusicEnabled));
    if (this.isMusicEnabled && !this.isMuted) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.isMusicEnabled;
  }

  // ==========================================
  // AMBIENT SUSPENSE MUSIC ENGINE (Procedural Noir)
  // ==========================================
  public startMusic() {
    if (this.isMuted || !this.isMusicEnabled || this.isMusicPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    const t = this.ctx.currentTime;

    // Master Music Bus
    this.masterMusicGain = this.ctx.createGain();
    this.masterMusicGain.gain.setValueAtTime(0.001, t);
    this.masterMusicGain.gain.exponentialRampToValueAtTime(0.18, t + 2.5); // Smooth fade in
    this.masterMusicGain.connect(this.ctx.destination);

    // 1. Deep Sub-Drone (D minor / 55Hz & 73.4Hz)
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc2 = this.ctx.createOscillator();
    const droneFilter = this.ctx.createBiquadFilter();
    this.droneGain = this.ctx.createGain();

    this.droneOsc1.type = 'triangle';
    this.droneOsc1.frequency.setValueAtTime(55, t); // Low A1

    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(73.4, t); // Low D2

    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(160, t); // Muffled courtroom basement rumble

    this.droneGain.gain.setValueAtTime(0.45, t);

    this.droneOsc1.connect(droneFilter);
    this.droneOsc2.connect(droneFilter);
    droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterMusicGain);

    this.droneOsc1.start(t);
    this.droneOsc2.start(t);

    // 2. Vinyl / Old Tape Fluff & Air
    this.startTapeHiss();

    // 3. Sparse Eerie Notes (D minor, F, G, G#, A, C)
    const notes = [146.8, 174.6, 196.0, 207.6, 220.0, 261.6, 293.6];
    this.musicInterval = setInterval(() => {
      if (!this.isMusicPlaying || !this.ctx || this.isMuted) return;
      if (Math.random() > 0.35) {
        const note = notes[Math.floor(Math.random() * notes.length)];
        this.playSuspensePizzicato(note);
      }
    }, 3200);
  }

  private startTapeHiss() {
    if (!this.ctx || !this.masterMusicGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05;
    }

    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = buffer;
    this.noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    this.noiseSource.connect(filter);
    filter.connect(this.noiseGain);
    this.noiseGain.connect(this.masterMusicGain);

    this.noiseSource.start();
  }

  private playSuspensePizzicato(freq: number) {
    if (!this.ctx || !this.masterMusicGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3, t);
    filter.frequency.exponentialRampToValueAtTime(freq * 0.8, t + 1.2);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterMusicGain);

    osc.start(t);
    osc.stop(t + 1.7);
  }

  public stopMusic() {
    if (!this.isMusicPlaying) return;
    this.isMusicPlaying = false;

    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }

    if (this.masterMusicGain && this.ctx) {
      this.masterMusicGain.gain.setValueAtTime(this.masterMusicGain.gain.value, this.ctx.currentTime);
      this.masterMusicGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);

      setTimeout(() => {
        try {
          this.droneOsc1?.stop();
          this.droneOsc2?.stop();
          this.noiseSource?.stop();
          this.droneOsc1?.disconnect();
          this.droneOsc2?.disconnect();
          this.noiseSource?.disconnect();
        } catch (e) {}
      }, 1300);
    }
  }

  // ==========================================
  // TENSE CLOCK TICKING (Synchronized with Countdown)
  // ==========================================
  public playClockTick(isUrgent: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(isUrgent ? 880 : 600, t);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isUrgent ? 1800 : 1200, t);
    filter.Q.setValueAtTime(8, t);

    gain.gain.setValueAtTime(isUrgent ? 0.08 : 0.035, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.03);
  }

  // ==========================================
  // TACTILE SFX
  // ==========================================

  public playTypewriterKey() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    const freq = 190 + Math.random() * 90;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400 + Math.random() * 400, t);
    filter.Q.setValueAtTime(3.5, t);

    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  public playCarriageBell() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, t);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.75);
  }

  public playGavel() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.22);

    oscGain.gain.setValueAtTime(0.5, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    const noise = this.ctx.createBufferSource();
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.06);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.38, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    osc.start(t);
    noise.start(t);
    osc.stop(t + 0.32);
    noise.stop(t + 0.08);
  }

  public playStamp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.09);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playPaperRustle() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.18);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(850, t);
    filter.Q.setValueAtTime(1.2, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.19);
  }

  // Pneumatic Tube Dispatch Whoosh (Tubo Neumático Judicial)
  public playPneumaticWhoosh() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(1400, t + 0.15);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.36);
  }

  // Page Turn / Document Slide
  public playPageTurn() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.linearRampToValueAtTime(600, t + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.13);
  }
}

export const sfx = new SoundEngine();
