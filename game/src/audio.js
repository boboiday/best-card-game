// Ember Court — sound, synthesised in code with WebAudio.
// No audio files: every bleep is an oscillator, so the game loads nothing
// over the network. Sound starts on the first user gesture.

export function createAudio() {
  let context = null;

  function ensure() {
    if (context) return context;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext();
    } catch {
      context = null;
    }
    return context;
  }

  function tone(frequency, duration, type, volume) {
    const ctx = ensure();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(volume || 0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Sound is garnish; a blocked context never stops the game.
    }
  }

  return {
    unlock() {
      ensure();
    },
    playCard() {
      tone(520, 0.12, 'triangle', 0.14);
      tone(780, 0.1, 'triangle', 0.1);
    },
    combo() {
      tone(660, 0.1, 'square', 0.08);
      tone(880, 0.14, 'square', 0.08);
      tone(1320, 0.18, 'sine', 0.1);
    },
    hurt() {
      tone(180, 0.2, 'sawtooth', 0.1);
    },
    win() {
      [523, 659, 784, 1047].forEach((note, i) => {
        window.setTimeout(() => tone(note, 0.25, 'triangle', 0.12), i * 120);
      });
    },
    loss() {
      [392, 330, 262].forEach((note, i) => {
        window.setTimeout(() => tone(note, 0.3, 'sine', 0.1), i * 160);
      });
    },
  };
}
