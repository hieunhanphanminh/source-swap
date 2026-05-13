
import { useGSAP } from "@gsap/react";
import { AdaptiveDpr, Preload, ScrollControls, useProgress, useScroll } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import gsap from "gsap";
import { Suspense, useEffect, useRef } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";

import { usePortalStore, useThemeStore } from "@/stores";

import AwwardsBadge from "./AwwardsBadge";
import Preloader from "./Preloader";
import ProgressLoader from "./ProgressLoader";
import { ScrollHint } from "./ScrollHint";
import ThemeSwitcher from "./ThemeSwitcher";
// import {Perf} from "r3f-perf"

const isEditableScrollTarget = (target: EventTarget | null) => {
  if (typeof HTMLElement === "undefined" || !(target instanceof HTMLElement)) return false;

  return Boolean(
    target.closest('input, textarea, select, button, [contenteditable="true"], [role="slider"]')
  );
};

const ScrollInputBridge = () => {
  const scroll = useScroll();
  const activePortalId = usePortalStore((state) => state.activePortalId);
  const touchY = useRef<number | null>(null);

  useEffect(() => {
    const scrollEl = scroll?.el;
    if (!scrollEl || activePortalId) {
      touchY.current = null;
      return;
    }

    const normalizeWheelDelta = (event: WheelEvent) => {
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 32;
      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * scrollEl.clientHeight;
      return event.deltaY;
    };

    const applyDelta = (delta: number) => {
      const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
      if (maxScroll <= 0 || delta === 0) return false;

      const next = Math.max(0, Math.min(maxScroll, scrollEl.scrollTop + delta));
      if (next === scrollEl.scrollTop) return false;

      scrollEl.scrollTop = next;
      return true;
    };

    const onWheel = (event: WheelEvent) => {
      if (isEditableScrollTarget(event.target)) return;
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;

      if (applyDelta(normalizeWheelDelta(event))) event.preventDefault();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableScrollTarget(event.target)) return;

      const page = scrollEl.clientHeight * 0.85;
      const keyDelta: Record<string, number> = {
        ArrowDown: 64,
        ArrowUp: -64,
        PageDown: page,
        PageUp: -page,
        Home: -scrollEl.scrollTop,
        End: scrollEl.scrollHeight,
        " ": event.shiftKey ? -page : page,
      };

      const delta = keyDelta[event.key];
      if (delta !== undefined && applyDelta(delta)) event.preventDefault();
    };

    const onTouchStart = (event: TouchEvent) => {
      if (isEditableScrollTarget(event.target)) return;
      touchY.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (isEditableScrollTarget(event.target)) return;

      const currentY = event.touches[0]?.clientY ?? null;
      if (touchY.current === null || currentY === null) {
        touchY.current = currentY;
        return;
      }

      const delta = touchY.current - currentY;
      touchY.current = currentY;
      if (applyDelta(delta)) event.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { capture: true, passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { capture: true, passive: true });
    window.addEventListener("touchmove", onTouchMove, { capture: true, passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
    };
  }, [scroll, activePortalId]);

  return null;
};

const CanvasLoader = (props: { children: React.ReactNode }) => {
  const ref= useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundColor = useThemeStore((state) => state.theme.color);
  const { progress } = useProgress();
  const canvasStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0,
    overflow: "hidden",
    ...(!isMobile && {
      inset: '1rem',
      width: 'calc(100% - 2rem)',
      height: 'calc(100% - 2rem)',
    }),
  };

  useGSAP(() => {
    if (progress === 100) {
      gsap.to('.base-canvas', { opacity: 1, duration: 3, delay: 1 });
    }
  }, [progress]);

  useGSAP(() => {
    gsap.to(ref.current, {
      backgroundColor: backgroundColor,
      duration: 1,
    });
    gsap.to(canvasRef.current, {
      backgroundColor: backgroundColor,
      duration: 1,
      ...noiseOverlayStyle,
    });
  }, [backgroundColor]);

  const noiseOverlayStyle = {
    backgroundBlendMode: "soft-light",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E\")",
    backgroundRepeat: "repeat",
    backgroundSize: "100px",
  };

  return (
    <div className="h-[100dvh] wrapper relative">
      <div className="h-[100dvh] relative" ref={ref}>
        <Canvas className="base-canvas"
          shadows={!isMobile}
          style={canvasStyle}
          ref={canvasRef}
          dpr={[1, isMobile ? 1.25 : 1.5]}
          gl={{
            antialias: !isMobile,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
            toneMapping: THREE.NoToneMapping,
            toneMappingExposure: 1,
          }}
          onCreated={({ gl, scene }) => {
            // Tone mapping is handled by the postprocessing ToneMapping pass.
            gl.toneMapping = THREE.NoToneMapping;
            gl.toneMappingExposure = 1;
            // Tinted, transparent fog — keeps distant silhouettes readable.
            scene.fog = new THREE.Fog("#a89099", 28, 95);
          }}
          performance={{ min: 0.5 }}>
          {/* <Perf/> */}
          <Suspense fallback={null}>
            <ambientLight intensity={0.25} color="#e8d8df" />
            <hemisphereLight args={["#d8c4cf", "#4a3a45", 0.3]} />
            <directionalLight
              position={[6, 10, 4]}
              intensity={0.6}
              color="#f1dfe4"
              castShadow={false}
            />

            <ScrollControls
              pages={4}
              damping={0.4}
              maxSpeed={1}
              distance={1}
              style={{ zIndex: 1, touchAction: "pan-y", overscrollBehaviorY: "contain" }}
            >
              <ScrollInputBridge />
              {props.children}
              <Preloader />
            </ScrollControls>

            <EffectComposer multisampling={0} enableNormalPass={false}>
              <Bloom
                intensity={0.35}
                luminanceThreshold={0.85}
                luminanceSmoothing={0.2}
                mipmapBlur
              />
              <ToneMapping
                mode={ToneMappingMode.AGX}
                middleGrey={0.5}
              />
              <Vignette
                offset={0.25}
                darkness={0.55}
                blendFunction={BlendFunction.NORMAL}
              />
            </EffectComposer>

            <Preload all />
          </Suspense>
          <AdaptiveDpr pixelated/>
        </Canvas>
        <ProgressLoader progress={progress} />
      </div>
      <ThemeSwitcher />
      <ScrollHint />
    </div>
  );
};

export default CanvasLoader;