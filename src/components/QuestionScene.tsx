import { useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CONFIG } from "../config";

interface Props {
  onYes: () => void;
  onFirstInteract: () => void;
}

export function QuestionScene({ onYes, onFirstInteract }: Props) {
  const [taunt, setTaunt] = useState(0);
  const [loose, setLoose] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0, rot: 0 });
  const [yesScale, setYesScale] = useState(1);
  const [leaving, setLeaving] = useState(false);
  const noRef = useRef<HTMLButtonElement>(null);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const dodge = () => {
    onFirstInteract();
    setTaunt((t) => t + 1);
    setYesScale((s) => Math.min(s + 0.13, 2.2));
    if (reduced) return;
    setLoose(true);
    const W = window.innerWidth;
    const H = window.innerHeight;
    // reserve a fixed, generous footprint — the label (and width) changes every dodge,
    // so measuring the current one and trusting it lets a longer label overflow
    const bw = 280;
    const bh = 76;
    const padX = 16;
    const padTop = 78; // clear of the "music" toggle
    const padBottom = 16;
    const minX = padX;
    const maxX = Math.max(minX, W - bw - padX);
    const minY = padTop;
    const maxY = Math.max(minY, H - bh - padBottom);
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    setPos({ x, y, rot: 0 });
  };

  const taunts = CONFIG.noTaunts;
  const noLabel = taunts[taunt % taunts.length];

  const sayYes = () => {
    onFirstInteract();
    setLeaving(true);
    setTimeout(onYes, 1500);
  };

  const noButton = (
    <motion.button
      ref={noRef}
      className={`btn ghost btn-no ${loose ? "loose" : ""}`}
      onMouseEnter={dodge}
      onPointerDown={(e) => {
        e.preventDefault();
        dodge();
      }}
      onClick={(e) => {
        e.preventDefault();
        dodge();
      }}
      animate={loose ? { left: pos.x, top: pos.y } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      {noLabel}
    </motion.button>
  );

  return (
    <motion.div className="scene-wrap question" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="ask-card"
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 90, damping: 14 }}
      >
        <motion.div className="ask-bloom" animate={{ rotate: [-7, 7, -7] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
          🌷
        </motion.div>
        <p className="eyebrow">a very important question</p>
        <h1 className="ask-q">{CONFIG.question}</h1>
        <p className="ask-dear">
          <span className="script">{CONFIG.herName}</span>
        </p>

        <div className="ask-buttons">
          <motion.button className="btn big-yes" style={{ scale: yesScale }} whileHover={{ scale: yesScale * 1.05 }} whileTap={{ scale: yesScale * 0.96 }} onClick={sayYes}>
            {CONFIG.yesText} 💗
          </motion.button>
          {!loose && noButton}
        </div>
        <p className="ask-hint">choose wisely 😌</p>
      </motion.div>

      {/* once loose, portal to <body> so `position: fixed` is relative to the viewport,
          not the Framer-transformed card (otherwise it flies off-screen) */}
      {loose && createPortal(noButton, document.body)}

      <AnimatePresence>
        {leaving && (
          <motion.div className="yay-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="yay-big" initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.7 }}>
              🥰
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              I knew it! 💐
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              Taking you somewhere lovely…
            </motion.p>
            <Confetti />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Confetti() {
  const glyphs = ["💗", "💕", "🌹", "🌸", "✨", "💖", "🌷", "💐"];
  const bits = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => {
        const a = Math.random() * Math.PI * 2;
        const d = 150 + Math.random() * 330;
        return { tx: Math.cos(a) * d, ty: Math.sin(a) * d, rot: Math.random() * 360, size: 16 + Math.random() * 22, glyph: glyphs[i % glyphs.length] };
      }),
    [],
  );
  return (
    <div className="confetti">
      {bits.map((b, i) => (
        <span
          key={i}
          className="confetti-bit"
          style={{ fontSize: b.size, ["--tx" as string]: `${b.tx}px`, ["--ty" as string]: `${b.ty}px`, ["--rot" as string]: `${b.rot}deg` } as CSSProperties}
        >
          {b.glyph}
        </span>
      ))}
    </div>
  );
}
