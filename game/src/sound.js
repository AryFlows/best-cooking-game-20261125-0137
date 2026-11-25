// Tiny synthesised sounds for Frost Kitchen — no audio files, just the Web Audio API.
// Every sound is a short oscillator blip, created lazily on the first player gesture
// (browsers block audio before that) and skipped silently when audio is unavailable.
export function createSound() {
  let ctx = null;

  function ensure() {
    if (ctx) return ctx;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      ctx = new AudioContext();
      return ctx;
    } catch {
      return null;
    }
  }

  function blip(freq, seconds, type, gain) {
    const audio = ensure();
    if (!audio) return;
    try {
      const osc = audio.createOscillator();
      const amp = audio.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      amp.gain.setValueAtTime(gain, audio.currentTime);
      amp.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + seconds);
      osc.connect(amp);
      amp.connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + seconds);
    } catch {
      // Sound is garnish: a failure here must never break the game.
    }
  }

  return {
    /** Call from a user gesture so the browser unlocks audio. */
    unlock() {
      ensure();
    },
    pop() {
      blip(520, 0.08, 'sine', 0.12);
    },
    ding() {
      blip(880, 0.18, 'sine', 0.14);
      setTimeout(() => blip(1318, 0.22, 'sine', 0.12), 90);
    },
    chaChing() {
      blip(988, 0.1, 'triangle', 0.16);
      setTimeout(() => blip(1319, 0.16, 'triangle', 0.16), 90);
    },
    buzz() {
      blip(160, 0.25, 'sawtooth', 0.1);
    },
  };
}
