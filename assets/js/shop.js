/**
 * Green Haven - Online Food Ordering, Cart, Checkout, Order Tracking & Auth Engine
 * Frontend-only logic backed by localStorage
 */

(function () {
  'use strict';

  // LocalStorage Keys
  const AUTH_KEY = 'gh_logged_in';
  const USER_KEY = 'gh_user';
  const USERS_KEY = 'gh_users';
  const CART_KEY = 'gh_cart';
  const ORDERS_KEY = 'gh_orders';
  const PENDING_ACTION_KEY = 'gh_pending_order_action';

  // Seed default registered accounts for seamless demonstration
  const DEFAULT_USERS = [
    {
      name: 'Maya Lin',
      email: 'maya@greenhaven.com',
      password: 'Password123!',
      phone: '+1 (503) 555-0199',
      diet: '100% Plant-Based / Vegan',
      createdAt: new Date().toISOString()
    },
    {
      name: 'Julian Sterling',
      email: 'julian@greenhaven.com',
      password: 'Password123!',
      phone: '+1 (503) 555-0144',
      diet: '100% Plant-Based / Vegan',
      createdAt: new Date().toISOString()
    }
  ];

  /* ==========================================================================
     1. AUTHENTICATION MODULE
     ========================================================================== */
  const Auth = {
    getUsers() {
      try {
        const raw = localStorage.getItem(USERS_KEY);
        if (!raw) {
          localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
          return [...DEFAULT_USERS];
        }
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [...DEFAULT_USERS];
      } catch (e) {
        return [...DEFAULT_USERS];
      }
    },

    findUserByEmail(email) {
      if (!email) return null;
      const clean = String(email).trim().toLowerCase();
      return this.getUsers().find(u => u.email.trim().toLowerCase() === clean) || null;
    },

    isLoggedIn() {
      return localStorage.getItem(AUTH_KEY) === 'true';
    },

    getCurrentUser() {
      try {
        const data = localStorage.getItem(USER_KEY);
        return data ? JSON.parse(data) : null;
      } catch (e) {
        return null;
      }
    },

    registerUser(userData) {
      const cleanEmail = String(userData.email || '').trim().toLowerCase();
      const users = this.getUsers();

      if (users.some(u => u.email.trim().toLowerCase() === cleanEmail)) {
        return {
          success: false,
          error: 'duplicate_email',
          message: 'An account with this email already exists.'
        };
      }

      const fullName = (userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`).trim();
      const newUser = {
        name: fullName,
        firstName: String(userData.firstName || (fullName.split(' ')[0] || '')).trim(),
        lastName: String(userData.lastName || (fullName.split(' ').slice(1).join(' ') || '')).trim(),
        email: cleanEmail,
        password: String(userData.password || ''),
        phone: String(userData.phone || '').trim(),
        diet: String(userData.diet || '100% Plant-Based / Vegan'),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      return {
        success: true,
        user: newUser
      };
    },

    validateCredentials(email, password) {
      const cleanEmail = String(email || '').trim().toLowerCase();
      const user = this.findUserByEmail(cleanEmail);

      if (!user) {
        return {
          success: false,
          error: 'not_found',
          message: 'Account not found. Please create an account first.'
        };
      }

      if (String(user.password || '') !== String(password || '')) {
        return {
          success: false,
          error: 'wrong_password',
          message: 'Incorrect password. Please try again.'
        };
      }

      return {
        success: true,
        user
      };
    },

    loginUser(userData, redirectUrl = 'index.html') {
      localStorage.setItem(AUTH_KEY, 'true');

      // Do not store raw password in active session
      const sessionUser = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        diet: userData.diet || '100% Plant-Based / Vegan'
      };
      localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
      this.updateNavbar();

      if (window.showToast) {
        window.showToast.success('Welcome back!', `Signed in successfully as ${sessionUser.name}.`);
      }

      // Resume any pending order action seamlessly
      let pendingAction = null;
      try {
        const rawPending = localStorage.getItem(PENDING_ACTION_KEY);
        if (rawPending) {
          pendingAction = JSON.parse(rawPending);
          localStorage.removeItem(PENDING_ACTION_KEY);
        }
      } catch (e) {}

      if (pendingAction) {
        if (pendingAction.type === 'add_to_cart' && pendingAction.item) {
          Cart.addToCart(pendingAction.item, pendingAction.qty || 1, true);
          if (window.showToast) {
            window.showToast.success('Order Resumed', `Added ${pendingAction.qty || 1}x ${pendingAction.item.name} to your dining cart.`);
          }
          const target = pendingAction.returnUrl || 'menu.html';
          setTimeout(() => { window.location.href = target; }, 600);
          return;
        } else if (pendingAction.type === 'checkout') {
          setTimeout(() => { window.location.href = 'checkout.html'; }, 600);
          return;
        }
      }

      if (redirectUrl) {
        setTimeout(() => { window.location.href = redirectUrl; }, 600);
      }
    },

    logoutUser() {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(USER_KEY);
      this.updateNavbar();

      if (window.showToast) {
        window.showToast.info('Signed Out', 'Logged out successfully.');
      }

      const protectedPages = ['checkout.html', 'order-success.html', 'my-account.html', 'orders.html'];
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      if (protectedPages.includes(currentPage)) {
        setTimeout(() => { window.location.href = 'login.html'; }, 650);
      }
    },

    requireLogin(targetRedirect = null) {
      if (!this.isLoggedIn()) {
        const currentPage = targetRedirect || window.location.pathname.split('/').pop() || 'index.html';
        this.showAuthPrompt({
          message: 'Please sign in to continue with your order.',
          pendingAction: { type: 'checkout' },
          returnUrl: currentPage
        });
        return false;
      }
      return true;
    },

    showAuthPrompt(options = {}) {
      const message = options.message || 'Please sign in to continue with your order.';
      const returnUrl = options.returnUrl || window.location.pathname.split('/').pop() || 'index.html';

      if (options.pendingAction) {
        localStorage.setItem(PENDING_ACTION_KEY, JSON.stringify({
          ...options.pendingAction,
          returnUrl
        }));
      }

      let modalEl = document.getElementById('ghAuthPromptModal');
      if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.id = 'ghAuthPromptModal';
        modalEl.className = 'modal fade';
        modalEl.setAttribute('tabindex', '-1');
        modalEl.setAttribute('aria-hidden', 'true');
        modalEl.innerHTML = `
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content gh-auth-modal-card border-0">
              <div class="p-4 p-md-5 text-center position-relative">
                <button type="button" class="btn-close position-absolute top-0 end-0 m-4" data-bs-dismiss="modal" aria-label="Close"></button>
                <div class="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success" style="width: 64px; height: 64px;">
                  <i class="bi bi-bag-heart-fill fs-2"></i>
                </div>
                <h4 class="font-serif fw-bold mb-2" style="color: var(--gh-heading-color, #262422);">Authentication Required</h4>
                <p class="text-muted mb-4 fs-6" id="ghAuthPromptMsgText">${escapeHtml(message)}</p>

                <div id="ghAuthPromptPendingBox" class="p-3 rounded-3 bg-light border mb-4 text-start small d-none">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-flower1 text-success fs-5"></i>
                    <div>
                      <span class="text-muted d-block" style="font-size: 0.72rem; letter-spacing: 0.5px; text-transform: uppercase;">Selected Dish:</span>
                      <strong id="ghAuthPromptPendingName" class="text-dark">Dish Name</strong>
                    </div>
                  </div>
                </div>

                <div class="d-flex flex-column gap-2">
                  <a href="login.html?redirect=${encodeURIComponent(returnUrl)}" class="btn btn-primary py-2.5 fw-semibold" id="btnAuthPromptSignIn">
                    <i class="bi bi-box-arrow-in-right me-1"></i> Sign In
                  </a>
                  <a href="register.html?redirect=${encodeURIComponent(returnUrl)}" class="btn btn-outline-primary py-2.5 fw-semibold" id="btnAuthPromptRegister">
                    <i class="bi bi-person-plus me-1"></i> Create Account
                  </a>
                  <button type="button" class="btn btn-link text-muted py-2 text-decoration-none small" data-bs-dismiss="modal">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modalEl);
      } else {
        const msgEl = modalEl.querySelector('#ghAuthPromptMsgText');
        if (msgEl) msgEl.textContent = message;
        const signInBtn = modalEl.querySelector('#btnAuthPromptSignIn');
        if (signInBtn) signInBtn.href = `login.html?redirect=${encodeURIComponent(returnUrl)}`;
        const regBtn = modalEl.querySelector('#btnAuthPromptRegister');
        if (regBtn) regBtn.href = `register.html?redirect=${encodeURIComponent(returnUrl)}`;
      }

      const pendingBox = modalEl.querySelector('#ghAuthPromptPendingBox');
      const pendingName = modalEl.querySelector('#ghAuthPromptPendingName');
      if (options.pendingAction && options.pendingAction.item && options.pendingAction.item.name) {
        if (pendingBox && pendingName) {
          pendingName.textContent = options.pendingAction.item.name;
          pendingBox.classList.remove('d-none');
        }
      } else if (pendingBox) {
        pendingBox.classList.add('d-none');
      }

      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        bsModal.show();
      }
    },

    initPasswordToggles() {
      document.querySelectorAll('.gh-password-toggle').forEach(btn => {
        if (btn.dataset.bound) return;
        btn.dataset.bound = 'true';
        btn.addEventListener('click', function (e) {
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
    },

    updateNavbar() {
      const authContainer = document.getElementById('navAuthContainer');
      const mobileAuthContainer = document.getElementById('mobileNavAuthContainer');
      const loggedIn = this.isLoggedIn();
      const user = this.getCurrentUser();

      const getDesktopHtml = () => {
        if (loggedIn && user) {
          const firstName = (user.name || 'Member').split(' ')[0];
          return `
            <div class="dropdown d-inline-block gh-nav-auth-dropdown">
              <button class="btn btn-outline-primary btn-sm dropdown-toggle d-inline-flex align-items-center gap-1 gh-nav-auth-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Account menu">
                <i class="bi bi-person-circle fs-6 text-success gh-nav-auth-icon"></i>
                <span class="gh-nav-auth-greeting d-none d-md-inline">Hi, <strong>${escapeHtml(firstName)}</strong></span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end gh-dropdown-menu shadow-lg">
                <li class="px-3 pt-3 pb-2 text-center border-bottom mb-2">
                  <div class="d-flex justify-content-center mb-1">
                    <div class="d-inline-flex align-items-center justify-content-center rounded-circle" style="width: 46px; height: 46px; background-color: rgba(46, 125, 50, 0.08);">
                      <i class="bi bi-person-circle text-success" style="font-size: 1.85rem; line-height: 1;"></i>
                    </div>
                  </div>
                  <div class="fw-bold text-truncate" style="color: var(--gh-heading-color, #1A3018); font-size: 0.96rem;">${escapeHtml(user.name || 'Member')}</div>
                  <div class="small text-muted text-truncate" style="font-size: 0.8rem;">${escapeHtml(user.email || '')}</div>
                </li>
                <li><a class="dropdown-item gh-dropdown-item" href="my-account.html"><i class="bi bi-person-vcard me-2 text-primary"></i> My Profile</a></li>
                <li><a class="dropdown-item gh-dropdown-item" href="orders.html"><i class="bi bi-bag-check me-2 text-success"></i> My Orders</a></li>
                <li><a class="dropdown-item gh-dropdown-item" href="cart.html"><i class="bi bi-cart3 me-2 text-warning"></i> My Cart</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item gh-dropdown-item text-danger" href="#" id="btnLogoutDesktop"><i class="bi bi-box-arrow-right me-2"></i> Logout</a></li>
              </ul>
            </div>
          `;
        } else {
          return `
            <div class="d-inline-flex align-items-center gap-2 flex-nowrap">
              <a href="login.html" class="btn btn-outline-primary btn-sm gh-nav-auth-login-btn" title="Sign In" aria-label="Sign In">
                <i class="bi bi-box-arrow-in-right me-1"></i><span class="gh-nav-auth-label">Sign In</span>
              </a>
            </div>
          `;
        }
      };

      const getMobileHtml = () => {
        if (loggedIn && user) {
          return `
            <div class="p-3 bg-light rounded-3 mb-3 border text-center gh-mobile-user-card">
              <div class="d-flex flex-column align-items-center justify-content-center mb-3">
                <div class="gh-mobile-user-icon-wrap mb-2">
                  <i class="bi bi-person-circle text-success" style="font-size: 2.35rem; line-height: 1; display: inline-block;"></i>
                </div>
                <div class="fw-bold fs-5 text-center text-truncate w-100" style="color: var(--gh-heading-color, #1A3018);">${escapeHtml(user.name || 'Member')}</div>
                <div class="small text-muted text-center text-truncate w-100">${escapeHtml(user.email || '')}</div>
              </div>
              <div class="d-grid gap-2">
                <a href="my-account.html" class="btn btn-sm btn-outline-primary text-start"><i class="bi bi-person-vcard me-2"></i> My Account</a>
                <a href="orders.html" class="btn btn-sm btn-outline-primary text-start"><i class="bi bi-bag-check me-2"></i> My Orders</a>
                <button class="btn btn-sm btn-danger text-start" id="btnLogoutMobile"><i class="bi bi-box-arrow-right me-2"></i> Logout</button>
              </div>
            </div>
          `;
        } else {
          return `
            <div class="d-grid gap-2 mb-3">
              <a href="login.html" class="btn btn-outline-primary w-100"><i class="bi bi-box-arrow-in-right me-1"></i> Sign In</a>
            </div>
          `;
        }
      };

      if (authContainer) authContainer.innerHTML = getDesktopHtml();
      if (mobileAuthContainer) mobileAuthContainer.innerHTML = getMobileHtml();

      const btnLogoutDesktop = document.getElementById('btnLogoutDesktop');
      if (btnLogoutDesktop) {
        btnLogoutDesktop.addEventListener('click', (e) => {
          e.preventDefault();
          this.logoutUser();
        });
      }

      const btnLogoutMobile = document.getElementById('btnLogoutMobile');
      if (btnLogoutMobile) {
        btnLogoutMobile.addEventListener('click', (e) => {
          e.preventDefault();
          this.logoutUser();
        });
      }
    }
  };

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

  /* ==========================================================================
     2. CART MODULE & SIDE DRAWER ENGINE
     ========================================================================== */
  const Cart = {
    DELIVERY_FEE: 99.00,
    FREE_DELIVERY_THRESHOLD: 999.00,
    TAX_RATE: 0.05, // 5% GST

    getCart() {
      try {
        const data = localStorage.getItem(CART_KEY);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
      }
    },

    saveCart(items) {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
      this.updateBadges();
      this.renderDrawer();
      if (typeof window.renderCartPage === 'function') {
        window.renderCartPage();
      }
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items, count: this.getItemCount() } }));
    },

    addToCart(item, qty = 1, openDrawer = true) {
      if (!Auth.isLoggedIn()) {
        Auth.showAuthPrompt({
          message: "Please sign in to continue with your order.",
          pendingAction: {
            type: 'add_to_cart',
            item: item,
            qty: qty,
            openDrawer: openDrawer
          },
          returnUrl: window.location.pathname.split('/').pop() || 'menu.html'
        });
        return;
      }

      const items = this.getCart();
      const existing = items.find(i => String(i.id) === String(item.id));
      
      const quantityToAdd = Math.max(1, parseInt(qty, 10) || 1);

      if (existing) {
        existing.qty += quantityToAdd;
      } else {
        items.push({
          id: String(item.id),
          name: item.name,
          price: parseFloat(item.price) || 0.0,
          image: item.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop',
          category: item.category || 'Mains',
          qty: quantityToAdd
        });
      }

      this.saveCart(items);
      UI.showToast('Added to Cart', `<strong>${quantityToAdd}x ${escapeHtml(item.name)}</strong> added to your dining cart!`, 'bi-bag-check-fill');
      
      if (openDrawer) {
        this.openDrawer();
      }

      return items;
    },

    updateQuantity(id, change) {
      let items = this.getCart();
      const item = items.find(i => String(i.id) === String(id));
      if (!item) return;

      item.qty += change;
      if (item.qty <= 0) {
        items = items.filter(i => String(i.id) !== String(id));
      }
      this.saveCart(items);
      return items;
    },

    removeFromCart(id) {
      let items = this.getCart();
      items = items.filter(i => String(i.id) !== String(id));
      this.saveCart(items);
      UI.showToast('Item Removed', 'The item has been removed from your cart.', 'bi-trash3');
      return items;
    },

    clearCart() {
      localStorage.removeItem(CART_KEY);
      this.updateBadges();
      this.renderDrawer();
      if (typeof window.renderCartPage === 'function') {
        window.renderCartPage();
      }
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items: [], count: 0 } }));
    },

    getItemCount() {
      const items = this.getCart();
      return items.reduce((acc, item) => acc + (item.qty || 1), 0);
    },

    getSubtotal() {
      const items = this.getCart();
      return items.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);
    },

    getDeliveryFee() {
      const subtotal = this.getSubtotal();
      if (subtotal === 0) return 0;
      return subtotal >= this.FREE_DELIVERY_THRESHOLD ? 0.00 : this.DELIVERY_FEE;
    },

    getTax() {
      return this.getSubtotal() * this.TAX_RATE;
    },

    getTotal() {
      const subtotal = this.getSubtotal();
      if (subtotal === 0) return 0;
      return subtotal + this.getDeliveryFee() + this.getTax();
    },

    updateBadges() {
      const count = this.getItemCount();
      const badges = document.querySelectorAll('.cart-badge-count, #navCartCount');
      badges.forEach(b => {
        b.textContent = count;
        b.style.display = count > 0 ? 'inline-flex' : 'none';
        b.classList.remove('cart-badge-bounce');
        void b.offsetWidth;
        b.classList.add('cart-badge-bounce');
        setTimeout(() => b.classList.remove('cart-badge-bounce'), 500);
      });
      const drawerBadge = document.getElementById('ghCartCountBadge');
      if (drawerBadge) {
        drawerBadge.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
      }
    },

    initDrawer() {
      if (document.getElementById('ghCartDrawer')) return;

      const overlay = document.createElement('div');
      overlay.id = 'ghCartOverlay';
      overlay.className = 'gh-cart-overlay';
      overlay.setAttribute('aria-hidden', 'true');

      const drawer = document.createElement('aside');
      drawer.id = 'ghCartDrawer';
      drawer.className = 'gh-cart-drawer';
      drawer.setAttribute('role', 'dialog');
      drawer.setAttribute('aria-modal', 'true');
      drawer.setAttribute('aria-label', 'Shopping Cart Drawer');

      drawer.innerHTML = `
        <div class="gh-cart-header">
          <div class="gh-cart-title-wrap">
            <h3 class="gh-cart-title">
              <i class="bi bi-bag-check-fill text-success"></i> Your Dining Cart
            </h3>
            <span id="ghCartCountBadge" class="gh-cart-count-badge">0 items</span>
          </div>
          <button type="button" class="gh-cart-close-btn" id="ghCartCloseBtn" aria-label="Close cart drawer" title="Close cart">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="gh-cart-delivery-banner" id="ghCartDeliveryBanner">
          <div class="gh-cart-delivery-msg" id="ghCartDeliveryMsg">
            <span>Free Delivery:</span>
            <strong id="ghCartDeliveryRemaining">₹999 away</strong>
          </div>
          <div class="gh-cart-delivery-track">
            <div class="gh-cart-delivery-fill" id="ghCartDeliveryFill" style="width: 0%;"></div>
          </div>
        </div>

        <div class="gh-cart-body" id="ghCartBody">
          <!-- Dynamic Cart Items Injected Here -->
        </div>

        <div class="gh-cart-footer" id="ghCartFooter">
          <div class="gh-cart-summary-list">
            <div class="gh-cart-summary-row">
              <span>Dishes Subtotal</span>
              <span class="fw-semibold text-dark-emphasis" id="ghCartSubtotalText">₹0</span>
            </div>
            <div class="gh-cart-summary-row">
              <span>Delivery Fee</span>
              <span class="fw-semibold" id="ghCartDeliveryText">₹99</span>
            </div>
            <div class="gh-cart-summary-row">
              <span>Estimated Tax (5%)</span>
              <span class="fw-semibold" id="ghCartTaxText">₹0</span>
            </div>
            <div class="gh-cart-summary-row total-row">
              <span>Estimated Total</span>
              <span class="total-amount" id="ghCartGrandTotalText">₹0</span>
            </div>
          </div>

          <a href="checkout.html" class="btn btn-primary gh-cart-checkout-btn shadow-sm" id="ghCartCheckoutBtn">
            <span>Proceed to Checkout</span>
            <i class="bi bi-arrow-right"></i>
          </a>

          <div class="gh-cart-footer-links">
            <button type="button" class="gh-cart-secondary-link" id="ghCartContinueShopping">
              <i class="bi bi-arrow-left"></i> Continue Shopping
            </button>
            <a href="cart.html" class="gh-cart-secondary-link">
              <span>View Full Cart</span> <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      document.body.appendChild(drawer);

      overlay?.addEventListener('click', () => this.closeDrawer());
      drawer.querySelector('#ghCartCloseBtn')?.addEventListener('click', () => this.closeDrawer());
      drawer.querySelector('#ghCartContinueShopping')?.addEventListener('click', () => this.closeDrawer());
      drawer.querySelector('#ghCartCheckoutBtn')?.addEventListener('click', (e) => {
        if (!Auth.isLoggedIn()) {
          e.preventDefault();
          this.closeDrawer();
          Auth.showAuthPrompt({
            message: 'Please sign in to continue with your order.',
            pendingAction: { type: 'checkout' },
            returnUrl: 'checkout.html'
          });
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isDrawerOpen()) {
          this.closeDrawer();
        }
      });

      const cartBody = drawer.querySelector('#ghCartBody') || document.getElementById('ghCartBody');
      cartBody?.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');

        if (action === 'plus') {
          this.updateQuantity(id, 1);
        } else if (action === 'minus') {
          this.updateQuantity(id, -1);
        } else if (action === 'remove') {
          this.removeFromCart(id);
        } else if (action === 'continue-shopping') {
          this.closeDrawer();
        }
      });

      this.renderDrawer();
    },

    isDrawerOpen() {
      const drawer = document.getElementById('ghCartDrawer');
      return drawer && drawer.classList.contains('is-open');
    },

    openDrawer() {
      this.initDrawer();
      this.renderDrawer();
      const drawer = document.getElementById('ghCartDrawer');
      const overlay = document.getElementById('ghCartOverlay');
      if (drawer) drawer.classList.add('is-open');
      if (overlay) overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    },

    closeDrawer() {
      const drawer = document.getElementById('ghCartDrawer');
      const overlay = document.getElementById('ghCartOverlay');
      if (drawer) drawer.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    },

    toggleDrawer() {
      if (this.isDrawerOpen()) {
        this.closeDrawer();
      } else {
        this.openDrawer();
      }
    },

    renderDrawer() {
      this.initDrawer();
      const items = this.getCart();
      const count = this.getItemCount();
      const subtotal = this.getSubtotal();
      const deliveryFee = this.getDeliveryFee();
      const tax = this.getTax();
      const total = this.getTotal();

      const badge = document.getElementById('ghCartCountBadge');
      if (badge) {
        badge.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
      }

      const cartBody = document.getElementById('ghCartBody');
      const deliveryBanner = document.getElementById('ghCartDeliveryBanner');
      const footer = document.getElementById('ghCartFooter');

      if (!cartBody) return;

      if (items.length === 0) {
        if (deliveryBanner) deliveryBanner.style.display = 'none';
        if (footer) footer.style.display = 'none';
        cartBody.innerHTML = `
          <div class="gh-cart-empty">
            <div class="gh-cart-empty-icon">
              <i class="bi bi-basket3"></i>
            </div>
            <h4 class="gh-cart-empty-title">Your Cart is Empty</h4>
            <p class="gh-cart-empty-desc">You haven't selected any dishes yet. Discover our fresh, organic plant-based creations!</p>
            <a href="menu.html" class="btn btn-primary rounded-pill px-4 py-2" data-action="continue-shopping">
              <i class="bi bi-book-half me-1"></i> Continue Shopping
            </a>
          </div>
        `;
        return;
      }

      if (deliveryBanner) deliveryBanner.style.display = 'block';
      if (footer) footer.style.display = 'block';

      const deliveryMsg = document.getElementById('ghCartDeliveryMsg');
      const deliveryFill = document.getElementById('ghCartDeliveryFill');
      if (deliveryMsg && deliveryFill) {
        if (subtotal >= this.FREE_DELIVERY_THRESHOLD) {
          deliveryMsg.innerHTML = '<span><i class="bi bi-gift-fill text-success me-1"></i> You unlocked <strong>FREE Delivery!</strong></span>';
          deliveryFill.style.width = '100%';
        } else {
          const diff = Math.round(this.FREE_DELIVERY_THRESHOLD - subtotal).toLocaleString('en-IN');
          const pct = Math.min(100, Math.round((subtotal / this.FREE_DELIVERY_THRESHOLD) * 100));
          deliveryMsg.innerHTML = `<span>Add <strong>₹${diff}</strong> more for <strong>FREE Delivery</strong></span>`;
          deliveryFill.style.width = `${pct}%`;
        }
      }

      cartBody.innerHTML = `
        <div class="gh-cart-items-list">
          ${items.map(item => `
            <div class="gh-cart-item" data-id="${item.id}">
              <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="gh-cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop'">
              <div class="gh-cart-item-info">
                <span class="gh-cart-item-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span>
                <div class="gh-cart-item-meta">
                  <span class="gh-cart-item-price">₹${Math.round(item.price).toLocaleString('en-IN')} each</span>
                  <span class="gh-cart-item-category">${escapeHtml(item.category || 'Mains')}</span>
                </div>
                <div class="gh-cart-item-actions">
                  <div class="gh-cart-stepper">
                    <button type="button" class="gh-cart-stepper-btn" data-action="minus" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                    <span class="gh-cart-stepper-val">${item.qty}</span>
                    <button type="button" class="gh-cart-stepper-btn" data-action="plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
                  </div>
                  <span class="gh-cart-item-total">₹${Math.round(item.price * item.qty).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <button type="button" class="gh-cart-item-remove" data-action="remove" data-id="${item.id}" aria-label="Remove ${escapeHtml(item.name)}" title="Remove item">
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          `).join('')}
        </div>
      `;

      const subtotalEl = document.getElementById('ghCartSubtotalText');
      const deliveryEl = document.getElementById('ghCartDeliveryText');
      const taxEl = document.getElementById('ghCartTaxText');
      const grandTotalEl = document.getElementById('ghCartGrandTotalText');

      if (subtotalEl) subtotalEl.textContent = `₹${Math.round(subtotal).toLocaleString('en-IN')}`;
      if (deliveryEl) {
        deliveryEl.textContent = deliveryFee === 0 ? 'FREE' : `₹${Math.round(deliveryFee).toLocaleString('en-IN')}`;
        if (deliveryFee === 0) {
          deliveryEl.className = 'fw-bold text-success';
        } else {
          deliveryEl.className = 'fw-semibold';
        }
      }
      if (taxEl) taxEl.textContent = `₹${Math.round(tax).toLocaleString('en-IN')}`;
      if (grandTotalEl) grandTotalEl.textContent = `₹${Math.round(total).toLocaleString('en-IN')}`;
    },

    bindNavCartButtons() {
      document.querySelectorAll('.cart-nav-btn').forEach(btn => {
        if (btn.dataset.cartBound) return;
        btn.dataset.cartBound = 'true';
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleDrawer();
        });
      });
    }
  };

  /* ==========================================================================
     3. ORDERS MODULE
     ========================================================================== */
  const Orders = {
    getOrders() {
      try {
        const data = localStorage.getItem(ORDERS_KEY);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
      }
    },

    saveOrders(orders) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    },

    generateOrderId() {
      const rand = Math.floor(100000 + Math.random() * 900000);
      return `GH-${rand}`;
    },

    placeOrder(orderDetails) {
      const orders = this.getOrders();
      const orderId = this.generateOrderId();
      const now = new Date();
      
      const newOrder = {
        id: orderId,
        date: now.toISOString(),
        formattedDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        items: orderDetails.items || [],
        subtotal: parseFloat(orderDetails.subtotal) || 0,
        deliveryFee: parseFloat(orderDetails.deliveryFee) || 0,
        tax: parseFloat(orderDetails.tax) || 0,
        total: parseFloat(orderDetails.total) || 0,
        customer: orderDetails.customer || {},
        deliveryAddress: orderDetails.deliveryAddress || {},
        paymentMethod: orderDetails.paymentMethod || 'Credit Card',
        status: 'Confirmed', // Confirmed, Preparing, Out for Delivery, Delivered
        estimatedDeliveryMinutes: 35
      };

      orders.unshift(newOrder);
      this.saveOrders(orders);
      Cart.clearCart();
      return newOrder;
    },

    getOrderById(orderId) {
      const orders = this.getOrders();
      return orders.find(o => String(o.id) === String(orderId)) || null;
    }
  };

  /* ==========================================================================
     4. UI TOAST & NOTIFICATION HELPERS
     ========================================================================== */
  const UI = {
    showToast(title, message, icon = 'bi-check-circle-fill') {
      if (window.showToast) {
        window.showToast({
          type: 'success',
          title: title,
          message: message
        });
        return;
      }
      let toastContainer = document.getElementById('ghToastContainer');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'ghToastContainer';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1090';
        document.body.appendChild(toastContainer);
      }

      const toastId = `toast_${Date.now()}`;
      const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-bg-dark border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="d-flex">
            <div class="toast-body d-flex align-items-center gap-2">
              <i class="bi ${icon} text-warning fs-5"></i>
              <div>
                <div class="fw-bold text-white">${title}</div>
                <div class="small text-white-50">${message}</div>
              </div>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>
      `;

      toastContainer.insertAdjacentHTML('beforeend', toastHtml);
      const toastEl = document.getElementById(toastId);
      if (toastEl && typeof bootstrap !== 'undefined') {
        const bsToast = new bootstrap.Toast(toastEl, { delay: 3500 });
        bsToast.show();
        toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
      }
    },

    bindAddToCartButtons() {
      document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
        // avoid duplicate bindings
        if (btn.dataset.bound) return;
        btn.dataset.bound = 'true';

        btn.addEventListener('click', function (e) {
          e.preventDefault();
          const id = this.getAttribute('data-id') || 'dish-' + Date.now();
          const name = this.getAttribute('data-name') || this.closest('.dish-card')?.querySelector('.dish-title')?.textContent.trim() || 'Botanical Dish';
          const priceStr = this.getAttribute('data-price') || this.closest('.dish-card')?.querySelector('.dish-card-price')?.textContent.replace(/[^0-9.]/g, '') || '499';
          const image = this.getAttribute('data-image') || this.closest('.dish-card')?.querySelector('img')?.getAttribute('src') || '';
          const category = this.getAttribute('data-category') || 'Mains';
          
          let qty = 1;
          const qtyInput = document.getElementById('dishQty');
          if (qtyInput) {
            qty = parseInt(qtyInput.value, 10) || 1;
          }

          Cart.addToCart({ id, name, price: parseFloat(priceStr), image, category }, qty);
        });
      });
    },

    bindMenuDownloadButtons() {
      document.querySelectorAll('.btn-download-menu').forEach(btn => {
        if (btn.dataset.boundDownload) return;
        btn.dataset.boundDownload = 'true';
        btn.addEventListener('click', () => {
          UI.showToast('Menu Card PDF', 'Downloading your fine-dining restaurant menu card...', 'bi-file-earmark-pdf-fill');
        });
      });
    }
  };

  // Expose to window
  window.GH_Auth = Auth;
  window.GH_Cart = Cart;
  window.GH_Orders = Orders;
  window.GH_UI = UI;

  // Initialize Global Navbar, Cart Drawer & Cart Badges on Load
  function initApp() {
    Auth.updateNavbar();
    Auth.initPasswordToggles();
    Cart.initDrawer();
    Cart.updateBadges();
    Cart.bindNavCartButtons();
    UI.bindAddToCartButtons();
    UI.bindMenuDownloadButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
