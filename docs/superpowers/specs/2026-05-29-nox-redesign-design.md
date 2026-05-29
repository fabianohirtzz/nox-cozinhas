# NOX Cozinhas — Redesign "Atelier Escuro Refinado"

**Date:** 2026-05-29
**Status:** Approved design (pending spec review) → next step: implementation plan
**Scope:** Full visual remodel of the existing single-page site at `nox-project/`, keeping the vanilla HTML/CSS/JS stack.

---

## 1. Goal & intent

Evolve the NOX landing page from a text-only, hard-edged "factory-floor" grid into a **premium, cinematic "stainless-steel atelier"** — keeping the brand's technical authority (dark palette, signal-yellow, monospace data, real specs) while:

1. **Softening the geometry** — rounded corners, curves, floating pieces, light/shadow depth (deliberate override of clientex-design's "square by default" rule).
2. **Introducing real imagery** — the site is currently 100% typographic; add the client's real product photos (shot on a stainless-steel backdrop) and general/atmosphere images.
3. **Replacing the "AI-default" feel** — kill the flat, hairline-welded grid of bordered cards with emoji; introduce editorial layout, motion, and visual richness.
4. **New exclusive typography** — drop Bebas Neue (and avoid Inter/Roboto/Montserrat) for Clash Display + General Sans.

**Success criteria:** the page reads as a high-end, distinctive industrial brand (not a generic AI template or a stock-photo SaaS landing); all 4 photographed product lines are showcased with galleries; every image asset is placed; motion is rich but respects `prefers-reduced-motion`; the site remains a no-build static site.

---

## 2. Constraints

- **Stack:** vanilla `index.html` + `assets/css/style.css` + `assets/js/main.js`. No framework, no bundler, no React, no 21st.dev (that skill is React-only).
- **Language:** pt-BR, technical industrial register (per clientex-design voice rules — keep real specs: AISI 304/316/430, Solda TIG, ANVISA RDC 50, 6 meses garantia).
- **Assets exist** at the project ROOT (`./images/`, `./products/`) and must be copied into `nox-project/assets/` so the site is self-contained.
- **Motion** library (`motion@12.40.0`) already installed; load as ESM.

---

## 3. Visual language (the new NOX idiom)

### 3.1 Palette — evolved, still dark
Keep the warm near-black ladder, cream type, and signal-yellow. **Add** soft shadow/glow tokens and a subtle steel gradient for elevated/floating surfaces.

```
--bg:      #070707   --bg2: #0d0d0d   --bg3: #141414   --bg4: #1a1a1a
--text:    #ece8e0   --muted: #64605a  --steel: #8a8f96  --faint: #232323
--accent:  #ffc500   --accent2: #ffd633
--border:  rgba(255,255,255,0.06)   --border2: rgba(255,255,255,0.10)
status dots (care panel only): ok #639922 · no #E24B4A

NEW:
--steel-grad: linear-gradient(145deg, #16181a 0%, #0d0d0d 55%, #141416 100%);  /* elevated surface echoing inox */
--shadow-sm: 0 4px 16px rgba(0,0,0,0.35);
--shadow-md: 0 16px 40px rgba(0,0,0,0.45);
--shadow-lg: 0 32px 80px rgba(0,0,0,0.55);
--glow-accent: 0 0 0 1px rgba(255,197,0,0.10), 0 12px 40px rgba(255,197,0,0.12);
--glow-soft: 0 0 60px rgba(140,143,150,0.06);  /* steel halo behind product photos */
```
Yellow stays a **signal**, never a wash (fills ≤ ~0.10 alpha except the solid button).

### 3.2 Typography
```
--font-display: 'Clash Display', sans-serif;   /* headings — Fontshare */
--font-body:    'General Sans', sans-serif;     /* body / UI — Fontshare */
--font-mono:    'JetBrains Mono', monospace;    /* technical data — kept brand asset */
```
Load in `<head>`:
```html
<link rel="preconnect" href="https://api.fontshare.com" crossorigin>
<link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=general-sans@300,400,500,600&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```
**Voice shift:** titles move from condensed ALL-CAPS (Bebas) to **mixed-case Clash Display**, more editorial/sophisticated, keeping the brand gesture of **one yellow accent word per title**. Eyebrows stay uppercase letter-spaced Barlow→General Sans with the 28px yellow hairline rule. Mono reserved for specs/tags/badges/coords only.

### 3.3 Geometry — softened (the headline change)
```
--r-xs: 6px;  --r-sm: 10px;  --r-md: 16px;  --r-lg: 24px;  --r-xl: 32px;  --r-pill: 999px;
```
- Chips/tags → pill; cards → `--r-lg`; large panels (form, gallery, table) → `--r-xl`.
- **Curved section dividers** (SVG arcs/waves) between major blocks.
- Replace the **hairline-welded grid** (cards joined by 1px seams — the most "AI-grid" element) with **spaced floating cards**: `--steel-grad` fill, thin border, `--shadow-md`, subtle hover lift + `--glow-accent`.

### 3.4 Depth, texture, icons
- Product photos (inox backdrop) sit in rounded frames with `--glow-soft` halo + radial highlight — they appear to float on the dark.
- Global grain overlay **kept** (opacity ≤ 0.03, never animated).
- Depth now via soft light/shadow, not only the bg-ladder.
- **Emoji removed.** Outline SVG icons (Lucide-style, 1.5 stroke, `currentColor`) in `--accent`/`--muted` for sectors, contact, diferenciais, footer.

---

## 4. Page architecture (top → bottom)

| # | Section | Evolution | Image(s) |
|---|---|---|---|
| 1 | Loader + Nav | Restyled loader (Clash wordmark); glass nav, rounded, blur, outline icons | logo-nox.png |
| 2 | **Hero** | Full-bleed cinematic image + dark gradient scrim; large mixed-case Clash title (one yellow word), eyebrow, 2 CTAs; subtle scroll parallax | `banner1.jpg` |
| 3 | Marquee | Trust band, kept, softened (real specs) | — |
| 4 | **Sobre — 20 Anos** | Editorial: copy + floating rounded photo pair w/ parallax; metrics as floating cards with **count-up on scroll** | `sobre1.jpg`, `sobre2.jpg` |
| 5 | Manifesto | Typographic manifesto over dark-tinted image | `porque-a-nox.jpg` |
| 6 | Diferenciais | 6 floating rounded cards, outline SVG icons, spring hover lift+glow | `banner-sobre.jpg` (anchor) |
| 7 | Setores | 5 tabs kept; **emoji → SVG icons**; rounded panel; ambient photo | `produtos2.jpg`, `produtos3.jpg` |
| 8 | **Produtos** (restructure) | 4 product-hero cards → click opens gallery detail panel (main image + thumbnail strip + mono specs + CTA). Filters: Todos / Cocção / Refrigeração / Mobiliário | header `produtos.jpg`/`produtos1.jpg`; cards `products/*` |
| 9 | Guia Inox | Comparison table kept (strong asset), rounded panel; care panel w/ green/red dots kept | — |
| 10 | CTA strip | Big title over tinted image, 2 buttons | `produtos3.jpg` |
| 11 | Quote form | Glass rounded form, focus glow, inline confirm; left column copy + guarantee + coverage | — |
| 12 | Footer | Refined, rounded, outline icons | logo-nox.png |

### 4.1 Product data restructure (the main content change)
The real assets are **4 product lines, each with multiple angle photos**, not many single-photo SKUs:

| Line | Category (filter) | Photos | Hero / gallery |
|---|---|---|---|
| Fritadeira | Cocção | `fritadeira1-1..13` (13) | flagship — full gallery |
| Mobiliário | Mobiliário | `mobiliario1-1..10` (10) | gallery |
| Fogão | Cocção | `fogao1-1..4` (4) | gallery |
| Refrigeração | Refrigeração | `refrigeracao1-1..4` (4) | gallery |

`main.js` product data is rebuilt around these 4 lines: each record = `{ id, nome, categoria, hero, galeria[], specs[], descricao }`. Detail panel shows main image + thumbnail strip (swap on click, crossfade) + mono spec rows + "Solicitar Orçamento" → #quote. Filter change re-renders grid and closes any open detail. (Additional spec-only items can be added later if the client wants more breadth.)

---

## 5. Motion & interactions

Use **Motion v12** (skill: motion-vanilla) where CSS can't express it; CSS for the rest. **Every JS animation gated behind a `prefers-reduced-motion` check** (fall back to final state).

- **Hero:** image parallax on scroll (`scroll()`); staged title cascade on load.
- **Scroll reveals:** subtle spring settle (weight, not bounce) replacing flat fades.
- **Cards:** staggered entrance (`stagger()`); hover lift+glow via spring (`bounce ≤ 0.12`).
- **Metrics:** count-up on enter (single-value `animate(0, target, {onUpdate})`).
- **Product gallery:** thumbnail click → crossfade main image; detail open → smooth reveal + scroll-into-view.
- **Curved dividers:** SVG between sections.
- **Kept & restyled:** custom cursor (dot + lagging ring), loader, scroll-progress bar, marquee, grain.
- **Buttons:** accessible `press()` feedback (keyboard included).

Brand eases: `--ease: cubic-bezier(0.16,1,0.3,1)` (entrances), `--ease-in: cubic-bezier(0.7,0,0.84,0)` (exits). Durations ≤ ~1s per state change.

### Interactions
- **Setores:** active tab rebuilds panel from a `SETORES` data record; active state = yellow accent.
- **Form:** focus → yellow border + low-alpha glow ring; submit → inline confirmation (no reload), restating "Retorno em até 24h".
- **Filters:** chip selection re-renders product grid and clears stale open detail.

---

## 6. Technical plan

- **Files:** keep `index.html`, `assets/css/style.css`, `assets/js/main.js`. Full rewrite of CSS (new tokens) and HTML (new structure); `main.js` **refactored to an ES module**, inline `onclick=""` replaced by `addEventListener` (cleaner, same behavior).
- **Assets:** copy `./images/` → `nox-project/assets/images/` and `./products/` → `nox-project/assets/products/`. All `<img>` get `loading="lazy"` (except hero), explicit `width`/`height` (avoid CLS), `decoding="async"`, descriptive `alt`.
- **Fonts:** Fontshare API (Clash Display + General Sans) + Google (JetBrains Mono).
- **Motion:** loaded as ESM, pinned `motion@12.40.0` (CDN, with local `node_modules` ESM as fallback). Animation code in the module.
- **Accessibility:** visible focus, `alt` text, color contrast on dark, full `prefers-reduced-motion` support, keyboard-accessible gallery/tabs/buttons.

---

## 7. Out of scope (YAGNI)
React migration · 21st.dev components · CMS · build-time image optimization (use lazy-load + dimensions) · carousel/slider libraries (gallery & tabs are custom) · color-palette change (kept dark) · new copy beyond what new sections require.

---

## 8. Open / deferrable items
- Exact mono face (JetBrains Mono assumed; swappable).
- Whether to add spec-only products beyond the 4 photographed lines (client may provide more later).
- Image-to-section assignments are a first pass; reassignable in implementation ("se eu não gostar, alteramos depois").
