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

    loginUser(userData, redirectUrl = null) {
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
            <div class="modal-content gh-auth-modal-card border-0 shadow-lg">
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

    initPasswordToggles(container = document) {
      container.querySelectorAll('.gh-password-toggle').forEach(btn => {
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

    setInputError(input, feedbackEl, message) {
      if (!input) return;
      input.classList.add('is-invalid');
      if (feedbackEl) {
        feedbackEl.textContent = message;
        feedbackEl.style.display = 'block';
      }
    },

    clearInputError(input, feedbackEl) {
      if (!input) return;
      input.classList.remove('is-invalid');
      if (feedbackEl) {
        feedbackEl.style.display = '';
      }
    },

    initSignInModal() {
      let modalEl = document.getElementById('ghSignInModal');
      if (modalEl) return modalEl;

      modalEl = document.createElement('div');
      modalEl.id = 'ghSignInModal';
      modalEl.className = 'modal fade';
      modalEl.setAttribute('tabindex', '-1');
      modalEl.setAttribute('aria-labelledby', 'ghSignInModalLabel');
      modalEl.setAttribute('aria-hidden', 'true');
      modalEl.setAttribute('data-bs-backdrop', 'true');
      modalEl.setAttribute('data-bs-keyboard', 'true');

      modalEl.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable gh-signin-modal-dialog">
          <div class="modal-content gh-auth-modal-card border-0 shadow-lg position-relative">
            
            <!-- Clear Close (×) Button -->
            <button type="button" class="btn-close position-absolute top-0 end-0 m-3 m-sm-4 z-3 gh-modal-close-btn" data-bs-dismiss="modal" aria-label="Close"></button>

            <div class="modal-body p-4 p-sm-5">
              <div class="text-center mb-4">
                <a class="gh-brand gh-brand-auth d-inline-flex align-items-center justify-content-center text-decoration-none mb-2" href="index.html" aria-label="Green Haven Restaurant">
                  <span class="gh-logo-wrapper" style="width: 44px; height: 44px;">
                    <img src="assets/images/logo-g.png" alt="Green Haven Logo" class="gh-logo-icon gh-logo-static" style="width: 100%; height: 100%; object-fit: contain;">
                  </span>
                  <span class="gh-auth-brand-name ms-2 fw-bold font-serif" style="font-size: 1.35rem; color: var(--gh-heading-color, #1A3018);">Green Haven</span>
                </a>
                <h3 class="fw-bold font-serif mb-1" id="ghSignInModalLabel" style="color: var(--gh-heading-color, #1A3018);">Welcome Back</h3>
                <p class="text-muted small mb-0">Sign in to track orders, manage reservations &amp; checkout</p>
              </div>

              <!-- Social / Quick Sign In -->
              <div class="d-grid gap-2 mb-3 gh-social-auth-group">
                <button class="btn gh-btn-social gh-btn-google py-2.5 d-flex align-items-center justify-content-center" type="button" id="modalBtnGoogleSignIn" aria-label="Continue with Google">
                  <svg class="gh-social-icon gh-google-icon me-2 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span class="gh-social-btn-text">Continue with Google</span>
                </button>
                <button class="btn gh-btn-social gh-btn-apple py-2.5 d-flex align-items-center justify-content-center" type="button" id="modalBtnAppleSignIn" aria-label="Continue with Apple">
                  <svg class="gh-social-icon gh-apple-icon me-2 flex-shrink-0" width="18" height="18" viewBox="0 0 170 170" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.59-7.71-11.66-14.01-6.19-9.56-11.05-20.73-14.59-33.51-3.53-12.77-5.3-24.89-5.3-36.35 0-14.88 3.8-27.18 11.4-36.89 7.6-9.72 17.06-14.65 28.38-14.8 4.8 0 10.23 1.25 16.29 3.75 6.06 2.5 10.15 3.79 12.28 3.86 1.74 0 5.92-1.32 12.54-3.97 6.63-2.65 12.19-3.83 16.69-3.53 12.53.64 22.37 5.25 29.52 13.82-10.92 6.64-16.28 15.82-16.08 27.53.2 9.53 3.97 17.51 11.31 23.95 7.34 6.43 16.09 10.05 26.25 10.85-2.28 7.16-4.87 14.19-7.77 21.07zM119.22 31.84c0-7.39 2.65-14.4 7.95-21.03 5.3-6.63 11.89-10.66 19.77-12.09.11 1.09.16 2.07.16 2.94 0 7.39-2.83 14.61-8.5 21.66-5.67 7.05-12.44 11.07-20.31 12.06-.22-1.08-.34-2.14-.34-3.17z"/>
                  </svg>
                  <span class="gh-social-btn-text">Continue with Apple</span>
                </button>
              </div>

              <div class="d-flex align-items-center my-3 text-muted small">
                <hr class="flex-grow-1 my-0">
                <span class="px-2" style="font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.5px;">or sign in with email</span>
                <hr class="flex-grow-1 my-0">
              </div>

              <!-- Form with Client Validation -->
              <form id="modalLoginForm" novalidate>
                <div class="mb-3 text-start">
                  <label class="form-label fw-semibold" for="modalLoginEmail">Email Address</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                    <input type="email" class="form-control" id="modalLoginEmail" placeholder="e.g. guest@greenhaven.com" required autocomplete="email" pattern="[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}" title="Please enter a valid email address (e.g. name@example.com)">
                  </div>
                  <div class="invalid-feedback" id="modalLoginEmailFeedback">Please enter a valid email address.</div>
                </div>

                <div class="mb-3 text-start">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <label class="form-label fw-semibold mb-0" for="modalLoginPassword">Password</label>
                    <a href="#" class="small text-success fw-semibold" id="modalForgotPassLink">Forgot password?</a>
                  </div>
                  <div class="input-group gh-password-group">
                    <span class="input-group-text"><i class="bi bi-lock"></i></span>
                    <input type="password" class="form-control gh-password-input" id="modalLoginPassword" placeholder="Enter your password" required autocomplete="current-password">
                    <button type="button" class="gh-password-toggle" data-target="modalLoginPassword" aria-label="Toggle password visibility" tabindex="-1">
                      <i class="bi bi-eye"></i>
                    </button>
                  </div>
                  <div class="invalid-feedback" id="modalLoginPasswordFeedback">Please enter your password.</div>
                </div>

                <div class="form-check mb-3 text-start">
                  <input class="form-check-input" type="checkbox" id="modalRememberMe" checked>
                  <label class="form-check-label text-muted small" for="modalRememberMe">
                    Remember me on this browser
                  </label>
                </div>

                <button type="submit" class="btn btn-primary w-100 py-2.5 fs-6 fw-bold mb-3" id="modalBtnLoginSubmit">
                  <i class="bi bi-box-arrow-in-right me-1"></i> Sign In
                </button>
              </form>

              <div id="modalLoginFeedback"></div>

              <!-- One-Click Demo Access Box -->
              <div class="p-3 rounded-3 gh-demo-box mt-3 text-center">
                <div class="small fw-bold gh-demo-title mb-1"><i class="bi bi-lightning-charge-fill me-1"></i> Quick Test Account</div>
                <button type="button" class="btn btn-sm btn-demo-action w-100" id="modalBtnFillDemoUser">
                  <i class="bi bi-person-check me-1"></i> Fill Demo Guest Details
                </button>
              </div>

              <div class="text-center mt-3 pt-3 border-top">
                <small class="text-muted">Don't have an account?</small>
                <a href="register.html" class="text-success fw-bold ms-1 small" id="modalRegisterLink">Create Account</a>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modalEl);

      // Bind Password Toggles inside modal
      this.initPasswordToggles(modalEl);

      // Bind Demo User Autofill
      const btnFillDemo = modalEl.querySelector('#modalBtnFillDemoUser');
      const emailInput = modalEl.querySelector('#modalLoginEmail');
      const passwordInput = modalEl.querySelector('#modalLoginPassword');
      const emailFeedback = modalEl.querySelector('#modalLoginEmailFeedback');
      const passwordFeedback = modalEl.querySelector('#modalLoginPasswordFeedback');
      const feedback = modalEl.querySelector('#modalLoginFeedback');

      if (btnFillDemo) {
        btnFillDemo.addEventListener('click', () => {
          if (emailInput) {
            emailInput.value = 'maya@greenhaven.com';
            this.clearInputError(emailInput, emailFeedback);
          }
          if (passwordInput) {
            passwordInput.value = 'vegan2026';
            this.clearInputError(passwordInput, passwordFeedback);
          }
          if (feedback) feedback.innerHTML = '';
        });
      }

      // Input event error clearing
      if (emailInput) {
        emailInput.addEventListener('input', () => this.clearInputError(emailInput, emailFeedback));
      }
      if (passwordInput) {
        passwordInput.addEventListener('input', () => this.clearInputError(passwordInput, passwordFeedback));
      }

      // Forgot Password Handler
      const forgotPassLink = modalEl.querySelector('#modalForgotPassLink');
      if (forgotPassLink) {
        forgotPassLink.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.showToast) {
            window.showToast.info('Password Reset', 'Password reset instructions have been sent to your email.');
          } else {
            alert('Password reset instructions have been sent to your email.');
          }
        });
      }

      // Social Auth Buttons
      const btnGoogle = modalEl.querySelector('#modalBtnGoogleSignIn');
      if (btnGoogle) {
        btnGoogle.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.GH_SocialAuth) {
            window.GH_SocialAuth.handleGoogleSignIn();
          }
        });
      }

      const btnApple = modalEl.querySelector('#modalBtnAppleSignIn');
      if (btnApple) {
        btnApple.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.GH_SocialAuth) {
            window.GH_SocialAuth.handleAppleSignIn();
          }
        });
      }

      // Form submission validation & login
      const form = modalEl.querySelector('#modalLoginForm');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.clearInputError(emailInput, emailFeedback);
          this.clearInputError(passwordInput, passwordFeedback);

          const email = (emailInput ? emailInput.value : '').trim();
          const password = passwordInput ? passwordInput.value : '';

          let hasError = false;

          // Required & email format validation
          if (!email) {
            this.setInputError(emailInput, emailFeedback, 'Email address is required.');
            hasError = true;
          } else if (/\s/.test(email)) {
            this.setInputError(emailInput, emailFeedback, 'Email address cannot contain spaces.');
            hasError = true;
          } else {
            const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailPattern.test(email)) {
              let msg = 'Please enter a valid email address (e.g. name@example.com or name@example.in).';
              if (!email.includes('@')) {
                msg = "Email address must contain an '@' symbol.";
              } else if (!email.split('@')[1] || !email.split('@')[1].includes('.')) {
                msg = 'Please include a valid domain extension like .com or .in.';
              }
              this.setInputError(emailInput, emailFeedback, msg);
              hasError = true;
            }
          }

          if (!password) {
            this.setInputError(passwordInput, passwordFeedback, 'Password is required.');
            hasError = true;
          }

          if (hasError) return;

          // Validate credentials
          const result = this.validateCredentials(email, password);
          if (!result.success) {
            if (result.error === 'not_found') {
              this.setInputError(emailInput, emailFeedback, 'Account not found. Please create an account first.');
              if (window.showToast) {
                window.showToast.error('Account Not Found', 'Account not found. Please create an account first.');
              }
            } else if (result.error === 'wrong_password') {
              this.setInputError(passwordInput, passwordFeedback, 'Incorrect password. Please try again.');
              if (window.showToast) {
                window.showToast.error('Invalid Password', 'Incorrect password. Please try again.');
              }
            }
            return;
          }

          // Successful login
          const user = result.user;
          if (feedback) {
            feedback.innerHTML = `
              <div class="alert alert-success alert-dismissible fade show mt-3" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i>
                Signed in successfully as <strong>${escapeHtml(user.name)}</strong>. Welcome back!
              </div>
            `;
          }

          // Disable button briefly
          const submitBtn = modalEl.querySelector('#modalBtnLoginSubmit');
          if (submitBtn) submitBtn.disabled = true;

          // Login user and stay on current page
          this.loginUser(user, null);

          // Close modal after short visual feedback, user stays on the same page!
          setTimeout(() => {
            this.closeSignInModal();
            if (submitBtn) submitBtn.disabled = false;
            if (feedback) feedback.innerHTML = '';
            form.reset();
          }, 500);
        });
      }

      // Preserve exact scroll position on modal hide
      let savedScroll = 0;
      modalEl.addEventListener('show.bs.modal', () => {
        savedScroll = window.pageYOffset || document.documentElement.scrollTop || 0;
      });
      modalEl.addEventListener('hidden.bs.modal', () => {
        this.clearInputError(emailInput, emailFeedback);
        this.clearInputError(passwordInput, passwordFeedback);
        if (feedback) feedback.innerHTML = '';
        if (form) form.reset();
        window.scrollTo({ top: savedScroll, behavior: 'instant' });
      });

      return modalEl;
    },

    openSignInModal(options = {}) {
      const modalEl = this.initSignInModal();
      if (!modalEl) return;

      const savedScroll = window.pageYOffset || document.documentElement.scrollTop || 0;

      // Close mobile offcanvas if open
      const mobileMenuEl = document.getElementById('mobileMenuOffcanvas');
      if (mobileMenuEl && typeof bootstrap !== 'undefined' && bootstrap.Offcanvas) {
        const offcanvasInstance = bootstrap.Offcanvas.getInstance(mobileMenuEl);
        if (offcanvasInstance) {
          offcanvasInstance.hide();
        }
      }

      // Close auth prompt modal if open
      const promptModalEl = document.getElementById('ghAuthPromptModal');
      if (promptModalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const promptModalInstance = bootstrap.Modal.getInstance(promptModalEl);
        if (promptModalInstance) {
          promptModalInstance.hide();
        }
      }

      // Pre-fill email if passed
      if (options.email) {
        const emailInput = modalEl.querySelector('#modalLoginEmail');
        if (emailInput) {
          emailInput.value = options.email;
        }
      }

      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        bsModal.show();
        requestAnimationFrame(() => {
          window.scrollTo({ top: savedScroll, behavior: 'instant' });
        });
      }
    },

    closeSignInModal() {
      const modalEl = document.getElementById('ghSignInModal');
      if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) {
          bsModal.hide();
        }
      }
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
              <a href="login.html" class="btn btn-outline-primary w-100 gh-signin-btn-mobile"><i class="bi bi-box-arrow-in-right me-1"></i> Sign In</a>
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

  // Social Sign-In Handler (Google & Apple OAuth Ready)
  const GH_SocialAuth = {
    config: {
      googleClientId: window.GH_GOOGLE_CLIENT_ID || null,
      appleClientId: window.GH_APPLE_CLIENT_ID || null
    },

    showIntegrationNotice(providerName, configKey) {
      const friendlyMsg = `${providerName} Sign-In is ready for OAuth integration. Configure your ${configKey} to enable live authentication.`;

      if (window.showToast) {
        if (typeof window.showToast.info === 'function') {
          window.showToast.info(`${providerName} Sign-In`, friendlyMsg);
        } else if (typeof window.showToast === 'function') {
          window.showToast({ type: 'info', title: `${providerName} Sign-In`, message: friendlyMsg });
        }
      }

      const feedback = document.getElementById('modalLoginFeedback') || document.getElementById('loginFeedback');
      if (feedback) {
        feedback.innerHTML = `
          <div class="alert alert-info alert-dismissible fade show mt-3 d-flex align-items-start gap-2 shadow-sm" role="alert">
            <i class="bi bi-info-circle-fill fs-5 text-info flex-shrink-0 mt-0.5"></i>
            <div class="small flex-grow-1">
              <strong>${escapeHtml(providerName)} Sign-In:</strong> OAuth integration is ready. Configure <code>${escapeHtml(configKey)}</code> to enable live authentication without demo credentials.
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        `;
      }

      console.info(`[Green Haven Auth] ${providerName} Sign-In initialized. Live OAuth requires ${configKey}. UI remains ready for production integration.`);
    },

    handleGoogleSignIn() {
      if (window.google && window.google.accounts && this.config.googleClientId) {
        try {
          window.google.accounts.id.prompt();
        } catch (err) {
          console.error('[Google OAuth Error]', err);
        }
      } else {
        this.showIntegrationNotice('Google', 'GH_GOOGLE_CLIENT_ID');
      }
    },

    handleAppleSignIn() {
      if (window.AppleID && window.AppleID.auth && this.config.appleClientId) {
        try {
          window.AppleID.auth.signIn();
        } catch (err) {
          console.error('[Apple OAuth Error]', err);
        }
      } else {
        this.showIntegrationNotice('Apple', 'GH_APPLE_CLIENT_ID');
      }
    }
  };

  window.GH_SocialAuth = window.GH_SocialAuth || GH_SocialAuth;
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

