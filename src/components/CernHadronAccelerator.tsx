import React, { useEffect, useRef, useState } from 'react';
import { SimState } from '../types';
import { playSyntheticSound } from '../utils/audio';

interface CernHadronAcceleratorProps {
  state: SimState;
  activeTicker: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export const CernHadronAccelerator: React.FC<CernHadronAcceleratorProps> = ({ state, activeTicker }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 260 });
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastStateTickRef = useRef(state.currentTick);

  // Trigger high energy collision
  const triggerCollision = (type: 'buy' | 'sell' | 'crash') => {
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;

    playSyntheticSound(type === 'crash' ? 'liquidation' : 'order');

    let count = 40;
    let colors = ['#00ff88', '#00c2ff', '#00e1ff'];
    if (type === 'sell') {
      colors = ['#ff3b5c', '#ff5a79', '#ff003c'];
    } else if (type === 'crash') {
      count = 120;
      colors = ['#ff3b5c', '#ffffff', '#ffaa00', '#7f00ff'];
    }

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = type === 'crash' ? Math.random() * 8 + 3 : Math.random() * 5 + 2;
      particlesRef.current.push({
        x: centerX + (Math.random() - 0.5) * 20,
        y: centerY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3.5 + 1.5,
        life: 1.0,
        maxLife: Math.random() * 0.4 + 0.3, // seconds of life
      });
    }
  };

  // Resize monitor
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries && entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({
          width: width || 500,
          height: Math.max(180, height)
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Monitor ticks to fire sub-atomic collision bursts on price movements or OMEGA attacks
  useEffect(() => {
    if (state.currentTick !== lastStateTickRef.current) {
      lastStateTickRef.current = state.currentTick;
      const omegaAttack = state.omegaActiveAttacks && state.omegaActiveAttacks.length > 0;
      if (omegaAttack) {
        triggerCollision('crash');
      } else {
        triggerCollision(Math.random() > 0.5 ? 'buy' : 'sell');
      }
    }
  }, [state.currentTick, state.omegaActiveAttacks]);

  // Main high speed physics animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // HiDPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    let lastTime = performance.now();
    let waveOffset = 0;

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      waveOffset += delta * 4;

      const { width, height } = dimensions;
      const centerX = width / 2;
      const centerY = height / 2;

      // Deep dark command canvas backing with high contrast grid
      ctx.fillStyle = '#06080c';
      ctx.fillRect(0, 0, width, height);

      // Draw particle lattices grid helper
      ctx.strokeStyle = '#0f141e';
      ctx.lineWidth = 0.5;
      const spacing = 30;
      for (let x = 0; x < width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw cyclotron circular accelerator rings in background
      ctx.strokeStyle = 'rgba(0, 194, 255, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.min(centerX, centerY) * 0.72, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0, 255, 136, 0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.min(centerX, centerY) * 0.45, 0, Math.PI * 2);
      ctx.stroke();

      // Oscilloscope high-frequency wave patterns representing volatility
      const activeMarket = state.markets[activeTicker];
      const volatilityIndex = activeMarket ? (state.countries[activeMarket.type === 'crypto' ? 'CH' : 'US']?.volatility || 20) : 20;
      const lineCount = 3;

      for (let l = 0; l < lineCount; l++) {
        ctx.strokeStyle = l === 0 ? 'rgba(0, 255, 136, 0.25)' : l === 1 ? 'rgba(0, 194, 255, 0.15)' : 'rgba(255, 59, 92, 0.1)';
        ctx.lineWidth = l === 0 ? 1.5 : 1.0;
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const curveX = (x / width) * Math.PI * 6;
          // Apply volatile noise based on volatility index
          const amplitude = (volatilityIndex / 100) * 45 + (10 * (l + 1));
          const noise = Math.sin(curveX * 2.1 + waveOffset * 1.5 + l) * Math.cos(curveX * 0.8 - waveOffset * 0.9);
          const y = centerY + Math.sin(curveX - waveOffset + l * 0.5) * amplitude + noise * 5;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Physics equations update particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.life -= delta / p.maxLife;
        if (p.life <= 0) return false;

        // Apply magnetic pull toward center (hadron containment fields)
        const dx = centerX - p.x;
        const dy = centerY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        
        // cyclotron orbital rotation torque
        const fx = (dy / dist) * 0.5;
        const fy = (-dx / dist) * 0.5;

        p.vx += fx + dx * 0.02;
        p.vy += fy + dy * 0.02;

        p.x += p.vx;
        p.y += p.vy;

        // Particle particle streak tail Glow render
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      // Clear glow configuration
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;

      // Draw cyclotron focus collision target crosshairs inside center
      ctx.strokeStyle = '#00c2ff';
      ctx.lineWidth = 1;

      // Draw dynamic target vector reticle
      const reticleRadius = 15 + Math.sin(waveOffset * 3) * 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, reticleRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX - reticleRadius - 8, centerY);
      ctx.lineTo(centerX - reticleRadius + 4, centerY);
      ctx.moveTo(centerX + reticleRadius + 8, centerY);
      ctx.lineTo(centerX + reticleRadius - 4, centerY);
      ctx.stroke();

      // Matrix vector telemetry tags
      ctx.fillStyle = '#7a8da8';
      ctx.font = '7.5px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`HFT_CYCLO: ${(4.5 + volatilityIndex * 0.12).toFixed(3)} GHz`, 10, 18);
      ctx.fillText(`LATTICE_COEF: ${particlesRef.current.length} PARTICLES`, 10, 28);
      ctx.fillText(`OMEGA_AI_SIGMA: ${(state.omegaThreatLevel || 5.2).toFixed(1)}% TYPE-V`, 10, 38);

      ctx.textAlign = 'right';
      ctx.fillText(`COLLIDER_BEAM: ${activeTicker} // BEAM_STRENGTH: 100 PVE`, width - 10, 18);
      ctx.fillText(`TARGET_COORD: ${centerX.toFixed(0)}e, ${centerY.toFixed(0)}n`, width - 10, 28);

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [dimensions, activeTicker, state.omegaThreatLevel, state.markets]);

  return (
    <div className="flex border border-[#00c2ff]/30 bg-[#06080c] relative rounded-terminal flex-col h-full overflow-hidden" ref={containerRef}>
      <div className="flex items-center justify-between border-b border-[#00c2ff]/20 bg-[#0a0e16] px-2.5 py-1 text-[9px] font-bold text-[#00c2ff]">
        <span>CERN HADRON PARTICLE HFT ACCELERATOR</span>
        <button 
          onClick={() => triggerCollision('crash')}
          className="bg-[#ff3b5c]/15 hover:bg-[#ff3b5c]/30 text-[#ff3b5c] border border-[#ff3b5c]/40 px-1.5 py-0.5 rounded text-[8px] cursor-pointer"
        >
          FORCE Hadron Collision
        </button>
      </div>
      <div className="flex-1 min-h-[160px] relative">
        <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      </div>
    </div>
  );
};
