import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

/**
 * Mouse + touch drag panning for the gallery carousel, plus support for
 * external prev/next stepping via a CustomEvent ("gallery-step").
 * Mirrors TouchPanControls but works on desktop too.
 */
export const GalleryPanControls = ({ stepAngle = Math.PI / 13 }: { stepAngle?: number }) => {
  const { camera, gl } = useThree();
  const startRef = useRef({ x: 0, baseRotY: 0 });
  const targetYRef = useRef(camera.rotation.y);
  const draggingRef = useRef(false);

  useEffect(() => {
    targetYRef.current = camera.rotation.y;
  }, [camera]);

  useFrame(() => {
    camera.rotation.y += (targetYRef.current - camera.rotation.y) * 0.08;
    camera.updateProjectionMatrix();
  });

  useEffect(() => {
    const el = gl.domElement;
    const maxRot = Math.PI / 2.2;

    const clamp = (v: number) => Math.max(-maxRot, Math.min(maxRot, v));

    const onPointerDown = (e: PointerEvent) => {
      draggingRef.current = true;
      startRef.current = { x: e.clientX, baseRotY: targetYRef.current };
      el.setPointerCapture?.(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - startRef.current.x;
      targetYRef.current = clamp(startRef.current.baseRotY + dx * 0.005);
    };
    const onPointerUp = (e: PointerEvent) => {
      draggingRef.current = false;
      el.releasePointerCapture?.(e.pointerId);
      el.style.cursor = "grab";
    };
    const onStep = (e: Event) => {
      const dir = (e as CustomEvent<{ dir: number }>).detail?.dir ?? 1;
      targetYRef.current = clamp(targetYRef.current + dir * stepAngle);
    };

    el.style.cursor = "grab";
    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("gallery-step", onStep as EventListener);

    return () => {
      el.style.cursor = "";
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("gallery-step", onStep as EventListener);
    };
  }, [gl, stepAngle]);

  return null;
};

export const stepGallery = (dir: 1 | -1) => {
  window.dispatchEvent(new CustomEvent("gallery-step", { detail: { dir } }));
};
