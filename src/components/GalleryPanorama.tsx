import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { CarouselItem } from "./Gallery3DCarousel";
import { useReducedMotion } from "@/three/useReducedMotion";

/**
 * GalleryPanorama — horizontal "vista" gallery inspired by Mohit Virli's
 * portfolio. Items sit on a horizon line, the further from the viewport
 * center the more they perspective-skew toward the vanishing point.
 *
 * Behaviour:
 *  • Drag, wheel/trackpad, ←/→ keys, or two-finger swipe to pan.
 *  • Click a card → opens an internal cinematic modal preview with caption,
 *    label, and prev/next navigation.
 *  • Cards near the viewport pre-load their image / video poster so fast
 *    panning doesn't reveal blank frames.
 *  • Mobile gestures only "claim" the swipe once horizontal motion clearly
 *    exceeds vertical, so the page can still scroll naturally.
 *  • All smoothing/skew animations are disabled for prefers-reduced-motion.
 */
export interface PanoramaItem extends CarouselItem {
  label?: string;
}

interface Props {
  items: PanoramaItem[];
  onActivate?: (index: number) => void; // optional external handler
}

const ITEM_WIDTH = 220;
const ITEM_HEIGHT = 150;
const ITEM_GAP = 70;
const PRELOAD_RADIUS = 3; // cards on each side of viewport center to preload

