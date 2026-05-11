import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import ParticleCanvas, { useParticles } from "@/components/ParticleCanvas";
import { useMelody } from "@/components/MelodyPlayer";


const EMOJIS = ["💖", "💕", "✨", "🥰", "💗", "❤️‍🔥", "🌹", "💘"];

const CODE_LINES = [
  "while(true) { loveRhia(); }",
  "if(rhia) return happiness;",
  "const us = forever;",
  "import { Love } from 'my-heart';",
  "try { missHer() } catch { hugs() }",
  "console.log('Rhia is beautiful');",
  "git commit -m 'fell for Rhia'",
  "const future = [rhia, me];",
  "await forever(withRhia);",
  "function appreciate(rhia) { return '∞'; }",
];

const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      let target = new Date(targetDate);
      if (now > target) {
        target = new Date(target.getFullYear() + 1, target.getMonth(), target.getDate());
      }
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };
    setTimeLeft(calc());
    const iv = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(iv);
  }, [targetDate.getTime()]);
  return timeLeft;
}

function useMouseParallax() {
  const offset = useRef({ x: 0, y: 0 });
  const [val, setVal] = useState({ x: 0, y: 0 });
  useEffect(() => {
    let raf = 0;
    const handler = (e: MouseEvent) => {
      offset.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      offset.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          setVal({ ...offset.current });
          raf = 0;
        });
      }
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => { window.removeEventListener("mousemove", handler); cancelAnimationFrame(raf); };
  }, []);
  return val;
}

function MagneticButton({ children, onClick, className, style }: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [transform, setTransform] = useState("");

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTransform(`translate(${x * 0.3}px, ${y * 0.3}px) scale(1.08)`);
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={className}
      style={{ ...style, transform, transition: "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTransform("translate(0, 0) scale(1)")}
    >
      {children}
    </button>
  );
}

function CountdownDigit({ value, label }: { value: number; label: string }) {
  const [prevValue, setPrevValue] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (value !== prevValue) {
      setFlipping(true);
      const t = setTimeout(() => { setPrevValue(value); setFlipping(false); }, 300);
      return () => clearTimeout(t);
    }
  }, [value, prevValue]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative overflow-hidden rounded-xl glass-card px-3 py-2 sm:px-5 sm:py-3 min-w-[3.5rem] sm:min-w-[4.5rem]">
        <span
          className="text-3xl sm:text-5xl font-bold text-gradient-love font-display block text-center"
          style={{
            WebkitTextFillColor: "unset",
            animation: flipping ? "numberFlip 0.3s ease" : undefined,
          }}
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs text-muted-foreground mt-2 tracking-widest uppercase">{label}</span>
    </div>
  );
}

const NAV_CARDS = [
  { path: "/timeline", emoji: "📅", title: "Our Timeline", desc: "Every milestone of our story", color: "primary" },
  { path: "/gallery", emoji: "📸", title: "Photo Gallery", desc: "The most beautiful girl", color: "primary" },
  { path: "/reasons", emoji: "💛", title: "10 Reasons", desc: "Why I love you, Rhia", color: "secondary" },
  { path: "/dreams", emoji: "✨", title: "Bucket List", desc: "Dreams we'll make real", color: "accent" },
];

