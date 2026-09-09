const fs = require('fs');
const html = fs.readFileSync('menu.html', 'utf8');

const regex = /<div class="luxury-dish-card">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
const dishes = [];
let match;

while ((match = regex.exec(html)) !== null) {
  const card = match[1];
  const nameMatch = card.match(/<h3 class="dish-card-title"><a[^>]*>(.*?)<\/a><\/h3>/);
  const priceMatch = card.match(/<div class="dish-card-price-pill">(\$[0-9.]+)<\/div>/);
  const categoryMatch = card.match(/<span class="dish-category-tag">(.*?)<\/span>/);
  const descMatch = card.match(/<p class="dish-card-description">(.*?)<\/p>/);
  const dietaryMatch = card.match(/<span class="dietary-pill[^>]*>([\s\S]*?)<\/span>/);
  
  if (nameMatch) {
    dishes.push({
      name: nameMatch[1].trim(),
      price: priceMatch ? priceMatch[1].trim() : '',
      category: categoryMatch ? categoryMatch[1].trim() : '',
      desc: descMatch ? descMatch[1].trim() : '',
      dietary: dietaryMatch ? dietaryMatch[1].replace(/<[^>]+>/g, '').replace(/[\s\n\r]+/g, ' ').trim() : ''
    });
  }
}

console.log('Total dishes found:', dishes.length);
if (!fs.existsSync('scripts')) fs.mkdirSync('scripts');
fs.writeFileSync('scripts/menu-items.json', JSON.stringify(dishes, null, 2));
console.log('Wrote scripts/menu-items.json successfully.');
