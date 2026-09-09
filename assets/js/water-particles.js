/**
 * Antigravity Minimalist Geometric Background - Aligned Leaf & Square Dot Grid Engine
 * 
 * Clean, modern organic eco-design canvas background supporting:
 * 
 * ☀️ Light Mode:
 * - Canvas Background: Soft Mint Green (#98FF98) & Aqua (#E0FFF9)
 * - Dot / Leaf Palette: Dark Green (#006400), Fresh Mint (#98FF98), Aqua (#00CED1), Soft Beige (#F5F5DC), White Glow (#FFFFFF80)
 * 
 * 🌙 Dark Mode:
 * - Canvas Background: Deep Emerald (#013220) & Forest Green (#145A32)
 * - Dot / Leaf Palette: Neon Green (#00FF7F) Soft Glow, Deep Forest (#145A32), Aqua (#00CED1), Soft Beige (#F5F5DC), White Glow (#FFFFFF80)
 * 
 * 🖱️ Mouse Interactions:
 * 1. Ripple Effect: Dynamic wave canvas distortion expanding from cursor movement & clicks
 * 2. Parallax Effect: Multi-depth layers shifting smoothly opposite to cursor position
 * 3. Hover Glow: Proximity brightening where leaves/dots illuminate as cursor passes nearby
 * 4. Magnetic Pull / Antigravity: Configurable magnetic pull and fluid spring-damper restoration
 * 
 * @author Antigravity
 * @version 5.0.0
 */

class WaterParticleField {
  /**
   * ☀️ Light Mode Floral Aesthetic Palette (Matching User's Reference Image)
   */
  static LIGHT_PALETTE = [
    {
      name: 'blushPink',
      label: 'Rose Quartz Blush',
      color: '#EFAEC1',           // Rose Blush Pink (#EFAEC1)
      glow: 'rgba(239, 174, 193, 0.55)',
      rim: 'rgba(224, 145, 168, 0.88)',
      highlight: 'rgba(255, 240, 246, 0.98)'
    },
    {
      name: 'softMint',
      label: 'Botanical Soft Mint',
      color: '#A8E6CF',           // Pastel Botanical Mint (#A8E6CF)
      glow: 'rgba(168, 230, 207, 0.50)',
      rim: 'rgba(120, 200, 170, 0.85)',
      highlight: 'rgba(240, 255, 248, 0.98)'
    },
    {
      name: 'warmPeach',
      label: 'Warm Peach & Amber',
      color: '#F8C29D',           // Warm Peach & Amber (#F8C29D)
      glow: 'rgba(248, 194, 157, 0.50)',
      rim: 'rgba(235, 170, 130, 0.85)',
      highlight: 'rgba(255, 245, 235, 0.98)'
    },
    {
      name: 'deepCharcoal',
      label: 'Espresso Charcoal',
      color: '#2D2A26',           // Elegant Deep Espresso Charcoal (#2D2A26)
      glow: 'rgba(45, 42, 38, 0.35)',
      rim: 'rgba(45, 42, 38, 0.85)',
      highlight: 'rgba(245, 235, 225, 0.95)'
    },
    {
      name: 'whiteGlow',
      label: 'White Glow Highlight',
      color: 'rgba(255, 255, 255, 0.70)',
      glow: 'rgba(255, 255, 255, 0.55)',
      rim: 'rgba(255, 255, 255, 0.90)',
      highlight: 'rgba(255, 255, 255, 1.0)'
    }
  ];

  /**
   * 🌙 Dark Mode Eco Palette (Neon Green Soft Glow & Deep Emerald)
   */
  static DARK_PALETTE = [
    {
      name: 'neonGreen',
      label: 'Neon Green Glow',
      color: '#00FF7F',
      glow: 'rgba(0, 255, 127, 0.60)',
      rim: 'rgba(0, 255, 127, 0.90)',
      highlight: 'rgba(220, 255, 235, 0.98)'
    },
    {
      name: 'deepForest',
      label: 'Deep Forest Green',
      color: '#145A32',
      glow: 'rgba(20, 90, 50, 0.50)',
      rim: 'rgba(30, 130, 75, 0.85)',
      highlight: 'rgba(160, 240, 190, 0.95)'
    },
    {
      name: 'aquaBlue',
      label: 'Aqua Blue Glow',
      color: '#00CED1',
      glow: 'rgba(0, 206, 209, 0.55)',
      rim: 'rgba(0, 206, 209, 0.85)',
      highlight: 'rgba(200, 255, 255, 0.98)'
    },
    {
      name: 'softBeige',
      label: 'Soft Beige Warmth',
      color: '#F5F5DC',
      glow: 'rgba(245, 245, 220, 0.45)',
      rim: 'rgba(245, 245, 220, 0.80)',
      highlight: 'rgba(255, 255, 250, 0.98)'
    },
    {
      name: 'whiteGlow',
      label: 'White Glow Highlight',
      color: 'rgba(255, 255, 255, 0.65)',
      glow: 'rgba(255, 255, 255, 0.55)',
      rim: 'rgba(255, 255, 255, 0.90)',
      highlight: 'rgba(255, 255, 255, 1.0)'
    }
  ];

  static DEFAULT_BUBBLE_PALETTE = WaterParticleField.LIGHT_PALETTE;

