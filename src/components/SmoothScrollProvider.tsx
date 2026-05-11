import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import Lenis from "lenis";

let lenis: Lenis | null = null;

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (lenis) return;
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    let raf = 0;
    const tick = (time: number) => {
      lenis?.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  // Reset scroll on route change
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
  }, [location.pathname]);

  return <>{children}</>;
}
