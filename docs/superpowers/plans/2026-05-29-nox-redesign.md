# NOX Redesign — "Atelier Escuro Refinado" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remodel the existing NOX single-page site into a premium, cinematic "stainless-steel atelier" — softened geometry, real imagery, new typography (Clash Display + General Sans), Motion v12 animation — while keeping the vanilla HTML/CSS/JS stack.

**Architecture:** Three files in `nox-project/` are rewritten: `index.html` (new structure + image slots), `assets/css/style.css` (new token system + rounded/floating components), `assets/js/main.js` (converted to an **ES module**; inline `onclick` removed; Motion v12 drives reveals/parallax/stagger/count-up/hover). Real assets copied from repo root into `assets/`. Design spec: `docs/superpowers/specs/2026-05-29-nox-redesign-design.md`.

**Tech Stack:** HTML5, CSS custom properties, ES modules, Motion v12 (`motion@12.40.0` via ESM CDN), Fontshare (Clash Display, General Sans) + Google Fonts (JetBrains Mono). No bundler, no test framework.

---

## Verification model (read first)

This is a static, no-build site with **no automated test framework**, and adding one would violate the project's "keep it simple / vanilla" constraint. So each task's verification is a **browser check**, not a unit test:

- **Serve locally:** from `nox-project/`, run `python -m http.server 8000` (or any static server) and open `http://localhost:8000`. A plain `file://` open breaks ES-module imports and CORS for fonts — always use the local server.
- **Per task** you will: (1) reload the page, (2) confirm the specific thing the task added renders/behaves correctly, (3) confirm **DevTools Console has zero errors**.
- The `run` and `verify` skills can drive a real browser for screenshot confirmation if desired.

Commit after every task. Branch first if on the default branch.

---

## Decisions locked in this plan

1. **Products: keep all 11 existing records** (rich real specs are a brand asset) — a superset of the spec's "4 lines." The 4 photographed lines get image galleries; the other 7 get a branded steel-gradient fallback frame. Filters stay as the 11 real categories. (User may trim later — spec §8 / "alteramos depois".)
2. **Photo → product mapping:**
   | Product `id` | Category | Gallery source |
   |---|---|---|
   | `fritadeiras` | Cocção | `fritadeira1-1..13.png` (13) |
   | `fogoes` | Cocção | `fogao1-1..4.png` (4) |
   | `refrigerador` | Refrigeração | `refrigeracao1-1..4.png` (4) |
   | `moveis` | Mobiliário | `mobiliario1-1..10.png` (10) |
   | all others | — | fallback frame (no gallery) |
3. **General images → sections** per spec §4 map (hero `banner1`, sobre `sobre1`/`sobre2`, manifesto `porque-a-nox`, diferenciais `banner-sobre`, setores `produtos2`/`produtos3`, produtos header `produtos`/`produtos1`, CTA `produtos3`).
4. **JS is a module from Task 1.** No `onclick=""` in HTML; all handlers bound via `addEventListener`/event delegation in the module.

---

## File structure

```
nox-project/
├── index.html                    # rewritten — semantic sections, image slots, no inline onclick, module script
├── assets/
│   ├── css/style.css             # rewritten — new token system, rounded/floating components, curved dividers
│   ├── js/main.js                # rewritten as ES module — data + render + Motion animations
│   ├── images/                   # general images copied here (+ existing logo-nox.png)
│   │   ├── banner1.jpg  banner-sobre.jpg  porque-a-nox.jpg
│   │   ├── produtos.jpg produtos1.jpg produtos2.jpg produtos3.jpg
│   │   └── sobre1.jpg   sobre2.jpg
│   └── products/                 # product photos copied here
│       ├── fritadeira1-1..13.png  fogao1-1..4.png
│       └── mobiliario1-1..10.png  refrigeracao1-1..4.png
```

Responsibilities: `index.html` = structure + content + image slots. `style.css` = all visual styling via tokens. `main.js` = data (`SETORES`, `PRODUTOS`), rendering (setores panel, product grid + gallery detail), and all motion (single module, one scroll listener, reduced-motion gate).

---

## Task 0: Asset prep — copy images into the project

**Files:**
- Create dir: `nox-project/assets/products/`
- Copy into: `nox-project/assets/images/`, `nox-project/assets/products/`

- [ ] **Step 1: Copy general images and product photos into the self-contained project**

```bash
# from repo root: e:/Clientes/Nox Cozinhas/nox-cozinhas-industriais-project
cp images/*.jpg "nox-project/assets/images/"
mkdir -p "nox-project/assets/products"
cp products/*.png "nox-project/assets/products/"
```

- [ ] **Step 2: Verify the files landed**

Run: `ls nox-project/assets/images/ && echo "---" && ls nox-project/assets/products/`
Expected: 9 `.jpg` + `logo-nox.png` in images/; 31 `.png` in products/ (fritadeira×13, fogao×4, mobiliario×10, refrigeracao×4).

- [ ] **Step 3: Commit**

```bash
git add nox-project/assets/images nox-project/assets/products
git commit -m "chore: vendor product and general images into nox-project/assets"
```

---

## Task 1: HTML head, fonts, Motion ESM scaffold, base token CSS

**Files:**
- Modify: `nox-project/index.html` (head + script tag)
- Modify: `nox-project/assets/css/style.css` (`:root` tokens + reset — top of file)

- [ ] **Step 1: Replace the `<head>` font links and add module script**

In `index.html`, replace the Google Fonts `<link>` (line ~8-10) with Fontshare + JetBrains Mono, and change the script tag at the bottom to a module:

```html
<!-- in <head>, after the viewport/description metas -->
<link rel="preconnect" href="https://api.fontshare.com" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=general-sans@300,400,500,600&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
```

```html
<!-- replace the closing <script src="assets/js/main.js"></script> with: -->
<script type="module" src="assets/js/main.js"></script>
```

- [ ] **Step 2: Write the new token block at the top of `style.css`**

Replace the existing `:root` block with the evolved tokens (keep palette, add radius/shadow/glow/steel, swap font families):

```css
:root {
  /* surfaces */
  --bg:#070707; --bg2:#0d0d0d; --bg3:#141414; --bg4:#1a1a1a;
  /* type colors */
  --text:#ece8e0; --muted:#64605a; --steel:#8a8f96; --faint:#232323;
  /* accent */
  --accent:#ffc500; --accent2:#ffd633;
  /* borders */
  --border:rgba(255,255,255,0.06); --border2:rgba(255,255,255,0.10);
  /* NEW: elevated steel surface + light */
  --steel-grad:linear-gradient(145deg,#16181a 0%,#0d0d0d 55%,#141416 100%);
  --shadow-sm:0 4px 16px rgba(0,0,0,0.35);
  --shadow-md:0 16px 40px rgba(0,0,0,0.45);
  --shadow-lg:0 32px 80px rgba(0,0,0,0.55);
  --glow-accent:0 0 0 1px rgba(255,197,0,0.10),0 12px 40px rgba(255,197,0,0.12);
  --glow-soft:0 0 60px rgba(140,143,150,0.06);
  /* NEW: radius scale (softened geometry) */
  --r-xs:6px; --r-sm:10px; --r-md:16px; --r-lg:24px; --r-xl:32px; --r-pill:999px;
  /* fonts */
  --font-display:'Clash Display',sans-serif;
  --font-body:'General Sans',sans-serif;
  --font-mono:'JetBrains Mono',monospace;
  /* motion */
  --ease:cubic-bezier(0.16,1,0.3,1);
  --ease-in:cubic-bezier(0.7,0,0.84,0);
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--font-body);font-weight:300;font-size:16px;line-height:1.7;background:var(--bg);color:var(--text);overflow-x:hidden;cursor:none}
img{max-width:100%;display:block}
a{color:inherit;text-decoration:none;cursor:none}
@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
```

