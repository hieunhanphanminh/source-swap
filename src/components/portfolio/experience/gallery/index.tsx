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

const LIGHT_BLUE = new THREE.Color("#dbeeff");

const Gallery = () => {
  const { camera, scene, gl } = useThree();
  const isActive = usePortalStore((s) => s.activePortalId === "gallery");
  const data = useScroll();

  // Apply dreamy snowy atmosphere only while the gallery portal is active.
  useEffect(() => {
    if (!isActive) return;

    const prevFog = scene.fog;
    const prevBg = scene.background;
    const prevTone = gl.toneMapping;
    const prevExp = gl.toneMappingExposure;
    const persp = camera as THREE.PerspectiveCamera;
    const prevFov = persp.isPerspectiveCamera ? persp.fov : null;
    const prevPitch = camera.rotation.x;

    scene.background = LIGHT_BLUE;
    scene.fog = new THREE.FogExp2("#ffffff", 0.055);
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.25;

    if (persp.isPerspectiveCamera) {
      persp.fov = 58;
      persp.updateProjectionMatrix();
    }

    return () => {
      scene.fog = prevFog;
      scene.background = prevBg;
      gl.toneMapping = prevTone;
      gl.toneMappingExposure = prevExp;
      if (persp.isPerspectiveCamera && prevFov !== null) {
        persp.fov = prevFov;
        persp.updateProjectionMatrix();
      }
      camera.rotation.x = prevPitch;
    };
  }, [isActive, scene, gl, camera]);

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

  // Desktop: follow-the-cursor pan with subtle downward pitch (~-4°).
  useFrame((state, delta) => {
    if (!isActive || isMobile) return;
    camera.rotation.y = THREE.MathUtils.lerp(
      camera.rotation.y,
      -(state.pointer.x * Math.PI) / 4,
      0.03,
    );
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, -0.07, 0.05);
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
      {/* Soft overexposed lighting: mostly ambient, faint directional fill. */}
      <ambientLight intensity={1.4} color="#ffffff" />
      <hemisphereLight args={["#ffffff", "#cfe3ff", 0.6]} />
      <directionalLight position={[4, 8, 6]} intensity={0.35} color="#ffffff" />

      <group ref={encounterRef} position={[0, baseY, -1]} rotation={[0, Math.PI / 6, 0]}>
        <Encounter scale={new THREE.Vector3(1.5, 1.5, 1.5)} />
      </group>
      <ContactShadows
        position={[0, -1.65, -1]}
        opacity={0.18}
        scale={6}
        blur={3.2}
        far={3}
        color="#a8b8c8"
      />
      <GalleryCarousel />
      {isActive && isMobile && <TouchPanControls maxRotation={Math.PI} />}
    </group>
  );
};

export default Gallery;
