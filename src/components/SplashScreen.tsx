import { useEffect, useRef, useState, useCallback } from "react";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"drawing" | "text" | "shatter" | "done">("drawing");
  const [textVisible, setTextVisible] = useState(false);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; size: number; color: string }[]>([]);

  const skip = useCallback(() => {
    setPhase("done");
    sessionStorage.setItem("splash_shown", "1");
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (sessionStorage.getItem("splash_shown") ||
        (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
      skip();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const cx = W / 2;
    const cy = H / 2;
    let animId = 0;
    let startTime = performance.now();

    // Heart path points
    function heartX(t: number) {
      return 16 * Math.pow(Math.sin(t), 3);
    }
    function heartY(t: number) {
      return -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    }

    const scale = Math.min(W, H) * 0.012;
    const totalPoints = 200;
    const heartPoints: { x: number; y: number }[] = [];
    for (let i = 0; i <= totalPoints; i++) {
      const t = (i / totalPoints) * Math.PI * 2;
      heartPoints.push({ x: cx + heartX(t) * scale, y: cy + heartY(t) * scale - 20 });
    }

    const drawDuration = 2500;
    const pauseDuration = 800;
    const shatterDuration = 1200;

    function drawFrame(now: number) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = "hsl(240, 20%, 5%)";
      ctx.fillRect(0, 0, W, H);

      if (elapsed < drawDuration) {
        // Phase 1: Draw heart
        const progress = Math.min(1, elapsed / drawDuration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const pointCount = Math.floor(eased * totalPoints);

        // Glow
        ctx.shadowColor = "#ffd93d";
        ctx.shadowBlur = 25;
        ctx.strokeStyle = "#e84393";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (let i = 0; i <= pointCount; i++) {
          const p = heartPoints[i];
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Glowing tip
        if (pointCount > 0) {
          const tip = heartPoints[pointCount];
          const gradient = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 20);
          gradient.addColorStop(0, "rgba(255, 217, 61, 0.8)");
          gradient.addColorStop(1, "rgba(255, 217, 61, 0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(tip.x, tip.y, 20, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (elapsed < drawDuration + pauseDuration) {
        // Phase 2: Full heart + text
        if (!textVisible) setTextVisible(true);
        ctx.shadowColor = "#e84393";
        ctx.shadowBlur = 20;
        ctx.strokeStyle = "#e84393";
        ctx.lineWidth = 3;
        ctx.beginPath();
        heartPoints.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.closePath();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Pulse
        const pulseT = (elapsed - drawDuration) / pauseDuration;
        const pulseScale = 1 + Math.sin(pulseT * Math.PI) * 0.05;
        ctx.save();
        ctx.translate(cx, cy - 20);
        ctx.scale(pulseScale, pulseScale);
        ctx.translate(-cx, -(cy - 20));
        ctx.strokeStyle = "rgba(232, 67, 147, 0.3)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        heartPoints.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      } else if (elapsed < drawDuration + pauseDuration + shatterDuration) {
        // Phase 3: Shatter
        if (phase !== "shatter") {
          setPhase("shatter");
          setTextVisible(false);
          // Create particles from heart outline
          for (let i = 0; i < heartPoints.length; i += 2) {
            const p = heartPoints[i];
            const angle = Math.atan2(p.y - (cy - 20), p.x - cx);
            const speed = 3 + Math.random() * 6;
            particlesRef.current.push({
              x: p.x, y: p.y,
              vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
              vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 4,
              life: 1,
              size: 2 + Math.random() * 4,
              color: Math.random() > 0.5 ? "#e84393" : "#ffd93d",
            });
          }
        }

        const shatterProgress = (elapsed - drawDuration - pauseDuration) / shatterDuration;
        particlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.1;
          p.life = 1 - shatterProgress;
        });

        particlesRef.current.forEach((p) => {
          if (p.life <= 0) return;
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      } else {
        skip();
        return;
      }

      animId = requestAnimationFrame(drawFrame);
    }

    animId = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animId);
  }, [skip, textVisible, phase]);

  if (phase === "done") return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* Text overlay */}
      <div
        className="relative z-10 text-center pointer-events-none"
        style={{
          opacity: textVisible ? 1 : 0,
          transform: textVisible ? "scale(1)" : "scale(0.9)",
          transition: "all 0.6s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        <p className="text-gradient-love text-3xl sm:text-5xl font-display font-bold">
          You &amp; Rhia
        </p>
        <p className="text-muted-foreground text-sm mt-2 tracking-widest">a love story</p>
      </div>
      {/* Skip button */}
      <button
        onClick={skip}
        className="absolute bottom-8 right-8 z-20 text-muted-foreground/40 hover:text-muted-foreground text-xs tracking-widest uppercase transition-colors"
      >
        Skip →
      </button>
    </div>
  );
}
