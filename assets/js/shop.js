/**
 * Green Haven - Online Food Ordering, Cart, Checkout, Order Tracking & Auth Engine
 * Frontend-only logic backed by localStorage
 */

(function () {
  'use strict';

  // LocalStorage Keys
  const AUTH_KEY = 'gh_logged_in';
  const USER_KEY = 'gh_user';
  const CART_KEY = 'gh_cart';
  const ORDERS_KEY = 'gh_orders';

  /* ==========================================================================
     1. AUTHENTICATION MODULE
     ========================================================================== */
  const Auth = {
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

    loginUser(userData, redirectUrl = 'index.html') {
      localStorage.setItem(AUTH_KEY, 'true');
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      this.updateNavbar();
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },

    registerUser(userData, redirectUrl = 'index.html') {
      localStorage.setItem(AUTH_KEY, 'true');
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      this.updateNavbar();
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },

    logoutUser() {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(USER_KEY);
      this.updateNavbar();
      // If currently on a protected page, redirect to login
      const protectedPages = ['checkout.html', 'order-success.html', 'my-account.html', 'orders.html'];
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      if (protectedPages.includes(currentPage)) {
        window.location.href = 'login.html';
      } else {
        window.location.reload();
      }
    },

    requireLogin(targetRedirect = null) {
      if (!this.isLoggedIn()) {
        const currentPage = targetRedirect || window.location.pathname.split('/').pop() || 'index.html';
        window.location.href = `login.html?redirect=${encodeURIComponent(currentPage)}`;
        return false;
      }
      return true;
    },

    updateNavbar() {
      const authContainer = document.getElementById('navAuthContainer');
      const mobileAuthContainer = document.getElementById('mobileNavAuthContainer');
      const loggedIn = this.isLoggedIn();
      const user = this.getCurrentUser();

      const getDesktopHtml = () => {
        if (loggedIn && user) {
          const firstName = (user.name || 'Foodie').split(' ')[0];
          return `
            <div class="dropdown d-inline-block">
              <button class="btn btn-outline-primary btn-sm dropdown-toggle d-inline-flex align-items-center gap-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-person-circle fs-6"></i>
                <span>Hi, <strong>${firstName}</strong></span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end gh-dropdown-menu shadow-lg">
                <li><h6 class="dropdown-header small text-muted">${user.email || 'Guest Member'}</h6></li>
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
              <a href="login.html" class="btn btn-outline-primary btn-sm">
                <i class="bi bi-box-arrow-in-right me-1"></i> Sign In
              </a>
            </div>
          `;
        }
      };

      const getMobileHtml = () => {
        if (loggedIn && user) {
          return `
            <div class="p-3 bg-light rounded-3 mb-3 border">
              <div class="d-flex align-items-center gap-2 mb-2">
                <i class="bi bi-person-circle fs-4 text-primary"></i>
                <div>
                  <div class="fw-bold">${user.name || 'User'}</div>
                  <div class="small text-muted">${user.email || ''}</div>
                </div>
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

      // Bind logout click listeners
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
    DELIVERY_FEE: 5.00,
    FREE_DELIVERY_THRESHOLD: 50.00,
    TAX_RATE: 0.08, // 8% tax

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
            <strong id="ghCartDeliveryRemaining">$50.00 away</strong>
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
              <span class="fw-semibold text-dark-emphasis" id="ghCartSubtotalText">$0.00</span>
            </div>
            <div class="gh-cart-summary-row">
              <span>Delivery Fee</span>
              <span class="fw-semibold" id="ghCartDeliveryText">$5.00</span>
            </div>
            <div class="gh-cart-summary-row">
              <span>Estimated Tax (8%)</span>
              <span class="fw-semibold" id="ghCartTaxText">$0.00</span>
            </div>
            <div class="gh-cart-summary-row total-row">
              <span>Estimated Total</span>
              <span class="total-amount" id="ghCartGrandTotalText">$0.00</span>
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
          const diff = (this.FREE_DELIVERY_THRESHOLD - subtotal).toFixed(2);
          const pct = Math.min(100, Math.round((subtotal / this.FREE_DELIVERY_THRESHOLD) * 100));
          deliveryMsg.innerHTML = `<span>Add <strong>$${diff}</strong> more for <strong>FREE Delivery</strong></span>`;
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
                  <span class="gh-cart-item-price">$${item.price.toFixed(2)} each</span>
                  <span class="gh-cart-item-category">${escapeHtml(item.category || 'Mains')}</span>
                </div>
                <div class="gh-cart-item-actions">
                  <div class="gh-cart-stepper">
                    <button type="button" class="gh-cart-stepper-btn" data-action="minus" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                    <span class="gh-cart-stepper-val">${item.qty}</span>
                    <button type="button" class="gh-cart-stepper-btn" data-action="plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
                  </div>
                  <span class="gh-cart-item-total">$${(item.price * item.qty).toFixed(2)}</span>
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

      if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
      if (deliveryEl) {
        deliveryEl.textContent = deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`;
        if (deliveryFee === 0) {
          deliveryEl.className = 'fw-bold text-success';
        } else {
          deliveryEl.className = 'fw-semibold';
        }
      }
      if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
      if (grandTotalEl) grandTotalEl.textContent = `$${total.toFixed(2)}`;
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
          const priceStr = this.getAttribute('data-price') || this.closest('.dish-card')?.querySelector('.dish-card-price')?.textContent.replace(/[^0-9.]/g, '') || '18.00';
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
