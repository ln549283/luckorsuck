let audioContext: AudioContext | null = null;

function getContext() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function tone(frequency: number, duration = 0.08, type: OscillatorType = 'sine') {
  const ctx = getContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.03;

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

export const sounds = {
  click() { tone(220); },
  success() { tone(520, 0.12, 'triangle'); },
  bank() {
    tone(440, 0.08);
    window.setTimeout(() => tone(660, 0.15, 'triangle'), 90);
  },
  fail() { tone(120, 0.2, 'sawtooth'); },
  timeout() { tone(160, 0.15, 'square'); }
};
