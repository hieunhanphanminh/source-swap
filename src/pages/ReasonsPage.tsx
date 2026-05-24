import { useState, useEffect, useRef } from "react";
import ParticleCanvas, { useParticles } from "@/components/ParticleCanvas";
import TiltCard from "@/components/TiltCard";
import GalleryLightbox from "@/components/portfolio/experience/gallery/GalleryLightbox";
import { GALLERY_ITEMS, type GalleryItem } from "@/constants/gallery";
import { useGalleryLightboxStore } from "@/stores/galleryLightboxStore";

function FlipCard({ item, index }: { item: GalleryItem; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const open = useGalleryLightboxStore((s) => s.open);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const numeral = String(index + 1).padStart(2, "0");
  const isVideo = item.type === "video";
  const poster = isVideo ? (item.thumb || item.src) : item.src;

  return (
    <div
      ref={ref}
      className="perspective-[1000px]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `all 0.6s cubic-bezier(0.23,1,0.32,1) ${index * 0.08}s`,
      }}
    >
      <TiltCard intensity={0.8} className="rounded-2xl cursor-pointer" onClick={() => setFlipped(!flipped)}>
      <div
        className="relative w-full h-[260px] sm:h-[280px] transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front — numeral + thumbnail */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden border border-secondary/20"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img
            src={poster}
            alt={item.caption}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.55) saturate(0.85)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, hsl(0 0% 0% / 0.2) 0%, hsl(0 0% 0% / 0.7) 100%)",
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-5xl sm:text-6xl font-bold text-secondary font-display relative z-[1]"
              style={{ animation: `reasonPulse 3.6s ease-in-out infinite ${(index % 5) * 0.2}s`, display: "inline-block" }}
            >
              {numeral}
            </span>
            <span className="text-[10px] text-foreground/80 mt-2 font-mono tracking-widest uppercase relative z-[1]">
              {item.label}
            </span>
            <span className="text-[10px] text-muted-foreground mt-4 font-mono tracking-widest uppercase relative z-[1]">
              Tap to reveal
            </span>
          </div>
          {isVideo && (
            <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/70 backdrop-blur flex items-center justify-center text-foreground text-xs">
              ▶
            </span>
          )}
        </div>

        {/* Back — textbox with caption, subtitle, VIEW button */}
        <div
          className="absolute inset-0 rounded-2xl glass-card flex flex-col items-center justify-center p-5 sm:p-6 border border-primary/20"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <span
            className="font-mono text-[9px] tracking-[0.4em] uppercase text-primary/70 mb-3"
          >
            {item.label}
          </span>
          <h3
            className="text-foreground font-display text-center leading-tight"
            style={{
              fontFamily: "'Fraunces', 'Playfair Display', serif",
              fontSize: "clamp(1.1rem, 2.2vw, 1.4rem)",
              fontWeight: 600,
            }}
          >
            {item.caption}
          </h3>
          <div className="cinematic-rule my-3 mx-auto" style={{ maxWidth: 120 }} />
          <p
            className="text-muted-foreground text-xs sm:text-sm italic text-center leading-relaxed"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {item.subtitle}
          </p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); open(item); }}
            className="mt-4 inline-flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase font-mono text-primary hover:text-foreground transition-colors"
          >
            <span>View {isVideo ? "Clip" : "Frame"}</span>
            <span className="inline-block w-6 h-[1px] bg-primary/60" />
          </button>
        </div>
      </div>
      </TiltCard>
    </div>
  );
}

export default function ReasonsPage() {
  const { particlesRef } = useParticles();

  return (
    <div className="min-h-screen relative pb-32">
      <ParticleCanvas particlesRef={particlesRef} />

      <div className="relative z-[1] max-w-[1100px] mx-auto px-6 pt-24 sm:pt-32">
        <div className="text-center mb-12">
          <span data-parallax="-0.05" className="display-eyebrow inline-block mb-4">Reel · 2025 — 2026 · Director's Cut</span>
          <h1
            data-reveal
            data-parallax="-0.08"
            className="display-mega text-gradient-gold mb-5"
            style={{ animation: "fadeSlide 1s cubic-bezier(0.23,1,0.32,1) forwards" }}
          >
            The Most Beautiful Girl
          </h1>
          <div className="cinematic-rule mx-auto max-w-[280px] mb-5" />
          <p
            className="text-muted-foreground text-sm sm:text-base italic"
            style={{ opacity: 0, animation: "fadeSlide 1s cubic-bezier(0.23,1,0.32,1) 0.3s forwards" }}
          >
            Tap each card to reveal — then open the frame
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {GALLERY_ITEMS.map((item, i) => (
            <FlipCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>

      <GalleryLightbox />
    </div>
  );
}
