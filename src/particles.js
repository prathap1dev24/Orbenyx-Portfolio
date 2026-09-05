/**
 * ORBENYX PARTICLE LAB ENGINE
 * High-performance HTML5 Canvas 2D Particle Visualizers
 * Version 1: Cyber Dust (Ambient Floating Nodes with Depth Parallax)
 * Version 2: Constellation (Magnetic Connecting Network)
 * Version 3: Spark Burst (Cinematic Embers with Physics & Shimmer)
 */

export class ParticleSystem {
  constructor(canvas, type = 'cyber-dust', options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.type = type;
    this.options = options;
    this.particles = [];
    this.animationFrameId = null;
    this.mouse = { x: null, y: null, radius: 140, isHovering: false };
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.initBounds();
    this.initEvents();
    this.createParticles();
    this.animate();
  }

  initBounds() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || window.innerWidth || 400;
    this.height = rect.height || window.innerHeight || 300;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  initEvents() {
    const target = this.options.isOverlay ? window : this.canvas;

    target.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (mx >= -50 && mx <= rect.width + 50 && my >= -50 && my <= rect.height + 50) {
        this.mouse.x = mx;
        this.mouse.y = my;
        this.mouse.isHovering = true;
      } else {
        this.mouse.x = null;
        this.mouse.y = null;
        this.mouse.isHovering = false;
      }
    });

    target.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
      this.mouse.isHovering = false;
    });

    window.addEventListener('resize', () => {
      this.initBounds();
    });
  }

  createParticles() {
    this.particles = [];
    let count = 60;
    if (this.options.count) {
      count = this.options.count;
    } else if (this.options.isOverlay) {
      count = Math.floor((this.width * this.height) / 18000);
      count = Math.max(50, Math.min(count, 95));
    } else {
      if (this.type === 'cyber-dust') count = 75;
      if (this.type === 'constellation') count = 48;
      if (this.type === 'spark-burst') count = 85;
    }

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createSingleParticle());
    }
  }

  createSingleParticle(customX, customY, isBurst = false) {
    const x = customX !== undefined ? customX : Math.random() * this.width;
    const y = customY !== undefined ? customY : Math.random() * this.height;

    if (this.type === 'cyber-dust') {
      return {
        x,
        y,
        size: Math.random() * 2.2 + 0.6,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45 - 0.15,
        alpha: Math.random() * 0.7 + 0.25,
        depth: Math.random() * 0.8 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        color: Math.random() > 0.3 ? '#00f0ff' : '#a855f7'
      };
    }

    if (this.type === 'constellation') {
      return {
        x,
        y,
        size: Math.random() * 2.2 + 1.1,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        alpha: Math.random() * 0.55 + 0.3,
        color: Math.random() > 0.4 ? '#00f0ff' : '#ffffff'
      };
    }

    if (this.type === 'spark-burst') {
      const angle = Math.random() * Math.PI * 2;
      const speed = isBurst ? Math.random() * 4.5 + 1.5 : Math.random() * 1.2 + 0.3;
      return {
        x,
        y,
        size: Math.random() * 2.8 + 0.8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isBurst ? 1.5 : 0.4),
        gravity: 0.02,
        life: isBurst ? 1.0 : Math.random() * 0.8 + 0.2,
        decay: isBurst ? Math.random() * 0.02 + 0.012 : 0,
        alpha: Math.random() * 0.8 + 0.2,
        color: ['#00f0ff', '#ffffff', '#a855f7', '#f59e0b'][Math.floor(Math.random() * 4)]
      };
    }
  }

  burstAt(x, y) {
    const burstCount = 28;
    for (let i = 0; i < burstCount; i++) {
      this.particles.push(this.createSingleParticle(x, y, true));
    }
  }

  updateAndDraw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // ==========================================
    // TYPE 1: CYBER DUST
    // ==========================================
    if (this.type === 'cyber-dust') {
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.x += p.vx * p.depth;
        p.y += p.vy * p.depth;

        // Wrap edges
        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;
        if (p.y < 0) p.y = this.height;
        if (p.y > this.height) p.y = 0;

        // Cursor gentle displacement
        if (this.mouse.x !== null) {
          const dx = this.mouse.x - p.x;
          const dy = this.mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < this.mouse.radius) {
            const force = (1 - dist / this.mouse.radius) * 1.5;
            p.x -= (dx / dist) * force * 2;
            p.y -= (dy / dist) * force * 2;
          }
        }

        // Draw glowing particle
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = p.color;
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    // ==========================================
    // TYPE 2: CONSTELLATION NETWORK
    // ==========================================
    if (this.type === 'constellation') {
      const maxDist = this.options.isOverlay ? 130 : 90;

      // Connect lines between nearby particles
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const p1 = this.particles[i];
          const p2 = this.particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = '#00f0ff';
            this.ctx.globalAlpha = (1 - dist / maxDist) * (this.options.isOverlay ? 0.22 : 0.28);
            this.ctx.lineWidth = 0.8;
            this.ctx.stroke();
          }
        }
      }

      // Update & Draw particles
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls
        if (p.x < 0 || p.x > this.width) p.vx *= -1;
        if (p.y < 0 || p.y > this.height) p.vy *= -1;

        // Mouse magnetic connection & pull
        if (this.mouse.x !== null) {
          const dx = this.mouse.x - p.x;
          const dy = this.mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(this.mouse.x, this.mouse.y);
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.globalAlpha = (1 - dist / 130) * 0.45;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            p.x += (dx / dist) * 0.7;
            p.y += (dy / dist) * 0.7;
          }
        }

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = p.color;
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    // ==========================================
    // TYPE 3: SPARK BURST & SHIMMER
    // ==========================================
    if (this.type === 'spark-burst') {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;

        if (p.decay > 0) {
          p.life -= p.decay;
          if (p.life <= 0) {
            this.particles.splice(i, 1);
            continue;
          }
        } else {
          // Recycle natural sparks
          if (p.y > this.height || p.x < 0 || p.x > this.width) {
            p.x = Math.random() * this.width;
            p.y = this.height + 10;
            p.vy = -(Math.random() * 1.8 + 0.8);
            p.vx = (Math.random() - 0.5) * 1.2;
          }
        }

        // Draw spark ember
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.decay > 0 ? p.life : p.alpha;
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = p.color;
        this.ctx.fill();
        this.ctx.restore();
      }
    }
  }

  animate() {
    this.updateAndDraw();
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
