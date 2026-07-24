import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { PerspectiveCamera } from "three";
import { RoseBouquet } from "./RoseBouquet";
import { Vase3D } from "./Vase3D";
import { Bear } from "./Bear";

const IS_MOBILE = typeof window !== "undefined" && (window.matchMedia("(pointer: coarse)").matches || Math.min(window.innerWidth, window.innerHeight) < 560);
const MAX_FLOWERS = IS_MOBILE ? 48 : 74;
const START_FLOWERS = IS_MOBILE ? 12 : 16;

/** a soft glow-pool under the vase so it sits grounded (a shadow alone can't show on the dark scene) */
function VaseFloor() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,170,205,0.55)");
    g.addColorStop(0.4, "rgba(150,70,110,0.2)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1.9, 48]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.55} />
    </mesh>
  );
}

/** keeps the whole bouquet framed no matter the aspect ratio (portrait phones included) */
function FitCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    const aspect = size.width / size.height;
    const vfov = (cam.fov * Math.PI) / 180;
    // keep the full wide bouquet on every device (contain to width => never clips the sides)
    const halfH = 3.5;
    const halfW = 3.0;
    const distH = halfH / Math.tan(vfov / 2);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    const distW = halfW / Math.tan(hfov / 2);
    const dist = Math.min(Math.max(Math.max(distH, distW) * 1.04, 4), 26);
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

          <VaseFloor />
          <Vase3D />
          <ContactShadows position={[0, 0.012, 0]} scale={2.6} blur={2.6} opacity={0.85} far={2.4} resolution={512} color="#1a0008" />
          <RoseBouquet key={seed} seed={seed} count={count} onDone={onGrew} />
          <Bear />

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
