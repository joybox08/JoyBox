document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.faq-item');

  items.forEach((item) => {
    const button = item.querySelector('.faq-question');
    if (!button) return;

    button.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      items.forEach((entry) => {
        entry.classList.remove('is-open');
      });

      if (!isOpen) {
        item.classList.add('is-open');
      }
    });
  });

  const revealItems = document.querySelectorAll('.reveal-contact');
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
      { threshold: 0.14 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
});