export default function GalleryPanorama({ items, onActivate }: Props) {
  const reduced = useReducedMotion();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState(0);
  const targetPan = useRef(0);
  const [viewW, setViewW] = useState(0);

  // Drag bookkeeping
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartPan = useRef(0);
  const dragMoved = useRef(false);     // true once movement exceeded click threshold
  const claimedSwipe = useRef(false);  // true once horizontal swipe overrides page scroll
  const activePointerType = useRef<string>("");

  // Internal modal state
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const trackWidth = items.length * (ITEM_WIDTH + ITEM_GAP);
  const maxPan = Math.max(0, trackWidth - (viewW || 0) + ITEM_WIDTH);

  /* Resize observer ---------------------------------------------------- */
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setViewW(el.clientWidth));
    ro.observe(el);
    setViewW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  /* Smooth pan loop ---------------------------------------------------- */
  useEffect(() => {
    if (reduced) return; // snap immediately, see setTarget below
    let raf = 0;
    const tick = () => {
      setPan((p) => {
        const next = p + (targetPan.current - p) * 0.12;
        if (Math.abs(next - targetPan.current) < 0.3) return targetPan.current;
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const setTarget = useCallback((next: number) => {
    const clamped = Math.max(-200, Math.min(maxPan + 200, next));
    targetPan.current = clamped;
    if (reduced) setPan(clamped);
  }, [maxPan, reduced]);

  /* Wheel → horizontal pan -------------------------------------------- */
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 1) return;
      e.preventDefault();
      setTarget(targetPan.current + delta * 1.4);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setTarget]);

  /* Keyboard ----------------------------------------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (modalIndex !== null) return; // modal owns keys
      if (e.key === "ArrowRight") setTarget(targetPan.current + (ITEM_WIDTH + ITEM_GAP));
      if (e.key === "ArrowLeft") setTarget(targetPan.current - (ITEM_WIDTH + ITEM_GAP));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setTarget, modalIndex]);

  /* Pointer / touch drag with directional gating ----------------------- */
  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    dragStartPan.current = targetPan.current;
    dragMoved.current = false;
    claimedSwipe.current = e.pointerType === "mouse"; // mouse always claims
    activePointerType.current = e.pointerType;
    if (e.pointerType === "mouse") {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStartX.current;
    const dy = e.clientY - dragStartY.current;
    if (!claimedSwipe.current) {
      // Only "claim" the gesture once horizontal motion clearly dominates.
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        claimedSwipe.current = true;
        try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
      } else if (Math.abs(dy) > 12) {
        // Vertical swipe → release, let the page scroll
        dragging.current = false;
        return;
      } else {
        return;
      }
    }
    if (Math.abs(dx) > 4) dragMoved.current = true;
    setTarget(dragStartPan.current - dx);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    claimedSwipe.current = false;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };

  /* Preload neighbours ------------------------------------------------- */
  const centerIndex = useMemo(() => {
    const stride = ITEM_WIDTH + ITEM_GAP;
    return Math.round(pan / stride + (items.length - 1) / 2);
  }, [pan, items.length]);

  const preloadSet = useMemo(() => {
    const set = new Set<number>();
    for (let i = -PRELOAD_RADIUS; i <= PRELOAD_RADIUS; i++) {
      const idx = centerIndex + i;
      if (idx >= 0 && idx < items.length) set.add(idx);
    }
    return set;
  }, [centerIndex, items.length]);

  /* Modal navigation --------------------------------------------------- */
  const closeModal = useCallback(() => setModalIndex(null), []);
  const gotoModal = useCallback((dir: number) => {
    setModalIndex((cur) => {
      if (cur === null) return cur;
      return (cur + dir + items.length) % items.length;
    });
  }, [items.length]);

  useEffect(() => {
    if (modalIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      else if (e.key === "ArrowRight") gotoModal(1);
      else if (e.key === "ArrowLeft") gotoModal(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalIndex, closeModal, gotoModal]);

  const openCard = (i: number) => {
    if (dragMoved.current) return; // suppress click after a drag
    onActivate?.(i);
    setModalIndex(i);
  };

  return (
    <>
      {/* Hidden preload sink so neighbour media is in cache before it scrolls in */}
      <div aria-hidden style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", opacity: 0, pointerEvents: "none" }}>
        {[...preloadSet].map((idx) => {
          const it = items[idx];
          if (!it) return null;
          const src = it.type === "video" ? (it.thumb || it.src) : it.src;
          return <img key={`pre-${it.id}`} src={src} alt="" decoding="async" loading="eager" />;
        })}
      </div>

      <div
        ref={wrapperRef}
        className="panorama-wrapper relative w-full select-none cursor-grab active:cursor-grabbing"
        style={{
          height: 520,
          perspective: reduced ? "none" : 1400,
          perspectiveOrigin: "50% 60%",
          touchAction: "pan-y", // page can still scroll vertically
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Soft horizon haze */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0"
          style={{
            top: "50%",
            height: 2,
            transform: "translateY(-50%)",
            background:
              "linear-gradient(90deg, transparent, hsl(var(--love-pink) / 0.35), hsl(var(--love-gold) / 0.3), hsl(var(--love-pink) / 0.35), transparent)",
            boxShadow: "0 0 60px hsl(var(--love-pink) / 0.4)",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-32" style={{ background: "linear-gradient(90deg, hsl(var(--background) / 0.85), transparent)", zIndex: 5 }} />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-32" style={{ background: "linear-gradient(-90deg, hsl(var(--background) / 0.85), transparent)", zIndex: 5 }} />

        {/* Track */}
        <div
          className="absolute top-1/2 left-1/2"
          style={{
            transformStyle: reduced ? undefined : "preserve-3d",
            transform: `translate(-50%, -50%) translate3d(${-pan}px, 0, 0)`,
            willChange: "transform",
          }}
        >
          {items.map((item, i) => {
            const cardCenterX = i * (ITEM_WIDTH + ITEM_GAP) - (trackWidth - ITEM_WIDTH - ITEM_GAP) / 2;
            const offset = (cardCenterX - (pan - (trackWidth - ITEM_WIDTH - ITEM_GAP) / 2)) / (ITEM_WIDTH + ITEM_GAP);
            const sign = Math.sign(offset);
            const mag = Math.min(Math.abs(offset), 4);
            const focused = mag < 0.45;
            const rotY = reduced ? 0 : -sign * Math.min(mag * 26, 52);
            const transZ = reduced ? 0 : (focused ? 60 : -mag * 55);
            const liftY = focused ? -28 : 0;
            const baseOpacity = focused ? 1 : Math.max(0.35, 0.85 - mag * 0.18);
            const scale = reduced ? (focused ? 1.25 : 1) : (focused ? 1.32 : 1 - mag * 0.04);

            return (
              <div
                key={item.id}
                className="absolute top-1/2"
                style={{
                  left: cardCenterX,
                  width: ITEM_WIDTH,
                  height: ITEM_HEIGHT,
                  transform: `translate(-50%, calc(-50% + ${liftY}px)) translateZ(${transZ}px) rotateY(${rotY}deg) scale(${scale})`,
                  transformStyle: reduced ? undefined : "preserve-3d",
                  transformOrigin: "center center",
                  opacity: baseOpacity,
                  transition: dragging.current
                    ? "none"
                    : "transform 0.55s cubic-bezier(0.23,1,0.32,1), opacity 0.45s ease",
                  pointerEvents: mag > 3 ? "none" : "auto",
                  zIndex: focused ? 20 : Math.round(10 - mag),
                }}
              >
                {/* Date label tag — thin bordered rectangle, like the reference */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 px-2.5 py-[3px] font-mono text-[9px] tracking-[0.28em] uppercase whitespace-nowrap"
                  style={{
                    top: -22,
                    background: "hsl(var(--background) / 0.4)",
                    color: "hsl(var(--foreground) / 0.85)",
                    border: "1px solid hsl(var(--foreground) / 0.55)",
                    backdropFilter: "blur(6px)",
                    letterSpacing: "0.28em",
                  }}
                >
                  {item.label || `Frame ${i + 1}`}
                </div>

                {/* Card frame — translucent with thin sharp edges */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openCard(i); }}
                  className="block w-full h-full overflow-hidden cursor-pointer relative"
                  style={{
                    background: "hsl(0 0% 100% / 0.06)",
                    border: `1px solid hsl(var(--foreground) / ${focused ? 0.85 : 0.45})`,
                    boxShadow: focused
                      ? "0 30px 80px -20px hsl(0 0% 0% / 0.65), 0 0 0 1px hsl(var(--foreground) / 0.25) inset"
                      : `0 ${10 + mag * 6}px ${30 + mag * 12}px -10px hsl(0 0% 0% / ${0.4 + mag * 0.08})`,
                  }}
                >
                  <img
                    src={item.type === "video" ? (item.thumb || item.src) : item.src}
                    alt={item.caption}
                    draggable={false}
                    loading={preloadSet.has(i) ? "eager" : "lazy"}
                    decoding="async"
                    className="w-full h-full object-cover"
                    style={{
                      pointerEvents: "none",
                      filter: focused ? "none" : "saturate(0.85) brightness(0.92)",
                      transition: "filter 0.4s ease",
                    }}
                  />
                  {item.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="w-10 h-10 rounded-full bg-background/55 backdrop-blur flex items-center justify-center text-foreground text-base">▶</span>
                    </div>
                  )}
                </button>

                {/* Focused detail card — title, subtitle, VIEW button */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none"
                  style={{
                    top: "100%",
                    marginTop: 14,
                    width: ITEM_WIDTH * 1.15,
                    opacity: focused ? 1 : 0,
                    transform: focused ? "translate(-50%, 0)" : "translate(-50%, -8px)",
                    transition: "opacity 0.4s ease 0.05s, transform 0.5s cubic-bezier(0.23,1,0.32,1)",
                  }}
                >
                  <p
                    className="font-display leading-tight"
                    style={{
                      fontFamily: "'Fraunces', 'Playfair Display', serif",
                      fontWeight: 600,
                      fontSize: 22,
                      color: "hsl(var(--foreground))",
                    }}
                  >
                    {item.caption}
                  </p>
                  {item.subtitle && (
                    <p
                      className="mt-1 italic"
                      style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: 11,
                        color: "hsl(var(--muted-foreground))",
                      }}
                    >
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-[0.5em] text-primary/60 pointer-events-none">
          ‹ ›  PAN
        </div>
      </div>

      {modalIndex !== null && (
        <PanoramaModal
          items={items}
          index={modalIndex}
          onClose={closeModal}
          onPrev={() => gotoModal(-1)}
          onNext={() => gotoModal(1)}
          reduced={reduced}
        />
      )}
    </>
  );
}

/* ─── Cinematic in-panorama modal preview ─────────────────────────── */
export function PanoramaModal({
  items,
  index,
  onClose,
  onPrev,
  onNext,
  reduced,
}: {
  items: PanoramaItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  reduced: boolean;
}) {
  const item = items[index];
  const startX = useRef(0);
  const startY = useRef(0);

  // Preload neighbours while modal is open
  useEffect(() => {
    [-1, 1].forEach((d) => {
      const n = items[(index + d + items.length) % items.length];
      if (!n) return;
      const src = n.type === "video" ? (n.thumb || n.src) : n.src;
      const img = new Image();
      img.src = src;
    });
  }, [index, items]);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? onNext() : onPrev();
    }
  };

  const isVideo = item.type === "video";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center px-4"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        background: "hsl(var(--background) / 0.93)",
        backdropFilter: "blur(28px)",
        animation: reduced ? undefined : "fadeSlide 0.3s cubic-bezier(0.23,1,0.32,1) forwards",
      }}
    >
      <button onClick={onClose} className="absolute top-6 right-6 text-primary text-2xl bg-transparent border-none cursor-pointer z-10 transition-all duration-300 hover:scale-125 hover:rotate-90">✕</button>
      <button
        className="absolute left-3 sm:left-8 text-primary/60 hover:text-primary text-4xl transition-all duration-300 hover:scale-125"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        aria-label="Previous"
      >‹</button>
      <button
        className="absolute right-3 sm:right-8 text-primary/60 hover:text-primary text-4xl transition-all duration-300 hover:scale-125"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        aria-label="Next"
      >›</button>

      <div
        className="relative max-w-[92vw] sm:max-w-[80vw] text-center"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: reduced ? undefined : "fadeSlide 0.45s cubic-bezier(0.23,1,0.32,1) forwards" }}
      >
        {/* Label tag */}
        {item.label && (
          <div className="inline-block mb-4 px-3 py-1 rounded-md font-mono text-[10px] sm:text-xs tracking-[0.3em] uppercase"
            style={{
              background: "hsl(var(--background) / 0.55)",
              color: "hsl(var(--love-gold))",
              border: "1px solid hsl(var(--love-gold) / 0.4)",
            }}
          >
            {item.label}
          </div>
        )}

        <div className="rounded-3xl overflow-hidden border-2 border-primary/20 mx-auto inline-block" style={{ maxHeight: "70vh" }}>
          {isVideo ? (
            <video
              key={item.id}
              src={item.src}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="block max-h-[70vh] max-w-full"
            />
          ) : (
            <img
              key={item.id}
              src={item.src}
              alt={item.caption}
              className="block max-h-[70vh] max-w-full object-contain"
            />
          )}
        </div>

        <p className="text-primary text-base sm:text-lg font-display mt-4">{item.caption}</p>
        {item.subtitle && <p className="text-muted-foreground text-xs sm:text-sm mt-1">{item.subtitle}</p>}

        {/* Index dots */}
        <div className="flex justify-center gap-2 mt-5 flex-wrap">
          {items.map((_, i) => (
            <span
              key={i}
              className="rounded-full transition-all duration-500"
              style={{
                width: i === index ? 22 : 8,
                height: 8,
                background: i === index ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)",
                display: "inline-block",
              }}
            />
          ))}
        </div>

        <p className="text-muted-foreground/60 text-[10px] tracking-[0.3em] uppercase mt-4">
          {index + 1} / {items.length}
        </p>
      </div>
    </div>
  );
}
