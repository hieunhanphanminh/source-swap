import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number; y: number; s: number; speed: number; opacity: number;
  dx: number; dy: number; type: "heart" | "star" | "circle";
  color: string; gravity: number; decay: number;
  rotation: number; rotSpeed: number;
  trail?: { x: number; y: number; opacity: number }[];
}

const MAX_PARTICLES = 300;
const MAX_AMBIENT = 8;

function createParticle(W: number, H: number, x?: number, y?: number, opts: Partial<Particle> = {}): Particle {
  return {
    x: x ?? Math.random() * W,
    y: y ?? H + 20,
    s: opts.s ?? (Math.random() * 10 + 4),
    speed: opts.speed ?? (Math.random() * 1.5 + 0.5),
    opacity: 1,
    dx: opts.dx ?? (Math.random() - 0.5) * 1.5,
    dy: opts.dy ?? 0,
    type: opts.type ?? "heart",
    color: opts.color ?? `hsl(${340 + Math.random() * 30},${70 + Math.random() * 30}%,${55 + Math.random() * 20}%)`,
    gravity: opts.gravity ?? 0,
    decay: opts.decay ?? 0.003,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.05,
    trail: opts.type === "star" ? [] : undefined,
  };
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  // Draw trail for stars (skip glow on trails for perf)
  if (p.trail && p.trail.length > 1) {
    ctx.save();
    ctx.strokeStyle = p.color;
    ctx.lineWidth = p.s * 0.3;
    ctx.lineCap = "round";
    for (let i = 1; i < p.trail.length; i++) {
      ctx.globalAlpha = p.trail[i].opacity * 0.3;
      ctx.beginPath();
      ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
      ctx.lineTo(p.trail[i].x, p.trail[i].y);
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);

  // Only add glow on larger particles to reduce overdraw
  if (p.s > 5) {
    ctx.shadowColor = p.color;
    ctx.shadowBlur = p.s;
  }

  if (p.type === "heart") {
    ctx.beginPath();
    const s = p.s;
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-s / 2, -s / 2, -s, s / 3, 0, s);
    ctx.bezierCurveTo(s, s / 3, s / 2, -s / 2, 0, 0);
    ctx.fill();
  } else if (p.type === "star") {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(Math.cos((18 + 72 * i) * Math.PI / 180) * p.s, Math.sin((18 + 72 * i) * Math.PI / 180) * p.s);
      ctx.lineTo(Math.cos((54 + 72 * i) * Math.PI / 180) * p.s * 0.4, Math.sin((54 + 72 * i) * Math.PI / 180) * p.s * 0.4);
    }
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, p.s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function updateParticle(p: Particle, H: number): boolean {
  if (p.trail) {
    p.trail.push({ x: p.x, y: p.y, opacity: p.opacity });
    if (p.trail.length > 6) p.trail.shift();
    for (const t of p.trail) t.opacity *= 0.9;
  }

  p.y -= p.speed;
  p.y += p.dy;
  p.dy += p.gravity;
  p.x += p.dx;
  p.dx *= 0.995;
  p.opacity -= p.decay;
  p.rotation += p.rotSpeed;
  if (p.opacity < 0.3) p.s *= 0.98;
  return p.opacity > 0 && p.y > -50 && p.y < H + 50;
}

export function useParticles() {
  const particlesRef = useRef<Particle[]>([]);

  const burstHearts = useCallback((W: number, H: number) => {
    const count = Math.min(60, MAX_PARTICLES - particlesRef.current.length);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, sp = Math.random() * 7 + 2;
      particlesRef.current.push(createParticle(W, H, W / 2, H / 2, {
        s: Math.random() * 16 + 5, dx: Math.cos(a) * sp, dy: -Math.abs(Math.sin(a) * sp),
        gravity: 0.06, decay: 0.007, type: "heart",
        color: `hsl(${330 + Math.random() * 40},${70 + Math.random() * 30}%,${55 + Math.random() * 25}%)`,
      }));
    }
  }, []);

  const shootingStars = useCallback((W: number, H: number) => {
    for (let i = 0; i < 25; i++) {
      setTimeout(() => {
        if (particlesRef.current.length < MAX_PARTICLES) {
          particlesRef.current.push(createParticle(W, H, Math.random() * W, -10, {
            s: Math.random() * 5 + 3, dx: (Math.random() - 0.5) * 3,
            speed: -(Math.random() * 4 + 3), dy: Math.random() * 4 + 3,
            gravity: 0, decay: 0.012, type: "star",
            color: `hsl(${35 + Math.random() * 25},100%,${65 + Math.random() * 25}%)`,
          }));
        }
      }, i * 60);
    }
  }, []);

  const doFireworks = useCallback((W: number, H: number) => {
    const cols = ["#ff6b9d", "#ffd93d", "#6bffb8", "#b06bff", "#ff9f43", "#54a0ff", "#ff4757"];
    for (let f = 0; f < 5; f++) {
      const fx = W * 0.15 + Math.random() * W * 0.7;
      const fy = H * 0.15 + Math.random() * H * 0.5;
      const col = cols[Math.floor(Math.random() * cols.length)];
      setTimeout(() => {
        const count = Math.min(30, MAX_PARTICLES - particlesRef.current.length);
        for (let i = 0; i < count; i++) {
          const a = Math.random() * Math.PI * 2, sp = Math.random() * 6 + 1;
          particlesRef.current.push(createParticle(W, H, fx, fy, {
            s: Math.random() * 4 + 2, dx: Math.cos(a) * sp, dy: Math.sin(a) * sp - 2,
            gravity: 0.04, decay: 0.014, type: "circle", color: col,
          }));
        }
      }, f * 300);
    }
  }, []);

  const megaBurst = useCallback((W: number, H: number) => {
    const count = Math.min(120, MAX_PARTICLES - particlesRef.current.length);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, sp = Math.random() * 10 + 2;
      particlesRef.current.push(createParticle(W, H, W / 2, H / 2, {
        s: Math.random() * 14 + 4, dx: Math.cos(a) * sp, dy: Math.sin(a) * sp - 3,
        gravity: 0.04, decay: 0.006,
        type: (["heart", "star", "circle"] as const)[Math.floor(Math.random() * 3)],
        color: `hsl(${Math.random() * 360},85%,65%)`,
      }));
    }
  }, []);

  const clickBurst = useCallback((x: number, y: number, _W: number, H: number) => {
    if (particlesRef.current.length > MAX_PARTICLES - 6) return;
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2, sp = Math.random() * 3 + 1;
      particlesRef.current.push(createParticle(window.innerWidth, H, x + Math.random() * 20 - 10, y + Math.random() * 20 - 10, {
        s: Math.random() * 10 + 4, dx: Math.cos(a) * sp, dy: -Math.abs(Math.sin(a) * sp),
        decay: 0.014, speed: Math.random() * 2 + 1, type: "heart",
        color: `hsl(${330 + Math.random() * 50},80%,${60 + Math.random() * 20}%)`,
      }));
    }
  }, []);

  return { particlesRef, burstHearts, shootingStars, doFireworks, megaBurst, clickBurst };
}

