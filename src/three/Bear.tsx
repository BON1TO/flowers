import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { CONFIG } from "../config";

const FUR = "#b67c46";
const FURD = "#9a6437";
const TAN = "#e6d3ac";
const DARK = "#2c1a10";
const BOW = "#e5457f";
const damp = THREE.MathUtils.damp;

const WALK_END = 4.0;
const WAVE_END = 6.8;

/**
 * A round "chibi" plush teddy: one big body with short, deeply-embedded stubby
 * limbs (sharing the same material) so it reads as a single stuffed toy rather
 * than parts bolted together.
 */
export function Bear() {
  const root = useRef<THREE.Group>(null!);
  const lArm = useRef<THREE.Group>(null!);
  const rArm = useRef<THREE.Group>(null!);
  const lLeg = useRef<THREE.Group>(null!);
  const rLeg = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const t0 = useRef(-1);
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  const START = useMemo(() => new THREE.Vector3(4.2, 0, 1.9), []);
  const SIT = useMemo(() => new THREE.Vector3(1.6, 0, 0.9), []);

  useFrame((state, dt) => {
    if (t0.current < 0) t0.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - t0.current;
    const g = root.current;
    const la = lArm.current;
    const ra = rArm.current;
    const ll = lLeg.current;
    const rl = rLeg.current;
    const hd = head.current;
    if (!g || !la || !ra || !ll || !rl || !hd) return;

    if (t < WALK_END) {
      if (stage !== 0) setStage(0);
      const p = Math.min(t / WALK_END, 1);
      const e = 1 - Math.pow(1 - p, 2);
      g.position.lerpVectors(START, SIT, e);
      const step = Math.sin(t * 5.4); // plush waddle
      g.position.y = Math.abs(step) * 0.1;
      g.rotation.y = damp(g.rotation.y, -Math.PI / 2, 6, dt);
      g.rotation.z = step * 0.18; // rock
      g.rotation.x = damp(g.rotation.x, 0.03, 6, dt);
      ll.rotation.x = step * 0.35;
      rl.rotation.x = -step * 0.35;
      ll.rotation.z = 0;
      rl.rotation.z = 0;
      la.rotation.x = -step * 0.4;
      ra.rotation.x = step * 0.4;
      la.rotation.z = 0.2;
      ra.rotation.z = -0.2;
      hd.rotation.z = step * 0.03;
    } else if (t < WAVE_END) {
      if (stage !== 1) setStage(1);
      g.position.lerp(SIT, 0.22);
      g.position.y = damp(g.position.y, 0, 9, dt);
      g.rotation.y = damp(g.rotation.y, 0.18, 6, dt);
      g.rotation.z = damp(g.rotation.z, 0, 8, dt);
      g.rotation.x = damp(g.rotation.x, 0, 8, dt);
      ll.rotation.x = damp(ll.rotation.x, 0, 8, dt);
      rl.rotation.x = damp(rl.rotation.x, 0, 8, dt);
      la.rotation.x = damp(la.rotation.x, 0, 8, dt);
      la.rotation.z = damp(la.rotation.z, 0.2, 8, dt);
      const wt = t - WALK_END;
      ra.rotation.x = damp(ra.rotation.x, 0, 8, dt);
      ra.rotation.z = -2.0 + Math.sin(wt * 11) * 0.45; // raise + wave
      hd.rotation.x = damp(hd.rotation.x, -0.05, 8, dt);
      hd.rotation.z = Math.sin(wt * 5.5) * 0.07;
    } else {
      if (stage !== 2) setStage(2);
      g.position.lerp(SIT, 0.22);
      g.position.y = damp(g.position.y, -0.22, 6, dt); // settle the round body onto the ground
      g.rotation.y = damp(g.rotation.y, -0.2, 5, dt);
      g.rotation.z = damp(g.rotation.z, 0, 6, dt);
      g.rotation.x = damp(g.rotation.x, 0, 6, dt);
      ll.rotation.x = damp(ll.rotation.x, -1.2, 6, dt); // little feet out front
      rl.rotation.x = damp(rl.rotation.x, -1.16, 6, dt);
      ll.rotation.z = damp(ll.rotation.z, 0.18, 6, dt);
      rl.rotation.z = damp(rl.rotation.z, -0.18, 6, dt);
      la.rotation.x = damp(la.rotation.x, -0.35, 6, dt);
      la.rotation.z = damp(la.rotation.z, 0.28, 6, dt);
      ra.rotation.x = damp(ra.rotation.x, -0.35, 6, dt);
      ra.rotation.z = damp(ra.rotation.z, -0.28, 6, dt);
      hd.rotation.x = damp(hd.rotation.x, 0, 6, dt);
      hd.rotation.z = Math.sin(state.clock.elapsedTime * 1.4) * 0.05;
    }
  });

  const fur = <meshStandardMaterial color={FUR} roughness={0.95} />;
  const furD = <meshStandardMaterial color={FURD} roughness={0.95} />;
  const tan = <meshStandardMaterial color={TAN} roughness={0.9} />;

  return (
    <group ref={root} position={[4.2, 0, 1.9]} scale={1.05}>
      {/* one big round body */}
      <mesh position={[0, 0.62, 0]} scale={[1, 1.14, 0.98]}>
        <sphereGeometry args={[0.56, 32, 26]} />
        {fur}
      </mesh>
      {/* belly patch */}
      <mesh position={[0, 0.55, 0.42]} scale={[0.72, 0.92, 0.5]}>
        <sphereGeometry args={[0.38, 22, 18]} />
        {tan}
      </mesh>

      {/* stubby legs — short nubs embedded in the lower body */}
      <group ref={lLeg} position={[-0.26, 0.26, 0.14]}>
        <mesh position={[0, -0.08, 0.04]} scale={[1, 0.95, 1.35]}>
          <sphereGeometry args={[0.2, 18, 16]} />
          {fur}
        </mesh>
        <mesh position={[0, -0.11, 0.24]} scale={[0.72, 0.5, 0.75]}>
          <sphereGeometry args={[0.13, 14, 12]} />
          {tan}
        </mesh>
      </group>
      <group ref={rLeg} position={[0.26, 0.26, 0.14]}>
        <mesh position={[0, -0.08, 0.04]} scale={[1, 0.95, 1.35]}>
          <sphereGeometry args={[0.2, 18, 16]} />
          {fur}
        </mesh>
        <mesh position={[0, -0.11, 0.24]} scale={[0.72, 0.5, 0.75]}>
          <sphereGeometry args={[0.13, 14, 12]} />
          {tan}
        </mesh>
      </group>

      {/* stubby arms — short nubs embedded in the sides */}
      <group ref={lArm} position={[-0.52, 0.8, 0.04]}>
        <mesh position={[0, -0.14, 0]} scale={[0.95, 1.25, 0.95]}>
          <sphereGeometry args={[0.17, 18, 16]} />
          {fur}
        </mesh>
        <mesh position={[0, -0.28, 0.05]} scale={[0.8, 0.7, 0.6]}>
          <sphereGeometry args={[0.12, 14, 12]} />
          {tan}
        </mesh>
      </group>
      <group ref={rArm} position={[0.52, 0.8, 0.04]}>
        <mesh position={[0, -0.14, 0]} scale={[0.95, 1.25, 0.95]}>
          <sphereGeometry args={[0.17, 18, 16]} />
          {fur}
        </mesh>
        <mesh position={[0, -0.28, 0.05]} scale={[0.8, 0.7, 0.6]}>
          <sphereGeometry args={[0.12, 14, 12]} />
          {tan}
        </mesh>
      </group>

      {/* bow tie */}
      <group position={[0, 1.02, 0.44]}>
        <mesh position={[-0.11, 0, 0]} rotation={[0, 0, 0.5]}>
          <coneGeometry args={[0.1, 0.18, 4]} />
          <meshStandardMaterial color={BOW} roughness={0.5} />
        </mesh>
        <mesh position={[0.11, 0, 0]} rotation={[0, 0, -0.5 + Math.PI]}>
          <coneGeometry args={[0.1, 0.18, 4]} />
          <meshStandardMaterial color={BOW} roughness={0.5} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshStandardMaterial color="#c22e64" roughness={0.5} />
        </mesh>
      </group>

      {/* head (overlaps the body so they read as one form) */}
      <group ref={head} position={[0, 1.28, 0.04]}>
        <mesh scale={[1.06, 1, 1]}>
          <sphereGeometry args={[0.44, 30, 24]} />
          {fur}
        </mesh>
        {/* ears + inner ears */}
        <mesh position={[-0.31, 0.32, -0.02]}>
          <sphereGeometry args={[0.16, 18, 16]} />
          {fur}
        </mesh>
        <mesh position={[0.31, 0.32, -0.02]}>
          <sphereGeometry args={[0.16, 18, 16]} />
          {fur}
        </mesh>
        <mesh position={[-0.31, 0.33, 0.07]} scale={[0.8, 0.9, 0.6]}>
          <sphereGeometry args={[0.1, 14, 12]} />
          {furD}
        </mesh>
        <mesh position={[0.31, 0.33, 0.07]} scale={[0.8, 0.9, 0.6]}>
          <sphereGeometry args={[0.1, 14, 12]} />
          {furD}
        </mesh>
        {/* muzzle + nose */}
        <mesh position={[0, -0.08, 0.33]} scale={[1.05, 0.85, 0.72]}>
          <sphereGeometry args={[0.2, 22, 18]} />
          {tan}
        </mesh>
        <mesh position={[0, -0.01, 0.5]} scale={[1.25, 0.9, 1]}>
          <sphereGeometry args={[0.055, 14, 12]} />
          <meshStandardMaterial color={DARK} roughness={0.4} />
        </mesh>
        {/* eyes + highlights */}
        <mesh position={[-0.16, 0.09, 0.38]}>
          <sphereGeometry args={[0.055, 14, 12]} />
          <meshStandardMaterial color={DARK} roughness={0.25} />
        </mesh>
        <mesh position={[0.16, 0.09, 0.38]}>
          <sphereGeometry args={[0.055, 14, 12]} />
          <meshStandardMaterial color={DARK} roughness={0.25} />
        </mesh>
        <mesh position={[-0.145, 0.12, 0.42]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.175, 0.12, 0.42]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>

      {stage === 1 && (
        <Html position={[0, 2.25, 0]} center zIndexRange={[30, 0]} pointerEvents="none">
          <div className="bear-speech">{CONFIG.bearMessage}</div>
        </Html>
      )}
    </group>
  );
}
