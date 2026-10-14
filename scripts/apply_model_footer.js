const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html') && !['login.html', 'register.html'].includes(f));

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
          <p class="footer-bio mb-3">
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
