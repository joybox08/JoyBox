document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('navbar-container');
  if (!container) return;

  const pages = [
    { href: 'index.html', label: 'Home', page: 'home' },
    { href: 'about.html', label: 'About', page: 'about' },
    { href: 'hampers.html', label: 'Hampers', page: 'hampers' },
    { href: 'gothic.html', label: 'Gothic', page: 'gothic' },
    { href: 'bracelets.html', label: 'Bracelets', page: 'bracelets' },
    { href: 'pendants.html', label: 'Pendants', page: 'pendants' },
    { href: 'earring.html', label: 'Earring', page: 'earrings' },
    { href: 'keychain.html', label: 'Keychain', page: 'keychains' },
    { href: 'contact.html', label: 'Contact Us', page: 'contact' },
    { href: 'product.html', label: 'Product', page: 'product' }
  ];

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const currentPage = pages.find((page) => page.href === currentPath) || pages[0];

  const navHTML = `
    <nav class="navbar" aria-label="Main navigation">
      <div class="navbar__inner">
        <a class="navbar__brand" href="index.html">JOYBO<span class="navbar__brand-strong">X</span></a>

        <div class="navbar__links" role="menubar">
          <a class="nav-link ${currentPage.page === 'home' ? 'active' : ''}" href="index.html">Home</a>
          <a class="nav-link ${currentPage.page === 'about' ? 'active' : ''}" href="about.html">About</a>

          <div class="navbar__dropdown" data-dropdown>
            <button class="navbar__dropdown-toggle nav-link ${['hampers', 'gothic', 'bracelets', 'pendants', 'earrings', 'keychains'].includes(currentPage.page) ? 'active' : ''}" type="button" aria-expanded="false">
              <span>Collection</span>
              <span class="caret">▾</span>
            </button>
            <div class="navbar__dropdown-panel" role="menu">
              <a href="hampers.html" role="menuitem">Hampers</a>
              <a href="gothic.html" role="menuitem">Gothic</a>
              <a href="bracelets.html" role="menuitem">Bracelets</a>
              <a href="pendants.html" role="menuitem">Pendants</a>
              <a href="earring.html" role="menuitem">Earring</a>
              <a href="keychain.html" role="menuitem">Keychain</a>
            </div>
          </div>

          <a class="nav-link ${currentPage.page === 'contact' ? 'active' : ''}" href="contact.html">Contact Us</a>
          <a class="navbar__icon-link" href="https://www.instagram.com/joybox.08/" target="_blank" rel="noreferrer noopener" aria-label="Visit JoyBox on Instagram">Instagram</a>
        </div>

        <button class="navbar__mobile-toggle" type="button" aria-label="Open menu" aria-expanded="false">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>

    <div class="navbar__mobile-backdrop" hidden></div>
    <div class="navbar__mobile-menu" aria-hidden="true">
      <div class="navbar__mobile-header">
        <a class="navbar__brand" href="index.html">JOYBO<span class="navbar__brand-strong">X</span></a>
        <button class="navbar__mobile-close" type="button" aria-label="Close menu">✕</button>
      </div>
      <div class="navbar__mobile-nav">
        <a href="index.html">Home</a>
        <a href="about.html">About</a>
        <button class="navbar__mobile-collection-toggle" type="button" aria-expanded="false">Collection</button>
        <div class="navbar__mobile-submenu">
          <a href="hampers.html">Hampers</a>
          <a href="gothic.html">Gothic</a>
          <a href="bracelets.html">Bracelets</a>
          <a href="pendants.html">Pendants</a>
          <a href="earring.html">Earring</a>
          <a href="keychain.html">Keychain</a>
        </div>
        <a href="contact.html">Contact Us</a>
        <a href="https://www.instagram.com/joybox.08/" target="_blank" rel="noreferrer noopener">Instagram</a>
      </div>
    </div>
  `;

  container.innerHTML = navHTML;

  const navbar = container.querySelector('.navbar');
  const dropdown = container.querySelector('[data-dropdown]');
  const dropdownToggle = container.querySelector('.navbar__dropdown-toggle');
  const dropdownPanel = container.querySelector('.navbar__dropdown-panel');
  const mobileToggle = container.querySelector('.navbar__mobile-toggle');
  const mobileMenu = container.querySelector('.navbar__mobile-menu');
  const mobileBackdrop = container.querySelector('.navbar__mobile-backdrop');
  const mobileClose = container.querySelector('.navbar__mobile-close');
  const mobileCollectionToggle = container.querySelector('.navbar__mobile-collection-toggle');
  const mobileSubmenu = container.querySelector('.navbar__mobile-submenu');

  let dropdownCloseTimer = null;

  const setDropdownState = (isOpen) => {
    if (!dropdown || !dropdownToggle) return;
    if (dropdownCloseTimer) {
      clearTimeout(dropdownCloseTimer);
      dropdownCloseTimer = null;
    }
    if (isOpen) {
      dropdown.classList.add('is-open');
      dropdownToggle.setAttribute('aria-expanded', 'true');
    } else {
      dropdownCloseTimer = setTimeout(() => {
        dropdown.classList.remove('is-open');
        dropdownToggle.setAttribute('aria-expanded', 'false');
        dropdownCloseTimer = null;
      }, 140);
    }
  };

  const openMobileMenu = () => {
    mobileMenu.classList.add('is-open');
    mobileBackdrop.classList.add('is-visible');
    mobileBackdrop.hidden = false;
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileToggle.setAttribute('aria-expanded', 'true');
  };

  const closeMobileMenu = () => {
    mobileMenu.classList.remove('is-open');
    mobileBackdrop.classList.remove('is-visible');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileToggle.setAttribute('aria-expanded', 'false');
    if (mobileCollectionToggle) {
      mobileCollectionToggle.setAttribute('aria-expanded', 'false');
      mobileSubmenu.classList.remove('is-open');
    }
    setTimeout(() => {
      if (!mobileMenu.classList.contains('is-open')) {
        mobileBackdrop.hidden = true;
      }
    }, 220);
  };

  dropdownToggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    const shouldOpen = !dropdown.classList.contains('is-open');
    setDropdownState(shouldOpen);
    if (dropdownCloseTimer) {
      clearTimeout(dropdownCloseTimer);
      dropdownCloseTimer = null;
    }
  });

  dropdown?.addEventListener('mouseenter', () => setDropdownState(true));
  dropdown?.addEventListener('mouseleave', (event) => {
    // If the pointer moves toward the panel (or stays inside the wrapper),
    // do nothing — the bridge pseudo-element keeps hover state alive.
    if (event.relatedTarget && dropdown.contains(event.relatedTarget)) {
      return;
    }
    setDropdownState(false);
  });

  document.addEventListener('click', (event) => {
    if (!dropdown?.contains(event.target)) {
      if (dropdownCloseTimer) {
        clearTimeout(dropdownCloseTimer);
        dropdownCloseTimer = null;
      }
      dropdown?.classList.remove('is-open');
      dropdownToggle?.setAttribute('aria-expanded', 'false');
    }

    if (mobileMenu?.classList.contains('is-open') && !mobileMenu.contains(event.target) && !mobileToggle.contains(event.target)) {
      closeMobileMenu();
    }
  });

  mobileToggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    openMobileMenu();
  });
  mobileClose?.addEventListener('click', closeMobileMenu);
  mobileBackdrop?.addEventListener('click', closeMobileMenu);

  mobileCollectionToggle?.addEventListener('click', () => {
    const isOpen = mobileSubmenu.classList.toggle('is-open');
    mobileCollectionToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMobileMenu();
      setDropdownState(false);
    }
  });

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 8);
  });
});
