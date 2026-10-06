/**
 * Green Haven - Luxury Restaurant Menu PDF Generator
 * 
 * Features:
 * - A4 portrait format (595.28 x 841.89 pt)
 * - 4 Curated Pages:
 *     Page 1: Cover (Logo, brand name, tagline, botanical flourishes, "Restaurant Menu", chef dedication)
 *     Page 2: Starters (3 items) & Main Courses (3 items)
 *     Page 3: Bowls & Salads (3 items) & Desserts (3 items)
 *     Page 4: Drinks (3 items) + Sommelier note & Restaurant contact / reservations panel
 * - Warm cream linen background (#FCFAF6)
 * - Dark elegant typography (#1C1917) with imperial forest green (#143825) and burnished gold (#B89552)
 * - Sophisticated double borders, corner diamond flourishes, and thin decorative divider lines
 * - Dot leader menu item format: Dish Name .................... $XX.00
 * - Clean descriptions, dietary tags, and plenty of breathing room / whitespace
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// File paths
const fileSamplePdf = path.join(__dirname, '..', 'assets', 'images', 'menu-sample.pdf');
const fileDocsPdf = path.join(__dirname, '..', 'assets', 'docs', 'Green-Haven-Menu.pdf');
const fileLogo = path.join(__dirname, '..', 'assets', 'images', 'logo-g.png');

// Ensure output directories exist
[path.dirname(fileSamplePdf), path.dirname(fileDocsPdf)].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// A4 Dimensions
const A4_W = 595.28;
const A4_H = 841.89;
const CONTENT_X = 44;
const CONTENT_W = A4_W - CONTENT_X * 2; // 507.28 pt
const TOTAL_PAGES = 4;

// Initialize PDFKit with 0 margins to maintain manual control over page breaks
const doc = new PDFDocument({
  size: [A4_W, A4_H],
  margins: { top: 0, bottom: 0, left: 0, right: 0 },
  autoFirstPage: false
});

const stream1 = fs.createWriteStream(fileSamplePdf);
const stream2 = fs.createWriteStream(fileDocsPdf);
doc.pipe(stream1);
doc.pipe(stream2);

// Luxury Fine-Dining Palette
const THEME = {
  bg: '#FCFAF6',             // Warm linen cream
  espresso: '#1C1917',       // Deep rich charcoal-espresso
  heading: '#143825',        // Imperial botanical deep forest green
  gold: '#B89552',           // Burnished gold
  goldMuted: '#E0D4BA',      // Subtle gold hairline
  borderHairline: '#DDD6C9', // Inner frame hairline
  slate: '#47423B',          // Editorial descriptions (darkened slightly for clarity)
  tagGreen: '#1B5236',       // Botanical sage for dietary pills
  creamGold: '#F3ECE0',      // Soft tinted card background
  creamGoldBorder: '#D8CBB6', // Card border
  boxDarkBg: '#113622',      // Deep imperial botanical forest green
  boxDarkGold: '#E8C882',    // Gleaming champagne gold
  boxDarkWhite: '#FFFFFF',   // Pure high-contrast white
  boxDarkLinen: '#EAE5DC',   // Warm soft linen ivory
  boxDarkAmber: '#F3D288'    // Luminous amber-gold for advisory
};

// Font selection with Unicode Indian Rupee (₹) support & Luxury Fine-Dining Book Serif
const FONT_SERIF_BOLD = fs.existsSync('C:/Windows/Fonts/timesbd.ttf')
  ? 'C:/Windows/Fonts/timesbd.ttf'
  : (fs.existsSync('C:/Windows/Fonts/georgiab.ttf') ? 'C:/Windows/Fonts/georgiab.ttf' : 'Times-Bold');

const FONT_PALA_ROMAN = fs.existsSync('C:/Windows/Fonts/pala.ttf') ? 'C:/Windows/Fonts/pala.ttf' : (fs.existsSync('C:/Windows/Fonts/georgia.ttf') ? 'C:/Windows/Fonts/georgia.ttf' : 'Times-Roman');
const FONT_PALA_BOLD = fs.existsSync('C:/Windows/Fonts/palab.ttf') ? 'C:/Windows/Fonts/palab.ttf' : (fs.existsSync('C:/Windows/Fonts/georgiab.ttf') ? 'C:/Windows/Fonts/georgiab.ttf' : 'Times-Bold');
const FONT_PALA_ITALIC = fs.existsSync('C:/Windows/Fonts/palai.ttf') ? 'C:/Windows/Fonts/palai.ttf' : (fs.existsSync('C:/Windows/Fonts/georgiai.ttf') ? 'C:/Windows/Fonts/georgiai.ttf' : 'Times-Italic');

doc.registerFont('Menu-Roman', FONT_PALA_ROMAN);
doc.registerFont('Menu-Bold', FONT_PALA_BOLD);
doc.registerFont('Menu-Italic', FONT_PALA_ITALIC);

// Helper: Paint full page cream background and luxury double borders
function drawPageBackgroundAndFrame(doc, pageNum) {
  // 1. Warm cream linen background
  doc.rect(0, 0, A4_W, A4_H)
     .fillColor(THEME.bg)
     .fill();

  const outerMargin = 20;
  const outerW = A4_W - outerMargin * 2;
  const outerH = A4_H - outerMargin * 2;

  // 2. Outer gold border
  doc.rect(outerMargin, outerMargin, outerW, outerH)
     .lineWidth(1.2)
     .strokeColor(THEME.gold)
     .stroke();

  // 3. Inner fine hairline border
  const innerMargin = outerMargin + 4;
  const innerW = A4_W - innerMargin * 2;
  const innerH = A4_H - innerMargin * 2;
  doc.rect(innerMargin, innerMargin, innerW, innerH)
     .lineWidth(0.5)
     .strokeColor(THEME.borderHairline)
     .stroke();

  // 4. Four corner decorative diamonds
  const corners = [
    [innerMargin + 2, innerMargin + 2],
    [innerMargin + innerW - 2, innerMargin + 2],
    [innerMargin + 2, innerMargin + innerH - 2],
    [innerMargin + innerW - 2, innerMargin + innerH - 2]
  ];

  corners.forEach(([cx, cy]) => {
    doc.save()
       .translate(cx, cy)
       .rotate(45)
       .rect(-3, -3, 6, 6)
       .fillColor(THEME.gold)
       .fill()
       .restore();
  });

  // Top header hairline and footer on content pages
  if (pageNum > 1) {
    // Top running header
    doc.font('Helvetica-Bold')
       .fontSize(8.5)
       .fillColor(THEME.gold)
       .text('GREEN  HAVEN  ·  FINE  BOTANICAL  DINING', outerMargin, outerMargin + 10, {
         width: outerW,
         align: 'center',
         characterSpacing: 2.2
       });

    doc.moveTo(outerMargin + 50, outerMargin + 24)
       .lineTo(outerMargin + outerW - 50, outerMargin + 24)
       .lineWidth(0.5)
       .strokeColor(THEME.goldMuted)
       .stroke();

    // Bottom page footer hairline
    doc.moveTo(outerMargin + 50, outerMargin + outerH - 24)
       .lineTo(outerMargin + outerW - 50, outerMargin + outerH - 24)
       .lineWidth(0.5)
       .strokeColor(THEME.goldMuted)
       .stroke();

    // Subtle page number
    doc.font('Times-Roman')
       .fontSize(9.5)
       .fillColor(THEME.slate)
       .text(`—  Page ${pageNum} of ${TOTAL_PAGES}  —`, outerMargin, outerMargin + outerH - 17, {
         width: outerW,
         align: 'center',
         characterSpacing: 1.5
       });
  }
}

// Helper: Draw elegant vector diamond flourish divider (Unicode-safe)
function drawDividerFlourish(doc, centerX, y, wingWidth = 75) {
  // Left hairline
  doc.moveTo(centerX - wingWidth, y)
     .lineTo(centerX - 16, y)
     .lineWidth(0.6)
     .strokeColor(THEME.gold)
     .stroke();

  // Left small dot
  doc.circle(centerX - 9, y, 1.2)
     .fillColor(THEME.gold)
     .fill();

  // Center diamond flourish
  doc.save()
     .translate(centerX, y)
     .rotate(45)
     .rect(-2.8, -2.8, 5.6, 5.6)
     .fillColor(THEME.gold)
     .fill()
     .restore();

  // Right small dot
  doc.circle(centerX + 9, y, 1.2)
     .fillColor(THEME.gold)
     .fill();

  // Right hairline
  doc.moveTo(centerX + 16, y)
     .lineTo(centerX + wingWidth, y)
     .lineWidth(0.6)
     .strokeColor(THEME.gold)
     .stroke();
}

// Helper: Render menu item with dot leaders and aligned price (Bold, Prominent, No Paragraph Description)
function renderMenuItem(doc, x, y, width, item) {
  let curY = y;

  // Title font & size (15.5pt Times-Bold - high contrast, large and bold)
  doc.font('Times-Bold').fontSize(15.5).fillColor(THEME.espresso);
  const nameStr = item.name;
  const nameWidth = doc.widthOfString(nameStr);

  // Price font & size (16pt FONT_SERIF_BOLD)
  doc.font(FONT_SERIF_BOLD).fontSize(16).fillColor(THEME.heading);
  const priceStr = item.price;
  const priceWidth = doc.widthOfString(priceStr);

  // Draw Dish Name
  doc.text(nameStr, x, curY, { lineBreak: false });

  // Draw Price on right edge
  const priceX = x + width - priceWidth;
  doc.text(priceStr, priceX, curY, { lineBreak: false });

  // Draw Dot Leaders between Name and Price
  const dotsStartX = x + nameWidth + 10;
  const dotsEndX = priceX - 10;
  const dotsAvailable = dotsEndX - dotsStartX;

  if (dotsAvailable > 15) {
    doc.font('Helvetica-Bold').fontSize(10.5).fillColor(THEME.goldMuted);
    const singleDotWidth = doc.widthOfString('. ');
    const numDots = Math.floor(dotsAvailable / singleDotWidth);
    if (numDots > 0) {
      const dotLine = '. '.repeat(numDots);
      doc.text(dotLine, dotsStartX, curY + 1.8, { lineBreak: false });
    }
  }

  curY += 20;

  // Dietary tags line (9.5pt Helvetica-Bold)
  if (item.dietary) {
    doc.font('Helvetica-Bold')
       .fontSize(9.5)
       .fillColor(THEME.tagGreen)
       .text(item.dietary, x, curY, { width: width, characterSpacing: 0.4 });
    curY += 14;
  }

  return curY + 18; // Elegant breathing room between dishes
}

// Helper: Render category header
function renderSectionHeader(doc, x, y, width, title, subtitle) {
  let curY = y;

  // Main Section Title (22pt Times-Bold)
  doc.font('Times-Bold')
     .fontSize(22)
     .fillColor(THEME.heading)
     .text(title, x, curY, { width, align: 'center', characterSpacing: 1.5 });
  curY += 27;

  // Section Subtitle / Introduction (12.5pt Times-Italic - easily readable)
  doc.font('Times-Italic')
     .fontSize(12.5)
     .fillColor(THEME.slate)
     .text(subtitle, x + 20, curY, { width: width - 40, align: 'center', lineGap: 3.5 });
  curY += doc.heightOfString(subtitle, { width: width - 40, lineGap: 3.5 }) + 10;

  // Ornamental Botanical Divider (Clean Vector Flourish)
  drawDividerFlourish(doc, x + width / 2, curY + 2, 90);
  curY += 20;

  return curY;
}

// =========================================================================
// PAGE 1 – COVER PAGE (Vertically Centered)
// =========================================================================
doc.addPage({ size: [A4_W, A4_H], margins: { top: 0, bottom: 0, left: 0, right: 0 } });
drawPageBackgroundAndFrame(doc, 1);

let coverY = 115;

// Draw Official Green Haven Logo
const logoW = 88;
const logoX = (A4_W - logoW) / 2;

if (fs.existsSync(fileLogo)) {
  doc.image(fileLogo, logoX, coverY, { width: logoW, height: logoW });
  coverY += logoW + 24;
} else {
  coverY += 75;
}

// Brand Name
doc.font('Times-Bold')
   .fontSize(38)
   .fillColor(THEME.heading)
   .text('GREEN  HAVEN', CONTENT_X, coverY, {
     width: CONTENT_W,
     align: 'center',
     characterSpacing: 3.5
   });
coverY += 46;

// Sub-branding
doc.font('Helvetica-Bold')
   .fontSize(10)
   .fillColor(THEME.gold)
   .text('SANCTUARY  ·  ORGANIC  KITCHEN  ·  FINE  DINING', CONTENT_X, coverY, {
     width: CONTENT_W,
     align: 'center',
     characterSpacing: 2.5
   });
coverY += 30;

// Decorative Thin Gold Flourish Divider (Unicode-safe)
drawDividerFlourish(doc, A4_W / 2, coverY, 120);
coverY += 36;

// Main Document Title
doc.font('Times-Bold')
   .fontSize(30)
   .fillColor(THEME.espresso)
   .text('RESTAURANT  MENU', CONTENT_X, coverY, {
     width: CONTENT_W,
     align: 'center',
     characterSpacing: 4
   });
coverY += 34;

// Seasonal Edition Tagline
doc.font('Helvetica-Bold')
   .fontSize(9.5)
   .fillColor(THEME.tagGreen)
   .text('SEASONAL PLANT-BASED TASTING COLLECTION', CONTENT_X, coverY, {
     width: CONTENT_W,
     align: 'center',
     characterSpacing: 2
   });
coverY += 50;

// Chef's Dedication
const philosophyText = 'A culinary sanctuary dedicated to 100% organic, plant-based gastronomy. Every plate is crafted from locally foraged herbs, heirloom grains, and regenerative soils cultivated across the Pacific Northwest.';
doc.font('Times-Italic')
   .fontSize(14.5)
   .fillColor(THEME.slate)
   .text(philosophyText, CONTENT_X + 25, coverY, {
     width: CONTENT_W - 50,
     align: 'center',
     lineGap: 5
   });

const philHeight = doc.heightOfString(philosophyText, { width: CONTENT_W - 50, lineGap: 5 });
coverY += philHeight + 46;

// Bottom Cover Signoff
doc.font('Helvetica-Bold')
   .fontSize(12)
   .fillColor(THEME.gold)
   .text('EXECUTIVE CULINARY DIRECTOR: CHEF JULIAN LAURENT', CONTENT_X, coverY, {
     width: CONTENT_W,
     align: 'center',
     characterSpacing: 1.5
   });
coverY += 22;

doc.font('Times-Bold')
   .fontSize(13)
   .fillColor(THEME.espresso)
   .text('742 Evergreen Botanical Way · Portland, Oregon · (503) 555-0192', CONTENT_X, coverY, {
     width: CONTENT_W,
     align: 'center'
   });


// =========================================================================
// PAGE 2 – STARTERS & MAIN COURSES (Vertically Centered)
// =========================================================================
doc.addPage({ size: [A4_W, A4_H], margins: { top: 0, bottom: 0, left: 0, right: 0 } });
drawPageBackgroundAndFrame(doc, 2);

let p2Y = 105;

// Starters Header
p2Y = renderSectionHeader(
  doc, CONTENT_X, p2Y, CONTENT_W,
  'Starters',
  'Artisanal small plates, warm heritage sourdoughs, and delicate foraged flavors designed to awaken the senses.'
);

const startersList = [
  {
    name: 'Heirloom Avocado Tartine',
    price: '₹499',
    desc: 'Grilled artisanal sourdough, whipped Meyer lemon avocado mousse, shaved watermelon radishes, pickled shallots, and hemp dukkah spice.',
    dietary: '100% Vegan • Nut-Free Option • Organic'
  },
  {
    name: 'Wood-Fired Wild Herb Flatbread',
    price: '₹549',
    desc: 'Heritage spelt dough, roasted garlic puree, slow-braised sweet leeks, cultured pine nut ricotta, and garden-picked rosemary oil.',
    dietary: '100% Vegan • Heritage Spelt • Organic'
  },
  {
    name: 'Crispy Truffled Polenta Bites',
    price: '₹449',
    desc: 'Golden pan-seared organic polenta cubes infused with black summer truffle, garlic aioli emulsion, micro chives, and 12-year aged balsamic glaze.',
    dietary: 'Gluten-Free • 100% Vegan'
  }
];

startersList.forEach(item => {
  p2Y = renderMenuItem(doc, CONTENT_X + 15, p2Y, CONTENT_W - 30, item);
});

p2Y += 44;

// Main Courses Header
p2Y = renderSectionHeader(
  doc, CONTENT_X, p2Y, CONTENT_W,
  'Main Courses',
  'Earth-honoring wood-fired and slow-simmered centerpieces celebrating regional biodiversity and heirloom harvests.'
);

const mainsList = [
  {
    name: 'Wild Truffle & Forest Risotto',
    price: '₹899',
    desc: 'Acquerello carnaroli rice slow-simmered in porcini stock, foraged chanterelles, fresh black summer truffle carpaccio, and cashew parmesan silk.',
    dietary: 'Gluten-Free • 100% Organic • Vegan'
  },
  {
    name: 'Smoked Cauliflower Rib Steak',
    price: '₹799',
    desc: 'Applewood-smoked organic cauliflower steak glazed in herb chimichurri, served over smooth parsnip velvet purée with pomegranate reduction.',
    dietary: '100% Vegan • Gluten-Free • Nut-Free'
  },
  {
    name: 'Pan-Seared King Oyster Scallops',
    price: '₹949',
    desc: 'Thick diamond-scored Sonoma King Oyster medallions poached in kombu broth, seared in garlic herb butter over sweet garden pea velvet.',
    dietary: 'Gluten-Free • Chef\'s Signature • Vegan'
  }
];

mainsList.forEach(item => {
  p2Y = renderMenuItem(doc, CONTENT_X + 15, p2Y, CONTENT_W - 30, item);
});


// =========================================================================
// PAGE 3 – BOWLS & SALADS & DESSERTS (Vertically Centered)
// =========================================================================
doc.addPage({ size: [A4_W, A4_H], margins: { top: 0, bottom: 0, left: 0, right: 0 } });
drawPageBackgroundAndFrame(doc, 3);

let p3Y = 105;

// Bowls & Salads Header
p3Y = renderSectionHeader(
  doc, CONTENT_X, p3Y, CONTENT_W,
  'Bowls & Salads',
  'Nutrient-dense ancient grains, cold-pressed artisanal dressings, and farm-fresh organic botanicals harvested daily.'
);

const bowlsList = [
  {
    name: 'Botanical Harvest Bowl',
    price: '₹599',
    desc: 'Tri-color quinoa, crispy turmeric chickpeas, roasted kabocha squash, avocado rose, massaged kale, and green tahini sauce.',
    dietary: 'Raw & Organic • 100% Vegan'
  },
  {
    name: 'Golden Beet & Arugula Salad',
    price: '₹549',
    desc: 'Roasted yellow beets, baby arugula, sprouted candied walnuts, house cultured almond chevre, and blood orange reduction.',
    dietary: 'Gluten-Free • Cultured Almond Chevre'
  },
  {
    name: 'Amazonian Acai Power Bowl',
    price: '₹499',
    desc: 'Thick organic wild acai puree, grain-free coconut almond granola, sliced bananas, dragonfruit, and chia hemp clusters.',
    dietary: '100% Vegan • Antioxidant Rich'
  }
];

bowlsList.forEach(item => {
  p3Y = renderMenuItem(doc, CONTENT_X + 15, p3Y, CONTENT_W - 30, item);
});

p3Y += 44;

// Desserts Header
p3Y = renderSectionHeader(
  doc, CONTENT_X, p3Y, CONTENT_W,
  'Desserts',
  'Guilt-free artisanal confections sweetened naturally with raw dates, ceremonial matcha, pure maple, and berry reductions.'
);

const dessertsList = [
  {
    name: 'Uji Matcha Silk Tart',
    price: '₹449',
    desc: 'Raw date-almond crust, ceremonial matcha cashew cream, candied Sicilian pistachios, and raspberry coulis drizzle.',
    dietary: 'Raw & Organic • Ceremonial Matcha'
  },
  {
    name: 'Raw Dark Cacao & Espresso Torte',
    price: '₹429',
    desc: 'Single-origin Ecuadorian heirloom raw cacao, espresso bean infusion, hazelnut praline crust, and vanilla sea salt.',
    dietary: '100% Vegan • Gluten-Free'
  },
  {
    name: 'Meyer Lemon Verbena Panna Cotta',
    price: '₹399',
    desc: 'Silky coconut cream panna cotta infused with lemon verbena, Meyer lemon curd glaze, and candied lavender petals.',
    dietary: 'Gluten-Free • 100% Vegan'
  }
];

dessertsList.forEach(item => {
  p3Y = renderMenuItem(doc, CONTENT_X + 15, p3Y, CONTENT_W - 30, item);
});


// =========================================================================
// PAGE 4 – DRINKS & RESTAURANT CONTACT / RESERVATIONS (Vertically Centered)
// =========================================================================
doc.addPage({ size: [A4_W, A4_H], margins: { top: 0, bottom: 0, left: 0, right: 0 } });
drawPageBackgroundAndFrame(doc, 4);

let p4Y = 75;

// Drinks Header
p4Y = renderSectionHeader(
  doc, CONTENT_X, p4Y, CONTENT_W,
  'Drinks',
  'Cold-pressed living juices, fermented tonic elixirs, and adaptogenic wellness brews to replenish vitality.'
);

const drinksList = [
  {
    name: 'Emerald Chlorophyll Elixir',
    price: '₹299',
    desc: 'Cold-pressed crisp celery, Japanese cucumber, Granny Smith apple, spirulina, ginger, and organic holy basil.',
    dietary: 'Raw & Organic • Fresh Pressed'
  },
  {
    name: 'Golden Turmeric Adaptogen Tonic',
    price: '₹249',
    desc: 'Fresh Hawaiian wild turmeric root, Ceylon cinnamon, Madagascar vanilla, ashwagandha, oat milk, and cold-pressed ginger.',
    dietary: '100% Vegan • Adaptogen Powered'
  },
  {
    name: 'Wild Hibiscus Rose Kombucha',
    price: '₹279',
    desc: 'In-house fermented live sparkling kombucha infused with organic Sudanese hibiscus calyces, Bulgarian rose water, and fresh lime.',
    dietary: 'Raw & Organic • Live Probiotic'
  }
];

drinksList.forEach(item => {
  p4Y = renderMenuItem(doc, CONTENT_X + 15, p4Y, CONTENT_W - 30, item);
});

p4Y += 24;

// Helper: Paint Authentic Luxury Restaurant Card (Double Gold Border & Corner Diamonds)
function drawLuxuryMenuCard(doc, x, y, w, h) {
  // 1. Primary Card Background with Outer Gold Border
  doc.rect(x, y, w, h)
     .lineWidth(1.2)
     .strokeColor(THEME.gold)
     .fillColor(THEME.boxDarkBg)
     .fillAndStroke();

  // 2. Inner Delicate Gold Hairline Inset
  const pad = 4;
  doc.rect(x + pad, y + pad, w - pad * 2, h - pad * 2)
     .lineWidth(0.5)
     .strokeColor('#A08040')
     .stroke();

  // 3. Four Corner Diamond Florets
  const cDots = [
    [x + pad + 3.5, y + pad + 3.5],
    [x + w - pad - 3.5, y + pad + 3.5],
    [x + pad + 3.5, y + h - pad - 3.5],
    [x + w - pad - 3.5, y + h - pad - 3.5]
  ];
  cDots.forEach(([cx, cy]) => {
    doc.save()
       .translate(cx, cy)
       .rotate(45)
       .rect(-1.5, -1.5, 3, 3)
       .fillColor(THEME.gold)
       .fill()
       .restore();
  });
}

const cardX = CONTENT_X + 15;
const cardW = CONTENT_W - 30;

// ==========================================
// CARD 1: SOMMELIER BOTANICAL PAIRINGS
// ==========================================
const sommelierBoxH = 86;
drawLuxuryMenuCard(doc, cardX, p4Y, cardW, sommelierBoxH);

let curY = p4Y + 16;
doc.font('Menu-Bold')
   .fontSize(11.5)
   .fillColor(THEME.boxDarkGold)
   .text('SOMMELIER APERITIF & BOTANICAL PAIRINGS', cardX + 20, curY, {
     width: cardW - 40,
     align: 'center',
     characterSpacing: 2
   });
curY += 20;

doc.font('Menu-Italic')
   .fontSize(13.5)
   .fillColor(THEME.boxDarkWhite)
   .text('Our culinary plates pair exquisitely with our House Wild Hibiscus Kombucha or a crisp glass of Biodynamic Willamette Valley Pet-Nat.', cardX + 20, curY, {
     width: cardW - 40,
     align: 'center',
     lineGap: 3.5
   });

p4Y += sommelierBoxH + 20;

// ==========================================
// CARD 2: RESERVATIONS & HOSPITALITY
// ==========================================
const finalBoxH = 142;
drawLuxuryMenuCard(doc, cardX, p4Y, cardW, finalBoxH);

let fbY = p4Y + 16;

// 1. Sub-brand Header
doc.font('Menu-Bold')
   .fontSize(11.5)
   .fillColor(THEME.boxDarkGold)
   .text('GREEN  HAVEN  SANCTUARY  &  RESTAURANT', cardX + 20, fbY, {
     width: cardW - 40,
     align: 'center',
     characterSpacing: 2.2
   });
fbY += 20;

// 2. Main Title
doc.font('Menu-Bold')
   .fontSize(16.5)
   .fillColor(THEME.boxDarkWhite)
   .text('Table Reservations  ·  Private Dining  ·  Plant Catering', cardX + 20, fbY, {
     width: cardW - 40,
     align: 'center'
   });
fbY += 22;

// 3. Experience Pillars
const pillarsText = 'Curated Tasting Menus   ·   Garden Banquets   ·   Private Events';
doc.font('Menu-Bold')
   .fontSize(10.5)
   .fillColor(THEME.boxDarkGold)
   .text(pillarsText, cardX + 20, fbY, {
     width: cardW - 40,
     align: 'center',
     characterSpacing: 1
   });
fbY += 17;

// 5. Hospitality Philosophy
const philText = 'Dedicated to regenerative organic harvests and mindful botanical gastronomy.';
doc.font('Menu-Italic')
   .fontSize(12.5)
   .fillColor(THEME.boxDarkLinen)
   .text(philText, cardX + 20, fbY, {
     width: cardW - 40,
     align: 'center'
   });
fbY += 18;

// 6. Concierge & Direct Inquiries
const contactText = 'Bespoke Reservations & Concierge: reservations@greenhaven-restaurant.com';
doc.font('Menu-Roman')
   .fontSize(10.5)
   .fillColor(THEME.boxDarkWhite)
   .text(contactText, cardX + 20, fbY, {
     width: cardW - 40,
     align: 'center',
     characterSpacing: 0.5
   });


// =========================================================================
// FINALIZE DOCUMENT
// =========================================================================
doc.end();

console.log('✅ Luxury Restaurant Menu PDF generated successfully with Green Haven Logo & Enhanced Font Sizes!');
console.log('👉 Destination 1: assets/images/menu-sample.pdf');
console.log('👉 Destination 2: assets/docs/Green-Haven-Menu.pdf');
