import { useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { Suspense, useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";
import { usePortalStore } from "@/stores";
import { GALLERY_ITEMS } from "@/constants/gallery";
import { Wanderer } from "../../models/Wanderer";
import Aurora from "../../models/Aurora";
import FloatingHearts from "./FloatingHearts";
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
  const { camera, scene } = useThree();
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

  // Black sky while the gallery portal is active; restore on exit.
  useEffect(() => {
    if (!isActive) return;
    const prevBg = scene.background;
    const prevFog = scene.fog;
    scene.background = new THREE.Color(0x000000);
    scene.fog = null;
    return () => {
      scene.background = prevBg;
      scene.fog = prevFog;
    };
  }, [isActive, scene]);

  useFrame((state, delta) => {
    if (isActive && !isMobile) {
      camera.rotation.y = THREE.MathUtils.lerp(
        camera.rotation.y,
        -(state.pointer.x * Math.PI),
        0.03,
      );
      camera.position.z = THREE.MathUtils.damp(
        camera.position.z,
        11.5 - state.pointer.y,
        7,
        delta,
      );
    }
  });

  return (
    <group>
      {/* Romantic remix — dim ambient + pink/lavender rim lights against black */}
      <ambientLight intensity={0.25} color="#ffd8e6" />
      <pointLight position={[6, 4, 6]} intensity={1.0} color="#ff8fb1" distance={40} />
      <pointLight position={[-6, -2, 4]} intensity={0.8} color="#c98bff" distance={40} />
      <pointLight position={[0, -8, -10]} intensity={0.5} color="#ff5d8f" distance={50} />

      {/* Same dreamy wanderer silhouette as Reasons, tinted by the rose lights */}
      <Wanderer
        rotation={new THREE.Euler(0, Math.PI / 6, 0)}
        scale={new THREE.Vector3(1.5, 1.5, 1.5)}
        position={new THREE.Vector3(0, -1, -1)}
      />

      {/* Aurora curtains overhead */}
      <Suspense fallback={null}>
        <Aurora />
      </Suspense>

      {/* Drifting hearts + glow halos around the gallery camera */}
      <FloatingHearts centerY={-39} />

      <GalleryCarousel />
      {isActive && isMobile && <TouchPanControls />}
    </group>
  );
};

export default Gallery;
