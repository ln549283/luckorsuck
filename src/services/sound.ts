let audioContext: AudioContext | null = null;
let enabled = true;

function getContext() {
  if (!audioContext) audioContext = new AudioContext();
  return audioContext;
}

function tone(frequency: number, duration = 0.08, type: OscillatorType = 'sine', volume = 0.03) {
  if (!enabled) return;
  const ctx = getContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
}

export const sounds = {
  click() { tone(210, 0.055, 'square', 0.02); },
  success(streak = 0) { tone(480 + Math.min(streak, 20) * 8, 0.09, 'triangle', 0.028); },
  bank() {
    tone(420, 0.07, 'triangle', 0.035);
    window.setTimeout(() => tone(680, 0.13, 'triangle', 0.04), 70);
  },
  fail() {
    tone(130, 0.12, 'sawtooth', 0.035);
    window.setTimeout(() => tone(85, 0.18, 'sawtooth', 0.03), 70);
  },
  timeout() { tone(155, 0.11, 'square', 0.025); }
};
