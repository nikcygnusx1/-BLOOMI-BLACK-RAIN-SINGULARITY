export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  alpha: number;
  phase: 'storm' | 'ring1' | 'ring2' | 'collapse' | 'assemble' | 'done';
  angle?: number;
  radius?: number;
  speed?: number;
}

export class ParticleEngine {
  particles: Particle[] = [];
  width: number = 800;
  height: number = 600;
  centerX: number = 400;
  centerY: number = 300;
  shockwaveRadius: number = 0;
  shockwaveMaxRadius: number = 800;
  shockwaveActive: boolean = false;
  shockwaveProgress: number = 0; // 0 to 1

  constructor(width: number, height: number) {
    this.setSize(width, height);
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.shockwaveMaxRadius = Math.max(width, height) * 0.9;
  }

  // Act II: Spawn 2000 particles rushing to screen center, then forming LHC ring
  initStorm() {
    this.particles = [];
    const count = 1800; // Optimal performance
    const targetRingRadius = Math.min(this.width, this.height) * 0.28;

    for (let i = 0; i < count; i++) {
      // Spawn on edges / random outer areas
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.max(this.width, this.height) * (0.6 + Math.random() * 0.4);
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;

      // Assign to either ring 1 (Amber, outside) or ring 2 (Cold blue, inside, opposite)
      const isOuter = Math.random() > 0.4;
      const color = isOuter ? '#FF6F00' : '#00D4FF';
      const phase = 'storm';
      const radius = targetRingRadius * (isOuter ? 1.0 : 0.75);
      const speed = (isOuter ? 0.02 : -0.03) * (0.8 + Math.random() * 0.4);

      this.particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        targetX: this.centerX,
        targetY: this.centerY,
        size: Math.random() * 1.5 + 0.5,
        color,
        alpha: Math.random() * 0.5 + 0.5,
        phase,
        angle: Math.random() * Math.PI * 2,
        radius,
        speed
      });
    }
  }

  // Act III: Trigger inner collapse
  triggerCollapse() {
    for (const p of this.particles) {
      p.phase = 'collapse';
    }
  }

  // Act III: On slam trigger expanding shockwave
  triggerShockwave() {
    this.shockwaveActive = true;
    this.shockwaveRadius = 0;
    this.shockwaveProgress = 0;
  }

  // Act III Logo outline scanner: Create "BLOOMI" outlines targets on Canvas
  initLogoAssembly(targetCoords: { x: number; y: number }[]) {
    this.particles = [];
    if (targetCoords.length === 0) return;

    // Distribute particles across the target coordinate points
    for (let i = 0; i < targetCoords.length; i++) {
      const pt = targetCoords[i];
      // Flight start: from outer edges
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.max(this.width, this.height) * (0.5 + Math.random() * 0.5);
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;

      this.particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        targetX: pt.x,
        targetY: pt.y,
        size: 1.2,
        color: '#FF6F00',
        alpha: 1.0,
        phase: 'assemble'
      });
    }
  }

  // Physics and position update frame
  update() {
    // 1. Update shockwave expansion
    if (this.shockwaveActive) {
      this.shockwaveRadius += this.shockwaveMaxRadius * 0.08;
      this.shockwaveProgress = this.shockwaveRadius / this.shockwaveMaxRadius;
      if (this.shockwaveProgress >= 1.0) {
        this.shockwaveActive = false;
      }
    }

    // 2. Update particle positions
    for (const p of this.particles) {
      if (p.phase === 'storm') {
        // Accelerate toward center
        const dx = this.centerX - p.x;
        const db = this.centerY - p.y;
        const dist = Math.sqrt(dx * dx + db * db);

        if (dist < p.radius! + 50) {
          // Switch to ring orbit phase
          p.phase = p.color === '#FF6F00' ? 'ring1' : 'ring2';
        } else {
          // Fly inward
          const f = 0.06;
          p.x += dx * f + (Math.random() - 0.5) * 4;
          p.y += db * f + (Math.random() - 0.5) * 4;
        }
      } else if (p.phase === 'ring1' || p.phase === 'ring2') {
        // Orbit around LHC center
        p.angle! += p.speed!;
        const targetX = this.centerX + Math.cos(p.angle!) * p.radius!;
        const targetY = this.centerY + Math.sin(p.angle!) * p.radius!;
        p.x += (targetX - p.x) * 0.1;
        p.y += (targetY - p.y) * 0.1;
      } else if (p.phase === 'collapse') {
        // Rapid snap to center point
        const dx = this.centerX - p.x;
        const dy = this.centerY - p.y;
        p.x += dx * 0.22;
        p.y += dy * 0.22;
      } else if (p.phase === 'assemble') {
        // Fly from edges and lock precisely on target text matrix coordinate
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 1.5) {
          p.x = p.targetX;
          p.y = p.targetY;
          p.phase = 'done';
        } else {
          p.x += dx * 0.15;
          p.y += dy * 0.15;
        }
      }
    }
  }

  // Draw on Canvas context
  draw(ctx: CanvasRenderingContext2D) {
    // A. Draw Shockwave Ring
    if (this.shockwaveActive) {
      ctx.beginPath();
      // Outer expansion edge gradient Ring
      ctx.arc(this.centerX, this.centerY, this.shockwaveRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 179, 0, ${1 - this.shockwaveProgress})`;
      ctx.lineWidth = 4 * (1 - this.shockwaveProgress);
      ctx.stroke();

      // Soft glow fill inside
      ctx.fillStyle = `rgba(255, 255, 255, ${0.15 * (1 - this.shockwaveProgress)})`;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, this.shockwaveRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // B. Draw Particles
    ctx.fillStyle = '#FF6F00';
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1.0; // Reset
  }
}
