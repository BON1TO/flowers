import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { makePetalGeometry } from "./petal";
import type { Flower3D, Layer3D } from "./flowers3d";

const DEG = Math.PI / 180;

function addColor(geo: THREE.BufferGeometry, hex: string) {
  const c = new THREE.Color(hex);
  const n = geo.getAttribute("position").count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(arr, 3));
}

function petalGeo(layer: Layer3D): THREE.BufferGeometry {
  const geo = makePetalGeometry({ length: layer.length, width: layer.width, curl: layer.curl, cup: layer.cup, tipPinch: layer.tipPinch, ruffle: layer.ruffle, segU: 12, segV: 7 });
  const uv = geo.getAttribute("uv");
  const base = new THREE.Color(layer.color);
  const tip = new THREE.Color(layer.color2 ?? layer.color);
  const col = new Float32Array(uv.count * 3);
  for (let i = 0; i < uv.count; i++) {
    const c = base.clone().lerp(tip, Math.pow(uv.getY(i), 0.8));
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return geo;
}

const geoCache = new Map<string, THREE.BufferGeometry>();
const matCache = new Map<string, THREE.Material>();

/** a full, open flower head as one merged geometry (cached per species) */
export function headGeometry(recipe: Flower3D): THREE.BufferGeometry {
  const cached = geoCache.get(recipe.key);
  if (cached) return cached;
  const parts: THREE.BufferGeometry[] = [];
  recipe.layers.forEach((layer) => {
    const base = petalGeo(layer);
    const step = (Math.PI * 2) / layer.count;
    for (let k = 0; k < layer.count; k++) {
      const g = base.clone();
      const az = new THREE.Matrix4().makeRotationY(k * step);
      const trans = new THREE.Matrix4().makeTranslation(0, layer.yOffset ?? 0, 0);
      const tilt = new THREE.Matrix4().makeRotationX(layer.openDeg * DEG);
      g.applyMatrix4(az.multiply(trans).multiply(tilt));
      parts.push(g);
    }
    base.dispose();
  });
  const c = recipe.center;
  const cg = new THREE.SphereGeometry(c.radius, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  addColor(cg, c.color);
  parts.push(cg);
  const merged = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  geoCache.set(recipe.key, merged);
  return merged;
}

export function headMaterial(recipe: Flower3D): THREE.Material {
  const cached = matCache.get(recipe.key);
  if (cached) return cached;
  const mat = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    roughness: 0.42,
    clearcoat: 0.55,
    clearcoatRoughness: 0.35,
    sheen: 0.4,
    sheenColor: new THREE.Color(recipe.accent),
    emissive: new THREE.Color(recipe.accent),
    emissiveIntensity: 0.08,
  });
  matCache.set(recipe.key, mat);
  return mat;
}
