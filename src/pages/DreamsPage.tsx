import { useState, useEffect, useRef } from "react";
import ParticleCanvas, { useParticles } from "@/components/ParticleCanvas";
import TiltCard from "@/components/TiltCard";

const DREAMS = [
  { emoji: "🇹🇷", title: "Visit Turkey together", description: "Explore your roots, eat amazing food, and make memories in Istanbul", anim: "float" },
  { emoji: "🇻🇳", title: "Visit Vietnam together", description: "The other half of your beautiful heritage — street food, lanterns, and adventures", anim: "float" },
  { emoji: "🎮", title: "Win a Valorant tournament", description: "Sage and her duo, dominating the competition together", anim: "wiggle" },
  { emoji: "🌅", title: "Watch a sunset on a beach", description: "Just you and me, waves crashing, no screens — just us", anim: "float" },
  { emoji: "🏠", title: "Build our own place", description: "A home filled with love, gaming setups, and cozy movie nights", anim: "bob" },
  { emoji: "🐱", title: "Get a pet together", description: "A little fur baby to complete our family", anim: "wiggle" },
  { emoji: "🎵", title: "Go to a concert together", description: "Singing our hearts out, living in the moment", anim: "bob" },
  { emoji: "📸", title: "Have a proper photoshoot", description: "Because the world deserves to see how beautiful you are", anim: "wiggle" },
  { emoji: "🌌", title: "Stargaze somewhere remote", description: "Away from the city lights, just the stars and each other", anim: "float" },
  { emoji: "🎄", title: "Spend Christmas together", description: "Matching pyjamas, hot chocolate, and opening gifts by the tree", anim: "wiggle" },
  { emoji: "🍳", title: "Cook a meal together", description: "Messy kitchen, great vibes, and food made with love", anim: "bob" },
  { emoji: "🚗", title: "Take a spontaneous road trip", description: "No plan, just music and each other — see where the road takes us", anim: "wiggle" },
  { emoji: "🎢", title: "Go to a theme park together", description: "Roller coasters, cotton candy, and holding hands on the ferris wheel", anim: "bob" },
  { emoji: "✈️", title: "Travel somewhere new every year", description: "New country, new memories — building our adventure map", anim: "float" },
  { emoji: "🛁", title: "Have a spa day together", description: "Face masks, candles, and total relaxation side by side", anim: "bob" },
  { emoji: "📖", title: "Write our love story in a journal", description: "Every milestone documented so we can read it when we're old", anim: "wiggle" },
  { emoji: "🏕️", title: "Go camping under the stars", description: "A tent, a campfire, s'mores, and endless conversations", anim: "float" },
  { emoji: "💃", title: "Learn to dance together", description: "Stepping on each other's toes and laughing the whole time", anim: "wiggle" },
  { emoji: "🎬", title: "Have a movie marathon weekend", description: "Blanket fort, snacks, and zero responsibilities", anim: "bob" },
  // ✨ More romantic couple-y additions ✨
  { emoji: "💌", title: "Write each other handwritten letters", description: "Sealed, kept, and re-read on the days we miss each other most", anim: "float" },
  { emoji: "🌧️", title: "Kiss in the rain (cliché but mandatory)", description: "Soaked, laughing, and not caring about a single thing", anim: "bob" },
  { emoji: "🎡", title: "Slow dance with no music", description: "In the kitchen, in pajamas, just because", anim: "wiggle" },
  { emoji: "🥐", title: "Lazy Sunday breakfast in bed", description: "Croissants, coffee, your messy hair, my favorite view", anim: "bob" },
  { emoji: "🌻", title: "Plant something and watch it grow", description: "A little plant, a little metaphor for us", anim: "float" },
  { emoji: "🎨", title: "Paint each other's portraits (badly)", description: "Wine, brushes, terrible art, perfect night", anim: "wiggle" },
  { emoji: "🚲", title: "Bike ride at golden hour", description: "Wind in your hair, my hand reaching for yours at every red light", anim: "bob" },
  { emoji: "🍷", title: "A picnic on a hill somewhere", description: "Wine, grapes, a blanket, and zero phone signal", anim: "float" },
  { emoji: "🪩", title: "Dance until the sun comes up", description: "One night where we don't check the time once", anim: "wiggle" },
  { emoji: "🛏️", title: "Stay in bed all day, on purpose", description: "Snacks, shows, and absolutely no plans to move", anim: "bob" },
  { emoji: "💍", title: "Forever and always", description: "The biggest dream of all — spending every day with you", anim: "wiggle" },
];

