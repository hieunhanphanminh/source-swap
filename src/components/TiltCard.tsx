/**
 * TiltCard — premium mouse-follow 3D tilt wrapper with glare sheen.
 * Drop-in container for any card to add depth, lighting and glow.
 */
import { useRef, type ReactNode, type CSSProperties } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  intensity?: number; // 0..1
  glow?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function TiltCard({
  children,
  className = "",
  style,
  intensity = 1,
  glow = true,
  onClick,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rx = (-y * 18 * intensity).toFixed(2);
    const ry = (x * 22 * intensity).toFixed(2);
    el.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(22px) scale(1.02)`;
    // Glare angle follows cursor — subtle sheen across the surface.
    const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    el.style.setProperty("--glare-angle", `${angle.toFixed(1)}deg`);
    el.style.setProperty("--glare-opacity", "0.85");
    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(520px circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, hsl(var(--love-pink) / 0.28), transparent 55%)`;
      glowRef.current.style.opacity = "1";
    }
  };

  const onMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(1100px) rotateX(0) rotateY(0) translateZ(0) scale(1)";
    el.style.setProperty("--glare-opacity", "0");
    if (glowRef.current) glowRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={`tilt-card relative ${className}`}
      style={style}
    >
      {glow && (
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500"
          style={{ mixBlendMode: "screen" }}
        />
      )}
      <div style={{ transform: "translateZ(28px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </div>
  );
}
