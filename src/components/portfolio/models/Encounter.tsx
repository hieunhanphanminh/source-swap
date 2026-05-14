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

// Brushes that pop slightly (kept for shape definition through the haze).
const POP_BRUSHES = new Set(["Marker", "TaperedMarker", "TaperedFlat"]);
// Brushes that should recede (background paper/tape).
const RECEDE_BRUSHES = new Set(["DuctTape", "Paper"]);

// Inject a soft rim falloff + heavy desaturation so painted strokes fade
// gently into the white luminous fog while additive brushes still glow.
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
           // Heavy desaturation: pull strokes 65% toward grayscale for the
           // dreamy washed-out monochrome look.
           diffuseColor.rgb = mix(diffuseColor.rgb, vec3(lum), 0.65);
         #endif
         float ndv = abs(dot(normalize(vWorldNormal), normalize(vViewDir)));
         float rim = mix(0.85, 1.0, smoothstep(0.0, 0.55, ndv));
         diffuseColor.rgb *= rim;
         // Lift toward white so marker contrast softens into the haze.
         diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.95), 0.18);`,
      );
  };
};

// ---------------------------------------------------------------------------
// Module-level caches. Keyed by the source material/scene so that re-mounts
// (e.g. navigating between gallery items) reuse GPU resources instead of
// allocating new Materials/Textures every time.
// ---------------------------------------------------------------------------
const materialCache = new WeakMap<THREE.Material, THREE.Material>();
const sceneCache = new WeakMap<THREE.Object3D, THREE.Group>();

const buildMaterial = (
  m: THREE.MeshStandardMaterial,
  maxAniso: number,
): THREE.Material => {
  const cached = materialCache.get(m);
  if (cached) return cached;

  const map = m.map ?? (m as any).baseColorTexture ?? null;
  if (map) {
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = maxAniso;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    map.magFilter = THREE.LinearFilter;
    map.generateMipmaps = true;
    map.needsUpdate = true;
  }

  const isAdditive = ADDITIVE_BRUSHES.has(m.name);

  const baseColor = new THREE.Color(
    m.color?.r ?? 1,
    m.color?.g ?? 1,
    m.color?.b ?? 1,
  );
  if (POP_BRUSHES.has(m.name)) {
    baseColor.offsetHSL(0, -0.4, 0.1);
  } else if (RECEDE_BRUSHES.has(m.name)) {
    baseColor.offsetHSL(0, -0.5, 0.2);
  } else {
    baseColor.offsetHSL(0, -0.35, 0.05);
  }

  const next = new THREE.MeshBasicMaterial({
    map,
    color: baseColor,
    vertexColors: true,
    transparent: true,
    opacity: m.opacity ?? 1,
    alphaTest: isAdditive ? 0 : 0.05,
    depthWrite: !isAdditive,
    blending: isAdditive ? THREE.AdditiveBlending : THREE.NormalBlending,
    side: THREE.DoubleSide,
    toneMapped: !isAdditive,
    fog: true,
  });
  next.name = m.name;

  if (!isAdditive) patchSurfaceShader(next);

  materialCache.set(m, next);
  return next;
};

const buildScene = (
  source: THREE.Object3D,
  maxAniso: number,
): THREE.Group => {
  const cached = sceneCache.get(source);
  if (cached) return cached;

  const root = source.clone(true) as THREE.Group;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!(mesh as any).isMesh) return;

    const src = mesh.material as
      | THREE.MeshStandardMaterial
      | THREE.MeshStandardMaterial[];
    if (Array.isArray(src)) {
      mesh.material = src.map((s) => buildMaterial(s, maxAniso));
    } else if (src) {
      mesh.material = buildMaterial(src, maxAniso);
    }
  });

  sceneCache.set(source, root);
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
