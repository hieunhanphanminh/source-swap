import { JSX, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Tilt Brush brushes that should render additively (light-emitting) vs.
// regular surface brushes that render with normal alpha blending.
const ADDITIVE_BRUSHES = new Set([
  "Light",
  "LightWire",
  "Highlighter",
  "SoftHighlighter",
  "Splatter",
]);

export function Encounter(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/encounter.glb");

  // Clone so we can swap materials without mutating the cached GLTF (and so
  // multiple <Encounter /> instances don't share state).
  const cloned = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!(mesh as any).isMesh) return;

      const src = mesh.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[];
      const apply = (m: THREE.MeshStandardMaterial): THREE.Material => {
        const map = m.map ?? (m as any).baseColorTexture ?? null;
        if (map) {
          map.colorSpace = THREE.SRGBColorSpace;
          map.needsUpdate = true;
        }
        const isAdditive = ADDITIVE_BRUSHES.has(m.name);
        // Unlit material so the model is visible without scene lighting,
        // matching how Tilt Brush brushes are normally previewed.
        const next = new THREE.MeshBasicMaterial({
          map,
          color: new THREE.Color(
            m.color?.r ?? 1,
            m.color?.g ?? 1,
            m.color?.b ?? 1,
          ),
          transparent: true,
          opacity: m.opacity ?? 1,
          alphaTest: isAdditive ? 0 : 0.05,
          depthWrite: !isAdditive,
          blending: isAdditive ? THREE.AdditiveBlending : THREE.NormalBlending,
          side: THREE.DoubleSide,
          toneMapped: false,
        });
        next.name = m.name;
        return next;
      };

      if (Array.isArray(src)) {
        mesh.material = src.map(apply);
      } else if (src) {
        mesh.material = apply(src);
      }
    });
    return root;
  }, [scene]);

  return (
    <group {...props} dispose={null}>
      <primitive object={cloned} />
    </group>
  );
}

useGLTF.preload("models/encounter.glb");
