import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { CONFIG } from "../config";

const FUR = "#b17a45";
const FURD = "#8c5c30";
const TAN = "#e9d2ab";
const DARK = "#2f1d12";
const damp = THREE.MathUtils.damp;

const WALK_END = 3.6;
const WAVE_END = 6.4;

export function Bear() {
  const root = useRef<THREE.Group>(null!);
  const lArm = useRef<THREE.Group>(null!);
  const rArm = useRef<THREE.Group>(null!);
  const lLeg = useRef<THREE.Group>(null!);
  const rLeg = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const t0 = useRef(-1);
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  const START = useMemo(() => new THREE.Vector3(4.0, 0, 1.8), []);
  const SIT = useMemo(() => new THREE.Vector3(1.55, 0, 0.85), []);

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
      g.position.y = Math.abs(Math.sin(t * 9)) * 0.08; // bob
      g.rotation.y = damp(g.rotation.y, -Math.PI / 2, 6, dt); // face travel (-x)
      const sw = Math.sin(t * 9);
      ll.rotation.x = sw * 0.6;
      rl.rotation.x = -sw * 0.6;
      la.rotation.x = -sw * 0.5;
      ra.rotation.x = sw * 0.5;
      la.rotation.z = 0.12;
      ra.rotation.z = -0.12;
      hd.rotation.z = sw * 0.04;
    } else if (t < WAVE_END) {
      if (stage !== 1) setStage(1);
      g.position.lerp(SIT, 0.25);
      g.position.y = damp(g.position.y, 0, 9, dt);
      g.rotation.y = damp(g.rotation.y, 0.15, 6, dt); // turn to face the viewer
      ll.rotation.x = damp(ll.rotation.x, 0, 8, dt);
      rl.rotation.x = damp(rl.rotation.x, 0, 8, dt);
      la.rotation.x = damp(la.rotation.x, 0, 8, dt);
      la.rotation.z = damp(la.rotation.z, 0.15, 8, dt);
      const wt = t - WALK_END;
      ra.rotation.x = damp(ra.rotation.x, 0, 8, dt);
      ra.rotation.z = -2.15 + Math.sin(wt * 12) * 0.4; // raise + wave
      hd.rotation.z = Math.sin(wt * 6) * 0.06;
    } else {
      if (stage !== 2) setStage(2);
      g.position.lerp(SIT, 0.25);
      g.position.y = damp(g.position.y, -0.12, 6, dt); // settle onto the ground
      g.rotation.y = damp(g.rotation.y, -0.25, 5, dt);
      ll.rotation.x = damp(ll.rotation.x, -1.4, 6, dt);
      rl.rotation.x = damp(rl.rotation.x, -1.2, 6, dt);
      ll.rotation.z = damp(ll.rotation.z, 0.28, 6, dt);
      rl.rotation.z = damp(rl.rotation.z, -0.28, 6, dt);
      la.rotation.x = damp(la.rotation.x, -0.55, 6, dt);
      la.rotation.z = damp(la.rotation.z, 0.22, 6, dt);
      ra.rotation.x = damp(ra.rotation.x, -0.55, 6, dt);
      ra.rotation.z = damp(ra.rotation.z, -0.22, 6, dt);
      hd.rotation.z = Math.sin(state.clock.elapsedTime * 1.4) * 0.05; // gentle idle
    }
  });

  const fur = <meshStandardMaterial color={FUR} roughness={0.95} />;

  return (
    <group ref={root} position={[4.0, 0, 1.8]} scale={1.05}>
      {/* legs */}
      <group ref={lLeg} position={[-0.2, 0.33, 0]}>
        <mesh position={[0, -0.2, 0.02]}>
          <capsuleGeometry args={[0.15, 0.26, 6, 12]} />
          {fur}
        </mesh>
        <mesh position={[0, -0.36, 0.14]}>
          <sphereGeometry args={[0.15, 14, 12]} />
          <meshStandardMaterial color={FURD} roughness={0.95} />
        </mesh>
      </group>
      <group ref={rLeg} position={[0.2, 0.33, 0]}>
        <mesh position={[0, -0.2, 0.02]}>
          <capsuleGeometry args={[0.15, 0.26, 6, 12]} />
          {fur}
        </mesh>
        <mesh position={[0, -0.36, 0.14]}>
          <sphereGeometry args={[0.15, 14, 12]} />
          <meshStandardMaterial color={FURD} roughness={0.95} />
        </mesh>
      </group>

      {/* body + belly */}
      <mesh position={[0, 0.63, 0]} scale={[1, 1.12, 0.95]}>
        <sphereGeometry args={[0.44, 24, 20]} />
        {fur}
      </mesh>
      <mesh position={[0, 0.56, 0.34]} scale={[0.78, 1, 0.5]}>
        <sphereGeometry args={[0.3, 18, 14]} />
        <meshStandardMaterial color={TAN} roughness={0.95} />
      </mesh>

      {/* arms */}
      <group ref={lArm} position={[-0.45, 0.92, 0]}>
        <mesh position={[0, -0.22, 0]}>
          <capsuleGeometry args={[0.13, 0.24, 6, 12]} />
          {fur}
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.13, 12, 10]} />
          <meshStandardMaterial color={FURD} roughness={0.95} />
        </mesh>
      </group>
      <group ref={rArm} position={[0.45, 0.92, 0]}>
        <mesh position={[0, -0.22, 0]}>
          <capsuleGeometry args={[0.13, 0.24, 6, 12]} />
          {fur}
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.13, 12, 10]} />
          <meshStandardMaterial color={FURD} roughness={0.95} />
        </mesh>
      </group>

      {/* head */}
      <group ref={head} position={[0, 1.2, 0.02]}>
        <mesh>
          <sphereGeometry args={[0.36, 24, 20]} />
          {fur}
        </mesh>
        {/* ears */}
        <mesh position={[-0.26, 0.27, -0.02]}>
          <sphereGeometry args={[0.13, 14, 12]} />
          {fur}
        </mesh>
        <mesh position={[0.26, 0.27, -0.02]}>
          <sphereGeometry args={[0.13, 14, 12]} />
          {fur}
        </mesh>
        <mesh position={[-0.26, 0.27, 0.05]}>
          <sphereGeometry args={[0.07, 12, 10]} />
          <meshStandardMaterial color={TAN} roughness={0.95} />
        </mesh>
        <mesh position={[0.26, 0.27, 0.05]}>
          <sphereGeometry args={[0.07, 12, 10]} />
          <meshStandardMaterial color={TAN} roughness={0.95} />
        </mesh>
        {/* muzzle + nose */}
        <mesh position={[0, -0.05, 0.28]} scale={[1, 0.82, 0.72]}>
          <sphereGeometry args={[0.16, 16, 14]} />
          <meshStandardMaterial color={TAN} roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.0, 0.42]}>
          <sphereGeometry args={[0.052, 12, 10]} />
          <meshStandardMaterial color={DARK} roughness={0.5} />
        </mesh>
        {/* eyes */}
        <mesh position={[-0.13, 0.08, 0.31]}>
          <sphereGeometry args={[0.045, 12, 10]} />
          <meshStandardMaterial color={DARK} roughness={0.35} />
        </mesh>
        <mesh position={[0.13, 0.08, 0.31]}>
          <sphereGeometry args={[0.045, 12, 10]} />
          <meshStandardMaterial color={DARK} roughness={0.35} />
        </mesh>
      </group>

      {/* speech bubble while waving */}
      {stage === 1 && (
        <Html position={[0, 2.05, 0]} center zIndexRange={[30, 0]} pointerEvents="none">
          <div className="bear-speech">{CONFIG.bearMessage}</div>
        </Html>
      )}
    </group>
  );
}
