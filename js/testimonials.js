// Testimonials carousel — lightweight, no dependencies
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const viewport = document.querySelector('[data-testimonials-viewport]');
    const track = document.querySelector('[data-testimonials-track]');
    const cards = track ? Array.from(track.querySelectorAll('[data-testimonial]')) : [];
    const prevBtn = document.querySelector('[data-testimonials-prev]');
    const nextBtn = document.querySelector('[data-testimonials-next]');
    const dotsContainer = document.querySelector('[data-testimonials-dots]');

    if (!track || cards.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ROTATION_MS = 4500;
    let currentIndex = 0;
    let timerId = null;

    // Build dot indicators
    if (dotsContainer) {
      dotsContainer.innerHTML = cards
        .map(
          (_, index) =>
            `<button type="button" class="testimonial-dot${index === 0 ? ' is-active' : ''}" role="tab" aria-label="Go to testimonial ${index + 1}" data-testimonial-dot="${index}"></button>`
        )
        .join('');
    }

    function show(index) {
      const total = cards.length;
      currentIndex = ((index % total) + total) % total;
      cards.forEach((card, i) => {
        card.classList.toggle('is-active', i === currentIndex);
      });
      if (dotsContainer) {
        dotsContainer.querySelectorAll('[data-testimonial-dot]').forEach((dot, i) => {
          dot.classList.toggle('is-active', i === currentIndex);
        });
      }
    }

    function next() {
      show(currentIndex + 1);
    }

    function prev() {
      show(currentIndex - 1);
    }

    function startAuto() {
      if (prefersReducedMotion) return;
      stopAuto();
      timerId = window.setInterval(next, ROTATION_MS);
    }

    function stopAuto() {
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        next();
        startAuto();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prev();
        startAuto();
      });
    }

    if (dotsContainer) {
      dotsContainer.addEventListener('click', (event) => {
        const target = event.target.closest('[data-testimonial-dot]');
        if (!target) return;
        const index = Number(target.getAttribute('data-testimonial-dot'));
        if (!Number.isNaN(index)) {
          show(index);
          startAuto();
        }
      });
    }

    // Pause auto-rotation on hover for desktop
    if (viewport) {
      viewport.addEventListener('mouseenter', stopAuto);
      viewport.addEventListener('mouseleave', startAuto);
    }

    // Pause when tab is hidden to save resources
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAuto();
      } else {
        startAuto();
      }
    });

    show(0);
    startAuto();
  });
})();
