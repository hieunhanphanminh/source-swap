import { useEffect, useRef, useState } from "react";
import { PanoramaModal, type PanoramaItem } from "./GalleryPanorama";
import { useReducedMotion } from "@/three/useReducedMotion";

/**
 * CinematicShowcase — editorial alternating project panels.
 *
 * Performance model:
 *  • A single global rAF "scroll bus" publishes scrollY/viewport to all
 *    subscribers. Per-block parallax + the stage camera read from the same
 *    frame — no duplicate listeners, no rAF storms.
 *  • Pointer tilt is rAF-lerped, throttled, and self-suspends when settled.
 *  • All motion is short-circuited under prefers-reduced-motion: no rAF,
 *    no IntersectionObserver, no transforms — content renders fully visible
 *    in its final layout so hierarchy and readability are preserved.
 *  • Optional perf overlay (?perf=1 in dev) logs frame budget breaches.
 *
 * Camera tuning lives in CAMERA_CONFIG below.
 */

interface Props {
  items: PanoramaItem[];
}

/* ─── Configurable scroll-camera easing ─────────────────────────── */
/** Tuned so motion feels consistent across screen sizes.
 *  - smoothing: 0..1 lerp factor per frame (higher = snappier).
 *  - speed: multiplier on raw scroll-derived progress.
 *  - maxDrift: clamps stage Y travel in px regardless of viewport. */
const CAMERA_CONFIG = {
  smoothing: 0.12,
  speed: 1,
  maxDrift: 14, // px
  blockImageDrift: 26, // px image col travel
  blockTextDrift: 16, // px text col travel
} as const;

/* ─── Inline grain mask ─────────────────────────────────────────── */
const GRAIN_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0"/></filter><rect width="100%" height="100%" filter="url(%23n)" opacity="0.55"/></svg>`,
  );

/* ─── Global scroll bus (single rAF, many subscribers) ──────────── */
type ScrollSub = (scrollY: number, vh: number) => void;
const subs = new Set<ScrollSub>();
let busRaf = 0;
let busActive = false;
let lastFrame = 0;
let perfEnabled = false;

function flush() {
  busRaf = 0;
  const now = performance.now();
  if (perfEnabled && lastFrame) {
    const dt = now - lastFrame;
    if (dt > 32) {
      // 2-frame budget breach
      // eslint-disable-next-line no-console
      console.warn(`[Showcase] frame ${dt.toFixed(1)}ms (subs=${subs.size})`);
    }
  }
  lastFrame = now;
  const y = window.scrollY;
  const vh = window.innerHeight;
  subs.forEach((s) => s(y, vh));
}
function schedule() {
  if (!busRaf) busRaf = requestAnimationFrame(flush);
}
function ensureBus() {
  if (busActive) return;
  busActive = true;
  perfEnabled =
    typeof window !== "undefined" &&
    /[?&]perf=1/.test(window.location.search) &&
    import.meta.env.DEV;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
}
function subscribe(fn: ScrollSub) {
  ensureBus();
  subs.add(fn);
  // Prime immediately so first paint has correct values.
  fn(window.scrollY, window.innerHeight);
  return () => {
    subs.delete(fn);
  };
}

