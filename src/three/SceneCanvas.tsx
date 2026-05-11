import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import HeroScene from "./scenes/HeroScene";
import AmbientScene from "./scenes/AmbientScene";
import { useReducedMotion, useIsMobile } from "./useReducedMotion";

interface Props {
  pathname: string;
}

export default function SceneCanvas({ pathname }: Props) {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();

  const variant: "hero" | "gallery" | "timeline" | "dreams" | "reasons" | "letter" =
    pathname === "/" ? "hero"
      : pathname.startsWith("/gallery") ? "gallery"
      : pathname.startsWith("/timeline") ? "timeline"
      : pathname.startsWith("/dreams") ? "dreams"
      : pathname.startsWith("/reasons") ? "reasons"
      : pathname.startsWith("/letter") ? "letter"
      : "hero";

  return (
    <Canvas
      dpr={mobile ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        {variant === "hero" ? (
          <HeroScene reduced={reduced} mobile={mobile} />
        ) : (
          <AmbientScene variant={variant} reduced={reduced} mobile={mobile} />
        )}
        {!mobile && !reduced && (
          <EffectComposer>
            <Bloom intensity={0.7} luminanceThreshold={0.25} luminanceSmoothing={0.6} mipmapBlur />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}
