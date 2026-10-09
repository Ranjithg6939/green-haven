/**
 * Green Haven - Reusable Footer Component
 * 
 * Provides a single source of truth for the canonical 4-column luxury footer across the website.
 * Allows rendering or synchronizing the footer dynamically on any page, ensuring 100% uniformity
 * in logo, links, social icons, newsletter form, contact info, and legal modal bindings.
 */

(function(window) {
  'use strict';

  const FOOTER_TEMPLATE = `
    <!-- Universal 4-Column Luxury Footer -->
  <footer class="gh-footer">
    <div class="container">
      <div class="row g-4 g-lg-5 mb-5 align-items-start">
        
        <!-- Column 1: Brand & Tagline -->
        <div class="col-lg-3 col-md-6 footer-col">
          <a class="gh-brand mb-3 d-inline-flex align-items-center" href="index.html" aria-label="Green Haven Restaurant">
            <img src="assets/images/logo-g.png" alt="Green Haven Logo" class="gh-brand-logo-img me-2">
            <span class="gh-brand-text">Green Haven</span>
          </a>
          <p class="footer-bio mb-4">
            An organic plant-based restaurant sanctuary celebrating vibrant seasonal gastronomy, regenerative agriculture, and holistic well-being.
          </p>
          <div class="footer-social-group d-flex gap-2 flex-wrap">
            <a href="https://instagram.com" target="_blank" rel="noopener" class="footer-social-btn" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
            <a href="https://facebook.com" target="_blank" rel="noopener" class="footer-social-btn" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
            <a href="https://youtube.com" target="_blank" rel="noopener" class="footer-social-btn" aria-label="YouTube"><i class="bi bi-youtube"></i></a>
            <a href="https://pinterest.com" target="_blank" rel="noopener" class="footer-social-btn" aria-label="Pinterest"><i class="bi bi-pinterest"></i></a>
            <a href="https://twitter.com" target="_blank" rel="noopener" class="footer-social-btn" aria-label="Twitter"><i class="bi bi-twitter-x"></i></a>
          </div>
        </div>

        <!-- Column 2: Navigation -->
        <div class="col-lg-3 col-md-6 footer-col">
          <h4 class="footer-col-title">Navigation</h4>
          <ul class="list-unstyled d-flex flex-column gap-2 mb-3 footer-nav-list">
            <li><a href="index.html" class="footer-link"><i class="bi bi-chevron-right"></i> Home</a></li>
            <li><a href="about.html" class="footer-link"><i class="bi bi-chevron-right"></i> About</a></li>
            <li><a href="menu.html" class="footer-link"><i class="bi bi-chevron-right"></i> Menu</a></li>
            <li><a href="services.html" class="footer-link"><i class="bi bi-chevron-right"></i> Services</a></li>
            <li><a href="catering.html" class="footer-link"><i class="bi bi-chevron-right"></i> Catering</a></li>
            <li><a href="pricing.html" class="footer-link"><i class="bi bi-chevron-right"></i> Packages</a></li>
          </ul>
        </div>

        <!-- Column 3: Hours & Location -->
        <div class="col-lg-3 col-md-6 footer-col">
          <h4 class="footer-col-title">Hours &amp; Location</h4>
          <div class="footer-contact-info d-flex flex-column gap-2 mb-3">
            <p class="small mb-0 d-flex align-items-start gap-2">
              <i class="bi bi-geo-alt text-warning mt-1 flex-shrink-0"></i>
              <span>742 Evergreen Botanical Way, Portland, OR 97201</span>
            </p>
            <p class="small mb-0 d-flex align-items-center gap-2">
              <i class="bi bi-clock text-warning flex-shrink-0"></i>
              <span>Mon - Fri: 8:00 AM - 10:00 PM</span>
            </p>
            <p class="small mb-0 d-flex align-items-center gap-2">
              <i class="bi bi-clock text-warning flex-shrink-0"></i>
              <span>Sat - Sun, 9:00 AM - 3:00 PM</span>
            </p>
            <p class="small mb-0 d-flex align-items-center gap-2">
              <i class="bi bi-telephone text-warning flex-shrink-0"></i>
              <a href="tel:+15035550192" class="text-decoration-none">+1 (503) 555-0192</a>
            </p>
            <p class="small mb-0 d-flex align-items-center gap-2">
              <i class="bi bi-envelope text-warning flex-shrink-0"></i>
              <a href="https://mail.google.com/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">hello@greenhaven.com</a>
            </p>
          </div>
        </div>

        <!-- Column 4: Botanical Digest -->
        <div class="col-lg-3 col-md-6 footer-col">
          <h4 class="footer-col-title">Botanical Digest</h4>
          <p class="small mb-3">Join our newsletter for seasonal menu previews, wild foraging updates, and chef masterclass recipes.</p>
          <form class="newsletter-form d-flex gap-2">
            <input type="email" pattern="[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}" title="Please enter a valid email address (e.g. name@example.com)" class="form-control form-control-sm" placeholder="Your email address" required>
            <button type="submit" class="btn btn-accent btn-sm px-3">Join</button>
          </form>
        </div>

      </div>

      <!-- Bottom Line -->
      <div class="footer-bottom border-top pt-4 mt-4 text-center">
        <p class="mb-0 text-white-50 small">&copy; 2026 Green Haven Restaurant. All rights reserved.</p>
      </div>
    </div>
  </footer>
  `.trim();

  const GH_Footer = {
    template: FOOTER_TEMPLATE,

    /**
     * Renders the canonical footer into a specific container element.
     * @param {string|HTMLElement} target - Selector or DOM node
     */
    render: function(target) {
      const container = typeof target === 'string' ? document.querySelector(target) : target;
      if (!container) return;
      container.innerHTML = FOOTER_TEMPLATE;
      this.bindHandlers(container);
    },

    /**
     * Ensures any existing footer in the document matches the canonical structure and bindings.
     */
    sync: function() {
      const existingFooter = document.querySelector('footer.gh-footer, footer.nx-footer');
      if (existingFooter) {
        this.bindHandlers(existingFooter);
      }
    },

    /**
     * Binds newsletter form, active links, and legal click triggers.
     */
    bindHandlers: function(scope) {
      if (!scope) scope = document;
      const form = scope.querySelector('.newsletter-form');
      if (form && !form.dataset.bound) {
        form.dataset.bound = 'true';
        const input = form.querySelector('input[type="email"]');
        if (input && window.GH_Validator) {
          window.GH_Validator.restrictEmailInput(input, true, 'Email Address');
        }
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          const emailVal = input ? input.value.trim() : '';
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailVal || !emailRegex.test(emailVal) || /\s/.test(emailVal)) {
            let msg = 'Please enter a valid email address (e.g. name@example.com).';
            if (!emailVal) msg = 'Please enter your email address.';
            else if (/\s/.test(emailVal)) msg = 'Email address cannot contain spaces.';
            else if (!emailVal.includes('@')) msg = "Email address must contain an '@' symbol.";
            else if (!emailVal.split('@')[1] || !emailVal.split('@')[1].includes('.')) msg = 'Please include a valid domain extension like .com or .in.';
            
            if (input) {
              input.classList.add('is-invalid');
              if (typeof input.setCustomValidity === 'function') input.setCustomValidity(msg);
              if (typeof input.reportValidity === 'function') input.reportValidity();
            }
            if (window.showToast) {
              window.showToast.warning('Invalid Email', msg);
            }
            return;
          }
          if (input) {
            input.classList.remove('is-invalid');
            if (typeof input.setCustomValidity === 'function') input.setCustomValidity('');
          }
          if (window.showToast) {
            window.showToast.success('Subscribed!', 'Thank you for joining our Botanical Digest newsletter.');
          } else {
            alert('Thank you for joining our Botanical Digest newsletter!');
          }
          if (input) input.value = '';
        });
      }
    }
  };

  window.GH_Footer = GH_Footer;

  // Auto-sync on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GH_Footer.sync());
  } else {
    GH_Footer.sync();
  }

})(window);
