import { useMemo } from "react";

import CinematicShowcase from "@/components/CinematicShowcase";
import type { PanoramaItem } from "@/components/GalleryPanorama";
import rhia1 from "@/assets/rhia1.png";
import rhia2 from "@/assets/rhia2.png";
import rhia3 from "@/assets/rhia3.png";
import rhia4 from "@/assets/rhia4.png";
import rhia5 from "@/assets/rhia5.png";
import rhia6 from "@/assets/rhia6.jpeg";

/* ─── Photo data ─── */
const PHOTOS = [
  { src: rhia1, caption: "Soft little smile", subtitle: "The look that rewires my whole day" },
  { src: rhia2, caption: "Main character energy", subtitle: "Every angle, an entire moodboard" },
  { src: rhia6, caption: "Mirror, mirror", subtitle: "Caught the prettiest girl in the frame" },
  { src: rhia4, caption: "Puppy mode activated", subtitle: "Should be illegal to be this cute" },
  { src: rhia5, caption: "Pink, plush, perfect", subtitle: "Hello Kitty wishes she was you" },
  { src: rhia3, caption: "Heart-stopper", subtitle: "I forget how to breathe, every time" },
];

/* ─── Video data ─── */
const VIDEOS = [
  { id: 1, src: "/videos/vid1.mp4", thumb: "/videos/thumb1.jpg", caption: "Giggles on loop", subtitle: "Dec 29, 2025 — caught mid-laugh" },
  { id: 2, src: "/videos/vid2.mp4", thumb: "/videos/thumb2.jpg", caption: "Just us, unfiltered", subtitle: "Jan 28, 2026 — favorite kind of chaos" },
  { id: 3, src: "/videos/vid3.mp4", thumb: "/videos/thumb3.jpg", caption: "Replay-worthy", subtitle: "The clip I keep coming back to" },
  { id: 4, src: "/videos/vid4.mp4", thumb: "/videos/thumb4.jpg", caption: "Blanket fortress", subtitle: "Dec 1, 2025 — softest evening" },
  { id: 5, src: "/videos/vid5.mp4", thumb: "/videos/thumb5.jpg", caption: "Wander mode on", subtitle: "Dec 6, 2025 — chasing little adventures" },
  { id: 6, src: "/videos/vid6.mp4", thumb: "/videos/thumb6.jpg", caption: "My always", subtitle: "Dec 7, 2025 — proof we're forever" },
  { id: 7, src: "/videos/vid7.mp4", thumb: "/videos/thumb7.jpg", caption: "2 a.m. magic", subtitle: "Dec 28, 2025 — quiet, glowy, ours" },
];

// Try to extract a "MMM YYYY" label from a subtitle string.
function extractLabel(text: string, fallback: string) {
  const m = text.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}?,?\s*(\d{4})/i);
  if (m) return `${m[1].slice(0, 3).toUpperCase()} ${m[2]}`;
  return fallback;
}

export default function GalleryPage() {

  const panoramaItems = useMemo<PanoramaItem[]>(() => {
    const photoItems: PanoramaItem[] = PHOTOS.map((p, i) => ({
      id: `p-${i}`,
      type: "photo",
      src: p.src,
      caption: p.caption,
      subtitle: p.subtitle,
      label: extractLabel(p.subtitle, `MOMENT ${i + 1}`),
    }));
    const videoItems: PanoramaItem[] = VIDEOS.map((v, i) => ({
      id: `v-${v.id}`,
      type: "video",
      src: v.src,
      thumb: v.thumb,
      caption: v.caption,
      subtitle: v.subtitle,
      label: extractLabel(v.subtitle, `CLIP ${i + 1}`),
    }));
    return [...photoItems, ...videoItems];
  }, []);

  return (
    <div className="min-h-screen relative pb-32 bg-transparent overflow-hidden">
      {/* Cinematic title card — off-center, layered, no webby alignment */}
      <section className="relative max-w-[1400px] mx-auto px-6 sm:px-10 pt-32 sm:pt-44 pb-24">
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
          01
        </span>

        <div
          data-parallax="-0.04"
          className="relative z-[2] font-mono text-[10px] tracking-[0.5em] uppercase text-primary/70 mb-6"
        >
          Reel · 2025 — 2026 · Director's Cut
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
          The Most<br/>Beautiful<br/>Girl
        </h1>

        <div
          className="relative z-[2] mt-10 ml-auto"
          style={{ maxWidth: 360 }}
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
            Fragments, frames and quiet moments — assembled into something that
            looks a lot like falling, again, every time.
          </p>
        </div>
      </section>

      <div className="relative z-[1] mx-auto max-w-[1400px] px-2 sm:px-4">
        <CinematicShowcase items={panoramaItems} />

        <div
          className="mt-24 flex items-center justify-between font-mono text-[10px] tracking-[0.45em] uppercase text-primary/50 px-6"
        >
          <span>End of Reel</span>
          <span className="flex-1 mx-6 h-[1px] bg-primary/20" />
          <span>Click any frame · 35mm</span>
        </div>
      </div>
    </div>
  );
}