export default function CinematicShowcase({ items }: Props) {
  const reduced = useReducedMotion();
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  /* Smoothed scroll-camera → CSS vars on stage. */
  useEffect(() => {
    if (reduced) return;
    const stage = stageRef.current;
    if (!stage) return;

    let target = 0;
    let current = 0;
    let raf = 0;

    const settle = () => {
      current += (target - current) * CAMERA_CONFIG.smoothing;
      const cam = current * CAMERA_CONFIG.speed;
      stage.style.setProperty("--cam", cam.toFixed(4));
      const drift = (cam - 0.5) * 2 * CAMERA_CONFIG.maxDrift;
      stage.style.setProperty("--cam-y", `${drift.toFixed(2)}px`);
      if (Math.abs(target - current) > 0.0008) {
        raf = requestAnimationFrame(settle);
      } else {
        raf = 0;
      }
    };

    const unsub = subscribe((scrollY, vh) => {
      const r = stage.getBoundingClientRect();
      const total = r.height + vh;
      const passed = vh - (r.top + scrollY - scrollY); // rect already viewport-relative
      target = Math.min(1, Math.max(0, passed / total));
      if (!raf) raf = requestAnimationFrame(settle);
    });

    return () => {
      unsub();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <>
      <div
        ref={stageRef}
        className="relative mx-auto"
        style={{
          maxWidth: "1200px",
          transform: reduced ? undefined : "translate3d(0, var(--cam-y, 0px), 0)",
          willChange: reduced ? undefined : "transform",
        }}
      >
        {/* Ambient aurora */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          style={{ opacity: reduced ? 0.6 : "calc(0.55 + var(--cam, 0) * 0.45)" }}
        >
          <div
            className="absolute -top-40 -left-32 w-[60vw] h-[60vw] rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, hsl(var(--love-rose) / 0.32), transparent 70%)",
              filter: "blur(70px)",
              animation: reduced ? undefined : "auroraDrift1 22s ease-in-out infinite alternate",
            }}
          />
          <div
            className="absolute top-1/3 -right-40 w-[55vw] h-[55vw] rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, hsl(var(--love-gold) / 0.22), transparent 70%)",
              filter: "blur(80px)",
              animation: reduced ? undefined : "auroraDrift2 28s ease-in-out infinite alternate",
            }}
          />
          <div
            className="absolute bottom-0 left-1/4 w-[50vw] h-[50vw] rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, hsl(var(--primary) / 0.20), transparent 70%)",
              filter: "blur(90px)",
              animation: reduced ? undefined : "auroraDrift3 32s ease-in-out infinite alternate",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 80% at 50% 50%, transparent 50%, hsl(var(--background) / 0.55) 100%)",
            }}
          />
        </div>

        <div className="flex flex-col gap-y-32 sm:gap-y-44 md:gap-y-56 px-4 sm:px-6 md:px-8">
          {items.map((item, i) => (
            <ShowcaseBlock
              key={item.id}
              item={item}
              index={i}
              total={items.length}
              reduced={reduced}
              onOpen={() => setModalIndex(i)}
            />
          ))}
        </div>
      </div>

      {modalIndex !== null && (
        <PanoramaModal
          items={items}
          index={modalIndex}
          onClose={() => setModalIndex(null)}
          onPrev={() =>
            setModalIndex((m) => (m === null ? m : (m - 1 + items.length) % items.length))
          }
          onNext={() => setModalIndex((m) => (m === null ? m : (m + 1) % items.length))}
          reduced={reduced}
        />
      )}
    </>
  );
}

