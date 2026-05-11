import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import ParticleCanvas, { useParticles } from "@/components/ParticleCanvas";
import { generateLoveStory } from "@/lib/love-story.functions";

const MILESTONES = [
  {
    date: "Before Nov 2025",
    emoji: "🎮",
    title: "First Encounter on Valorant",
    description: "We played together before we even knew each other. You were a Sage main on Pearl, playing on your alt because your main got banned. Fate was already at work.",
    detail: "I didn't know yet that the random Sage on my team would become the most important person in my life.",
    badge: "⚔️",
    badgeLabel: "Quest Start",
    stats: ["+50 Destiny", "+30 Curiosity"],
    boss: false,
  },
  {
    date: "November 29, 2025",
    emoji: "💬",
    title: "First Discord Message",
    description: "The day I finally reached out to you on Discord. The conversation that started everything.",
    detail: "From that first message, I felt something different. You weren't just another person online — you were someone special.",
    badge: "💫",
    badgeLabel: "Connection Made",
    stats: ["+80 Courage", "+60 Hope"],
    boss: false,
  },
  {
    date: "December 2, 2025",
    emoji: "🎂",
    title: "Rhia's Birthday",
    description: "Your birthday — the day the world got its most beautiful gift. Half Turkish, half Vietnamese, fully perfect.",
    detail: "Born on December 2nd, just one day before we became official. The universe really planned this perfectly.",
    badge: "🌟",
    badgeLabel: "Special Day",
    stats: ["+100 Joy", "+50 Gratitude"],
    boss: false,
  },
  {
    date: "December 3, 2025",
    emoji: "❤️",
    title: "We Became Official",
    description: "The day we made it official. The best decision of my life. Our anniversary forever.",
    detail: "One day after your birthday — like the universe gave us both the best gift we could ever ask for.",
    badge: "👑",
    badgeLabel: "BOSS LEVEL",
    stats: ["+200 Love", "+100 Happiness", "+∞ Commitment"],
    boss: true,
  },
  {
    date: "Ongoing",
    emoji: "🦋",
    title: "Through Every Restriction",
    description: "Even when your parents restricted you from texting and playing, you still remembered me. You still came back.",
    detail: "That's when I truly knew you were special. Distance and restrictions couldn't stop what we have.",
    badge: "🛡️",
    badgeLabel: "Trial Overcome",
    stats: ["+150 Trust", "+120 Resilience"],
    boss: false,
  },
  {
    date: "Ongoing",
    emoji: "🎯",
    title: "Gaming Together",
    description: "Valorant, Fortnite, DBD, Roblox — every game is better with you by my side.",
    detail: "Win or lose, every match with you is my favorite. You make even the worst games fun.",
    badge: "🏆",
    badgeLabel: "Side Quest",
    stats: ["+80 Fun", "+60 Teamwork"],
    boss: false,
  },
  {
    date: "Forever",
    emoji: "💕",
    title: "Our Future",
    description: "This is just the beginning. Every day with you is a new milestone worth celebrating.",
    detail: "The best chapters of our story haven't been written yet — and I can't wait to live them with you.",
    badge: "✨",
    badgeLabel: "Legendary",
    stats: ["+∞ Love", "+∞ Forever"],
    boss: true,
  },
];

// Web Audio chime
function playChime(freq = 880) {
  try {
    const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    gain.gain.setValueAtTime(0.08, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.6);
    osc.connect(gain).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + 0.6);
    setTimeout(() => ac.close(), 1000);
  } catch {}
}

function XPBar({ filled, boss }: { filled: boolean; boss: boolean }) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">XP</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{
        background: "hsl(var(--muted))",
      }}>
        <div
          className="h-full rounded-full transition-all duration-[1.5s] ease-out"
          style={{
            width: filled ? "100%" : "0%",
            background: boss
              ? "linear-gradient(90deg, hsl(var(--love-gold)), hsl(var(--love-pink)), hsl(var(--love-purple)))"
              : "linear-gradient(90deg, hsl(var(--love-pink)), hsl(var(--love-gold)))",
            boxShadow: filled ? "0 0 10px hsl(var(--love-pink) / 0.4)" : "none",
          }}
        />
      </div>
      <span className="text-[10px] text-primary/60 font-mono">{filled ? "COMPLETE" : "..."}</span>
    </div>
  );
}

