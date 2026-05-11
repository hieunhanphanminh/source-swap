import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";

const SceneCanvas = lazy(() => import("@/three/SceneCanvas"));

export default function SceneBackdrop() {
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Suspense fallback={null}>
        <SceneCanvas pathname={location.pathname} />
      </Suspense>
    </div>
  );
}