- [ ] **Step 3: Verify fonts load**

Serve and reload. In DevTools → Network, confirm `clash-display` and `general-sans` CSS load (200). Body text should render in General Sans (not Times fallback). Console clean.

- [ ] **Step 4: Commit**

```bash
git add nox-project/index.html nox-project/assets/css/style.css
git commit -m "feat(redesign): new font stack + design token system"
```

---

## Task 2: CSS foundation — typography, layout primitives, grain, cursor, curved divider

**Files:** Modify `nox-project/assets/css/style.css`

- [ ] **Step 1: Add foundational component CSS** (typography scale, eyebrow plate, buttons, `.section`, container, grain overlay, custom cursor, scroll-progress, and a reusable curved-divider utility)

Key contracts other tasks depend on — define these class names exactly:

```css
/* layout */
.section{padding:clamp(5rem,10vw,9rem) clamp(1.5rem,5vw,5rem);position:relative}
.section--alt{background:var(--bg2)}
.section--dark{background:var(--bg3)}
.container{max-width:1320px;margin:0 auto}

/* display + titles (mixed-case Clash, one yellow word) */
.display{font-family:var(--font-display);font-weight:600;line-height:0.95;letter-spacing:-0.01em}
.section-title{font-family:var(--font-display);font-weight:600;font-size:clamp(2.6rem,6vw,5.5rem);line-height:0.98;letter-spacing:-0.01em}
.accent-word{color:var(--accent)}

/* eyebrow plate */
.section-label{font-size:0.62rem;letter-spacing:0.28em;text-transform:uppercase;color:var(--accent);display:flex;align-items:center;gap:0.7rem;margin-bottom:1.2rem;font-weight:500}
.section-label::before{content:'';width:28px;height:1px;background:var(--accent)}

/* buttons — rounded pill */
.btn-primary{display:inline-flex;align-items:center;gap:0.5rem;font-size:0.7rem;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;background:var(--accent);color:#0a0a0a;padding:1rem 1.8rem;border:none;border-radius:var(--r-pill);transition:transform .3s var(--ease),box-shadow .3s var(--ease),background .3s}
.btn-primary:hover{background:var(--accent2);transform:translateY(-2px);box-shadow:0 12px 32px rgba(255,197,0,0.3)}
.btn-ghost,.btn-outline{display:inline-flex;align-items:center;gap:0.5rem;font-size:0.7rem;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:var(--text);padding:1rem 1.8rem;border:1px solid var(--border2);border-radius:var(--r-pill);background:transparent;transition:border-color .3s,color .3s,transform .3s var(--ease)}
.btn-ghost:hover,.btn-outline:hover{border-color:var(--accent);color:var(--accent);transform:translateY(-2px)}

/* grain (kept) */
body::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:9998;opacity:0.028;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:220px 220px;mix-blend-mode:overlay}

/* custom cursor (kept) */
.cursor{width:8px;height:8px;background:var(--accent);border-radius:50%;position:fixed;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);transition:width .3s var(--ease),height .3s var(--ease),background .3s}
.cursor-ring{width:40px;height:40px;border:1px solid rgba(255,197,0,0.5);border-radius:50%;position:fixed;pointer-events:none;z-index:99998;transform:translate(-50%,-50%);transition:width .4s var(--ease),height .4s var(--ease),border-color .3s}
body.hovering .cursor{width:12px;height:12px;background:var(--accent2)}
body.hovering .cursor-ring{width:60px;height:60px;border-color:var(--accent)}
body.clicking .cursor{transform:translate(-50%,-50%) scale(0.7)}
@media (hover:none){.cursor,.cursor-ring{display:none}body{cursor:auto}a,button{cursor:pointer}}

.scroll-progress{position:fixed;top:0;left:0;height:2px;background:linear-gradient(90deg,var(--accent),var(--accent2));z-index:10001;width:0%;transform-origin:left}

/* reusable curved divider: place <div class="divider-curve"></div> between sections */
.divider-curve{position:relative;height:80px;background:inherit}
.divider-curve::before{content:'';position:absolute;left:0;right:0;top:-1px;height:80px;background:var(--bg);border-radius:0 0 50% 50%/0 0 100% 100%}
```

- [ ] **Step 2: Verify**

Reload. Headings render in Clash Display; an existing `.section-label` shows the yellow rule + tracked caps; the custom cursor (dot + ring) tracks the mouse. Console clean.

- [ ] **Step 3: Commit**

```bash
git add nox-project/assets/css/style.css
git commit -m "feat(redesign): typographic + layout foundation, rounded buttons, curved divider"
```

---

## Task 3: main.js module skeleton — cursor, loader, scroll, Motion import, reduced-motion gate

**Files:** Rewrite top of `nox-project/assets/js/main.js`

- [ ] **Step 1: Establish the module head** (Motion import, reduced-motion flag, brand eases, cursor, loader, single scroll listener). This replaces the cursor/loader/scroll blocks; keep behavior identical, add Motion import + `REDUCE` flag used by later tasks.

```js
import { animate, scroll, inView, stagger, hover, press } from "https://cdn.jsdelivr.net/npm/motion@12.40.0/+esm";

const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE = [0.16, 1, 0.3, 1];

/* CURSOR */
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e=>{mx=e.clientX;my=e.clientY;cursor.style.left=mx+'px';cursor.style.top=my+'px';});
(function loop(){rx+=(mx-rx)*0.12;ry+=(my-ry)*0.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(loop);})();
document.addEventListener('mousedown',()=>document.body.classList.add('clicking'));
document.addEventListener('mouseup',()=>document.body.classList.remove('clicking'));
const HOVER_SEL = 'a,button,.setor-tab,.prod-card,.filter-btn,.dif-item,.option-chip,.setor-prod-tag,.thumb';
function bindCursor(root=document){root.querySelectorAll(HOVER_SEL).forEach(el=>{el.addEventListener('mouseenter',()=>document.body.classList.add('hovering'));el.addEventListener('mouseleave',()=>document.body.classList.remove('hovering'));});}
bindCursor();

/* LOADER */
const loaderEl=document.getElementById('loader'),loaderLogo=document.getElementById('loader-logo'),loaderBar=document.getElementById('loader-bar'),loaderPct=document.getElementById('loader-pct');
document.body.style.overflow='hidden';
setTimeout(()=>loaderLogo.classList.add('show'),200);
let pct=0;const li=setInterval(()=>{pct+=Math.random()*18+4;if(pct>=100){pct=100;clearInterval(li);}loaderBar.style.width=pct+'%';loaderPct.textContent=Math.round(pct)+'%';if(pct>=100)setTimeout(()=>{loaderEl.classList.add('hidden');document.body.style.overflow='auto';},500);},120);

/* SCROLL: nav state + progress (single passive listener) */
const navEl=document.getElementById('nav');
if(REDUCE){
  // progress bar still useful; set width directly
  window.addEventListener('scroll',()=>{navEl.classList.toggle('scrolled',window.scrollY>60);const d=document.documentElement;document.getElementById('scroll-progress').style.width=(d.scrollTop/(d.scrollHeight-d.clientHeight)*100)+'%';},{passive:true});
}else{
  scroll(animate('#scroll-progress',{scaleX:[0,1]},{ease:'linear'}));
  window.addEventListener('scroll',()=>navEl.classList.toggle('scrolled',window.scrollY>60),{passive:true});
}
```

- [ ] **Step 2: Verify** — reload via local server. Loader runs and lifts; cursor works; scroll-progress bar fills on scroll; nav toggles `.scrolled` past 60px. **Console must show no module/import errors** (confirms the ESM CDN import works). 

