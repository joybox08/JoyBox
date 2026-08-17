document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const heroHeadline = document.querySelector('.hero__headline');
  const heroLines = heroHeadline ? heroHeadline.querySelectorAll('.line') : [];

  if (heroHeadline && heroLines.length) {
    heroHeadline.classList.add('is-animated');
    heroLines.forEach((line, index) => {
      line.style.transitionDelay = `${index * 120}ms`;
    });
  }

  const heroVisual = document.querySelector('.hero__image-card');
  if (heroVisual && !prefersReducedMotion) {
    const updateParallax = () => {
      const scrollY = window.scrollY;
      const offset = Math.max(0, scrollY * 0.08);
      heroVisual.style.transform = `translateY(${offset}px)`;
    };

    const tick = () => {
      updateParallax();
      window.requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (!heroVisual.dataset.rafBound) {
        heroVisual.dataset.rafBound = 'true';
        window.requestAnimationFrame(tick);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const revealItems = document.querySelectorAll('.reveal-home');
  if ('IntersectionObserver' in window && revealItems.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
});
