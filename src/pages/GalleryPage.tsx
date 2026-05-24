import { useMemo } from "react";

import CinematicShowcase from "@/components/CinematicShowcase";
import type { PanoramaItem } from "@/components/GalleryPanorama";
import { REASONS } from "@/constants/reasons";

/** Build a cinematic numeral card as an inline SVG data URI.
 *  Used as the "image" inside each CinematicShowcase block since reasons
 *  are text-first content. */
function numeralCard(numeral: string, emoji: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#15171c"/>
        <stop offset="50%" stop-color="#1a1d24"/>
        <stop offset="100%" stop-color="#0f1115"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="#c9a84c" stop-opacity="0.18"/>
        <stop offset="60%" stop-color="#c9a84c" stop-opacity="0.04"/>
        <stop offset="100%" stop-color="#c9a84c" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="800" height="600" fill="url(#bg)"/>
    <rect width="800" height="600" fill="url(#glow)"/>
    <text x="400" y="380" text-anchor="middle" font-family="Georgia, 'Fraunces', serif"
      font-size="360" font-weight="700" fill="none"
      stroke="#c9a84c" stroke-opacity="0.55" stroke-width="2"
      letter-spacing="-12">${numeral}</text>
    <text x="400" y="500" text-anchor="middle" font-size="72">${emoji}</text>
    <text x="400" y="555" text-anchor="middle" font-family="ui-monospace, monospace"
      font-size="18" fill="#9ca3af" letter-spacing="8">REASON ${numeral}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function GalleryPage() {
  const panoramaItems = useMemo<PanoramaItem[]>(() => {
    return REASONS.map((r, i) => ({
      id: `reason-${r.front}`,
      type: "photo",
      src: numeralCard(r.front, r.emoji),
      caption: r.back,
      subtitle: `${r.emoji}  ·  Reason ${r.front} of ${String(REASONS.length).padStart(2, "0")}`,
      label: `REASON ${r.front}`,
    } satisfies PanoramaItem));
  }, []);

  return (
    <div className="min-h-screen relative pb-32 bg-transparent overflow-hidden">
      {/* Cinematic title card */}
      <section className="relative max-w-[1600px] mx-auto px-6 sm:px-10 md:px-16 pt-32 sm:pt-44 pb-24">
        <span
          data-parallax="-0.18"
          aria-hidden
          className="absolute font-display select-none pointer-events-none text-transparent leading-none"
          style={{
            top: "10%",
            left: "-2%",
            fontSize: "clamp(10rem, 26vw, 28rem)",
            WebkitTextStroke: "1px hsl(var(--love-gold) / 0.10)",
            letterSpacing: "-0.06em",
            zIndex: 0,
          }}
        >
          10
        </span>

        <div
          data-parallax="-0.04"
          className="relative z-[2] font-mono text-[10px] tracking-[0.5em] uppercase text-primary/70 mb-6"
        >
          Confession · 2025 — 2026 · Ten Parts
        </div>

        <h1
          data-reveal
          data-parallax="-0.08"
          className="relative z-[2] display-mega text-gradient-love"
          style={{
            fontSize: "clamp(3rem, 9vw, 8rem)",
            lineHeight: 0.92,
            letterSpacing: "-0.035em",
            maxWidth: "16ch",
            animation: "fadeSlide 1s cubic-bezier(0.23,1,0.32,1) forwards",
            textShadow: "0 30px 80px hsl(0 0% 0% / 0.5)",
          }}
        >
          Ten Reasons<br/>I Love<br/>You
        </h1>

        <div
          className="relative z-[2] mt-10 ml-auto"
          style={{ maxWidth: 380 }}
        >
          <div className="cinematic-rule mb-4" />
          <p
            className="text-muted-foreground text-sm sm:text-base italic text-right"
            style={{
              fontFamily: "'Fraunces', serif",
              opacity: 0,
              animation: "fadeSlide 1s cubic-bezier(0.23,1,0.32,1) 0.3s forwards",
            }}
          >
            Ten confessions, cut like a director's reel — every frame a reason,
            every reason still landing harder than the last.
          </p>
        </div>
      </section>

      <div className="relative z-[1] mx-auto max-w-[1600px] px-2 sm:px-4">
        <CinematicShowcase items={panoramaItems} />

        <div
          className="mt-24 flex items-center justify-between font-mono text-[10px] tracking-[0.45em] uppercase text-primary/50 px-6"
        >
          <span>End of Confession</span>
          <span className="flex-1 mx-6 h-[1px] bg-primary/20" />
          <span>Ten of Ten · Always</span>
        </div>
      </div>
    </div>
  );
}
