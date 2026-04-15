/**
 * Dynamic Gallery Loader
 * Fetches the directory listing from the server, parses image filenames,
 * and populates the staggered masonry grid.
 */

document.addEventListener('DOMContentLoaded', () => {
  const photographyDir = './assets/img/photography/';
  const leftCol = document.querySelector('.photo-grid__col--left');
  const rightCol = document.querySelector('.photo-grid__col--right');

  if (!leftCol || !rightCol) return;

  fetch(photographyDir)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const links = Array.from(doc.querySelectorAll('a'));
      
      // Filter for common image files (case-insensitive)
      const images = links
        .map(link => link.getAttribute('href'))
        .filter(href => {
          if (!href || href.startsWith('..')) return false;
          return /\.(jpe?g|png|webp|gif|avif)$/i.test(href);
        });

      if (images.length === 0) {
        console.warn('No images found in photography directory.');
        return;
      }

      console.log(`Found ${images.length} images. Populating gallery...`);

      // Clear existing hardcoded items (if any remain)
      leftCol.innerHTML = '';
      rightCol.innerHTML = '';

      images.forEach((imgSrc, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.setAttribute('data-reveal', 'is-onscreen');
        
        // Add staggered delay based on total index for a smoother entry
        photoItem.style.transitionDelay = `${(index % 4) * 0.15}s`;

        const img = document.createElement('img');
        img.src = photographyDir + imgSrc;
        img.alt = `Photography ${index + 1}`;
        
        // Randomly assign some aspect ratios for variety if they aren't pre-set
        // In a real scenario, you might want to preserve original ratios
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

      // Initialize built-in animations for the new elements
      initReveals();
    })
    .catch(err => {
      console.error('Failed to load dynamic gallery:', err);
    });

  /**
   * Re-implements the IntersectionObserver logic from main.js 
   * to ensure dynamic items reveal on scroll.
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
          // Optional: once revealed, stop observing
          obs.unobserve(el);
        }
      });
    }, observerOptions);

    revealItems.forEach(item => observer.observe(item));
  }
});