export default function Index() {
  const navigate = useNavigate();
  const { particlesRef, burstHearts, shootingStars, doFireworks, megaBurst, clickBurst } = useParticles();
  const { playing, play } = useMelody();
  const [loveScore, setLoveScore] = useState(0);
  const [secretOpen, setSecretOpen] = useState(false);
  const [eggTriggered, setEggTriggered] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const [codeLines, setCodeLines] = useState<{ id: number; top: string; dur: string; text: string }[]>([]);
  const [konamiMsg, setKonamiMsg] = useState(false);
  const [doubleClickMsg, setDoubleClickMsg] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [introPlaying, setIntroPlaying] = useState(false);
  const rippleId = useRef(0);
  const codeId = useRef(0);
  const konamiIdx = useRef(0);
  const [dims, setDims] = useState({ W: 0, H: 0 });
  const mouseOffset = useMouseParallax();
  const scrollYRef = useRef(0);
  const [scrollY, setScrollY] = useState(0);

  const now = new Date();
  const annivYear = now > new Date(now.getFullYear(), 11, 3) ? now.getFullYear() + 1 : now.getFullYear();
  const countdown = useCountdown(new Date(annivYear, 11, 3));

  useEffect(() => {
    let raf = 0;
    const onResize = () => setDims({ W: window.innerWidth, H: window.innerHeight });
    const onScroll = () => {
      scrollYRef.current = window.scrollY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          setScrollY(scrollYRef.current);
          raf = 0;
        });
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("resize", onResize); window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  // Konami code
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === KONAMI[konamiIdx.current]) {
        konamiIdx.current++;
        if (konamiIdx.current === KONAMI.length) {
          konamiIdx.current = 0;
          setKonamiMsg(true);
          megaBurst(dims.W, dims.H);
          burstHearts(dims.W, dims.H);
          doFireworks(dims.W, dims.H);
          setTimeout(() => { setKonamiMsg(false); navigate("/letter"); }, 3000);
        }
      } else { konamiIdx.current = 0; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dims, megaBurst, burstHearts, doFireworks]);

  // Spawn code lines
  useEffect(() => {
    const spawn = () => {
      const id = codeId.current++;
      setCodeLines(prev => [...prev, {
        id, top: Math.random() * 100 + "vh",
        dur: (18 + Math.random() * 18) + "s",
        text: CODE_LINES[Math.floor(Math.random() * CODE_LINES.length)],
      }]);
      setTimeout(() => setCodeLines(prev => prev.filter(c => c.id !== id)), 36000);
    };
    for (let i = 0; i < 4; i++) setTimeout(spawn, i * 600);
    const iv = setInterval(spawn, 3000);
    return () => clearInterval(iv);
  }, []);

  // Auto effects
  useEffect(() => {
    const t1 = setTimeout(() => burstHearts(dims.W, dims.H), 8000);
    const t2 = setTimeout(() => shootingStars(dims.W, dims.H), 14000);
    const t3 = setTimeout(() => doFireworks(dims.W, dims.H), 20000);
    const i1 = setInterval(() => burstHearts(dims.W, dims.H), 25000);
    const i2 = setInterval(() => shootingStars(dims.W, dims.H), 30000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearInterval(i1); clearInterval(i2); };
  }, [dims, burstHearts, shootingStars, doFireworks]);

  const addLove = useCallback((n: number) => {
    setLoveScore(prev => {
      const next = Math.min(100, prev + n);
      if (next >= 100 && !eggTriggered) {
        setEggTriggered(true);
        megaBurst(dims.W, dims.H);
        setSecretOpen(true);
      }
      return next;
    });
  }, [eggTriggered, megaBurst, dims]);

  const tripleClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleClick = (e: React.MouseEvent) => {
    clickBurst(e.clientX, e.clientY, dims.W, dims.H);
    const id = rippleId.current++;
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY, emoji }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 1200);
    addLove(1);
    setClickCount(prev => {
      const next = prev + 1;
      if (tripleClickTimer.current) clearTimeout(tripleClickTimer.current);
      tripleClickTimer.current = setTimeout(() => setClickCount(0), 800);
      if (next >= 10) {
        setDoubleClickMsg("🥰 You're really clicking a lot... just like how fast I fell for you, Rhia!");
        setTimeout(() => setDoubleClickMsg(null), 3000);
        burstHearts(dims.W, dims.H);
        shootingStars(dims.W, dims.H);
        return 0;
      }
      return next;
    });
  };

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => (entry.target as HTMLElement).classList.add("visible"), i * 120);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll("[data-reveal]").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div onClick={handleClick} className="min-h-screen relative">
      <ParticleCanvas particlesRef={particlesRef} />


      {/* Ambient gradient orbs removed — WebGL backdrop replaces them */}

      {/* Floating code lines */}
      {codeLines.map(cl => (
        <div key={cl.id} className="fixed whitespace-nowrap z-0 font-mono text-xs pointer-events-none"
          style={{ top: cl.top, color: "hsl(var(--love-pink) / 0.08)", animation: `scrollCode ${cl.dur} linear forwards`, right: "-100%" }}>
          {cl.text}
        </div>
      ))}

      {/* Click ripple emojis */}
      {ripples.map(r => (
        <span key={r.id} className="fixed pointer-events-none z-[5] text-3xl" style={{ left: r.x - 12, top: r.y - 12, animation: "rippleFade 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards" }}>
          {r.emoji}
        </span>
      ))}

      {/* Konami overlay */}
      {konamiMsg && (
        <div className="fixed inset-0 z-[20] flex items-center justify-center" style={{ animation: "fadeSlide 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards" }}>
          <div className="rounded-3xl border-2 border-secondary p-10 sm:p-12 backdrop-blur-2xl text-center max-w-lg glass-card"
            style={{ animation: "breathe 2s ease-in-out infinite" }}>
            <h2 className="text-secondary text-3xl sm:text-4xl font-bold font-display mb-3">🎮 KONAMI CODE UNLOCKED!</h2>
            <p className="text-foreground/80 text-lg">You're a true gamer Rhia... just like when we met on Valorant 💕</p>
            <p className="text-primary text-sm mt-3 font-mono tracking-widest">↑↑↓↓←→←→BA</p>
          </div>
        </div>
      )}

      {/* Toast */}
      {doubleClickMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[20] rounded-2xl px-8 py-4 text-center backdrop-blur-2xl glass-card max-w-md"
          style={{ animation: "fadeSlide 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards" }}>
          <p className="text-foreground/90 text-lg">{doubleClickMsg}</p>
        </div>
      )}

      {/* Music button */}
      <div className="fixed top-4 right-4 z-[8]" style={{ animation: "fadeSlide 1s cubic-bezier(0.23, 1, 0.32, 1) 2s both" }}>
        <MagneticButton onClick={(e) => { e.stopPropagation(); play(); }}
          className="flex items-center gap-2 rounded-2xl border border-primary/40 px-5 py-2.5 font-mono text-sm text-primary backdrop-blur-xl btn-glow"
          style={{ background: "hsl(var(--love-pink) / 0.08)" }}>
          {playing ? (
            <>
              <span className="inline-block w-4 h-4 relative">
                {[0, 1, 2].map(i => (
                  <span key={i} className="absolute bottom-0 w-1 rounded-full bg-primary" style={{
                    left: i * 5 + "px", height: "100%",
                    animation: `breathe ${0.4 + i * 0.15}s ease-in-out infinite ${i * 0.1}s`,
                  }} />
                ))}
              </span>
              Pause Melody
            </>
          ) : "🎵 Play Melody"}
        </MagneticButton>
      </div>

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <div className="relative z-[1] flex flex-col items-center justify-center min-h-screen p-8">
        {/* Typing line */}
        <div className="font-mono text-primary text-sm sm:text-base mb-8 overflow-hidden whitespace-nowrap border-r-2 border-primary"
          style={{ animation: "typing 3.5s steps(38) 1s forwards, blink 0.5s step-end infinite alternate", width: 0 }}>
          console.log("I love you, Rhia ❤️");
        </div>

        {/* Main title */}
        <div data-parallax="-0.12" style={{
          transform: `translate(${mouseOffset.x * -8}px, ${mouseOffset.y * -8}px)`,
          transition: "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
        }}>
          <span className="display-eyebrow block text-center mb-3">A Love Letter In Code</span>
          <h1 className="display-mega text-gradient-love text-center"
            style={{ animation: "floatUp 4s ease-in-out infinite" }}>
            Every Moment With
          </h1>
          <span className="display-mega glow-gold block text-center" style={{ animation: "floatUpSlow 3s ease-in-out infinite 0.5s" }}>
            Rhia
          </span>
          <div className="cinematic-rule mx-auto max-w-[320px] mt-4" />
        </div>

        <p data-parallax="-0.08" className="italic text-lg sm:text-xl mb-12 mt-6 text-center max-w-md" style={{
          color: "hsl(var(--love-pink) / 0.6)",
          opacity: 0,
          animation: "fadeSlide 1.2s cubic-bezier(0.23, 1, 0.32, 1) 4s forwards",
        }}>
          ~ a love letter, written in code, just for you Rhia Henne ~
        </p>

        {/* Anniversary Countdown */}
        <div data-reveal data-parallax="-0.04" className="rounded-3xl border border-primary/20 p-6 sm:p-10 mb-12 text-center backdrop-blur-xl max-w-[540px] w-full glass-card"
          style={{ animation: "countdownPulse 4s ease-in-out infinite" }}>
          <p className="text-primary text-xs font-mono mb-3 tracking-[0.3em] uppercase">💕 Our Anniversary — December 3rd 💕</p>
          <p className="text-muted-foreground text-xs mb-6">Together since 03/12/2025</p>
          <div className="flex justify-center gap-3 sm:gap-4">
            <CountdownDigit value={countdown.days} label="Days" />
            <span className="text-3xl sm:text-5xl text-primary/30 font-thin self-start mt-2 sm:mt-3">:</span>
            <CountdownDigit value={countdown.hours} label="Hours" />
            <span className="text-3xl sm:text-5xl text-primary/30 font-thin self-start mt-2 sm:mt-3">:</span>
            <CountdownDigit value={countdown.minutes} label="Mins" />
            <span className="text-3xl sm:text-5xl text-primary/30 font-thin self-start mt-2 sm:mt-3">:</span>
            <CountdownDigit value={countdown.seconds} label="Secs" />
          </div>
          <p className="text-muted-foreground text-xs mt-6 italic">until our next anniversary ✨</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 sm:gap-4 flex-wrap justify-center mb-12">
          {[
            { label: "💖 Heart Explosion", action: () => { burstHearts(dims.W, dims.H); addLove(8); }, borderColor: "primary", delay: "6s" },
            { label: "✨ Shooting Stars", action: () => { shootingStars(dims.W, dims.H); addLove(5); }, borderColor: "secondary", delay: "6.2s" },
            { label: "💌 Secret Message", action: () => { setSecretOpen(true); addLove(15); }, borderColor: "accent", delay: "6.4s" },
            { label: "🎆 Fireworks", action: () => { doFireworks(dims.W, dims.H); addLove(10); }, borderColor: "love-purple", delay: "6.6s" },
          ].map((btn, i) => (
            <MagneticButton key={i}
              onClick={(e) => { e.stopPropagation(); btn.action(); }}
              className={`border-2 rounded-full px-6 sm:px-8 py-3 font-display text-sm sm:text-base transition-all duration-500 btn-glow
                ${btn.borderColor === "primary" ? "border-primary text-primary hover:bg-primary hover:text-primary-foreground" :
                  btn.borderColor === "secondary" ? "border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground" :
                  btn.borderColor === "accent" ? "border-accent text-accent hover:bg-accent hover:text-accent-foreground" : ""}`}
              style={{
                opacity: 0,
                animation: `fadeSlide 0.8s cubic-bezier(0.23, 1, 0.32, 1) ${btn.delay} forwards`,
                ...(btn.borderColor === "love-purple" ? { borderColor: "hsl(var(--love-purple))", color: "hsl(var(--love-purple))" } : {}),
              }}>
              {btn.label}
            </MagneticButton>
          ))}
        </div>

        {/* ═══ START THE STORY CTA ═══ */}
        <div style={{ opacity: 0, animation: "fadeSlide 1s cubic-bezier(0.23,1,0.32,1) 7s forwards" }}>
          <MagneticButton
            onClick={(e) => {
              e.stopPropagation();
              setIntroPlaying(true);
              burstHearts(dims.W, dims.H);
              shootingStars(dims.W, dims.H);
              // Cinematic sequence: burst → delay → navigate
              setTimeout(() => doFireworks(dims.W, dims.H), 600);
              setTimeout(() => megaBurst(dims.W, dims.H), 1200);
              setTimeout(() => navigate("/timeline"), 2200);
            }}
            className="group relative border-2 border-primary rounded-full px-10 sm:px-14 py-4 sm:py-5 font-display text-lg sm:text-xl text-primary btn-glow overflow-hidden transition-all duration-700 hover:border-primary/80"
            style={{
              background: introPlaying
                ? "linear-gradient(135deg, hsl(var(--love-pink) / 0.3), hsl(var(--love-gold) / 0.2))"
                : undefined,
            }}
          >
            {/* Animated shine sweep */}
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: "linear-gradient(105deg, transparent 40%, hsl(var(--love-gold) / 0.15) 50%, transparent 60%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 2s linear infinite",
              }}
            />
            <span className="relative z-[1] flex items-center gap-3">
              {introPlaying ? (
                <>
                  <span style={{ animation: "pulse-heart 0.6s ease-in-out infinite" }}>💕</span>
                  Starting...
                </>
              ) : (
                <>
                  Start the Story
                  <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">→</span>
                </>
              )}
            </span>
          </MagneticButton>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2" style={{ opacity: 0, animation: "fadeSlide 1s ease 8s forwards" }}>
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 rounded-full bg-primary/60" style={{ animation: "floatUp 2s ease-in-out infinite" }} />
          </div>
        </div>
      </div>

      {/* ═══════════════════ EXPLORE SECTIONS ═══════════════════ */}
      <div className="relative z-[1] px-6 sm:px-8 flex flex-col items-center gap-8 pb-32">
        <h2 data-reveal className="text-gradient-gold text-3xl sm:text-4xl font-bold font-display text-center">
          Explore Our Love Story ✨
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-[800px] w-full">
          {NAV_CARDS.map((card, i) => (
            <Link
              key={card.path}
              to={card.path}
              data-reveal
              data-parallax="0.04"
              style={{ transitionDelay: `${i * 100}ms` }}
              className="tilt-card rounded-2xl p-5 sm:p-6 glass-card text-center group cursor-pointer block"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-4xl block mb-3 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12">
                {card.emoji}
              </span>
              <h3 className="text-foreground/90 font-display font-bold text-sm sm:text-base mb-1">{card.title}</h3>
              <p className="text-muted-foreground text-xs">{card.desc}</p>
            </Link>
          ))}
        </div>

        {/* Final message */}
        <div data-reveal className="text-center max-w-[540px] mt-12">
          <h2 className="text-primary text-4xl sm:text-5xl font-bold font-display mb-6">Rhia, You Mean Everything</h2>
          <p className="text-foreground/75 text-lg leading-relaxed mb-3">
            I made this entire website because I wanted you to see that every moment since we met on Valorant — every joke, every game, every late-night conversation — it all means something because <b className="text-primary">you, Rhia Henne</b>, mean everything.
          </p>
          <p className="text-foreground/75 text-lg">Thank you for being you. 💕</p>
          <span className="text-7xl inline-block mt-6" style={{ animation: "pulse-heart 2s ease-in-out infinite" }}>❤️</span>
        </div>
      </div>

      {/* Love Meter */}
      <div className="fixed bottom-5 right-5 z-[8] text-center" style={{ opacity: 0, animation: "fadeSlide 1s ease 7s forwards" }}>
        <span className="text-xs text-primary font-mono">Love {loveScore}%</span>
        <div className="w-[100px] h-1.5 rounded-full mt-1.5 overflow-hidden" style={{ background: "hsl(var(--love-pink) / 0.1)" }}>
          <div className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: loveScore + "%",
              background: "linear-gradient(90deg, hsl(var(--love-pink)), hsl(var(--love-gold)), hsl(var(--love-purple)))",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s linear infinite",
            }} />
        </div>
      </div>

      {/* Hint */}
      <div className="fixed bottom-5 left-5 z-[8] text-xs font-mono" style={{ color: "hsl(var(--love-pink) / 0.25)", opacity: 0, animation: "fadeSlide 1s ease 8s forwards" }}>
        💖 Click everywhere & hit play!
      </div>

      {/* Secret Modal */}
      {secretOpen && (
        <div className="fixed inset-0 z-[10] flex items-center justify-center p-4"
          onClick={(e) => { e.stopPropagation(); setSecretOpen(false); }}
          style={{ background: "hsl(var(--background) / 0.7)", backdropFilter: "blur(12px)", animation: "fadeSlide 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards" }}>
          <div className="relative rounded-3xl border-2 border-primary/40 p-10 sm:p-14 text-center max-w-lg backdrop-blur-2xl glass-card"
            onClick={e => e.stopPropagation()}
            style={{ animation: eggTriggered ? "shake 0.6s cubic-bezier(0.23, 1, 0.32, 1)" : "fadeSlide 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards" }}>
            <button onClick={() => setSecretOpen(false)} className="absolute top-4 right-6 text-primary text-xl bg-transparent border-none cursor-pointer transition-transform duration-300 hover:scale-125 hover:rotate-90">✕</button>
            {eggTriggered ? (
              <>
                <h2 className="text-gradient-love text-3xl sm:text-4xl font-bold font-display mb-4" style={{ WebkitTextFillColor: "unset" }}>🎉 You Filled My Heart, Rhia! 🎉</h2>
                <p className="text-secondary text-xl font-display mb-4">Achievement Unlocked: 100% Love</p>
                <p className="text-foreground/80">You clicked with so much love that my heart literally overflowed.</p>
                <p className="text-foreground/80 mt-4">Just like in real life... you complete me. 💕</p>
              </>
            ) : (
              <>
                <h2 className="text-gradient-love text-3xl sm:text-4xl font-bold font-display mb-5" style={{ WebkitTextFillColor: "unset" }}>Dear Rhia,</h2>
                <div className="space-y-1 text-foreground/80 text-lg leading-relaxed">
                  <p>Every game we play — whether it's Valorant, Fortnite, DBD, or Roblox —</p>
                  <p>every joke you crack, every time you send me your pics,</p>
                  <p>every time you come back even when your parents restrict you —</p>
                  <p>it all makes me love you even more.</p>
                  <p className="mt-3">You are the best thing Valorant ever gave me. 💕</p>
                </div>
                <p className="text-secondary text-xl font-display mt-5">I love you more than any words could ever express.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
