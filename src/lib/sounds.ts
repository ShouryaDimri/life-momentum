// Simple sound utility using Web Audio API
const createSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

export const sounds = {
  complete: () => {
    createSound(800, 0.1);
    setTimeout(() => createSound(1000, 0.1), 50);
  },
  add: () => {
    createSound(600, 0.15);
  },
  delete: () => {
    createSound(400, 0.1);
    setTimeout(() => createSound(300, 0.1), 50);
  },
  toggle: () => {
    createSound(500, 0.08);
  }
};
