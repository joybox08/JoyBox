document.addEventListener('DOMContentLoaded', () => {
  const productId = new URLSearchParams(window.location.search).get('id');
  const root = document.querySelector('[data-product-root]');

  if (!root) return;

  const product = getProductFromURL(productId);
  if (!product) {
    renderErrorState(root);
    return;
  }

  updateMeta(product);
  renderProduct(root, product);
  renderRelatedProducts(product);
});

function getProductFromURL(productId) {
  return PRODUCTS.find((product) => product.id === productId) || null;
}

function updateMeta(product) {
  const titleNode = document.querySelector('title');
  if (titleNode) titleNode.textContent = `JoyBox | ${product.name}`;
  const descNode = document.querySelector('meta[name="description"]');
  if (descNode) descNode.setAttribute('content', product.description);
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) ogImage.setAttribute('content', getSafeImage(product.images[0]));
}

function renderProduct(root, product) {
  root.innerHTML = `
    <div class="product-shell">
      <section class="product-gallery" aria-label="Product gallery">
        <div class="product-thumbs" data-thumbs></div>
        <div class="product-main" tabindex="0" role="button" aria-label="Open image viewer">
          <img src="${getSafeImage(product.images[0])}" alt="${escapeHtml(product.name)}" data-main-image />
          <div class="product-main__badge">${escapeHtml(getCategoryLabel(product.category))}</div>
          <div class="product-main__controls">
            <button type="button" data-image-nav="prev" aria-label="Previous image">←</button>
            <button type="button" data-image-nav="next" aria-label="Next image">→</button>
          </div>
        </div>
      </section>

      <section class="product-details">
        <nav class="product-breadcrumb" aria-label="Breadcrumb">
          <a href="index.html">Home</a>
          <span>/</span>
          <a href="${getCollectionHref(product.category)}">${escapeHtml(getCategoryLabel(product.category))}</a>
          <span>/</span>
          <span>${escapeHtml(product.name)}</span>
        </nav>

        <h1 class="product-name">${escapeHtml(product.name)}</h1>
        <div class="product-price">₹${product.price}</div>
        <p class="product-description">${escapeHtml(product.description)}</p>

        <div class="product-meta">
          <span class="product-meta__pill">${escapeHtml(getCategoryLabel(product.category))}</span>
          <span class="product-meta__pill">${product.images.length} view${product.images.length > 1 ? 's' : ''}</span>
        </div>

        ${renderColors(product.colors)}

        <div class="product-detail-actions">
          <a class="btn btn--accent" href="https://www.instagram.com/joybox.08/" target="_blank" rel="noreferrer noopener">DM to Order</a>
          <a class="button" href="${getCollectionHref(product.category)}">← Back to Collection</a>
        </div>

        <p class="product-order-note">
          Interested in this product? DM @joybox.08 to order.
          <span data-selected-colour>Selected Colour: ${product.colors[0] ? escapeHtml(product.colors[0]) : 'None'}</span>
        </p>

        <a class="product-back-link" href="${getCollectionHref(product.category)}">← Back to Collection</a>
      </section>
    </div>

    <section class="related-section" aria-label="Related products">
      <h3>You May Also Like</h3>
      <div class="related-grid" data-related-grid></div>
    </section>

    <div class="lightbox" data-lightbox hidden>
      <div class="lightbox__panel">
        <button class="lightbox__close" type="button" aria-label="Close image viewer">✕</button>
        <div class="lightbox__image-wrap">
          <img src="" alt="" data-lightbox-image />
          <div class="lightbox__controls">
            <button type="button" data-lightbox-nav="prev" aria-label="Previous image">←</button>
            <button type="button" data-lightbox-nav="next" aria-label="Next image">→</button>
          </div>
        </div>
        <div class="lightbox__info">
          <span data-lightbox-counter></span>
          <span>${escapeHtml(product.name)}</span>
        </div>
      </div>
    </div>
  `;

  const mainImage = root.querySelector('[data-main-image]');
  const lightboxImage = root.querySelector('[data-lightbox-image]');
  const thumbs = root.querySelector('[data-thumbs]');
  const selectedColour = root.querySelector('[data-selected-colour]');
  const productState = { currentIndex: 0, selectedColour: product.colors[0] || '', images: product.images.length ? product.images : ['assets/images/products/placeholder.jpg'] };

  if (mainImage) mainImage.addEventListener('error', () => handleImageError(mainImage));
  if (lightboxImage) lightboxImage.addEventListener('error', () => handleImageError(lightboxImage));

  renderGallery(thumbs, productState.images);
  setMainImage(mainImage, productState.images[0], 0, productState.images.length);
  setLightboxImage(lightboxImage, productState.images[0], 0, productState.images.length);
  updateSelectedColourText(selectedColour, productState.selectedColour);

  root.querySelector('.product-main').addEventListener('click', () => openLightbox(root, productState));
  root.querySelector('.product-main').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox(root, productState);
    }
  });

  root.querySelectorAll('[data-image-nav]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const direction = button.getAttribute('data-image-nav') === 'next' ? 1 : -1;
      productState.currentIndex = cycleIndex(productState.currentIndex + direction, productState.images.length);
      renderGallery(thumbs, productState.images, productState.currentIndex);
      setMainImage(mainImage, productState.images[productState.currentIndex], productState.currentIndex, productState.images.length);
      setLightboxImage(lightboxImage, productState.images[productState.currentIndex], productState.currentIndex, productState.images.length);
    });
  });

  root.querySelectorAll('[data-thumb]').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const index = Number(thumb.getAttribute('data-thumb-index'));
      productState.currentIndex = index;
      renderGallery(thumbs, productState.images, productState.currentIndex);
      setMainImage(mainImage, productState.images[productState.currentIndex], productState.currentIndex, productState.images.length);
      setLightboxImage(lightboxImage, productState.images[productState.currentIndex], productState.currentIndex, productState.images.length);
    });
  });

  root.querySelectorAll('.color-option').forEach((button) => {
    button.addEventListener('click', () => {
      const colour = button.getAttribute('data-colour');
      productState.selectedColour = colour;
      updateSelectedColourText(selectedColour, colour);
      root.querySelectorAll('.color-option').forEach((item) => item.classList.remove('is-selected'));
      button.classList.add('is-selected');
    });
  });

  root.querySelectorAll('[data-lightbox-nav]').forEach((button) => {
    button.addEventListener('click', () => {
      const direction = button.getAttribute('data-lightbox-nav') === 'next' ? 1 : -1;
      productState.currentIndex = cycleIndex(productState.currentIndex + direction, productState.images.length);
      renderGallery(thumbs, productState.images, productState.currentIndex);
      setMainImage(mainImage, productState.images[productState.currentIndex], productState.currentIndex, productState.images.length);
      setLightboxImage(lightboxImage, productState.images[productState.currentIndex], productState.currentIndex, productState.images.length);
    });
  });

  const lightbox = root.querySelector('[data-lightbox]');
  const closeButton = root.querySelector('.lightbox__close');
  closeButton?.addEventListener('click', () => closeLightbox(lightbox));
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox(lightbox);
  });

  document.addEventListener('keydown', (event) => {
    if (!lightbox || lightbox.hasAttribute('hidden')) return;
    if (event.key === 'Escape') closeLightbox(lightbox);
    if (event.key === 'ArrowRight') {
      productState.currentIndex = cycleIndex(productState.currentIndex + 1, productState.images.length);
      renderGallery(thumbs, productState.images, productState.currentIndex);
      setMainImage(mainImage, productState.images[productState.currentIndex], productState.currentIndex, productState.images.length);
      setLightboxImage(lightboxImage, productState.images[productState.currentIndex], productState.currentIndex, productState.images.length);
    }
    if (event.key === 'ArrowLeft') {
      productState.currentIndex = cycleIndex(productState.currentIndex - 1, productState.images.length);
      renderGallery(thumbs, productState.images, productState.currentIndex);
      setMainImage(mainImage, productState.images[productState.currentIndex], productState.currentIndex, productState.images.length);
      setLightboxImage(lightboxImage, productState.images[productState.currentIndex], productState.currentIndex, productState.images.length);
    }
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    root.querySelectorAll('.product-details, .related-section, .product-gallery').forEach((node) => observer.observe(node));
  }
}

