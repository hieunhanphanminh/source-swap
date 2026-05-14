import { JSX, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// Tilt Brush brushes that should render additively (light-emitting).
const ADDITIVE_BRUSHES = new Set([
  "Light",
  "LightWire",
  "Highlighter",
  "SoftHighlighter",
  "Splatter",
]);

// Brushes that should pop (saturated marker strokes). Reduced for the
// dreamy washed-out gallery look — light desaturation only.
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
           // Heavy desaturation toward monochrome haze.
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
// Module-level caches: persist across mounts so navigating between
// gallery items does not re-clone the scene or rebuild materials.
// ---------------------------------------------------------------
const sceneCache = new WeakMap<THREE.Object3D, THREE.Object3D>();
const materialCache = new WeakMap<THREE.Material, THREE.Material>();
const textureConfigured = new WeakSet<THREE.Texture>();

const buildMaterial = (
  src: THREE.MeshStandardMaterial,
  maxAniso: number,
): THREE.Material => {
  const cached = materialCache.get(src);
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

  materialCache.set(src, next);
  return next;
};

const buildScene = (scene: THREE.Object3D, maxAniso: number): THREE.Object3D => {
  const cached = sceneCache.get(scene);
  if (cached) return cached;

  const root = scene.clone(true);
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!(mesh as any).isMesh) return;
    const src = mesh.material as
      | THREE.MeshStandardMaterial
      | THREE.MeshStandardMaterial[];
    if (Array.isArray(src)) {
      mesh.material = src.map((m) => buildMaterial(m, maxAniso));
    } else if (src) {
      mesh.material = buildMaterial(src, maxAniso);
    }
  });

  sceneCache.set(scene, root);
  return root;
};

export function Encounter(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/encounter.glb");
  const gl = useThree((s) => s.gl);
  const maxAniso = useMemo(() => gl.capabilities.getMaxAnisotropy(), [gl]);
  const cloned = useMemo(() => buildScene(scene, maxAniso), [scene, maxAniso]);

  return (
    <group {...props} dispose={null}>
      <primitive object={cloned} />
    </group>
  );
}

useGLTF.preload("models/encounter.glb");
