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

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

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

  function applyDir(dir) {
    document.documentElement.setAttribute('dir', dir);
    if (dir === 'rtl') {
      document.documentElement.classList.add('rtl');
      rtlToggleBtns.forEach(btn => {
        btn.innerHTML = '<i class="bi bi-arrow-left-right"></i>';
        btn.setAttribute('aria-label', 'Switch to Left-to-Right layout (LTR)');
        btn.setAttribute('title', 'Switch to Left-to-Right layout (LTR)');
      });
    } else {
      document.documentElement.classList.remove('rtl');
      rtlToggleBtns.forEach(btn => {
        btn.innerHTML = '<i class="bi bi-arrow-left-right"></i>';
        btn.setAttribute('aria-label', 'Switch to Right-to-Left layout (RTL)');
        btn.setAttribute('title', 'Switch to Right-to-Left layout (RTL)');
      });
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

  /* --------------------------------------------------
     3. STICKY NAVBAR & BACK-TO-TOP BUTTON
  -------------------------------------------------- */
  const navbars = document.querySelectorAll('.gh-navbar, .nx-navbar');
  const backToTopBtn = document.querySelector('.back-to-top');

  window.addEventListener('scroll', () => {
    navbars.forEach(navbar => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    if (backToTopBtn) {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* Responsive Mobile Offcanvas Toggle Enforcer */
  function enforceResponsiveMobileToggle() {
    const isDesktop = window.innerWidth >= 992;
    const toggles = document.querySelectorAll('.gh-mobile-toggle, [data-bs-target="#mobileMenuOffcanvas"]');
    toggles.forEach(t => {
      if (isDesktop) {
        t.style.setProperty('display', 'none', 'important');
        t.style.setProperty('visibility', 'hidden', 'important');
        t.style.setProperty('opacity', '0', 'important');
        t.style.setProperty('pointer-events', 'none', 'important');
      } else {
        t.style.setProperty('display', 'inline-flex', 'important');
        t.style.setProperty('visibility', 'visible', 'important');
        t.style.setProperty('opacity', '1', 'important');
        t.style.setProperty('pointer-events', 'auto', 'important');
      }
    });
  }
  enforceResponsiveMobileToggle();
  window.addEventListener('resize', enforceResponsiveMobileToggle);

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
          document.querySelectorAll('.menu-item-card').forEach(c => c.style.display = 'block');
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
        });
        targetSection.classList.add('active');

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
          if (section.getAttribute('id') === activeTargetId) {
            section.classList.add('active');
          } else {
            section.classList.remove('active');
          }
          section.querySelectorAll('.menu-item-card').forEach(card => {
            card.style.display = 'block';
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
          const title = (card.querySelector('.dish-card-title, .dish-title, h3, h4')?.textContent || '').toLowerCase();
          const category = (card.getAttribute('data-category') || '').toLowerCase();

          const match = (!query || title.includes(query) || category.includes(query));
          if (match) {
            card.style.display = 'block';
            sectionMatches++;
            totalVisible++;
          } else {
            card.style.display = 'none';
          }
        });

        if (sectionMatches > 0) {
          section.classList.add('search-active');
        } else {
          section.classList.remove('search-active', 'active');
        }
      });
    } else if (menuItemCards.length) {
      let activeCat = 'all';
      const activeBtn = document.querySelector('.menu-filter-btn.active');
      if (activeBtn) activeCat = activeBtn.getAttribute('data-filter') || 'all';

      menuItemCards.forEach(card => {
        const cat = card.getAttribute('data-category') || '';
        const title = (card.querySelector('.dish-title, h3, h4')?.textContent || '').toLowerCase();
        const desc = (card.querySelector('.dish-desc, p')?.textContent || '').toLowerCase();

        const matchCat = (activeCat === 'all' || cat === activeCat);
        const matchQuery = (!query || title.includes(query) || desc.includes(query));

        if (matchCat && matchQuery) {
          card.style.display = 'block';
          totalVisible++;
        } else {
          card.style.display = 'none';
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
        if (priceStarter) priceStarter.textContent = '$29';
        if (pricePro) pricePro.textContent = '$79';
        if (priceEnterprise) priceEnterprise.textContent = '$199';
        billingPeriodLabels.forEach(el => el.textContent = '/ month (billed yearly)');
      } else {
        if (priceStarter) priceStarter.textContent = '$39';
        if (pricePro) pricePro.textContent = '$99';
        if (priceEnterprise) priceEnterprise.textContent = '$249';
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
     9. TABLE RESERVATION FORM & RECEIPT MODAL
  -------------------------------------------------- */
  const reservationForm = document.getElementById('reservationForm');
  if (reservationForm) {
    reservationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (!this.checkValidity()) {
        e.stopPropagation();
        this.classList.add('was-validated');
        return;
      }

      const name = document.getElementById('resName')?.value || 'Guest';
      const email = document.getElementById('resEmail')?.value || 'N/A';
      const date = document.getElementById('resDate')?.value || 'Selected Date';
      const time = document.getElementById('resTime')?.value || 'Selected Time';
      const guests = document.getElementById('resGuests')?.value || '2';
      const seating = document.getElementById('resSeating')?.value || 'Indoor Dining';

      const receiptName = document.getElementById('receiptName');
      const receiptEmail = document.getElementById('receiptEmail');
      const receiptDate = document.getElementById('receiptDate');
      const receiptTime = document.getElementById('receiptTime');
      const receiptGuests = document.getElementById('receiptGuests');
      const receiptSeating = document.getElementById('receiptSeating');

      if (receiptName) receiptName.textContent = name;
      if (receiptEmail) receiptEmail.textContent = email;
      if (receiptDate) receiptDate.textContent = date;
      if (receiptTime) receiptTime.textContent = time;
      if (receiptGuests) receiptGuests.textContent = `${guests} Guests`;
      if (receiptSeating) receiptSeating.textContent = seating;

      const modalEl = document.getElementById('resReceiptModal');
      if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      } else {
        alert(`Reservation Confirmed for ${name}! Date: ${date} at ${time}. Confirmation sent to ${email}.`);
      }

      reservationForm.reset();
      reservationForm.classList.remove('was-validated');
    });
  }

  /* --------------------------------------------------
     10. CATERING INQUIRY FORM
  -------------------------------------------------- */
  const cateringForm = document.getElementById('cateringForm');
  if (cateringForm) {
    cateringForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (!this.checkValidity()) {
        e.stopPropagation();
        this.classList.add('was-validated');
        return;
      }
      const name = document.getElementById('cateringName')?.value || document.getElementById('catName')?.value || 'Valued Client';
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
    });
  }

  /* --------------------------------------------------
     11. CONTACT FORM
  -------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (!this.checkValidity()) {
        e.stopPropagation();
        this.classList.add('was-validated');
        return;
      }
      const name = document.getElementById('contactName')?.value || 'Valued Client';
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
      contactForm.reset();
      contactForm.classList.remove('was-validated');
    });
  }

  /* --------------------------------------------------
     12. AUTH FORMS (LOGIN & REGISTER)
  -------------------------------------------------- */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (!this.checkValidity()) {
        e.stopPropagation();
        this.classList.add('was-validated');
        return;
      }
      const email = document.getElementById('loginEmail')?.value;
      const feedback = document.getElementById('loginFeedback');
      if (feedback) {
        feedback.innerHTML = `
          <div class="alert alert-success alert-dismissible fade show mt-3" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>
            Signed in successfully as <strong>${email}</strong>. Welcome back!
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        `;
      }
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const pass = document.getElementById('regPassword')?.value;
      const confirmPass = document.getElementById('regConfirmPassword')?.value;
      const confirmInput = document.getElementById('regConfirmPassword');

      if (pass !== confirmPass) {
        if (confirmInput) confirmInput.setCustomValidity('Passwords do not match');
      } else {
        if (confirmInput) confirmInput.setCustomValidity('');
      }

      if (!this.checkValidity()) {
        e.stopPropagation();
        this.classList.add('was-validated');
        return;
      }

      const name = document.getElementById('regName')?.value;
      const feedback = document.getElementById('registerFeedback');
      if (feedback) {
        feedback.innerHTML = `
          <div class="alert alert-success alert-dismissible fade show mt-3" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>
            Account created successfully for <strong>${name}</strong>! Redirecting to login...
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        `;
      }
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1200);
    });
  }

  /* --------------------------------------------------
     13. NEWSLETTER FORMS
  -------------------------------------------------- */
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]');
      if (email && email.value.includes('@')) {
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
          email.value = '';
        }, 2500);
      }
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

});


