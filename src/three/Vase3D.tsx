import { useMemo } from "react";
import * as THREE from "three";

export function Vase3D() {
  const profile = useMemo(
    () =>
      [
        [0.0, 0.0],
        [0.3, 0.0],
        [0.33, 0.07],
        [0.28, 0.2],
        [0.42, 0.52],
        [0.45, 0.8],
        [0.37, 1.08],
        [0.3, 1.26],
        [0.35, 1.42],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  );
  const bodyGeo = useMemo(() => new THREE.LatheGeometry(profile, 64), [profile]);

  return (
    <group>
      {/* ceramic body */}
      <mesh geometry={bodyGeo}>
        <meshPhysicalMaterial color="#ec86ac" roughness={0.28} metalness={0.02} clearcoat={0.7} clearcoatRoughness={0.28} side={THREE.DoubleSide} />
      </mesh>
      {/* closed base so you never see through it */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 48]} />
        <meshStandardMaterial color="#c96a8f" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* soft rim highlight */}
      <mesh position={[0, 1.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.345, 0.02, 10, 48]} />
        <meshStandardMaterial color="#ffd7e6" roughness={0.3} />
      </mesh>
      {/* satin ribbon around the neck */}
      <mesh position={[0, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.33, 0.05, 12, 48]} />
        <meshStandardMaterial color="#e5457f" roughness={0.4} />
      </mesh>
      <mesh position={[0.28, 1.12, 0.28]} rotation={[0, -0.8, 0.5]}>
        <torusGeometry args={[0.09, 0.035, 10, 24]} />
        <meshStandardMaterial color="#f06a92" roughness={0.4} />
      </mesh>
    </group>
  );
}
