document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const category = getCurrentCategory(currentPath);
  const catalog = document.querySelector('[data-product-grid]');
  const title = document.querySelector('[data-collection-title]');
  const description = document.querySelector('[data-collection-description]');
  const summary = document.querySelector('[data-collection-summary]');

  if (!catalog) return;

  const products = getProductsByCategory(category);
  const sortedProducts = sortProducts(products);

  if (title) {
    title.textContent = getCollectionLabel(category);
  }

  if (description) {
    description.textContent = getCollectionDescription(category);
  }

  if (summary) {
    summary.textContent = `${sortedProducts.length} pieces ready to discover`;
  }

  renderProducts(catalog, sortedProducts);

  const revealItems = document.querySelectorAll('.reveal-card');
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
      { threshold: 0.05, rootMargin: '0px 0px 80px 0px' }
    );

    revealItems.forEach((item) => observer.observe(item));

    // Safety net: if a card never becomes visible (e.g. mobile IO timing
    // issues, hidden tabs, or off-screen layout shifts), reveal it after a
    // short delay so cards never remain invisible to the user.
    window.setTimeout(() => {
      revealItems.forEach((item) => item.classList.add('is-visible'));
    }, 1500);
  }
  else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
});

function getCurrentCategory(path) {
  const map = {
    'hampers.html': 'hampers',
    'gothic.html': 'gothic',
    'bracelets.html': 'bracelets',
    'pendants.html': 'pendants',
    'earring.html': 'earrings',
    'keychain.html': 'keychains'
  };

  return map[path] || 'hampers';
}

function getProductsByCategory(category) {
  return PRODUCTS.filter((product) => product.category === category);
}

function sortProducts(products) {
  return [...products].sort((a, b) => a.price - b.price);
}

function renderProducts(container, products) {
  if (!products.length) {
    container.innerHTML = '<div class="collection-empty">No products for this collection yet.</div>';
    return;
  }

  container.innerHTML = products
    .map((product, index) => createProductCard(product, index))
    .join('');
}

function createProductCard(product, index) {
  const image = product.images[0] || 'assets/images/products/placeholder.jpg';
  const colorsMarkup = product.colors.length
    ? product.colors.map((color) => `<span class="color-pill">${escapeHtml(color)}</span>`).join('')
    : '<span class="color-pill color-pill--empty">No colours</span>';

  return `
    <article class="product-card reveal-card" style="transition-delay:${index * 60}ms">
      <div class="product-card__media">
        <img src="${image}" alt="${escapeHtml(product.name)}" loading="lazy" />
        <div class="product-card__overlay"></div>
      </div>
      <div class="product-card__body">
        <div class="product-card__meta">
          <h3 class="product-card__name">${escapeHtml(product.name)}</h3>
          <span class="product-card__price">₹${product.price}</span>
        </div>
        <!-- <p class="product-card__description">${escapeHtml(product.description)}</p> -->
        <div class="product-card__colors">${colorsMarkup}</div>
        <div class="product-card__actions">
          <a class="product-card__link" href="product.html?id=${product.id}">View Details <span>↗</span></a>
          <a class="product-card__insta" href="https://www.instagram.com/joybox.08/" target="_blank" rel="noreferrer noopener">DM to Order <span>↗</span></a>
        </div>
      </div>
    </article>
  `;
}

function getCollectionLabel(category) {
  const labels = {
    hampers: 'Hampers',
    gothic: 'Gothic',
    bracelets: 'Bracelets',
    pendants: 'Pendants',
    earrings: 'Earring',
    keychains: 'Keychain'
  };
  return labels[category] || 'Collection';
}

function getCollectionDescription(category) {
  const descriptions = {
    hampers: 'Curated little moments wrapped in soft texture, thoughtful detail, and elevated gifting energy.',
    gothic: 'Bold, dark, and expressive pieces designed to feel dramatic and different.',
    bracelets: 'Made to be worn, layered, and loved through everyday rituals.',
    pendants: 'Small pieces with personal style, designed to feel close to the body and meaningful.',
    earrings: 'Small, sculptural pieces designed to feel personal, polished, and easy to wear.',
    keychains: 'Small keepsakes made to carry a little joy with you, every day.'
  };
  return descriptions[category] || 'A carefully curated collection for modern gifting.';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
