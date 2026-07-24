import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Atmosphere } from "./components/Atmosphere";
import { QuestionScene } from "./components/QuestionScene";
import { Boutique } from "./components/Boutique";
import { GardenScene } from "./three/GardenScene";
import { useSound } from "./useSound";
import { CONFIG } from "./config";

type View = "question" | "boutique";

export default function App() {
  const [view, setView] = useState<View>("question");
  const sound = useSound(CONFIG.soundDefaultOn);

  useCursorSparkle();

  // quick preview of the 3D garden for calibration: open with #garden
  if (typeof window !== "undefined" && window.location.hash === "#garden") {
    return <GardenScene herName={CONFIG.bouquetName} onExit={() => (window.location.hash = "")} onGrew={() => {}} />;
  }

  return (
    <div className="app">
      <Atmosphere intensity={view === "boutique" ? 1.15 : 1} />

      <button
        className="sound-toggle"
        onClick={sound.toggle}
        title={sound.enabled ? "Mute" : "Play music"}
        aria-label="toggle sound"
      >
        {sound.enabled ? "🔊" : "🔈"}
        <span>{sound.enabled ? "music on" : "music off"}</span>
      </button>

      <main className="stage">
        <AnimatePresence mode="wait">
          {view === "question" ? (
            <QuestionScene
              key="q"
              onFirstInteract={() => sound.enable()}
              onYes={() => {
                sound.cheer();
                setView("boutique");
              }}
            />
          ) : (
            <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} style={{ width: "100%" }}>
              <Boutique onPluck={sound.pluck} onPop={sound.pop} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="footer">
        Made with an entire <span className="heart">❤</span> for you
      </footer>
    </div>
  );
}

/* soft sparkle that follows the cursor */
function useCursorSparkle() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const glyphs = ["✨", "💗", "🌸", "💕"];
    let last = 0;
    const onMove = (e: PointerEvent) => {
      const now = Date.now();
      if (now - last < 110) return;
      last = now;
      const s = document.createElement("div");
      s.className = "cursor-sparkle";
      s.textContent = glyphs[(Math.random() * glyphs.length) | 0];
      s.style.left = e.clientX + "px";
      s.style.top = e.clientY + "px";
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 900);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
}
