import { useEffect, useRef, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { useReducedMotion } from "@/three/useReducedMotion";

/**
 * Subtle cinematic top progress bar that animates on every route change.
 * Indicates navigation is happening during the page transition window.
 */
export default function RouteProgress() {
  const location = useLocation();
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setVisible(true);
    setProgress(0);
    // ramp quickly to ~80%, then complete after the page transition settles
    const t1 = setTimeout(() => setProgress(82), 30);
    const t2 = setTimeout(() => setProgress(100), 700);
    const t3 = setTimeout(() => setVisible(false), 1100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [location.pathname]);

  if (reduced) return null;

  return (
    <div
      aria-hidden
      className="route-progress"
      style={{
        width: "100%",
        transform: `scaleX(${progress / 100})`,
        opacity: visible ? 1 : 0,
        transition: visible
          ? "transform 0.6s cubic-bezier(0.23,1,0.32,1), opacity 0.3s ease"
          : "opacity 0.4s ease 0.1s",
      }}
    />
  );
}
