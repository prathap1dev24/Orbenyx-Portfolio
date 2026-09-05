/**
 * ORBENYX CINEMATIC PAGE TRANSITIONS ENGINE
 * Inspired by reference recording (Video Multi-Slat Curtain to Pure White Background)
 * 
 * 1. Horizontal Slat Curtain (Exact video reference: Staggered horizontal panels wiping into pure white)
 * 2. Vertical Strip Cascade (Staggered vertical blinds wiping into pure white)
 * 3. Cyber Iris Shutter (Radial circular mask opening into pure white)
 * 4. Dual Diagonal Split (Obsidian geometric shards wiping into pure white)
 */

import gsap from 'gsap';

export class TransitionLab {
  constructor() {
    this.overlay = document.getElementById('transition-overlay-container');
    this.isPlaying = false;
    this.initControls();
  }

  initControls() {
    document.querySelectorAll('.btn-trigger-transition').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const type = e.currentTarget.getAttribute('data-transition-type');
        const targetSection = e.currentTarget.getAttribute('data-target-section') || '#white-studio-experience';
        this.playTransition(type, targetSection);
      });
    });

    // Also connect any quick-jump triggers
    document.querySelectorAll('.btn-trigger-white-transition').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.playTransition('video-horizontal-curtain', '#white-studio-experience');
      });
    });
  }

  playTransition(type, targetSection = '#white-studio-experience') {
    if (this.isPlaying || !this.overlay) return;
    this.isPlaying = true;

    // Clear previous overlay DOM
    this.overlay.innerHTML = '';
    this.overlay.className = `transition-overlay-container active type-${type}`;

    if (type === 'video-horizontal-curtain' || type === 'horizontal-slats') {
      this.runHorizontalCurtain(targetSection);
    } else if (type === 'vertical-strips') {
      this.runVerticalStrips(targetSection);
    } else if (type === 'cyber-iris') {
      this.runCyberIris(targetSection);
    } else if (type === 'diagonal-split') {
      this.runDiagonalSplit(targetSection);
    }
  }

  // =========================================================================
  // 1. HORIZONTAL SLAT CURTAIN (EXACT VIDEO RECORDING REPLICA)
  // 5 Staggered horizontal black panels sliding down in a wave to reveal white
  // =========================================================================
  runHorizontalCurtain(targetSection) {
    const slatCount = 5;
    const slatsWrapper = document.createElement('div');
    slatsWrapper.className = 'strips-wrapper horizontal video-ref';

    for (let i = 0; i < slatCount; i++) {
      const slat = document.createElement('div');
      slat.className = 'transition-strip horizontal video-slat';
      slat.innerHTML = `<div class="slat-hairline"></div>`;
      slatsWrapper.appendChild(slat);
    }

    const brandCenter = document.createElement('div');
    brandCenter.className = 'transition-brand-badge video-style';
    brandCenter.innerHTML = `
      <span class="badge-icon">◈</span>
      <span class="badge-title">ORBENYX STUDIO</span>
      <span class="badge-sub">TRANSITION // PURE WHITE BACKGROUND</span>
    `;

    this.overlay.appendChild(slatsWrapper);
    this.overlay.appendChild(brandCenter);

    const slats = slatsWrapper.querySelectorAll('.transition-strip.horizontal');

    const tl = gsap.timeline({
      onComplete: () => {
        this.overlay.className = 'transition-overlay-container';
        this.overlay.innerHTML = '';
        this.isPlaying = false;
      }
    });

    // Step 1: Slats slide down from top with a cascade stagger
    tl.set(slats, { yPercent: -100 })
      .set(brandCenter, { opacity: 0, scale: 0.9 })
      .to(slats, {
        yPercent: 0,
        duration: 0.65,
        stagger: { each: 0.08, from: 'start' },
        ease: 'power3.inOut'
      })
      .to(brandCenter, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }, '-=0.2')
      .add(() => {
        // Scroll target section into view mid-transition behind the curtains
        const targetEl = document.querySelector(targetSection);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      })
      .to(brandCenter, { opacity: 0, scale: 1.08, duration: 0.25, delay: 0.35, ease: 'power2.in' })
      // Step 2: Slats slide down out of view, cleanly revealing the white background
      .to(slats, {
        yPercent: 100,
        duration: 0.65,
        stagger: { each: 0.08, from: 'start' },
        ease: 'power3.inOut'
      }, '-=0.1');
  }

  // =========================================================================
  // 2. VERTICAL STRIP CASCADE (TO WHITE BACKGROUND)
  // =========================================================================
  runVerticalStrips(targetSection) {
    const stripCount = 6;
    const stripsWrapper = document.createElement('div');
    stripsWrapper.className = 'strips-wrapper vertical';

    for (let i = 0; i < stripCount; i++) {
      const strip = document.createElement('div');
      strip.className = 'transition-strip vertical';
      strip.innerHTML = `<div class="strip-glow"></div>`;
      stripsWrapper.appendChild(strip);
    }

    const brandCenter = document.createElement('div');
    brandCenter.className = 'transition-brand-badge';
    brandCenter.innerHTML = `
      <span class="badge-icon">◈</span>
      <span class="badge-title">ORBENYX STUDIO</span>
      <span class="badge-sub">TRANSITION // VERTICAL STRIP CASCADE</span>
    `;

    this.overlay.appendChild(stripsWrapper);
    this.overlay.appendChild(brandCenter);

    const strips = stripsWrapper.querySelectorAll('.transition-strip');

    const tl = gsap.timeline({
      onComplete: () => {
        this.overlay.className = 'transition-overlay-container';
        this.overlay.innerHTML = '';
        this.isPlaying = false;
      }
    });

    tl.set(strips, { yPercent: -100 })
      .set(brandCenter, { opacity: 0, scale: 0.85 })
      .to(strips, {
        yPercent: 0,
        duration: 0.65,
        stagger: { each: 0.06, from: 'start' },
        ease: 'power3.inOut'
      })
      .to(brandCenter, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.5)' }, '-=0.25')
      .add(() => {
        const targetEl = document.querySelector(targetSection);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      })
      .to(brandCenter, { opacity: 0, scale: 1.1, duration: 0.25, delay: 0.35, ease: 'power2.in' })
      .to(strips, {
        yPercent: 100,
        duration: 0.65,
        stagger: { each: 0.06, from: 'start' },
        ease: 'power3.inOut'
      }, '-=0.1');
  }

  // =========================================================================
  // 3. CYBER IRIS / RADIAL CIRCLE EXPANSION
  // =========================================================================
  runCyberIris(targetSection) {
    const irisRing = document.createElement('div');
    irisRing.className = 'transition-iris-circle';

    const brandCenter = document.createElement('div');
    brandCenter.className = 'transition-brand-badge';
    brandCenter.innerHTML = `
      <span class="badge-icon">◎</span>
      <span class="badge-title">ORBENYX STUDIO</span>
      <span class="badge-sub">TRANSITION // RADIAL IRIS APERTURE</span>
    `;

    this.overlay.appendChild(irisRing);
    this.overlay.appendChild(brandCenter);

    const tl = gsap.timeline({
      onComplete: () => {
        this.overlay.className = 'transition-overlay-container';
        this.overlay.innerHTML = '';
        this.isPlaying = false;
      }
    });

    tl.set(irisRing, { scale: 0, opacity: 1 })
      .set(brandCenter, { opacity: 0, scale: 0.8 })
      .to(irisRing, {
        scale: 1,
        duration: 0.7,
        ease: 'power4.inOut'
      })
      .to(brandCenter, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.5)' }, '-=0.3')
      .add(() => {
        const targetEl = document.querySelector(targetSection);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      })
      .to(brandCenter, { opacity: 0, scale: 1.1, duration: 0.25, delay: 0.35, ease: 'power2.in' })
      .to(irisRing, {
        scale: 0,
        opacity: 0,
        duration: 0.65,
        ease: 'power4.inOut'
      }, '-=0.1');
  }

  // =========================================================================
  // 4. DUAL DIAGONAL SHARD SPLIT (CLEAN SHARDS WITHOUT SMALL BADGE)
  // =========================================================================
  runDiagonalSplit(targetSection) {
    const shardTop = document.createElement('div');
    shardTop.className = 'transition-diagonal-shard top';

    const shardBottom = document.createElement('div');
    shardBottom.className = 'transition-diagonal-shard bottom';

    this.overlay.appendChild(shardTop);
    this.overlay.appendChild(shardBottom);

    const tl = gsap.timeline({
      onComplete: () => {
        this.overlay.className = 'transition-overlay-container';
        this.overlay.innerHTML = '';
        this.isPlaying = false;
      }
    });

    tl.set(shardTop, { xPercent: -100, yPercent: -100 })
      .set(shardBottom, { xPercent: 100, yPercent: 100 })
      .to([shardTop, shardBottom], {
        xPercent: 0,
        yPercent: 0,
        duration: 0.60,
        ease: 'power3.inOut'
      })
      .add(() => {
        const targetEl = document.querySelector(targetSection);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      })
      .to(shardTop, {
        xPercent: 100,
        yPercent: 100,
        duration: 0.60,
        ease: 'power3.inOut'
      }, '+=0.04')
      .to(shardBottom, {
        xPercent: -100,
        yPercent: -100,
        duration: 0.60,
        ease: 'power3.inOut'
      }, '<');
  }
}
