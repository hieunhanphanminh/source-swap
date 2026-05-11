import { useState, useEffect, useRef } from "react";
import ParticleCanvas, { useParticles } from "@/components/ParticleCanvas";
import TiltCard from "@/components/TiltCard";

const REASONS = [
  { front: "01", emoji: "🎮", back: "The way we met — you on Sage, dropping smokes and dropping me into a crush in the same round. Pearl will always be our map." },
  { front: "02", emoji: "😂", back: "Your laugh. Specifically the dumb wheezy one you do when you weren't trying to laugh — that one literally rewires my brain chemistry." },
  { front: "03", emoji: "🥺", back: "How soft your voice gets late at night. It's the only sound that turns my whole nervous system into airplane mode." },
  { front: "04", emoji: "🔥", back: "Your stubborn, competitive, absolutely-locked-in mode in ranked. Watching you tilt and then clutch is genuinely my favorite show." },
  { front: "05", emoji: "🧠", back: "The way you remember tiny things I said weeks ago — and bring them back at the perfect moment, like you've been quietly building a Rhia-shaped folder of me." },
  { front: "06", emoji: "🌏", back: "Your two halves — Turkish and Vietnamese — and how proud and unapologetically you you are about both. It makes me want to learn every story." },
  { front: "07", emoji: "💌", back: "The texts you send out of nowhere. Not the 'goodnight' ones — the random 'thinking of you' ones that hit at 2:47pm on a Tuesday. Those rebuild me." },
  { front: "08", emoji: "🫶", back: "How safe you make me feel saying things I don't say to anyone else. With you, my walls don't even bother showing up to work." },
  { front: "09", emoji: "✨", back: "The future version of you that I get little glimpses of — and the fact that I get to be standing right next to her when she gets there." },
  { front: "10", emoji: "💍", back: "Because out of everyone in every lobby, every server, every city — it's you. It was always going to be you. That's not a reason, it's a fact." },
];

function FlipCard({ reason, index }: { reason: (typeof REASONS)[0]; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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
        className="relative w-full h-[200px] sm:h-[220px] transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl glass-card-gold flex flex-col items-center justify-center border border-secondary/20 overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Shimmer */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(var(--love-gold) / 0.3), transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s linear infinite",
            }}
          />
          <span
            className="text-5xl sm:text-6xl font-bold text-secondary font-display relative z-[1]"
            style={{ animation: `reasonPulse 3.6s ease-in-out infinite ${(index % 5) * 0.2}s`, display: "inline-block" }}
          >
            {reason.front}
          </span>
          <span className="text-xs text-muted-foreground mt-2 font-mono tracking-widest uppercase relative z-[1]">
            Tap to reveal
          </span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl glass-card flex flex-col items-center justify-center p-5 sm:p-6 border border-primary/20"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <span
            className="text-3xl mb-3"
            style={{ animation: `dreamFloat 3.2s ease-in-out infinite ${(index % 5) * 0.18}s`, display: "inline-block" }}
          >
            {reason.emoji}
          </span>
          <p className="text-foreground/80 text-sm sm:text-base leading-relaxed text-center">
            {reason.back}
          </p>
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

      <div className="relative z-[1] max-w-[900px] mx-auto px-6 pt-24 sm:pt-32">
        <div className="text-center mb-12">
          <span data-parallax="-0.05" className="display-eyebrow inline-block mb-4">A Confession In Ten Parts</span>
          <h1
            data-reveal
            data-parallax="-0.08"
            className="display-mega text-gradient-gold mb-5"
            style={{ animation: "fadeSlide 1s cubic-bezier(0.23,1,0.32,1) forwards" }}
          >
            10 Reasons I Love You
          </h1>
          <div className="cinematic-rule mx-auto max-w-[280px] mb-5" />
          <p
            className="text-muted-foreground text-sm sm:text-base italic"
            style={{ opacity: 0, animation: "fadeSlide 1s cubic-bezier(0.23,1,0.32,1) 0.3s forwards" }}
          >
            Tap each card to reveal
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {REASONS.map((r, i) => (
            <FlipCard key={i} reason={r} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