function StatBadge({ text }: { text: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wide"
      style={{
        background: "hsl(var(--love-gold) / 0.1)",
        color: "hsl(var(--love-gold))",
        border: "1px solid hsl(var(--love-gold) / 0.2)",
      }}
    >
      {text}
    </span>
  );
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function QuestCard({
  milestone,
  index,
  onTrigger,
  activeIndex,
  aiStory,
  aiLoading,
}: {
  milestone: (typeof MILESTONES)[0];
  index: number;
  onTrigger: () => void;
  activeIndex: number;
  aiStory?: string;
  aiLoading?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [unlockShown, setUnlockShown] = useState(false);
  const isLeft = index % 2 === 0;
  const isActive = activeIndex >= index;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
          playChime(420 + index * 40);
          setTimeout(() => setUnlockShown(true), 400);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className={`flex items-start gap-4 sm:gap-6 w-full ${isLeft ? "flex-row" : "flex-row-reverse"}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.7s cubic-bezier(0.23,1,0.32,1) ${index * 0.1}s, transform 0.7s cubic-bezier(0.23,1,0.32,1) ${index * 0.1}s`,
        willChange: "opacity, transform",
        perspective: "1600px",
      }}
    >
      {/* 3D Flip Chapter Card */}
      <div
        className="flex-1 cursor-pointer relative"
        style={{
          perspective: "1600px",
          animation: visible ? `pageTurn 1.1s cubic-bezier(0.23,1,0.32,1) ${index * 0.12}s both` : undefined,
        }}
        onClick={() => {
          setFlipped((f) => !f);
          if (!flipped) onTrigger();
        }}
      >
        <div
          className="relative w-full flip-card-stack"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.9s cubic-bezier(0.23,1,0.32,1)",
            transform: `${flipped ? "rotateY(180deg)" : "rotateY(0deg)"} translateZ(${flipped ? 50 : 0}px)`,
            minHeight: 360,
          }}
        >
          {/* FRONT — chapter cover */}
          <div
            className={`flip-face rounded-2xl sm:rounded-3xl p-7 sm:p-10 flex flex-col ${milestone.boss ? "parchment-grand" : "parchment"}`}
          >
            <div
              className="flex items-center gap-2 mb-4"
              style={{
                opacity: unlockShown ? 1 : 0,
                transform: unlockShown ? "translateY(0)" : "translateY(-10px)",
                transition: "all 0.5s cubic-bezier(0.23,1,0.32,1)",
                color: "hsl(28 50% 30%)",
              }}
            >
              <span className="text-xl">{milestone.badge}</span>
              <span className={`text-[10px] font-mono tracking-[0.25em] uppercase ${milestone.boss ? "text-amber-700" : "opacity-70"}`}>
                {milestone.badgeLabel}
              </span>
              {milestone.boss && (
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-mono"
                  style={{ background: "hsl(45 80% 50% / 0.2)", color: "hsl(35 80% 30%)", border: "1px solid hsl(45 80% 40% / 0.5)" }}>
                  ★ GRAND CHAPTER
                </span>
              )}
            </div>

            <p className="font-chapter text-xs tracking-[0.4em] uppercase mb-1" style={{ color: "hsl(35 70% 28%)" }}>
              Chapter {ROMAN[index] || index + 1}
            </p>
            <h3 className={`font-chapter font-bold text-2xl sm:text-3xl mb-3 leading-tight`}
              style={{ color: milestone.boss ? "hsl(35 90% 25%)" : "hsl(28 60% 22%)" }}>
              {milestone.title}
            </h3>

            <p className="text-xs font-mono tracking-widest mb-5 italic" style={{ color: "hsl(28 30% 35%)" }}>
              ~ {milestone.date} ~
            </p>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{milestone.emoji}</span>
              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, hsl(28 50% 30% / 0.4), transparent)" }} />
            </div>

            <p className="font-hand text-xl sm:text-2xl leading-snug mb-4" style={{ color: "hsl(25 50% 22%)" }}>
              {aiStory || milestone.description}
              {aiLoading && !aiStory && (
                <span className="ml-2 inline-block align-middle text-xs font-mono opacity-60" style={{ color: "hsl(28 50% 30%)" }}>
                  ✒︎ ink still drying…
                </span>
              )}
            </p>

            <div className="flex flex-wrap gap-1.5 mt-auto">
              {milestone.stats.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wide"
                  style={{ background: "hsl(45 80% 50% / 0.15)", color: "hsl(35 80% 28%)", border: "1px solid hsl(45 70% 40% / 0.4)" }}>
                  {s}
                </span>
              ))}
            </div>

            <p className="text-[10px] font-mono mt-5 text-center opacity-50" style={{ color: "hsl(28 50% 25%)" }}>
              ~ turn the page ~
            </p>
          </div>

          {/* BACK — quest log detail */}
          <div
            className={`flip-face flip-face-back rounded-2xl sm:rounded-3xl p-7 sm:p-10 flex flex-col ${milestone.boss ? "parchment-grand" : "parchment"}`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-chapter text-xs tracking-[0.4em] uppercase" style={{ color: "hsl(35 70% 28%)" }}>
                📜 Quest Log
              </span>
              <span className="text-[10px] font-mono opacity-60" style={{ color: "hsl(28 50% 25%)" }}>
                Chapter {ROMAN[index] || index + 1}
              </span>
            </div>
            <div className="h-px mb-5" style={{ background: "linear-gradient(90deg, transparent, hsl(28 50% 30% / 0.5), transparent)" }} />
            <p className="font-hand text-2xl sm:text-3xl leading-snug flex-1" style={{ color: "hsl(25 50% 20%)" }}>
              {milestone.detail}
            </p>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-2xl" style={{ animation: "candleFlicker 2.4s ease-in-out infinite" }}>🕯️</span>
              <span className="text-[10px] font-mono opacity-60" style={{ color: "hsl(28 50% 25%)" }}>
                ✦ Quest Complete ✦
              </span>
              <span className="text-2xl">🪶</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quest node on the path */}
      <div className="flex flex-col items-center flex-shrink-0 pt-6">
        <div
          className="rounded-full border-2 flex items-center justify-center"
          style={{
            width: isActive ? 28 : 24,
            height: isActive ? 28 : 24,
            borderColor: milestone.boss ? "hsl(45, 80%, 50%)" : "hsl(var(--primary))",
            background: isActive
              ? milestone.boss ? "hsl(45, 80%, 50%)" : "hsl(var(--primary))"
              : "transparent",
            boxShadow: isActive
              ? milestone.boss
                ? "0 0 20px hsl(45 80% 50% / 0.6), 0 0 40px hsl(45 80% 50% / 0.2)"
                : "0 0 20px hsl(var(--love-pink) / 0.5)"
              : "none",
            transition: "all 0.6s cubic-bezier(0.23,1,0.32,1)",
          }}
        >
          {isActive && (
            <span className="text-xs" style={{ animation: "scale-in 0.3s ease forwards" }}>
              {milestone.boss ? "👑" : "✦"}
            </span>
          )}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1 hidden sm:block" />
    </div>
  );
}