- [ ] **Step 3: Commit**

```bash
git add nox-project/assets/js/main.js
git commit -m "feat(redesign): main.js as ES module with Motion import + reduced-motion gate"
```

---

## Task 4: Reveal + stagger utility (Motion) — the shared entrance system

**Files:** Modify `nox-project/assets/js/main.js`; add CSS for hidden initial state.

- [ ] **Step 1: CSS initial state** in `style.css`:

```css
[data-reveal]{opacity:0}
.reveal-done{opacity:1}
```

- [ ] **Step 2: JS reveal system** (append to module). Uses `inView`; springy settle; honors REDUCE; supports stagger groups via `[data-reveal-group]`.

```js
function reveal(){
  if(REDUCE){document.querySelectorAll('[data-reveal]').forEach(el=>el.classList.add('reveal-done'));return;}
  document.querySelectorAll('[data-reveal]').forEach(el=>{
    const stop=inView(el,()=>{const y=parseInt(el.dataset.reveal||'40',10);animate(el,{opacity:[0,1],y:[y,0]},{duration:0.7,ease:EASE});el.classList.add('reveal-done');stop();},{amount:0.2,margin:'0px 0px -60px 0px'});
  });
  document.querySelectorAll('[data-reveal-group]').forEach(group=>{
    const kids=group.querySelectorAll('[data-reveal-item]');
    const stop=inView(group,()=>{animate(kids,{opacity:[0,1],y:[24,0]},{duration:0.6,ease:EASE,delay:stagger(0.08)});kids.forEach(k=>k.classList.add('reveal-done'));stop();},{amount:0.15});
  });
}
// called once after DOM render (Task 10 product grid also re-runs reveal for dynamic nodes)
reveal();
```

Note for later tasks: mark static blocks with `data-reveal="40"` (or `60`); mark grids with `data-reveal-group` and each cell `data-reveal-item`. `[data-reveal-item]` needs `opacity:0` too:

```css
[data-reveal-item]{opacity:0}
```

- [ ] **Step 3: Verify** — temporarily add `data-reveal="40"` to an existing section block, reload, scroll to it: it fades+rises once. With OS "reduce motion" on, it appears instantly. Console clean.

- [ ] **Step 4: Commit**

```bash
git add nox-project/assets/css/style.css nox-project/assets/js/main.js
git commit -m "feat(redesign): Motion-driven reveal + stagger entrance system"
```

---

## Task 5: Loader + Nav restyle (glass, rounded)

**Files:** Modify `index.html` (loader + nav markup), `style.css` (loader + nav).

- [ ] **Step 1: HTML** — keep loader IDs (`loader`,`loader-logo`,`loader-bar`,`loader-pct`); wordmark uses display font. Nav: glass, rounded `--r-pill` container, outline-SVG hamburger for mobile is out of scope (links collapse). Markup:

```html
<div class="loader" id="loader">
  <div class="loader-logo display" id="loader-logo">N<span class="accent-word">O</span>X</div>
  <div class="loader-bar-wrap"><div class="loader-bar" id="loader-bar"></div></div>
  <div class="loader-pct" id="loader-pct">0%</div>
</div>
<nav id="nav"><div class="nav-inner">
  <a href="#home" class="nav-logo"><img src="assets/images/logo-nox.png" alt="NOX Cozinhas Industriais" width="96" height="32"></a>
  <div class="nav-links">
    <a href="#about" class="nav-link">Sobre</a><a href="#setores" class="nav-link">Setores</a>
    <a href="#produtos" class="nav-link">Produtos</a><a href="#inox" class="nav-link">Guia Inox</a>
  </div>
  <a href="#quote" class="nav-cta btn-primary">Orçamento</a>
</div></nav>
```

- [ ] **Step 2: CSS** — loader centered; nav floating glass pill:

```css
.loader{position:fixed;inset:0;background:var(--bg);z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2rem;transition:opacity .8s var(--ease),visibility .8s}
.loader.hidden{opacity:0;visibility:hidden;pointer-events:none}
.loader-logo{font-size:5rem;letter-spacing:0.04em;opacity:0;transform:translateY(20px);transition:opacity .6s,transform .6s var(--ease)}
.loader-logo.show{opacity:1;transform:none}
.loader-bar-wrap{width:200px;height:2px;background:var(--faint);border-radius:var(--r-pill);overflow:hidden}
.loader-bar{height:100%;width:0;background:var(--accent);border-radius:var(--r-pill);transition:width 1s cubic-bezier(.77,0,.18,1)}
.loader-pct{font-family:var(--font-mono);font-size:0.7rem;letter-spacing:0.2em;color:var(--muted)}
nav{position:fixed;top:1rem;left:0;right:0;z-index:9000;padding:0 clamp(1rem,4vw,3rem)}
.nav-inner{max-width:1320px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:0.7rem 0.8rem 0.7rem 1.4rem;background:rgba(13,13,13,0.6);backdrop-filter:blur(14px);border:1px solid var(--border);border-radius:var(--r-pill);transition:background .3s,border-color .3s}
nav.scrolled .nav-inner{background:rgba(7,7,7,0.92);border-color:var(--border2)}
.nav-links{display:flex;gap:1.8rem}
.nav-link{font-size:0.65rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--muted);transition:color .3s}
.nav-link:hover{color:var(--accent)}
.nav-cta{padding:0.7rem 1.3rem;font-size:0.62rem}
@media(max-width:760px){.nav-links{display:none}}
```

- [ ] **Step 3: Verify** — nav floats as a rounded glass pill, darkens on scroll; loader wordmark in Clash with yellow "O". Console clean.

- [ ] **Step 4: Commit** `feat(redesign): glass rounded nav + restyled loader`

---

## Task 6: Hero — full-bleed cinematic image + parallax

**Files:** Modify `index.html` (hero section), `style.css`, `main.js` (parallax).

- [ ] **Step 1: HTML** — replace the split hero/video placeholder with a full-bleed image hero:

```html
<section class="hero" id="home">
  <div class="hero-media"><img src="assets/images/banner1.jpg" alt="Cozinha industrial em aço inox fabricada pela NOX" class="hero-img" width="1920" height="1080"></div>
  <div class="hero-scrim"></div>
  <div class="hero-content container">
    <div class="hero-eyebrow section-label">Alvorada / RS — Desde 2005</div>
    <h1 class="hero-h1 display">Cozinhas industriais em <span class="accent-word">aço inox</span> sob medida</h1>
    <p class="hero-desc">Fabricante de móveis e equipamentos sob medida em aço inoxidável para cozinhas industriais, padarias, hospitais e laboratórios. Fabricação e envio para todo o Brasil.</p>
    <div class="hero-actions"><a href="#quote" class="btn-primary">Solicitar Orçamento →</a><a href="#produtos" class="btn-ghost">Ver Produtos</a></div>
  </div>
</section>
```

- [ ] **Step 2: CSS**:

```css
.hero{position:relative;min-height:100vh;display:flex;align-items:flex-end;overflow:hidden}
.hero-media{position:absolute;inset:-8% 0;z-index:0}
.hero-img{width:100%;height:116%;object-fit:cover;filter:grayscale(0.15) brightness(0.7)}
.hero-scrim{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(7,7,7,0.5) 0%,rgba(7,7,7,0.2) 40%,rgba(7,7,7,0.95) 100%)}
.hero-content{position:relative;z-index:2;padding-bottom:clamp(4rem,10vh,9rem);padding-top:8rem}
.hero-h1{font-size:clamp(2.8rem,7vw,7rem);max-width:14ch;margin:1rem 0 1.5rem;font-weight:600}
.hero-desc{max-width:52ch;color:#cfcabf;font-size:1rem;margin-bottom:2rem}
.hero-actions{display:flex;gap:1rem;flex-wrap:wrap}
```

