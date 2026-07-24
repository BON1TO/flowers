import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { headGeometry, headMaterial } from "./flowerHead";
import { makeLeafGeometry } from "./petal";
import { FLOWERS_3D_BY_KEY } from "./flowers3d";

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const MOUTH_Y = 1.34;
const HEAD = 0.72;
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const smooth = (x: number) => {
  x = clamp01(x);
  return x * x * (3 - 2 * x);
};
const back = (x: number) => {
  x = clamp01(x);
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};
const frac = (x: number) => x - Math.floor(x);
const rand = (i: number, seed: number, salt: number) => frac(Math.sin(i * 127.1 + seed * 0.017 + salt * 311.7) * 43758.5453);

const MIX = ["rose", "peony", "rose", "lily", "peony", "tulip", "rose", "lavender", "peony", "rose", "lily", "tulip", "rose", "peony"];
const UP = new THREE.Vector3(0, 1, 0);

const stemMat = new THREE.MeshStandardMaterial({ color: "#4c7a44", roughness: 0.8, emissive: new THREE.Color("#14311a"), emissiveIntensity: 0.22 });
const leafMat = new THREE.MeshStandardMaterial({ color: "#5c9a50", roughness: 0.6, side: THREE.DoubleSide, emissive: new THREE.Color("#1c3a1a"), emissiveIntensity: 0.22 });
const leafGeoShared = makeLeafGeometry(0.55, 0.22);

function domeDir(i: number) {
  // interleave two families so the bouquet is full in every direction:
  //  - even i  -> a dense UPRIGHT column (tall flowers up top)
  //  - odd  i  -> spread out to the sides and CASCADE downward as more are added
  const k = Math.floor(i / 2);
  const phi = i * GOLDEN;
  let cosT: number;
  if (i % 2 === 0) {
    cosT = 0.6 + frac(k * 0.317) * 0.38; // 0.60 .. 0.98 (pointing up)
  } else {
    cosT = Math.max(0.9 - k * 0.05, 0.08); // up -> out to the sides, but never below the rim
  }
  const sinT = Math.sqrt(1 - cosT * cosT);
  return new THREE.Vector3(Math.cos(phi) * sinT, cosT, Math.sin(phi) * sinT).normalize();
}

interface Leaf {
  mesh: THREE.Mesh;
  t: number;
}
interface Inst {
  curve: THREE.QuadraticBezierCurve3;
  tube: THREE.Mesh;
  idxCount: number;
  ringStep: number;
  head: THREE.Group;
  headMesh: THREE.Mesh;
  headSize: number;
  leaves: Leaf[];
  delay: number;
  bornAt: number | null;
  phase: number;
}

