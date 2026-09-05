/**
 * ORBENYX HERO PARTICLE NETWORK ENGINE
 * High-performance HTML5 Canvas 2D Constellation Visualizer
 * Ambient magnetic connecting network with cursor interaction and depth shimmer
 */

export class ParticleSystem {
  constructor(canvas, type = 'constellation', options = {}) {
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
      count = 50;
    }

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2.2 + 1.1,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        alpha: Math.random() * 0.55 + 0.3,
        color: Math.random() > 0.4 ? '#ccc5b9' : '#ffffff'
      });
    }
  }

  updateAndDraw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

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
          this.ctx.strokeStyle = 'rgba(204, 197, 185, 0.4)';
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