- [ ] **Step 3: JS parallax** (append; gated):

```js
if(!REDUCE){
  scroll(animate('.hero-img',{y:[-40,40]},{ease:'linear'}),{target:document.querySelector('.hero'),offset:['start start','end start']});
  // staged title entrance
  animate('.hero-eyebrow',{opacity:[0,1],y:[20,0]},{duration:0.7,delay:0.2,ease:EASE});
  animate('.hero-h1',{opacity:[0,1],y:[30,0]},{duration:0.9,delay:0.35,ease:EASE});
  animate('.hero-desc',{opacity:[0,1],y:[20,0]},{duration:0.7,delay:0.55,ease:EASE});
  animate('.hero-actions',{opacity:[0,1],y:[20,0]},{duration:0.7,delay:0.7,ease:EASE});
}
```

- [ ] **Step 4: Verify** — hero fills viewport with `banner1`, dark scrim, legible Clash title with yellow "aço inox"; image drifts on scroll; title eases in after loader. Reduce-motion: static, fully visible. Console clean.

- [ ] **Step 5: Commit** `feat(redesign): cinematic full-bleed hero with parallax`

---

## Task 7: Marquee (restyle)

**Files:** `index.html` (keep content), `style.css`.

- [ ] **Step 1:** Keep the existing marquee markup (duplicated track). Restyle softer:

```css
.marquee-wrap{background:var(--bg2);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:1.1rem 0;overflow:hidden;white-space:nowrap}
.marquee-inner{display:inline-flex;align-items:center;gap:1.4rem;animation:marquee 30s linear infinite}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.mi{font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted)}
.mi.hi{color:var(--accent)}
.mi.dot{color:var(--faint)}
```

- [ ] **Step 2: Verify** — single seamless loop; mono items; yellow `.hi`. Console clean.
- [ ] **Step 3: Commit** `feat(redesign): restyle marquee trust band`

---

## Task 8: Sobre — editorial copy + floating photo pair + metric count-up

**Files:** `index.html` (about section), `style.css`, `main.js` (count-up).

- [ ] **Step 1: HTML** — copy column + a floating pair (`sobre1`,`sobre2`); metrics as floating cards with `data-count`:

```html
<section class="section" id="about">
  <div class="container about-grid">
    <div data-reveal="40">
      <div class="section-label">Sólida tradição em aço inox</div>
      <h2 class="section-title">20 anos<br>de <span class="accent-word">excelência</span></h2>
      <div class="about-text">
        <p>Sediada em <strong>Alvorada/RS</strong>, a NOX consolidou-se como referência na projeção, produção e montagem de móveis e equipamentos sob medida em aço inoxidável para o mercado profissional.</p>
        <p>Do projeto em CAD 3D à instalação final, atendemos padarias, hospitais, restaurantes, mercados e laboratórios em todo o Brasil.</p>
        <p>Furação precisa, acabamentos impecáveis (Scotch-Brite e polidos), solda cirúrgica TIG e obediência à <strong>ANVISA RDC 50</strong>.</p>
      </div>
      <div class="about-photos">
        <img src="assets/images/sobre1.jpg" alt="Fabricação em aço inox na NOX" loading="lazy" width="600" height="750" class="about-photo a">
        <img src="assets/images/sobre2.jpg" alt="Acabamento de equipamento em inox" loading="lazy" width="600" height="450" class="about-photo b">
      </div>
    </div>
    <div class="metrics-block" data-reveal-group>
      <div class="metric-cell" data-reveal-item><div class="metric-n"><span data-count="20">0</span><span class="accent-word">+</span></div><div class="metric-l">Anos de mercado</div></div>
      <div class="metric-cell" data-reveal-item><div class="metric-n"><span data-count="100">0</span><span class="accent-word">%</span></div><div class="metric-l">Sob medida</div></div>
      <div class="metric-cell" data-reveal-item><div class="metric-n">6<span class="accent-word">M</span></div><div class="metric-l">Garantia de fábrica</div></div>
      <div class="metric-cell" data-reveal-item><div class="metric-n display">TIG</div><div class="metric-l">Solda profissional</div></div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: CSS** — floating rounded cards/photos:

```css
.about-grid{display:grid;grid-template-columns:1.1fr 0.9fr;gap:clamp(2rem,5vw,4rem);align-items:center}
.about-text p{color:var(--muted);margin:1rem 0;max-width:48ch}
.about-text strong{color:var(--text);font-weight:500}
.about-photos{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:2.5rem}
.about-photo{border-radius:var(--r-lg);box-shadow:var(--shadow-md);border:1px solid var(--border);object-fit:cover;width:100%}
.about-photo.a{height:320px;transform:translateY(12px)}
.about-photo.b{height:260px}
.metrics-block{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.metric-cell{background:var(--steel-grad);border:1px solid var(--border);border-radius:var(--r-lg);padding:1.8rem;box-shadow:var(--shadow-sm);transition:transform .3s var(--ease),box-shadow .3s}
.metric-cell:hover{transform:translateY(-4px);box-shadow:var(--glow-accent)}
.metric-n{font-family:var(--font-display);font-weight:600;font-size:clamp(2.2rem,4vw,3.6rem);line-height:1}
.metric-l{font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);margin-top:0.6rem}
@media(max-width:860px){.about-grid{grid-template-columns:1fr}}
```

- [ ] **Step 3: JS count-up** (append; gated):

```js
function countUp(){document.querySelectorAll('[data-count]').forEach(el=>{const target=+el.dataset.count;if(REDUCE){el.textContent=target;return;}const stop=inView(el,()=>{animate(0,target,{duration:1.4,ease:EASE,onUpdate:v=>el.textContent=Math.round(v)});stop();},{amount:0.6});});}
countUp();
```

- [ ] **Step 4: Verify** — two columns; photos float with shadow/rounded corners; metric cards lift on hover; "20" and "100" count up when scrolled into view. Reduce-motion shows final numbers. Console clean.
- [ ] **Step 5: Commit** `feat(redesign): editorial About with floating photos + count-up metrics`

---

## Task 9: Manifesto over image

**Files:** `index.html`, `style.css`.

- [ ] **Step 1: HTML**:

```html
<section class="manifesto-section" id="manifesto">
  <img src="assets/images/porque-a-nox.jpg" alt="" aria-hidden="true" class="manifesto-bg" loading="lazy" width="1920" height="900">
  <div class="container manifesto-inner" data-reveal="40">
    <div class="section-label">Manifesto NOX</div>
    <p class="manifesto-text display">Aço inox não é apenas o nosso <span class="accent-word">material de trabalho</span> — é nossa matéria de valor.</p>
  </div>
