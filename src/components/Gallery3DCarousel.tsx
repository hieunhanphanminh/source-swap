import { useEffect, useRef, useState, useCallback } from "react";

export type CarouselItem = {
  id: string | number;
  type: "photo" | "video";
  src: string;
  thumb?: string;
  caption: string;
  subtitle: string;
};

interface Props {
  items: CarouselItem[];
  onActivate?: (index: number) => void;
}

/**
 * Coverflow-style 3D carousel. Active item centered, neighbors recede on a Z-curve
 * and rotate toward center. Drive: drag, wheel, arrow keys, or click neighbors.
 * Click the active card → onActivate (parent opens lightbox / video).
 */
export default function Gallery3DCarousel({ items, onActivate }: Props) {
  const [active, setActive] = useState(0);
  const [drag, setDrag] = useState(0);
  const draggingRef = useRef(false);
  const startRef = useRef(0);
  const lastWheelRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const go = useCallback((dir: number) => {
    setActive((a) => Math.max(0, Math.min(items.length - 1, a + dir)));
  }, [items.length]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Enter") onActivate?.(active);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, active, onActivate]);

  // Pointer drag
  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    startRef.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    setDrag(e.clientX - startRef.current);
  };
  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const threshold = 80;
    if (drag > threshold) go(-1);
    else if (drag < -threshold) go(1);
    setDrag(0);
  };

  // Wheel (horizontal trackpad or vertical fallback)
  const onWheel = (e: React.WheelEvent) => {
    const now = performance.now();
    if (now - lastWheelRef.current < 300) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 12) return;
    lastWheelRef.current = now;
    go(delta > 0 ? 1 : -1);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none touch-pan-y"
      style={{ height: "min(620px, 75vh)", perspective: "1600px" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
    >
      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        {items.map((item, i) => {
          const offset = i - active + drag / 280;
          const abs = Math.abs(offset);
          const tx = offset * 280;
          const tz = -abs * 280;
          const ry = -offset * 28;
          const opacity = abs > 3 ? 0 : 1 - abs * 0.18;
          const isActive = i === active;
          return (
            <div
              key={item.id}
              className="carousel-3d-item rounded-2xl sm:rounded-3xl overflow-hidden depth-shadow"
              style={{
                width: "min(420px, 75vw)",
                height: "min(560px, 65vh)",
                transform: `translate(-50%, -50%) translate3d(${tx}px, 0, ${tz}px) rotateY(${ry}deg)`,
                opacity,
                filter: isActive ? "none" : `brightness(${0.65 - abs * 0.08}) saturate(0.8)`,
                zIndex: 100 - Math.round(abs * 10),
                pointerEvents: abs > 3 ? "none" : "auto",
                cursor: isActive ? "zoom-in" : "pointer",
                border: "1px solid hsl(var(--love-pink) / 0.25)",
                background: "hsl(var(--card) / 0.4)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (isActive) onActivate?.(i);
                else setActive(i);
              }}
            >
              {item.type === "photo" ? (
                <img
                  src={item.src}
                  alt={item.caption}
                  draggable={false}
                  loading={abs <= 2 ? "eager" : "lazy"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={item.thumb || item.src}
                    alt={item.caption}
                    draggable={false}
                    loading={abs <= 2 ? "eager" : "lazy"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-background/60 backdrop-blur-md flex items-center justify-center border border-primary/40">
                      <svg className="w-7 h-7 text-primary ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                </div>
              )}
              {/* Bottom caption */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-background/90 via-background/40 to-transparent">
                <p className="text-primary text-sm sm:text-base font-display">{item.caption}</p>
                <p className="text-muted-foreground text-xs">{item.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nav arrows */}
      <button
        onClick={(e) => { e.stopPropagation(); go(-1); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-[200] text-primary/60 hover:text-primary text-4xl transition-all duration-300 hover:-translate-x-1 hover:scale-125"
        aria-label="Previous"
      >‹</button>
      <button
        onClick={(e) => { e.stopPropagation(); go(1); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-[200] text-primary/60 hover:text-primary text-4xl transition-all duration-300 hover:translate-x-1 hover:scale-125"
        aria-label="Next"
      >›</button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[200] flex gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setActive(i); }}
            className="rounded-full transition-all duration-500"
            style={{
              width: i === active ? 22 : 8,
              height: 8,
              background: i === active ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)",
            }}
            aria-label={`Go to ${i + 1}`}
          />
        ))}
      </div>

      {/* Hint */}
      <p className="absolute -bottom-8 left-0 right-0 text-center text-[11px] font-mono text-muted-foreground/60 tracking-widest">
        ← drag • swipe • arrow keys →
      </p>
    </div>
  );
}
