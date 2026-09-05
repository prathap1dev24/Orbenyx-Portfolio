import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ParticleSystem } from './particles.js';

// Force browser to start from the top (First Fragment Component) on every page refresh/reload
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

gsap.registerPlugin(ScrollTrigger);

/* ==========================================================================
   CONFIG & STATE FOR DUAL SEQUENCES
   ========================================================================== */
const CONFIG = {
  headerHeight: 64,
  seq1: {
    id: 'sequence-canvas-1',
    containerId: '#sequence-container-1',
    frameCount: 240,
    pattern: (i) => `/sequence1/frame_${String(i).padStart(3, '0')}.webp`,
    name: 'SEQ 01 // LOGO EXPLODE'
  },
  seq2: {
    id: 'sequence-canvas-2',
    containerId: '#sequence-container-2',
    frameCount: 120,
    pattern: (i) => `/sequence2/frame_${String(i).padStart(3, '0')}.webp`,
    name: 'SEQ 02 // ROCK REVEAL'
  }
};

const state = {
  seq1: {
    currentFrame: 0,
    images: [],
    loaded: 0
  },
  seq2: {
    currentFrame: 0,
    images: [],
    loaded: 0
  },
  activeSeq: 1
};

/* ==========================================================================
   1. LENIS SMOOTH SCROLL INITIALIZATION
   ========================================================================== */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 0.95,
  touchMultiplier: 1.5,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

/* ==========================================================================
   2. CANVAS 2D RENDERING PIPELINE FOR BOTH SEQUENCES
   ========================================================================== */
const canvas1 = document.getElementById(CONFIG.seq1.id);
const ctx1 = canvas1 ? canvas1.getContext('2d', { alpha: false }) : null;

const canvas2 = document.getElementById(CONFIG.seq2.id);
const ctx2 = canvas2 ? canvas2.getContext('2d', { alpha: false }) : null;

let dpr = Math.min(window.devicePixelRatio || 1, 2.5);

function resizeAllCanvases() {
  dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const width = window.innerWidth;
  const height = window.innerHeight - CONFIG.headerHeight;

  [canvas1, canvas2].forEach((c, idx) => {
    if (!c) return;
    c.width = Math.floor(width * dpr);
    c.height = Math.floor(height * dpr);
    c.style.width = `${width}px`;
    c.style.height = `${height}px`;

    const ctx = idx === 0 ? ctx1 : ctx2;
    if (ctx) {
      // Cleanly reset transform matrix to prevent compounding scale distortions on resize
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  });

  renderFrame(1, state.seq1.currentFrame);
  renderFrame(2, state.seq2.currentFrame);

  if (heroParticlesSystem) {
    heroParticlesSystem.initBounds();
  }
}

// Debounced resize handler to smoothly handle switching between mobile DevTools and desktop view
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    resizeAllCanvases();
    ScrollTrigger.refresh();
  }, 100);
});

function drawCanvasFrame(image, context, targetWidth, targetHeight) {
  if (!image) return;

  const imgWidth = image.width || 1920;
  const imgHeight = image.height || 1080;

  // Occupies full width and full height on both mobile and desktop views
  const hRatio = targetWidth / imgWidth;
  const vRatio = targetHeight / imgHeight;
  const ratio = Math.max(hRatio, vRatio);

  const drawW = imgWidth * ratio;
  const drawH = imgHeight * ratio;
  const centerShiftX = (targetWidth - drawW) / 2;
  const centerShiftY = (targetHeight - drawH) / 2;

  context.drawImage(
    image,
    0, 0, imgWidth, imgHeight,
    centerShiftX, centerShiftY, drawW, drawH
  );
}

function renderFrame(seqIndex, frameIndex) {
  const width = window.innerWidth;
  const height = window.innerHeight - CONFIG.headerHeight;

  const ctx = seqIndex === 1 ? ctx1 : ctx2;
  const seqState = seqIndex === 1 ? state.seq1 : state.seq2;

  if (!ctx) return;

  ctx.fillStyle = '#060709';
  ctx.fillRect(0, 0, width, height);

  const img = seqState.images[frameIndex];
  if (img && img.complete) {
    drawCanvasFrame(img, ctx, width, height);
  }
}