</section>
```

- [ ] **Step 2: CSS**:

```css
.manifesto-section{position:relative;padding:clamp(6rem,14vw,11rem) clamp(1.5rem,5vw,5rem);overflow:hidden}
.manifesto-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(0.4) brightness(0.28)}
.manifesto-inner{position:relative;z-index:1}
.manifesto-text{font-size:clamp(1.8rem,4.5vw,3.6rem);font-weight:500;line-height:1.15;max-width:20ch}
```

- [ ] **Step 3: Verify** — manifesto text over a darkened image; yellow accent phrase; reveals on scroll. Console clean.
- [ ] **Step 4: Commit** `feat(redesign): manifesto section over atmospheric image`

---

## Task 10: Diferenciais — floating cards + outline SVG icons

**Files:** `index.html`, `style.css`. (Icons inline SVG.)

- [ ] **Step 1: HTML** — 6 floating cards in a stagger group, each with an inline outline SVG (use simple Lucide-style paths; example for card 1 below, vary per card):

```html
<section class="section section--alt" id="diferenciais">
  <div class="container">
    <div class="dif-intro" data-reveal="40">
      <div><div class="section-label">Por que a NOX</div><h2 class="section-title">Nossos <span class="accent-word">diferenciais</span></h2></div>
      <p class="dif-lead">Duas décadas de especialização em aço inoxidável. Cada projeto é tratado como único.</p>
    </div>
    <div class="dif-grid" data-reveal-group>
      <article class="dif-item" data-reveal-item>
        <svg class="dif-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 2v20M2 12h20"/></svg>
        <div class="dif-num">01</div><h3 class="dif-title">20 anos de mercado</h3>
        <p class="dif-desc">Duas décadas consolidando o nome NOX como sinônimo de excelência mecânica e durabilidade no sul do país.</p>
      </article>
      <!-- repeat 02..06 with the existing copy from current index.html lines 185-209; swap each <path> for a fitting Lucide-style glyph -->
    </div>
  </div>
</section>
```

(Use the 6 existing titles/descriptions verbatim from the current `index.html`. Icon paths: pick distinct Lucide glyphs — e.g. ruler, shield-check, wrench, badge-check, layers.)

- [ ] **Step 2: CSS** — spaced floating cards (NOT a hairline-welded grid):

```css
.dif-intro{display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:end;margin-bottom:3rem}
.dif-lead{color:var(--muted);max-width:42ch;align-self:end}
.dif-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem}
.dif-item{background:var(--steel-grad);border:1px solid var(--border);border-radius:var(--r-lg);padding:2rem;box-shadow:var(--shadow-sm);transition:transform .35s var(--ease),box-shadow .35s}
.dif-item:hover{transform:translateY(-6px);box-shadow:var(--glow-accent)}
.dif-icon{width:28px;height:28px;color:var(--accent);margin-bottom:1.2rem}
.dif-num{font-family:var(--font-mono);font-size:0.7rem;color:var(--muted);letter-spacing:0.15em}
.dif-title{font-family:var(--font-display);font-weight:600;font-size:1.5rem;margin:0.4rem 0 0.8rem}
.dif-desc{color:var(--muted);font-size:0.92rem}
@media(max-width:900px){.dif-grid{grid-template-columns:1fr 1fr}.dif-intro{grid-template-columns:1fr}}
@media(max-width:560px){.dif-grid{grid-template-columns:1fr}}
```

- [ ] **Step 3: Verify** — 6 spaced rounded cards, outline icons in yellow, lift+glow on hover, staggered reveal. No emoji. Console clean.
- [ ] **Step 4: Commit** `feat(redesign): floating Diferenciais cards with outline icons`

---

## Task 11: Setores — tabs with SVG icons, JS-bound (no inline onclick)

**Files:** `index.html`, `style.css`, `main.js` (refactor `selectSetor`).

- [ ] **Step 1: HTML** — tab rail with `data-setor` indices and inline SVG icons; panel container:

```html
<section class="section" id="setores">
  <div class="container">
    <div class="setores-header" data-reveal="40">
      <div><div class="section-label">Mercados atendidos</div><h2 class="section-title"><span class="accent-word">Setores</span></h2></div>
      <p class="dif-lead">Soluções específicas para cada segmento, do projeto à instalação.</p>
    </div>
    <div class="setores-tabs" id="setores-tabs">
      <button class="setor-tab active" data-setor="0"><svg class="setor-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">...</svg><span class="setor-tab-name">Padarias & Confeitarias</span></button>
      <!-- tabs 1..4 with the SETORES names; pick fitting Lucide glyphs (croissant→use wheat, utensils, shopping-cart, cross/activity, building) -->
    </div>
    <div id="setor-panel-container"></div>
  </div>
