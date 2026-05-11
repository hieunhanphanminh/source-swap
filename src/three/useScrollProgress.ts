import { useEffect, useRef } from "react";

/**
 * Returns a ref whose .current is a number in [0, 1] tracking the page's
 * vertical scroll relative to (document height - viewport height).
 * Updates via passive scroll listener; safe to read every frame.
 */
export function useScrollProgressRef() {
  const ref = useRef(0);
  useEffect(() => {
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      ref.current = Math.min(1, Math.max(0, window.scrollY / max));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return ref;
}