export default function ParticleCanvas({ particlesRef }: { particlesRef: React.MutableRefObject<Particle[]> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d", { alpha: true })!;
    let W = c.width = window.innerWidth;
    let H = c.height = window.innerHeight;
    let isVisible = true;

    const onResize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    window.addEventListener("resize", onResize);

    // Pause when tab hidden
    const onVis = () => { isVisible = !document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    let ambientCount = 0;
    const ambientInterval = setInterval(() => {
      if (!isVisible) return;
      if (Math.random() < 0.1 && particlesRef.current && ambientCount < MAX_AMBIENT) {
        ambientCount++;
        const p = createParticle(W, H, undefined, undefined, {
          s: Math.random() * 7 + 3,
          speed: Math.random() * 0.8 + 0.3,
          decay: 0.002,
        });
        particlesRef.current.push(p);
      }
    }, 200);

    let raf: number;
    const loop = () => {
      if (!isVisible) {
        raf = requestAnimationFrame(loop);
        return;
      }

      // Transparent clear so the WebGL backdrop shines through.
      ctx.clearRect(0, 0, W, H);

      if (particlesRef.current) {
        // Hard cap
        if (particlesRef.current.length > MAX_PARTICLES) {
          particlesRef.current.splice(0, particlesRef.current.length - MAX_PARTICLES);
        }

        ambientCount = 0;
        particlesRef.current = particlesRef.current.filter(p => {
          drawParticle(ctx, p);
          const alive = updateParticle(p, H);
          if (alive && p.decay <= 0.003) ambientCount++;
          return alive;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      cancelAnimationFrame(raf);
      clearInterval(ambientInterval);
    };
  }, [particlesRef]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}
