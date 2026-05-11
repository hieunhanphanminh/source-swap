import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";
import { usePortalStore } from "@/stores";
import { GALLERY_PHOTOS } from "@/constants/gallery";

const PhotoTile = ({ src, position, rotation }: {
  src: string;
  position: [number, number, number];
  rotation: [number, number, number];
}) => {
  const tex = useTexture(src);
  // Cap aniso/encoding for perf
  if (tex) {
    tex.anisotropy = 4;
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
  }
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.08;
    }
  });
  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[1.6, 2.1]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
};

const Gallery = () => {
  const { camera } = useThree();
  const isActive = usePortalStore((s) => s.activePortalId === "gallery");

  useEffect(() => {
    if (isActive) {
      gsap.to(camera.position, { x: 1.4, y: -42, z: 12, duration: 1 });
    }
  }, [isActive]);

  useFrame((state, delta) => {
    if (isActive && !isMobile) {
      camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -(state.pointer.x * Math.PI) / 8, 0.04);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, 12 - state.pointer.y * 0.6, 6, delta);
    }
  });

  return (
    <group rotation={[0, -Math.PI / 12, 0]}>
      <ambientLight intensity={0.9} />
      {GALLERY_PHOTOS.map((p, i) => {
        const angle = (Math.PI / GALLERY_PHOTOS.length) * i - Math.PI / 4;
        const r = 4.5;
        return (
          <PhotoTile
            key={i}
            src={p.src}
            position={[Math.cos(angle) * r, 0, -Math.sin(angle) * r - 1]}
            rotation={[0, angle + Math.PI / 2, 0]}
          />
        );
      })}
    </group>
  );
};

export default Gallery;
