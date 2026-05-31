import { Environment, Sparkles, useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";
import { usePortalStore } from "@/stores";
import { GALLERY_ITEMS } from "@/constants/gallery";
import { useGalleryLightboxStore } from "@/stores/galleryLightboxStore";
import { Wanderer } from "../../models/Wanderer";
import { TouchPanControls } from "../projects/TouchPanControls";
import GalleryTile from "./GalleryTile";

// Half-arc layout (matches reasons/projects section).
const FOV = Math.PI;
const COUNT = GALLERY_ITEMS.length;
const DISTANCE = 13;
const STEP = FOV / COUNT;
const BASE_GROUP_ROTATION = -Math.PI / 12;

const TILE_TRANSFORMS = GALLERY_ITEMS.map((_, i) => {
  const angle = STEP * i;
  return {
    position: [-DISTANCE * Math.cos(angle), 1, -DISTANCE * Math.sin(angle)] as [
      number,
      number,
      number,
    ],
    rotation: [0, Math.PI / 2 - angle, 0] as [number, number, number],
    angle,
  };
});


const GalleryCarousel = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const isActive = usePortalStore((s) => s.activePortalId === "gallery");
  const openLightbox = useGalleryLightboxStore((s) => s.open);
  const activeId = isActive ? selectedIndex : null;

  const focusTile = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      const targetRot = BASE_GROUP_ROTATION + TILE_TRANSFORMS[index].angle;
      if (groupRef.current) {
        gsap.to(groupRef.current.rotation, {
          y: targetRot,
          duration: 0.9,
          ease: "power3.out",
          onComplete: () => openLightbox(GALLERY_ITEMS[index]),
        });
      } else {
        openLightbox(GALLERY_ITEMS[index]);
      }
    },
    [openLightbox],
  );

  const tiles = useMemo(
    () =>
      GALLERY_ITEMS.map((item, i) => {
        const t = TILE_TRANSFORMS[i];
        return (
          <Suspense key={item.id} fallback={null}>
            <GalleryTile
              item={item}
              index={i}
              position={t.position}
              rotation={t.rotation}
              activeId={activeId}
              onClick={() => focusTile(i)}
            />
          </Suspense>
        );
      }),
    [activeId, focusTile],
  );

  return (
    <group ref={groupRef} rotation={[0, BASE_GROUP_ROTATION, 0]}>
      {tiles}
    </group>
  );
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
  }, [isActive, camera, data.el]);

  useFrame((state, delta) => {
    if (isActive) {
      if (!isMobile) {
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
      }
    }
  });

  return (
    <group>
      <fog attach="fog" args={["#d8c9b8", 22, 70]} />
      <ambientLight intensity={0.5} color="#f3e8d8" />
      <hemisphereLight args={["#fde6c4", "#3a2d22", 0.6]} />
      <directionalLight position={[6, 12, 4]} intensity={0.9} color="#ffd9a8" />
      <Environment preset="dawn" />

      {/* World props anchored near the focused camera (y ≈ -39) */}
      <group position={[0, -40, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#cbb89a" roughness={1} metalness={0} />
        </mesh>
        <Sparkles count={80} scale={[40, 8, 40]} size={3} speed={0.3} color="#fff1d6" />
        <Wanderer
          rotation={new THREE.Euler(0, Math.PI / 6, 0)}
          scale={new THREE.Vector3(1.5, 1.5, 1.5)}
          position={new THREE.Vector3(3, 0, -6)}
        />
      </group>

      <GalleryCarousel />
      {isActive && isMobile && <TouchPanControls maxRotation={Math.PI} />}
    </group>
  );

};

export default Gallery;
