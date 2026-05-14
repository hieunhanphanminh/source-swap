import { ContactShadows, useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";
import { usePortalStore } from "@/stores";
import { GALLERY_ITEMS } from "@/constants/gallery";
import { useGalleryLightboxStore } from "@/stores/galleryLightboxStore";
import { Encounter } from "../../models/Encounter";
import { TouchPanControls } from "../projects/TouchPanControls";
import GalleryTile from "./GalleryTile";

// Full 360° arc — equal angular spacing.
const FOV = Math.PI * 2;
const COUNT = GALLERY_ITEMS.length;
const DISTANCE = Math.max(13, (6 * COUNT) / (2 * Math.PI));
const STEP = FOV / COUNT;
// Base group offset so tile #0 sits nicely framed at scene start.
const BASE_GROUP_ROTATION = -Math.PI / 12;

// Pre-compute tile transforms once.
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

  // Animate the carousel so the chosen tile sits at the front, then open lightbox.
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

const GALLERY_BG = new THREE.Color("#cfe6f5");
const GALLERY_FOG = new THREE.FogExp2("#f4faff", 0.07);
const GALLERY_PITCH = THREE.MathUtils.degToRad(-4);
const GALLERY_FOV = 58;

const Gallery = () => {
  const { camera, scene, gl } = useThree();
  const isActive = usePortalStore((s) => s.activePortalId === "gallery");
  const data = useScroll();

  useEffect(() => {
    data.el.style.overflow = isActive ? "hidden" : "auto";
    if (!isActive) return;

    // Snapshot prior scene state so we restore on exit.
    const prevBg = scene.background;
    const prevFog = scene.fog;
    const prevExposure = gl.toneMappingExposure;
    const prevFov = (camera as THREE.PerspectiveCamera).fov;

    scene.background = GALLERY_BG;
    scene.fog = GALLERY_FOG;
    gl.toneMappingExposure = 1.18;
    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      (camera as THREE.PerspectiveCamera).fov = GALLERY_FOV;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }

    if (isMobile) {
      gsap.to(camera.position, { z: 11.5, y: -39, x: 1, duration: 1 });
    } else {
      gsap.to(camera.position, { y: -39, x: 2, duration: 1 });
    }

    return () => {
      scene.background = prevBg;
      scene.fog = prevFog;
      gl.toneMappingExposure = prevExposure;
      if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
        (camera as THREE.PerspectiveCamera).fov = prevFov;
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      }
    };
  }, [isActive, camera, scene, gl, data.el]);

  // Desktop: follow-the-cursor pan with a soft cinematic downward pitch.
  useFrame((state, delta) => {
    if (!isActive || isMobile) return;
    camera.rotation.y = THREE.MathUtils.lerp(
      camera.rotation.y,
      -(state.pointer.x * Math.PI) / 4,
      0.03,
    );
    camera.rotation.x = THREE.MathUtils.lerp(
      camera.rotation.x,
      GALLERY_PITCH + state.pointer.y * 0.04,
      0.03,
    );
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      11.5 - state.pointer.y,
      7,
      delta,
    );
  });

  const encounterRef = useRef<THREE.Group>(null);
  const baseY = -1;

  useFrame((state) => {
    if (!encounterRef.current) return;
    const t = state.clock.elapsedTime;
    encounterRef.current.position.y = baseY + Math.sin(t * 0.6) * 0.15;
    encounterRef.current.rotation.y += 0.0008;
  });

  return (
    <group>
      <group ref={encounterRef} position={[0, baseY, -1]} rotation={[0, Math.PI / 6, 0]}>
        <Encounter scale={new THREE.Vector3(1.5, 1.5, 1.5)} />
      </group>
      <ContactShadows
        position={[0, -1.65, -1]}
        opacity={0.45}
        scale={6}
        blur={2.4}
        far={3}
        color="#1a0a14"
      />
      <GalleryCarousel />
      {isActive && isMobile && <TouchPanControls maxRotation={Math.PI} />}
    </group>
  );
};

export default Gallery;
