import { useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { Suspense, useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";
import { usePortalStore } from "@/stores";
import { GALLERY_ITEMS } from "@/constants/gallery";
import { Encounter } from "../../models/Encounter";
import GalleryTile from "./GalleryTile";
import { TouchPanControls } from "../projects/TouchPanControls";

const GalleryCarousel = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const isActive = usePortalStore((s) => s.activePortalId === "gallery");
  const activeId = isActive ? selectedId : null;

  const onClick = (id: number) => {
    if (!isMobile) return;
    setSelectedId(id === selectedId ? null : id);
  };

  const tiles = useMemo(() => {
    const distance = 13;
    const count = GALLERY_ITEMS.length;
    const fovFull = Math.PI * 2;
    return GALLERY_ITEMS.map((item, i) => {
      const angle = (fovFull / count) * i;
      const z = -distance * Math.sin(angle);
      const x = -distance * Math.cos(angle);
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
  const isActive = usePortalStore((s) => s.activePortalId === "gallery");
  const data = useScroll();

  useEffect(() => {
    data.el.style.overflow = isActive ? "hidden" : "auto";
    // Camera stays in its original scroll-driven position (first angle).
  }, [isActive]);

  return (
    <group>
      {/* Encounter model — same slot/scale as Wanderer so it inherits all triggers */}
      <Encounter
        rotation={new THREE.Euler(0, Math.PI / 6, 0)}
        scale={new THREE.Vector3(1.5, 1.5, 1.5)}
        position={new THREE.Vector3(0, -1, -1)}
      />
      <GalleryCarousel />
      {isActive && isMobile && <TouchPanControls />}
    </group>
  );
};

export default Gallery;
