# NX-7 — Neural Augmentation OS

A cyberpunk-themed landing page I built for the GSSoC 2026 open source challenge. Wanted to push the UI as far into the sci-fi aesthetic as possible while keeping it a clean, performant React app. No Three.js, no heavy libraries — just Canvas API, CSS animations, and a lot of `clip-path`.

## Tech Stack

- React + Vite (TypeScript)
- Tailwind CSS v4
- CSS Modules for component-scoped animations
- Canvas API — CyberGrid wireframe terrain + DataNetwork neural mesh

## Features

- Glitch text effect with chromatic aberration (CSS Module + `clip-path` slicing)
- Animated wireframe perspective grid background (pure Canvas, 60fps)
- Neural data network in the SPECS section (particle mesh, bouncing nodes)
- HUD circle with counter-rotating rings and pulsing dots
- Smooth scroll navigation with 80px navbar offset
- Email form with validation — shake animation on invalid, success state on valid
- Scroll-triggered stats counter with `easeOutQuad`
- Scanline overlay (fixed, `pointer-events: none`)

## Run Locally

```bash
npm install
npm run dev
```

## Live Demo

[link here]

---

Built during a late night. The `// VOID AFTER DEATH` warranty clause was intentional.