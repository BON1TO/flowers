import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { PerspectiveCamera } from "three";
import { RoseBouquet } from "./RoseBouquet";
import { Vase3D } from "./Vase3D";

const IS_MOBILE = typeof window !== "undefined" && (window.matchMedia("(pointer: coarse)").matches || Math.min(window.innerWidth, window.innerHeight) < 560);
const MAX_FLOWERS = IS_MOBILE ? 48 : 74;
const START_FLOWERS = IS_MOBILE ? 12 : 16;

/** keeps the whole bouquet framed no matter the aspect ratio (portrait phones included) */
function FitCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    const aspect = size.width / size.height;
    const vfov = (cam.fov * Math.PI) / 180;
    const halfH = 3.5;
    const halfW = 3.0; // a touch of side margin for the vertical labels
    const distH = halfH / Math.tan(vfov / 2);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    const distW = halfW / Math.tan(hfov / 2);
    const dist = Math.min(Math.max(Math.max(distH, distW) * 1.06, 4), 22);
    cam.position.set(0, 3.3, dist);
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}

function FloatingHearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, i) => ({
        left: Math.random() * 100,
        size: 10 + Math.random() * 26,
        dur: 9 + Math.random() * 12,
        delay: -Math.random() * 20,
        glyph: ["💗", "💕", "🌸", "❤", "✨"][i % 5],
        drift: Math.random() * 60 - 30,
      })),
    [],
  );
  return (
    <div className="garden-hearts" aria-hidden>
      {hearts.map((h, i) => (
        <span
          key={i}
          className="g-heart"
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
            animationDuration: `${h.dur}s`,
            animationDelay: `${h.delay}s`,
            // @ts-expect-error custom prop
            "--drift": `${h.drift}px`,
          }}
        >
          {h.glyph}
        </span>
      ))}
    </div>
  );
}

export function GardenScene({ herName, onExit, onGrew }: { herName: string; onExit: () => void; onGrew?: () => void }) {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const [count, setCount] = useState(START_FLOWERS);

  // keep blooming on its own: +3 flowers every 2s until full
  useEffect(() => {
    if (count >= MAX_FLOWERS) return;
    const t = setTimeout(() => setCount((c) => Math.min(c + 3, MAX_FLOWERS)), 2000);
    return () => clearTimeout(t);
  }, [count]);

  const regrow = () => {
    setSeed(Math.floor(Math.random() * 1e9));
    setCount(START_FLOWERS);
  };

  return (
    <div className="garden-overlay">
      <FloatingHearts />
      <Canvas className="garden-canvas" dpr={[1, IS_MOBILE ? 2 : 1.7]} camera={{ position: [0, 3.3, 6.7], fov: 56 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
        <fog attach="fog" args={["#070608", 12, 30]} />
        <FitCamera />
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} />
          <directionalLight position={[5, 8, 6]} intensity={2.2} color="#fff4ea" />
          <directionalLight position={[-5, 3, -5]} intensity={1.1} color="#9cc0ff" />
          <pointLight position={[0, 4.2, 3]} intensity={0.9} color="#ffe3ef" distance={14} />

          <Vase3D />
          <RoseBouquet key={seed} seed={seed} count={count} onDone={onGrew} />

          <OrbitControls target={[0, 3.1, 0]} enablePan={false} enableZoom minDistance={3} maxDistance={26} minPolarAngle={0.2} maxPolarAngle={1.62} autoRotate autoRotateSpeed={0.5} enableDamping />
        </Suspense>
      </Canvas>

      <button className="garden-close" onClick={onExit} aria-label="close">
        ✕
      </button>
      <div className="garden-title">
        For <span className="script">{herName}</span> 🌷
      </div>
      <div className="garden-hint">drag to rotate · scroll to zoom · {count} blooms{count < MAX_FLOWERS ? " · still blooming…" : ""}</div>
      <div className="garden-controls">
        <button className="btn ghost small dark" onClick={regrow}>
          Grow again 🌱
        </button>
      </div>
    </div>
  );
}
