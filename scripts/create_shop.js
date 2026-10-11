const fs = require('fs');
const path = require('path');

const menuPath = path.resolve(__dirname, '..', 'menu.html');
const shopPath = path.resolve(__dirname, '..', 'shop.html');

let menu = fs.readFileSync(menuPath, 'utf8');

let shop = menu
  .replace(
    '<title>Our Menu - Plant-Based Culinary Creations | Green Haven Restaurant</title>',
    '<title>Online Shop & Culinary Provisions | Green Haven Restaurant</title>'
  )
  .replace(
    "Explore Green Haven's 100% plant-based restaurant menu.",
    "Shop Green Haven's artisanal organic specialties, chef-crafted delicacies, and farm-fresh plant-based provisions online."
  )
  .replace('Our Menu - Green Haven Restaurant', 'Online Shop - Green Haven Restaurant')
  .replace(
    '<h1 class="display-4 fw-bold font-serif mb-2">Our Plant-Based Menu</h1>',
    '<h1 class="display-4 fw-bold font-serif mb-2">Green Haven Culinary Shop</h1>'
  )
  .replace(
    'Honoring biodynamic harvests, regenerative soils, and pure botanical gastronomy across curated culinary offerings.',
    'Order handcrafted organic dishes, seasonal harvests, chef-made specialties, and botanical elixirs delivered directly to your table.'
  )
  .replace(
    '<span class="text-success fw-semibold">Restaurant Menu</span>',
    '<span class="text-success fw-semibold">Online Shop</span>'
  );

fs.writeFileSync(shopPath, shop, 'utf8');
console.log('Created shop.html successfully');
