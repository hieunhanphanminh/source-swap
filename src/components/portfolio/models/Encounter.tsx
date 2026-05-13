import * as THREE from "three";
import { JSX, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

export function Encounter(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/encounter.glb");
  const { gl } = useThree();
  const maxAniso = useMemo(() => gl.capabilities.getMaxAnisotropy?.() ?? 1, [gl]);

  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;

      // Perf: skip shadow work + tighter culling.
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.frustumCulled = true;

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        const mat = m as THREE.MeshStandardMaterial & {
          map?: THREE.Texture | null;
          emissiveMap?: THREE.Texture | null;
          normalMap?: THREE.Texture | null;
          roughnessMap?: THREE.Texture | null;
          metalnessMap?: THREE.Texture | null;
          aoMap?: THREE.Texture | null;
        };
        const tuneTex = (t?: THREE.Texture | null) => {
          if (!t) return;
          t.anisotropy = Math.min(2, maxAniso);
          t.minFilter = THREE.LinearMipmapLinearFilter;
          t.magFilter = THREE.LinearFilter;
          t.generateMipmaps = true;
        };
        tuneTex(mat.map);
        tuneTex(mat.emissiveMap);
        mat.normalMap = null;
        mat.roughnessMap = null;
        mat.metalnessMap = null;
        mat.aoMap = null;

        // Tame overexposed painterly look — restore contrast & detail.
        mat.toneMapped = true;
        if (mat.color) mat.color.multiplyScalar(0.78);
        if (mat.emissive) {
          mat.emissive.multiplyScalar(0.25);
          if ("emissiveIntensity" in mat) mat.emissiveIntensity = 0.2;
        }
        if ("roughness" in mat) mat.roughness = Math.min(1, (mat.roughness ?? 0.5) + 0.25);
        if ("metalness" in mat) mat.metalness = Math.max(0, (mat.metalness ?? 0) - 0.2);
        if ("envMapIntensity" in mat) mat.envMapIntensity = 0.4;

        // Height-based fog: denser near ground, thinner aloft.
        // Injected into the standard fog include so Three's linear Fog still drives color/near/far.
        mat.onBeforeCompile = (shader) => {
          shader.uniforms.uFogGround = { value: -2.0 };
          shader.uniforms.uFogBand = { value: 5.5 };
          shader.uniforms.uFogGroundBoost = { value: 0.65 };

          shader.vertexShader = shader.vertexShader
            .replace(
              "#include <fog_pars_vertex>",
              `#include <fog_pars_vertex>\nvarying float vWorldY;`,
            )
            .replace(
              "#include <fog_vertex>",
              `#include <fog_vertex>\nvWorldY = (modelMatrix * vec4(position, 1.0)).y;`,
            );

          shader.fragmentShader = shader.fragmentShader
            .replace(
              "#include <fog_pars_fragment>",
              `#include <fog_pars_fragment>\nvarying float vWorldY;\nuniform float uFogGround;\nuniform float uFogBand;\nuniform float uFogGroundBoost;`,
            )
            .replace(
              "#include <fog_fragment>",
              `#ifdef USE_FOG
                 #ifdef FOG_EXP2
                   float fogFactor = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
                 #else
                   float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
                 #endif
                 float heightT = 1.0 - clamp((vWorldY - uFogGround) / uFogBand, 0.0, 1.0);
                 fogFactor = clamp(fogFactor + heightT * uFogGroundBoost * (1.0 - fogFactor), 0.0, 1.0);
                 gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
               #endif`,
            );
        };
        mat.needsUpdate = true;
      });
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
