import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/three/useReducedMotion";

/**
 * Cursor-reactive ambient spotlight. A soft radial glow follows the mouse,
 * giving every page a sense of "live" cinematic lighting. Pointer-events
 * are off so it never blocks interactions. Disabled under reduced motion.
 */
export default function MouseSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.background = `radial-gradient(600px circle at ${cx}px ${cy}px, hsl(340 70% 60% / 0.10), hsl(270 80% 65% / 0.05) 35%, transparent 65%)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="mouse-spotlight"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        mixBlendMode: "screen",
        transition: "opacity 0.5s ease",
      }}
    />
  );
}
