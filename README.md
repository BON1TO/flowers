# 🌹 For You — an interactive flower gift

A romantic little web experience: a "Do you love me?" question with a playful runaway
**No** button, a hand-written love letter that types itself out, and a **3D bouquet** that
grows in a vase — tall, full, and blooming on its own — with floating hearts, drag-to-rotate
and pinch-to-zoom. Fully responsive for phones.

Built with **React + TypeScript + Vite**, **Three.js / react-three-fiber** for the 3D scene,
and **Framer Motion** for the UI animation.

## Run locally
```bash
npm install
npm run dev      # http://localhost:5173
```

## Build
```bash
npm run build    # outputs a single self-contained file at dist/index.html
```
The build inlines everything into one `dist/index.html` (via `vite-plugin-singlefile`), so it
also works by simply double-clicking that file — no server needed.

## Deploy (Vercel)
Vercel auto-detects Vite. Import this repo at [vercel.com/new](https://vercel.com/new) — no
config needed:
- **Build command:** `npm run build`
- **Output directory:** `dist`

## Make it personal
Edit **`src/config.ts`** — her name, your sign-off, the question, the runaway-button lines,
and the whole love letter are all at the top.

## Project layout
```
src/
  config.ts               ← edit your words here
  App.tsx                 ← scene flow + ambient background
  components/             ← question scene, letter, atmosphere
  three/                  ← 3D garden: bouquet, curved stems, vase, flower heads
  useSound.ts             ← generated ambient music + chimes
```

Made with an entire heart. ❤
