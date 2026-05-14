import { useScroll } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";
import { usePortalStore } from "@/stores";
import { Encounter } from "../../models/Encounter";

const Gallery = () => {
  const isActive = usePortalStore((s) => s.activePortalId === "gallery");
  const data = useScroll();

  useEffect(() => {
    data.el.style.overflow = isActive ? "hidden" : "auto";
  }, [isActive]);

  return (
    <group>
      <Encounter
        rotation={new THREE.Euler(0, Math.PI / 6, 0)}
        scale={new THREE.Vector3(1.5, 1.5, 1.5)}
        position={new THREE.Vector3(0, -1, -1)}
      />
    </group>
  );
};

export default Gallery;