</section>
```

- [ ] **Step 2: JS** — replace `selectSetor` to bind via delegation; keep `SETORES` data as-is. Panel markup gains rounded styling classes:

```js
function renderSetor(idx){
  document.querySelectorAll('.setor-tab').forEach((t,i)=>t.classList.toggle('active',i===idx));
  const s=SETORES[idx];
  document.getElementById('setor-panel-container').innerHTML=`
    <div class="setor-panel">
      <div class="setor-panel-grid">
        <div><h3 class="setor-panel-name">${s.name}</h3><p class="setor-panel-desc">${s.desc}</p>
          <div class="setor-prods">${s.prods.map(p=>`<span class="setor-prod-tag">${p}</span>`).join('')}</div></div>
        <div class="setor-panel-side"><p class="setor-tagline">${s.tagline}</p><a href="#quote" class="btn-primary">Solicitar projeto →</a></div>
      </div>
    </div>`;
  if(!REDUCE)animate('.setor-panel',{opacity:[0,1],y:[16,0]},{duration:0.45,ease:EASE});
  bindCursor(document.getElementById('setor-panel-container'));
}
document.getElementById('setores-tabs').addEventListener('click',e=>{const t=e.target.closest('.setor-tab');if(t)renderSetor(+t.dataset.setor);});
renderSetor(0);
```

- [ ] **Step 3: CSS** — rounded tabs + panel:

```css
.setores-header{display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:end;margin-bottom:2.5rem}
.setores-tabs{display:flex;flex-wrap:wrap;gap:0.8rem;margin-bottom:1.5rem}
.setor-tab{display:flex;align-items:center;gap:0.6rem;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-pill);padding:0.8rem 1.3rem;color:var(--muted);font-size:0.8rem;transition:all .3s var(--ease)}
.setor-tab .setor-ic{width:18px;height:18px}
.setor-tab:hover{color:var(--text);border-color:var(--border2)}
.setor-tab.active{background:rgba(255,197,0,0.08);border-color:var(--accent);color:var(--accent)}
.setor-panel{background:var(--steel-grad);border:1px solid var(--border);border-radius:var(--r-xl);padding:clamp(1.5rem,4vw,3rem);box-shadow:var(--shadow-md)}
.setor-panel-grid{display:grid;grid-template-columns:1.4fr 0.6fr;gap:2rem}
.setor-panel-name{font-family:var(--font-display);font-weight:600;font-size:1.8rem;margin-bottom:1rem}
.setor-panel-desc{color:var(--muted);font-size:0.95rem}
.setor-prods{display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:1.5rem}
.setor-prod-tag{font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);border:1px solid var(--border);border-radius:var(--r-pill);padding:0.35rem 0.8rem;transition:all .3s}
.setor-prod-tag:hover{border-color:var(--accent);color:var(--accent)}
.setor-tagline{font-style:italic;color:var(--muted);margin-bottom:1.5rem}
@media(max-width:760px){.setor-panel-grid,.setores-header{grid-template-columns:1fr}}
```

- [ ] **Step 4: Verify** — clicking a tab swaps the panel with a soft reveal; active tab is yellow; no emoji; product tags highlight on hover. Console clean.
- [ ] **Step 5: Commit** `feat(redesign): sector tabs with SVG icons, delegated handlers`

---

## Task 12: Produtos — galleries, detail panel, filters (the core rebuild)

**Files:** `index.html` (section shell + filter bar + grid/detail containers), `main.js` (data fields + render/gallery/filter), `style.css`.

- [ ] **Step 1: Add gallery data to `PRODUTOS`** — extend the 4 photographed records with `hero` + `gallery` arrays; leave others without (fallback). Add a helper to build the photo path list.

```js
// near the top of the PRODUTOS section, define galleries:
const GAL = {
  fritadeiras: Array.from({length:13},(_,i)=>`assets/products/fritadeira1-${i+1}.png`),
  fogoes:      Array.from({length:4}, (_,i)=>`assets/products/fogao1-${i+1}.png`),
  refrigerador:Array.from({length:4}, (_,i)=>`assets/products/refrigeracao1-${i+1}.png`),
  moveis:      Array.from({length:10},(_,i)=>`assets/products/mobiliario1-${i+1}.png`),
};
// attach to records after PRODUTOS is defined:
PRODUTOS.forEach(p=>{ if(GAL[p.id]){ p.gallery=GAL[p.id]; p.hero=GAL[p.id][0]; } });
```

- [ ] **Step 2: Card render with image or fallback** — replace `renderProds`:

```js
let activeProdId=null;
function prodCardMedia(p){
  return p.hero
    ? `<div class="prod-media"><img src="${p.hero}" alt="${p.name}" loading="lazy" width="600" height="450"></div>`
    : `<div class="prod-media prod-media--fallback"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 14l4-4 5 5 3-3 6 6"/></svg></div>`;
}
function renderProds(cat){
  const grid=document.getElementById('prod-grid');
  document.getElementById('prod-detail').innerHTML=''; activeProdId=null;
  const items=cat==='all'?PRODUTOS:PRODUTOS.filter(p=>p.cat===cat);
  grid.innerHTML=items.map(p=>`
    <button class="prod-card" data-prod="${p.id}" data-reveal-item>
      ${prodCardMedia(p)}
      <div class="prod-card-body"><div class="prod-cat">${p.cat}</div><div class="prod-name">${p.name}</div>
      <div class="prod-short">${p.short}</div>${p.pop?'<span class="prod-badge">★ Popular</span>':''}
      <span class="prod-arrow">↗</span></div>
    </button>`).join('');
  if(!REDUCE)animate('.prod-card',{opacity:[0,1],y:[20,0]},{duration:0.5,ease:EASE,delay:stagger(0.05)});
  else grid.querySelectorAll('.prod-card').forEach(c=>c.style.opacity=1);
  bindCursor(grid);
}
```

- [ ] **Step 3: Detail panel with gallery** — replace `openProd`/`closeProd`; add thumbnail swap with crossfade:

```js
function openProd(id){
  const detail=document.getElementById('prod-detail');
  if(activeProdId===id){detail.innerHTML='';activeProdId=null;return;}
  activeProdId=id;
  const p=PRODUTOS.find(x=>x.id===id); if(!p)return;
  const feats=p.features.map(f=>`<li>${f}</li>`).join('');
  const specs=Object.entries(p.specs).map(([k,v])=>`<div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>`).join('');
  const opts=(p.options||[]).map(o=>`<div class="options-group"><div class="options-group-label">${o.label}</div><div class="options-chips">${o.values.map(v=>`<button class="option-chip">${v}</button>`).join('')}</div></div>`).join('');
  const gallery=p.gallery?`
    <div class="prod-gallery">
      <div class="prod-gallery-main"><img id="gal-main" src="${p.hero}" alt="${p.name}" width="800" height="600"></div>
      <div class="prod-thumbs">${p.gallery.map((src,i)=>`<button class="thumb${i===0?' active':''}" data-src="${src}"><img src="${src}" alt="" loading="lazy" width="120" height="90"></button>`).join('')}</div>
    </div>`:'';
  detail.innerHTML=`<div class="prod-detail-panel">
    <div class="prod-detail-header"><div><div class="prod-cat">${p.cat}</div><h3 class="prod-detail-title">${p.name}</h3></div>
      <div class="prod-detail-actions"><a href="#quote" class="btn-primary">Solicitar Orçamento →</a><button class="btn-outline" data-close>✕ Fechar</button></div></div>
    <div class="prod-detail-grid">
      <div class="prod-detail-left">${gallery}
        <div class="prod-features-title">Características Técnicas</div><ul class="features-list">${feats}</ul>
        ${opts?`<div class="prod-options"><div class="prod-options-title">Configurações Disponíveis</div>${opts}</div>`:''}</div>
      <div><div class="prod-specs-title">Especificações</div><div class="specs-list">${specs}</div></div>
    </div></div>`;
  bindCursor(detail);
  if(!REDUCE)animate('.prod-detail-panel',{opacity:[0,1],y:[16,0]},{duration:0.45,ease:EASE});
  setTimeout(()=>detail.scrollIntoView({behavior:'smooth',block:'nearest'}),50);
}
function swapThumb(btn){
  const main=document.getElementById('gal-main'); if(!main)return;
  document.querySelectorAll('.thumb').forEach(t=>t.classList.remove('active')); btn.classList.add('active');
  if(REDUCE){main.src=btn.dataset.src;return;}
  animate(main,{opacity:[1,0]},{duration:0.15}).then(()=>{main.src=btn.dataset.src;animate(main,{opacity:[0,1]},{duration:0.25,ease:EASE});});
}
```

- [ ] **Step 4: Filter bar + event delegation** — HTML filter bar uses `data-cat`; one delegated listener handles filters, card opens, thumb swaps, option toggles, close, option-chip:

```html
<section class="section section--alt" id="produtos">
  <div class="container">
    <div class="produtos-head" data-reveal="40">
      <div><div class="section-label">Catálogo completo</div><h2 class="section-title">Linha de <span class="accent-word">produtos</span></h2></div>
    </div>
    <div class="filter-bar" id="filter-bar">
      <button class="filter-btn active" data-cat="all">Todos</button>
      <button class="filter-btn" data-cat="Cocção">Cocção</button>
      <button class="filter-btn" data-cat="Refrigeração">Refrigeração</button>
      <button class="filter-btn" data-cat="Mobiliário">Mobiliário</button>
      <button class="filter-btn" data-cat="Exaustão">Exaustão</button>
      <button class="filter-btn" data-cat="Padaria">Padaria</button>
      <button class="filter-btn" data-cat="Preparação">Preparação</button>
      <button class="filter-btn" data-cat="Biossegurança">Biossegurança</button>
      <button class="filter-btn" data-cat="Projetos">Projetos</button>
      <button class="filter-btn" data-cat="Acessórios">Acessórios</button>
    </div>
    <div class="prod-grid" id="prod-grid" data-reveal-group></div>
    <div id="prod-detail"></div>
  </div>
