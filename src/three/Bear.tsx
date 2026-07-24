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

const dampV = (v: THREE.Vector3, x: number, y: number, z: number, l: number, dt: number) => {
  v.x = damp(v.x, x, l, dt);
  v.y = damp(v.y, y, l, dt);
  v.z = damp(v.z, z, l, dt);
};

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
      const step = Math.sin(t * 6.2); // slower, cuter cadence
      g.position.y = Math.abs(step) * 0.06; // bob on each step
      g.rotation.y = damp(g.rotation.y, -Math.PI / 2, 6, dt); // face the way it walks
      g.rotation.z = step * 0.12; // side-to-side waddle
      g.rotation.x = damp(g.rotation.x, 0.08, 6, dt); // lean into the walk
      dampV(ll.position, -0.22, 0.34, 0, 10, dt);
      dampV(rl.position, 0.22, 0.34, 0, 10, dt);
      ll.rotation.x = step * 0.75;
      rl.rotation.x = -step * 0.75;
      ll.rotation.z = 0;
      rl.rotation.z = 0;
      la.rotation.x = -step * 0.6;
      ra.rotation.x = step * 0.6;
      la.rotation.z = 0.16;
      ra.rotation.z = -0.16;
      hd.rotation.x = Math.abs(step) * 0.06;
      hd.rotation.z = step * 0.03;
    } else if (t < WAVE_END) {
      if (stage !== 1) setStage(1);
      g.position.lerp(SIT, 0.22);
      g.position.y = damp(g.position.y, 0, 9, dt);
      g.rotation.y = damp(g.rotation.y, 0.18, 6, dt); // turn to the viewer
      g.rotation.z = damp(g.rotation.z, 0, 8, dt);
      g.rotation.x = damp(g.rotation.x, 0, 8, dt);
      dampV(ll.position, -0.22, 0.34, 0, 8, dt);
      dampV(rl.position, 0.22, 0.34, 0, 8, dt);
      ll.rotation.x = damp(ll.rotation.x, 0, 8, dt);
      rl.rotation.x = damp(rl.rotation.x, 0, 8, dt);
      la.rotation.x = damp(la.rotation.x, 0, 8, dt);
      la.rotation.z = damp(la.rotation.z, 0.16, 8, dt);
      const wt = t - WALK_END;
      ra.rotation.x = damp(ra.rotation.x, 0, 8, dt);
      ra.rotation.z = -2.2 + Math.sin(wt * 11) * 0.45; // raise + wave
      hd.rotation.x = damp(hd.rotation.x, -0.05, 8, dt);
      hd.rotation.z = Math.sin(wt * 5.5) * 0.07;
    } else {
      if (stage !== 2) setStage(2);
      g.position.lerp(SIT, 0.22);
      g.position.y = damp(g.position.y, -0.05, 6, dt);
      g.rotation.y = damp(g.rotation.y, -0.22, 5, dt);
      g.rotation.z = damp(g.rotation.z, 0, 6, dt);
      g.rotation.x = damp(g.rotation.x, 0, 6, dt);
      // drop the hips to the ground and push them forward so the legs stretch
      // out in front instead of folding up into the belly
      dampV(ll.position, -0.28, 0.1, 0.16, 6, dt);
      dampV(rl.position, 0.28, 0.1, 0.16, 6, dt);
      ll.rotation.x = damp(ll.rotation.x, -1.55, 6, dt);
      rl.rotation.x = damp(rl.rotation.x, -1.5, 6, dt);
      ll.rotation.z = damp(ll.rotation.z, 0.32, 6, dt);
      rl.rotation.z = damp(rl.rotation.z, -0.32, 6, dt);
      la.rotation.x = damp(la.rotation.x, -0.6, 6, dt);
      la.rotation.z = damp(la.rotation.z, 0.24, 6, dt);
      ra.rotation.x = damp(ra.rotation.x, -0.6, 6, dt);
      ra.rotation.z = damp(ra.rotation.z, -0.24, 6, dt);
      hd.rotation.x = damp(hd.rotation.x, 0, 6, dt);
      hd.rotation.z = Math.sin(state.clock.elapsedTime * 1.4) * 0.05; // idle
    }
  });

  const fur = <meshStandardMaterial color={FUR} roughness={0.95} />;
  const furD = <meshStandardMaterial color={FURD} roughness={0.95} />;
  const tan = <meshStandardMaterial color={TAN} roughness={0.9} />;

  return (
    <group ref={root} position={[4.2, 0, 1.9]} scale={1.0}>
      {/* legs (chubby, with paw pads) */}
      <group ref={lLeg} position={[-0.22, 0.34, 0]}>
        <mesh position={[0, -0.2, 0.05]} rotation={[0.25, 0, 0]}>
          <capsuleGeometry args={[0.17, 0.2, 8, 14]} />
          {fur}
        </mesh>
        <mesh position={[0, -0.34, 0.2]} scale={[1, 0.8, 1.25]}>
          <sphereGeometry args={[0.17, 16, 14]} />
          {fur}
        </mesh>
        <mesh position={[0, -0.36, 0.32]} scale={[0.7, 0.5, 0.8]}>
          <sphereGeometry args={[0.12, 14, 12]} />
          {tan}
        </mesh>
      </group>
      <group ref={rLeg} position={[0.22, 0.34, 0]}>
        <mesh position={[0, -0.2, 0.05]} rotation={[0.25, 0, 0]}>
          <capsuleGeometry args={[0.17, 0.2, 8, 14]} />
          {fur}
        </mesh>
        <mesh position={[0, -0.34, 0.2]} scale={[1, 0.8, 1.25]}>
          <sphereGeometry args={[0.17, 16, 14]} />
          {fur}
        </mesh>
        <mesh position={[0, -0.36, 0.32]} scale={[0.7, 0.5, 0.8]}>
          <sphereGeometry args={[0.12, 14, 12]} />
          {tan}
        </mesh>
      </group>

      {/* body + belly */}
      <mesh position={[0, 0.66, 0]} scale={[1, 1.08, 0.92]}>
        <sphereGeometry args={[0.46, 28, 22]} />
        {fur}
      </mesh>
      <mesh position={[0, 0.6, 0.34]} scale={[0.72, 0.95, 0.55]}>
        <sphereGeometry args={[0.32, 20, 16]} />
        {tan}
      </mesh>

      {/* bow tie */}
      <group position={[0, 1.0, 0.36]}>
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

      {/* arms (chubby, paw pads) */}
      <group ref={lArm} position={[-0.47, 0.94, 0.02]}>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.145, 0.2, 8, 14]} />
          {fur}
        </mesh>
        <mesh position={[0, -0.37, 0.03]}>
          <sphereGeometry args={[0.145, 14, 12]} />
          {fur}
        </mesh>
        <mesh position={[0, -0.4, 0.13]} scale={[0.7, 0.7, 0.5]}>
          <sphereGeometry args={[0.1, 12, 10]} />
          {tan}
        </mesh>
      </group>
      <group ref={rArm} position={[0.47, 0.94, 0.02]}>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.145, 0.2, 8, 14]} />
          {fur}
        </mesh>
        <mesh position={[0, -0.37, 0.03]}>
          <sphereGeometry args={[0.145, 14, 12]} />
          {fur}
        </mesh>
        <mesh position={[0, -0.4, 0.13]} scale={[0.7, 0.7, 0.5]}>
          <sphereGeometry args={[0.1, 12, 10]} />
          {tan}
        </mesh>
      </group>

      {/* head */}
      <group ref={head} position={[0, 1.24, 0.02]}>
        <mesh scale={[1.05, 1, 1]}>
          <sphereGeometry args={[0.4, 28, 22]} />
          {fur}
        </mesh>
        {/* ears + inner ears */}
        <mesh position={[-0.29, 0.3, -0.02]}>
          <sphereGeometry args={[0.15, 16, 14]} />
          {fur}
        </mesh>
        <mesh position={[0.29, 0.3, -0.02]}>
          <sphereGeometry args={[0.15, 16, 14]} />
          {fur}
        </mesh>
        <mesh position={[-0.29, 0.31, 0.06]} scale={[0.8, 0.9, 0.6]}>
          <sphereGeometry args={[0.09, 14, 12]} />
          {furD}
        </mesh>
        <mesh position={[0.29, 0.31, 0.06]} scale={[0.8, 0.9, 0.6]}>
          <sphereGeometry args={[0.09, 14, 12]} />
          {furD}
        </mesh>
        {/* muzzle + nose */}
        <mesh position={[0, -0.07, 0.3]} scale={[1.05, 0.85, 0.72]}>
          <sphereGeometry args={[0.18, 20, 16]} />
          {tan}
        </mesh>
        <mesh position={[0, 0.0, 0.46]} scale={[1.2, 0.9, 1]}>
          <sphereGeometry args={[0.05, 14, 12]} />
          <meshStandardMaterial color={DARK} roughness={0.4} />
        </mesh>
        {/* eyes with highlights */}
        <mesh position={[-0.15, 0.09, 0.34]}>
          <sphereGeometry args={[0.05, 14, 12]} />
          <meshStandardMaterial color={DARK} roughness={0.25} />
        </mesh>
        <mesh position={[0.15, 0.09, 0.34]}>
          <sphereGeometry args={[0.05, 14, 12]} />
          <meshStandardMaterial color={DARK} roughness={0.25} />
        </mesh>
        <mesh position={[-0.135, 0.12, 0.375]}>
          <sphereGeometry args={[0.017, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.165, 0.12, 0.375]}>
          <sphereGeometry args={[0.017, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* speech bubble while waving */}
      {stage === 1 && (
        <Html position={[0, 2.15, 0]} center zIndexRange={[30, 0]} pointerEvents="none">
          <div className="bear-speech">{CONFIG.bearMessage}</div>
        </Html>
      )}
    </group>
  );
}
