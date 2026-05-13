import * as THREE from "three";
import { JSX, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

const SOFT_TINT = new THREE.Color("#f1c6d6");
const SOFT_EMISSIVE = new THREE.Color("#3a1430");

export function Encounter(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/encounter.glb");
  const { gl } = useThree();
  const maxAniso = useMemo(() => gl.capabilities.getMaxAnisotropy?.() ?? 1, [gl]);

  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;

      // Perf: skip shadow work entirely + tighter culling.
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.frustumCulled = true;

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const newMats = mats.map((m) => {
        const mat = (m as THREE.Material).clone() as THREE.Material & {
          color?: THREE.Color;
          emissive?: THREE.Color;
          emissiveIntensity?: number;
          roughness?: number;
          metalness?: number;
          toneMapped?: boolean;
          map?: THREE.Texture | null;
          normalMap?: THREE.Texture | null;
          roughnessMap?: THREE.Texture | null;
          metalnessMap?: THREE.Texture | null;
          emissiveMap?: THREE.Texture | null;
          aoMap?: THREE.Texture | null;
        };

        if (mat.color) mat.color.lerp(SOFT_TINT, 0.45).multiplyScalar(0.85);
        if (mat.emissive) {
          mat.emissive.lerp(SOFT_EMISSIVE, 0.6).multiplyScalar(0.2);
          if (typeof mat.emissiveIntensity === "number") {
            mat.emissiveIntensity = Math.min(mat.emissiveIntensity, 0.4);
          }
        }
        if (typeof mat.roughness === "number") mat.roughness = 0.85;
        if (typeof mat.metalness === "number") mat.metalness = 0.1;
        mat.toneMapped = true;

        // Perf: reduce GPU sampling cost on textures, drop heavy maps.
        const tuneTex = (t?: THREE.Texture | null) => {
          if (!t) return;
          t.anisotropy = Math.min(2, maxAniso);
          t.minFilter = THREE.LinearMipmapLinearFilter;
          t.magFilter = THREE.LinearFilter;
          t.generateMipmaps = true;
        };
        tuneTex(mat.map);
        tuneTex(mat.emissiveMap);
        // Drop expensive secondary maps on mid-range hardware.
        mat.normalMap = null;
        mat.roughnessMap = null;
        mat.metalnessMap = null;
        mat.aoMap = null;

        mat.needsUpdate = true;
        return mat;
      });
      mesh.material = Array.isArray(mesh.material) ? newMats : newMats[0];
    });
    return clone;
  }, [scene, maxAniso]);

  return (
    <group {...props} dispose={null}>
      <primitive object={cloned} />
    </group>
  );
}

useGLTF.preload("models/encounter.glb");
