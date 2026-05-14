import { useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { Suspense, useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";
import { usePortalStore } from "@/stores";
import { GALLERY_ITEMS } from "@/constants/gallery";
import { Encounter } from "../../models/Encounter";
import { TouchPanControls } from "../projects/TouchPanControls";
import GalleryTile from "./GalleryTile";

const GalleryCarousel = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const isActive = usePortalStore((s) => s.activePortalId === "gallery");
  const activeId = isActive ? selectedId : null;

  const onClick = (id: number) => {
    if (!isMobile) return;
    setSelectedId(id === selectedId ? null : id);
  };

  const tiles = useMemo(() => {
    // Full 360° arc — equal angular spacing.
    const fov = Math.PI * 2;
    const count = GALLERY_ITEMS.length;
    // Distance scales with count so chord arc-length stays comfortable
    // (target ~6 units between adjacent tile centers).
    const distance = Math.max(13, (6 * count) / (2 * Math.PI));
    return GALLERY_ITEMS.map((item, i) => {
      const angle = (fov / count) * i;
      const x = -distance * Math.cos(angle);
      const z = -distance * Math.sin(angle);
      const rotY = Math.PI / 2 - angle;
      return (
        <Suspense key={item.id} fallback={null}>
          <GalleryTile
            item={item}
            index={i}
            position={[x, 1, z]}
            rotation={[0, rotY, 0]}
            activeId={activeId}
            onClick={() => onClick(i)}
          />
        </Suspense>
      );
    });
  }, [activeId, isActive]);

  return <group rotation={[0, -Math.PI / 12, 0]}>{tiles}</group>;
};

const Gallery = () => {
  const { camera } = useThree();
  const isActive = usePortalStore((s) => s.activePortalId === "gallery");
  const data = useScroll();

  useEffect(() => {
    data.el.style.overflow = isActive ? "hidden" : "auto";
    if (isActive) {
      if (isMobile) {
        gsap.to(camera.position, { z: 11.5, y: -39, x: 1, duration: 1 });
      } else {
        gsap.to(camera.position, { y: -39, x: 2, duration: 1 });
      }
    }
  }, [isActive]);

  // Desktop: follow-the-cursor pan (matches Projects/Reasons scene).
  useFrame((state, delta) => {
    if (!isActive || isMobile) return;
    camera.rotation.y = THREE.MathUtils.lerp(
      camera.rotation.y,
      -(state.pointer.x * Math.PI) / 4,
      0.03,
    );
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      11.5 - state.pointer.y,
      7,
      delta,
    );
  });

  return (
    <group>
      <Encounter
        rotation={new THREE.Euler(0, Math.PI / 6, 0)}
        scale={new THREE.Vector3(1.5, 1.5, 1.5)}
        position={new THREE.Vector3(0, -1, -1)}
      />
      <GalleryCarousel />
      {isActive && isMobile && <TouchPanControls maxRotation={Math.PI} />}
    </group>
  );
};

export default Gallery;