// Winding SVG path component
function RPGPath({ progress, height }: { progress: number; height: number }) {
  const pathLength = height;
  return (
    <svg
      className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none"
      width="40"
      height={height}
      style={{ overflow: "visible" }}
    >
      {/* Background dotted path */}
      <line
        x1="20" y1="0" x2="20" y2={height}
        stroke="hsl(340, 30%, 20%)"
        strokeWidth="2"
        strokeDasharray="6 8"
        opacity="0.4"
      />
      {/* Glowing progress line */}
      <line
        x1="20" y1="0" x2="20" y2={height}
        stroke="url(#rpgGradient)"
        strokeWidth="3"
        strokeDasharray={`${pathLength}`}
        strokeDashoffset={pathLength - (pathLength * progress)}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.15s linear", filter: "drop-shadow(0 0 6px hsl(340 70% 60% / 0.5))" }}
      />
      {/* Traveling orb */}
      <circle
        cx="20"
        cy={Math.max(0, height * progress)}
        r="5"
        fill="hsl(45, 100%, 62%)"
        style={{
          filter: "drop-shadow(0 0 8px hsl(45 100% 62% / 0.8))",
          transition: "cy 0.15s linear",
        }}
      />
      <circle
        cx="20"
        cy={Math.max(0, height * progress)}
        r="8"
        fill="none"
        stroke="hsl(45, 100%, 62%)"
        strokeWidth="1"
        opacity="0.3"
        style={{ transition: "cy 0.15s linear", animation: "breathe 2s ease-in-out infinite" }}
      />
      <defs>
        <linearGradient id="rpgGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(340, 70%, 60%)" />
          <stop offset="50%" stopColor="hsl(45, 100%, 62%)" />
          <stop offset="100%" stopColor="hsl(270, 80%, 65%)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Avatar reactions
function AvatarReactions({ activeIndex }: { activeIndex: number }) {
  const [reactions, setReactions] = useState<{ id: number; emoji: string; side: "left" | "right" }[]>([]);
  const idRef = useRef(0);
  const prevIndex = useRef(-1);

  useEffect(() => {
    if (activeIndex > prevIndex.current && activeIndex >= 0) {
      prevIndex.current = activeIndex;
      const emojis = ["💖", "🥰", "✨", "💕", "😍", "🫶"];
      const id = idRef.current++;
      const emoji = emojis[activeIndex % emojis.length];
      const side = Math.random() > 0.5 ? "left" : "right" as const;
      setReactions(prev => [...prev, { id, emoji, side }]);
      setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 2000);
    }
  }, [activeIndex]);

  const merged = activeIndex >= MILESTONES.length - 1;

  return (
    <div className="flex justify-center items-center gap-6 mb-12 relative">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl glass-card relative"
        style={{
          transform: merged ? "translateX(20px)" : "translateX(0)",
          transition: "transform 1s cubic-bezier(0.23,1,0.32,1)",
          animation: "floatUp 4s ease-in-out infinite",
        }}
      >
        🧑‍💻
        {reactions.filter(r => r.side === "left").map(r => (
          <span
            key={r.id}
            className="absolute -top-2 text-lg pointer-events-none"
            style={{ animation: "rippleFade 1.5s ease forwards" }}
          >
            {r.emoji}
          </span>
        ))}
      </div>

      {merged ? (
        <div
          className="text-3xl"
          style={{ animation: "pulse-heart 1.5s ease-in-out infinite" }}
        >
          💗
        </div>
      ) : (
        <div className="text-muted-foreground/30 text-sm font-mono">×</div>
      )}

      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl glass-card relative"
        style={{
          transform: merged ? "translateX(-20px)" : "translateX(0)",
          transition: "transform 1s cubic-bezier(0.23,1,0.32,1)",
          animation: "floatUpSlow 4.5s ease-in-out infinite",
        }}
      >
        👩
        {reactions.filter(r => r.side === "right").map(r => (
          <span
            key={r.id}
            className="absolute -top-2 text-lg pointer-events-none"
            style={{ animation: "rippleFade 1.5s ease forwards" }}
          >
            {r.emoji}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TimelinePage() {
  const { particlesRef, burstHearts, shootingStars, doFireworks } = useParticles();
  const containerRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [containerPx, setContainerPx] = useState(800);

  // AI-written love story chapters (replaces hand-typed descriptions)
  const callGenerateLoveStory = useServerFn(generateLoveStory);
  const aiQuery = useQuery({
    queryKey: ["love-story", MILESTONES.map((m) => m.title).join("|")],
    queryFn: () =>
      callGenerateLoveStory({
        data: {
          chapters: MILESTONES.map((m) => ({
            title: m.title,
            date: m.date,
            seed: `${m.description} — inner: ${m.detail}`,
          })),
        },
      }),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  useEffect(() => {
    const onScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setContainerPx(containerRef.current.scrollHeight);
      const viewportCenter = window.innerHeight * 0.6;
      const progress = Math.max(0, Math.min(1, (viewportCenter - rect.top) / rect.height));
      setLineHeight(progress);

      // Determine active milestone
      const newActive = Math.min(MILESTONES.length - 1, Math.floor(progress * MILESTONES.length));
      setActiveIndex(prev => Math.max(prev, newActive));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Confetti on final milestone
  const finalTriggered = useRef(false);
  useEffect(() => {
    if (activeIndex >= MILESTONES.length - 1 && !finalTriggered.current) {
      finalTriggered.current = true;
      const W = window.innerWidth;
      const H = window.innerHeight;
      doFireworks(W, H);
      setTimeout(() => burstHearts(W, H), 300);
    }
  }, [activeIndex, doFireworks, burstHearts]);

  return (
    <div className="min-h-screen relative pb-32">
      <ParticleCanvas particlesRef={particlesRef} />

      <div className="relative z-[1] max-w-[850px] mx-auto px-6 pt-24 sm:pt-32">
        {/* Header */}
        <div className="text-center mb-4">
          <span data-parallax="-0.05" className="display-eyebrow inline-block mb-4" style={{ animation: "fadeSlide 0.8s ease forwards" }}>
            ✦ An Illuminated Manuscript ✦
          </span>
          <h1
            data-reveal
            data-parallax="-0.08"
            className="display-mega text-gradient-gold mb-5"
            style={{ animation: "fadeSlide 1s cubic-bezier(0.23,1,0.32,1) forwards" }}
          >
            The Chronicle of Us
          </h1>
          <div className="cinematic-rule mx-auto max-w-[280px] mb-5" />
          <p
            className="font-hand text-2xl sm:text-3xl"
            style={{ opacity: 0, animation: "fadeSlide 1s cubic-bezier(0.23,1,0.32,1) 0.3s forwards", color: "hsl(var(--love-soft))" }}
          >
            ~ a tale of every chapter that brought us closer ~
          </p>
        </div>

        {/* Chapter indicator */}
        <div
          className="flex justify-center items-center gap-3 mb-10"
          style={{ opacity: 0, animation: "fadeSlide 1s ease 0.5s forwards" }}
        >
          <span className="text-[10px] font-mono text-muted-foreground tracking-widest">CHAPTER</span>
          <span className="font-chapter text-2xl font-bold text-gradient-gold">
            {ROMAN[Math.min(MILESTONES.length - 1, Math.max(0, activeIndex))] || activeIndex + 1}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">of {ROMAN[MILESTONES.length - 1]}</span>
        </div>

        {/* Avatars */}
        <AvatarReactions activeIndex={activeIndex} />

        {/* Timeline container */}
        <div className="relative" ref={containerRef}>
          <RPGPath progress={lineHeight} height={containerPx} />

          <div className="flex flex-col gap-12 sm:gap-16">
            {MILESTONES.map((m, i) => (
              <QuestCard
                key={i}
                milestone={m}
                index={i}
                activeIndex={activeIndex}
                aiStory={aiQuery.data?.chapters[i]?.story}
                aiLoading={aiQuery.isLoading}
                onTrigger={() => {
                  const W = window.innerWidth;
                  const H = window.innerHeight;
                  if (m.boss) {
                    burstHearts(W, H);
                    shootingStars(W, H);
                  } else if (i % 2 === 0) {
                    burstHearts(W, H);
                  } else {
                    shootingStars(W, H);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* End message */}
        {activeIndex >= MILESTONES.length - 1 && (
          <div
            className="text-center mt-16"
            style={{ animation: "fadeSlide 1s ease forwards" }}
          >
            <p className="text-gradient-gold text-xl font-display font-bold">
              🏆 All Quests Complete — But Our Adventure Never Ends 🏆
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
