import { useEffect } from "react";

/**
 * Global parallax engine. Any element with `data-parallax="<speed>"` gets
 * its translateY driven by scroll. Speed is a multiplier:
 *   0.0  = stays still
 *   0.2  = drifts gently (background depth)
 *   0.5  = mid layer
 *   1.0  = matches scroll (foreground)
 *  -0.3  = scrolls UP as the page goes down (counter-parallax accent)
 * Skipped entirely when prefers-reduced-motion is set.
 */
export function useParallax() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    let raf = 0;
    let scrollY = window.scrollY;

    const apply = () => {
      const els = document.querySelectorAll<HTMLElement>("[data-parallax]");
      els.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || "0");
        const offset = -scrollY * speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      });
      raf = 0;
    };

    const onScroll = () => {
      scrollY = window.scrollY;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}