function DreamItem({
  dream,
  index,
}: {
  dream: (typeof DREAMS)[0];
  index: number;
}) {
  const [checked, setChecked] = useState(false);
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
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)",
        transition: `all 0.7s cubic-bezier(0.23,1,0.32,1) ${index * 0.08}s`,
        filter: visible ? "blur(0px)" : "blur(3px)",
      }}
    >
    <TiltCard
      intensity={0.5}
      onClick={() => setChecked(!checked)}
      className={`rounded-2xl p-5 sm:p-6 glass-card cursor-pointer transition-all duration-700 group ${
        checked ? "border-accent/40 bg-accent/5" : "hover:-translate-y-1 hover:border-primary/30"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-500 ${
            checked ? "border-accent bg-accent/20" : "border-primary/30"
          }`}
        >
          {checked && (
            <span
              className="text-accent text-sm"
              style={{ animation: "fadeSlide 0.3s cubic-bezier(0.23,1,0.32,1) forwards" }}
            >
              ✓
            </span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-2xl inline-block transition-transform duration-500 group-hover:scale-125"
              style={{
                animation:
                  dream.anim === "wiggle"
                    ? `dreamWiggle 2.4s ease-in-out infinite ${(index % 5) * 0.15}s`
                    : dream.anim === "bob"
                    ? `dreamBob 3s ease-in-out infinite ${(index % 5) * 0.2}s`
                    : `dreamFloat 4s ease-in-out infinite ${(index % 5) * 0.25}s`,
                transformOrigin: "center bottom",
                display: "inline-block",
              }}
            >
              {dream.emoji}
            </span>
            <h3
              className={`text-base sm:text-lg font-display font-bold transition-colors duration-500 ${
                checked ? "text-accent" : "text-foreground/90"
              }`}
            >
              {dream.title}
            </h3>
          </div>
          <p className="text-foreground/50 text-sm leading-relaxed">{dream.description}</p>
          {checked && (
            <span
              className="text-xs text-accent/60 font-mono mt-2 inline-block"
              style={{ animation: "fadeSlide 0.4s cubic-bezier(0.23,1,0.32,1) forwards" }}
            >
              dreaming together ✨
            </span>
          )}
        </div>
      </div>
    </TiltCard>
    </div>
  );
}

export default function DreamsPage() {
  const { particlesRef } = useParticles();

  return (
    <div className="min-h-screen relative pb-32">
      <ParticleCanvas particlesRef={particlesRef} />

      {/* Floating parallax elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, hsl(var(--love-green)), transparent 70%)",
            top: "20%",
            right: "10%",
            animation: "morphBg 20s ease-in-out infinite, breathe 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full opacity-[0.04]"
          style={{
            background: "radial-gradient(circle, hsl(var(--love-gold)), transparent 70%)",
            bottom: "15%",
            left: "5%",
            animation: "morphBg 25s ease-in-out infinite reverse, breathe 10s ease-in-out infinite 3s",
          }}
        />
      </div>

      <div className="relative z-[1] max-w-[700px] mx-auto px-6 pt-24 sm:pt-32">
        <div className="text-center mb-12">
          <span data-parallax="-0.05" className="display-eyebrow inline-block mb-4">Adventures Yet To Come</span>
          <h1
            data-reveal
            data-parallax="-0.08"
            className="display-mega mb-5"
            style={{
              background: "linear-gradient(135deg, hsl(var(--love-green)), hsl(var(--love-gold)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "fadeSlide 1s cubic-bezier(0.23,1,0.32,1) forwards",
            }}
          >
            Our Bucket List
          </h1>
          <div className="cinematic-rule mx-auto max-w-[280px] mb-5" />
          <p
            className="text-muted-foreground text-sm sm:text-base italic"
            style={{ opacity: 0, animation: "fadeSlide 1s cubic-bezier(0.23,1,0.32,1) 0.3s forwards" }}
          >
            Dreams we'll make real, one by one
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {DREAMS.map((d, i) => (
            <DreamItem key={i} dream={d} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
