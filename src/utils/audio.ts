// Web Audio API custom synthesizer to output retro terminal sounds on transaction events without audio files
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    // Lazy initialize to bypass browser autoplay safety restrictions
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export const playSyntheticSound = (type: 'tick' | 'order' | 'profit' | 'warning' | 'liquidation') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Resume context if browser suspended it due to lack of user gesture
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'tick': {
        // Light, subtle terminal clicking sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }
      case 'order': {
        // Clean high-tech binary bip-bop confirm tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'profit': {
        // Ascending harmonic major arpeggio chime
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        frequencies.forEach((freq, idx) => {
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          oscNode.type = 'triangle';
          oscNode.frequency.setValueAtTime(freq, now + idx * 0.08);
          gainNode.gain.setValueAtTime(0.02, now + idx * 0.08);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.3);
          
          oscNode.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscNode.start(now + idx * 0.08);
          oscNode.stop(now + idx * 0.08 + 0.3);
        });
        break;
      }
      case 'warning': {
        // High-low dual alarm siren
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.linearRampToValueAtTime(320, now + 0.15);
        osc.frequency.linearRampToValueAtTime(280, now + 0.3);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
      case 'liquidation': {
        // Heavy distorted descending sweep rumble
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.8);
        
        // Low pass filter to create heavy rumble resonance
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 0.8);
        
        osc.disconnect(gain);
        osc.connect(filter);
        filter.connect(gain);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
        osc.start(now);
        osc.stop(now + 1.0);
        break;
      }
    }
  } catch (err) {
    console.warn('Web Audio Playback blocked or unsupported:', err);
  }
};
