/**
 * Green Haven & Nexus - Master JavaScript Engine
 * Handles Theme Mode, RTL, Filtering, Form Validations, Modals, and Dashboard Tabs
 */

// Immediate execution before DOM ready to prevent FOUC (flash of un-styled content)
(function() {
  try {
    var storedDir = localStorage.getItem('site-dir');
    if (storedDir === 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.classList.remove('rtl');
    }
    var storedTheme = localStorage.getItem('site-theme');
    if (storedTheme === 'dark') {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();

/* ================================================================
   GREEN HAVEN LUXURY TOAST NOTIFICATION ENGINE
   Models: Standard (Success/Info/Warning/Error), Rich Reservation Card, Action Toasts
   ================================================================ */
const GreenHavenToast = {
  container: null,

  getContainer() {
    if (!this.container || !document.body.contains(this.container)) {
      this.container = document.getElementById('ghMasterToastContainer');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'ghMasterToastContainer';
        this.container.className = 'gh-toast-container';
        this.container.setAttribute('aria-live', 'polite');
        document.body.appendChild(this.container);
      }
    }
    return this.container;
  },

  playChime(type) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'error') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.22);
      } else if (type === 'warning') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(460, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.22);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.14); // A5
      }

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  },

  show(options, messageArg, typeArg) {
    let opts = {};
    if (typeof options === 'string') {
      opts = {
        title: options,
        message: messageArg || '',
        type: typeArg || 'success'
      };
    } else {
      opts = { ...options };
    }

    const type = opts.type || 'success';
    const title = opts.title || (type === 'success' ? 'Success' : type === 'reservation' ? 'Reservation Confirmed' : 'Notification');
    const message = opts.message || '';
    const duration = typeof opts.duration === 'number' ? opts.duration : (type === 'reservation' ? 7000 : 4500);
    const details = opts.details || null;
    const action = opts.action || null;
    const playSound = opts.sound !== false;

    if (playSound) {
      this.playChime(type);
    }

    const container = this.getContainer();
    const toastId = 'ght_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    let icon = 'bi-check-circle-fill';
    let modelClass = 'gh-toast--' + type;
    let badgeText = 'Confirmed';

    if (type === 'reservation') {
      icon = 'bi-calendar2-check-fill';
      badgeText = 'Reserved';
    } else if (type === 'info') {
      icon = 'bi-info-circle-fill';
      badgeText = 'Notice';
    } else if (type === 'warning') {
      icon = 'bi-exclamation-triangle-fill';
      badgeText = 'Attention';
    } else if (type === 'error') {
      icon = 'bi-x-circle-fill';
      badgeText = 'Alert';
    }

    // Build details card for reservation or detailed views
    let detailsHtml = '';
    if (details) {
      detailsHtml = `
        <div class="gh-toast__details-card">
          ${details.date ? `<div class="gh-toast__detail-item" title="${details.date}"><i class="bi bi-calendar3"></i> <span>${details.date}</span></div>` : ''}
          ${details.time ? `<div class="gh-toast__detail-item" title="${details.time}"><i class="bi bi-clock"></i> <span>${details.time}</span></div>` : ''}
          ${details.guests ? `<div class="gh-toast__detail-item" title="${details.guests}"><i class="bi bi-people-fill"></i> <span>${details.guests}</span></div>` : ''}
          ${details.seating ? `<div class="gh-toast__detail-item" title="${details.seating}"><i class="bi bi-geo-alt-fill"></i> <span>${details.seating}</span></div>` : ''}
        </div>
      `;
    }

    // Actions
    let actionsHtml = '';
    if (action) {
      actionsHtml = `
        <div class="gh-toast__actions">
          <button type="button" class="gh-toast__btn gh-toast__btn--primary" id="${toastId}_action">
            ${action.icon ? `<i class="bi ${action.icon}"></i>` : ''} ${action.text || 'View'}
          </button>
          <button type="button" class="gh-toast__btn gh-toast__btn--ghost" id="${toastId}_dismiss">Dismiss</button>
        </div>
      `;
    } else if (type === 'reservation') {
      actionsHtml = `
        <div class="gh-toast__actions">
          <button type="button" class="gh-toast__btn gh-toast__btn--primary" id="${toastId}_viewPass">
            <i class="bi bi-receipt"></i> View Pass
          </button>
          <button type="button" class="gh-toast__btn gh-toast__btn--ghost" id="${toastId}_dismiss">Dismiss</button>
        </div>
      `;
    }

    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `gh-toast ${modelClass}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
      <div class="gh-toast__main">
        <div class="gh-toast__icon-box">
          <i class="bi ${icon}"></i>
        </div>
        <div class="gh-toast__content">
          <div class="gh-toast__title">
            <span>${title}</span>
            <span class="gh-toast__badge-pill">${badgeText}</span>
          </div>
          ${message ? `<p class="gh-toast__message">${message}</p>` : ''}
          ${detailsHtml}
          ${actionsHtml}
        </div>
        <button type="button" class="gh-toast__close" aria-label="Close notification">&times;</button>
      </div>
      <div class="gh-toast__progress">
        <div class="gh-toast__progress-fill" style="animation-duration: ${duration}ms;"></div>
      </div>
    `;

    container.appendChild(toast);

    let timer = null;
    let remaining = duration;
    let startTime = Date.now();
    let isClosing = false;

    const closeToast = () => {
      if (isClosing) return;
      isClosing = true;
      clearTimeout(timer);
      toast.classList.add('gh-toast--closing');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 330);
    };

    if (duration > 0) {
      timer = setTimeout(closeToast, duration);
    }

    toast.addEventListener('mouseenter', () => {
      clearTimeout(timer);
      remaining -= (Date.now() - startTime);
    });

    toast.addEventListener('mouseleave', () => {
      if (remaining > 0 && !isClosing) {
        startTime = Date.now();
        timer = setTimeout(closeToast, remaining);
      }
    });

    const closeBtn = toast.querySelector('.gh-toast__close');
    if (closeBtn) closeBtn.addEventListener('click', closeToast);

    const dismissBtn = toast.querySelector(`#${toastId}_dismiss`);
    if (dismissBtn) dismissBtn.addEventListener('click', closeToast);

    if (action && action.onClick) {
      const actBtn = toast.querySelector(`#${toastId}_action`);
      if (actBtn) {
        actBtn.addEventListener('click', (e) => {
          action.onClick(e, toast);
          closeToast();
        });
      }
    } else if (type === 'reservation') {
      const passBtn = toast.querySelector(`#${toastId}_viewPass`);
      if (passBtn) {
        passBtn.addEventListener('click', () => {
          closeToast();
          const modalEl = document.getElementById('resReceiptModal');
          if (modalEl && typeof bootstrap !== 'undefined') {
            const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modal.show();
          }
        });
      }
    }

    return {
      id: toastId,
      element: toast,
      close: closeToast
    };
  }
};

// Global Exposing
window.GreenHavenToast = GreenHavenToast;
window.showToast = function(opts, msg, type) {
  return GreenHavenToast.show(opts, msg, type);
};
window.showToast.success = (title, message, extra) => GreenHavenToast.show({ type: 'success', title, message, ...extra });
window.showToast.info = (title, message, extra) => GreenHavenToast.show({ type: 'info', title, message, ...extra });
window.showToast.warning = (title, message, extra) => GreenHavenToast.show({ type: 'warning', title, message, ...extra });
window.showToast.error = (title, message, extra) => GreenHavenToast.show({ type: 'error', title, message, ...extra });
window.showToast.reservation = (data) => {
  return GreenHavenToast.show({
    type: 'reservation',
    title: 'Reservation Confirmed! 🎉',
    message: `Table confirmed for ${data.name || 'our guest'}. We sent booking details to ${data.email || 'your email'}.`,
    details: {
      date: data.date,
      time: data.time,
      guests: data.guests ? (String(data.guests).includes('Guest') ? data.guests : `${data.guests} Guests`) : '2 Guests',
      seating: data.seating || 'Indoor Sanctuary'
    },
    duration: 8000
  });
};