</section>
```

```js
document.getElementById('filter-bar').addEventListener('click',e=>{const b=e.target.closest('.filter-btn');if(!b)return;document.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderProds(b.dataset.cat);});
document.getElementById('produtos').addEventListener('click',e=>{
  const card=e.target.closest('.prod-card'); if(card){openProd(card.dataset.prod);return;}
  const thumb=e.target.closest('.thumb'); if(thumb){swapThumb(thumb);return;}
  if(e.target.closest('[data-close]')){document.getElementById('prod-detail').innerHTML='';activeProdId=null;return;}
  const chip=e.target.closest('.option-chip'); if(chip){chip.classList.toggle('selected');}
});
renderProds('all');
```

- [ ] **Step 5: CSS** — image cards + gallery:

```css
.prod-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem;margin-top:2rem}
.prod-card{text-align:left;background:var(--steel-grad);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;position:relative;box-shadow:var(--shadow-sm);transition:transform .35s var(--ease),box-shadow .35s}
.prod-card:hover{transform:translateY(-6px);box-shadow:var(--glow-accent)}
.prod-media{aspect-ratio:4/3;overflow:hidden;background:#0a0a0a}
.prod-media img{width:100%;height:100%;object-fit:cover;transition:transform .5s var(--ease)}
.prod-card:hover .prod-media img{transform:scale(1.04)}
.prod-media--fallback{display:flex;align-items:center;justify-content:center;color:var(--faint)}
.prod-media--fallback svg{width:64px;height:64px}
.prod-card-body{padding:1.4rem}
.prod-cat{font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--accent)}
.prod-name{font-family:var(--font-display);font-weight:600;font-size:1.2rem;margin:0.4rem 0}
.prod-short{color:var(--muted);font-size:0.85rem}
.prod-badge{display:inline-block;margin-top:0.8rem;font-family:var(--font-mono);font-size:0.58rem;color:var(--accent);border:1px solid rgba(255,197,0,0.35);border-radius:var(--r-pill);padding:0.2rem 0.6rem}
.prod-arrow{position:absolute;top:1rem;right:1rem;color:var(--accent);opacity:0;transition:opacity .3s}
.prod-card:hover .prod-arrow{opacity:1}
.prod-detail-panel{margin-top:1.5rem;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--r-xl);border-top:2px solid var(--accent);padding:clamp(1.5rem,4vw,2.5rem);box-shadow:var(--shadow-lg)}
.prod-detail-header{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:1.5rem}
.prod-detail-title{font-family:var(--font-display);font-weight:600;font-size:1.8rem}
.prod-detail-actions{display:flex;gap:0.8rem;flex-wrap:wrap;align-items:center}
.prod-detail-grid{display:grid;grid-template-columns:1.3fr 0.7fr;gap:2rem}
.prod-gallery{margin-bottom:2rem}
.prod-gallery-main{border-radius:var(--r-lg);overflow:hidden;border:1px solid var(--border);box-shadow:var(--glow-soft);background:#0a0a0a}
.prod-gallery-main img{width:100%;aspect-ratio:4/3;object-fit:cover}
.prod-thumbs{display:flex;gap:0.5rem;margin-top:0.7rem;overflow-x:auto;padding-bottom:0.3rem}
.thumb{flex:0 0 auto;width:72px;height:54px;border-radius:var(--r-sm);overflow:hidden;border:1px solid var(--border);opacity:0.6;transition:opacity .3s,border-color .3s}
.thumb img{width:100%;height:100%;object-fit:cover}
.thumb.active,.thumb:hover{opacity:1;border-color:var(--accent)}
.spec-row{display:flex;justify-content:space-between;gap:1rem;padding:0.6rem 0;border-bottom:1px solid var(--border)}
.spec-key{font-size:0.7rem;letter-spacing:0.06em;text-transform:uppercase;color:var(--muted)}
.spec-val{font-family:var(--font-mono);font-size:0.75rem;text-align:right;color:var(--text)}
.features-list{list-style:none;margin:0.5rem 0 1.5rem}
.features-list li{position:relative;padding-left:1.2rem;margin:0.6rem 0;color:var(--muted);font-size:0.9rem}
.features-list li::before{content:'—';position:absolute;left:0;color:var(--accent)}
.prod-features-title,.prod-specs-title,.prod-options-title{font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--accent);margin-bottom:0.8rem}
.options-group{margin-top:1rem}.options-group-label{font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted);margin-bottom:0.5rem}
.options-chips{display:flex;flex-wrap:wrap;gap:0.5rem}
.option-chip{font-family:var(--font-mono);font-size:0.62rem;border:1px solid var(--border);border-radius:var(--r-pill);padding:0.4rem 0.8rem;color:var(--muted);background:transparent;transition:all .3s}
.option-chip.selected{border-color:var(--accent);color:var(--accent);background:rgba(255,197,0,0.06)}
@media(max-width:900px){.prod-grid{grid-template-columns:1fr 1fr}.prod-detail-grid{grid-template-columns:1fr}}
@media(max-width:560px){.prod-grid{grid-template-columns:1fr}}
```

- [ ] **Step 6: Verify** — grid shows image cards (4 with photos, others with fallback frame); hover lifts + zooms image; clicking a photographed product opens a detail panel with a main image + thumbnail strip; clicking a thumb crossfades the main image; filters re-render and close any open detail; option chips toggle yellow; close button works. Reduce-motion: instant swaps, cards visible. Console clean.
- [ ] **Step 7: Commit** `feat(redesign): product galleries, image cards, delegated detail/filter handlers`

---

## Task 13: Guia Inox — table restyle (rounded panel)

**Files:** `index.html` (keep table content), `style.css`.

- [ ] **Step 1:** Keep the table + care-panel content verbatim from current `index.html` (lines 277-356). Wrap the table in a rounded panel and restyle:

```css
#inox .inox-grid{display:grid;grid-template-columns:1.4fr 0.6fr;gap:2rem;margin-top:2rem}
.inox-table{width:100%;border-collapse:collapse;background:var(--steel-grad);border:1px solid var(--border);border-radius:var(--r-xl);overflow:hidden}
.inox-table th,.inox-table td{padding:1rem 1.2rem;text-align:left;border-bottom:1px solid var(--border);font-size:0.85rem}
.inox-table thead th{font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted)}
.inox-table .col-hi{background:rgba(255,197,0,0.05)}
.inox-table thead .col-hi{color:var(--accent)}
.inox-table td strong{color:var(--text)}
.badge-best{background:var(--accent);color:#0a0a0a;font-family:var(--font-mono);font-size:0.58rem;padding:0.25rem 0.6rem;border-radius:var(--r-pill)}
.badge-spec{border:1px solid var(--steel);color:var(--steel);font-family:var(--font-mono);font-size:0.58rem;padding:0.25rem 0.6rem;border-radius:var(--r-pill)}
.badge-opt{border:1px solid var(--border2);color:var(--muted);font-family:var(--font-mono);font-size:0.58rem;padding:0.25rem 0.6rem;border-radius:var(--r-pill)}
.care-panel{display:flex;flex-direction:column;gap:1rem}
.care-item{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-md);padding:1.2rem}
.care-head{display:flex;align-items:center;gap:0.6rem;margin-bottom:0.5rem}
.care-dot{width:7px;height:7px;border-radius:50%}.care-dot.ok{background:#639922}.care-dot.no{background:#E24B4A}
.care-head-label{font-size:0.65rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted)}
.care-body{font-size:0.85rem;color:var(--muted)}.care-body strong{color:var(--text)}
@media(max-width:860px){#inox .inox-grid{grid-template-columns:1fr}}
```

- [ ] **Step 2: Verify** — rounded table panel, AISI 304 column tinted yellow, pill badges, care dots green/red intact. Console clean.
- [ ] **Step 3: Commit** `feat(redesign): rounded Guia Inox table + care panel`

---

## Task 14: CTA strip over image

**Files:** `index.html`, `style.css`.

- [ ] **Step 1: HTML**:

```html
<section class="cta-strip" id="cta">
  <img src="assets/images/produtos3.jpg" alt="" aria-hidden="true" class="cta-bg" loading="lazy" width="1920" height="800">
  <div class="container cta-inner" data-reveal="40">
    <div class="section-label">Pronto para começar?</div>
    <h2 class="section-title">Solicite seu <span class="accent-word">orçamento</span></h2>
    <div class="cta-actions"><a href="#quote" class="btn-primary">Falar com a equipe NOX →</a><a href="tel:+555100000000" class="btn-outline">Ligar agora</a></div>
  </div>
</section>
```

- [ ] **Step 2: CSS**:

```css
.cta-strip{position:relative;padding:clamp(5rem,12vw,9rem) clamp(1.5rem,5vw,5rem);overflow:hidden;text-align:center}
.cta-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(0.4) brightness(0.25)}
.cta-inner{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:1.2rem}
.cta-actions{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;margin-top:1rem}
```

- [ ] **Step 3: Verify** — big centered title over a darkened image; two buttons. Console clean.
- [ ] **Step 4: Commit** `feat(redesign): CTA strip over atmospheric image`

---

## Task 15: Quote form (glass rounded) + inline confirm

**Files:** `index.html` (keep fields), `style.css`, `main.js` (`submitForm` → delegated).

- [ ] **Step 1: HTML** — keep all existing form fields (current `index.html` lines 369-463); change wrapper classes for rounded glass, give the form an `id="quote-form"` and the submit button `type="button" id="quote-submit"` (no inline onclick). Left column keeps copy + guarantee + coverage rows (replace emoji in coverage rows with small inline SVGs or the mono `BR`/`RS` labels already present).

- [ ] **Step 2: CSS**:

```css
.quote-grid{display:grid;grid-template-columns:0.9fr 1.1fr;gap:clamp(2rem,5vw,4rem)}
.form-box{background:var(--steel-grad);border:1px solid var(--border2);border-radius:var(--r-xl);padding:clamp(1.5rem,4vw,2.5rem);box-shadow:var(--shadow-md)}
.form-box-title{font-family:var(--font-display);font-weight:600;font-size:1.4rem}
.form-box-sub{color:var(--muted);font-size:0.8rem;margin-bottom:1.5rem}
.form-two-col{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.form-group{margin-bottom:1rem;display:flex;flex-direction:column}
.form-label{font-size:0.62rem;text-transform:uppercase;letter-spacing:0.16em;color:var(--muted);margin-bottom:0.5rem}
.form-input{background:var(--bg3);border:1px solid var(--border);border-radius:var(--r-md);padding:0.9rem 1rem;color:var(--text);font-family:var(--font-body);font-size:0.9rem;transition:border-color .3s,box-shadow .3s}
.form-input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(255,197,0,0.1)}
textarea.form-input{min-height:120px;resize:vertical}
.form-submit{width:100%;margin-top:1rem;border:none;border-radius:var(--r-pill);background:var(--accent);color:#0a0a0a;font-weight:600;font-size:0.72rem;letter-spacing:0.16em;text-transform:uppercase;padding:1.1rem;transition:all .3s var(--ease)}
.form-submit:hover{background:var(--accent2);box-shadow:0 8px 24px rgba(255,197,0,0.35)}
.quote-guarantee{display:flex;gap:0.8rem;background:rgba(255,197,0,0.04);border:1px solid rgba(255,197,0,0.2);border-radius:var(--r-md);padding:1rem;margin-top:1.5rem}
.quote-guarantee-icon{color:var(--accent)}
@media(max-width:860px){.quote-grid,.form-two-col{grid-template-columns:1fr}}
```

- [ ] **Step 3: JS** (append; delegated; preserves the original inline-confirm behavior):

```js
const qs=document.getElementById('quote-submit');
if(qs)qs.addEventListener('click',()=>{
  qs.textContent='✓ Solicitação enviada — retorno em até 24h';
  qs.style.background='var(--bg4)';qs.style.color='var(--accent)';qs.style.border='1px solid var(--accent)';qs.disabled=true;
  if(!REDUCE)animate(qs,{scale:[0.98,1]},{type:'spring',visualDuration:0.3,bounce:0.2});
});
```

- [ ] **Step 4: Verify** — rounded glass form, inputs show yellow focus glow; submit flips to confirmation and disables. Console clean.
- [ ] **Step 5: Commit** `feat(redesign): glass rounded quote form with inline confirm`

---

## Task 16: Footer + press feedback + final pass

**Files:** `index.html` (footer), `style.css`, `main.js` (press on buttons).

- [ ] **Step 1: HTML** — keep footer content (current lines 467-518); replace emoji contact bullets with small inline SVGs; wordmark uses `.display` + `.accent-word`; round any chips.

- [ ] **Step 2: CSS footer** (rounded, spaced):

```css
footer{background:var(--bg2);border-top:1px solid var(--border);padding:clamp(3rem,7vw,5rem) clamp(1.5rem,5vw,5rem) 2rem}
.footer-grid{max-width:1320px;margin:0 auto;display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:2rem}
.footer-brand-name{font-family:var(--font-display);font-weight:600;font-size:2.2rem}
.footer-brand-desc{color:var(--muted);font-size:0.85rem;max-width:38ch;margin-top:0.8rem}
.footer-col-title{font-size:0.62rem;text-transform:uppercase;letter-spacing:0.16em;color:var(--accent);margin-bottom:1rem}
.footer-links{display:flex;flex-direction:column;gap:0.6rem}
.footer-links a{color:var(--muted);font-size:0.85rem;transition:color .3s}.footer-links a:hover{color:var(--accent)}
.footer-contact-item{color:var(--muted);font-size:0.85rem;margin-bottom:0.6rem;display:flex;align-items:center;gap:0.5rem}
.footer-bottom{max-width:1320px;margin:2.5rem auto 0;padding-top:1.5rem;border-top:1px solid var(--border);display:flex;justify-content:space-between;flex-wrap:wrap;gap:1rem;font-family:var(--font-mono);font-size:0.62rem;color:var(--muted);letter-spacing:0.08em}
@media(max-width:860px){.footer-grid{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.footer-grid{grid-template-columns:1fr}}
```

- [ ] **Step 3: JS press feedback** (append; gated) — accessible bounce on primary buttons:

```js
if(!REDUCE)press('.btn-primary',el=>{animate(el,{scale:0.96},{duration:0.12});return()=>animate(el,{scale:1},{type:'spring',visualDuration:0.3,bounce:0.2});});
```

- [ ] **Step 4: Final pass verification** (full-page):
  - All sections render top→bottom; every section uses the new tokens (no leftover Bebas/Barlow references in CSS).
  - **Responsive:** check at 360px, 768px, 1280px — no overflow, grids collapse per breakpoints.
  - **Reduced motion:** toggle OS setting → all content visible, no animation, page fully usable.
  - **Images:** all `<img>` have `alt`, `width`/`height`, and `loading="lazy"` except the hero.
  - **Console:** zero errors/warnings on load and on every interaction (tabs, filters, gallery, form).
  - **No emoji** remain in rendered output.
  - Grep check: `grep -ri "Bebas\|Barlow\|onclick=" nox-project/index.html nox-project/assets` returns nothing.

- [ ] **Step 5: Commit** `feat(redesign): footer, button press feedback, final responsive/a11y pass`

---

## Self-review (completed by plan author)

- **Spec coverage:** palette/fonts/geometry (Tasks 1-2), curved dividers (Task 2 util), imagery map (Tasks 6-9,12,14), product restructure+galleries (Task 12), motion vocabulary — parallax (6), reveals/stagger (4), count-up (8), hover lift (8,10,12), gallery crossfade (12), press (16), reduced-motion gate (3, enforced per task) — all mapped. Section-by-section architecture (Tasks 5-16) covers all 12 page sections. Tech plan: module conversion (3), assets vendored (0), Fontshare/Motion ESM (1,3). ✔
- **Placeholder scan:** no TBD/TODO; the only "repeat from existing file" notes (Diferenciais copy, Inox table, form fields, footer) explicitly point to exact current `index.html` line ranges to copy verbatim — concrete, not vague. ✔
- **Type/name consistency:** `renderProds`, `openProd`, `swapThumb`, `renderSetor`, `bindCursor`, `countUp`, `reveal`, `REDUCE`, `EASE`, data attrs (`data-prod`,`data-cat`,`data-setor`,`data-src`,`data-close`,`data-reveal`,`data-reveal-group`,`data-reveal-item`), IDs (`prod-grid`,`prod-detail`,`filter-bar`,`setores-tabs`,`setor-panel-container`,`quote-form`,`quote-submit`,`gal-main`) are consistent across tasks. ✔
- **Deviation noted:** keeps 11 products (superset of spec's 4) with fallback frames for non-photographed lines — documented in "Decisions" above; user can trim. ✔
