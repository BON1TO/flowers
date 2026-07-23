/* 3D flower recipes. Units are world-space (a flower head is ~0.6 wide). */

export interface Layer3D {
  count: number;
  openDeg: number; // how far petals splay from vertical when fully open
  closedDeg: number; // splay while still a bud
  length: number;
  width: number;
  curl: number;
  cup: number;
  tipPinch?: number;
  ruffle?: number;
  color: string;
  color2?: string; // tip color (for a subtle gradient via emissive mix)
  yOffset?: number;
  shape?: "ray";
}

export interface Center3D {
  type: "dome" | "disc" | "cluster" | "trumpet";
  radius: number;
  height: number;
  color: string;
  color2?: string;
}

export interface Flower3D {
  key: string;
  name: string;
  meaning: string;
  accent: string;
  stem: string;
  headScale: number;
  layers: Layer3D[];
  center: Center3D;
}

export const FLOWERS_3D: Flower3D[] = [
  {
    key: "rose",
    name: "Rose",
    meaning: "Deep, unconditional love",
    accent: "#d33b62",
    stem: "#4f8a5b",
    headScale: 1,
    layers: [
      { count: 3, openDeg: 20, closedDeg: 6, length: 0.34, width: 0.2, curl: 1.4, cup: 1.0, color: "#8f1038", color2: "#b8184a" },
      { count: 5, openDeg: 34, closedDeg: 10, length: 0.32, width: 0.19, curl: 1.6, cup: 1.1, color: "#b8184a", color2: "#d43a67" },
      { count: 6, openDeg: 52, closedDeg: 16, length: 0.3, width: 0.18, curl: 1.7, cup: 1.15, color: "#cf2e5c", color2: "#e46389" },
      { count: 7, openDeg: 72, closedDeg: 22, length: 0.28, width: 0.17, curl: 1.75, cup: 1.2, color: "#e05b83", color2: "#f79cb7" },
    ],
    center: { type: "cluster", radius: 0.05, height: 0.05, color: "#8f1038" },
  },
  {
    key: "tulip",
    name: "Tulip",
    meaning: "A perfect, complete love",
    accent: "#e5457f",
    stem: "#599a63",
    headScale: 1,
    layers: [
      { count: 3, openDeg: 24, closedDeg: 10, length: 0.42, width: 0.22, curl: 0.9, cup: 1.3, color: "#cf2e6c", color2: "#f27ba6" },
      { count: 3, openDeg: 30, closedDeg: 14, length: 0.4, width: 0.21, curl: 0.8, cup: 1.35, color: "#e5457f", color2: "#ff9dc0", yOffset: 0.02 },
    ],
    center: { type: "cluster", radius: 0.035, height: 0.06, color: "#5a2f14", color2: "#2f1708" },
  },
  {
    key: "peony",
    name: "Peony",
    meaning: "A happy, romantic life",
    accent: "#f06a92",
    stem: "#4f8a5b",
    headScale: 1.05,
    layers: [
      { count: 6, openDeg: 46, closedDeg: 14, length: 0.32, width: 0.2, curl: 1.5, cup: 1.1, ruffle: 0.03, color: "#ef6f97", color2: "#ffb9d1" },
      { count: 8, openDeg: 60, closedDeg: 18, length: 0.29, width: 0.18, curl: 1.6, cup: 1.15, ruffle: 0.04, color: "#f386a9", color2: "#ffcfe0" },
      { count: 9, openDeg: 76, closedDeg: 22, length: 0.26, width: 0.17, curl: 1.7, cup: 1.2, ruffle: 0.05, color: "#f79cbb", color2: "#ffe0ec" },
      { count: 8, openDeg: 90, closedDeg: 26, length: 0.22, width: 0.15, curl: 1.75, cup: 1.25, ruffle: 0.05, color: "#ffb3ce", color2: "#fff2f7" },
    ],
    center: { type: "cluster", radius: 0.06, height: 0.05, color: "#ffd84d", color2: "#f0a92e" },
  },
  {
    key: "sunflower",
    name: "Sunflower",
    meaning: "Warmth & pure adoration",
    accent: "#f2b632",
    stem: "#4f8a4a",
    headScale: 1.15,
    layers: [
      { count: 16, openDeg: 74, closedDeg: 30, length: 0.4, width: 0.09, curl: 0.5, cup: 0.4, tipPinch: 0.5, shape: "ray", color: "#e79a1e", color2: "#ffd766" },
      { count: 16, openDeg: 66, closedDeg: 26, length: 0.34, width: 0.085, curl: 0.5, cup: 0.4, tipPinch: 0.5, shape: "ray", color: "#f2b632", color2: "#ffe58a", yOffset: 0.005 },
    ],
    center: { type: "disc", radius: 0.2, height: 0.05, color: "#7a4a1e", color2: "#3f2410" },
  },
  {
    key: "daisy",
    name: "Daisy",
    meaning: "Loyal, innocent love",
    accent: "#f4c542",
    stem: "#599a63",
    headScale: 0.95,
    layers: [
      { count: 18, openDeg: 78, closedDeg: 34, length: 0.36, width: 0.06, curl: 0.35, cup: 0.35, tipPinch: 0.55, shape: "ray", color: "#ffeef4", color2: "#ffffff" },
    ],
    center: { type: "disc", radius: 0.13, height: 0.05, color: "#ffcf3f", color2: "#e79a1e" },
  },
  {
    key: "lily",
    name: "Lily",
    meaning: "Devotion & a pure heart",
    accent: "#ff8fae",
    stem: "#4f8a5b",
    headScale: 1.05,
    layers: [
      { count: 6, openDeg: 62, closedDeg: 18, length: 0.46, width: 0.13, curl: 1.1, cup: 0.8, tipPinch: 0.6, color: "#ff8fae", color2: "#ffe4ee" },
    ],
    center: { type: "trumpet", radius: 0.04, height: 0.12, color: "#ffd84d", color2: "#e79a1e" },
  },
  {
    key: "lavender",
    name: "Lavender",
    meaning: "Calm, enchanted devotion",
    accent: "#9b6bd6",
    stem: "#5a9a5a",
    headScale: 0.9,
    layers: [
      { count: 5, openDeg: 40, closedDeg: 12, length: 0.3, width: 0.17, curl: 1.3, cup: 1.1, color: "#8a52c9", color2: "#c9a9ee" },
      { count: 5, openDeg: 58, closedDeg: 18, length: 0.26, width: 0.15, curl: 1.5, cup: 1.15, color: "#9b6bd6", color2: "#ddc6f5" },
    ],
    center: { type: "dome", radius: 0.05, height: 0.05, color: "#f2e29a", color2: "#d9b94a" },
  },
  {
    key: "forget-me-not",
    name: "Forget-me-not",
    meaning: "True love & remembrance",
    accent: "#5b8fe0",
    stem: "#5a9a5a",
    headScale: 0.82,
    layers: [{ count: 5, openDeg: 84, closedDeg: 30, length: 0.26, width: 0.2, curl: 0.6, cup: 0.5, color: "#4f83d6", color2: "#bcd6f7" }],
    center: { type: "dome", radius: 0.06, height: 0.03, color: "#ffe066", color2: "#f0b429" },
  },
];

export const FLOWERS_3D_BY_KEY: Record<string, Flower3D> = Object.fromEntries(FLOWERS_3D.map((f) => [f.key, f]));
