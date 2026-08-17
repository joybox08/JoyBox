/* =========================================================
   JoyBox · New Arrivals Banner Slider
   - 3s autoplay with reset on manual interaction
   - Prev/Next + dot navigation
   - Hover-to-pause (desktop), swipe (touch)
   - Keyboard navigation
   - Reduced motion support
   - No memory leaks, no duplicate timers
   ========================================================= */

(() => {
  'use strict';

  const AUTOPLAY_MS = 3000;
  const SWIPE_THRESHOLD = 50;
  const PROGRESS_TICK_MS = 60;

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('[data-new-arrivals-slider]');
    if (!root) return;

    const slides = Array.from(root.querySelectorAll('[data-new-arrivals-slide]'));
    const prevBtn = root.querySelector('[data-new-arrivals-prev]');
    const nextBtn = root.querySelector('[data-new-arrivals-next]');
    const dotsContainer = root.querySelector('[data-new-arrivals-dots]');
    const progressBar = root.querySelector('[data-new-arrivals-progress]');

    if (!slides.length) return;

    const total = slides.length;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    let currentIndex = 0;
    let autoplayTimer = null;
    let progressTimer = null;
    let progressStart = 0;
    let progressElapsed = 0;
    let isPaused = false;
    let isTransitioning = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchTracking = false;

    /* ---------- Build dots ---------- */
    const dots = [];
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'new-arrival-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dot.dataset.index = String(i);
        dotsContainer.appendChild(dot);
        dots.push(dot);
      });
    }

    /* ---------- Helpers ---------- */
    const clearTimers = () => {
      if (autoplayTimer) {
        clearTimeout(autoplayTimer);
        autoplayTimer = null;
      }
      if (progressTimer) {
        clearInterval(progressTimer);
        progressTimer = null;
      }
    };

    const updateProgress = () => {
      if (!progressBar) return;
      const total = AUTOPLAY_MS;
      const ratio = Math.min(1, progressElapsed / total);
      progressBar.style.width = `${(ratio * 100).toFixed(2)}%`;
    };

    const startAutoplay = () => {
      if (prefersReducedMotion) return;
      clearTimers();
      if (isPaused) return;

      progressStart = Date.now() - progressElapsed;
      progressTimer = setInterval(() => {
        progressElapsed = Date.now() - progressStart;
        if (progressElapsed >= AUTOPLAY_MS) {
          progressElapsed = AUTOPLAY_MS;
          updateProgress();
        } else {
          updateProgress();
        }
      }, PROGRESS_TICK_MS);

      autoplayTimer = setTimeout(() => {
        goTo(currentIndex + 1, true);
      }, Math.max(50, AUTOPLAY_MS - progressElapsed));
    };

    const goTo = (nextIndex, isAuto = false) => {
      if (isTransitioning) return;
      const target = ((nextIndex % total) + total) % total;
      if (target === currentIndex) {
        // Reset autoplay if same slide requested
        progressElapsed = 0;
        if (!isAuto) startAutoplay();
        return;
      }

      isTransitioning = true;

      const currentSlide = slides[currentIndex];
      const nextSlide = slides[target];

      // Mark leaving for reverse direction animation feel
      currentSlide.classList.remove('is-active');
      currentSlide.classList.add('is-leaving');
      currentSlide.setAttribute('aria-hidden', 'true');

      // Force reflow so the transition runs cleanly
      // eslint-disable-next-line no-unused-expressions
      nextSlide.offsetHeight;

      nextSlide.classList.remove('is-leaving');
      nextSlide.classList.add('is-active');
      nextSlide.setAttribute('aria-hidden', 'false');

      // Update dots
      if (dots.length) {
        dots.forEach((dot, i) => {
          const isActive = i === target;
          dot.classList.toggle('is-active', isActive);
          dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
      }

      const previousIndex = currentIndex;
      currentIndex = target;
      progressElapsed = 0;

      // Clean up leaving class after transition
      setTimeout(() => {
        currentSlide.classList.remove('is-leaving');
        isTransitioning = false;
      }, 950);

      // Restart autoplay unless this was triggered by autoplay itself
      if (!isAuto) {
        startAutoplay();
      } else {
        // Continue autoplay chain
        startAutoplay();
      }

      // Suppress lint warning for unused
      void previousIndex;
    };

    /* ---------- Pause / resume on hover (desktop only) ---------- */
    const pause = () => {
      if (isPaused) return;
      isPaused = true;
      root.classList.add('is-paused');
      clearTimers();
    };

    const resume = () => {
      if (!isPaused) return;
      isPaused = false;
      root.classList.remove('is-paused');
      startAutoplay();
    };

    root.addEventListener('mouseenter', () => {
      if (!isCoarsePointer) pause();
    });

    root.addEventListener('mouseleave', () => {
      if (!isCoarsePointer) resume();
    });

    // Pause when tab is hidden, resume when visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearTimers();
      } else if (!isPaused) {
        progressElapsed = 0;
        startAutoplay();
      }
    });

    /* ---------- Controls ---------- */
    prevBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      goTo(currentIndex - 1);
    });

    nextBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      goTo(currentIndex + 1);
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = Number(dot.dataset.index);
        if (!Number.isNaN(idx)) goTo(idx);
      });
    });

    /* ---------- Keyboard navigation ---------- */
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(currentIndex + 1);
      }
    });

    /* ---------- Touch / swipe ---------- */
    root.addEventListener('touchstart', (e) => {
      if (!e.touches || e.touches.length !== 1) return;
      touchTracking = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      pause();
    }, { passive: true });

    root.addEventListener('touchmove', (e) => {
      if (!touchTracking || !e.touches || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        e.preventDefault();
      }
    }, { passive: false });

    root.addEventListener('touchend', (e) => {
      if (!touchTracking) return;
      touchTracking = false;
      const touch = e.changedTouches && e.changedTouches[0];
      if (!touch) {
        resume();
        return;
      }
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      // Only treat as horizontal swipe
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
        if (dx < 0) {
          goTo(currentIndex + 1);
        } else {
          goTo(currentIndex - 1);
        }
      }
      // Small delay so swipe completion doesn't immediately resume mid-transition
      setTimeout(resume, 300);
    }, { passive: true });

    root.addEventListener('touchcancel', () => {
      touchTracking = false;
      setTimeout(resume, 300);
    });

    /* ---------- Pause when off-screen (performance + UX) ---------- */
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              progressElapsed = 0;
              if (!isPaused) startAutoplay();
            } else {
              clearTimers();
            }
          });
        },
        { threshold: 0.25 }
      );
      observer.observe(root);
    }

    /* ---------- Initial state ---------- */
    slides.forEach((slide, i) => {
      if (i === 0) {
        slide.classList.add('is-active');
        slide.setAttribute('aria-hidden', 'false');
      } else {
        slide.setAttribute('aria-hidden', 'true');
      }
    });

    // Kick off autoplay
    progressElapsed = 0;
    updateProgress();
    startAutoplay();
  });
})();