  /**
   * Default configuration options
   */
  static DEFAULTS = {
    // Canvas & Container
    canvas: null,                    // Canvas element or selector
    container: null,                 // Parent container
    transparent: false,              // If true, lets HTML body background show through
    theme: 'light',                  // 'light' | 'dark'

    // Grid & Geometry
    gridMode: true,                  // Perfectly aligned rows and columns
    gridSpacing: 48,                 // Distance between grid nodes (px)
    shape: 'leaf',                   // 'leaf' | 'square' | 'mixed'
    particleRadius: { min: 3.0, max: 5.4 }, // Node size scaling range

    // Palette & Visuals
    bubblePalette: null,             // Custom or theme palette
    mouseGlowColor: 'rgba(239, 174, 193, 0.16)', // Ambient cursor glow aura (Soft Blush Rose)
    rippleColor: 'rgba(255, 255, 255, 0.65)',    // White glow ripple color

    // Background gradient defaults: Multi-point ambient floral mesh gradient (Warm Ivory, Blush Pink, Pastel Mint)
    bgGradient: {
      type: 'mesh',
      base: '#FAF8F5',
      pink: 'rgba(252, 226, 232, 0.85)',
      mint: 'rgba(224, 244, 232, 0.80)'
    },

    // 🖱️ Mouse Interaction Modes (Disabled: Zero cursor move background animation)
    interactive: false,              // Disabled: Cursor movement has zero effect on background
    interactionMode: 'none',         // 'none' | 'ripple' | 'parallax' | 'hover' | 'magnetic' | 'combined'
    parallaxEnabled: false,          // Disabled: No parallax movement on cursor
    parallaxFactor: 0,
    hoverGlowEnabled: false,         // Disabled: No hover glow on cursor proximity
    hoverGlowRadius: 0,
    hoverScaleBoost: 1.0,
    magneticPullEnabled: false,      // Disabled: No magnetic pull
    magneticForce: 0,

    // Ambient Floating Physics (Peaceful, subtle organic drift without cursor reaction)
    springTension: 0.038,            // Hooke's k: elasticity returning nodes to grid alignment
    damping: 0.87,                   // Viscous drag / friction
    influenceRadius: 0,              // Zero cursor disturbance radius
    pushForce: 0,                    // Zero cursor wake displacement
    wakeForce: 0,                    // Zero cursor velocity drag
    floatSpeed: 0.0008,              // Peaceful ambient floating speed
    floatAmplitude: 4.0,             // Subtle gentle floating displacement (px)

    // Ripple Waves (Disabled on mouse move & click)
    rippleOnMouseMove: false,        // Disabled: No ripples trailing cursor movement
    moveRippleDistance: 9999,
    moveRippleThrottleMs: 9999,
    rippleOnClick: false,            // Disabled: No ripples on click
    rippleSpeed: 4.2,
    rippleMaxRadius: 360,
    rippleAmplitude: 0,
    rippleWavelength: 58,
    rippleDecay: 0.978,

    // Visual Enhancements
    drawConnections: false,          // Connect nearby nodes with subtle tension web
    connectionDistance: 56,          // Max distance for tension web lines
    connectionOpacity: 0.08,         // Max opacity for tension links
    retina: true                     // HiDPI / Retina device scaling
  };

  /**
   * @param {Object} userOptions - Custom configuration options
   */
  constructor(userOptions = {}) {
    this.options = this._deepMerge(WaterParticleField.DEFAULTS, userOptions);
    
    // Auto configure theme defaults if bubblePalette or bgGradient not explicitly provided
    if (!this.options.bubblePalette) {
      this.options.bubblePalette = this.options.theme === 'dark' 
        ? WaterParticleField.DARK_PALETTE 
        : WaterParticleField.LIGHT_PALETTE;
    }

    this._initCanvas();
    this._initPhysicsState();
    this._initEvents();
    this._createParticles();
    this._startLoop();
  }

  /**
   * Helper to deeply merge configuration objects
   * @private
   */
  _deepMerge(target, source) {
    const output = { ...target };
    for (const key in source) {
      if (source[key] !== undefined) {
        if (
          typeof source[key] === 'object' &&
          source[key] !== null &&
          !Array.isArray(source[key]) &&
          typeof target[key] === 'object' &&
          !Array.isArray(target[key])
        ) {
          output[key] = this._deepMerge(target[key], source[key]);
        } else {
          output[key] = source[key];
        }
      }
    }
    return output;
  }

  /**
   * Initialize canvas element and 2D context
   * @private
   */
  _initCanvas() {
    if (typeof this.options.canvas === 'string') {
      this.canvas = document.querySelector(this.options.canvas);
    } else if (this.options.canvas instanceof HTMLCanvasElement) {
      this.canvas = this.options.canvas;
    }

    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'water-particles-canvas';
      const container = typeof this.options.container === 'string'
        ? document.querySelector(this.options.container)
        : (this.options.container || document.body);
      container.appendChild(this.canvas);
    }

    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.zIndex = '-1';
    this.canvas.style.pointerEvents = 'none';

    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.dpr = this.options.retina ? (window.devicePixelRatio || 1) : 1;

