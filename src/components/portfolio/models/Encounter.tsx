import { JSX } from "react";
import { useGLTF } from "@react-three/drei";

export function Encounter(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/encounter.glb");
  return (
    <group {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("models/encounter.glb");