export function RoseBouquet({ seed, count, spread = 1, mouthY = MOUTH_Y, heightBoost = 1, onDone }: { seed: number; count: number; spread?: number; mouthY?: number; heightBoost?: number; onDone?: () => void }) {
  const root = useMemo(() => new THREE.Group(), [seed]);
  const instances = useRef<Inst[]>([]);
  const built = useRef(0);
  const doneRef = useRef(false);

  const make = (i: number, appended: boolean): Inst => {
    const recipe = FLOWERS_3D_BY_KEY[MIX[i % MIX.length]];
    const d = domeDir(i);
    // narrow the bouquet (pull flowers more upright) on phones so nothing clips off the sides
    if (spread !== 1) {
      d.x *= spread;
      d.z *= spread;
      d.normalize();
    }
    const L = (1.3 + Math.max(d.y, 0) * 1.9 + rand(i, seed, 1) * 1.4) * heightBoost; // taller toward the top, shorter cascading ones

    // curved stem: rises up first, then arcs toward its dome direction
    const bx = (rand(i, seed, 2) - 0.5) * 0.45;
    const bz = (rand(i, seed, 3) - 0.5) * 0.45;
    const base = new THREE.Vector3(bx, 0, bz);
    const tip = base.clone().add(d.clone().multiplyScalar(L));
    const bend = 0.35 + rand(i, seed, 5) * 0.3;
    const ctrl = base.clone().add(new THREE.Vector3(0, L * (0.45 + bend * 0.4), 0)).add(d.clone().multiplyScalar(L * 0.22));
    const curve = new THREE.QuadraticBezierCurve3(base, ctrl, tip);

    const flower = new THREE.Group();
    flower.position.set(0, mouthY - 0.06, 0);
    root.add(flower);

    const tubeGeo = new THREE.TubeGeometry(curve, 26, 0.028, 5, false);
    const idxCount = tubeGeo.index ? tubeGeo.index.count : 0;
    tubeGeo.setDrawRange(0, 0);
    const tube = new THREE.Mesh(tubeGeo, stemMat);
    flower.add(tube);

    // leaves along the stem
    const leaves: Leaf[] = [];
    const leafTs = [0.34, 0.6];
    leafTs.forEach((t, li) => {
      const tan = curve.getTangentAt(t).normalize();
      let side = new THREE.Vector3().crossVectors(tan, UP);
      if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
      side.normalize().multiplyScalar(li % 2 === 0 ? 1 : -1);
      const leafDir = tan.clone().multiplyScalar(0.35).add(side.multiplyScalar(0.9)).normalize();
      const m = new THREE.Mesh(leafGeoShared, leafMat);
      m.position.copy(curve.getPointAt(t));
      m.quaternion.setFromUnitVectors(UP, leafDir);
      m.scale.setScalar(0.001);
      flower.add(m);
      leaves.push({ mesh: m, t });
    });

    const head = new THREE.Group();
    const headMesh = new THREE.Mesh(headGeometry(recipe), headMaterial(recipe));
    head.add(headMesh);
    head.scale.setScalar(0.001);
    flower.add(head);

    const headSize = HEAD * (0.85 + Math.max(d.y, 0) * 0.25) * recipe.headScale;
    return { curve, tube, idxCount, ringStep: 5 * 6, head, headMesh, headSize, leaves, delay: appended ? 0 : i * 0.07, bornAt: null, phase: i * 1.3 };
  };

  useEffect(() => {
    instances.current = [];
    built.current = 0;
    doneRef.current = false;
    for (let i = 0; i < count; i++) instances.current.push(make(i, false));
    built.current = count;
    return () => instances.current.forEach((inst) => inst.tube.geometry.dispose());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  useEffect(() => {
    while (built.current < count) {
      instances.current.push(make(built.current, true));
      built.current++;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useFrame((state) => {
    const now = state.clock.elapsedTime;
    let growing = false;
    for (const inst of instances.current) {
      if (inst.bornAt == null) inst.bornAt = now;
      const age = now - inst.bornAt - inst.delay;
      const gStem = easeOut(age / 0.95);

      const rings = Math.floor((inst.idxCount / inst.ringStep) * gStem);
      inst.tube.geometry.setDrawRange(0, Math.max(0, rings * inst.ringStep));

      for (const lf of inst.leaves) {
        const lg = smooth((gStem - lf.t) / 0.08);
        lf.mesh.scale.setScalar(Math.max(0.001, lg));
      }

      // the bloom rides the tip of the growing stem, then opens
      const gp = Math.min(gStem, 1);
      const pt = inst.curve.getPointAt(gp);
      inst.head.position.copy(pt);
      inst.head.quaternion.setFromUnitVectors(UP, inst.curve.getTangentAt(Math.min(gp, 0.999)).normalize());
      const bloom = clamp01((gStem - 0.5) / 0.5);
      const vis = clamp01(gStem / 0.12);
      inst.head.scale.setScalar(Math.max(0.001, inst.headSize * (0.16 + 0.84 * back(bloom)) * vis));
      inst.headMesh.rotation.z = Math.sin(now * 0.7 + inst.phase) * 0.04 * bloom;

      if (age < 1.4) growing = true;
    }
    root.rotation.z = Math.sin(now * 0.4) * 0.01;
    if (!doneRef.current && !growing && instances.current.length) {
      doneRef.current = true;
      onDone?.();
    }
  });

  return <primitive object={root} />;
}
