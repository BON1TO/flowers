import * as THREE from "three";

export interface PetalParams {
  length: number;
  width: number;
  curl: number; // how far the petal bends backward/outward (radians of arc)
  cup: number; // sideways cupping (0 flat, >0 boat-shaped)
  tipPinch?: number; // 1 = normal, <1 pointier tip
  ruffle?: number; // wavy edge amount
  segU?: number;
  segV?: number;
}

/**
 * Builds a curved, cupped petal that grows along +Y from the base at the origin,
 * bending back along +Z as it rises. Symmetric across X.
 */
export function makePetalGeometry(p: PetalParams): THREE.BufferGeometry {
  const segU = p.segU ?? 10;
  const segV = p.segV ?? 6;
  const R = p.length / Math.max(p.curl, 0.001);
  const tipPinch = p.tipPinch ?? 1;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segU; i++) {
    const t = i / segU; // 0 base → 1 tip
    // width profile: narrow base, wide middle, tapering tip
    const wProfile = Math.pow(Math.sin(Math.PI * t), 0.62) * (1 - (1 - tipPinch) * t);
    const halfW = p.width * wProfile;

    // spine bends along an arc in the Y–Z plane
    const a = p.curl * t;
    const sy = R * Math.sin(a);
    const sz = R * (1 - Math.cos(a));

    // gentle ruffle near the tip
    const ruffle = p.ruffle ? Math.sin(t * Math.PI * 3) * p.ruffle * t : 0;

    for (let j = 0; j <= segV; j++) {
      const v = (j / segV) * 2 - 1; // -1 .. 1 across width
      const x = halfW * v;
      // cupping: edges lift toward +z
      const cupZ = p.cup * halfW * (v * v) + ruffle * (1 - Math.abs(v));
      positions.push(x, sy, sz + cupZ);
      uvs.push((v + 1) / 2, t);
    }
  }

  const row = segV + 1;
  for (let i = 0; i < segU; i++) {
    for (let j = 0; j < segV; j++) {
      const a = i * row + j;
      const b = a + row;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** A leaf is just a flatter, greener petal. */
export function makeLeafGeometry(length: number, width: number): THREE.BufferGeometry {
  return makePetalGeometry({ length, width, curl: 0.5, cup: 0.25, tipPinch: 0.4, segU: 8, segV: 5 });
}