    this.width = 0;
    this.height = 0;
    this._updateDimensions();
  }

  /**
   * Initialize internal physics tracking state
   * @private
   */
  _initPhysicsState() {
    this.particles = [];
    this.ripples = [];
    this.time = 0;
    this.isRunning = false;
    this.rafId = null;

    this.lastMoveRippleX = -9999;
    this.lastMoveRippleY = -9999;
    this.lastMoveRippleTime = 0;

    this.mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      vx: 0,
      vy: 0,
      lastX: -9999,
      lastY: -9999,
      isHovered: false,
      down: false
    };

    this._glowSprites = {};
    this._createGlowSprites();
  }

  /**
   * Utility to convert hex or rgb string to rgba
   * @private
   */
  _toRgba(colorStr, alpha = 1) {
    if (!colorStr) return `rgba(152, 255, 152, ${alpha})`;
    if (colorStr.startsWith('rgba')) {
      return colorStr.replace(/[\d\.]+\)$/g, `${alpha})`);
    }
    if (colorStr.startsWith('rgb(')) {
      return colorStr.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
    if (colorStr.startsWith('#')) {
      let hex = colorStr.replace('#', '');
      if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
      } else if (hex.length === 8) {
        const r = parseInt(hex.substring(0, 2), 16) || 0;
        const g = parseInt(hex.substring(2, 4), 16) || 0;
        const b = parseInt(hex.substring(4, 6), 16) || 0;
        const a = (parseInt(hex.substring(6, 8), 16) / 255) * alpha;
        return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
      }
      const r = parseInt(hex.substring(0, 2), 16) || 0;
      const g = parseInt(hex.substring(2, 4), 16) || 0;
      const b = parseInt(hex.substring(4, 6), 16) || 0;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return colorStr;
  }

  /**
   * Pre-render high-performance offscreen sprites for both leaf icons and square dots
   * @private
   */
  _createGlowSprites() {
    this._glowSprites = {};
    const palette = this.options.bubblePalette || WaterParticleField.LIGHT_PALETTE;
    const shape = this.options.shape || 'leaf';

    palette.forEach((item, index) => {
      // 1. Leaf Icon Sprite
      if (shape === 'leaf' || shape === 'mixed') {
        const spriteCanvas = document.createElement('canvas');
        const size = 56 * this.dpr;
        spriteCanvas.width = size;
        spriteCanvas.height = size;
        const sCtx = spriteCanvas.getContext('2d');
        const center = size / 2;

        const baseColor = item.color;
        const glowColor = item.glow || item.color;
        const rimColor = item.rim || item.color;
        const highlightColor = item.highlight || 'rgba(255, 255, 255, 0.95)';

        // Ambient Luminescent Outer Glow
        const glowGrad = sCtx.createRadialGradient(center, center, size * 0.12, center, center, center * 0.95);
        glowGrad.addColorStop(0, this._toRgba(glowColor, 0.65));
        glowGrad.addColorStop(0.45, this._toRgba(glowColor, 0.25));
        glowGrad.addColorStop(0.85, this._toRgba(glowColor, 0.05));
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        sCtx.fillStyle = glowGrad;
        sCtx.fillRect(0, 0, size, size);

        // Botanical Leaf Silhouette
        const leafW = size * 0.25;
        const leafH = size * 0.40;

        sCtx.save();
        sCtx.translate(center, center);

        sCtx.beginPath();
        sCtx.moveTo(0, -leafH * 0.52);
        sCtx.bezierCurveTo(leafW * 0.85, -leafH * 0.22, leafW * 0.85, leafH * 0.28, 0, leafH * 0.52);
        sCtx.bezierCurveTo(-leafW * 0.85, leafH * 0.28, -leafW * 0.85, -leafH * 0.22, 0, -leafH * 0.52);
        sCtx.closePath();

        const leafGrad = sCtx.createLinearGradient(0, -leafH * 0.5, 0, leafH * 0.5);
        leafGrad.addColorStop(0, this._toRgba(highlightColor, 0.90));
        leafGrad.addColorStop(0.4, this._toRgba(baseColor, 0.75));
        leafGrad.addColorStop(1, this._toRgba(rimColor, 0.90));

        sCtx.fillStyle = leafGrad;
        sCtx.fill();

        sCtx.strokeStyle = this._toRgba(rimColor, 0.95);
        sCtx.lineWidth = Math.max(1, 1.1 * this.dpr);
        sCtx.stroke();

        // Central Midrib Spine Vein
        sCtx.strokeStyle = this._toRgba(highlightColor, 0.70);
        sCtx.lineWidth = Math.max(0.8, 0.9 * this.dpr);
        sCtx.beginPath();
        sCtx.moveTo(0, -leafH * 0.40);
        sCtx.lineTo(0, leafH * 0.42);
        sCtx.stroke();

        // Top-Left Specular White Glint
        const glintGrad = sCtx.createRadialGradient(-leafW * 0.2, -leafH * 0.22, 0, -leafW * 0.2, -leafH * 0.22, leafW * 0.45);
        glintGrad.addColorStop(0, this._toRgba(highlightColor, 0.98));
        glintGrad.addColorStop(0.5, this._toRgba(highlightColor, 0.35));
        glintGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        sCtx.fillStyle = glintGrad;
        sCtx.beginPath();
        sCtx.arc(-leafW * 0.2, -leafH * 0.22, leafW * 0.45, 0, Math.PI * 2);
        sCtx.fill();

        sCtx.restore();

        this._glowSprites[`leaf_${item.name || index}`] = spriteCanvas;
        this._glowSprites[`leaf_${index}`] = spriteCanvas;
      }

      // 2. Square Dot Sprite
      if (shape === 'square' || shape === 'mixed') {
        const sqCanvas = document.createElement('canvas');
        const size = 52 * this.dpr;
        sqCanvas.width = size;
        sqCanvas.height = size;
        const sCtx = sqCanvas.getContext('2d');
        const center = size / 2;

        const baseColor = item.color;
        const glowColor = item.glow || item.color;
        const rimColor = item.rim || item.color;
        const highlightColor = item.highlight || 'rgba(255, 255, 255, 0.95)';

        // Ambient Radial Glow
        const glowGrad = sCtx.createRadialGradient(center, center, size * 0.12, center, center, center * 0.95);
        glowGrad.addColorStop(0, this._toRgba(glowColor, 0.70));
        glowGrad.addColorStop(0.45, this._toRgba(glowColor, 0.28));
        glowGrad.addColorStop(0.85, this._toRgba(glowColor, 0.05));
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        sCtx.fillStyle = glowGrad;
        sCtx.fillRect(0, 0, size, size);

        // Precision Geometric Square Dot
        const sqSize = size * 0.28;
        const halfSq = sqSize * 0.5;
        const cornerR = Math.max(1, 1.5 * this.dpr);

        sCtx.save();
        sCtx.translate(center, center);

        sCtx.beginPath();
        sCtx.roundRect(-halfSq, -halfSq, sqSize, sqSize, cornerR);
        sCtx.closePath();

        const sqGrad = sCtx.createLinearGradient(-halfSq, -halfSq, halfSq, halfSq);
        sqGrad.addColorStop(0, this._toRgba(highlightColor, 0.90));
        sqGrad.addColorStop(0.35, this._toRgba(baseColor, 0.78));
        sqGrad.addColorStop(1, this._toRgba(rimColor, 0.90));

        sCtx.fillStyle = sqGrad;
        sCtx.fill();

        sCtx.strokeStyle = this._toRgba(rimColor, 0.95);
        sCtx.lineWidth = Math.max(1, 1.1 * this.dpr);
        sCtx.stroke();

        // Top-Left Bevel Highlight
        const glintGrad = sCtx.createRadialGradient(-halfSq * 0.45, -halfSq * 0.45, 0, -halfSq * 0.45, -halfSq * 0.45, halfSq * 0.9);
        glintGrad.addColorStop(0, this._toRgba(highlightColor, 0.98));
        glintGrad.addColorStop(0.5, this._toRgba(highlightColor, 0.35));
        glintGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        sCtx.fillStyle = glintGrad;
        sCtx.fillRect(-halfSq, -halfSq, sqSize * 0.7, sqSize * 0.7);

        sCtx.restore();

        this._glowSprites[`square_${item.name || index}`] = sqCanvas;
        this._glowSprites[`square_${index}`] = sqCanvas;
      }
    });
  }

  /**
   * Resize canvas buffer with HiDPI support
   * @private
   */
  _updateDimensions() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || window.innerWidth;
    this.height = rect.height || window.innerHeight;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    if (this.ctx) {
      this.ctx.scale(this.dpr, this.dpr);
    }
  }

  /**
   * Generate geometric rows and columns of leaf / square dot nodes
   * @private
   */
  _createParticles() {
    this.particles = [];
    const palette = this.options.bubblePalette || WaterParticleField.LIGHT_PALETTE;
    const paletteLen = palette.length;

    const spacing = this.options.gridSpacing || 48;
    const cols = Math.floor(this.width / spacing) + 1;
    const rows = Math.floor(this.height / spacing) + 1;

    const startX = (this.width - (cols - 1) * spacing) / 2;
    const startY = (this.height - (rows - 1) * spacing) / 2;

    const shapeSetting = this.options.shape || 'leaf';

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const originX = startX + c * spacing;
        const originY = startY + r * spacing;

        const depth = 0.40 + (((r * cols + c) * 9301 + 49297) % 233280 / 233280) * 0.60;
        const radius = (this.options.particleRadius.min + 
          depth * (this.options.particleRadius.max - this.options.particleRadius.min));

        const paletteIdx = (r * 2 + c + (r % 3)) % paletteLen;
        const paletteItem = palette[paletteIdx];
        
        let nodeShape = shapeSetting;
        if (shapeSetting === 'mixed') {
          nodeShape = (r + c) % 2 === 0 ? 'leaf' : 'square';
        }

        const spriteKey = `${nodeShape}_${paletteItem.name || paletteIdx}`;
        const baseAngle = ((c % 2 === 0 ? 1 : -1) * 0.22) + ((r % 2 === 0 ? 0.08 : -0.08));

        this.particles.push({
          gridCol: c,
          gridRow: r,
          nodeShape,
          originX,
          originY,
          x: originX,
          y: originY,
          vx: 0,
          vy: 0,
          radius,
          baseRadius: radius,
          depth,
          paletteIdx,
          paletteItem,
          spriteKey,
          baseAngle,
          angle: baseAngle,
          alpha: 0.35 + depth * 0.45,
          baseAlpha: 0.35 + depth * 0.45,
          phaseX: (c * 0.42 + r * 0.32) % (Math.PI * 2),
          phaseY: (r * 0.42 + c * 0.32) % (Math.PI * 2),
          phaseSpeedX: (0.7 + (c % 3) * 0.2) * this.options.floatSpeed,
          phaseSpeedY: (0.7 + (r % 3) * 0.2) * this.options.floatSpeed,
          driftRadius: this.options.floatAmplitude * (0.6 + depth * 0.5),
          excitation: 0,
          hoverGlow: 0,
          parallaxOffsetX: 0,
          parallaxOffsetY: 0
        });
      }
    }
  }

  /**
   * Event listeners
   * @private
   */
  _initEvents() {
    this._onMouseMove = this._handleMouseMove.bind(this);
    this._onMouseLeave = this._handleMouseLeave.bind(this);
    this._onClick = this._handleClick.bind(this);
    this._onTouchStart = this._handleTouchStart.bind(this);
    this._onTouchMove = this._handleTouchMove.bind(this);
    this._onTouchEnd = this._handleTouchEnd.bind(this);
    this._onResize = this._debounce(this._handleResize.bind(this), 120);
    this._onVisibilityChange = this._handleVisibilityChange.bind(this);

    if (this.options.interactive) {
      window.addEventListener('mousemove', this._onMouseMove, { passive: true });
      window.addEventListener('mouseleave', this._onMouseLeave, { passive: true });
      window.addEventListener('click', this._onClick, { passive: true });
      window.addEventListener('touchstart', this._onTouchStart, { passive: true });
      window.addEventListener('touchmove', this._onTouchMove, { passive: true });
      window.addEventListener('touchend', this._onTouchEnd, { passive: true });
    }

    window.addEventListener('resize', this._onResize);
    document.addEventListener('visibilitychange', this._onVisibilityChange);
  }

  _debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Handle mouse move (triggers trailing ripples + updates cursor momentum)
   * @private
   */
  _handleMouseMove(e) {
    this.mouse.targetX = e.clientX;
    this.mouse.targetY = e.clientY;

    if (!this.mouse.isHovered) {
      this.mouse.x = this.mouse.targetX;
      this.mouse.y = this.mouse.targetY;
      this.mouse.lastX = this.mouse.targetX;
      this.mouse.lastY = this.mouse.targetY;
      this.mouse.isHovered = true;
      this.lastMoveRippleX = e.clientX;
      this.lastMoveRippleY = e.clientY;
      this.lastMoveRippleTime = performance.now();
    } else if (this.options.rippleOnMouseMove) {
      const now = performance.now();
      const dx = e.clientX - this.lastMoveRippleX;
      const dy = e.clientY - this.lastMoveRippleY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist >= this.options.moveRippleDistance && (now - this.lastMoveRippleTime) >= this.options.moveRippleThrottleMs) {
        this.triggerRipple(e.clientX, e.clientY, 0.65);
        this.lastMoveRippleX = e.clientX;
        this.lastMoveRippleY = e.clientY;
        this.lastMoveRippleTime = now;
      }
    }
  }

  _handleMouseLeave() {
    this.mouse.targetX = -9999;
    this.mouse.targetY = -9999;
    this.mouse.isHovered = false;
  }

  _handleClick(e) {
    if (!this.options.rippleOnClick) return;
    this.triggerRipple(e.clientX, e.clientY, 1.35);
  }

  _handleTouchStart(e) {
    if (!e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    this.mouse.targetX = touch.clientX;
    this.mouse.targetY = touch.clientY;
    this.mouse.x = this.mouse.targetX;
    this.mouse.y = this.mouse.targetY;
    this.mouse.lastX = this.mouse.targetX;
    this.mouse.lastY = this.mouse.targetY;
    this.mouse.isHovered = true;

    if (this.options.rippleOnClick) {
      this.triggerRipple(this.mouse.x, this.mouse.y, 1.2);
    }
  }

  _handleTouchMove(e) {
    if (!e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    this.mouse.targetX = touch.clientX;
    this.mouse.targetY = touch.clientY;
    this.mouse.isHovered = true;

    if (this.options.rippleOnMouseMove) {
      const now = performance.now();
      const dx = touch.clientX - this.lastMoveRippleX;
      const dy = touch.clientY - this.lastMoveRippleY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist >= this.options.moveRippleDistance && (now - this.lastMoveRippleTime) >= this.options.moveRippleThrottleMs) {
        this.triggerRipple(touch.clientX, touch.clientY, 0.65);
        this.lastMoveRippleX = touch.clientX;
        this.lastMoveRippleY = touch.clientY;
        this.lastMoveRippleTime = now;
      }
    }
  }

  _handleTouchEnd() {
    this.mouse.targetX = -9999;
    this.mouse.targetY = -9999;
    this.mouse.isHovered = false;
  }

  _handleResize() {
    this._updateDimensions();
    this._createParticles();
  }

  _handleVisibilityChange() {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  }

  /**
   * Public Method: Trigger expanding circular water ripples
   */
  triggerRipple(x, y, strength = 1.0) {
    const isDark = this.options.theme === 'dark';
    const rippleColors = isDark ? [
      'rgba(0, 255, 127, 0.70)',   // Neon Green Glow (#00FF7F)
      'rgba(0, 206, 209, 0.70)',   // Aqua Blue (#00CED1)
      'rgba(255, 255, 255, 0.75)', // White Glow (#FFFFFF80)
      'rgba(245, 245, 220, 0.65)'  // Soft Beige (#F5F5DC)
    ] : [
      'rgba(255, 255, 255, 0.75)', // White Glow (#FFFFFF80)
      'rgba(152, 255, 152, 0.70)', // Soft Mint Green (#98FF98)
      'rgba(0, 206, 209, 0.70)',   // Aqua Blue (#00CED1)
      'rgba(0, 100, 0, 0.55)',     // Dark Green (#006400)
      'rgba(245, 245, 220, 0.65)'  // Soft Beige (#F5F5DC)
    ];

    const chosenColor = rippleColors[Math.floor(Math.random() * rippleColors.length)];

    this.ripples.push({
      x,
      y,
      radius: 0,
      maxRadius: this.options.rippleMaxRadius * Math.min(1.5, Math.max(0.6, strength)),
      speed: this.options.rippleSpeed,
      amplitude: this.options.rippleAmplitude * strength,
      wavelength: this.options.rippleWavelength,
      life: 1.0,
      decay: this.options.rippleDecay,
      color: chosenColor
    });
  }

  /**
   * Main animation loop
   * @private
   */
  _startLoop() {
    this.isRunning = true;
    let lastTimestamp = performance.now();

    const loop = (timestamp) => {
      if (!this.isRunning) return;

      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
      lastTimestamp = timestamp;

      this._updatePhysics(dt);
      this._render();

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  /**
   * Update particle physics: Antigravity, Parallax, Hover Glow, Magnetic Pull / Radial Wake, and Spring-Damper
   * @private
   */
  _updatePhysics(dt) {
    this.time += dt * 60;

    if (this.mouse.isHovered) {
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.22;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.22;
      this.mouse.vx = this.mouse.x - this.mouse.lastX;
      this.mouse.vy = this.mouse.y - this.mouse.lastY;
      this.mouse.lastX = this.mouse.x;
      this.mouse.lastY = this.mouse.y;
    } else {
      this.mouse.vx *= 0.82;
      this.mouse.vy *= 0.82;
    }

    const mouseSpeed = Math.sqrt(this.mouse.vx * this.mouse.vx + this.mouse.vy * this.mouse.vy);
    const mouseNormVx = mouseSpeed > 0.001 ? this.mouse.vx / mouseSpeed : 0;
    const mouseNormVy = mouseSpeed > 0.001 ? this.mouse.vy / mouseSpeed : 0;

    // 1. Process Active Ripples
    for (let rIdx = this.ripples.length - 1; rIdx >= 0; rIdx--) {
      const rip = this.ripples[rIdx];
      rip.radius += rip.speed;
      rip.life *= rip.decay;

      if (rip.radius > rip.maxRadius || rip.life < 0.015) {
        this.ripples.splice(rIdx, 1);
      }
    }

    // 2. Physics Parameters
    const inflRadius = this.options.influenceRadius;
    const inflRadiusSq = inflRadius * inflRadius;
    const hoverGlowRadius = this.options.hoverGlowRadius || 190;
    const hoverGlowRadiusSq = hoverGlowRadius * hoverGlowRadius;
    const k = this.options.springTension;
    const damping = this.options.damping;
    const pushForce = this.options.pushForce;
    const wakeForce = this.options.wakeForce;
    const isMagnetic = this.options.magneticPullEnabled || this.options.interactionMode === 'magnetic';
    const magneticForce = this.options.magneticForce || 0.85;
    const parallaxFactor = this.options.parallaxFactor || 0.035;

    // Viewport center for parallax
    const centerX = this.width * 0.5;
    const centerY = this.height * 0.5;
    const normMouseOffsetX = this.mouse.isHovered ? (this.mouse.x - centerX) : 0;
    const normMouseOffsetY = this.mouse.isHovered ? (this.mouse.y - centerY) : 0;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // A. Antigravity floating harmonic oscillation
      const floatX = Math.sin(this.time * p.phaseSpeedX + p.phaseX) * p.driftRadius +
                     Math.cos(this.time * p.phaseSpeedX * 0.5) * (p.driftRadius * 0.3);
      const floatY = Math.cos(this.time * p.phaseSpeedY + p.phaseY) * p.driftRadius +
                     Math.sin(this.time * p.phaseSpeedY * 0.5) * (p.driftRadius * 0.3);

      // B. Parallax Shift: Nodes shift slightly opposite to mouse movement based on depth
      let parallaxShiftX = 0;
      let parallaxShiftY = 0;
      if (this.options.parallaxEnabled && this.mouse.isHovered) {
        const depthFactor = (1.25 - p.depth * 0.7); // Closer layers shift more
        parallaxShiftX = -normMouseOffsetX * parallaxFactor * depthFactor;
        parallaxShiftY = -normMouseOffsetY * parallaxFactor * depthFactor;
      }

      const targetX = p.originX + floatX + parallaxShiftX;
      const targetY = p.originY + floatY + parallaxShiftY;

      // C. Mouse Proximity Dynamics (Hover Glow, Magnetic Pull, or Fluid Wake Push)
      if (this.mouse.isHovered) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const distSq = dx * dx + dy * dy;

        // Hover Glow calculation
        if (this.options.hoverGlowEnabled && distSq < hoverGlowRadiusSq && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const glowProximity = Math.pow(1 - dist / hoverGlowRadius, 1.8);
          p.hoverGlow += (glowProximity - p.hoverGlow) * 0.24;
        } else {
          p.hoverGlow *= 0.88;
        }

        // Kinetic interaction: Push or Magnetic Pull
        if (distSq < inflRadiusSq && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const factor = (1 - dist / inflRadius);
          const easeFactor = factor * factor;

          const normX = dx / dist;
          const normY = dy / dist;

          if (isMagnetic) {
            // Magnetic Pull: Attracts icons gently towards the cursor
            const pull = easeFactor * magneticForce * 3.8 * p.depth;
            p.vx -= normX * pull;
            p.vy -= normY * pull;
          } else {
            // Antigravity Fluid Repulsion & Wake Drag
            const radialPush = easeFactor * pushForce * 3.4 * p.depth;
            p.vx += normX * radialPush;
            p.vy += normY * radialPush;

            if (mouseSpeed > 0.2) {
              const wakeEffect = easeFactor * wakeForce * Math.min(mouseSpeed, 12) * p.depth;
              p.vx += mouseNormVx * wakeEffect;
              p.vy += mouseNormVy * wakeEffect;
            }
          }

          p.excitation = Math.min(1.0, p.excitation + easeFactor * 0.45);
        }
      } else {
        p.hoverGlow *= 0.88;
      }

      // D. Sinusoidal Ripple Wave Deflection
      for (let rIdx = 0; rIdx < this.ripples.length; rIdx++) {
        const rip = this.ripples[rIdx];
        const rdx = p.x - rip.x;
        const rdy = p.y - rip.y;
        const rDist = Math.sqrt(rdx * rdx + rdy * rdy);

        if (rDist > 0.01) {
          const distFromCrest = rDist - rip.radius;
          const halfWavelength = rip.wavelength * 0.5;

          if (Math.abs(distFromCrest) < halfWavelength) {
            const phase = (distFromCrest / halfWavelength) * Math.PI;
            const waveAmp = Math.sin(phase) * rip.amplitude * rip.life * (1 - rip.radius / rip.maxRadius);
            
            const rNormX = rdx / rDist;
            const rNormY = rdy / rDist;

            p.vx += rNormX * waveAmp * 0.18;
            p.vy += rNormY * waveAmp * 0.18;
            p.excitation = Math.min(1.0, p.excitation + Math.abs(waveAmp) * 0.04 * rip.life);
            p.hoverGlow = Math.min(1.0, p.hoverGlow + Math.abs(waveAmp) * 0.03);
          }
        }
      }

      // E. Spring-Damper returning node to target position
      const springX = (targetX - p.x) * k;
      const springY = (targetY - p.y) * k;

      p.vx = (p.vx + springX) * damping;
      p.vy = (p.vy + springY) * damping;

      p.x += p.vx;
      p.y += p.vy;

      // F. Angular Sway & Tilt
      p.angle = p.baseAngle + (p.vx * 0.04) + Math.sin(this.time * p.phaseSpeedX) * 0.06;
      p.excitation *= 0.94;
    }
  }

  /**
   * Render canvas frame
   * @private
   */
  _render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const isDark = this.options.theme === 'dark';

    // 1. Draw Canvas Background Gradient
    if (this.options.transparent) {
      ctx.clearRect(0, 0, w, h);
    } else {
      const bgGrad = this.options.bgGradient;
      if (bgGrad && bgGrad.type === 'mesh') {
        // Multi-point ambient floral mesh gradient (Warm Ivory, Top-Left Blush Pink, Bottom-Right Soft Mint)
        ctx.fillStyle = bgGrad.base || '#FAF8F5';
        ctx.fillRect(0, 0, w, h);

        // Top-Left Rose Quartz Blush Pink Glow
        const pinkGrad = ctx.createRadialGradient(0, 0, 40, w * 0.22, h * 0.22, Math.max(w, h) * 0.82);
        pinkGrad.addColorStop(0, bgGrad.pink || 'rgba(252, 226, 232, 0.85)');
        pinkGrad.addColorStop(0.45, 'rgba(254, 240, 245, 0.45)');
        pinkGrad.addColorStop(0.85, 'rgba(250, 248, 245, 0.08)');
        pinkGrad.addColorStop(1, 'rgba(250, 248, 245, 0)');
        ctx.fillStyle = pinkGrad;
        ctx.fillRect(0, 0, w, h);

        // Bottom-Right Soft Pastel Botanical Mint / Sage Glow
        const mintGrad = ctx.createRadialGradient(w, h, 40, w * 0.78, h * 0.78, Math.max(w, h) * 0.82);
        mintGrad.addColorStop(0, bgGrad.mint || 'rgba(224, 244, 232, 0.80)');
        mintGrad.addColorStop(0.45, 'rgba(238, 249, 242, 0.40)');
        mintGrad.addColorStop(0.85, 'rgba(250, 248, 245, 0.08)');
        mintGrad.addColorStop(1, 'rgba(250, 248, 245, 0)');
        ctx.fillStyle = mintGrad;
        ctx.fillRect(0, 0, w, h);
      } else if (bgGrad && bgGrad.type === 'radial') {
        const centerX = this.mouse.isHovered ? this.mouse.x : w * 0.5;
        const centerY = this.mouse.isHovered ? this.mouse.y : h * 0.45;
        const maxR = Math.max(w, h) * 0.95;
        const gradient = ctx.createRadialGradient(centerX, centerY, 40, centerX, centerY, maxR);
        bgGrad.stops.forEach(s => gradient.addColorStop(s.offset, s.color));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      } else if (bgGrad && bgGrad.type === 'linear') {
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.stops.forEach(s => gradient.addColorStop(s.offset, s.color));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    }

    // 2. Cursor Ambient Glow Aura (Only drawn when interactive is enabled)
    if (this.options.interactive && this.mouse.isHovered && !this.options.transparent && this.options.influenceRadius > 0) {
      const auraColor = this.options.mouseGlowColor || (isDark ? 'rgba(0, 255, 127, 0.16)' : 'rgba(239, 174, 193, 0.18)');
      const cursorGlow = ctx.createRadialGradient(
        this.mouse.x, this.mouse.y, 0,
        this.mouse.x, this.mouse.y, this.options.influenceRadius * 1.35
      );
      cursorGlow.addColorStop(0, auraColor);
      cursorGlow.addColorStop(0.5, isDark ? 'rgba(0, 255, 127, 0.04)' : 'rgba(252, 226, 232, 0.05)');
      cursorGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = cursorGlow;
      ctx.beginPath();
      ctx.arc(this.mouse.x, this.mouse.y, this.options.influenceRadius * 1.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Expanding Ripple Waves (Canvas Wave Distortion Effect)
    if (this.ripples.length > 0) {
      ctx.save();
      for (let i = 0; i < this.ripples.length; i++) {
        const rip = this.ripples[i];
        const alpha = rip.life * (1 - rip.radius / rip.maxRadius) * 0.42;
        if (alpha <= 0) continue;

        const ringColor = rip.color || this.options.rippleColor || 'rgba(255, 255, 255, 0.50)';

        // Primary outer shockwave crest
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = this._toRgba(ringColor, alpha);
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Secondary harmonic water ripple ring
        if (rip.radius > rip.wavelength * 0.35) {
          ctx.lineWidth = 1.0;
          ctx.strokeStyle = this._toRgba(isDark ? '#00FF7F' : '#EFAEC1', alpha * 0.55);
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, Math.max(0, rip.radius - rip.wavelength * 0.32), 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // 4. Surface Tension Web Connections (Optional)
    if (this.options.drawConnections) {
      ctx.save();
      const maxConnDist = this.options.connectionDistance;
      const maxConnDistSq = maxConnDist * maxConnDist;

      for (let i = 0; i < this.particles.length; i++) {
        const p1 = this.particles[i];
        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const cdx = p1.x - p2.x;
          const cdy = p1.y - p2.y;
          const distSq = cdx * cdx + cdy * cdy;

          if (distSq < maxConnDistSq) {
            const dist = Math.sqrt(distSq);
            const connAlpha = (1 - dist / maxConnDist) * this.options.connectionOpacity * (p1.depth + p2.depth) * 0.5;
            ctx.strokeStyle = this._toRgba(isDark ? '#00FF7F' : '#EFAEC1', connAlpha);
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    // 5. Render Aligned Leaf Icons / Square Dots Grid with Hover Glow Brightening
    const spriteBaseSize = 56;
    const hoverScaleBoost = this.options.hoverScaleBoost || 1.35;

    ctx.save();
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Compute dynamic alpha with hover glow brightness boost
      const glowBoost = p.hoverGlow * 0.45;
      const currentAlpha = Math.min(0.98, p.baseAlpha + p.excitation * 0.35 + glowBoost);

      // Compute dynamic scale with hover proximity expansion
      const scaleBoost = 1.0 + (hoverScaleBoost - 1.0) * p.hoverGlow + p.excitation * 0.30;
      const scale = (p.radius / this.options.particleRadius.max) * scaleBoost;
      const drawSize = spriteBaseSize * scale;
      const halfSize = drawSize * 0.5;

      ctx.globalAlpha = currentAlpha;
      const sprite = this._glowSprites[p.spriteKey] || 
                     this._glowSprites[`leaf_${p.paletteIdx}`] || 
                     this._glowSprites[`square_${p.paletteIdx}`] ||
                     Object.values(this._glowSprites)[0];

      if (sprite) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.drawImage(
          sprite,
          -halfSize,
          -halfSize,
          drawSize,
          drawSize
        );
        ctx.restore();
      } else {
        ctx.fillStyle = isDark ? '#00FF7F' : '#EFAEC1';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /**
   * Public Method: Switch theme between 'light' and 'dark'
   */
  setTheme(themeName) {
    if (themeName === 'dark') {
      this.setOptions({
        theme: 'dark',
        bubblePalette: WaterParticleField.DARK_PALETTE,
        mouseGlowColor: 'rgba(0, 255, 127, 0.16)',
        rippleColor: 'rgba(0, 255, 127, 0.70)',
        bgGradient: {
          type: 'radial',
          stops: [
            { offset: 0.0, color: '#145A32' },
            { offset: 0.55, color: '#0A2D19' },
            { offset: 1.0, color: '#013220' }
          ]
        }
      });
    } else {
      this.setOptions({
        theme: 'light',
        bubblePalette: WaterParticleField.LIGHT_PALETTE,
        mouseGlowColor: 'rgba(239, 174, 193, 0.16)',
        rippleColor: 'rgba(255, 255, 255, 0.70)',
        bgGradient: {
          type: 'mesh',
          base: '#FAF8F5',
          pink: 'rgba(252, 226, 232, 0.85)',
          mint: 'rgba(224, 244, 232, 0.80)'
        }
      });
    }
  }

  /**
   * Public Method: Set mouse interaction mode
   * @param {'ripple' | 'parallax' | 'hover' | 'magnetic' | 'combined'} mode
   */
  setInteractionMode(mode) {
    this.options.interactionMode = mode;
    switch (mode) {
      case 'ripple':
        this.options.rippleOnMouseMove = true;
        this.options.parallaxEnabled = false;
        this.options.hoverGlowEnabled = false;
        this.options.magneticPullEnabled = false;
        break;
      case 'parallax':
        this.options.rippleOnMouseMove = false;
        this.options.parallaxEnabled = true;
        this.options.hoverGlowEnabled = false;
        this.options.magneticPullEnabled = false;
        break;
      case 'hover':
        this.options.rippleOnMouseMove = false;
        this.options.parallaxEnabled = false;
        this.options.hoverGlowEnabled = true;
        this.options.magneticPullEnabled = false;
        break;
      case 'magnetic':
        this.options.rippleOnMouseMove = true;
        this.options.parallaxEnabled = true;
        this.options.hoverGlowEnabled = true;
        this.options.magneticPullEnabled = true;
        break;
      case 'combined':
      default:
        this.options.rippleOnMouseMove = true;
        this.options.parallaxEnabled = true;
        this.options.hoverGlowEnabled = true;
        this.options.magneticPullEnabled = false;
        break;
    }
  }

  /**
   * Public Method: Set node shape ('leaf' | 'square' | 'mixed')
   */
  setShape(shape) {
    this.options.shape = shape;
    this._createGlowSprites();
    this._createParticles();
  }

  /**
   * Public Method: Update options dynamically
   */
  setOptions(newOptions = {}) {
    this.options = this._deepMerge(this.options, newOptions);
    this._createGlowSprites();

    if (newOptions.gridSpacing || newOptions.particleRadius || newOptions.bubblePalette || newOptions.shape || newOptions.theme) {
      this._createParticles();
    }
  }

  pause() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resume() {
    if (!this.isRunning) {
      this._startLoop();
    }
  }

  resize() {
    this._handleResize();
  }

  getStats() {
    return {
      particleCount: this.particles.length,
      activeRipples: this.ripples.length,
      width: this.width,
      height: this.height,
      dpr: this.dpr,
      isHovered: this.mouse.isHovered,
      theme: this.options.theme,
      shape: this.options.shape,
      interactionMode: this.options.interactionMode
    };
  }

  destroy() {
    this.pause();
    
    if (this.options.interactive) {
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('mouseleave', this._onMouseLeave);
      window.removeEventListener('click', this._onClick);
      window.removeEventListener('touchstart', this._onTouchStart);
      window.removeEventListener('touchmove', this._onTouchMove);
      window.removeEventListener('touchend', this._onTouchEnd);
    }
    
    window.removeEventListener('resize', this._onResize);
    document.removeEventListener('visibilitychange', this._onVisibilityChange);

    if (this.canvas && this.canvas.parentElement) {
      if (this.canvas.classList.contains('water-particles-canvas')) {
        this.canvas.parentElement.removeChild(this.canvas);
      }
    }

    this.particles = [];
    this.ripples = [];
    this._glowSprites = {};
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WaterParticleField;
} else if (typeof window !== 'undefined') {
  window.WaterParticleField = WaterParticleField;
}