/* ─── Single block ─────────────────────────────────────────────── */
function ShowcaseBlock({
  item,
  index,
  total,
  reduced,
  onOpen,
}: {
  item: PanoramaItem;
  index: number;
  total: number;
  reduced: boolean;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLButtonElement>(null);
  const imgWrapRef = useRef<HTMLSpanElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const chipRef = useRef<HTMLSpanElement>(null);
  const glareRef = useRef<HTMLSpanElement>(null);
  const haloRef = useRef<HTMLSpanElement>(null);
  const textColRef = useRef<HTMLDivElement>(null);

  // Reduced motion → start fully revealed; never animate.
  const [revealed, setRevealed] = useState(reduced);
  const [isDesktop, setIsDesktop] = useState(false);
  const isLeft = index % 2 === 0;
  const isVideo = item.type === "video";
  const poster = isVideo ? item.thumb || item.src : item.src;

  // Cinematic composition variants — break the rigid alternating rhythm.
  // Each block gets distinct image scale, vertical placement, text offset,
  // tilt and image aspect so the page reads as a film sequence, not a grid.
  const VARIANTS = [
    { imgW: 58, imgTop: 6,  txtTop: 48, txtW: 50, tilt: -1.2, aspect: "4 / 3"  },
    { imgW: 68, imgTop: 18, txtTop: 28, txtW: 44, tilt:  0.8, aspect: "16 / 11" },
    { imgW: 52, imgTop: 22, txtTop: 56, txtW: 56, tilt: -0.6, aspect: "5 / 4"  },
    { imgW: 72, imgTop: 4,  txtTop: 60, txtW: 48, tilt:  1.4, aspect: "16 / 10" },
    { imgW: 60, imgTop: 26, txtTop: 18, txtW: 46, tilt: -0.9, aspect: "3 / 2"  },
    { imgW: 64, imgTop: 12, txtTop: 50, txtW: 52, tilt:  1.0, aspect: "5 / 4"  },
  ] as const;
  const v = VARIANTS[index % VARIANTS.length];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* Reveal on scroll (skipped under reduced motion) */
  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setRevealed(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  /* Per-block depth parallax via the global scroll bus.
     Skipped entirely under reduced motion. */
  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    return subscribe((_, vh) => {
      const r = el.getBoundingClientRect();
      // Cull off-screen blocks completely
      if (r.bottom < -200 || r.top > vh + 200) return;
      const center = r.top + r.height / 2;
      const t = Math.max(-1, Math.min(1, (center - vh / 2) / (vh / 1.2)));
      const imgY = -t * CAMERA_CONFIG.blockImageDrift;
      const txtY = t * CAMERA_CONFIG.blockTextDrift;
      if (imgWrapRef.current) {
        imgWrapRef.current.style.transform = `translate3d(0, ${imgY.toFixed(2)}px, 0)`;
      }
      if (textColRef.current) {
        textColRef.current.style.transform = `translate3d(0, ${txtY.toFixed(2)}px, 0)`;
      }
    });
  }, [reduced]);

  /* Pointer tilt (rAF lerp, throttled, self-suspending) */
  useEffect(() => {
    if (reduced) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const visual = visualRef.current;
    if (!visual) return;

    const target = { x: 0, y: 0, hover: 0 };
    const current = { x: 0, y: 0, hover: 0 };
    let raf = 0;
    let pendingX = 0;
    let pendingY = 0;
    let pendingDirty = false;
    let lastMove = 0;
    const MOVE_THROTTLE = 1000 / 90; // cap pointermove ingestion at ~90Hz

    const tick = () => {
      if (pendingDirty) {
        target.x = pendingX;
        target.y = pendingY;
        pendingDirty = false;
      }
      current.x += (target.x - current.x) * 0.14;
      current.y += (target.y - current.y) * 0.14;
      current.hover += (target.hover - current.hover) * 0.12;

      const rx = -current.y * 6.5;
      const ry = current.x * 8.5;
      const tz = 16 * current.hover;
      visual.style.transform = `perspective(1500px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) translateZ(${tz.toFixed(2)}px)`;

      if (imgRef.current) {
        imgRef.current.style.transform = `translate3d(${(current.x * -12).toFixed(2)}px, ${(current.y * -8).toFixed(2)}px, 40px) scale(${(1 + current.hover * 0.05).toFixed(4)})`;
      }
      if (chipRef.current) {
        chipRef.current.style.transform = `translate3d(${(current.x * 20).toFixed(2)}px, ${(current.y * 12).toFixed(2)}px, 60px)`;
      }
      if (haloRef.current) {
        haloRef.current.style.opacity = current.hover.toFixed(3);
        haloRef.current.style.transform = `translate3d(${(current.x * 24).toFixed(2)}px, ${(current.y * 18).toFixed(2)}px, -40px)`;
      }
      if (glareRef.current) {
        const gx = (current.x + 0.5) * 100;
        const gy = (current.y + 0.5) * 100;
        glareRef.current.style.background = `radial-gradient(circle at ${gx.toFixed(1)}% ${gy.toFixed(1)}%, hsl(var(--love-gold) / 0.32), transparent 55%)`;
        glareRef.current.style.opacity = (0.8 * current.hover).toFixed(3);
      }

      if (
        Math.abs(target.x - current.x) < 0.0008 &&
        Math.abs(target.y - current.y) < 0.0008 &&
        Math.abs(target.hover - current.hover) < 0.0008 &&
        !pendingDirty
      ) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const ensureLoop = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastMove < MOVE_THROTTLE) return;
      lastMove = now;
      const r = visual.getBoundingClientRect();
      pendingX = (e.clientX - r.left) / r.width - 0.5;
      pendingY = (e.clientY - r.top) / r.height - 0.5;
      pendingDirty = true;
      target.hover = 1;
      ensureLoop();
    };
    const onEnter = () => {
      target.hover = 1;
      ensureLoop();
    };
    const onLeave = () => {
      pendingX = 0;
      pendingY = 0;
      pendingDirty = true;
      target.hover = 0;
      ensureLoop();
    };

    visual.addEventListener("pointermove", onMove, { passive: true });
    visual.addEventListener("pointerenter", onEnter);
    visual.addEventListener("pointerleave", onLeave);
    return () => {
      visual.removeEventListener("pointermove", onMove);
      visual.removeEventListener("pointerenter", onEnter);
      visual.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const numeral = String(index + 1).padStart(2, "0");

  return (
    <div
      ref={ref}
      className="relative md:overflow-visible"
      style={{
        // Tall cinematic stage so image + text can overlap in z-space
        minHeight: "clamp(620px, 86vh, 880px)",
        perspective: "2200px",
        perspectiveOrigin: isLeft ? "70% 50%" : "30% 50%",
        opacity: revealed ? 1 : 0,
        transform: reduced ? undefined : revealed ? "translateY(0)" : "translateY(60px)",
        transition: reduced
          ? "none"
          : "opacity 1.2s cubic-bezier(0.23,1,0.32,1), transform 1.2s cubic-bezier(0.23,1,0.32,1)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* BACKGROUND PLANE — atmospheric numeral pushed deep into z-space */}
      <div
        aria-hidden
        data-parallax={reduced ? undefined : "-0.22"}
        className="absolute inset-0 select-none pointer-events-none font-display leading-none text-transparent flex items-center"
        style={{
          [isLeft ? "right" : "left"]: "-6%",
          top: "-8%",
          fontSize: "clamp(12rem, 32vw, 32rem)",
          WebkitTextStroke: "1px hsl(var(--love-gold) / 0.14)",
          letterSpacing: "-0.06em",
          transform: reduced ? undefined : "translateZ(-360px) scale(1.05)",
          opacity: 0.85,
          justifyContent: isLeft ? "flex-end" : "flex-start",
          zIndex: 0,
        }}
      >
        <span style={{ display: "block", lineHeight: 0.8 }}>{numeral}</span>
      </div>

      {/* BACKGROUND PLANE — soft floating orb */}
      <div
        aria-hidden
        data-parallax={reduced ? undefined : "-0.08"}
        className="absolute pointer-events-none rounded-full"
        style={{
          [isLeft ? "left" : "right"]: "-8%",
          top: "10%",
          width: "42vw",
          height: "42vw",
          maxWidth: 620,
          maxHeight: 620,
          background: isLeft
            ? "radial-gradient(closest-side, hsl(var(--love-rose) / 0.22), transparent 70%)"
            : "radial-gradient(closest-side, hsl(var(--love-gold) / 0.18), transparent 70%)",
          filter: "blur(60px)",
          transform: reduced ? undefined : "translateZ(-280px)",
          zIndex: 0,
        }}
      />

      {/* MIDGROUND PLANE — image visual */}
      <div
        className="relative md:absolute"
        style={{
          zIndex: 2,
          perspective: "1500px",
          transformStyle: "preserve-3d",
          // Mobile: normal flow, full width. Desktop: absolutely offset.
          width: "100%",
          ...(isDesktop
            ? {
                width: `${v.imgW}%`,
                top: `${v.imgTop}%`,
                [isLeft ? "left" : "right"]: "-3%",
                transform: `rotate(${v.tilt}deg)`,
              }
            : {}),
        }}
      >
        <span
          ref={imgWrapRef}
          className={reduced ? "block" : "block will-change-transform"}
          style={{
            display: "block",
            animation: reduced
              ? undefined
              : `${isLeft ? "floatBlockA" : "floatBlockB"} 14s ease-in-out infinite alternate`,
          }}
        >
          <button
            ref={visualRef}
            onClick={onOpen}
            className="group relative block w-full overflow-visible rounded-[2rem] cursor-zoom-in"
            style={{
              aspectRatio: v.aspect,
              transformStyle: "preserve-3d",
              transition: reduced ? "none" : "transform 0.5s cubic-bezier(0.23,1,0.32,1)",
              willChange: reduced ? undefined : "transform",
            }}
            aria-label={`Open ${item.caption}`}
          >
            <span
              ref={haloRef}
              aria-hidden
              className="absolute -inset-6 sm:-inset-10 rounded-[3rem] pointer-events-none"
              style={{
                background:
                  "radial-gradient(closest-side, hsl(var(--love-rose) / 0.42), transparent 70%)",
                filter: "blur(40px)",
                opacity: 0,
                transform: "translateZ(-80px)",
                transition: reduced ? "opacity 0.4s" : undefined,
                zIndex: -1,
              }}
            />

            {/* Floor shadow plane — sits below image like it's casting onto a surface */}
            <span
              aria-hidden
              className="absolute pointer-events-none"
              style={{
                left: "8%",
                right: "8%",
                bottom: "-6%",
                height: "12%",
                background: "radial-gradient(50% 100% at 50% 0%, hsl(0 0% 0% / 0.55), transparent 70%)",
                filter: "blur(22px)",
                transform: reduced ? undefined : "translateZ(-100px)",
                zIndex: -1,
              }}
            />

            <span
              className="absolute inset-0 rounded-[2rem] overflow-hidden border border-primary/15 bg-card/40"
              style={{
                boxShadow:
                  "0 80px 140px -40px hsl(var(--love-rose) / 0.45), 0 40px 80px -20px hsl(0 0% 0% / 0.55), 0 12px 28px -8px hsl(0 0% 0% / 0.4), 0 0 0 1px hsl(var(--primary) / 0.08) inset",
                transformStyle: "preserve-3d",
              }}
            >
              <img
                ref={imgRef}
                src={poster}
                alt={item.caption}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                style={{
                  transition: reduced ? "none" : "transform 0.5s cubic-bezier(0.23,1,0.32,1)",
                  willChange: reduced ? undefined : "transform",
                }}
              />

              {isVideo && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center bg-background/70 backdrop-blur-md border border-primary/30 text-primary text-2xl"
                    style={{ transform: reduced ? undefined : "translateZ(50px)" }}
                  >
                    ▶
                  </span>
                </span>
              )}

              <span
                ref={glareRef}
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{ mixBlendMode: "overlay", opacity: 0 }}
              />

              <span
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(110% 80% at 50% 45%, transparent 55%, hsl(0 0% 0% / 0.5) 100%)",
                }}
              />

              <span
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `url("${GRAIN_DATA_URI}")`,
                  backgroundSize: "160px 160px",
                  mixBlendMode: "overlay",
                  opacity: 0.18,
                }}
              />

              <span
                aria-hidden
                className="absolute inset-0 pointer-events-none rounded-[2rem]"
                style={{ boxShadow: "inset 0 0 100px hsl(var(--love-rose) / 0.22)" }}
              />
            </span>

            {item.label && (
              <span
                ref={chipRef}
                className="absolute top-4 left-4 px-3 py-1 rounded-md font-mono text-[10px] tracking-[0.3em] uppercase backdrop-blur-md"
                style={{
                  background: "hsl(var(--background) / 0.55)",
                  color: "hsl(var(--love-gold))",
                  border: "1px solid hsl(var(--love-gold) / 0.4)",
                  transform: reduced ? undefined : "translateZ(80px)",
                  transition: reduced ? "none" : "transform 0.5s cubic-bezier(0.23,1,0.32,1)",
                  willChange: reduced ? undefined : "transform",
                }}
              >
                {item.label}
              </span>
            )}
          </button>
        </span>
      </div>

      {/* FOREGROUND PLANE — typography floats over image edge */}
      <div
        ref={textColRef}
        className={`relative md:absolute mt-10 md:mt-0 ${reduced ? "" : "will-change-transform"}`}
        style={{
          zIndex: 4,
          transformStyle: "preserve-3d",
          transform: reduced ? undefined : "translateZ(120px)",
          ...(isDesktop
            ? {
                width: `${v.txtW}%`,
                top: `${v.txtTop}%`,
                [isLeft ? "right" : "left"]: "-3%",
                textAlign: isLeft ? "right" : "left",
              }
            : {}),
          animation: reduced
            ? undefined
            : `${isLeft ? "floatBlockB" : "floatBlockA"} 18s ease-in-out infinite alternate`,
        }}
      >
        <div
          className="font-mono text-[10px] tracking-[0.4em] text-primary/70 uppercase mb-4"
          style={{
            background: "hsl(var(--background) / 0.35)",
            backdropFilter: "blur(8px)",
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: 4,
            border: "1px solid hsl(var(--primary) / 0.12)",
          }}
        >
          {numeral} / {String(total).padStart(2, "0")} · {item.label || (isVideo ? "Clip" : "Frame")}
        </div>

        <div className="overflow-hidden mb-6">
          <h3
            className="display-mega text-gradient-love leading-[0.92]"
            style={{
              fontSize: "clamp(2.6rem, 6.4vw, 6rem)",
              letterSpacing: "-0.03em",
              textShadow: "0 30px 60px hsl(0 0% 0% / 0.55), 0 6px 18px hsl(0 0% 0% / 0.45)",
              transform: reduced ? undefined : revealed ? "translateY(0)" : "translateY(105%)",
              opacity: revealed ? 1 : 0,
              transition: reduced
                ? "none"
                : "transform 1.1s cubic-bezier(0.23,1,0.32,1) 0.15s, opacity 1.1s ease 0.15s",
            }}
          >
            {item.caption}
          </h3>
        </div>

        <div
          className="cinematic-rule mb-6"
          style={{ marginLeft: isLeft ? "auto" : 0, maxWidth: 220 }}
        />

        {item.subtitle && (
          <p
            className="text-muted-foreground italic"
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "clamp(1rem, 1.3vw, 1.2rem)",
              lineHeight: 1.55,
              maxWidth: 440,
              marginLeft: isLeft ? "auto" : 0,
              textShadow: "0 2px 12px hsl(0 0% 0% / 0.5)",
            }}
          >
            {item.subtitle}
          </p>
        )}

        <button
          onClick={onOpen}
          className="group/btn mt-8 inline-flex items-center gap-3 text-xs tracking-[0.35em] uppercase font-mono text-primary hover:text-foreground transition-colors"
        >
          <span>View {isVideo ? "Clip" : "Frame"}</span>
          <span className="inline-block w-10 h-[1px] bg-primary/60 group-hover/btn:w-20 transition-all duration-500" />
        </button>
      </div>

      {/* FOREGROUND ATMOSPHERE — film-slate tag drifting opposite the title */}
      {isDesktop && (
        <div
          aria-hidden
          data-parallax={reduced ? undefined : "0.06"}
          className="hidden md:block absolute font-mono text-[9px] tracking-[0.45em] uppercase text-primary/40"
          style={{
            [isLeft ? "left" : "right"]: "4%",
            top: `${(v.txtTop + 38) % 90}%`,
            zIndex: 3,
            writingMode: "vertical-rl",
            transform: `rotate(${isLeft ? 0 : 180}deg) translateZ(60px)`,
          }}
        >
          REEL · {String(index + 1).padStart(3, "0")} · {isVideo ? "MOTION" : "STILL"}
        </div>
      )}

      {/* Light streak — diagonal cinematic glow crossing the frame */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          [isLeft ? "right" : "left"]: "10%",
          top: "30%",
          width: "40%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, hsl(var(--love-gold) / 0.5), transparent)",
          transform: `rotate(${isLeft ? -18 : 18}deg)`,
          filter: "blur(0.5px)",
          opacity: 0.6,
          zIndex: 1,
        }}
      />
    </div>
  );
}
