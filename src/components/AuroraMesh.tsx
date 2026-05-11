import { useReducedMotion } from "@/three/useReducedMotion";

/**
 * AuroraMesh — slow-drifting blurred mesh gradient placed behind content
 * (above the WebGL canvas, below UI). Adds cinematic ambient color motion.
 * Hidden entirely when the user prefers reduced motion.
 */
export default function AuroraMesh() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <div
      aria-hidden
      className="aurora-mesh"
      style={{
        position: "fixed",
        inset: "-20%",
        zIndex: 0,
        pointerEvents: "none",
        filter: "blur(80px) saturate(140%)",
        opacity: 0.55,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(38% 32% at 18% 22%, hsl(340 80% 55% / 0.55), transparent 70%)," +
            "radial-gradient(34% 30% at 82% 28%, hsl(270 85% 60% / 0.45), transparent 70%)," +
            "radial-gradient(40% 36% at 30% 82%, hsl(45 100% 58% / 0.30), transparent 70%)," +
            "radial-gradient(36% 34% at 78% 78%, hsl(200 85% 60% / 0.32), transparent 70%)",
          animation: "aurora 22s ease-in-out infinite",
          backgroundSize: "200% 200%",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
