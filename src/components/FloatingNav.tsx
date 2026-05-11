import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "@/lib/router-compat";

const NAV_ITEMS = [
  { path: "/", label: "Home", emoji: "💖" },
  { path: "/timeline", label: "Timeline", emoji: "📅" },
  { path: "/gallery", label: "Gallery", emoji: "📸" },
  { path: "/reasons", label: "Reasons", emoji: "💛" },
  { path: "/dreams", label: "Dreams", emoji: "✨" },
  { path: "/letter", label: "Letter", emoji: "💌" },
];

/**
 * Premium cinematic floating dock — glassmorphism, scroll-aware visibility,
 * hover glow, animated active indicator with shared layout transition.
 */
export default function FloatingNav() {
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y < 80 || y < lastY.current);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed bottom-6 left-1/2 z-[60] flex items-center gap-1 sm:gap-2 px-2.5 py-2 rounded-full floating-dock transition-[transform,opacity] duration-700"
      style={{
        transform: `translateX(-50%) translateY(${visible ? 0 : 140}px) translateZ(60px)`,
        opacity: visible ? 1 : 0,
      }}
      onMouseLeave={() => setHovered(null)}
    >
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.path;
        const isHovered = hovered === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onMouseEnter={() => setHovered(item.path)}
            className={`relative flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-display transition-colors duration-500 ${
              active
                ? "text-primary"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            {/* Active glow halo */}
            {active && (
              <span
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, hsl(var(--love-pink) / 0.28), hsl(var(--love-purple) / 0.10) 60%, transparent 70%)",
                  animation: "breathe 3s ease-in-out infinite",
                }}
              />
            )}
            {/* Hover glow */}
            {isHovered && !active && (
              <span
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, hsl(var(--love-gold) / 0.18), transparent 70%)",
                  transition: "opacity 0.3s",
                }}
              />
            )}
            <span
              className="relative z-10 text-base sm:text-lg transition-transform duration-500 will-change-transform"
              style={{
                transform: isHovered || active ? "scale(1.25) translateY(-2px)" : "scale(1)",
                filter: active ? "drop-shadow(0 0 10px hsl(var(--love-pink) / 0.6))" : undefined,
              }}
            >
              {item.emoji}
            </span>
            <span className="relative z-10 hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