function renderGallery(container, images, activeIndex = 0) {
  container.innerHTML = images
    .map((image, index) => `
      <button class="product-thumb ${index === activeIndex ? 'is-active' : ''}" type="button" data-thumb data-thumb-index="${index}" aria-label="Show image ${index + 1}">
        <img src="${getSafeImage(image)}" alt="" loading="lazy" />
      </button>
    `)
    .join('');
}

function setMainImage(imageNode, imagePath, index, total) {
  if (!imageNode) return;
  imageNode.src = getSafeImage(imagePath);
  imageNode.alt = `Product image ${index + 1} of ${total}`;
}

function setLightboxImage(imageNode, imagePath, index, total) {
  if (!imageNode) return;
  imageNode.src = getSafeImage(imagePath);
  imageNode.alt = `Product image ${index + 1} of ${total}`;
  const counter = document.querySelector('[data-lightbox-counter]');
  if (counter) {
    counter.textContent = `${index + 1} / ${total}`;
  }
}

function renderColors(colors) {
  if (!colors || !colors.length) return '';
  const buttons = colors.map((color) => `
    <button class="color-option" type="button" data-colour="${escapeHtml(color)}">${escapeHtml(color)}</button>
  `).join('');

  return `
    <div class="product-colors">
      <h3>Choose Colour</h3>
      <div class="color-options">${buttons}</div>
    </div>
  `;
}