/* ==========================================================================
   3. ASSET PRELOADER (LOADS BOTH SEQUENCES CONCURRENTLY)
   ========================================================================== */
const preloader = document.getElementById('preloader');
const progressBar = document.getElementById('loader-progress-bar');
const percentageText = document.getElementById('loader-percentage');
const statusText = document.getElementById('loader-status');

function updateLoaderUI(progressFraction) {
  const percent = Math.min(Math.round(progressFraction * 100), 100);
  if (progressBar) progressBar.style.width = `${percent}%`;
  if (percentageText) percentageText.textContent = `${percent}%`;
}

async function checkManifests() {
  try {
    const res1 = await fetch('/sequence1/manifest.json');
    if (res1.ok) {
      const data1 = await res1.json();
      if (data1.frameCount) CONFIG.seq1.frameCount = data1.frameCount;
    }
  } catch (e) { }

  try {
    const res2 = await fetch('/sequence2/manifest.json');
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2.frameCount) CONFIG.seq2.frameCount = data2.frameCount;
    }
  } catch (e) { }
}

async function preloadAllSequences() {
  await checkManifests();

  const totalFrames = CONFIG.seq1.frameCount + CONFIG.seq2.frameCount;
  let totalLoaded = 0;

  statusText.textContent = `CACHING ${totalFrames} 1080P WEBP FRAMES...`;

  const loadSequence = (seqConfig, seqState, seqNum) => {
    return new Promise((resolve) => {
      let loaded = 0;
      for (let i = 0; i < seqConfig.frameCount; i++) {
        const img = new Image();
        img.src = seqConfig.pattern(i + 1);
        img.onload = () => {
          seqState.images[i] = img;
          loaded++;
          totalLoaded++;
          updateLoaderUI(totalLoaded / totalFrames);
          if (loaded === seqConfig.frameCount) resolve();
        };
        img.onerror = () => {
          seqState.images[i] = img;
          loaded++;
          totalLoaded++;
          updateLoaderUI(totalLoaded / totalFrames);
          if (loaded === seqConfig.frameCount) resolve();
        };
      }
    });
  };

  await Promise.all([
    loadSequence(CONFIG.seq1, state.seq1, 1),
    loadSequence(CONFIG.seq2, state.seq2, 2)
  ]);

  finishLoading();
}

function finishLoading() {
  setTimeout(() => {
    preloader.classList.add('hidden');
    window.scrollTo(0, 0);
    if (lenis) lenis.scrollTo(0, { immediate: true });
    resizeAllCanvases();
    setupDualScrollTriggers();
    ScrollTrigger.refresh(true);
  }, 300);
}

/* ==========================================================================
   4. DUAL GSAP SCROLLTRIGGER PINNING TIMELINES
   ========================================================================== */
const hudSeqTag = document.getElementById('hud-sequence-tag');
const hudFrameNum = document.getElementById('hud-frame-num');
const hudProgressVal = document.getElementById('hud-progress-val');

/* ==========================================================================
   ROTATING WORD ANIMATION (EVERY 2 SECONDS INFINITELY)
   Engineered for what's next → speed → scale → impact
   ========================================================================== */
function initRotatingWords() {
  const dynamicWordEl = document.getElementById('dynamic-animated-word');
  if (!dynamicWordEl) return;

  const words = ["what's next", "speed", "scale", "impact"];
  let currentIndex = 0;

  setInterval(() => {
    currentIndex = (currentIndex + 1) % words.length;
    const nextWord = words[currentIndex];

    // Dissolving out effect (soft blur dissolve with subtle particle contraction)
    gsap.to(dynamicWordEl, {
      opacity: 0,
      filter: 'blur(10px)',
      scale: 0.94,
      duration: 0.45,
      ease: 'power2.inOut',
      onComplete: () => {
        dynamicWordEl.textContent = nextWord;
        // Forming & materializing effect (smooth de-blur into crisp typography)
        gsap.fromTo(
          dynamicWordEl,
          { opacity: 0, filter: 'blur(12px)', scale: 1.06 },
          { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.6, ease: 'power2.out' }
        );
      }
    });
  }, 2200);
}

