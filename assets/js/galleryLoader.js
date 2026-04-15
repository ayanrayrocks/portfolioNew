/**
 * Dynamic Gallery Loader
 * Fetches the directory listing from the server if local, or uses a hardcoded list
 * if on GCP bucket (where directory listing is unavailable).
 */

document.addEventListener('DOMContentLoaded', () => {
  // Environment Detection
  const isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' || 
                  window.location.protocol === 'file:';

  // Base directory for images
  const photographyDir = isLocal 
    ? './assets/img/photography/' 
    : 'https://storage.googleapis.com/ayan-ray-portfolio/assets/img/photography/';

  // Hardcoded backup list for production (GCP) or local fetch failure
  const backupImages = [
    'PXL_20240203_095511418.MP.jpg',
    'PXL_20250324_124744746.jpg',
    'PXL_20250809_094058948.MP.jpg',
    'PXL_20250913_130812070.jpg',
    'PXL_20251224_123054715.jpg',
    'PXL_20260328_113757051.jpg',
    'RXM02011_DxO.jpg'
  ];

  const leftCol = document.querySelector('.photo-grid__col--left');
  const rightCol = document.querySelector('.photo-grid__col--right');

  if (!leftCol || !rightCol) return;

  /**
   * Renders the images into the masonry grid
   */
  function renderGallery(images) {
    if (!images || images.length === 0) {
      console.warn('No images to render.');
      return;
    }

    console.log(`Populating gallery with ${images.length} images...`);
    
    // Clear existing content
    leftCol.innerHTML = '';
    rightCol.innerHTML = '';

    images.forEach((imgSrc, index) => {
      const photoItem = document.createElement('div');
      photoItem.className = 'photo-item';
      photoItem.setAttribute('data-reveal', 'is-onscreen');
      
      // Add staggered delay
      photoItem.style.transitionDelay = `${(index % 4) * 0.15}s`;

      const img = document.createElement('img');
      img.src = photographyDir + imgSrc;
      img.alt = `Photography ${index + 1}`;
      
      // Assorted aspect ratios for variety
      if (index % 3 === 0) img.style.aspectRatio = '4/5';
      if (index % 5 === 0) img.style.aspectRatio = '1/1';

      photoItem.appendChild(img);

      // Distribute between columns
      if (index % 2 === 0) {
        leftCol.appendChild(photoItem);
      } else {
        rightCol.appendChild(photoItem);
      }
    });

    // Initialize reveal animations
    initReveals();
  }

  // Business Logic: Try local fetch first, otherwise use backup list
  if (isLocal) {
    fetch('./assets/img/photography/')
      .then(response => {
        if (!response.ok) throw new Error('Directory listing not supported');
        return response.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = Array.from(doc.querySelectorAll('a'));
        
        const images = links
          .map(link => link.getAttribute('href'))
          .filter(href => {
            if (!href || href.startsWith('..')) return false;
            return /\.(jpe?g|png|webp|gif|avif)$/i.test(href);
          });

        if (images.length === 0) {
          renderGallery(backupImages);
        } else {
          renderGallery(images);
        }
      })
      .catch(err => {
        console.log('Local directory fetch failed (expected if non-server environment). Using backup list.');
        renderGallery(backupImages);
      });
  } else {
    // On production/GCP, use the hardcoded list directly
    renderGallery(backupImages);
  }

  /**
   * IntersectionObserver logic to ensure dynamic items reveal on scroll.
   */
  function initReveals() {
    const revealItems = document.querySelectorAll('.photo-item[data-reveal]');
    
    const observerOptions = {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const revealClass = el.dataset.reveal;
          el.classList.add(revealClass);
          obs.unobserve(el);
        }
      });
    }, observerOptions);

    revealItems.forEach(item => observer.observe(item));
  }
});
