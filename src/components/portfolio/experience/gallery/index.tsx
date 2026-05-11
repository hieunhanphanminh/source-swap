import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { usePortalStore } from "@/stores";
import { GALLERY_PHOTOS } from "@/constants/gallery";

const PhotoTile = ({ src, position, rotation, delay }: {
  src: string;
  position: [number, number, number];
  rotation: [number, number, number];
  delay: number;
}) => {
  const tex = useTexture(src);
  if (tex) {
    tex.anisotropy = 4;
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
  }
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + delay) * 0.08;
    }
  });
  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[0.95, 1.25]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
};

const Gallery = () => {
  const groupRef = useRef<THREE.Group>(null);
  const isActive = usePortalStore((s) => s.activePortalId === "gallery");

  useFrame((state, delta) => {
    if (groupRef.current) {
      const target = isActive ? state.pointer.x * 0.4 : 0;
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, target, 4, delta);
    }
  });

  // Lay out photos in a small grid that fits inside the portal plane.
  const cols = 3;
  const gap = 1.05;
  return (
    <group ref={groupRef}>
      <ambientLight intensity={1} />
      <color attach="background" args={["#d6c0c8"]} />
      {GALLERY_PHOTOS.map((p, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = (col - (cols - 1) / 2) * gap;
        const y = ((Math.ceil(GALLERY_PHOTOS.length / cols) - 1) / 2 - row) * 1.4;
        const z = -0.2 - (i % 2) * 0.15;
        const rot: [number, number, number] = [0, ((col - 1) * Math.PI) / 32, 0];
        return <PhotoTile key={i} src={p.src} position={[x, y, z]} rotation={rot} delay={i} />;
      })}
    </group>
  );
};

export default Gallery;
