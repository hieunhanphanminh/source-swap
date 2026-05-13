import { useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { Suspense, useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";
import { usePortalStore } from "@/stores";
import { GALLERY_ITEMS } from "@/constants/gallery";
import { Encounter } from "../../models/Encounter";

import CloudContainer from "../../models/Cloud";
import SakuraPetals from "../../models/SakuraPetals";
import FloatingHearts from "./FloatingHearts";

const ROMANTIC_CLOUD_COLORS = ["#ffb3d1", "#ffcfa8", "#d9b8ff", "#ff9ec7", "#ffae7a", "#ffb3d1"];
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

  // Deep plum romantic sky + soft pink fog while the gallery portal is active.
  useEffect(() => {
    if (!isActive) return;
    const prevBg = scene.background;
    const prevFog = scene.fog;
    scene.background = new THREE.Color("#0b0510");
    scene.fog = new THREE.Fog("#1a0a1a", 18, 70);
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
      {/* Romantic remix — sunset hemisphere + pink/lavender rim lights against deep plum */}
      <ambientLight intensity={0.35} color="#ffd8e6" />
      <hemisphereLight args={["#ffb1c8", "#3a1430", 0.6]} />
      <pointLight position={[6, 4, 6]} intensity={1.2} color="#ff8fb1" distance={45} />
      <pointLight position={[-6, -2, 4]} intensity={0.9} color="#c98bff" distance={45} />
      <pointLight position={[0, -8, -10]} intensity={0.6} color="#ff5d8f" distance={55} />
      <pointLight position={[0, 6, -8]} intensity={0.7} color="#ffb27a" distance={50} />

      {/* Encounter model — local coords inside the rotated experience group, same slot Wanderer used */}
      <Encounter
        rotation={new THREE.Euler(0, Math.PI / 6, 0)}
        scale={new THREE.Vector3(0.1, 0.1, 0.1)}
        position={new THREE.Vector3(0, -1, -1)}
      />

      {/* Drifting hearts + glow halos around the gallery camera */}
      <FloatingHearts centerY={-39} />

      {/* Romantic dreamy add-ons — tinted clouds + sakura petals */}
      <group position={[0, -39, 0]}>
        <CloudContainer colors={ROMANTIC_CLOUD_COLORS} opacity={0.55} />
        <SakuraPetals count={90} centerY={0} radius={22} height={26} />
      </group>
      <GalleryCarousel />
      {isActive && isMobile && <TouchPanControls />}
    </group>
  );
};

export default Gallery;
