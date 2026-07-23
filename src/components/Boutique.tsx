import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CONFIG } from "../config";
import { GardenScene } from "../three/GardenScene";

interface Props {
  onPluck: (step: number) => void;
  onPop: () => void;
}

export function Boutique({ onPluck, onPop }: Props) {
  const [opened, setOpened] = useState(false);
  const [typed, setTyped] = useState("");
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!opened) return;
    const text = CONFIG.letterBody;
    if (reduced) {
      setTyped(text);
      const t = setTimeout(() => setReady(true), 400);
      return () => clearTimeout(t);
    }
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        setTimeout(() => setReady(true), 500);
      }
    }, 20);
    return () => clearInterval(iv);
  }, [opened, reduced]);

  // keep the latest line in view while typing
  useEffect(() => {
    if (paperRef.current) paperRef.current.scrollTop = paperRef.current.scrollHeight;
  }, [typed]);


  return (
    <div className="boutique-page">
      {/* ENVELOPE */}
      <AnimatePresence>
        {!opened && (
          <motion.div className="env-stage" exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5 }}>
            <motion.button className="envelope" onClick={() => setOpened(true)} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -8, scale: 1.03 }}>
              <div className="env-body" />
              <motion.div className="env-flap" />
              <div className="env-pocket" />
              <motion.div className="env-seal" animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>
                💗
              </motion.div>
            </motion.button>
            <motion.p className="env-tap" animate={{ y: [0, -6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
              tap to open 💌
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LETTER */}
      {opened && (
        <motion.div className="letter" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="letter-paper" ref={paperRef}>
            <p className="l-date">{CONFIG.letterDate}</p>
            <h1 className="l-title">{CONFIG.letterTitle}</h1>
            <p className="l-greet">
              My dearest <span className="script">{CONFIG.herName}</span>,
            </p>
            <p className="l-body">
              {typed}
              {typed.length < CONFIG.letterBody.length && <span className="caret">▌</span>}
            </p>
            <AnimatePresence>
              {ready && (
                <motion.p className="l-sign" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {CONFIG.yourName}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {ready && (
              <motion.div ref={ctaRef} className="grow-cta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <p className="lead">I planted something that grows a little more every day, just like us. 🌱</p>
                <button
                  className="btn big"
                  onClick={() => {
                    onPluck(2);
                    setEntered(true);
                  }}
                >
                  Watch our garden grow 🌷
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* FULL-SCREEN 3D GARDEN */}
      <AnimatePresence>
        {entered && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            <GardenScene herName={CONFIG.herName} onExit={() => setEntered(false)} onGrew={onPop} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
