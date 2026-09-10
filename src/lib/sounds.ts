/** Synthesized UI sounds via Web Audio. No audio files, nothing to load. */

let context: AudioContext | null = null;
let muted = false;

export function setMuted(value: boolean): void {
  muted = value;
}

function getContext(): AudioContext | null {
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();
    return context;
  } catch {
    return null;
  }
}

/** Call from a user gesture so the browser lets us play later. */
export function unlockAudio(): void {
  if (!muted) getContext();
}

interface ToneSpec {
  frequency: number;
  at: number;
  duration: number;
  type: OscillatorType;
  peak: number;
}

function tone(ctx: AudioContext, destination: AudioNode, spec: ToneSpec): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = spec.type;
  osc.frequency.setValueAtTime(spec.frequency, spec.at);
  gain.gain.setValueAtTime(0.0001, spec.at);
  gain.gain.exponentialRampToValueAtTime(spec.peak, spec.at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, spec.at + spec.duration);
  osc.connect(gain);
  gain.connect(destination);
  osc.start(spec.at);
  osc.stop(spec.at + spec.duration + 0.03);
}

/** Short filtered click for each reel step. `volume` in [0, 1]. */
export function playTick(volume = 1): void {
  if (muted) return;
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const length = 0.02;
  const frames = Math.max(1, Math.floor(ctx.sampleRate * length));
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 2;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1800 + Math.random() * 600, now);
  filter.Q.value = 1.4;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.5 * Math.max(0.05, volume), now + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(now);
  source.stop(now + length + 0.01);
}

/** Two-note rising ding when the reel lands. */
export function playLand(): void {
  if (muted) return;
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const bus = ctx.createGain();
  bus.gain.value = 0.4;
  bus.connect(ctx.destination);
  tone(ctx, bus, { frequency: 587.33, at: now, duration: 0.35, type: 'sine', peak: 0.3 });
  tone(ctx, bus, { frequency: 880, at: now + 0.09, duration: 0.5, type: 'sine', peak: 0.28 });
}

/** Four-note chime when a timer reaches zero. */
export function playDone(): void {
  if (muted) return;
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const bus = ctx.createGain();
  bus.gain.value = 0.45;
  bus.connect(ctx.destination);
  [659.25, 523.25, 783.99, 1046.5].forEach((frequency, i) => {
    tone(ctx, bus, { frequency, at: now + i * 0.13, duration: 0.5, type: 'triangle', peak: 0.3 });
  });
  tone(ctx, bus, { frequency: 1046.5, at: now + 0.6, duration: 1.0, type: 'sine', peak: 0.18 });
}