const heroIntro1 = document.getElementById('hero-intro-1');
const heroTopLeftGroup = document.getElementById('hero-top-left-group');
const heroBottomRightGroup = document.getElementById('hero-bottom-right-group');
const manifestoContainer = document.getElementById('manifesto-reveal-container');

const rockCenterDisciplines = document.getElementById('rock-center-disciplines');
const heroIntro2 = document.getElementById('hero-intro-2');
const seq1FrameNumEl = document.getElementById('seq1-frame-num');

/* ==========================================================================
   LETTER-BY-LETTER MANIFESTO SPLITTER
   ========================================================================== */
function initManifestoLetters() {
  const manifestoEl = document.getElementById('manifesto-letter-text');
  if (!manifestoEl) return;
  const rawText = manifestoEl.textContent.trim().replace(/\s+/g, ' ');
  manifestoEl.innerHTML = '';

  for (let i = 0; i < rawText.length; i++) {
    const char = rawText[i];
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = char;
    manifestoEl.appendChild(span);
  }
}

function setupDualScrollTriggers() {
  // =========================================================================
  // SEQUENCE 01 SCROLL TIMELINE (LOGO EXPLODE / FRAGMENT SEQUENCE)
  // Followed by Vertical Strips Transition & Who We Are Split Overlay
  // =========================================================================
  const verticalStrips1 = document.querySelectorAll('#sequence-container-1 .vertical-strip-panel');
  const stripsOverlay = document.getElementById('strips-who-we-are-overlay');
  const splitLeftContent = document.getElementById('split-left-content');
  const splitRightContainer = document.getElementById('white-split-right');
  const splitDivider = document.getElementById('white-split-divider');
  const card1 = document.getElementById('split-card-1');
  const card2 = document.getElementById('split-card-2');
  const card3 = document.getElementById('split-card-3');
  const desc1 = document.getElementById('split-desc-1');
  const desc2 = document.getElementById('split-desc-2');
  const desc3 = document.getElementById('split-desc-3');

  if (verticalStrips1.length > 0) {
    gsap.set(verticalStrips1, { yPercent: -101 });
  }
  if (stripsOverlay) {
    gsap.set(stripsOverlay, { opacity: 0, visibility: 'hidden' });
  }
  if (splitLeftContent) {
    gsap.set(splitLeftContent, { opacity: 0, x: 75, filter: 'blur(10px)' });
  }
  if (splitRightContainer) {
    gsap.set(splitRightContainer, { opacity: 1 });
  }
  if (splitDivider) {
    gsap.set(splitDivider, { scaleY: 0, opacity: 0 });
  }
  const isMobile = window.innerWidth <= 768;
  const cardExpandScale = isMobile ? 1.0 : 1.25;
  const cardYOffset1 = isMobile ? 0 : 130;
  const cardYOffset3 = isMobile ? 0 : -130;
  const cardXStart = isMobile ? 0 : -35;
  const cardInitScale = isMobile ? 0.92 : 0.35;
  const cardInitBlur = isMobile ? '4px' : '8px';

  if (card1) {
    gsap.set(card1, { opacity: 0, x: cardXStart, y: cardYOffset1, scale: cardInitScale, filter: `blur(${cardInitBlur})`, zIndex: 1 });
  }
  if (desc1) {
    gsap.set(desc1, { opacity: 0, y: 12, filter: 'blur(4px)' });
  }
  if (card2) {
    gsap.set(card2, { opacity: 0, x: cardXStart, y: 0, scale: cardInitScale, filter: `blur(${cardInitBlur})`, zIndex: 1 });
  }
  if (desc2) {
    gsap.set(desc2, { opacity: 0, y: 12, filter: 'blur(4px)' });
  }
  if (card3) {
    gsap.set(card3, { opacity: 0, x: cardXStart, y: cardYOffset3, scale: cardInitScale, filter: `blur(${cardInitBlur})`, zIndex: 1 });
  }
  if (desc3) {
    gsap.set(desc3, { opacity: 0, y: 12, filter: 'blur(4px)' });
  }

  const tl1 = gsap.timeline({
    scrollTrigger: {
      trigger: CONFIG.seq1.containerId,
      start: 'top 64px',
      end: '+=1100%',
      pin: true,
      pinSpacing: true,
      scrub: 0.5,
      onUpdate: (self) => {
        const progress = self.progress;

        // Sequence 1 plays all 240 frames from progress 0.00 to 0.30 (6.0s / 20.0s)
        const seqProg = Math.min(progress / 0.30, 1);
        const frameIndex = Math.min(
          Math.floor(seqProg * CONFIG.seq1.frameCount),
          CONFIG.seq1.frameCount - 1
        );
        state.seq1.currentFrame = frameIndex;
        renderFrame(1, frameIndex);

        if (self.isActive) {
          if (hudSeqTag) hudSeqTag.textContent = CONFIG.seq1.name;
          if (hudFrameNum) hudFrameNum.textContent = `${String(frameIndex + 1).padStart(3, '0')} / ${CONFIG.seq1.frameCount}`;
          if (hudProgressVal) hudProgressVal.textContent = `${Math.round(seqProg * 100)}%`;
        }
      }
    }
  });

  // 1. "Engineered for" group starts moving upward and exits
  if (heroTopLeftGroup) {
    tl1.fromTo(
      heroTopLeftGroup,
      { y: 0, opacity: 1 },
      { y: -160, opacity: 0, duration: 1.4, ease: 'none' },
      0.3
    );
  }

  // 2. Brand Statement: Starts rising, reveals letter-by-letter, and stays pinned in center
  initManifestoLetters();
  const charSpans = document.querySelectorAll('#manifesto-letter-text .char');
  if (charSpans.length > 0 && manifestoContainer) {
    // Upward entrance
    tl1.fromTo(
      manifestoContainer,
      { y: 320, opacity: 1 },
      { y: 0, opacity: 1, duration: 2.2, ease: 'none' },
      0.3
    );

    // Letter-by-letter reveal
    tl1.fromTo(
      charSpans,
      { opacity: 0, filter: 'blur(3px)' },
      {
        opacity: 1,
        filter: 'blur(0px)',
        stagger: {
          each: 0.012,
          from: 'start'
        },
        duration: 2.2,
        ease: 'none'
      },
      0.5
    );

    // Fade out manifesto text before vertical strips transition begins
    tl1.to(manifestoContainer, { opacity: 0, scale: 0.96, duration: 0.8, ease: 'power2.in' }, 4.6);
  }

  // 3. Three supporting items in right-bottom corner
  if (heroBottomRightGroup) {
    tl1.fromTo(
      heroBottomRightGroup,
      { y: 0, opacity: 1 },
      { y: -160, opacity: 0, duration: 1.4, ease: 'none' },
      0.3
    );
  }

  // 4. VERTICAL STRIPS TRANSITION (Starts immediately after last frame of fragment component at 6.0s)
  if (verticalStrips1.length > 0) {
    tl1.fromTo(
      verticalStrips1,
      { yPercent: -101 },
      {
        yPercent: 0,
        stagger: {
          each: 0.14,
          from: 'start'
        },
        duration: 1.6,
        ease: 'power2.inOut'
      },
      6.0
    );
  }

  // 5. WHO WE ARE SPLIT OVERLAY (100% Scroll-Driven Choreography)
  if (stripsOverlay) {
    // Make overlay visible
    tl1.set(stripsOverlay, { visibility: 'visible', pointerEvents: 'auto' }, 8.0);
    tl1.fromTo(
      stripsOverlay,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power1.out' },
      8.0
    );

    // Center vertical divider line reveals & scales vertically
    if (splitDivider) {
      tl1.fromTo(
        splitDivider,
        { scaleY: 0, opacity: 0 },
        { scaleY: 1, opacity: 1, duration: 1.2, ease: 'power2.out' },
        8.0
      );
    }

    // Step A: Left Section ("Who & What We Are") animates outward from center divider to the left
    if (splitLeftContent) {
      tl1.fromTo(
        splitLeftContent,
        { opacity: 0, x: isMobile ? 0 : 75, filter: 'blur(10px)' },
        { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out' },
        8.15
      );
    }

    // =======================================================================
    // Step B: CARD 01 Animation (Starts ONLY AFTER left text completes at 9.6s)
    // Small from center -> expand width & height (heading only) -> reach full size
    // -> reveal inner description -> shrink to compact -> settle into slot
    // =======================================================================
    if (card1) {
      tl1.set(card1, { zIndex: 10 }, 9.6);
      // 1. Small card emerges and expands in width + height (heading only visible)
      tl1.to(
        card1,
        {
          opacity: 1,
          x: 0,
          y: cardYOffset1,
          scale: cardExpandScale,
          filter: 'blur(0px)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.18)',
          duration: 1.0,
          ease: 'power2.out'
        },
        9.6
      );

      // 2. Once full large size is reached, smoothly reveal inner description
      if (desc1) {
        tl1.to(
          desc1,
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power1.out' },
          10.6
        );
      }

      // 3. Card smoothly scales back down to compact size and settles into top slot
      tl1.to(
        card1,
        {
          scale: 1.0,
          y: 0,
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
          zIndex: 1,
          duration: 0.8,
          ease: 'power2.inOut'
        },
        11.6
      );
    }

    // =======================================================================
    // Step C: CARD 02 Animation (Starts after Card 01 settles at 12.5s)
    // =======================================================================
    if (card2) {
      tl1.set(card2, { zIndex: 10 }, 12.5);
      // 1. Small card emerges and expands in width + height (heading only visible)
      tl1.to(
        card2,
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: cardExpandScale,
          filter: 'blur(0px)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.32)',
          duration: 1.0,
          ease: 'power2.out'
        },
        12.5
      );

      // 2. Once full large size is reached, smoothly reveal inner description
      if (desc2) {
        tl1.to(
          desc2,
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power1.out' },
          13.5
        );
      }

      // 3. Card smoothly scales back down to compact size and settles into middle slot
      tl1.to(
        card2,
        {
          scale: 1.0,
          y: 0,
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.18)',
          zIndex: 1,
          duration: 0.8,
          ease: 'power2.inOut'
        },
        14.5
      );
    }

    // =======================================================================
    // Step D: CARD 03 Animation (Starts after Card 02 settles at 15.4s)
    // =======================================================================
    if (card3) {
      tl1.set(card3, { zIndex: 10 }, 15.4);
      // 1. Small card emerges and expands in width + height (heading only visible)
      tl1.to(
        card3,
        {
          opacity: 1,
          x: 0,
          y: cardYOffset3,
          scale: cardExpandScale,
          filter: 'blur(0px)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.18)',
          duration: 1.0,
          ease: 'power2.out'
        },
        15.4
      );

      // 2. Once full large size is reached, smoothly reveal inner description
      if (desc3) {
        tl1.to(
          desc3,
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power1.out' },
          16.4
        );
      }

      // 3. Card smoothly scales back down to compact size and settles into bottom slot
      tl1.to(
        card3,
        {
          scale: 1.0,
          y: 0,
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
          zIndex: 1,
          duration: 0.8,
          ease: 'power2.inOut'
        },
        17.4
      );
    }

    // Pad end of timeline to 20.0s for prolonged settled reading before unpinning
    tl1.set({}, {}, 20.0);
  }

  // =========================================================================
  // WHITE STUDIO PAGE: WORK & EXPLORATIONS HORIZONTAL GALLERY
  // 100% Scroll-Driven: Intro Appears & Settles -> Then Cards Enter & Stream
  // =========================================================================
  const worksSection = document.getElementById('white-studio-page');
  const worksLeftContent = document.getElementById('works-left-content');
  const worksDivider = document.getElementById('works-split-divider');
  const cardsStream = document.getElementById('works-cards-stream');
  const allWorkCards = document.querySelectorAll('.work-project-card');
  const workCard1 = document.getElementById('work-card-1');
  const workCard5 = document.getElementById('work-card-5');

  if (worksSection && cardsStream) {
    // Keep all cards crisp and ready in the horizontal flex row
    if (allWorkCards.length > 0) {
      gsap.set(allWorkCards, { opacity: 1, x: 0, y: 0, rotation: 0, filter: 'blur(0px)' });
    }

    const getInitialCardsX = () => (window.innerWidth <= 768 ? window.innerWidth * 1.05 : window.innerWidth * 0.6);
    
    // Position cards stream completely off-screen to the right at initial state
    gsap.set(cardsStream, { x: getInitialCardsX() });
    if (worksLeftContent) gsap.set(worksLeftContent, { opacity: 0, y: 40, filter: 'blur(10px)', x: 0 });
    if (worksDivider) gsap.set(worksDivider, { scaleY: 0, opacity: 0, x: 0 });

    const tlWorks = gsap.timeline({
      scrollTrigger: {
        trigger: worksSection,
        start: 'top top',
        end: '+=700%',
        pin: true,
        pinSpacing: true,
        scrub: 0.8
      }
    });

    const getScrollDistance = () => {
      const isMobileView = window.innerWidth <= 768;
      if (isMobileView) {
        if (workCard5 && workCard1) {
          return workCard5.offsetLeft - workCard1.offsetLeft + 16;
        }
        return cardsStream.scrollWidth - window.innerWidth + 32;
      }
      if (workCard5 && workCard1 && workCard5.offsetLeft > 0) {
        // Bring all 5 cards across screen until Card 5 settles in comfortable focus
        return workCard5.offsetLeft - workCard1.offsetLeft + (window.innerWidth * 0.08);
      }
      const cardWidth = workCard1 ? workCard1.offsetWidth : 500;
      const gap = parseFloat(window.getComputedStyle(cardsStream).gap) || 48;
      return (cardWidth + gap) * 4;
    };

    // =======================================================================
    // STAGE 1 (0.0s -> 2.8s): "Work & Explorations" Appears & Settles First
    // (No cards are visible or moving yet - calm, clean introductory focus)
    // =======================================================================
    if (worksLeftContent) {
      tlWorks.to(
        worksLeftContent,
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.4, ease: 'power2.out' },
        0.0
      );
    }

    if (worksDivider) {
      tlWorks.to(
        worksDivider,
        { scaleY: 1, opacity: 1, duration: 1.0, ease: 'power2.out' },
        0.4
      );
    }

    // =======================================================================
    // STAGE 2 (2.8s -> 11.0s): Project Cards Enter from Right & Stream Across
    // =======================================================================
    tlWorks.fromTo(
      cardsStream,
      { x: getInitialCardsX },
      {
        x: () => -getScrollDistance(),
        duration: 8.2,
        ease: 'none'
      },
      2.8
    );

    // On mobile, fade out introductory title smoothly as cards begin flowing across
    if (worksLeftContent && window.innerWidth <= 768) {
      tlWorks.to(
        worksLeftContent,
        { opacity: 0, y: -35, filter: 'blur(6px)', duration: 1.0, ease: 'power1.out' },
        2.8
      );
    }

    // On desktop, gently slide heading and divider slightly for subtle parallax depth
    if (worksLeftContent && window.innerWidth > 768) {
      tlWorks.to(
        worksLeftContent,
        {
          x: () => -getScrollDistance() * 0.3,
          duration: 8.2,
          ease: 'none'
        },
        2.8
      );
    }

    if (worksDivider && window.innerWidth > 768) {
      tlWorks.to(
        worksDivider,
        {
          x: () => -getScrollDistance() * 0.3,
          duration: 8.2,
          ease: 'none'
        },
        2.8
      );
    }

    // =======================================================================
    // STAGE 3 (11.0s -> 12.5s): Settle Pause on Final Card Before Unpinning
    // =======================================================================
    tlWorks.set({}, {}, 12.5);
  }

  // =========================================================================
  // SEQUENCE 02 SCROLL TIMELINE (ROCK CARVING LOGO REVEAL / MONOLITH)
  // =========================================================================
  const rockCap1 = document.getElementById('rock-cap-1');
  const rockCap2 = document.getElementById('rock-cap-2');
  const rockCap3 = document.getElementById('rock-cap-3');
  const rockCap4 = document.getElementById('rock-cap-4');
  const rockCap5 = document.getElementById('rock-cap-5');
  const rockCap6 = document.getElementById('rock-cap-6');

  const leftRockCaps = [rockCap1, rockCap3, rockCap5].filter(Boolean);
  const rightRockCaps = [rockCap2, rockCap4, rockCap6].filter(Boolean);
  const allRockCaps = [...leftRockCaps, ...rightRockCaps];
  const verticalStrips2 = document.querySelectorAll('#sequence-container-2 .vertical-strip-panel');
  if (verticalStrips2.length > 0) {
    gsap.set(verticalStrips2, { yPercent: -101 });
  }

  // Set initial position: above the screen with yPercent: -50 for clean vertical centering (pure CSS handles left/right on desktop and auto margins on mobile)
  if (allRockCaps.length > 0) {
    gsap.set(allRockCaps, { opacity: 0, y: -260, x: 0, xPercent: 0, yPercent: -50, scale: 0.94, filter: 'blur(8px)' });
  }

  const tl2 = gsap.timeline({
    scrollTrigger: {
      trigger: CONFIG.seq2.containerId,
      start: 'top 64px',
      end: '+=900%',
      pin: true,
      pinSpacing: true,
      scrub: 0.8,
      onUpdate: (self) => {
        const progress = self.progress;
        const frameIndex = Math.min(
          Math.floor(progress * CONFIG.seq2.frameCount),
          CONFIG.seq2.frameCount - 1
        );
        state.seq2.currentFrame = frameIndex;
        renderFrame(2, frameIndex);

        if (self.isActive) {
          if (hudSeqTag) hudSeqTag.textContent = CONFIG.seq2.name;
          if (hudFrameNum) hudFrameNum.textContent = `${String(frameIndex + 1).padStart(3, '0')} / ${CONFIG.seq2.frameCount}`;
          if (hudProgressVal) hudProgressVal.textContent = `${Math.round(progress * 100)}%`;
        }
      }
    }
  });

  // Dissolve centered disciplines (DESIGN, DEVELOPMENT, BRANDING) as user scrolls into rock sequence (0.00 -> 0.20)
  if (rockCenterDisciplines) {
    tl2.fromTo(
      rockCenterDisciplines,
      { opacity: 1, y: 0, filter: 'blur(0px)' },
      { opacity: 0, y: -60, filter: 'blur(10px)', duration: 0.20, ease: 'power2.out' },
      0.0
    );
  }

  // =========================================================================
  // CAPABILITIES FLOW (Triggered at Frame 29 = 29/120 ≈ 0.241 progress)
  // Pair 1: Mobile Development & Web Development (Stacked on mobile, side-by-side on desktop)
  // Flow in from Top -> Settle in Center -> Flow out to Bottom (0.24 -> 0.46)
  // =========================================================================
  if (rockCap1 && rockCap2) {
    // Flow in from Top to Center
    tl2.to(
      [rockCap1, rockCap2],
      { opacity: 1, y: 0, x: 0, xPercent: 0, yPercent: -50, scale: 1.0, filter: 'blur(0px)', duration: 0.10, ease: 'power2.out' },
      0.24
    );

    // Flow out from Center to Bottom
    tl2.to(
      [rockCap1, rockCap2],
      { opacity: 0, y: 260, x: 0, xPercent: 0, yPercent: -50, scale: 0.94, filter: 'blur(8px)', duration: 0.06, ease: 'power2.in' },
      0.42
    );
  }

  // =========================================================================
  // Pair 2: Custom Software & SaaS Products
  // Flow in from Top -> Settle in Center -> Flow out to Bottom (0.48 -> 0.70)
  // =========================================================================
  if (rockCap3 && rockCap4) {
    // Flow in from Top to Center
    tl2.to(
      [rockCap3, rockCap4],
      { opacity: 1, y: 0, x: 0, xPercent: 0, yPercent: -50, scale: 1.0, filter: 'blur(0px)', duration: 0.10, ease: 'power2.out' },
      0.48
    );

    // Flow out from Center to Bottom
    tl2.to(
      [rockCap3, rockCap4],
      { opacity: 0, y: 260, x: 0, xPercent: 0, yPercent: -50, scale: 0.94, filter: 'blur(8px)', duration: 0.06, ease: 'power2.in' },
      0.66
    );
  }

  // =========================================================================
  // Pair 3: AI Automation & Digital Marketing
  // Flow in from Top -> Settle in Center -> Flow out to Bottom (0.72 -> 0.94)
  // =========================================================================
  if (rockCap5 && rockCap6) {
    // Flow in from Top to Center
    tl2.to(
      [rockCap5, rockCap6],
      { opacity: 1, y: 0, x: 0, xPercent: 0, yPercent: -50, scale: 1.0, filter: 'blur(0px)', duration: 0.10, ease: 'power2.out' },
      0.72
    );

    // Flow out from Center to Bottom
    tl2.to(
      [rockCap5, rockCap6],
      { opacity: 0, y: 260, x: 0, xPercent: 0, yPercent: -50, scale: 0.94, filter: 'blur(8px)', duration: 0.06, ease: 'power2.in' },
      0.88
    );
  }

  // Vertical strips cascade down after cards flow out (covers screen in pure white)
  if (verticalStrips2.length > 0) {
    tl2.fromTo(
      verticalStrips2,
      { yPercent: -101 },
      {
        yPercent: 0,
        stagger: {
          each: 0.015,
          from: 'start'
        },
        duration: 0.08,
        ease: 'power2.inOut'
      },
      0.92
    );
  }

  // Pad end of timeline so user seamlessly transitions on white screen
  tl2.set({}, {}, 1.0);

  ScrollTrigger.refresh();
}

let heroParticlesSystem = null;

function initHeroSequenceParticles() {
  const heroParticlesCanvas = document.getElementById('sequence-particles-canvas');
  if (heroParticlesCanvas) {
    heroParticlesSystem = new ParticleSystem(heroParticlesCanvas, 'constellation', { isOverlay: true });
  }
}

function initParticleShowcase() {
  const canvas1 = document.getElementById('particle-canvas-1');
  const canvas2 = document.getElementById('particle-canvas-2');
  const canvas3 = document.getElementById('particle-canvas-3');

  if (canvas1) new ParticleSystem(canvas1, 'cyber-dust');
  if (canvas2) new ParticleSystem(canvas2, 'constellation');
  if (canvas3) new ParticleSystem(canvas3, 'spark-burst');
}

/* ==========================================================================
   INITIALIZE ON PAGE LOAD
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
  initManifestoLetters();
  resizeAllCanvases();
  preloadAllSequences();
  initRotatingWords();
  initHeroSequenceParticles();
  initParticleShowcase();
});
