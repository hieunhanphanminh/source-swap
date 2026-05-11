import { useState, useEffect, useRef, useCallback } from "react";
import ParticleCanvas, { useParticles } from "@/components/ParticleCanvas";

const LETTER_PARAGRAPHS = [
  "My dearest Rhia,",
  "From the moment I met you on Valorant — back when you were just a Sage on Pearl with a banned main account — I had no idea you would become the most important person in my life.",
  "You are half Turkish, half Vietnamese, and fully the most beautiful soul I've ever encountered. Every moment with you feels like a dream I never want to wake up from.",
  "Even when your parents restricted you from texting and playing, you still came back. You still remembered me. That's when I truly knew — what we have is real.",
  "I love how you laugh, how you rage in Valorant, how you make even the worst days feel warm. You are my peace, my chaos, and everything in between.",
  "Every day with you is a new reason to be grateful. Every message, every call, every game together — it all means the world to me.",
  "I promise to love you through every restriction, every distance, every challenge. Because you, Rhia, are worth everything.",
  "Forever and always yours,",
  "With all my love 💖",
];

function FallingPetal({ delay }: { delay: number }) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: Math.random() * 100 + "%",
    top: -20,
    fontSize: 14 + Math.random() * 10,
    opacity: 0,
    animation: `petalFall ${8 + Math.random() * 6}s linear ${delay}s infinite`,
    pointerEvents: "none",
  };
  return <span style={style}>🌸</span>;
}

function WaxSeal({ visible }: { visible: boolean }) {
  return (
    <div
      className="flex justify-center mt-8"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1) rotate(0deg)" : "scale(0) rotate(-180deg)",
        transition: "all 1.2s cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: "radial-gradient(circle, #c0392b 0%, #8b1a1a 70%, #5a0f0f 100%)",
          boxShadow: "0 4px 20px rgba(192,57,43,0.5), inset 0 -2px 6px rgba(0,0,0,0.3), inset 0 2px 6px rgba(255,200,200,0.2)",
        }}
      >
        <span className="text-3xl" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}>💌</span>
        <div className="absolute inset-0 rounded-full" style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)",
        }} />
      </div>
    </div>
  );
}

export default function LoveLetterPage() {
  const { particlesRef, megaBurst, burstHearts } = useParticles();
  const [visibleLines, setVisibleLines] = useState(0);
  const [sealVisible, setSealVisible] = useState(false);
  const [kissed, setKissed] = useState(false);
  const lineTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    LETTER_PARAGRAPHS.forEach((_, i) => {
      const t = setTimeout(() => {
        setVisibleLines(i + 1);
        if (i === LETTER_PARAGRAPHS.length - 1) {
          setTimeout(() => setSealVisible(true), 600);
        }
      }, 1200 + i * 1800);
      lineTimers.current.push(t);
    });
    return () => lineTimers.current.forEach(clearTimeout);
  }, []);

  const handleKiss = useCallback(() => {
    if (kissed) return;
    setKissed(true);
    const W = window.innerWidth;
    const H = window.innerHeight;
    megaBurst(W, H);
    setTimeout(() => burstHearts(W, H), 400);
  }, [kissed, megaBurst, burstHearts]);

  return (
    <div className="min-h-screen relative overflow-hidden pb-32">
      <ParticleCanvas particlesRef={particlesRef} />

      {/* Rose petals */}
      <div className="fixed inset-0 pointer-events-none z-[2] overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <FallingPetal key={i} delay={i * 0.8} />
        ))}
      </div>

      {/* Letter */}
      <div className="relative z-[3] max-w-[650px] mx-auto px-6 pt-24 sm:pt-32">
        <div className="text-center mb-12">
          <span data-parallax="-0.05" className="display-eyebrow inline-block mb-4">Words From My Heart</span>
          <h1
            data-reveal
            data-parallax="-0.08"
            className="display-mega text-gradient-love mb-5"
            style={{ animation: "fadeSlide 1s cubic-bezier(0.23,1,0.32,1) forwards" }}
          >
            A Letter For You
          </h1>
          <div className="cinematic-rule mx-auto max-w-[280px]" />
        </div>

        {/* Parchment card */}
        <div
          className="rounded-3xl p-8 sm:p-12 relative overflow-hidden depth-shadow ambient-glow"
          style={{
            background: "linear-gradient(145deg, hsl(35 30% 12%), hsl(30 20% 9%))",
            border: "1px solid hsl(35 40% 25% / 0.3)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 hsl(35 40% 20% / 0.2)",
          }}
        >
          {/* Warm light overlay */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, hsl(35 80% 60% / 0.06), transparent)",
              filter: "blur(30px)",
            }}
          />

          {LETTER_PARAGRAPHS.map((line, i) => {
            const isGreeting = i === 0;
            const isSignoff = i >= LETTER_PARAGRAPHS.length - 2;
            return (
              <p
                key={i}
                className={`mb-5 leading-relaxed transition-all duration-1000 ${
                  isGreeting
                    ? "text-xl sm:text-2xl font-display font-bold text-foreground/90"
                    : isSignoff
                    ? "font-display italic text-primary/80 text-right"
                    : "text-foreground/70 text-sm sm:text-base"
                }`}
                style={{
                  opacity: i < visibleLines ? 1 : 0,
                  transform: i < visibleLines ? "translateY(0)" : "translateY(20px)",
                  filter: i < visibleLines ? "blur(0px)" : "blur(4px)",
                  transitionDelay: "0.1s",
                }}
              >
                {line}
              </p>
            );
          })}

          <WaxSeal visible={sealVisible} />

          {sealVisible && (
            <div className="text-center mt-8">
              <button
                onClick={handleKiss}
                disabled={kissed}
                className={`px-8 py-3 rounded-full font-display text-sm tracking-widest uppercase transition-all duration-700 ${
                  kissed
                    ? "bg-primary/20 text-primary/60 cursor-default"
                    : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 hover:border-primary/40 hover:scale-105"
                }`}
                style={{
                  animation: kissed ? undefined : "breathe 3s ease-in-out infinite",
                }}
              >
                {kissed ? "💋 Sealed with love" : "💋 Seal with a Kiss"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