// Gracefully intercept legacy alert(...) so users never see standard browser popups
if (typeof window !== 'undefined' && !window.__nativeAlert) {
  window.__nativeAlert = window.alert;
  window.alert = function(msg) {
    if (typeof msg === 'string') {
      const lower = msg.toLowerCase();
      if (lower.includes('confirm') || lower.includes('success') || lower.includes('added') || lower.includes('saved')) {
        window.showToast.success('Green Haven Notification', msg);
        return;
      } else if (lower.includes('empty') || lower.includes('error') || lower.includes('invalid') || lower.includes('fail') || lower.includes('require')) {
        window.showToast.warning('Notice', msg);
        return;
      }
    }
    window.showToast.info('Green Haven Concierge', String(msg));
  };
}

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* --------------------------------------------------
     0. BOOTSTRAP TOOLTIPS INITIALIZATION (DESKTOP)
  -------------------------------------------------- */
  try {
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.forEach(function(tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl, {
          trigger: 'hover',
          boundary: 'clippingParents'
        });
      });

      document.addEventListener('click', function(e) {
        const tipEl = e.target.closest('[data-bs-toggle="tooltip"]');
        if (tipEl) {
          const instance = bootstrap.Tooltip.getInstance(tipEl);
          if (instance) instance.hide();
        }
      });
    }
  } catch (err) {}

  /* --------------------------------------------------
     1. THEME TOGGLE (LIGHT / DARK MODE)
  -------------------------------------------------- */
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const storedTheme = localStorage.getItem('site-theme') || 'light';
  
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      themeToggleBtns.forEach(btn => {
        btn.innerHTML = '<i class="bi bi-sun-fill text-warning"></i>';
        btn.setAttribute('aria-label', 'Switch to Light Mode');
        btn.setAttribute('title', 'Switch to Light Mode');
      });
      document.querySelectorAll('.gh-brand-title-img:not(.gh-title-light):not(.gh-title-dark)').forEach(img => {
        img.src = 'assets/images/title-dark.png';
      });
    } else {
      document.documentElement.classList.remove('dark');
      themeToggleBtns.forEach(btn => {
        btn.innerHTML = '<i class="bi bi-moon-stars-fill"></i>';
        btn.setAttribute('aria-label', 'Switch to Dark Mode');
        btn.setAttribute('title', 'Switch to Dark Mode');
      });
      document.querySelectorAll('.gh-brand-title-img:not(.gh-title-light):not(.gh-title-dark)').forEach(img => {
        img.src = 'assets/images/title.png';
      });
    }
    localStorage.setItem('site-theme', theme);
  }

  applyTheme(storedTheme);

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentTheme = document.documentElement.getAttribute('data-bs-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  });

  /* --------------------------------------------------
     2. RTL MODE TOGGLE (Bilingual LTR / RTL Switcher)
  -------------------------------------------------- */
  const rtlToggleBtns = document.querySelectorAll('.rtl-toggle-btn');
  const storedDir = localStorage.getItem('site-dir') || 'ltr';

  const PUNCT_END_REGEX = /([.?!:;…\)\]"'\u201D\u2019]+)(\s*)$/;

  function fixAllPunctuationBidi(isRtl) {
    // 1. All text nodes across the document (headings, paragraphs, lists, spans, labels, etc.)
    try {
      if (document.body) {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode(node) {
              const parent = node.parentElement;
              if (!parent) return NodeFilter.FILTER_REJECT;
              const tag = parent.tagName.toLowerCase();
              if (
                tag === 'script' ||
                tag === 'style' ||
                tag === 'code' ||
                tag === 'pre' ||
                tag === 'noscript' ||
                tag === 'textarea' ||
                tag === 'svg'
              ) {
                return NodeFilter.FILTER_REJECT;
              }
              // Skip elements with strict LTR isolation
              if (parent.closest('.price, [data-price], .numeric, .ltr-isolate, bdi')) {
                return NodeFilter.FILTER_REJECT;
              }
              const val = node.nodeValue;
              if (!val || !val.trim()) return NodeFilter.FILTER_REJECT;
              return NodeFilter.FILTER_ACCEPT;
            }
          }
        );

        const textNodes = [];
        let cur;
        while ((cur = walker.nextNode())) {
          textNodes.push(cur);
        }

        textNodes.forEach(node => {
          const text = node.nodeValue;
          if (isRtl) {
            // If text ends with punctuation and isn't already followed by \u200E
            if (PUNCT_END_REGEX.test(text) && !/\u200E(\s*)$/.test(text)) {
              node.nodeValue = text.replace(PUNCT_END_REGEX, '$1\u200E$2');
            }
          } else {
            if (text.includes('\u200E')) {
              node.nodeValue = text.replace(/\u200E/g, '');
            }
          }
        });
      }
    } catch (err) {}

    // 2. All input and textarea placeholders across the site
    try {
      document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
        let ph = el.getAttribute('data-original-ph') || el.getAttribute('placeholder') || '';
        if (!el.hasAttribute('data-original-ph')) {
          el.setAttribute('data-original-ph', ph);
        }
        if (isRtl) {
          if (PUNCT_END_REGEX.test(ph.trim()) && !ph.endsWith('\u200E')) {
            el.setAttribute('placeholder', ph + '\u200E');
          }
        } else {
          el.setAttribute('placeholder', ph.replace(/\u200E$/, ''));
        }
      });
    } catch (err) {}
  }

  function applyDir(dir) {
    document.documentElement.setAttribute('dir', dir);
    if (dir === 'rtl') {
      document.documentElement.classList.add('rtl');
      rtlToggleBtns.forEach(btn => {
        btn.innerHTML = '<i class="bi bi-arrow-left-right"></i>';
        btn.setAttribute('aria-label', 'Switch to Left-to-Right layout (LTR)');
        btn.setAttribute('title', 'Switch to Left-to-Right layout (LTR)');
      });
      fixAllPunctuationBidi(true);
    } else {
      document.documentElement.classList.remove('rtl');
      rtlToggleBtns.forEach(btn => {
        btn.innerHTML = '<i class="bi bi-arrow-left-right"></i>';
        btn.setAttribute('aria-label', 'Switch to Right-to-Left layout (RTL)');
        btn.setAttribute('title', 'Switch to Right-to-Left layout (RTL)');
      });
      fixAllPunctuationBidi(false);
    }
    localStorage.setItem('site-dir', dir);
    window.dispatchEvent(new CustomEvent('siteDirectionChange', { detail: { dir } }));
  }

  applyDir(storedDir);

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.rtl-toggle-btn');
    if (btn) {
      e.preventDefault();
      const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
      const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
      applyDir(newDir);
    }
  });

  // Re-run punctuation protection when modals are shown or DOM loads in RTL mode
  document.addEventListener('show.bs.modal', () => {
    if (document.documentElement.getAttribute('dir') === 'rtl') {
      setTimeout(() => fixAllPunctuationBidi(true), 50);
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.documentElement.getAttribute('dir') === 'rtl') {
        fixAllPunctuationBidi(true);
      }
    });
  } else {
    if (document.documentElement.getAttribute('dir') === 'rtl') {
      fixAllPunctuationBidi(true);
    }
  }

  /* --------------------------------------------------
     3. STICKY NAVBAR & BACK-TO-TOP BUTTON
  -------------------------------------------------- */
  const navbars = document.querySelectorAll('.gh-navbar, .nx-navbar');
  let backToTopBtn = document.querySelector('.back-to-top');

  // Dynamically ensure back-to-top button exists in DOM if not present in static markup
  if (!backToTopBtn && document.body) {
    backToTopBtn = document.createElement('button');
    backToTopBtn.type = 'button';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.setAttribute('aria-label', 'Scroll to top');
    backToTopBtn.setAttribute('title', 'Scroll to top');
    backToTopBtn.innerHTML = '<i class="bi bi-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(backToTopBtn);
  }

  function checkNavbarScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
    const isScrolled = scrollY > 20;
    navbars.forEach(navbar => {
      if (isScrolled) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    if (backToTopBtn) {
      if (scrollY > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    }
  }

  window.addEventListener('scroll', checkNavbarScroll, { passive: true });
  checkNavbarScroll();

  /* Universal Active Navigation Link Highlighter */
  function updateActiveNavLinks() {
    const rawPath = window.location.pathname;
    let page = rawPath.split('/').pop() || 'index.html';
    if (page === '' || page === '/') page = 'index.html';

    document.querySelectorAll('.gh-navbar .gh-nav-link, .gh-navbar .gh-dropdown-item, .offcanvas nav .gh-nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href.startsWith('javascript:')) return;
      const targetPage = href.split('/').pop().split('#')[0];
      if (targetPage === page) {
        link.classList.add('active');
        const dropdown = link.closest('.dropdown');
        if (dropdown) {
          const toggle = dropdown.querySelector('.dropdown-toggle');
          if (toggle) toggle.classList.add('active');
        }
      }
    });
  }

  updateActiveNavLinks();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        if (typeof backToTopBtn.blur === 'function') backToTopBtn.blur();
        backToTopBtn.classList.remove('touch-active');
      }, 250);
    });

    // Mobile touch press feedback
    backToTopBtn.addEventListener('touchstart', () => {
      backToTopBtn.classList.add('touch-active');
    }, { passive: true });

    backToTopBtn.addEventListener('touchend', () => {
      setTimeout(() => {
        backToTopBtn.classList.remove('touch-active');
      }, 180);
    }, { passive: true });

    backToTopBtn.addEventListener('touchcancel', () => {
      backToTopBtn.classList.remove('touch-active');
    }, { passive: true });
  }

  /* Responsive Mobile Offcanvas Toggle Enforcer & Interactive Manager */
  const mobileMenuOffcanvasEl = document.getElementById('mobileMenuOffcanvas');
  const mobileToggles = document.querySelectorAll('.gh-mobile-toggle, [data-bs-target="#mobileMenuOffcanvas"]');

  function enforceResponsiveMobileToggle() {
    const isDesktop = window.innerWidth >= 992;
    mobileToggles.forEach(t => {
      if (isDesktop) {
        t.style.setProperty('display', 'none', 'important');
        t.style.setProperty('visibility', 'hidden', 'important');
        t.style.setProperty('opacity', '0', 'important');
        t.style.setProperty('pointer-events', 'none', 'important');
        t.setAttribute('aria-hidden', 'true');
      } else {
        t.style.setProperty('display', 'inline-flex', 'important');
        t.style.setProperty('visibility', 'visible', 'important');
        t.style.setProperty('opacity', '1', 'important');
        t.style.setProperty('pointer-events', 'auto', 'important');
        t.removeAttribute('aria-hidden');
      }
    });
  }

  enforceResponsiveMobileToggle();
  window.addEventListener('resize', enforceResponsiveMobileToggle, { passive: true });
  window.addEventListener('orientationchange', enforceResponsiveMobileToggle, { passive: true });

  if (mobileMenuOffcanvasEl) {
    // Synchronize ARIA state on offcanvas lifecycle
    mobileMenuOffcanvasEl.addEventListener('show.bs.offcanvas', () => {
      mobileToggles.forEach(t => {
        t.setAttribute('aria-expanded', 'true');
        t.setAttribute('aria-label', 'Close navigation menu');
      });
    });

    mobileMenuOffcanvasEl.addEventListener('hide.bs.offcanvas', () => {
      mobileToggles.forEach(t => {
        t.setAttribute('aria-expanded', 'false');
        t.setAttribute('aria-label', 'Open navigation menu');
      });
    });

    // Dismiss offcanvas when tapping any navigation link inside the drawer
    mobileMenuOffcanvasEl.querySelectorAll('a:not([data-bs-toggle="dropdown"])').forEach(link => {
      link.addEventListener('click', () => {
        if (typeof bootstrap !== 'undefined' && bootstrap.Offcanvas) {
          const bsOffcanvas = bootstrap.Offcanvas.getInstance(mobileMenuOffcanvasEl);
          if (bsOffcanvas) {
            bsOffcanvas.hide();
          }
        }
      });
    });
  }

  /* --------------------------------------------------
      4. LUXURY RESTAURANT MENU DEDICATED CATEGORY TAB SWITCHER & LIVE SEARCH
   -------------------------------------------------- */
  const categorySections = document.querySelectorAll('.menu-category-section');
  const catNavLinks = document.querySelectorAll('.cat-nav-link');
  const luxurySearchInput = document.getElementById('luxuryMenuSearchInput') || document.getElementById('menuSearchInput') || document.getElementById('dishSearchInput');
  const btnClearMenuSearch = document.getElementById('btnClearMenuSearch');
  const menuNoResults = document.getElementById('menuNoResults');
  const menuItemCards = document.querySelectorAll('.menu-item-card');
  const menuFilterBtns = document.querySelectorAll('.menu-filter-btn');

  // Initialize Default Active Category Tab
  if (categorySections.length && catNavLinks.length) {
    let hasActiveSection = false;
    categorySections.forEach(section => {
      if (section.classList.contains('active')) hasActiveSection = true;
    });
    if (!hasActiveSection && categorySections[0]) {
      categorySections[0].classList.add('active');
    }
  }

  // Category Tab Click Handler - Clean, Instant, Isolated View (Zero Crossing)
  catNavLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('data-target') || (this.getAttribute('href') || '').replace('#', '');
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        // Clear search input if switching category tabs
        if (luxurySearchInput && luxurySearchInput.value.trim().length > 0) {
          luxurySearchInput.value = '';
          if (btnClearMenuSearch) btnClearMenuSearch.classList.add('d-none');
          if (menuNoResults) menuNoResults.style.display = 'none';
          document.querySelectorAll('.menu-item-card').forEach(c => {
            c.classList.remove('search-hidden', 'd-none');
            c.removeAttribute('data-search-hidden');
            c.style.removeProperty('display');
          });
        }

        // Update active navigation pill
        catNavLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        if (typeof this.scrollIntoView === 'function') {
          this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }

        // Show only targeted category section, hide all other containers
        categorySections.forEach(sec => {
          sec.classList.remove('active', 'search-active');
          sec.style.removeProperty('display');
        });
        targetSection.classList.add('active');
        targetSection.style.removeProperty('display');

        // Smooth scroll to position section perfectly below navbar
        const navbar = document.querySelector('.gh-navbar, .nx-navbar');
        const navHeight = navbar ? navbar.offsetHeight : 70;
        
        const targetTop = targetSection.getBoundingClientRect().top + window.pageYOffset;
        const currentScroll = window.pageYOffset;
        const targetScroll = targetTop - navHeight - 16;

        if (Math.abs(currentScroll - targetScroll) > 30) {
          window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Helper to accurately match menu item cards against search query
  function cardMatchesQuery(card, query) {
    if (!query) return true;

    // 1. Dish Title
    const titleEl = card.querySelector('.dish-card-title, .dish-title, h3, h4');
    const title = (titleEl ? titleEl.textContent : '').toLowerCase();
    if (title.includes(query)) return true;

    // 2. Dish Description / Ingredients
    const descEl = card.querySelector('.dish-card-description, .dish-desc, p');
    const desc = (descEl ? descEl.textContent : '').toLowerCase();
    if (desc.includes(query)) return true;

    // 3. Dietary pill / badge
    const badgeEl = card.querySelector('.dish-card-dietary-badge, .dietary-pill, .dish-card-badge');
    const badge = (badgeEl ? badgeEl.textContent : '').toLowerCase();
    if (badge.includes(query)) return true;

    // 4. Data-name from add-to-cart button if present
    const orderBtn = card.querySelector('[data-name]');
    if (orderBtn) {
      const orderName = (orderBtn.getAttribute('data-name') || '').toLowerCase();
      if (orderName.includes(query)) return true;
    }

    // 5. Category match - exact or prefix only (avoids partial false positives like 'art' in 'starters')
    const category = (card.getAttribute('data-category') || '').toLowerCase();
    if (category && (query === category || category.startsWith(query))) {
      return true;
    }

    return false;
  }

  // Live Instant Search across all dishes
  function filterLuxuryMenu() {
    const query = (luxurySearchInput ? luxurySearchInput.value : '').toLowerCase().trim();
    if (btnClearMenuSearch) {
      btnClearMenuSearch.classList.toggle('d-none', query.length === 0);
    }

    let totalVisible = 0;

    if (categorySections.length) {
      if (query.length === 0) {
        // Return to active category tab view
        const activeLink = document.querySelector('.cat-nav-link.active');
        const activeTargetId = activeLink ? (activeLink.getAttribute('data-target') || (activeLink.getAttribute('href') || '').replace('#', '')) : 'category-starters';
        
        categorySections.forEach(section => {
          section.classList.remove('search-active');
          section.style.removeProperty('display');
          if (section.getAttribute('id') === activeTargetId) {
            section.classList.add('active');
          } else {
            section.classList.remove('active');
          }
          section.querySelectorAll('.menu-item-card').forEach(card => {
            card.classList.remove('search-hidden', 'd-none');
            card.removeAttribute('data-search-hidden');
            card.style.removeProperty('display');
          });
        });
        if (menuNoResults) menuNoResults.style.display = 'none';
        return;
      }

      // Search Mode: Scan all sections and cards
      categorySections.forEach(section => {
        const cards = section.querySelectorAll('.menu-item-card');
        let sectionMatches = 0;

        cards.forEach(card => {
          const match = cardMatchesQuery(card, query);
          if (match) {
            card.classList.remove('search-hidden', 'd-none');
            card.removeAttribute('data-search-hidden');
            card.style.removeProperty('display');
            sectionMatches++;
            totalVisible++;
          } else {
            card.classList.add('search-hidden', 'd-none');
            card.setAttribute('data-search-hidden', 'true');
            card.style.setProperty('display', 'none', 'important');
          }
        });

        if (sectionMatches > 0) {
          section.classList.add('search-active');
          section.style.removeProperty('display');
        } else {
          section.classList.remove('search-active', 'active');
          section.style.setProperty('display', 'none', 'important');
        }
      });
    } else if (menuItemCards.length) {
      let activeCat = 'all';
      const activeBtn = document.querySelector('.menu-filter-btn.active');
      if (activeBtn) activeCat = activeBtn.getAttribute('data-filter') || 'all';

      menuItemCards.forEach(card => {
        const cat = (card.getAttribute('data-category') || '').toLowerCase();
        const matchCat = (activeCat === 'all' || cat === activeCat);
        const matchQuery = cardMatchesQuery(card, query);

        if (matchCat && matchQuery) {
          card.classList.remove('search-hidden', 'd-none');
          card.removeAttribute('data-search-hidden');
          card.style.removeProperty('display');
          totalVisible++;
        } else {
          card.classList.add('search-hidden', 'd-none');
          card.setAttribute('data-search-hidden', 'true');
          card.style.setProperty('display', 'none', 'important');
        }
      });
    }

    if (menuNoResults) {
      menuNoResults.style.display = (totalVisible === 0) ? 'block' : 'none';
    }
  }

  if (luxurySearchInput) {
    luxurySearchInput.addEventListener('input', filterLuxuryMenu);
  }

  if (btnClearMenuSearch) {
    btnClearMenuSearch.addEventListener('click', () => {
      if (luxurySearchInput) {
        luxurySearchInput.value = '';
        filterLuxuryMenu();
        luxurySearchInput.focus();
      }
    });
  }

  if (menuFilterBtns.length) {
    menuFilterBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        menuFilterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        filterLuxuryMenu();
      });
    });
  }

  /* --------------------------------------------------
     5. SERVICES GRID / LIST SWITCHER & LIVE FILTER
  -------------------------------------------------- */
  const btnGridView = document.getElementById('btnGridView');
  const btnListView = document.getElementById('btnListView');
  const servicesContainer = document.getElementById('servicesContainer');
  const serviceFilterBtns = document.querySelectorAll('.service-filter-btn');
  const serviceItems = document.querySelectorAll('.service-item-col');
  const serviceSearchInput = document.getElementById('serviceSearchInput');
  const serviceNoResults = document.getElementById('serviceNoResults');

  if (btnGridView && btnListView && servicesContainer) {
    btnGridView.addEventListener('click', (e) => {
      e.preventDefault();
      servicesContainer.classList.remove('services-list-view');
      btnGridView.classList.add('active');
      btnListView.classList.remove('active');
    });

    btnListView.addEventListener('click', (e) => {
      e.preventDefault();
      servicesContainer.classList.add('services-list-view');
      btnListView.classList.add('active');
      btnGridView.classList.remove('active');
    });
  }

  function filterServices() {
    if (!serviceItems.length) return;

    let activeCat = 'all';
    const activeBtn = document.querySelector('.service-filter-btn.active');
    if (activeBtn) {
      activeCat = activeBtn.getAttribute('data-filter') || 'all';
    }

    const query = (serviceSearchInput ? serviceSearchInput.value : '').toLowerCase().trim();
    let count = 0;

    serviceItems.forEach(item => {
      const cat = item.getAttribute('data-category') || '';
      const title = (item.querySelector('h3, h4')?.textContent || '').toLowerCase();
      const desc = (item.querySelector('p')?.textContent || '').toLowerCase();

      const matchCat = (activeCat === 'all' || cat === activeCat);
      const matchQuery = (!query || title.includes(query) || desc.includes(query));

      if (matchCat && matchQuery) {
        item.style.display = 'block';
        count++;
      } else {
        item.style.display = 'none';
      }
    });

    if (serviceNoResults) {
      serviceNoResults.style.display = (count === 0) ? 'block' : 'none';
    }
  }

  if (serviceFilterBtns.length) {
    serviceFilterBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        serviceFilterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        filterServices();
      });
    });
  }

  if (serviceSearchInput) {
    serviceSearchInput.addEventListener('input', filterServices);
  }

  /* --------------------------------------------------
     6. BLOG LIVE SEARCH, FILTERING & PAGINATION (PAGE 1 & 2)
  -------------------------------------------------- */
  const blogFilterBtns = document.querySelectorAll('.blog-filter-btn');
  const blogItems = document.querySelectorAll('.blog-item-col');
  const blogSearchInput = document.getElementById('blogSearchInput');
  const blogNoResults = document.getElementById('blogNoResults');
  const blogPaginationNav = document.getElementById('blogPaginationNav');
  const blogPrevBtn = document.getElementById('blogPrevBtn');
  const blogNextBtn = document.getElementById('blogNextBtn');
  const blogPageNumbersContainer = document.getElementById('blogPageNumbers');

  const BLOG_ITEMS_PER_PAGE = 6;
  let currentBlogPage = 1;

  // Check URL query parameters for ?page=2, ?category=recipes, or ?q=search
  const blogUrlParams = new URLSearchParams(window.location.search);
  const requestedPage = parseInt(blogUrlParams.get('page'), 10);
  if (!isNaN(requestedPage) && requestedPage >= 1) {
    currentBlogPage = requestedPage;
  }

  const requestedCategory = (blogUrlParams.get('category') || '').toLowerCase().trim();
  if (requestedCategory && blogFilterBtns.length) {
    const targetBtn = Array.from(blogFilterBtns).find(btn => (btn.getAttribute('data-filter') || '').toLowerCase() === requestedCategory);
    if (targetBtn) {
      blogFilterBtns.forEach(b => b.classList.remove('active'));
      targetBtn.classList.add('active');
    }
  }

  const requestedSearch = blogUrlParams.get('q');
  if (requestedSearch && blogSearchInput) {
    blogSearchInput.value = requestedSearch;
  }

  function getMatchingBlogItems() {
    if (!blogItems.length) return [];

    let activeCat = 'all';
    const activeBtn = document.querySelector('.blog-filter-btn.active');
    if (activeBtn) {
      activeCat = activeBtn.getAttribute('data-filter') || 'all';
    }

    const query = (blogSearchInput ? blogSearchInput.value : '').toLowerCase().trim();

    return Array.from(blogItems).filter(item => {
      const cat = item.getAttribute('data-category') || '';
      const title = (item.querySelector('.blog-title, h3, h4')?.textContent || '').toLowerCase();
      const desc = (item.querySelector('.dish-desc, p')?.textContent || '').toLowerCase();

      const matchCat = (activeCat === 'all' || cat === activeCat);
      const matchQuery = (!query || title.includes(query) || desc.includes(query));

      return matchCat && matchQuery;
    });
  }

  function renderBlogPagination(totalPages) {
    if (!blogPaginationNav) return;

    if (totalPages <= 1) {
      blogPaginationNav.style.display = 'none';
      return;
    }

    blogPaginationNav.style.display = 'block';

    // Update prev/next button states
    if (blogPrevBtn) {
      if (currentBlogPage <= 1) {
        blogPrevBtn.classList.add('disabled');
      } else {
        blogPrevBtn.classList.remove('disabled');
      }
    }
    if (blogNextBtn) {
      if (currentBlogPage >= totalPages) {
        blogNextBtn.classList.add('disabled');
      } else {
        blogNextBtn.classList.remove('disabled');
      }
    }

    // Render numeric page buttons
    if (blogPageNumbersContainer) {
      blogPageNumbersContainer.innerHTML = '';
      for (let p = 1; p <= totalPages; p++) {
        const li = document.createElement('li');
        li.className = `page-item ${p === currentBlogPage ? 'active' : ''}`;
        const btn = document.createElement('button');
        btn.className = `page-link rounded-circle ${p === currentBlogPage ? 'active' : ''}`;
        btn.setAttribute('type', 'button');
        btn.setAttribute('aria-label', `Go to page ${p}`);
        btn.textContent = p;
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          goToBlogPage(p);
        });
        li.appendChild(btn);
        blogPageNumbersContainer.appendChild(li);
      }
    }
  }

  function goToBlogPage(page) {
    const matching = getMatchingBlogItems();
    const totalPages = Math.ceil(matching.length / BLOG_ITEMS_PER_PAGE) || 1;
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    currentBlogPage = page;
    updateBlogView(matching, totalPages);

    // Smooth scroll to top of blog section
    const blogGrid = document.getElementById('blogGrid');
    if (blogGrid) {
      const offset = 140;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = blogGrid.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    }
  }

  function updateBlogView(matching, totalPages) {
    // Hide all items first
    blogItems.forEach(item => {
      item.style.display = 'none';
    });

    if (matching.length === 0) {
      if (blogNoResults) blogNoResults.style.display = 'block';
      if (blogPaginationNav) blogPaginationNav.style.display = 'none';
      return;
    }

    if (blogNoResults) blogNoResults.style.display = 'none';

    if (currentBlogPage > totalPages) {
      currentBlogPage = 1;
    }

    const start = (currentBlogPage - 1) * BLOG_ITEMS_PER_PAGE;
    const end = start + BLOG_ITEMS_PER_PAGE;

    matching.forEach((item, idx) => {
      if (idx >= start && idx < end) {
        item.style.display = 'block';
      }
    });

    renderBlogPagination(totalPages);
  }

  function filterBlog(resetToFirstPage = true) {
    if (!blogItems.length) return;
    if (resetToFirstPage) {
      currentBlogPage = 1;
    }

    const blogFeaturedCard = document.getElementById('blogFeaturedCard');
    if (blogFeaturedCard) {
      const featuredCat = blogFeaturedCard.getAttribute('data-category') || 'vegan';
      const activeCat = (document.querySelector('.blog-filter-btn.active')?.getAttribute('data-filter')) || 'all';
      const query = (blogSearchInput ? blogSearchInput.value : '').toLowerCase().trim();
      const featuredText = blogFeaturedCard.textContent.toLowerCase();

      const matchCat = (activeCat === 'all' || activeCat === featuredCat);
      const matchQuery = (!query || featuredText.includes(query));

      if (matchCat && matchQuery) {
        blogFeaturedCard.style.display = 'block';
      } else {
        blogFeaturedCard.style.display = 'none';
      }
    }

    const matching = getMatchingBlogItems();
    const totalPages = Math.ceil(matching.length / BLOG_ITEMS_PER_PAGE) || 1;
    updateBlogView(matching, totalPages);
  }

  if (blogPrevBtn) {
    blogPrevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentBlogPage > 1) {
        goToBlogPage(currentBlogPage - 1);
      }
    });
  }

  if (blogNextBtn) {
    blogNextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const matching = getMatchingBlogItems();
      const totalPages = Math.ceil(matching.length / BLOG_ITEMS_PER_PAGE) || 1;
      if (currentBlogPage < totalPages) {
        goToBlogPage(currentBlogPage + 1);
      }
    });
  }

  if (blogFilterBtns.length) {
    blogFilterBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        blogFilterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        filterBlog(true);
      });
    });
  }

  if (blogSearchInput) {
    blogSearchInput.addEventListener('input', () => filterBlog(true));
  }

  // Initial render on page load
  if (blogItems.length) {
    filterBlog(false);
  }

  /* --------------------------------------------------
     7. PRICING BILLING SWITCHER (MONTHLY / ANNUAL)
  -------------------------------------------------- */
  const billingToggle = document.getElementById('billingSwitch');
  const priceStarter = document.getElementById('priceStarter');
  const pricePro = document.getElementById('pricePro');
  const priceEnterprise = document.getElementById('priceEnterprise');
  const billingPeriodLabels = document.querySelectorAll('.billing-period');

  if (billingToggle) {
    billingToggle.addEventListener('change', () => {
      const isAnnual = billingToggle.checked;
      if (isAnnual) {
        if (priceStarter) priceStarter.textContent = '₹899';
        if (pricePro) pricePro.textContent = '₹1,899';
        if (priceEnterprise) priceEnterprise.textContent = '₹3,499';
        billingPeriodLabels.forEach(el => el.textContent = '/ month (billed yearly)');
      } else {
        if (priceStarter) priceStarter.textContent = '₹1,099';
        if (pricePro) pricePro.textContent = '₹2,299';
        if (priceEnterprise) priceEnterprise.textContent = '₹3,999';
        billingPeriodLabels.forEach(el => el.textContent = '/ month (billed monthly)');
      }
    });
  }

  /* --------------------------------------------------
     8. DISH DETAILS QUANTITY SELECTOR
  -------------------------------------------------- */
  const dishQty = document.getElementById('dishQty');
  const btnQtyPlus = document.getElementById('btnQtyPlus');
  const btnQtyMinus = document.getElementById('btnQtyMinus');
  const btnAddToCart = document.getElementById('btnAddToCart');
  const addToCartFeedback = document.getElementById('addToCartFeedback');

  if (dishQty && btnQtyPlus && btnQtyMinus) {
    btnQtyPlus.addEventListener('click', () => {
      let val = parseInt(dishQty.value, 10) || 1;
      dishQty.value = val + 1;
    });

    btnQtyMinus.addEventListener('click', () => {
      let val = parseInt(dishQty.value, 10) || 1;
      if (val > 1) dishQty.value = val - 1;
    });
  }

  if (btnAddToCart && addToCartFeedback) {
    btnAddToCart.addEventListener('click', (e) => {
      e.preventDefault();
      const qty = dishQty ? dishQty.value : 1;
      addToCartFeedback.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show mt-3" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i> Added <strong>${qty} item(s)</strong> to your table order!
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;
    });
  }

  /* --------------------------------------------------
     FORM VALIDATION HELPERS: NAME, EMAIL, AND PHONE
  -------------------------------------------------- */

  /**
   * Helper: Find the appropriate .invalid-feedback element for an input
   */
  function getFeedbackElement(input) {
    if (!input) return null;
    const inputGroup = input.closest ? input.closest('.input-group') : null;
    return document.getElementById(input.id + 'Feedback') ||
      (input.nextElementSibling && input.nextElementSibling.classList && input.nextElementSibling.classList.contains('invalid-feedback') ? input.nextElementSibling : null) ||
      (inputGroup && inputGroup.nextElementSibling && inputGroup.nextElementSibling.classList && inputGroup.nextElementSibling.classList.contains('invalid-feedback') ? inputGroup.nextElementSibling : null) ||
      (input.parentElement && input.parentElement.querySelector ? input.parentElement.querySelector('.invalid-feedback') : null) ||
      null;
  }

  /**
   * 1. Name Field Validation
   * - Only alphabetic characters and spaces
   * - No numbers or special characters
   * - Minimum 2 characters (no single letter)
   * - Prevents leading spaces and multiple consecutive spaces
   * - Trims on blur/submit
   */
  function setupValidNameInput(input, isRequired = true, fieldLabel = 'Name') {
    if (!input) return null;
    const feedback = getFeedbackElement(input);

    const validate = () => {
      const val = input.value.trim();
      if (!val) {
        if (isRequired) {
          const msg = `Please enter your ${fieldLabel.toLowerCase()}.`;
          input.setCustomValidity(msg);
          if (feedback) feedback.textContent = msg;
          return false;
        } else {
          input.setCustomValidity('');
          return true;
        }
      }

      if (val.length < 2) {
        const msg = `${fieldLabel} must be at least 2 characters long.`;
        input.setCustomValidity(msg);
        if (feedback) feedback.textContent = msg;
        return false;
      }

      // Must consist of letters and single spaces between words
      const nameRegex = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;
      if (!nameRegex.test(val)) {
        const msg = `${fieldLabel} can only contain letters and spaces (no numbers or special characters).`;
        input.setCustomValidity(msg);
        if (feedback) feedback.textContent = msg;
        return false;
      }

      input.setCustomValidity('');
      return true;
    };

    // Prevent typing numbers, special characters, leading space, and consecutive spaces
    input.addEventListener('keydown', function(e) {
      const allowedControlKeys = [
        'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Home', 'End'
      ];
      if (allowedControlKeys.includes(e.key)) return;
      if (e.ctrlKey || e.metaKey) return;
      if (e.key.startsWith('F') && e.key.length > 1) return;

      if (e.key === ' ') {
        const pos = this.selectionStart ?? this.value.length;
        if (pos === 0 || this.value.charAt(pos - 1) === ' ') {
          e.preventDefault();
        }
        return;
      }

      // Restrict strictly to alphabetic letters (A-Z, a-z)
      if (!/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
      }
    });

    input.addEventListener('beforeinput', function(e) {
      if (!e.data) return;
      if (/[^a-zA-Z\s]/.test(e.data)) {
        e.preventDefault();
      }
    });

    input.addEventListener('paste', function(e) {
      e.preventDefault();
      const pasteText = (e.clipboardData || window.clipboardData)?.getData('text') || '';
      let cleaned = pasteText.replace(/[^a-zA-Z\s]/g, '').replace(/\s{2,}/g, ' ');
      if (!cleaned) return;

      const start = this.selectionStart ?? this.value.length;
      const end = this.selectionEnd ?? this.value.length;
      const currentVal = this.value;

      if (start === 0 && cleaned.startsWith(' ')) {
        cleaned = cleaned.trimStart();
      }
      if (!cleaned) return;

      this.value = currentVal.slice(0, start) + cleaned + currentVal.slice(end);
      const newCursor = start + cleaned.length;
      this.setSelectionRange(newCursor, newCursor);
      this.dispatchEvent(new Event('input', { bubbles: true }));
    });

    input.addEventListener('input', function() {
      const start = this.selectionStart;
      let cleaned = this.value.replace(/[^a-zA-Z\s]/g, '').replace(/\s{2,}/g, ' ');
      if (cleaned.startsWith(' ')) {
        cleaned = cleaned.trimStart();
      }
      if (this.value !== cleaned) {
        this.value = cleaned;
        if (start !== null) {
          const newPos = Math.min(start, cleaned.length);
          this.setSelectionRange(newPos, newPos);
        }
      }
      const isValid = validate();
      if (this.classList.contains('is-invalid') || this.form?.classList.contains('was-validated')) {
        this.classList.toggle('is-invalid', !isValid);
        this.classList.toggle('is-valid', isValid);
      }
    });

    input.addEventListener('blur', function() {
      const trimmed = this.value.trim();
      if (this.value !== trimmed) {
        this.value = trimmed;
      }
      const isValid = validate();
      if (this.form?.classList.contains('was-validated')) {
        this.classList.toggle('is-invalid', !isValid);
        this.classList.toggle('is-valid', isValid);
      }
    });

    return validate;
  }

  /**
   * 2. Email Field Validation
   * - Valid local part, @ symbol, domain, and valid domain extension (.com, .in, .org, etc.)
   * - Rejects invalid formats like ice@g
   * - Rejects spaces inside email
   * - Trims leading/trailing spaces
   */
  function setupValidEmailInput(input, isRequired = true) {
    if (!input) return null;
    const feedback = getFeedbackElement(input);

    const validate = () => {
      const val = input.value.trim();
      if (!val) {
        if (isRequired) {
          const msg = 'Please enter your email address.';
          input.setCustomValidity(msg);
          if (feedback) feedback.textContent = msg;
          return false;
        } else {
          input.setCustomValidity('');
          return true;
        }
      }

      if (/\s/.test(val)) {
        const msg = 'Email address cannot contain spaces.';
        input.setCustomValidity(msg);
        if (feedback) feedback.textContent = msg;
        return false;
      }

      // Valid format: localPart @ domain . extension (min 2 letters)
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(val)) {
        let msg = 'Please enter a valid email address (e.g. name@example.com or name@example.in).';
        if (!val.includes('@')) {
          msg = "Email address must contain an '@' symbol.";
        } else {
          const parts = val.split('@');
          if (!parts[1] || !parts[1].includes('.')) {
            msg = 'Please include a valid domain extension like .com or .in.';
          } else {
            const ext = parts[1].split('.').pop();
            if (ext.length < 2) {
              msg = 'Domain extension must be at least 2 characters (e.g. .com, .in).';
            }
          }
        }
        input.setCustomValidity(msg);
        if (feedback) feedback.textContent = msg;
        return false;
      }

      input.setCustomValidity('');
      return true;
    };

    // Reject space characters
    input.addEventListener('keydown', function(e) {
      if (e.key === ' ') {
        e.preventDefault();
      }
    });

    input.addEventListener('beforeinput', function(e) {
      if (e.data && /\s/.test(e.data)) {
        e.preventDefault();
      }
    });

    input.addEventListener('paste', function(e) {
      e.preventDefault();
      const pasteText = (e.clipboardData || window.clipboardData)?.getData('text') || '';
      const cleaned = pasteText.replace(/\s/g, '');
      if (!cleaned) return;

      const start = this.selectionStart ?? this.value.length;
      const end = this.selectionEnd ?? this.value.length;
      const currentVal = this.value;

      this.value = currentVal.slice(0, start) + cleaned + currentVal.slice(end);
      const newCursor = start + cleaned.length;
      this.setSelectionRange(newCursor, newCursor);
      this.dispatchEvent(new Event('input', { bubbles: true }));
    });

    input.addEventListener('input', function() {
      const start = this.selectionStart;
      const cleaned = this.value.replace(/\s/g, '');
      if (this.value !== cleaned) {
        this.value = cleaned;
        if (start !== null) {
          const newPos = Math.min(start, cleaned.length);
          this.setSelectionRange(newPos, newPos);
        }
      }
      const isValid = validate();
      if (this.classList.contains('is-invalid') || this.form?.classList.contains('was-validated')) {
        this.classList.toggle('is-invalid', !isValid);
        this.classList.toggle('is-valid', isValid);
      }
    });

    input.addEventListener('blur', function() {
      this.value = this.value.trim();
      const isValid = validate();
      if (this.form?.classList.contains('was-validated')) {
        this.classList.toggle('is-invalid', !isValid);
        this.classList.toggle('is-valid', isValid);
      }
    });

    return validate;
  }

  /**
   * 3. Phone Number Field Validation
   * - Restricts to valid 10-digit Indian phone numbers
   * - Strictly blocks alphabetic characters and symbols
   * - Validates exactly 10 numeric digits before submission
   */
  function setupNumericPhoneInput(input, isRequired = false) {
    if (!input) return null;
    const feedback = getFeedbackElement(input);

    const validate = () => {
      const val = input.value.trim();
      if (!val) {
        if (isRequired) {
          const msg = 'Please enter your 10-digit phone number.';
          input.setCustomValidity(msg);
          if (feedback) feedback.textContent = msg;
          return false;
        } else {
          input.setCustomValidity('');
          return true;
        }
      }

      if (!/^\d+$/.test(val)) {
        const msg = 'Phone number can only contain numbers.';
        input.setCustomValidity(msg);
        if (feedback) feedback.textContent = msg;
        return false;
      }

      if (val.length !== 10) {
        const msg = 'Phone number must be exactly 10 digits.';
        input.setCustomValidity(msg);
        if (feedback) feedback.textContent = msg;
        return false;
      }

      input.setCustomValidity('');
      return true;
    };

    // 1. Prevent typing of non-numeric characters and restrict to 10 digits
    input.addEventListener('keydown', function(e) {
      const allowedControlKeys = [
        'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Home', 'End'
      ];
      if (allowedControlKeys.includes(e.key)) return;
      if (e.ctrlKey || e.metaKey) return;
      if (e.key.startsWith('F') && e.key.length > 1) return;

      // Disallow non-digits
      if (!/^[0-9]$/.test(e.key) || e.shiftKey) {
        e.preventDefault();
        return;
      }

      // Restrict to max 10 digits
      const selLen = (this.selectionEnd ?? 0) - (this.selectionStart ?? 0);
      if (this.value.length >= 10 && selLen === 0) {
        e.preventDefault();
      }
    });

    // 2. beforeinput for modern desktop & mobile browsers
    input.addEventListener('beforeinput', function(e) {
      if (e.data && !/^\d+$/.test(e.data)) {
        e.preventDefault();
      }
    });

    // 3. Paste event: extract digits only up to 10 digits
    input.addEventListener('paste', function(e) {
      e.preventDefault();
      const pasteText = (e.clipboardData || window.clipboardData)?.getData('text') || '';
      const numbersOnly = pasteText.replace(/\D/g, '');
      if (!numbersOnly) return;

      const start = this.selectionStart ?? this.value.length;
      const end = this.selectionEnd ?? this.value.length;
      const currentVal = this.value;
      const maxLen = 10;
      const availableSpace = maxLen - (currentVal.length - (end - start));
      if (availableSpace <= 0) return;

      const toInsert = numbersOnly.slice(0, availableSpace);
      this.value = currentVal.slice(0, start) + toInsert + currentVal.slice(end);
      const newCursor = start + toInsert.length;
      this.setSelectionRange(newCursor, newCursor);
      this.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // 4. Input fallback: strip non-numeric characters and clamp to 10 digits
    input.addEventListener('input', function() {
      const start = this.selectionStart;
      const cleaned = this.value.replace(/\D/g, '').slice(0, 10);
      if (this.value !== cleaned) {
        this.value = cleaned;
        if (start !== null) {
          const newPos = Math.min(start, cleaned.length);
          this.setSelectionRange(newPos, newPos);
        }
      }
      const isValid = validate();
      if (this.classList.contains('is-invalid') || this.form?.classList.contains('was-validated')) {
        this.classList.toggle('is-invalid', !isValid);
        this.classList.toggle('is-valid', isValid);
      }
    });

    // 5. Blur event: revalidate
    input.addEventListener('blur', function() {
      const isValid = validate();
      if (this.form?.classList.contains('was-validated')) {
        this.classList.toggle('is-invalid', !isValid);
        this.classList.toggle('is-valid', isValid);
      }
    });

    return validate;
  }

  // Expose validation helpers globally
  window.setupValidNameInput = setupValidNameInput;
  window.setupValidEmailInput = setupValidEmailInput;
  window.setupNumericPhoneInput = setupNumericPhoneInput;

  /* --------------------------------------------------
     9. TABLE RESERVATION FORM & RECEIPT MODAL
  -------------------------------------------------- */
  const reservationForm = document.getElementById('reservationForm');
  const resName = document.getElementById('resName');
  const resEmail = document.getElementById('resEmail');
  const resPhone = document.getElementById('resPhone');

  const validateResName = setupValidNameInput(resName, true, 'Full Name');
  const validateResEmail = setupValidEmailInput(resEmail, true);
  const validateResPhone = setupNumericPhoneInput(resPhone, true);

  if (reservationForm) {
    reservationForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const isNameValid = validateResName ? validateResName() : true;
      const isEmailValid = validateResEmail ? validateResEmail() : true;
      const isPhoneValid = validateResPhone ? validateResPhone() : true;

      if (!isNameValid || !isEmailValid || !isPhoneValid || !this.checkValidity()) {
        e.stopPropagation();
        this.classList.add('was-validated');
        if (resName && !isNameValid) resName.classList.add('is-invalid');
        if (resEmail && !isEmailValid) resEmail.classList.add('is-invalid');
        if (resPhone && !isPhoneValid) resPhone.classList.add('is-invalid');

        // Focus first invalid field
        const firstInvalid = this.querySelector('.is-invalid, :invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const name = resName?.value.trim() || 'Guest';
      const email = resEmail?.value.trim() || 'N/A';
      const phone = resPhone?.value.trim() || 'N/A';
      const date = document.getElementById('resDate')?.value || 'Selected Date';
      const time = document.getElementById('resTime')?.value || 'Selected Time';
      const guests = document.getElementById('resGuests')?.value || '2';
      const seating = document.getElementById('resSeating')?.value || 'Indoor Dining';
      const special = document.getElementById('resSpecial')?.value || '';

      const bookingRef = 'GH-2026-' + Math.floor(10000 + Math.random() * 90000);

      const receiptName = document.getElementById('receiptName');
      const receiptEmail = document.getElementById('receiptEmail');
      const receiptPhone = document.getElementById('receiptPhone');
      const receiptDate = document.getElementById('receiptDate');
      const receiptTime = document.getElementById('receiptTime');
      const receiptGuests = document.getElementById('receiptGuests');
      const receiptSeating = document.getElementById('receiptSeating');
      const receiptCode = document.getElementById('receiptCode');

      if (receiptName) receiptName.textContent = name;
      if (receiptEmail) receiptEmail.textContent = email;
      if (receiptPhone) receiptPhone.textContent = phone;
      if (receiptDate) receiptDate.textContent = date;
      if (receiptTime) receiptTime.textContent = time;
      if (receiptGuests) receiptGuests.textContent = String(guests).includes('Guest') ? guests : `${guests} Guests`;
      if (receiptSeating) receiptSeating.textContent = seating;
      if (receiptCode) receiptCode.textContent = `#${bookingRef}`;

      // Update Google Calendar action button if available
      const calBtn = document.getElementById('resCalendarBtn');
      if (calBtn) {
        const calTitle = encodeURIComponent(`Green Haven Table Reservation (${seating})`);
        const calDetails = encodeURIComponent(`Table reservation for ${name} (${guests} Guests) at Green Haven Restaurant.\nConfirmation Code: #${bookingRef}\nSeating: ${seating}\nNotes: ${special || 'None'}`);
        const calLoc = encodeURIComponent('Green Haven Restaurant, 742 Evergreen Botanical Way, Portland');
        calBtn.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&details=${calDetails}&location=${calLoc}`;
      }

      // 1. Show the Rich Reservation Card Toast Model
      if (window.showToast && window.showToast.reservation) {
        window.showToast.reservation({
          name,
          email,
          date,
          time,
          guests,
          seating,
          code: bookingRef
        });
      }

      // 2. Display the Luxury Confirmation Receipt Modal
      const modalEl = document.getElementById('resReceiptModal');
      if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.show();
      }

      reservationForm.reset();
      reservationForm.classList.remove('was-validated');
      [resName, resEmail, resPhone].forEach(inp => {
        if (inp) {
          inp.classList.remove('is-invalid', 'is-valid');
          inp.setCustomValidity('');
        }
      });
    });

    reservationForm.addEventListener('reset', function() {
      reservationForm.classList.remove('was-validated');
      [resName, resEmail, resPhone].forEach(inp => {
        if (inp) {
          inp.classList.remove('is-invalid', 'is-valid');
          inp.setCustomValidity('');
        }
      });
    });
  }

  /* --------------------------------------------------
     10. CATERING INQUIRY FORM
  -------------------------------------------------- */
  const cateringForm = document.getElementById('cateringForm');
  const cateringName = document.getElementById('cateringName');
  const cateringEmail = document.getElementById('cateringEmail');
  const cateringPhone = document.getElementById('cateringPhone');

  const validateCateringName = setupValidNameInput(cateringName, true, 'Full Name');
  const validateCateringEmail = setupValidEmailInput(cateringEmail, true);
  const validateCateringPhone = setupNumericPhoneInput(cateringPhone, true);

  if (cateringForm) {
    cateringForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const isNameValid = validateCateringName ? validateCateringName() : true;
      const isEmailValid = validateCateringEmail ? validateCateringEmail() : true;
      const isPhoneValid = validateCateringPhone ? validateCateringPhone() : true;

      if (!isNameValid || !isEmailValid || !isPhoneValid || !this.checkValidity()) {
        e.stopPropagation();
        this.classList.add('was-validated');
        if (cateringName && !isNameValid) cateringName.classList.add('is-invalid');
        if (cateringEmail && !isEmailValid) cateringEmail.classList.add('is-invalid');
        if (cateringPhone && !isPhoneValid) cateringPhone.classList.add('is-invalid');

        const firstInvalid = this.querySelector('.is-invalid, :invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const name = cateringName?.value.trim() || document.getElementById('catName')?.value.trim() || 'Valued Client';
      const feedback = document.getElementById('cateringFeedback');
      if (feedback) {
        feedback.innerHTML = `
          <div class="alert alert-success alert-dismissible fade show mt-3" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>
            Thank you, <strong>${name}</strong>! Your catering request has been submitted to our executive culinary director. We will prepare a custom proposal within 24 hours.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        `;
      }
      cateringForm.reset();
      cateringForm.classList.remove('was-validated');
      [cateringName, cateringEmail, cateringPhone].forEach(inp => {
        if (inp) {
          inp.classList.remove('is-invalid', 'is-valid');
          inp.setCustomValidity('');
        }
      });
    });

    cateringForm.addEventListener('reset', function() {
      cateringForm.classList.remove('was-validated');
      [cateringName, cateringEmail, cateringPhone].forEach(inp => {
        if (inp) {
          inp.classList.remove('is-invalid', 'is-valid');
          inp.setCustomValidity('');
        }
      });
    });
  }

  /* --------------------------------------------------
     11. CONTACT FORM
  -------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const contactName = document.getElementById('contactName');
  const contactEmail = document.getElementById('contactEmail');
  const contactPhone = document.getElementById('contactPhone');

  const validateContactName = setupValidNameInput(contactName, true, 'Full Name');
  const validateContactEmail = setupValidEmailInput(contactEmail, true);
  const validateContactPhone = setupNumericPhoneInput(contactPhone, false);

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const isNameValid = validateContactName ? validateContactName() : true;
      const isEmailValid = validateContactEmail ? validateContactEmail() : true;
      const isPhoneValid = validateContactPhone ? validateContactPhone() : true;

      if (!isNameValid || !isEmailValid || !isPhoneValid || !this.checkValidity()) {
        e.stopPropagation();
        this.classList.add('was-validated');
        if (contactName && !isNameValid) contactName.classList.add('is-invalid');
        if (contactEmail && !isEmailValid) contactEmail.classList.add('is-invalid');
        if (contactPhone && !isPhoneValid) contactPhone.classList.add('is-invalid');

        const firstInvalid = this.querySelector('.is-invalid, :invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const name = contactName?.value.trim() || 'Valued Client';
      const feedback = document.getElementById('contactFeedback');
      if (feedback) {
        feedback.innerHTML = `
          <div class="alert alert-success alert-dismissible fade show mt-3" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>
            Thank you, <strong>${name}</strong>! Your message has been received. Our hospitality team will be in touch shortly.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        `;
      }
      if (window.showToast && window.showToast.success) {
        window.showToast.success('Message Received', `Thank you, ${name}! Your inquiry has been sent to our concierge desk.`);
      }
      contactForm.reset();
      contactForm.classList.remove('was-validated');
      [contactName, contactEmail, contactPhone].forEach(inp => {
        if (inp) {
          inp.classList.remove('is-invalid', 'is-valid');
          inp.setCustomValidity('');
        }
      });
    });

    contactForm.addEventListener('reset', function() {
      contactForm.classList.remove('was-validated');
      [contactName, contactEmail, contactPhone].forEach(inp => {
        if (inp) {
          inp.classList.remove('is-invalid', 'is-valid');
          inp.setCustomValidity('');
        }
      });
    });
  }

  /* --------------------------------------------------
     12. AUTH FORMS & PASSWORD VISIBILITY
  -------------------------------------------------- */
  // Initialize password visibility toggles across forms
  document.querySelectorAll('.gh-password-toggle').forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = 'true';
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const targetId = this.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      const icon = this.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        if (icon) {
          icon.classList.remove('bi-eye');
          icon.classList.add('bi-eye-slash');
        }
        this.setAttribute('aria-label', 'Hide password');
      } else {
        input.type = 'password';
        if (icon) {
          icon.classList.remove('bi-eye-slash');
          icon.classList.add('bi-eye');
        }
        this.setAttribute('aria-label', 'Show password');
      }
    });
  });

  /* --------------------------------------------------
     13. NEWSLETTER FORMS
  -------------------------------------------------- */
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput) {
      setupValidEmailInput(emailInput, true);
    }
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const input = this.querySelector('input[type="email"]');
      const val = input ? input.value.trim() : '';
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!val || !emailRegex.test(val)) {
        if (input) {
          let msg = 'Please enter a valid email address (e.g. name@example.com).';
          if (!val.includes('@')) {
            msg = "Email address must contain an '@' symbol.";
          } else if (!val.split('@')[1] || !val.split('@')[1].includes('.')) {
            msg = 'Please include a valid domain extension like .com or .in.';
          }
          input.setCustomValidity(msg);
          input.classList.add('is-invalid');
          if (typeof input.reportValidity === 'function') {
            input.reportValidity();
          }
        }
        return;
      }

      if (input) {
        input.setCustomValidity('');
        input.classList.remove('is-invalid');
      }

      const btn = this.querySelector('button[type="submit"]');
      const orig = btn ? btn.innerHTML : 'Subscribe';
      if (btn) {
        btn.innerHTML = '<i class="bi bi-check2"></i> Subscribed!';
        btn.classList.add('btn-success');
      }
      setTimeout(() => {
        if (btn) {
          btn.innerHTML = orig;
          btn.classList.remove('btn-success');
        }
        if (input) input.value = '';
      }, 2500);
    });
  });

  /* --------------------------------------------------
     14. ADMIN DASHBOARD TABS & SEARCH
  -------------------------------------------------- */
  const adminNavLinks = document.querySelectorAll('.admin-nav-item[data-view]');
  const adminViews = document.querySelectorAll('.admin-view-pane');
  const adminSidebarToggle = document.getElementById('adminSidebarToggle');
  const adminSidebar = document.querySelector('.admin-sidebar');

  if (adminNavLinks.length && adminViews.length) {
    adminNavLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetView = this.getAttribute('data-view');

        adminNavLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');

        adminViews.forEach(view => {
          if (view.id === targetView) {
            view.style.display = 'block';
          } else {
            view.style.display = 'none';
          }
        });

        if (adminSidebar && window.innerWidth < 992) {
          adminSidebar.classList.remove('show');
        }
      });
    });
  }

  if (adminSidebarToggle && adminSidebar) {
    adminSidebarToggle.addEventListener('click', (e) => {
      e.preventDefault();
      adminSidebar.classList.toggle('show');
    });
  }

  const userTableSearch = document.getElementById('userTableSearch');
  if (userTableSearch) {
    userTableSearch.addEventListener('input', function() {
      const q = this.value.toLowerCase().trim();
      const rows = document.querySelectorAll('#userTableBody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  const orderTableSearch = document.getElementById('orderTableSearch');
  if (orderTableSearch) {
    orderTableSearch.addEventListener('input', function() {
      const q = this.value.toLowerCase().trim();
      const rows = document.querySelectorAll('#orderTableBody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  /* --------------------------------------------------
     15. COUNTDOWN TIMER (COMING SOON PAGE)
  -------------------------------------------------- */
  const countdownContainer = document.getElementById('launchCountdown');
  if (countdownContainer) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);

    function updateCountdown() {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;

      if (diff <= 0) {
        countdownContainer.innerHTML = '<h3 class="text-success">Launch is Live!</h3>';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const daysEl = document.getElementById('countDays');
      const hoursEl = document.getElementById('countHours');
      const minutesEl = document.getElementById('countMinutes');
      const secondsEl = document.getElementById('countSeconds');

      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
      if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* --------------------------------------------------
     16. NAVBAR G / H AUTO-SWITCH ANIMATION
  -------------------------------------------------- */
  // The G -> H -> G logo animation runs automatically and continuously via CSS keyframes.
  // Logo links remain fully clickable to navigate to index.html.

  /* --------------------------------------------------
     17. SCROLL REVEAL OBSERVER (HOME 2, EDITORIAL & ABOUT)
  -------------------------------------------------- */
  const revealElements = document.querySelectorAll('.h2-reveal, [data-gh-reveal]');
  if (revealElements.length > 0) {
    revealElements.forEach(el => {
      const delay = el.getAttribute('data-reveal-delay');
      if (delay) {
        el.style.transitionDelay = `${delay}ms`;
      }
    });

    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
      });

      revealElements.forEach(el => revealObserver.observe(el));
    } else {
      revealElements.forEach(el => el.classList.add('is-visible'));
    }

    // Immediately reveal elements near or in the viewport on load
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 30) {
        el.classList.add('is-visible');
      }
    });
  }

  /* --------------------------------------------------
     18. HOME 1: FARM TO PLATE VIEWPORT VIDEO AUTOPLAY
  -------------------------------------------------- */
  const farmVideo = document.getElementById('farmToPlateVideo');
  const farmVideoFrame = document.getElementById('farmVideoFrame');

  if (farmVideo) {
    farmVideo.muted = true;

    if ('IntersectionObserver' in window) {
      const farmVideoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const playPromise = farmVideo.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {});
            }
          } else {
            farmVideo.pause();
          }
        });
      }, {
        threshold: 0.2
      });

      farmVideoObserver.observe(farmVideo);
    } else {
      farmVideo.play().catch(() => {});
    }

    if (farmVideoFrame) {
      farmVideoFrame.addEventListener('click', () => {
        if (farmVideo.paused) {
          farmVideo.play().catch(() => {});
        } else {
          farmVideo.pause();
        }
      });
    }
  }

  /* --------------------------------------------------
     19. ANIMATED STAT COUNTERS (COUNT UP FROM 0)
  -------------------------------------------------- */
  const statCounterValues = document.querySelectorAll('.stat-counter-value');

  if (statCounterValues.length > 0) {
    const animateCounter = (el) => {
      if (el.dataset.animated === 'true') return;
      el.dataset.animated = 'true';

      const target = parseFloat(el.getAttribute('data-target'));
      if (isNaN(target)) return;

      const suffix = el.getAttribute('data-suffix') || '';
      const prefix = el.getAttribute('data-prefix') || '';
      const duration = 1800; // ms
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // easeOutCubic: 1 - (1-t)^3
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.round(target * easeOut);

        el.textContent = `${prefix}${currentVal}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          el.textContent = `${prefix}${target}${suffix}`;
        }
      };

      requestAnimationFrame(updateCount);
    };

    if ('IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '50px 0px 50px 0px'
      });

      statCounterValues.forEach(el => counterObserver.observe(el));
    } else {
      statCounterValues.forEach(el => animateCounter(el));
    }

    // Immediately trigger if already visible in or near viewport on load
    statCounterValues.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 60 && rect.bottom > -60) {
        animateCounter(el);
      }
    });
  }

  /* --------------------------------------------------
     20. 3D LUXURY TILT & SPOTLIGHT ON PARTNER CARDS
  -------------------------------------------------- */
  const partnerCards = document.querySelectorAll('.partner-farm-card');
  if (partnerCards.length > 0 && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    partnerCards.forEach(card => {
      let isHovered = false;

      card.addEventListener('mouseenter', () => {
        isHovered = true;
      });

      card.addEventListener('mousemove', (e) => {
        if (!isHovered) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px)`;
        
        const glow = card.querySelector('.partner-card-glass-glow');
        if (glow) {
          const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
          const glowColor = isDark ? 'rgba(0, 255, 127, 0.25)' : 'rgba(168, 230, 207, 0.45)';
          glow.style.background = `radial-gradient(circle at ${x}px ${y}px, ${glowColor} 0%, rgba(255, 255, 255, 0) 65%)`;
          glow.style.opacity = '1';
        }
      });
      
      card.addEventListener('mouseleave', () => {
        isHovered = false;
        card.style.transform = '';
        const glow = card.querySelector('.partner-card-glass-glow');
        if (glow) {
          glow.style.opacity = '0';
        }
      });
    });
  }

  /* --------------------------------------------------
     20B. SUSTAINABLE GROWERS INTERACTIVE MODAL ENGINE
  -------------------------------------------------- */
  const GROWERS_DATA = {
    'cascade-valley': {
      title: 'Cascade Valley Farms',
      location: 'Hood River, Oregon • Mt. Hood Valley Foothills',
      category: 'Micro-Greens',
      iconClass: 'bi-flower2',
      practice: 'Biodynamic',
      practiceBadgeClass: 'text-success',
      methodTitle: '100% Closed-Loop Biodynamic Greenhouse Ecology',
      summary: 'Cascade Valley Farms operates a zero-synthetic greenhouse bio-dome nestled at the base of Mt. Hood. Guided by Steiner biodynamic rhythms, they nurture living soils enriched with glacial volcanic mineral water, botanical compost teas, and celestial lunar cycles.',
      story: 'Every morning at 5:30 AM, freshly harvested living micro-herbs, crimson borage blossoms, and petite heirloom greens are packed in reusable cedar crates and driven direct to Green Haven. Chef Elena uses their fiery radish cress and velvety pea tendrils to garnish our signature dishes and infuse raw elixirs.',
      harvests: [
        'Living Purple Radish Cress',
        'Heirloom Borage Blossoms',
        'Bronze Mountain Fennel',
        'Lemon Sorrel Shoots',
        'Micro-Arugula Sprouted Greens'
      ],
      certifications: [
        'Demeter Biodynamic Certified',
        'Salmon-Safe Agriculture',
        'Zero Chemical Residue'
      ]
    },
    'willamette-forest': {
      title: 'Willamette Forest Truffles',
      location: 'Eugene, Oregon • Willamette National Forest Foothills',
      category: 'Wild Fungi',
      iconClass: 'bi-tree',
      practice: 'Wild Foraged',
      practiceBadgeClass: 'text-success',
      methodTitle: 'Ethical Wild Woodland Foraging & Trained Truffle Canines',
      summary: 'Led by master mycologist Tyler Vance and his trained lagotto truffle hounds, Willamette Forest Truffles practices mindful, low-impact foraging across generational Douglas fir and old-growth hazelnut groves.',
      story: 'Never using invasive soil rakes, Tyler delicately excavates truffles only when subterranean aroma peaks indicate mature spore readiness. Our kitchen receives white winter truffles within 12 hours of forest harvesting, imparting an earthy fragrance that defines our artisanal risotto and slow-simmered mushroom broths.',
      harvests: [
        'Oregon White Winter Truffles',
        'Golden Forest Chanterelles',
        'Wild Lion\'s Mane Clusters',
        'Wild Matsutake (Pine Mushrooms)',
        'Black Trumpet Fungi'
      ],
      certifications: [
        'Certified Wild Forest Harvest',
        '100% Sustainable Mycology Standard',
        'Cruelty-Free Canine Foraged'
      ]
    },
    'highland-heritage': {
      title: 'Highland Heritage Mill',
      location: 'Walla Walla, Washington • Columbia Plateau Basin',
      category: 'Ancient Grains',
      iconClass: 'bi-boxes',
      practice: 'Stone-Milled',
      practiceBadgeClass: 'text-success',
      methodTitle: 'Slow Granite Stone-Milling Under 28°C',
      summary: 'Generational farmers dedicated to reviving ancient landrace grains dating back 8,000 years. Highland Heritage grows rare emmer farro, purple barley, and einkorn using regenerative dryland cropping that revitalizes depleted soil microbiomes.',
      story: 'Whole grains are milled weekly between French granite millstones at ultra-low speeds to preserve the living grain germ, native vitamin E, and aromatic oils. Our baker uses their stone-milled einkorn flour for Green Haven\'s signature sourdough and whole-grain dessert crusts.',
      harvests: [
        'Heritage Purple Barley',
        'Cold-Pressed Sunflower Seed Oil',
        'Stone-Ground Einkorn Flour',
        'Organic Emmer Farro Kernels',
        'Spelt Sourdough Grain Base'
      ],
      certifications: [
        'Non-GMO Project Verified',
        'Regenerative Organic Certified (ROC)',
        'Unbleached & Additive Free'
      ]
    },
    'pacific-adaptogen': {
      title: 'Pacific Adaptogen Botanics',
      location: 'Olympia, Washington • Puget Sound Maritime Basin',
      category: 'Adaptogens',
      iconClass: 'bi-cup-hot',
      practice: '100% Organic',
      practiceBadgeClass: 'text-success',
      methodTitle: 'Regenerative Solar Extraction & Organic Cultivation',
      summary: 'Dedicated to cultivating medicinal botanicals and adaptogens using chemical-free polyculture. Their coastal microclimate produces high-density therapeutic saponins, volatile terpenes, and antioxidant polyphenol yields.',
      story: 'Partnering with Green Haven\'s sommelier, Pacific Adaptogen produces bespoke botanical reductions, steam-distilled floral waters, and adaptogenic syrups that elevate our mocktails and house kombuchas into revitalizing wellness experiences.',
      harvests: [
        'Organically Grown Ashwagandha Root',
        'Pacific Blue Lavender Hydrosol',
        'Holy Basil (Krishna Tulsi)',
        'Cold-Extracted Elderberry Nectar',
        'Fresh Lemon Verbena Leaves'
      ],
      certifications: [
        'USDA Certified Organic',
        'Certified Botanical GMP Standard',
        'Zero Synthetic Solvents'
      ]
    }
  };

  function openGrowerDetails(growerId) {
    const data = GROWERS_DATA[growerId] || GROWERS_DATA['cascade-valley'];
    let modalEl = document.getElementById('growerDetailsModal');
    
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'growerDetailsModal';
      modalEl.className = 'modal fade';
      modalEl.setAttribute('tabindex', '-1');
      modalEl.setAttribute('aria-labelledby', 'growerDetailsModalLabel');
      modalEl.setAttribute('aria-hidden', 'true');
      modalEl.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content rounded-4 border-0 shadow-lg overflow-hidden" style="background: var(--gh-surface, #ffffff); backdrop-filter: blur(20px);">
            <div class="modal-header border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1.5 fw-bold" id="growerModalCategory"></span>
                <span class="badge rounded-pill px-3 py-1.5 fw-bold" id="growerModalPracticeBadge" style="background: rgba(46, 125, 50, 0.12); color: #2E7D32;">
                  <i class="bi bi-patch-check-fill me-1"></i> <span id="growerModalPractice"></span>
                </span>
              </div>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4 p-md-5">
              <div class="d-flex align-items-center gap-3 mb-4 flex-wrap">
                <div class="grower-modal-icon-wrapper rounded-circle d-inline-flex align-items-center justify-content-center" id="growerModalIconWrap" style="width: 62px; height: 62px; background: rgba(46, 125, 50, 0.1); color: #2E7D32; font-size: 2rem; flex-shrink: 0;">
                  <i class="bi" id="growerModalIcon"></i>
                </div>
                <div>
                  <h3 class="fw-bold font-serif mb-1" id="growerModalTitle" style="color: var(--gh-heading-color, #1A3018);"></h3>
                  <div class="small text-muted d-flex align-items-center gap-1" id="growerModalLocation"></div>
                </div>
              </div>
              <div class="p-3 p-md-4 rounded-3 bg-light border mb-4 grower-modal-highlight-box">
                <h6 class="fw-bold mb-2 text-success d-flex align-items-center gap-2">
                  <i class="bi bi-flower1"></i> Sustainable Practice: <span id="growerModalMethodTitle"></span>
                </h6>
                <p class="mb-0 small text-muted leading-relaxed" id="growerModalSummary"></p>
              </div>
              <div class="mb-4">
                <h5 class="fw-bold font-serif mb-2" style="color: var(--gh-heading-color, #1A3018);">Partnership with Green Haven</h5>
                <p class="text-muted leading-relaxed small" id="growerModalStory"></p>
              </div>
              <div class="mb-4">
                <h6 class="text-uppercase small fw-bold letter-spacing-1 text-success mb-2.5">
                  <i class="bi bi-basket2 me-1"></i> Daily Kitchen Harvests
                </h6>
                <div class="d-flex flex-wrap gap-2" id="growerModalHarvests"></div>
              </div>
              <div class="p-3 rounded-3 border d-flex align-items-center justify-content-between flex-wrap gap-2 grower-modal-certs-box">
                <div class="d-flex align-items-center gap-2 small text-muted">
                  <i class="bi bi-shield-check text-success fs-5"></i>
                  <span class="fw-semibold">Verified Regeneration Standards</span>
                </div>
                <div class="d-flex align-items-center gap-2 flex-wrap" id="growerModalCerts"></div>
              </div>
            </div>
            <div class="modal-footer border-top py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span class="small text-muted"><i class="bi bi-arrow-repeat text-success me-1"></i> Direct Farm-to-Table Supply Chain</span>
              <div class="d-flex gap-2">
                <a href="menu.html" class="btn btn-sm btn-primary px-3 rounded-pill">
                  <i class="bi bi-book-half me-1"></i> View Dishes Featuring This Farm
                </a>
                <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);
    }

    const catEl = document.getElementById('growerModalCategory');
    const practiceEl = document.getElementById('growerModalPractice');
    const titleEl = document.getElementById('growerModalTitle');
    const locEl = document.getElementById('growerModalLocation');
    const iconEl = document.getElementById('growerModalIcon');
    const methodTitleEl = document.getElementById('growerModalMethodTitle');
    const summaryEl = document.getElementById('growerModalSummary');
    const storyEl = document.getElementById('growerModalStory');
    const harvestsEl = document.getElementById('growerModalHarvests');
    const certsEl = document.getElementById('growerModalCerts');

    if (catEl) catEl.textContent = data.category;
    if (practiceEl) practiceEl.textContent = data.practice;
    if (titleEl) titleEl.textContent = data.title;
    if (locEl) locEl.innerHTML = `<i class="bi bi-pin-map-fill text-success"></i> ${data.location}`;
    if (iconEl) iconEl.className = `bi ${data.iconClass}`;
    if (methodTitleEl) methodTitleEl.textContent = data.methodTitle;
    if (summaryEl) summaryEl.textContent = data.summary;
    if (storyEl) storyEl.textContent = data.story;

    if (harvestsEl) {
      harvestsEl.innerHTML = (data.harvests || []).map(h => 
        `<span class="badge bg-light text-dark border rounded-pill px-3 py-1.5 fw-semibold small">${h}</span>`
      ).join('');
    }

    if (certsEl) {
      certsEl.innerHTML = (data.certifications || []).map(c => 
        `<span class="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1 extra-small"><i class="bi bi-check2 me-1"></i>${c}</span>`
      ).join('');
    }

    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      bsModal.show();
    }
  }

  // Bind click & keyboard handlers for all partner cards, pill tags, and arrows
  if (partnerCards.length > 0) {
    partnerCards.forEach(card => {
      const growerId = card.getAttribute('data-grower-id') || 'cascade-valley';

      card.addEventListener('click', (e) => {
        e.preventDefault();
        openGrowerDetails(growerId);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) {
          e.preventDefault();
          openGrowerDetails(growerId);
        }
      });
    });
  }

  // Also bind any direct clicks to .partner-pill-tag or .partner-hover-arrow
  document.querySelectorAll('.partner-pill-tag, .partner-hover-arrow').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const parentCard = el.closest('.partner-farm-card');
      const growerId = el.getAttribute('data-grower-id') || (parentCard ? parentCard.getAttribute('data-grower-id') : 'cascade-valley');
      openGrowerDetails(growerId);
    });
  });

  /* --------------------------------------------------
     28. HERO DISH INTERACTIVE GLITTER TRAIL
  -------------------------------------------------- */
  const heroDishWraps = document.querySelectorAll('.hero-dish-img-wrap');
  heroDishWraps.forEach((heroDishWrap) => {
    let lastSparkleTime = 0;
    heroDishWrap.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastSparkleTime < 80) return;
      lastSparkleTime = now;

      const rect = heroDishWrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const sparkle = document.createElement('span');
      sparkle.className = 'cursor-sparkle';
      sparkle.style.left = `${x}px`;
      sparkle.style.top = `${y}px`;
      
      const randomRot = Math.floor(Math.random() * 90);
      const randomSize = Math.floor(Math.random() * 10) + 12;
      sparkle.style.width = `${randomSize}px`;
      sparkle.style.height = `${randomSize}px`;
      sparkle.innerHTML = `<svg viewBox="0 0 24 24" style="transform: rotate(${randomRot}deg)"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"/></svg>`;

      heroDishWrap.appendChild(sparkle);
      setTimeout(() => {
        sparkle.remove();
      }, 750);
    });
  });

  /* --------------------------------------------------
     29. UNIVERSAL LEGAL & PRIVACY MODAL ENGINE
  -------------------------------------------------- */
  const LEGAL_CONTENT = {
    privacy: {
      title: 'Privacy Policy',
      badge: 'Updated 2026',
      html: `
        <h6 class="fw-bold text-success mb-2"><i class="bi bi-shield-check me-1"></i> Respecting Your Digital & Dining Privacy</h6>
        <p class="small text-muted mb-3">At Green Haven, your privacy is treated with the same intentional care as our organic ingredients. We never sell, lease, or monetize personal dining data, dietary preferences, or payment credentials.</p>
        <h6 class="fw-bold text-dark mb-1">1. Information We Collect</h6>
        <p class="small text-muted mb-3">We collect personal contact details provided directly by you when reserving tables, ordering online, or contacting our hospitality concierge (such as name, email, phone number, and special dietary/allergen notes).</p>
        <h6 class="fw-bold text-dark mb-1">2. Culinary Personalization</h6>
        <p class="small text-muted mb-3">Allergen information provided during table bookings is communicated strictly to our executive culinary squad for your dining safety and table preparation.</p>
        <h6 class="fw-bold text-dark mb-1">3. Data Security & Retention</h6>
        <p class="small text-muted mb-0">We employ industry-standard encryption protocols. You may request deletion or export of your dining history at any time by contacting <a href="mailto:privacy@greenhaven.com" class="text-success">privacy@greenhaven.com</a>.</p>
      `
    },
    terms: {
      title: 'Terms & Conditions',
      badge: 'Hospitality Charter',
      html: `
        <h6 class="fw-bold text-success mb-2"><i class="bi bi-file-earmark-text me-1"></i> Green Haven Hospitality & Dining Terms</h6>
        <p class="small text-muted mb-3">By reserving a table, placing an online delivery order, or booking catering with Green Haven, you agree to our mindful hospitality terms outlined below.</p>
        <h6 class="fw-bold text-dark mb-1">1. Table Reservations & Grace Period</h6>
        <p class="small text-muted mb-3">Tables are held for 15 minutes past your scheduled reservation time. If your party is delayed, please notify our reception concierge via phone to preserve your seating arrangement.</p>
        <h6 class="fw-bold text-dark mb-1">2. Allergen Notice & Cross-Contact</h6>
        <p class="small text-muted mb-3">Green Haven operates a 100% plant-based facility free from animal products. While we practice strict ingredient segregation, please inform our team of severe nut or gluten sensitivities prior to dining.</p>
        <h6 class="fw-bold text-dark mb-1">3. Catering & Event Commitments</h6>
        <p class="small text-muted mb-0">Custom catering proposals require confirmed guest tallies 72 hours in advance of the milestone event date to guarantee farm-direct produce sourcing.</p>
      `
    }
  };

  function openLegalModal(type) {
    const item = LEGAL_CONTENT[type] || LEGAL_CONTENT.privacy;
    let modalEl = document.getElementById('ghLegalModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'ghLegalModal';
      modalEl.className = 'modal fade';
      modalEl.setAttribute('tabindex', '-1');
      modalEl.setAttribute('aria-hidden', 'true');
      modalEl.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content rounded-4 border-0 shadow-lg" style="background: var(--gh-surface, #fff);">
            <div class="modal-header border-bottom py-3 px-4">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-feather text-success fs-5"></i>
                <h5 class="modal-title font-heading fw-bold mb-0" id="ghLegalModalTitle">Privacy Policy</h5>
                <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1 extra-small" id="ghLegalModalBadge">Updated</span>
              </div>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4" id="ghLegalModalBody"></div>
            <div class="modal-footer border-top py-2.5 px-4 d-flex justify-content-between">
              <span class="small text-muted">Green Haven Hospitality Desk</span>
              <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);
    }

    const titleEl = document.getElementById('ghLegalModalTitle');
    const badgeEl = document.getElementById('ghLegalModalBadge');
    const bodyEl = document.getElementById('ghLegalModalBody');

    if (titleEl) titleEl.textContent = item.title;
    if (badgeEl) badgeEl.textContent = item.badge;
    if (bodyEl) bodyEl.innerHTML = item.html;

    if (typeof bootstrap !== 'undefined') {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  // Bind all legal links across the page (including dynamically loaded footers)
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-legal], .gh-legal-link');
    if (link) {
      e.preventDefault();
      const type = link.getAttribute('data-legal') || (link.textContent.toLowerCase().includes('terms') ? 'terms' : 'privacy');
      openLegalModal(type);
      return;
    }
    const plainLink = e.target.closest('a');
    if (plainLink && (plainLink.getAttribute('href') === '#' || !plainLink.getAttribute('href'))) {
      const text = plainLink.textContent.trim().toLowerCase();
      if (text.includes('privacy policy')) {
        e.preventDefault();
        openLegalModal('privacy');
      } else if (text.includes('terms') || text.includes('conditions')) {
        e.preventDefault();
        openLegalModal('terms');
      }
    }
  });

  /* ================================================================
     FOOTER SOCIAL MEDIA ICONS - MOBILE / TOUCH INTERACTION ENGINE
     Provides instant color-change feedback on tap/touch, eliminates
     sticky hover artifacts, prevents layout shifts, and ensures clean
     reversion across iOS Safari, Android Chrome, and touch devices.
     ================================================================ */
  (function initFooterSocialTouch() {
    let activeBtn = null;
    let touchTimer = null;
    let startX = 0;
    let startY = 0;

    function applyActive(btn) {
      if (!btn) return;
      if (activeBtn && activeBtn !== btn) {
        removeActive(activeBtn);
      }
      activeBtn = btn;
      btn.classList.add('touch-active');
      if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
      }
    }

    function removeActive(btn) {
      if (!btn) return;
      btn.classList.remove('touch-active');
      if (typeof btn.blur === 'function') {
        btn.blur();
      }
      if (activeBtn === btn) {
        activeBtn = null;
      }
    }

    function releaseActive(btn, delay) {
      if (!btn) return;
      if (delay > 0) {
        if (touchTimer) clearTimeout(touchTimer);
        touchTimer = setTimeout(function() {
          removeActive(btn);
        }, delay);
      } else {
        removeActive(btn);
      }
    }

    // Touch Start: instant color change feedback
    document.addEventListener('touchstart', function(e) {
      const btn = e.target.closest('.footer-social-btn, .gh-footer .footer-social-icon');
      if (!btn) return;
      if (e.touches && e.touches.length > 0) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
      applyActive(btn);
    }, { passive: true });

    // Touch Move: if finger scrolls / pans, cancel immediately to prevent stuck state
    document.addEventListener('touchmove', function(e) {
      if (!activeBtn) return;
      if (e.touches && e.touches.length > 0) {
        const deltaX = Math.abs(e.touches[0].clientX - startX);
        const deltaY = Math.abs(e.touches[0].clientY - startY);
        if (deltaX > 10 || deltaY > 10) {
          removeActive(activeBtn);
        }
      }
    }, { passive: true });

    // Touch End: maintain color change for 180ms so the visual tap is clearly perceived, then release & blur
    document.addEventListener('touchend', function(e) {
      const btn = e.target.closest('.footer-social-btn, .gh-footer .footer-social-icon') || activeBtn;
      if (btn) {
        releaseActive(btn, 180);
      }
    }, { passive: true });

    // Touch Cancel: immediate cleanup
    document.addEventListener('touchcancel', function() {
      if (activeBtn) removeActive(activeBtn);
    }, { passive: true });

    // Window blur or tab hidden: ensure no stuck state when switching tabs/apps
    window.addEventListener('blur', function() {
      if (activeBtn) removeActive(activeBtn);
      const allActive = document.querySelectorAll('.footer-social-btn.touch-active, .gh-footer .footer-social-icon.touch-active');
      for (let i = 0; i < allActive.length; i++) {
        removeActive(allActive[i]);
      }
    });

    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        if (activeBtn) removeActive(activeBtn);
        const allActive = document.querySelectorAll('.footer-social-btn.touch-active, .gh-footer .footer-social-icon.touch-active');
        for (let i = 0; i < allActive.length; i++) {
          removeActive(allActive[i]);
        }
      }
    });

    // Click blur: prevent persistent focus outlines or sticky states after mouse/tap clicks
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.footer-social-btn, .gh-footer .footer-social-icon');
      if (btn) {
        setTimeout(function() {
          if (typeof btn.blur === 'function') btn.blur();
        }, 200);
      }
    });
  })();

  /* ==========================================================================
     19. HERO SECTION CTA & SMOOTH SCROLL HANDLER (HOME 2 FARM-TO-PLATE)
     ========================================================================== */
  (function() {
    document.addEventListener('click', function(e) {
      const eyebrowCta = e.target.closest('a.h2-eyebrow[href^="#"], a.h2-eyebrow-cta, a[href="#process"], a[href="#farmToPlate"]');
      if (!eyebrowCta) return;

      const targetId = eyebrowCta.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId) || document.getElementById('process');
      if (targetEl) {
        e.preventDefault();
        
        const navbar = document.querySelector('.gh-navbar, .nx-navbar');
        const navHeight = navbar ? navbar.offsetHeight : 80;
        const targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;

        // Execute smooth scroll without scroll interruption
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth'
        });

        // Delay URL hash update so smooth-scroll animation is never aborted mid-flight by the browser
        setTimeout(function() {
          try {
            if (window.history && window.history.replaceState) {
              window.history.replaceState(null, '', targetId);
            }
          } catch (err) {}
        }, 750);
      }
    });
  })();

});


