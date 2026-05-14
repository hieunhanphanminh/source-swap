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

// Brushes that should pop (saturated marker strokes).
const POP_BRUSHES = new Set(["Marker", "TaperedMarker", "TaperedFlat"]);
// Brushes that should recede (background paper/tape).
const RECEDE_BRUSHES = new Set(["DuctTape", "Paper"]);

// Inject a cheap rim-darken (NdotV falloff) + vertex-color saturation lift
// into MeshBasicMaterial. Adds depth + punch without real lights.
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
           diffuseColor.rgb *= mix(vec3(lum), vColor.rgb / max(vColor.rgb, vec3(0.0001)) * vColor.rgb, 1.0);
           diffuseColor.rgb = mix(vec3(lum), diffuseColor.rgb, 1.25);
         #endif
         float ndv = abs(dot(normalize(vWorldNormal), normalize(vViewDir)));
         float rim = mix(0.65, 1.0, smoothstep(0.0, 0.55, ndv));
         diffuseColor.rgb *= rim;`,
      );
  };
};

export function Encounter(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/encounter.glb");
  const gl = useThree((s) => s.gl);
  const maxAniso = useMemo(() => gl.capabilities.getMaxAnisotropy(), [gl]);

  const cloned = useMemo(() => {
    const root = scene.clone(true);
    const cache = new Map<THREE.Material, THREE.Material>();

    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!(mesh as any).isMesh) return;

      const apply = (m: THREE.MeshStandardMaterial): THREE.Material => {
        const cached = cache.get(m);
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

        // Per-brush color treatment so the model pops against the plum sky.
        const baseColor = new THREE.Color(
          m.color?.r ?? 1,
          m.color?.g ?? 1,
          m.color?.b ?? 1,
        );
        if (POP_BRUSHES.has(m.name)) {
          baseColor.offsetHSL(0, 0.15, 0.05);
        } else if (RECEDE_BRUSHES.has(m.name)) {
          baseColor.offsetHSL(0, -0.2, 0);
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
          toneMapped: false,
        });
        next.name = m.name;

        if (!isAdditive) patchSurfaceShader(next);

        cache.set(m, next);
        return next;
      };

      const src = mesh.material as
        | THREE.MeshStandardMaterial
        | THREE.MeshStandardMaterial[];
      if (Array.isArray(src)) {
        mesh.material = src.map(apply);
      } else if (src) {
        mesh.material = apply(src);
      }
    });

    return root;
  }, [scene, maxAniso]);

  return (
    <group {...props} dispose={null}>
      <primitive object={cloned} />
    </group>
  );
}

useGLTF.preload("models/encounter.glb");
