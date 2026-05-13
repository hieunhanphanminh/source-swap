import * as THREE from "three";
import { JSX, useMemo } from "react";
import { useGLTF } from "@react-three/drei";

const SOFT_TINT = new THREE.Color("#f1c6d6");
const SOFT_EMISSIVE = new THREE.Color("#3a1430");

export function Encounter(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/encounter.glb");

  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mesh.material = mats.map((m) => {
        const mat = (m as THREE.Material).clone() as THREE.Material & {
          color?: THREE.Color;
          emissive?: THREE.Color;
          emissiveIntensity?: number;
          roughness?: number;
          metalness?: number;
          toneMapped?: boolean;
        };
        if (mat.color) {
          mat.color.lerp(SOFT_TINT, 0.45).multiplyScalar(0.85);
        }
        if (mat.emissive) {
          mat.emissive.lerp(SOFT_EMISSIVE, 0.6).multiplyScalar(0.2);
          if (typeof mat.emissiveIntensity === "number") {
            mat.emissiveIntensity = Math.min(mat.emissiveIntensity, 0.4);
          }
        }
        if (typeof mat.roughness === "number") mat.roughness = 0.85;
        if (typeof mat.metalness === "number") mat.metalness = 0.1;
        mat.toneMapped = true;
        mat.needsUpdate = true;
        return mat;
      });
      if (!Array.isArray(mesh.material)) mesh.material = (mesh.material as THREE.Material[])[0];
    });
    return clone;
  }, [scene]);

  return (
    <group {...props} dispose={null}>
      <primitive object={cloned} />
    </group>
  );
}

useGLTF.preload("models/encounter.glb");
