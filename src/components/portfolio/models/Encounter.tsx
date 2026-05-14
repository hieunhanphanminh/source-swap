import { JSX, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";

const ADDITIVE_BRUSHES = new Set([
  "Light",
  "LightWire",
  "Highlighter",
  "SoftHighlighter",
  "Splatter",
]);
const POP_BRUSHES = new Set(["Marker", "TaperedMarker", "TaperedFlat"]);
const RECEDE_BRUSHES = new Set(["DuctTape", "Paper"]);

const patchSurfaceShader = (material: THREE.MeshBasicMaterial) => {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
         varying vec3 vViewDir;
         varying vec3 vWorldNormal;`,
      )
      .replace(
        "#include <fog_vertex>",
        `#include <fog_vertex>
         vWorldNormal = normalize(mat3(modelMatrix) * normal);
         vViewDir = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         varying vec3 vViewDir;
         varying vec3 vWorldNormal;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
         #ifdef USE_COLOR
           float lum = dot(vColor.rgb, vec3(0.3, 0.59, 0.11));
           diffuseColor.rgb = mix(vec3(lum), diffuseColor.rgb, 0.45);
         #endif
         float ndv = abs(dot(normalize(vWorldNormal), normalize(vViewDir)));
         float rim = mix(0.85, 1.0, smoothstep(0.0, 0.55, ndv));
         diffuseColor.rgb *= rim;`,
      );
  };
};

// ---------------------------------------------------------------
// Caches keyed by source URL so we can fully dispose on cleanup.
// Source-material → cloned-material lookup lives INSIDE each entry so
// disposing the entry releases all references and lets a remount rebuild
// fresh materials (a module-level WeakMap would hand back disposed clones).
// ---------------------------------------------------------------
type CacheEntry = {
  scene: THREE.Object3D;
  materials: Set<THREE.Material>;
  textures: Set<THREE.Texture>;
  geometries: Set<THREE.BufferGeometry>;
  bySource: Map<THREE.Material, THREE.Material>;
};
const urlCache = new Map<string, CacheEntry>();
const textureConfigured = new WeakSet<THREE.Texture>();

const buildMaterial = (
  src: THREE.MeshStandardMaterial,
  maxAniso: number,
  entry: CacheEntry,
): THREE.Material => {
  const cached = entry.bySource.get(src);
  if (cached) return cached;

  const map = src.map ?? (src as any).baseColorTexture ?? null;
  if (map && !textureConfigured.has(map)) {
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = maxAniso;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    map.magFilter = THREE.LinearFilter;
    map.generateMipmaps = true;
    map.needsUpdate = true;
    textureConfigured.add(map);
  }
  if (map) entry.textures.add(map);

  const isAdditive = ADDITIVE_BRUSHES.has(src.name);
  const baseColor = new THREE.Color(
    src.color?.r ?? 1,
    src.color?.g ?? 1,
    src.color?.b ?? 1,
  );
  if (POP_BRUSHES.has(src.name)) {
    baseColor.offsetHSL(0, -0.35, 0.1);
  } else if (RECEDE_BRUSHES.has(src.name)) {
    baseColor.offsetHSL(0, -0.4, 0.05);
  }

  const next = new THREE.MeshBasicMaterial({
    map,
    color: baseColor,
    vertexColors: true,
    transparent: true,
    opacity: src.opacity ?? 1,
    alphaTest: isAdditive ? 0 : 0.05,
    depthWrite: !isAdditive,
    blending: isAdditive ? THREE.AdditiveBlending : THREE.NormalBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  next.name = src.name;
  if (!isAdditive) patchSurfaceShader(next);

  entry.bySource.set(src, next);
  entry.materials.add(next);
  return next;
};

const remapMaterials = (
  mat: THREE.Material | THREE.Material[],
  maxAniso: number,
  entry: CacheEntry,
): THREE.Material | THREE.Material[] => {
  if (Array.isArray(mat)) {
    return mat.map((m) =>
      buildMaterial(m as THREE.MeshStandardMaterial, maxAniso, entry),
    );
  }
  return buildMaterial(mat as THREE.MeshStandardMaterial, maxAniso, entry);
};

const isMeshLike = (obj: THREE.Object3D): obj is THREE.Mesh =>
  (obj as any).isMesh === true || (obj as any).isSkinnedMesh === true;

const buildScene = (
  url: string,
  scene: THREE.Object3D,
  maxAniso: number,
): THREE.Object3D => {
  const cached = urlCache.get(url);
  if (cached) return cached.scene;

  // SkeletonUtils.clone preserves skinning bindings and works for plain
  // meshes too — covers mixed Mesh / SkinnedMesh hierarchies in one pass.
  const root = cloneSkeleton(scene);
  const entry: CacheEntry = {
    scene: root,
    materials: new Set(),
    textures: new Set(),
    geometries: new Set(),
    bySource: new Map(),
  };

  root.traverse((obj) => {
    if (!isMeshLike(obj)) return;
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) entry.geometries.add(mesh.geometry);
    if (!mesh.material) return;
    mesh.material = remapMaterials(mesh.material, maxAniso, entry);
  });

  urlCache.set(url, entry);
  return root;
};

export const disposeEncounterCache = (url?: string) => {
  const keys = url ? [url] : Array.from(urlCache.keys());
  for (const k of keys) {
    const entry = urlCache.get(k);
    if (!entry) continue;
    entry.materials.forEach((m) => m.dispose());
    entry.textures.forEach((t) => t.dispose());
    entry.geometries.forEach((g) => g.dispose());
    entry.bySource.clear();
    entry.materials.clear();
    entry.textures.clear();
    entry.geometries.clear();
    urlCache.delete(k);
  }
};

const MODEL_URL = "models/encounter.glb";

export function Encounter(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF(MODEL_URL);
  const gl = useThree((s) => s.gl);
  const maxAniso = useMemo(() => gl.capabilities.getMaxAnisotropy(), [gl]);
  const cloned = useMemo(
    () => buildScene(MODEL_URL, scene, maxAniso),
    [scene, maxAniso],
  );

  // Release this URL's cache when the model URL changes or the component
  // unmounts (e.g. user leaves the gallery).
  useEffect(() => {
    return () => disposeEncounterCache(MODEL_URL);
  }, []);

  return (
    <group {...props} dispose={null}>
      <primitive object={cloned} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
