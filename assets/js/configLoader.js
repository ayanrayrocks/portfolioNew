document.addEventListener('DOMContentLoaded', () => {
  fetch('./resources/config.json')
    .then(response => response.json())
    .then(config => {
      // Helper function to handle text or element removal
      const processConfigNode = (key, value) => {
        if (value === 'naf') {
          // If a specific section element exists precisely for this key, remove it
          const sectionElem = document.querySelector(`[data-section="${key}"]`);
          if (sectionElem) {
            const panelsWrapper = sectionElem.closest('.panels') || sectionElem.parentElement;
            if (panelsWrapper) panelsWrapper.remove();
            else sectionElem.remove();
            return;
          }

          // If a top-level section marker is 'naf' (like contact.title), try to remove the parent section wrapper
          if (key.endsWith('.title') || key.endsWith('.description')) {
            const sectionKey = key.split('.')[0];
            const parentSection = document.querySelector(`[data-section="${sectionKey}"]`);
            if (parentSection) {
               const panelsWrapper = parentSection.closest('.panels') || parentSection.parentElement;
               if (panelsWrapper) panelsWrapper.remove();
               else parentSection.remove();
               return;
            }
          }

          // Element-specific removal: when a button, link, or normal text is naf, remove its specific container
          const configElems = document.querySelectorAll(`[data-config="${key}"]`);
          configElems.forEach(el => {
            const parentBtn = el.closest('a.btn');
            if (parentBtn) parentBtn.remove();
            else el.remove();
          });
          // Also handle data-config-href buttons
          const hrefElems = document.querySelectorAll(`[data-config-href="${key}"]`);
          hrefElems.forEach(el => el.remove());
        } else {
          // Valid value — set innerHTML or href
          const textElems = document.querySelectorAll(`[data-config="${key}"]`);
          textElems.forEach(el => {
            if (el.tagName === 'A' && key.includes('link')) {
              el.href = value;
            } else {
              el.innerHTML = value;
            }
          });
          const attrElems = document.querySelectorAll(`[data-config-href="${key}"]`);
          attrElems.forEach(el => { el.href = value; });
        }
      };

      // Traverse the JSON to get flat keys like "hero.title_main"
      const traverse = (obj, path = '') => {
        if (Array.isArray(obj)) {
          // Handle arrays dynamically using the path
          obj.forEach(item => {
             // If path ends with ".list", remove it so mapping matches HTML data attributes
             const cleanPath = path.endsWith('.list') ? path.substring(0, path.length - 5) : path;
             const basePath = `${cleanPath}.${item.id}`;
             Object.keys(item).forEach(k => {
                if (k !== 'id') traverse(item[k], `${basePath}.${k}`);
             });
          });
        } else if (typeof obj === 'object') {
          Object.keys(obj).forEach(k => {
            traverse(obj[k], path ? `${path}.${k}` : k);
          });
        } else {
          processConfigNode(path, obj);
        }
      };

      traverse(config);
      
      // Force remove the preloader
      const loader = document.querySelector('.loading');
      if (loader) {
        loader.classList.remove('loading--in');
        setTimeout(() => loader.remove(), 500);
      }
    })
    .catch(error => {
      console.error('Error loading config:', error);
      // Force remove loader on error too so it doesn't get stuck forever
      const loader = document.querySelector('.loading');
      if (loader) loader.classList.remove('loading--in');
    });
});
