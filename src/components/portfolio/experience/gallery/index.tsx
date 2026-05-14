import { useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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

  // Desktop drag-pan with inertia (independent of mobile TouchPanControls).
  const dragRef = useRef({
    dragging: false,
    lastX: 0,
    velocity: 0,
    target: 0,
  });

  useEffect(() => {
    data.el.style.overflow = isActive ? "hidden" : "auto";
    if (isActive) {
      if (isMobile) {
        gsap.to(camera.position, { z: 11.5, y: -39, x: 1, duration: 1 });
      } else {
        gsap.to(camera.position, { y: -39, x: 2, duration: 1 });
        // Reset drag state when entering
        dragRef.current.target = camera.rotation.y;
        dragRef.current.velocity = 0;
      }
    }
  }, [isActive]);

  // Desktop pointer drag listeners
  useEffect(() => {
    if (isMobile) return;
    const el = data.el;
    const onDown = (e: PointerEvent) => {
      if (!isActive) return;
      dragRef.current.dragging = true;
      dragRef.current.lastX = e.clientX;
      dragRef.current.velocity = 0;
      el.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.lastX;
      dragRef.current.lastX = e.clientX;
      const sensitivity = 0.005;
      const delta = dx * sensitivity;
      dragRef.current.target += delta;
      dragRef.current.velocity = delta;
    };
    const onUp = () => {
      dragRef.current.dragging = false;
      if (isActive) el.style.cursor = "grab";
    };
    if (isActive) el.style.cursor = "grab";
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      el.style.cursor = "";
    };
  }, [isActive, data.el]);

  useFrame((state, delta) => {
    if (!isActive || isMobile) return;
    // Inertia: keep applying velocity after release, with friction
    if (!dragRef.current.dragging) {
      dragRef.current.target += dragRef.current.velocity;
      dragRef.current.velocity *= 0.92; // friction → smooth glide
      if (Math.abs(dragRef.current.velocity) < 0.00005) {
        dragRef.current.velocity = 0;
      }
    }
    // Smooth easing toward target rotation
    camera.rotation.y = THREE.MathUtils.lerp(
      camera.rotation.y,
      dragRef.current.target,
      0.12,
    );
    // Subtle vertical parallax from mouse Y
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      11.5 - state.pointer.y * 0.5,
      6,
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
