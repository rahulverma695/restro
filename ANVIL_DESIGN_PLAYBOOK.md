# ANVIL LABS DESIGN PLAYBOOK: The "Software Forgery" Style Guide
Drop this file into any coding agent's chat to instantly instruct them to build websites and web apps with the premium, high-integrity "Anvil Labs" design system.

---

## 1. Core Aesthetic Philosophy: "The Software Forgery"
Instead of generic corporate designs, this design system treats software like a physical, heavy-duty craft. It represents high performance, mathematical precision, and lifetime durability.

*   **Dark-Mode First:** Slate carbon-steel backgrounds (`#08090a` to `#0b0c0e`) representing physical metal.
*   **Depth & Dimensionality:** Soft glassmorphic surfaces (`rgba(18,20,24,0.7)`) with thin semi-transparent borders.
*   **Dynamic Glows:** Color-coded lighting elements (copper/amber for business ops, electric cyan/indigo for science and engineering).
*   **Interactive Physics:** Micro-animations, hover transitions, and live interactive mathematical sandboxes.

---

## 2. Global CSS Variables (Design Tokens)

Place these root variables at the top of your stylesheet:

```css
:root {
  /* Core Base Colors */
  --bg-color: #08090a;
  --bg-card: rgba(18, 20, 24, 0.7);
  --bg-card-hover: rgba(26, 30, 37, 0.9);
  --border-color: rgba(255, 255, 255, 0.08);
  --border-hover: rgba(255, 255, 255, 0.16);
  --text-primary: #f3f4f6;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;

  /* Accent Track 1: Operations/Commerce (Amber/Bronze) */
  --ops-color-primary: #d97706;
  --ops-color-secondary: #f59e0b;
  --ops-glow: rgba(217, 119, 6, 0.15);
  --ops-glow-intense: rgba(217, 119, 6, 0.35);
  --ops-gradient: linear-gradient(135deg, #b45309, #d97706, #f59e0b);

  /* Accent Track 2: Computational/Engineering (Cyan/Indigo) */
  --eng-color-primary: #06b6d4;
  --eng-color-secondary: #6366f1;
  --eng-glow: rgba(6, 182, 212, 0.15);
  --eng-glow-intense: rgba(6, 182, 212, 0.35);
  --eng-gradient: linear-gradient(135deg, #0369a1, #06b6d4, #6366f1);

  /* Accent Track 3: Cyber-Physical/Hardware (Ruby/Crimson) */
  --hw-color-primary: #e11d48;
  --hw-color-secondary: #f43f5e;
  --hw-glow: rgba(225, 29, 72, 0.15);
  --hw-glow-intense: rgba(225, 29, 72, 0.35);
  --hw-gradient: linear-gradient(135deg, #9f1239, #e11d48, #f43f5e);

  /* Fonts */
  --font-sans: var(--font-geist-sans), Inter, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), Courier New, monospace;

  /* Transitions */
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 3. Verified Layout Patterns

### A. The Hover-Expanding Split Hero
Used when presenting two distinct options, niches, or tracks on a single screen. On hover, the active side flexes open smoothly while shifting background glows.

**HTML Structure:**
```html
<section class="hero">
  <div class="hero-divider"></div>
  
  <div class="hero-side side-ops">
    <div class="side-glow"></div>
    <div class="side-badge">...</div>
    <h1 class="side-title">Left Option</h1>
    <p class="side-desc">Description text...</p>
    <button class="btn-forge">CTA Button</button>
  </div>
  
  <div class="hero-side side-eng">
    <div class="side-glow"></div>
    <div class="side-badge">...</div>
    <h1 class="side-title">Right Option</h1>
    <p class="side-desc">Description text...</p>
    <button class="btn-forge">CTA Button</button>
  </div>
</section>
```

**Key CSS:**
```css
.hero {
  display: flex;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at center, #111317 0%, #08090a 100%);
}
.hero-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.7s cubic-bezier(0.25, 1, 0.5, 1);
  position: relative;
  cursor: pointer;
}
.hero-side:hover {
  flex: 1.25; /* Expands active side */
}
.side-glow {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.15;
  transition: all 0.7s ease;
  pointer-events: none;
}
.side-ops .side-glow { background: var(--ops-color-primary); }
.side-eng .side-glow { background: var(--eng-color-primary); }

.side-ops:hover .side-glow {
  opacity: 0.35;
  transform: scale(1.2) translate(-10%, -10%);
}
.side-eng:hover .side-glow {
  opacity: 0.35;
  transform: scale(1.2) translate(10%, 10%);
}
```

---

### B. Glassmorphic Content Card
Used for grid layouts showcasing features, pricing, or details. It is styled with subtle borders and reacts to hover by sliding upwards and glowing.

**HTML Structure:**
```html
<div class="forge-card">
  <div class="card-icon"><svg>...</svg></div>
  <h3 class="card-title">Feature Title</h3>
  <p class="card-desc">Detailed copy description...</p>
</div>
```

**Key CSS:**
```css
.forge-card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 40px;
  overflow: hidden;
  transition: var(--transition-smooth);
}
.forge-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: transparent;
  transition: var(--transition-smooth);
}
.forge-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-hover);
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
}
/* Apply gradient on active theme hover */
.ops-theme .forge-card:hover::before { background: var(--ops-gradient); }
.eng-theme .forge-card:hover::before { background: var(--eng-gradient); }
```

---

### C. The Interactive Sandbox (Calculator / Simulator)
For maximum engagement, provide a live demo area displaying parameter sliders linked to charts and an "AI Auditor/Doctor" box.

**Key Layout Rules:**
1.  **Grid layout:** Split 400px sidebar controls and 1fr visual output.
2.  **Modern Sliders:** Clean horizontal line, custom circular thumb with hover scaling.
3.  **Active Telemetry Output:** A chart (like Recharts) using gridlines and bright color-coded plots (`var(--eng-color-primary)` and `var(--accent-gold)`).
4.  **AI Script Doctor Feedback Box:** A dedicated block at the bottom labeled with an amber lightbulb that gives contextual feedback as the parameters shift.

**Custom Range Slider Styling:**
```css
.slider-input {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
}
.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--eng-color-primary);
  box-shadow: 0 0 10px var(--eng-glow-intense);
  cursor: pointer;
  transition: transform 0.1s ease;
}
.slider-input::-webkit-slider-thumb:hover {
  transform: scale(1.25);
}
```

---

### D. Premium Buttons
CTA elements should translate upwards on hover and project colored glows matching the track.

```css
.btn-forge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 36px;
  font-weight: 700;
  border-radius: 8px;
  transition: var(--transition-smooth);
}
.side-ops .btn-forge {
  background: var(--ops-gradient);
  color: #000;
  box-shadow: 0 4px 20px var(--ops-glow);
}
.side-ops .btn-forge:hover {
  box-shadow: 0 4px 30px var(--ops-glow-intense);
  transform: translateY(-3px);
}
```

---

## 4. Guidelines for Future Agent Chats
Copy and paste this paragraph into your prompt when launching a new feature:

> **System Styling Instructions:**
> "Initialize files inside a dark mode theme matching the Anvil style guide. Apply a background color of `#08090a`, text of `#f3f4f6`, and card backings using `rgba(18, 20, 24, 0.7)` with `1px solid rgba(255, 255, 255, 0.08)` borders. Highlight interactive elements using either an Amber glow (`#d97706` for commerce/ops) or a Cyan glow (`#06b6d4` for science/engineering). Ensure all container boxes utilize smooth transform translations on hover and range inputs utilize glowing circular thumbs."
