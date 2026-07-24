import * as THREE from "three";

const CREAM = "#efe4c9";

function Book({ position, rotation, cover, w = 0.8, d = 0.58 }: { position: [number, number, number]; rotation: number; cover: string; w?: number; d?: number }) {
  const coverMat = <meshStandardMaterial color={cover} roughness={0.55} />;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* pages */}
      <mesh position={[0.015, 0, 0]}>
        <boxGeometry args={[w - 0.06, 0.11, d - 0.05]} />
        <meshStandardMaterial color={CREAM} roughness={0.9} />
      </mesh>
      {/* top + bottom covers */}
      <mesh position={[0, 0.075, 0]}>
        <boxGeometry args={[w, 0.03, d]} />
        {coverMat}
      </mesh>
      <mesh position={[0, -0.075, 0]}>
        <boxGeometry args={[w, 0.03, d]} />
        {coverMat}
      </mesh>
      {/* spine */}
      <mesh position={[-w / 2 + 0.02, 0, 0]}>
        <boxGeometry args={[0.05, 0.17, d]} />
        {coverMat}
      </mesh>
    </group>
  );
}

/** two books lying flat, stacked, to the left of the vase */
export function Books() {
  return (
    <group position={[-1.55, 0.09, 0.6]}>
      <Book position={[0, 0, 0]} rotation={0.28} cover="#b23a5a" w={0.86} d={0.6} />
      <Book position={[0.06, 0.17, -0.04]} rotation={0.12} cover="#5a4bbf" w={0.78} d={0.54} />
    </group>
  );
}
