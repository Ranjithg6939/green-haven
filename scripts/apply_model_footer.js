const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

const canonicalFooter = `  <!-- Universal 4-Column Luxury Footer -->
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
          <ul class="list-unstyled d-flex flex-column gap-2 mb-0 footer-nav-list">
            <li><a href="index.html" class="footer-link"><i class="bi bi-chevron-right"></i> Home</a></li>
            <li><a href="about.html" class="footer-link"><i class="bi bi-chevron-right"></i> About Us</a></li>
            <li><a href="menu.html" class="footer-link"><i class="bi bi-chevron-right"></i> Our Menu</a></li>
            <li><a href="cart.html" class="footer-link"><i class="bi bi-chevron-right"></i> Food Cart</a></li>
            <li><a href="catering.html" class="footer-link"><i class="bi bi-chevron-right"></i> Catering</a></li>
            <li><a href="contact.html" class="footer-link"><i class="bi bi-chevron-right"></i> Contact Us</a></li>
          </ul>
        </div>

        <!-- Column 3: Hours & Location -->
        <div class="col-lg-3 col-md-6 footer-col">
          <h4 class="footer-col-title">Hours &amp; Location</h4>
          <div class="footer-contact-info d-flex flex-column gap-2 mb-0">
            <p class="text-white-50 small mb-0 d-flex align-items-start gap-2">
              <i class="bi bi-geo-alt text-warning mt-1 flex-shrink-0"></i>
              <span>742 Evergreen Botanical Way, Portland</span>
            </p>
            <p class="text-white-50 small mb-0 d-flex align-items-center gap-2">
              <i class="bi bi-clock text-warning flex-shrink-0"></i>
              <span>Mon - Sun: 8:00 AM - 10:00 PM</span>
            </p>
            <p class="text-white-50 small mb-0 d-flex align-items-center gap-2">
              <i class="bi bi-telephone text-warning flex-shrink-0"></i>
              <a href="tel:+15035550192" class="text-decoration-none">+1 (503) 555-0192</a>
            </p>
          </div>
        </div>

        <!-- Column 4: Botanical Digest -->
        <div class="col-lg-3 col-md-6 footer-col">
          <h4 class="footer-col-title">Botanical Digest</h4>
          <p class="text-white-50 small mb-3">Join our newsletter for seasonal menu previews and chef recipes.</p>
          <form class="newsletter-form d-flex gap-2">
            <input type="email" pattern="[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}" title="Please enter a valid email address (e.g. name@example.com)" class="form-control form-control-sm" placeholder="Your email" required>
            <button type="submit" class="btn btn-accent btn-sm px-3">Join</button>
          </form>
        </div>

      </div>

      <!-- Bottom Line -->
      <div class="footer-bottom border-top pt-4 mt-4 text-white-50 small">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div>&copy; 2026 Green Haven Restaurant. All Rights Reserved.</div>
          <div class="d-flex gap-3">
            <a href="#privacyPolicy" class="text-decoration-none gh-legal-link" data-legal="privacy" role="button">Privacy Policy</a>
            <span>&bull;</span>
            <a href="#termsConditions" class="text-decoration-none gh-legal-link" data-legal="terms" role="button">Terms &amp; Conditions</a>
          </div>
        </div>
      </div>
    </div>
  </footer>`;

let updatedCount = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  const footerRegex = /<!--\s*Universal[\s\S]*?-->\s*<footer[\s\S]*?<\/footer>|<footer[\s\S]*?<\/footer>/i;
  if (footerRegex.test(content)) {
    content = content.replace(footerRegex, canonicalFooter);
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
    console.log(`Updated footer in: ${file}`);
  }
});

console.log(`Successfully updated ${updatedCount} HTML files with canonical botanical footer.`);