function updateSelectedColourText(node, colour) {
  if (!node) return;
  const value = colour ? `Selected Colour: ${colour}` : 'Selected Colour: None';
  node.textContent = value;
}

function renderRelatedProducts(product) {
  const container = document.querySelector('[data-related-grid]');
  if (!container) return;

  const related = PRODUCTS.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
  if (!related.length) {
    container.innerHTML = '<div class="status-card">No related products available.</div>';
    return;
  }

  container.innerHTML = related.map((item) => `
    <article class="related-card">
      <img src="${getSafeImage(item.images[0])}" alt="${escapeHtml(item.name)}" loading="lazy" />
      <div class="related-card__body">
        <h4>${escapeHtml(item.name)}</h4>
        <p>₹${item.price}</p>
        <a href="product.html?id=${item.id}">View Product</a>
      </div>
    </article>
  `).join('');
}

function openLightbox(root, state) {
  const lightbox = root.querySelector('[data-lightbox]');
  if (!lightbox) return;
  lightbox.hidden = false;
  lightbox.classList.add('is-open');
  const image = root.querySelector('[data-lightbox-image]');
  setLightboxImage(image, state.images[state.currentIndex], state.currentIndex, state.images.length);
}

function closeLightbox(lightbox) {
  if (!lightbox) return;
  lightbox.classList.remove('is-open');
  lightbox.hidden = true;
}

function cycleIndex(index, length) {
  if (!length) return 0;
  return (index + length) % length;
}

function getCollectionHref(category) {
  const hrefs = { hampers: 'hampers.html', gothic: 'gothic.html', bracelets: 'bracelets.html', pendants: 'pendants.html' };
  return hrefs[category] || 'index.html';
}

function getCategoryLabel(category) {
  const labels = { hampers: 'Hampers', gothic: 'Gothic', bracelets: 'Bracelets', pendants: 'Pendants' };
  return labels[category] || 'Collection';
}

function getSafeImage(imagePath) {
  return imagePath || 'assets/images/products/placeholder.jpg';
}

function handleImageError(img) {
  if (!img || img.dataset.fallbackApplied === 'true') return;
  img.dataset.fallbackApplied = 'true';
  img.src = 'assets/images/products/placeholder.jpg';
}

function renderErrorState(root) {
  root.innerHTML = `
    <div class="status-card">
      <h2>Product Not Found</h2>
      <p>Sorry, we couldn't find that JoyBox product.</p>
      <a class="btn" href="index.html">Back to Collections</a>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
