import React, { useEffect, useRef, useState } from 'react';
import { ParticleEngine } from './ParticleEngine';
import { TextSequencer, TypewriterLine } from './TextSequencer';
import { YouTubeBackground } from './YouTubeBackground';
import { playSyntheticSound } from '../utils/audio';

// Acts definitions
type Act = 'ACT_I' | 'ACT_II' | 'ACT_III' | 'ACT_IV' | 'DONE';

interface IntroCinematicOverlayProps {
  onComplete: () => void;
}

export function IntroCinematicOverlay({ onComplete }: IntroCinematicOverlayProps) {
  const [act, setAct] = useState<Act>('ACT_I');
  const [skipVisible, setSkipVisible] = useState(false);
  const [impactFlash, setImpactFlash] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ParticleEngine | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Typewriter line states for Act I, Act III, and Act IV references
  const [act1Text1, setAct1Text1] = useState('');
  const [act1Text2, setAct1Text2] = useState('');

  const [diagnosticLogs, setDiagnosticLogs] = useState<{ id: string; text: string; status?: 'pending' | 'ok' }[]>([
    { id: '1', text: 'OMEGA ENGINE:     INITIALIZING........' },
    { id: '2', text: 'SOVEREIGN FEEDS:  CONNECTING..........' },
    { id: '3', text: 'CLIMATE SENSOR:   ARMED...............' },
    { id: '4', text: 'DYNASTY CORE:     LOADING.............' },
    { id: '5', text: 'HADRON LINK:      SYNCHRONIZED........' },
    { id: '6', text: 'CLEARANCE:        LEVEL 5 CONFIRMED' },
  ]);

  const [act4Header, setAct4Header] = useState('');

  // Sequencer references
  const act1Sequencer = useRef<TextSequencer | null>(null);
  const act3Sequencer = useRef<TextSequencer | null>(null);
  const act4Sequencer = useRef<TextSequencer | null>(null);

  // Initialize Audio Synth
  const playLowRumble = () => {
    try {
      if (audioCtxRef.current) return;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, ctx.currentTime); // 60Hz deep sine

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 2.0); // 2s fade-in

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gainNode;
    } catch (e) {
      console.warn('Audio synthesis failed to initialize:', e);
    }
  };

  const stopLowRumble = () => {
    try {
      if (gainNodeRef.current && audioCtxRef.current) {
        const curTime = audioCtxRef.current.currentTime;
        gainNodeRef.current.gain.cancelScheduledValues(curTime);
        gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, curTime);
        gainNodeRef.current.gain.linearRampToValueAtTime(0, curTime + 0.8);
        setTimeout(() => {
          oscillatorRef.current?.stop();
          audioCtxRef.current?.close();
        }, 1000);
      }
    } catch (e) {
      // safe ignore
    }
  };

  // Skip trigger
  const handleSkip = () => {
    stopLowRumble();
    playSyntheticSound('open');
    setAct('DONE');
    onComplete();
  };

  // Keyboard and click triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Set up sequencers
  useEffect(() => {
    // Act I Sequencer
    act1Sequencer.current = new TextSequencer([
      { id: 'act1_l1', text: 'BLOOMI CYBERNETIC CORES GMBH', speed: 80, delayBefore: 800 },
      { id: 'act1_l2', text: 'INITIATING SOVEREIGN INTELLIGENCE FEED...', speed: 80, delayBefore: 500 }
    ]);

    // Act III diagnostic sequence
    act3Sequencer.current = new TextSequencer([
      { id: '1', text: 'OMEGA ENGINE:     INITIALIZING........ [OK]', speed: 60, delayBefore: 200 },
      { id: '2', text: 'SOVEREIGN FEEDS:  CONNECTING.......... [OK]', speed: 60, delayBefore: 200 },
      { id: '3', text: 'CLIMATE SENSOR:   ARMED............... [OK]', speed: 60, delayBefore: 200 },
      { id: '4', text: 'DYNASTY CORE:     LOADING............. [OK]', speed: 60, delayBefore: 200 },
      { id: '5', text: 'HADRON LINK:      SYNCHRONIZED........ [OK]', speed: 60, delayBefore: 200 },
      { id: '6', text: 'CLEARANCE:        LEVEL 5 CONFIRMED', speed: 60, delayBefore: 200 },
    ]);

    // Act IV Header Sequencer
    act4Sequencer.current = new TextSequencer([
      { id: 'act4_hdr1', text: 'SOVEREIGN DIRECTOR', speed: 30, delayBefore: 200 },
      { id: 'act4_hdr2', text: 'ACCESS GRANTED', speed: 30, delayBefore: 200 }
    ]);
  }, []);

  // Timeline State Machine
  useEffect(() => {
    // Reveal skip after 2 seconds
    const skipTimer = setTimeout(() => {
      setSkipVisible(true);
    }, 2000);

    // ACT I (0:00 - 0:04)
    // ACT II (0:04 - 0:10)
    // ACT III (0:10 - 0:20)
    // ACT IV (0:20 - 0:26)
    // DONE (0:26)

    const timeline = [
      { act: 'ACT_II' as Act, ms: 4000 },
      { act: 'ACT_III' as Act, ms: 10000 },
      { act: 'ACT_IV' as Act, ms: 20000 },
      { act: 'DONE' as Act, ms: 26000 }
    ];

    const timers = timeline.map((checkpoint) => {
      return setTimeout(() => {
        setAct(checkpoint.act);
        
        // Handle transitions physics
        if (checkpoint.act === 'ACT_II') {
          playLowRumble();
          if (engineRef.current) {
            engineRef.current.initStorm();
          }
        } else if (checkpoint.act === 'ACT_III') {
          // Collapse and Shockwave Flash
          if (engineRef.current) {
            engineRef.current.triggerCollapse();
          }
          // Fast white impact frame
          setImpactFlash(true);
          playSyntheticSound('warning');
          setTimeout(() => {
            setImpactFlash(false);
            if (engineRef.current) {
              engineRef.current.triggerShockwave();
              // Scan for letters
              const targetCoords = scanLogoCoordinates(window.innerWidth, window.innerHeight);
              engineRef.current.initLogoAssembly(targetCoords);
            }
          }, 150);
        } else if (checkpoint.act === 'DONE') {
          stopLowRumble();
          playSyntheticSound('open');
          onComplete();
        }
      }, checkpoint.ms);
    });

    return () => {
      clearTimeout(skipTimer);
      timers.forEach(clearTimeout);
    };
  }, [onComplete]);

  // Main Canvas Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // HD-DPI Scaling setup
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const engine = new ParticleEngine(width, height);
    engineRef.current = engine;

    let animId: number;

    const tick = () => {
      // Clear black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // 1. Particle engine tick
      engine.update();
      engine.draw(ctx);

      // 2. Text updates in canvas (such as the matrix fall text in Act II)
      if (act === 'ACT_II') {
        drawMatrixRain(ctx, width, height);
      }

      animId = requestAnimationFrame(tick);
    };

    tick();

    // Resize listener
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      engine.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [act]);

  // React Timer Loop for Typewriter sequencers
  useEffect(() => {
    let textTimer = setInterval(() => {
      // Act I typewriter
      if (act === 'ACT_I' && act1Sequencer.current) {
        act1Sequencer.current.update();
        setAct1Text1(act1Sequencer.current.getRenderedText('act1_l1'));
        setAct1Text2(act1Sequencer.current.getRenderedText('act1_l2'));
      }

      // Act III typewriter
      if (act === 'ACT_III' && act3Sequencer.current) {
        act3Sequencer.current.update();
        setDiagnosticLogs((prev) =>
          prev.map((log) => {
            const typed = act3Sequencer.current!.getRenderedText(log.id);
            return {
              ...log,
              text: typed,
              status: typed.includes('[OK]') ? 'ok' : 'pending'
            };
          })
        );
      }

      // Act IV typewriter
      if (act === 'ACT_IV' && act4Sequencer.current) {
        act4Sequencer.current.update();
        const line1 = act4Sequencer.current.getRenderedText('act4_hdr1');
        const line2 = act4Sequencer.current.getRenderedText('act4_hdr2');
        setAct4Header(`${line1}${line1 && line2 ? '\n' : ''}${line2}`);
      }
    }, 30);

    return () => clearInterval(textTimer);
  }, [act]);

  // Matrix Rain drawer helper for Act II
  const matrixChars = 'BTC ETH AAPL TSLA SPX VIX CDS USD BRL EUR JPY BUY SELL DEBT SHORT COLLIDE SPLICE OVERRIDE'.split(' ');
  const matrixColumns = useRef<{ x: number; y: number; speed: number; chars: string[] }[]>([]);
  
  const drawMatrixRain = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (matrixColumns.current.length === 0) {
      // Spawn columns
      const colWidth = 80;
      const colCount = Math.floor(width / colWidth);
      for (let i = 0; i < colCount; i++) {
        matrixColumns.current.push({
          x: i * colWidth + colWidth / 2,
          y: Math.random() * -height,
          speed: Math.random() * 5 + 3,
          chars: Array.from({ length: 12 }, () => matrixChars[Math.floor(Math.random() * matrixChars.length)])
        });
      }
    }

    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 111, 0, 0.4)';
    for (const col of matrixColumns.current) {
      col.y += col.speed;
      if (col.y > height) {
        col.y = -200;
      }
      // Draw cascading column strings
      col.chars.forEach((char, idx) => {
        const charY = col.y + idx * 14;
        if (charY > 0 && charY < height) {
          ctx.fillText(char, col.x, charY);
        }
      });
    }
  };

  // Dynamic offscreen font pixel outline scan
  const scanLogoCoordinates = (worldWidth: number, worldHeight: number) => {
    const coords: { x: number; y: number }[] = [];
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return [];

    tempCanvas.width = 800;
    tempCanvas.height = 300;
    tempCtx.fillStyle = 'black';
    tempCtx.fillRect(0, 0, 800, 300);

    tempCtx.fillStyle = 'white';
    // Use large bold Inter/Impact style font to assemble outlines nicely
    tempCtx.font = 'black 140px "Bebas Neue", "Inter", sans-serif';
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillText('BLOOMI', 400, 150);

    const imgData = tempCtx.getImageData(0, 0, 800, 300);
    const step = 4;
    for (let y = 0; y < 300; y += step) {
      for (let x = 0; x < 800; x += step) {
        const idx = (y * 800 + x) * 4;
        if (imgData.data[idx] > 120) {
          coords.push({
            x: x + (worldWidth / 2 - 400),
            y: y + (worldHeight / 2 - 150)
          });
        }
      }
    }
    return coords;
  };

  return (
    <div 
      className="fixed inset-0 bg-[#000000] z-[10000] flex flex-col justify-between overflow-hidden select-none"
      onClick={playLowRumble} /* User Interaction unlocks programmatic Audio context */
    >
      {/* Black impact flash visual element */}
      {impactFlash && (
        <div className="absolute inset-0 bg-white z-[20000] transition-opacity duration-150" />
      )}

      {/* Layer 1: Background Streaming video component */}
      <YouTubeBackground currentAct={act} />

      {/* Layer 2: Main interactive physics element canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-5 block w-full h-full" />

      {/* UI Overlays: Act-dependent Text grids */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-12 pointer-events-none">
        
        {/* ACT I: Typing sequence */}
        {act === 'ACT_I' && (
          <div className="flex-1 flex flex-col justify-center items-center font-mono space-y-3">
            <div className="h-10 text-white text-[13px] font-black uppercase text-center tracking-widest leading-relaxed">
              {act1Text1}
              {act1Text1 && <span className="animate-pulse duration-150 inline-block w-2.5 h-4 bg-[#FF6F00] ml-1" />}
            </div>
            <div className="h-10 text-[#FF6F00] text-[11px] font-bold text-center tracking-wider max-w-[380px]">
              {act1Text2}
            </div>
          </div>
        )}

        {/* ACT III: Assembler logo header and typing status logs */}
        {act === 'ACT_III' && (
          <div className="flex-1 flex flex-col justify-end items-center mb-24 space-y-8 font-mono">
            {/* Outlines of dynamic diagnostics */}
            <div className="space-y-1.5 text-center max-w-[420px] bg-black/75 p-4 rounded border border-[#ff6f00]/30 mr-1 select-none">
              <span className="text-[9.5px] font-black tracking-widest text-[#FF6F00] block mb-2 font-display uppercase">
                CORES INTEGRATION INTERFACE
              </span>
              <div className="space-y-1 text-left font-terminal">
                {diagnosticLogs.map((log) => (
                  <div key={log.id} className="text-[10px] leading-tight text-white h-5 flex justify-between">
                    <span>{log.text.replace(' [OK]', '')}</span>
                    {log.status === 'ok' && (
                      <span className="text-emerald-500 font-bold ml-2 tracking-widest text-[9.5px] animate-pulse">
                        [OK]
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ACT IV: Final entrance ignition words */}
        {act === 'ACT_IV' && (
          <div className="flex-1 flex flex-col justify-center items-center space-y-12">
            <div className="text-center bg-black/60 p-6 rounded-terminal border border-[#FF6F00]/30 select-none">
              <h1 className="text-stone-100 font-display font-black text-[38px] tracking-tight leading-none uppercase whitespace-pre-line animate-pulse">
                {act4Header}
              </h1>
              <p className="text-[#FF6F00] font-mono text-[10px] tracking-[0.22em] uppercase mt-2.5">
                BIOMETRIC STATUS: PURE  //  SYNAPSE SHIELDING: ACTIVE  //  TICK_RATE: ARMED
              </p>
            </div>
          </div>
        )}

        {/* Skip button strip */}
        {skipVisible && (
          <div className="absolute bottom-6 right-6 z-20 pointer-events-auto">
            <button
              onClick={handleSkip}
              className="px-3 py-1.5 bg-[#030304] border border-[#ff6f00] font-mono font-bold text-[#ff9e00] text-[10px] tracking-widest rounded transition-all hover:bg-[#ff6f00] hover:text-black hover:scale-105 active:scale-95 cursor-pointer uppercase"
            >
              SKIP INTRO ▸
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
