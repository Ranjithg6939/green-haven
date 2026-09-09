# 🌿 Antigravity Minimalist Geometric Background - Light & Dark Engine

A clean, modern organic eco-design interactive website background built with HTML5 Canvas, CSS, and Vanilla JavaScript.

Features a perfectly aligned geometric grid of leaf icons and square dots in structured rows & columns, dual light/dark themes, antigravity floating dynamics, rotational sway, and 4 rich mouse interaction modes.

---

## 🎨 Dual Mode Themes & Typography

### ☀️ Light Mode
- **Canvas Background**: Soft Mint Green (`#98FF98`) to Aqua (`#E0FFF9`) radial blend
- **Font Color**: Dark Green (`#006400`) for headings & Charcoal Gray (`#333333`) for text → *Maximum Clarity*
- **Grid Nodes**: Dark Green (`#006400`), Soft Mint (`#98FF98`), Aqua (`#00CED1`), Soft Beige (`#F5F5DC`), White Glow (`#FFFFFF80`)
- **Text Separation**: Subtle luminous white-aqua separation glow behind headings for crisp readability above canvas grid nodes

### 🌙 Dark Mode
- **Canvas Background**: Deep Emerald (`#013220`) to Forest Green (`#145A32`) radial blend
- **Font Color**: Crisp White (`#FFFFFF`) for headings & Soft Beige (`#F5F5DC`) for text → *High Contrast*
- **Grid Nodes**: Luminous Neon Green (`#00FF7F`) Soft Glow, Deep Forest (`#145A32`), Aqua (`#00CED1`), Soft Beige (`#F5F5DC`), White Glow (`#FFFFFF80`)
- **Text Glow**: Light green / neon green outer glow (`#00FF7F`) for striking contrast and readability

---

## 🖱️ 4 Mouse Interaction Modes

| Mode | Key Behavior | Description |
| :--- | :--- | :--- |
| **1. Ripple Waves** | `rippleOnMouseMove: true` | Continuous sinusoidal water ripples expand from cursor movements and clicks, deflecting nodes with real-time wave physics. |
| **2. Parallax Floating** | `parallaxEnabled: true` | Grid nodes shift slightly in multi-depth parallax layers opposite to cursor position, creating 3D spatial depth. |
| **3. Hover Glow** | `hoverGlowEnabled: true` | Nodes dynamically brighten, expand, and emit luminous halos as the cursor glides nearby. |
| **4. Magnetic Pull** | `magneticPullEnabled: true` | Icons are gently drawn toward the cursor before smoothly rebounding via Hooke's spring-damper elasticity ($F = -k \cdot \Delta x - c \cdot v$). |
| **🌀 Combined Flow** | `interactionMode: 'combined'` | Harmonizes all 4 dynamics simultaneously for a silky, organic fluid atmosphere. |

---

## 🚀 Quick Start

### 1. Include Files

```html
<!-- Background Canvas Element -->
<canvas id="water-bg-canvas" class="water-particles-canvas"></canvas>

<!-- Component Script -->
<script src="assets/js/water-particles.js"></script>
```

### 2. Initialize in JavaScript

```javascript
// Initialize with Light/Dark Theme & Combined Mouse Interactions
const bg = new WaterParticleField({
  canvas: '#water-bg-canvas',
  theme: 'light',                // 'light' or 'dark'
  gridMode: true,                // Aligned rows and columns
  gridSpacing: 48,               // Grid node spacing in px
  shape: 'leaf',                 // 'leaf' | 'square' | 'mixed'
  interactionMode: 'combined'    // 'combined' | 'ripple' | 'parallax' | 'hover' | 'magnetic'
});
```

---

## ⚙️ Configuration Options

```javascript
const bg = new WaterParticleField({
  canvas: '#water-bg-canvas',
  theme: 'light',                         // 'light' | 'dark'
  shape: 'leaf',                          // 'leaf' | 'square' | 'mixed'
  gridMode: true,                         // Aligned rows and columns
  gridSpacing: 48,                        // Node spacing in px
  particleRadius: { min: 3.0, max: 5.4 }, // Scaling size range

  // Mouse Dynamics
  interactionMode: 'combined',            // 'combined' | 'ripple' | 'parallax' | 'hover' | 'magnetic'
  parallaxEnabled: true,                  // Enable multi-layer depth parallax shift
  parallaxFactor: 0.035,                  // Parallax displacement coefficient
  hoverGlowEnabled: true,                 // Nodes brighten when cursor passes nearby
  hoverGlowRadius: 190,                   // Distance within which hover glow activates (px)
  magneticPullEnabled: false,             // If true, cursor attracts nodes
  magneticForce: 0.85,                    // Attraction strength

  // Fluid Dynamics
  springTension: 0.038,                   // Elasticity returning nodes to grid alignment
  damping: 0.87,                          // Viscous friction
  influenceRadius: 180,                   // Cursor interaction radius (px)
  pushForce: 0.72,                        // Displacement force
  wakeForce: 0.35,                        // Velocity wake drag

  // Ripple Waves
  rippleOnMouseMove: true,                // Emit trailing ripples on move
  moveRippleDistance: 32,                 // Minimum move distance for ripples (px)
  rippleOnClick: true,                    // Click/tap shockwaves
  rippleSpeed: 4.2,                       // Propagation speed (px/frame)
  rippleAmplitude: 22                     // Deflection wave height (px)
});
```

---

## 🛠️ Instance API Methods

```javascript
// Switch theme dynamically ('light' or 'dark')
bg.setTheme('dark');

// Change grid geometry shape ('leaf', 'square', 'mixed')
bg.setShape('square');

// Switch mouse interaction mode ('combined', 'ripple', 'parallax', 'hover', 'magnetic')
bg.setInteractionMode('magnetic');

// Programmatically trigger a water ripple
bg.triggerRipple(window.innerWidth / 2, window.innerHeight / 2, 1.5);

// Pause or Resume animation
bg.pause();
bg.resume();

// Clean up memory
bg.destroy();
```
