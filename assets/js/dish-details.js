/**
 * Green Haven - Dish Details Engine & Catalog
 * Powers the interactive Dish Details modal across the menu
 * and dynamic rendering on menu-details.html
 */

(function () {
  'use strict';

  // Comprehensive Dish Catalog
  const DISHES_CATALOG = {
    'dish-1': {
      id: 'dish-1',
      name: 'Heirloom Avocado Tartine',
      category: 'Starters',
      price: 14.00,
      image: 'assets/img/dishes/heirloom-avocado-tartine.jpg',
      rating: 4.95,
      reviewsCount: 142,
      prepTime: '10-12 mins',
      description: 'Grilled artisanal sourdough topped with whipped Meyer lemon avocado mousse, paper-thin shaved watermelon radishes, pickled shallots, sprouted greens, and our house-roasted hemp dukkah spice blend.',
      dietary: [
        { label: '100% Plant-Based', icon: '🌱', class: 'pill-vegan' },
        { label: 'Organic', icon: '✨', class: 'pill-organic' },
        { label: 'Non-GMO', icon: '🌾', class: 'pill-gf' }
      ],
      ingredients: [
        'Artisanal Spelt Sourdough',
        'Hass Avocado',
        'Meyer Lemon',
        'Watermelon Radish',
        'Pickled Shallots',
        'Toasted Hemp Dukkah',
        'Cold-Pressed Olive Oil',
        'Maldon Flake Salt'
      ],
      nutrition: {
        calories: '380 kcal',
        protein: '11g',
        carbs: '39g',
        fat: '21g'
      },
      chefNote: 'Pair with our Emerald Chlorophyll Elixir for an energizing breakfast or light lunch.'
    },
    'dish-6': {
      id: 'dish-6',
      name: 'Wood-Fired Wild Herb Flatbread',
      category: 'Starters',
      price: 15.50,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop',
      rating: 4.92,
      reviewsCount: 118,
      prepTime: '12-14 mins',
      description: 'Heritage spelt dough charred over Oregon oak wood fire, layered with slow-roasted sweet garlic purée, braised baby leeks, whipped cultured pine nut ricotta, and freshly snipped garden rosemary oil.',
      dietary: [
        { label: '100% Plant-Based', icon: '🌱', class: 'pill-vegan' },
        { label: 'Organic', icon: '✨', class: 'pill-organic' },
        { label: 'Artisanal Harvest', icon: '🌾', class: 'pill-organic' }
      ],
      ingredients: [
        'Heritage Spelt Flour',
        'Cultured Pine Nut Ricotta',
        'Braised Leeks',
        'Roasted Garlic Purée',
        'Fresh Rosemary',
        'Thyme Blossom',
        'Cold-Pressed Olive Oil'
      ],
      nutrition: {
        calories: '420 kcal',
        protein: '14g',
        carbs: '52g',
        fat: '18g'
      },
      chefNote: 'Baked at 800°F in our stone hearth oven for blistered sourdough perfection.'
    },
    'dish-10': {
      id: 'dish-10',
      name: 'Crispy Truffled Polenta Bites',
      category: 'Starters',
      price: 13.50,
      image: 'assets/img/dishes/crispy-truffled-polenta-bites.jpg',
      rating: 4.88,
      reviewsCount: 96,
      prepTime: '10-12 mins',
      description: 'Golden pan-seared organic heirloom polenta cubes infused with black summer truffles, served with velvety cashew garlic aioli, micro chives, and a 12-year aged Modena balsamic drizzle.',
      dietary: [
        { label: '100% Plant-Based', icon: '🌱', class: 'pill-vegan' },
        { label: 'Gluten-Free', icon: '🌾', class: 'pill-gf' },
        { label: 'Organic', icon: '✨', class: 'pill-organic' }
      ],
      ingredients: [
        'Organic Heirloom Polenta',
        'Italian Black Summer Truffle',
        'Cashew Garlic Aioli',
        'Micro Chives',
        'Aged Modena Balsamic',
        'Herb Sea Salt'
      ],
      nutrition: {
        calories: '340 kcal',
        protein: '8g',
        carbs: '44g',
        fat: '15g'
      },
      chefNote: 'Crisped to order with a soft, creamy truffle-infused polenta center.'
    },
    'dish-2': {
      id: 'dish-2',
      name: 'Wild Truffle & Forest Risotto',
      category: 'Main Courses',
      price: 26.00,
      image: 'assets/img/dishes/wild-truffle-forest-risotto.jpg',
      rating: 4.98,
      reviewsCount: 320,
      prepTime: '18-20 mins',
      description: 'Artisan Carnaroli rice slow-simmered in roasted wild porcini broth, tossed with pan-caramelized chanterelles, black summer truffle carpaccio, and finished with velvety cultured cashew parmesan silk.',
      dietary: [
        { label: '100% Plant-Based', icon: '🌱', class: 'pill-vegan' },
        { label: 'Gluten-Free', icon: '🌾', class: 'pill-gf' },
        { label: 'Artisanal Harvest', icon: '✨', class: 'pill-organic' }
      ],
      ingredients: [
        'Carnaroli Risotto Rice',
        'Wild Foraged Chanterelles',
        'Slow-Simmered Porcini Broth',
        'Black Summer Truffle Carpaccio',
        'Cultured Cashew Silk',
        'Shallot Confit',
        'White Wine Reduction'
      ],
      nutrition: {
        calories: '520 kcal',
        protein: '16g',
        carbs: '68g',
        fat: '20g'
      },
      chefNote: 'Our most awarded culinary dish; foraged weekly from the Tillamook forest.'
    },
    'dish-4': {
      id: 'dish-4',
      name: 'Smoked Cauliflower Rib Steak',
      category: 'Main Courses',
      price: 24.00,
      image: 'assets/img/dishes/smoked-cauliflower-rib-steak.jpg',
      rating: 4.90,
      reviewsCount: 175,
      prepTime: '15-18 mins',
      description: 'Thick-cut Pacific Northwest cauliflower steak Applewood-smoked and cast-iron seared, coated in fresh Oregon herb chimichurri, served over silky roasted parsnip velvet with tart pomegranate molasses.',
      dietary: [
        { label: '100% Plant-Based', icon: '🌱', class: 'pill-vegan' },
        { label: 'Gluten-Free', icon: '🌾', class: 'pill-gf' },
        { label: 'Organic', icon: '✨', class: 'pill-organic' }
      ],
      ingredients: [
        'Organic Cauliflower Steak',
        'Oregon Herb Chimichurri',
        'Roasted Parsnip Velvet',
        'Pomegranate Molasses',
        'Toasted Pine Nuts',
        'Micro Cilantro'
      ],
      nutrition: {
        calories: '390 kcal',
        protein: '12g',
        carbs: '46g',
        fat: '18g'
      },
      chefNote: 'Smoked over cured apple orchard wood for deep umami resonance.'
    },
    'dish-11': {
      id: 'dish-11',
      name: 'Pan-Seared King Oyster Scallops',
      category: 'Main Courses',
      price: 28.00,
      image: 'assets/img/dishes/pan-seared-king-oyster-scallops.jpg',
      rating: 4.95,
      reviewsCount: 210,
      prepTime: '15-20 mins',
      description: 'Thick diamond-scored Sonoma King Oyster mushroom medallions, slow-poached in kombu-infused herb broth and seared to golden caramelization. Served atop sweet garden pea and mint purée, roasted baby heirloom carrots, crispy shallots, and citrus Meyer lemon emulsion.',
      dietary: [
        { label: '100% Plant-Based', icon: '🌱', class: 'pill-vegan' },
        { label: 'Gluten-Free', icon: '🌾', class: 'pill-gf' },
        { label: 'Artisanal Harvest', icon: '✨', class: 'pill-organic' }
      ],
      ingredients: [
        'Sonoma King Oyster Mushrooms',
        'Sweet English Pea Purée',
        'Fresh Garden Mint',
        'Baby Heirloom Carrots',
        'Crispy Shallot Blossoms',
        'Meyer Lemon Emulsion'
      ],
      nutrition: {
        calories: '440 kcal',
        protein: '15g',
        carbs: '52g',
        fat: '19g'
      },
      chefNote: 'Executive signature dish demonstrating the succulent texture of botanical affineurs.'
    },
    'dish-3': {
      id: 'dish-3',
      name: 'Botanical Harvest Bowl',
      category: 'Bowls & Salads',
      price: 18.50,
      image: 'assets/img/dishes/botanical-harvest-bowl.jpg',
      rating: 4.94,
      reviewsCount: 245,
      prepTime: '10-12 mins',
      description: 'Fluffy tri-color organic quinoa, fire-roasted sweet kabocha squash, house-cultured probiotic sauerkraut, ripe avocado, marinated Oregon tempeh, and a vibrant golden turmeric tahini dressing.',
      dietary: [
        { label: '100% Plant-Based', icon: '🌱', class: 'pill-vegan' },
        { label: 'Gluten-Free', icon: '🌾', class: 'pill-gf' },
        { label: 'Organic', icon: '✨', class: 'pill-organic' }
      ],
      ingredients: [
        'Tri-Color Quinoa',
        'Kabocha Squash',
        'Organic Sprouted Tempeh',
        'Probiotic Sauerkraut',
        'Hass Avocado',
        'Golden Turmeric Tahini',
        'Pumpkin Seeds'
      ],
      nutrition: {
        calories: '490 kcal',
        protein: '22g',
        carbs: '58g',
        fat: '20g'
      },
      chefNote: 'A complete macro nutrient bowl loaded with living microbiome cultures.'
    },
    'dish-5': {
      id: 'dish-5',
      name: 'Golden Beet & Arugula Salad',
      category: 'Bowls & Salads',
      price: 16.50,
      image: 'assets/img/dishes/golden-beet-arugula-salad.jpg',
      rating: 4.89,
      reviewsCount: 132,
      prepTime: '8-10 mins',
      description: 'Slow wood-roasted golden beets, peppery wild baby arugula, rosemary-candied Oregon walnuts, dollops of cultured almond milk chèvre, and an orange blossom sherry reduction.',
      dietary: [
        { label: '100% Plant-Based', icon: '🌱', class: 'pill-vegan' },
        { label: 'Gluten-Free', icon: '🌾', class: 'pill-gf' },
        { label: 'Organic', icon: '✨', class: 'pill-organic' }
      ],
      ingredients: [
        'Roasted Golden Beets',
        'Wild Baby Arugula',
        'Cultured Almond Chèvre',
        'Candied Oregon Walnuts',
        'Orange Blossom Reduction',
        'Cold-Pressed Olive Oil'
      ],
      nutrition: {
        calories: '360 kcal',
        protein: '9g',
        carbs: '32g',
        fat: '22g'
      },
      chefNote: 'Sweet, earthy, and peppery with our handmade cultured nut cheese.'
    },
    'dish-8': {
      id: 'dish-8',
      name: 'Amazonian Acai Power Bowl',
      category: 'Bowls & Salads',
      price: 15.00,
      image: 'assets/img/dishes/amazonian-acai-power-bowl.jpg',
      rating: 4.91,
      reviewsCount: 164,
      prepTime: '8-10 mins',
      description: 'Wild-harvested cold-pressed pure acai berry purée blended with frozen bananas and coconut water. Topped with sprouted buckwheat hazelnut granola, fresh blueberries, chia seeds, and raw agave drizzle.',
      dietary: [
        { label: '100% Plant-Based', icon: '🌱', class: 'pill-vegan' },
        { label: 'Gluten-Free', icon: '🌾', class: 'pill-gf' },
        { label: 'Organic', icon: '✨', class: 'pill-organic' }
      ],
      ingredients: [
        'Wild Amazonian Acai',
        'Sprouted Buckwheat Granola',
        'Fresh Blueberries',
        'Chia Seeds',
        'Coconut Milk',
        'Hemp Hearts',
        'Organic Raw Agave'
      ],
      nutrition: {
        calories: '410 kcal',
        protein: '10g',
        carbs: '64g',
        fat: '14g'
      },
      chefNote: 'Zero processed sugar; naturally sweetened by wild sun-ripened berries.'
    },
    'dish-7': {
      id: 'dish-7',
      name: 'Uji Matcha Silk Tart',
      category: 'Desserts',
      price: 14.00,
      image: 'assets/img/dishes/uji-matcha-silk-tart.jpg',
      rating: 4.97,
      reviewsCount: 188,
      prepTime: '5-8 mins',
      description: 'Ceremonial grade Japanese Uji matcha blended with velvety white cacao butter and silky cashew cream atop a toasted almond oat crust, adorned with tart passion fruit gelée and edible 24k gold leaf.',
      dietary: [
        { label: '100% Plant-Based', icon: '🌱', class: 'pill-vegan' },
        { label: 'Gluten-Free', icon: '🌾', class: 'pill-gf' },
        { label: 'Organic', icon: '✨', class: 'pill-organic' }
      ],
      ingredients: [
        'Ceremonial Uji Matcha',
        'Cold-Pressed Cacao Butter',
        'Cashew Cream',
        'Almond Oat Crust',
        'Passion Fruit Gelée',
        'Edible Gold Leaf'
      ],
      nutrition: {
        calories: '370 kcal',
        protein: '7g',
        carbs: '36g',
        fat: '23g'
      },
      chefNote: 'Imported directly from generational tea masters in Uji, Kyoto.'
    },
    'dish-15': {
      id: 'dish-15',
      name: 'Raw Dark Cacao & Espresso Torte',
      category: 'Desserts',
      price: 13.00,
      image: 'assets/img/dishes/raw-dark-cacao-espresso-torte.jpg',
      rating: 4.93,
      reviewsCount: 152,
      prepTime: '5-8 mins',
      description: 'Single-origin 85% Peruvian raw cacao ganache infused with espresso notes, set over a walnut and Medjool date crust, served with cold-whipped coconut vanilla bean chantilly and sea salt.',
      dietary: [
        { label: '100% Plant-Based', icon: '🌱', class: 'pill-vegan' },
        { label: 'Gluten-Free', icon: '🌾', class: 'pill-gf' },
        { label: 'Organic', icon: '✨', class: 'pill-organic' }
      ],
      ingredients: [
        'Peruvian Raw Cacao',
        'Medjool Dates',
        'Oregon Walnuts',
        'Coconut Chantilly',
        'Madagascar Vanilla Bean',
        'Flaky Sea Salt'
      ],
      nutrition: {
        calories: '420 kcal',
        protein: '9g',
        carbs: '42g',
        fat: '26g'
      },
      chefNote: 'Unheated above 118°F to preserve vital antioxidant polyphenols.'
    },
    'dish-16': {
      id: 'dish-16',
      name: 'Meyer Lemon Verbena Panna Cotta',
      category: 'Desserts',
      price: 12.50,
      image: 'assets/img/dishes/meyer-lemon-verbena-panna-cotta.jpg',
      rating: 4.89,
      reviewsCount: 104,
      prepTime: '5-8 mins',
      description: 'Silky coconut cream set with botanical agar-agar, infused with fragrant Oregon Meyer lemon zest, crowned with wild mountain blackberry compote and crystallized garden basil crystals.',
      dietary: [
        { label: '100% Plant-Based', icon: '🌱', class: 'pill-vegan' },
        { label: 'Gluten-Free', icon: '🌾', class: 'pill-gf' },
        { label: 'Organic', icon: '✨', class: 'pill-organic' }
      ],
      ingredients: [
        'Coconut Cream',
        'Meyer Lemon Curd',
        'Botanical Agar-Agar',
        'Wild Blackberry Compote',
        'Crystallized Basil',
        'Maple Glaze'
      ],
      nutrition: {
        calories: '310 kcal',
        protein: '5g',
        carbs: '34g',
        fat: '18g'
      },
      chefNote: 'A delicate citrus finish crafted with zero dairy or gelatin.'
    },
    'dish-17': {
      id: 'dish-17',
      name: 'Emerald Chlorophyll Elixir',
      category: 'Drinks',
      price: 9.50,
      image: 'assets/img/dishes/emerald-chlorophyll-elixir.jpg',
      rating: 4.96,
      reviewsCount: 178,
      prepTime: '3-5 mins',
      description: 'Cold-pressed holy basil, Klamath Lake blue-green spirulina, English cucumber essence, fresh Meyer lemon, and concentrated botanical liquid chlorophyll. Invigorating and deeply alkalizing.',
      dietary: [
        { label: '100% Plant-Based', icon: '🌱', class: 'pill-vegan' },
        { label: 'Gluten-Free', icon: '🌾', class: 'pill-gf' },
        { label: 'Organic', icon: '✨', class: 'pill-organic' }
      ],
      ingredients: [
        'Liquid Chlorophyll',
        'Living Blue Spirulina',
        'Holy Basil (Tulsi)',
        'Cucumber Essence',
        'Meyer Lemon',
        'Spring Mountain Water'
      ],
      nutrition: {
        calories: '45 kcal',
        protein: '3g',
        carbs: '8g',
        fat: '0.5g'
      },
      chefNote: 'Extracted fresh every morning at 6:00 AM in our cold-press bar.'
    },
    'dish-18': {
      id: 'dish-18',
      name: 'Golden Turmeric Adaptogen Tonic',
      category: 'Drinks',
      price: 8.50,
      image: 'assets/img/dishes/golden-turmeric-adaptogen-tonic.jpg',
      rating: 4.92,
      reviewsCount: 140,
      prepTime: '3-5 mins',
      description: 'Fresh cold-pressed Hawaiian turmeric rhizomes, ginger root, KSM-66 ashwagandha root, Tellicherry black pepper oil, and warm steamed coconut almond milk dusted with Ceylon cinnamon.',
      dietary: [
        { label: '100% Plant-Based', icon: '🌱', class: 'pill-vegan' },
        { label: 'Gluten-Free', icon: '🌾', class: 'pill-gf' },
        { label: 'Organic', icon: '✨', class: 'pill-organic' }
      ],
      ingredients: [
        'Hawaiian Turmeric',
        'Organic Ginger Root',
        'Ashwagandha Adaptogen',
        'Coconut Milk',
        'Black Pepper Essence',
        'Ceylon Cinnamon'
      ],
      nutrition: {
        calories: '95 kcal',
        protein: '2g',
        carbs: '12g',
        fat: '4.5g'
      },
      chefNote: 'Formulated to reduce systemic inflammation and soothe digestive fire.'
    },
    'dish-19': {
      id: 'dish-19',
      name: 'Wild Hibiscus Rose Kombucha',
      category: 'Drinks',
      price: 9.00,
      image: 'assets/img/dishes/wild-hibiscus-rose-kombucha.jpg',
      rating: 4.94,
      reviewsCount: 165,
      prepTime: '3-5 mins',
      description: 'Small-batch oak barrel fermented living green tea kombucha infused with wild mountain hibiscus blossoms, crushed Damascus rose petals, and sparkling botanical effervescence.',
      dietary: [
        { label: '100% Plant-Based', icon: '🌱', class: 'pill-vegan' },
        { label: 'Gluten-Free', icon: '🌾', class: 'pill-gf' },
        { label: 'Organic', icon: '✨', class: 'pill-organic' }
      ],
      ingredients: [
        'Living Green Tea Kombucha',
        'Wild Mountain Hibiscus',
        'Damascus Rose Petals',
        'Raw Organic Cane Sugar (Fermented Out)',
        'Living Probiotics'
      ],
      nutrition: {
        calories: '50 kcal',
        protein: '1g',
        carbs: '11g',
        fat: '0g'
      },
      chefNote: 'Barrel-aged for 28 days for crisp natural tartness and sparkling effervescence.'
    }
  };

  // Favorites Management
  const FAVORITES_KEY = 'gh_dish_favorites';

  function getFavorites() {
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function isFavorite(dishId) {
    const favs = getFavorites();
    return favs.includes(String(dishId));
  }

  function toggleFavorite(dishId) {
    let favs = getFavorites();
    const id = String(dishId);
    let nowFavorite = false;
    if (favs.includes(id)) {
      favs = favs.filter(f => f !== id);
      nowFavorite = false;
    } else {
      favs.push(id);
      nowFavorite = true;
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    return nowFavorite;
  }

  // Active modal dish reference
  let currentModalDish = null;
  let currentModalQty = 1;
  let bsModalInstance = null;

  /**
   * Helper: Escape HTML string
   */
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

  /**
   * Helper: Find dish by ID or fuzzy name match
   */
  function findDish(idOrName) {
    if (!idOrName) return null;
    if (DISHES_CATALOG[idOrName]) return DISHES_CATALOG[idOrName];

    // Try name match
    const cleanQuery = String(idOrName).toLowerCase().trim();
    for (const key in DISHES_CATALOG) {
      const dish = DISHES_CATALOG[key];
      if (dish.name.toLowerCase().trim() === cleanQuery || dish.name.toLowerCase().includes(cleanQuery)) {
        return dish;
      }
    }
    return null;
  }

  /**
   * Open Dish Details Modal with specified dish data
   */
  function openDishDetails(dishIdOrData) {
    let dish = null;
    if (typeof dishIdOrData === 'string') {
      dish = findDish(dishIdOrData);
    } else if (dishIdOrData && dishIdOrData.id) {
      dish = DISHES_CATALOG[dishIdOrData.id] || dishIdOrData;
    }

    if (!dish) {
      console.warn('Green Haven: Dish details not found for', dishIdOrData);
      return;
    }

    currentModalDish = dish;
    currentModalQty = 1;

    // Get or Create Modal DOM
    ensureModalExists();

    // Populate all fields
    const modalEl = document.getElementById('dishDetailsModal');
    if (!modalEl) return;

    // Image
    const imgEl = document.getElementById('dishModalImage');
    if (imgEl) {
      imgEl.src = dish.image;
      imgEl.alt = dish.name;
    }

    // Category
    const catEl = document.getElementById('dishModalCategory');
    if (catEl) catEl.textContent = dish.category || 'Menu Item';

    // Title
    const titleEl = document.getElementById('dishModalTitle');
    if (titleEl) titleEl.textContent = dish.name;

    // Rating & Reviews
    const ratingNumEl = document.getElementById('dishModalRatingNum');
    if (ratingNumEl) ratingNumEl.textContent = (dish.rating || 4.9).toFixed(2);

    const reviewsEl = document.getElementById('dishModalReviewsCount');
    if (reviewsEl) reviewsEl.textContent = dish.reviewsCount || 100;

    // Price
    const priceEl = document.getElementById('dishModalPrice');
    if (priceEl) priceEl.textContent = `$${parseFloat(dish.price).toFixed(2)}`;

    // Prep time
    const prepEl = document.getElementById('dishModalPrepTime');
    if (prepEl) prepEl.textContent = dish.prepTime || '15 mins';

    // Description
    const descEl = document.getElementById('dishModalDesc');
    if (descEl) descEl.textContent = dish.description;

    // Dietary Badges (in details section)
    const dietaryEl = document.getElementById('dishModalDietaryBadges');
    if (dietaryEl) {
      dietaryEl.innerHTML = (dish.dietary || [
        { label: '100% Plant-Based', icon: '🌱', class: 'pill-vegan' },
        { label: 'Gluten-Free', icon: '🌾', class: 'pill-gf' },
        { label: 'Organic', icon: '✨', class: 'pill-organic' }
      ]).map(d => `
        <span class="dietary-pill ${d.class || 'pill-vegan'}">
          <span class="pill-icon">${d.icon || '🌱'}</span> ${escapeHtml(d.label)}
        </span>
      `).join('');
    }

    // Image overlay badges
    const imgBadgesEl = document.getElementById('dishModalImageBadges');
    if (imgBadgesEl) {
      const topBadge = (dish.dietary && dish.dietary[0]) ? dish.dietary[0] : { label: '100% Plant-Based', icon: '🌱' };
      imgBadgesEl.innerHTML = `
        <span class="badge bg-success text-white shadow rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1">
          <span>${topBadge.icon}</span> ${escapeHtml(topBadge.label)}
        </span>
      `;
    }

    // Ingredients
    const ingEl = document.getElementById('dishModalIngredients');
    if (ingEl) {
      ingEl.innerHTML = (dish.ingredients || []).map(ing => `
        <span class="badge bg-light text-dark border px-2.5 py-1.5 rounded-pill small fw-normal d-inline-flex align-items-center gap-1">
          <i class="bi bi-check2 text-success"></i> ${escapeHtml(ing)}
        </span>
      `).join('');
    }

    // Nutrition
    const nutri = dish.nutrition || { calories: '400 kcal', protein: '14g', carbs: '45g', fat: '16g' };
    const calEl = document.getElementById('dishNutriCalories');
    const protEl = document.getElementById('dishNutriProtein');
    const carbsEl = document.getElementById('dishNutriCarbs');
    const fatEl = document.getElementById('dishNutriFat');
    if (calEl) calEl.textContent = nutri.calories;
    if (protEl) protEl.textContent = nutri.protein;
    if (carbsEl) carbsEl.textContent = nutri.carbs;
    if (fatEl) fatEl.textContent = nutri.fat;

    // Reset quantity
    const qtyInput = document.getElementById('dishModalQtyInput');
    if (qtyInput) qtyInput.value = 1;

    // Reset special instructions
    const instEl = document.getElementById('dishModalInstructions');
    if (instEl) instEl.value = '';

    // Update Favorite Button State
    updateFavButtonState(dish.id);

    // Update Add to Cart Button Price
    updateBtnPrice();

    // Show Modal
    if (!bsModalInstance && window.bootstrap && window.bootstrap.Modal) {
      bsModalInstance = new window.bootstrap.Modal(modalEl);
    }
    if (bsModalInstance) {
      bsModalInstance.show();
    }
  }

  /**
   * Updates Add to Cart button label with dynamic quantity calculation
   */
  function updateBtnPrice() {
    const btnPriceEl = document.getElementById('dishModalBtnPrice');
    if (!btnPriceEl || !currentModalDish) return;
    const total = (parseFloat(currentModalDish.price) * currentModalQty).toFixed(2);
    btnPriceEl.textContent = total;
  }

  /**
   * Updates Favorite button visual state
   */
  function updateFavButtonState(dishId) {
    const favBtn = document.getElementById('dishModalFavBtn');
    if (!favBtn) return;
    const fav = isFavorite(dishId);
    if (fav) {
      favBtn.classList.remove('btn-outline-danger');
      favBtn.classList.add('btn-danger', 'text-white');
      favBtn.innerHTML = '<i class="bi bi-heart-fill"></i>';
      favBtn.setAttribute('title', 'Saved to Favorites');
    } else {
      favBtn.classList.remove('btn-danger', 'text-white');
      favBtn.classList.add('btn-outline-danger');
      favBtn.innerHTML = '<i class="bi bi-heart"></i>';
      favBtn.setAttribute('title', 'Save to Favorites');
    }
  }

  /**
   * Ensures the Dish Details Modal exists in the DOM
   */
  function ensureModalExists() {
    if (document.getElementById('dishDetailsModal')) return;

    const modalHtml = `
      <div class="modal fade dish-details-modal" id="dishDetailsModal" tabindex="-1" aria-labelledby="dishDetailsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg dish-modal-dialog">
          <div class="modal-content border-0 rounded-4 shadow-2xl overflow-hidden">
            <!-- Modal Header with Category and Back -->
            <div class="modal-header border-0 pb-0 pt-3 px-3.5 px-md-4 d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1 extra-small fw-semibold" data-bs-dismiss="modal">
                  <i class="bi bi-arrow-left"></i> Back to Menu
                </button>
                <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1 extra-small fw-semibold" id="dishModalCategory">Starters</span>
              </div>
              <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body p-3 p-md-4 pt-2">
              <div class="row g-3 g-md-4 align-items-start">
                
                <!-- Left Column: Compact Image & Badges -->
                <div class="col-md-5">
                  <div class="dish-modal-gallery position-relative rounded-3 overflow-hidden shadow-xs">
                    <img src="" alt="" id="dishModalImage" class="img-fluid w-100 dish-modal-hero-img">
                    
                    <!-- Overlay Badges -->
                    <div class="position-absolute top-0 start-0 m-2.5 d-flex flex-column gap-1" id="dishModalImageBadges">
                    </div>
                    
                    <!-- Prep Time Overlay Badge -->
                    <div class="position-absolute bottom-0 start-0 m-2.5">
                      <span class="badge bg-dark bg-opacity-75 text-white backdrop-blur rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1 extra-small shadow-sm">
                        <i class="bi bi-clock-history text-warning"></i> <span id="dishModalPrepTime">15-20 mins</span>
                      </span>
                    </div>
                  </div>

                  <!-- Dietary Badges Container -->
                  <div class="mt-2.5">
                    <h6 class="text-uppercase extra-small text-muted fw-bold mb-1.5 letter-spacing-1">
                      <i class="bi bi-shield-check text-success me-1"></i> Dietary Badges
                    </h6>
                    <div class="d-flex flex-wrap gap-1.5 dish-modal-dietary-pills" id="dishModalDietaryBadges">
                    </div>
                  </div>
                </div>

                <!-- Right Column: Details, Nutrition, Instructions & Cart -->
                <div class="col-md-7">
                  
                  <!-- Title, Rating, Price -->
                  <div class="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-2 pb-1 border-bottom">
                    <div>
                      <h3 class="dish-modal-title font-serif fw-bold text-dark mb-1" id="dishModalTitle">Dish Name</h3>
                      <div class="d-flex align-items-center gap-1.5">
                        <div class="text-warning extra-small d-flex align-items-center" id="dishModalStars">
                          <i class="bi bi-star-fill"></i>
                          <i class="bi bi-star-fill"></i>
                          <i class="bi bi-star-fill"></i>
                          <i class="bi bi-star-fill"></i>
                          <i class="bi bi-star-fill"></i>
                        </div>
                        <span class="text-dark fw-bold extra-small" id="dishModalRatingNum">4.95</span>
                        <span class="text-muted extra-small">(<span id="dishModalReviewsCount">142</span> reviews)</span>
                      </div>
                    </div>
                    <div class="dish-modal-price text-success fw-bold font-serif fs-3" id="dishModalPrice">$0.00</div>
                  </div>

                  <!-- Short Premium Description -->
                  <p class="dish-modal-desc text-muted mb-2.5" id="dishModalDesc">
                    Short premium description goes here.
                  </p>

                  <!-- Botanical Ingredients List -->
                  <div class="mb-2.5">
                    <h6 class="text-uppercase extra-small text-muted fw-bold mb-1.5 letter-spacing-1">
                      <i class="bi bi-flower1 text-success me-1"></i> Ingredients List
                    </h6>
                    <div class="dish-ingredients-wrap d-flex flex-wrap gap-1" id="dishModalIngredients">
                    </div>
                  </div>

                  <!-- Nutrition Grid -->
                  <div class="dish-nutrition-block p-2.5 rounded-3 bg-light mb-2.5 border">
                    <div class="d-flex align-items-center justify-content-between mb-1.5">
                      <span class="extra-small fw-bold text-uppercase text-muted letter-spacing-1" style="font-size: 0.72rem;">
                        <i class="bi bi-activity text-primary me-1"></i> Nutrition Information
                      </span>
                      <span class="extra-small text-muted fw-semibold" style="font-size: 0.72rem;">Clean Organic Profile</span>
                    </div>
                    <div class="row g-1.5 text-center" id="dishModalNutritionGrid">
                      <div class="col-3">
                        <div class="p-1.5 bg-white rounded-2 border shadow-xs">
                          <span class="d-block text-muted" style="font-size: 0.68rem;">Calories</span>
                          <strong class="text-dark fs-6" id="dishNutriCalories">380</strong>
                        </div>
                      </div>
                      <div class="col-3">
                        <div class="p-1.5 bg-white rounded-2 border shadow-xs">
                          <span class="d-block text-muted" style="font-size: 0.68rem;">Protein</span>
                          <strong class="text-success fs-6" id="dishNutriProtein">14g</strong>
                        </div>
                      </div>
                      <div class="col-3">
                        <div class="p-1.5 bg-white rounded-2 border shadow-xs">
                          <span class="d-block text-muted" style="font-size: 0.68rem;">Carbs</span>
                          <strong class="text-dark fs-6" id="dishNutriCarbs">42g</strong>
                        </div>
                      </div>
                      <div class="col-3">
                        <div class="p-1.5 bg-white rounded-2 border shadow-xs">
                          <span class="d-block text-muted" style="font-size: 0.68rem;">Fat</span>
                          <strong class="text-dark fs-6" id="dishNutriFat">18g</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Special Instructions Textarea -->
                  <div class="mb-2.5">
                    <label for="dishModalInstructions" class="form-label extra-small text-muted fw-bold text-uppercase letter-spacing-1 mb-1" style="font-size: 0.72rem;">
                      <i class="bi bi-pencil-square text-success me-1"></i> Special Instructions
                    </label>
                    <textarea class="form-control form-control-sm rounded-3 py-1.5 px-2.5" id="dishModalInstructions" rows="1" placeholder="e.g., Dressing on side, extra herbs..." style="font-size: 0.82rem; min-height: 38px;"></textarea>
                  </div>

                  <!-- Quantity Selector & Primary Add to Cart -->
                  <div class="d-flex align-items-center gap-2 pt-2 border-top">
                    <!-- Quantity Stepper -->
                    <div class="d-inline-flex align-items-center justify-content-between p-1 border rounded-pill bg-light" style="min-width: 105px;">
                      <button type="button" class="btn btn-sm btn-light rounded-circle shadow-xs" id="dishModalQtyMinus" aria-label="Decrease quantity" style="width: 28px; height: 28px; padding: 0;">
                        <i class="bi bi-dash"></i>
                      </button>
                      <input type="number" id="dishModalQtyInput" value="1" min="1" max="99" class="form-control form-control-sm border-0 bg-transparent text-center fw-bold shadow-none p-0" style="width: 34px; font-size: 0.88rem;" readonly>
                      <button type="button" class="btn btn-sm btn-light rounded-circle shadow-xs" id="dishModalQtyPlus" aria-label="Increase quantity" style="width: 28px; height: 28px; padding: 0;">
                        <i class="bi bi-plus"></i>
                      </button>
                    </div>

                    <!-- Primary Add to Cart Button -->
                    <button type="button" class="btn btn-primary btn-md rounded-pill flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2 shadow-sm py-2 fw-semibold" id="dishModalAddToCartBtn" style="font-size: 0.92rem;">
                      <i class="bi bi-bag-plus-fill fs-6"></i>
                      <span>Add to Cart &bull; $<span id="dishModalBtnPrice">0.00</span></span>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    bindModalInternalEvents();
  }

  /**
   * Bind event handlers inside the modal (Quantity, Favorite, Add to Cart)
   */
  function bindModalInternalEvents() {
    const qtyMinus = document.getElementById('dishModalQtyMinus');
    const qtyPlus = document.getElementById('dishModalQtyPlus');
    const qtyInput = document.getElementById('dishModalQtyInput');

    if (qtyMinus && qtyPlus && qtyInput) {
      qtyMinus.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        if (val > 1) {
          val -= 1;
          qtyInput.value = val;
          currentModalQty = val;
          updateBtnPrice();
        }
      });

      qtyPlus.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        val += 1;
        qtyInput.value = val;
        currentModalQty = val;
        updateBtnPrice();
      });
    }

    // Favorite Button
    const favBtn = document.getElementById('dishModalFavBtn');
    if (favBtn) {
      favBtn.addEventListener('click', () => {
        if (!currentModalDish) return;
        const nowFav = toggleFavorite(currentModalDish.id);
        updateFavButtonState(currentModalDish.id);
        if (window.GH_UI && typeof window.GH_UI.showToast === 'function') {
          if (nowFav) {
            window.GH_UI.showToast('Saved to Favorites', `<strong>${escapeHtml(currentModalDish.name)}</strong> saved to your culinary wishlist!`, 'bi-heart-fill');
          } else {
            window.GH_UI.showToast('Removed from Favorites', `${escapeHtml(currentModalDish.name)} removed from favorites.`, 'bi-heart');
          }
        }
      });
    }

    // Add to Cart Button
    const addBtn = document.getElementById('dishModalAddToCartBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        if (!currentModalDish) return;
        const qty = parseInt(qtyInput ? qtyInput.value : 1, 10) || 1;
        const instructions = (document.getElementById('dishModalInstructions')?.value || '').trim();

        if (window.GH_Cart && typeof window.GH_Cart.addToCart === 'function') {
          const itemPayload = {
            id: currentModalDish.id,
            name: currentModalDish.name,
            price: currentModalDish.price,
            image: currentModalDish.image,
            category: currentModalDish.category,
            instructions: instructions || undefined
          };

          window.GH_Cart.addToCart(itemPayload, qty, true);

          // Close modal after adding
          if (bsModalInstance) {
            bsModalInstance.hide();
          }
        } else {
          if (window.showToast) {
            window.showToast.success('Added to Cart', `Added ${qty}x ${currentModalDish.name} to cart!`);
          } else {
            alert(`Added ${qty}x ${currentModalDish.name} to cart!`);
          }
        }
      });
    }
  }

  /**
   * Bind all "Details" buttons, dish titles, and dish images across the page
   */
  function bindDishTriggers() {
    // 1. Explicit Details buttons (e.g. .btn-dish-details or Details links)
    document.querySelectorAll('.btn-dish-details, [data-dish-id]').forEach(el => {
      if (el.dataset.boundDetails) return;
      el.dataset.boundDetails = 'true';
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const dishId = el.dataset.dishId || el.getAttribute('data-dish-id');
        if (dishId) {
          openDishDetails(dishId);
        }
      });
    });

    // 2. Dish cards on menu.html
    document.querySelectorAll('.luxury-dish-card, .menu-item-card, .dish-card').forEach(card => {
      // Find the add-to-cart button to extract dish-id
      const addBtn = card.querySelector('[data-add-to-cart]');
      const dishId = addBtn ? addBtn.getAttribute('data-id') : null;
      const dishName = addBtn ? addBtn.getAttribute('data-name') : null;

      const targetId = dishId || dishName;
      if (!targetId) return;

      // Bind Details button inside this card
      const detailsBtn = card.querySelector('a[href*="menu-details"], .btn-outline-secondary');
      if (detailsBtn && !detailsBtn.dataset.boundDetails) {
        detailsBtn.dataset.boundDetails = 'true';
        detailsBtn.dataset.dishId = targetId;
        detailsBtn.addEventListener('click', (e) => {
          e.preventDefault();
          openDishDetails(targetId);
        });
      }

      // Bind title link inside this card
      const titleLink = card.querySelector('.dish-card-title a, h3 a, h4 a, .dish-title a');
      if (titleLink && !titleLink.dataset.boundDetails) {
        titleLink.dataset.boundDetails = 'true';
        titleLink.dataset.dishId = targetId;
        titleLink.addEventListener('click', (e) => {
          e.preventDefault();
          openDishDetails(targetId);
        });
      }

      // Bind clickable image box
      const imgBox = card.querySelector('.dish-card-img-box, .dish-card-img');
      if (imgBox && !imgBox.dataset.boundDetails) {
        imgBox.dataset.boundDetails = 'true';
        imgBox.style.cursor = 'pointer';
        imgBox.setAttribute('title', 'Click to view dish details');
        imgBox.addEventListener('click', (e) => {
          // don't trigger if clicked on child button or pill
          if (e.target.closest('button, a, .dish-card-price-pill, .dish-card-dietary-badge')) return;
          openDishDetails(targetId);
        });
      }
    });
  }

  /**
   * If on menu-details.html, dynamically populate page content based on ?dish=
   */
  function handleStandalonePage() {
    if (!window.location.pathname.includes('menu-details.html')) return;

    const urlParams = new URLSearchParams(window.location.search);
    const dishParam = urlParams.get('dish') || urlParams.get('id');
    if (!dishParam) return;

    const dish = findDish(dishParam);
    if (!dish) return;

    document.title = `${dish.name} - Dish Details | Green Haven Restaurant`;

    // Page title & sub
    const pageTitle = document.querySelector('.page-header h1, h1.display-4');
    if (pageTitle) pageTitle.textContent = dish.name;

    const specTitle = document.querySelector('.dish-spec-title');
    if (specTitle) specTitle.textContent = dish.name;

    const mainImg = document.getElementById('mainDishImg');
    if (mainImg) {
      mainImg.src = dish.image;
      mainImg.alt = dish.name;
    }

    const priceEl = document.querySelector('.dish-price-large');
    if (priceEl) priceEl.textContent = `$${parseFloat(dish.price).toFixed(2)}`;

    const descEl = document.querySelector('.dish-lead-desc');
    if (descEl) descEl.textContent = dish.description;

    const subEl = document.querySelector('.page-header .section-sub');
    if (subEl) subEl.innerHTML = `<i class="bi bi-award"></i> ${escapeHtml(dish.category)}`;

    // Update dietary pills on standalone page
    const headerPills = document.querySelector('.dish-header-card .d-flex.flex-wrap.gap-2');
    if (headerPills && dish.dietary) {
      headerPills.innerHTML = dish.dietary.map(d => `
        <span class="dietary-pill ${d.class || 'pill-vegan'}">
          <span class="pill-icon">${d.icon || '🌱'}</span> ${escapeHtml(d.label)}
        </span>
      `).join('');
    }

    // Update ingredients on standalone page
    const ingredientsList = document.querySelector('.dish-ingredients-card ul');
    if (ingredientsList && dish.ingredients) {
      ingredientsList.innerHTML = dish.ingredients.map(ing => `
        <li class="col-sm-6 d-flex align-items-center">
          <i class="bi bi-check2-circle text-success me-2 flex-shrink-0"></i>
          <span>${escapeHtml(ing)}</span>
        </li>
      `).join('');
    }

    // Update thumbnails if available
    const thumbs = document.querySelectorAll('.dish-thumb-img');
    thumbs.forEach(thumb => {
      thumb.src = dish.image;
      thumb.dataset.src = dish.image;
    });

    // Nutrition in table if exists
    const nutriTable = document.querySelector('.nutri-table');
    if (nutriTable && dish.nutrition) {
      const rows = nutriTable.querySelectorAll('tr');
      rows.forEach(r => {
        const th = r.querySelector('th')?.textContent.toLowerCase() || '';
        const td = r.querySelector('td');
        if (!td) return;
        if (th.includes('calorie')) td.textContent = dish.nutrition.calories;
        if (th.includes('protein')) td.textContent = dish.nutrition.protein;
        if (th.includes('carbohydrate') || th.includes('carb')) td.textContent = dish.nutrition.carbs;
        if (th.includes('fat')) td.textContent = dish.nutrition.fat;
      });
    }

    // Bind Add to Cart button on standalone page
    const btnAdd = document.getElementById('btnAddToCartDetails');
    const qtyInput = document.getElementById('dishQty');
    if (btnAdd) {
      btnAdd.onclick = (e) => {
        e.preventDefault();
        const qty = parseInt(qtyInput ? qtyInput.value : 1, 10) || 1;
        if (window.GH_Cart) {
          window.GH_Cart.addToCart({
            id: dish.id,
            name: dish.name,
            price: dish.price,
            image: dish.image,
            category: dish.category
          }, qty, true);
        }
      };
    }
  }

  // Expose global API
  window.GH_Dishes = {
    catalog: DISHES_CATALOG,
    open: openDishDetails,
    getFavorites,
    isFavorite,
    toggleFavorite,
    bindTriggers: bindDishTriggers
  };

  // Auto-init on load
  function init() {
    ensureModalExists();
    bindDishTriggers();
    handleStandalonePage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
