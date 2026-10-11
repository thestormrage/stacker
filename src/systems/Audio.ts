let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let enabled = true;

export function initAudio(): void {
  if (audioContext) return;
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(audioContext.destination);
  } catch (e) {
    console.warn('Audio init failed:', e);
    enabled = false;
  }
}

export function setAudioEnabled(value: boolean): void {
  enabled = value;
  if (masterGain) masterGain.gain.value = value ? 0.3 : 0;
}

export function isAudioEnabled(): boolean {
  return enabled;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.1): void {
  if (!enabled || !audioContext || !masterGain) return;
  if (audioContext.state === 'suspended') audioContext.resume();

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = volume;

  osc.connect(gain);
  gain.connect(masterGain);

  const now = audioContext.currentTime;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.start(now);
  osc.stop(now + duration);
}

export function playPlaceSound(perfect: boolean): void {
  if (perfect) {
    playTone(880, 0.1, 'sine', 0.15);
    setTimeout(() => playTone(1320, 0.1, 'sine', 0.1), 50);
  } else {
    playTone(440, 0.15, 'triangle', 0.12);
  }
}

export function playGameOverSound(): void {
  playTone(330, 0.2, 'sawtooth', 0.15);
  setTimeout(() => playTone(220, 0.3, 'sawtooth', 0.12), 100);
  setTimeout(() => playTone(165, 0.4, 'sawtooth', 0.1), 250);
}

export function playPerfectSound(): void {
  playTone(660, 0.08, 'sine', 0.1);
  setTimeout(() => playTone(990, 0.08, 'sine', 0.08), 40);
  setTimeout(() => playTone(1320, 0.08, 'sine', 0.06), 80);
}

export function playMenuSound(): void {
  playTone(523, 0.1, 'sine', 0.08);
}

export function playUnlockSound(): void {
  playTone(523, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.1), 80);
  setTimeout(() => playTone(784, 0.15, 'sine', 0.12), 160);
}