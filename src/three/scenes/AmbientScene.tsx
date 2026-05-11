import { Sparkles, Stars, Float } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useScrollProgressRef } from "../useScrollProgress";

type Variant = "gallery" | "timeline" | "dreams" | "reasons" | "letter";

const PALETTE: Record<Variant, { a: string; b: string; orbs: number; sparkleColor: string }> = {
  gallery:  { a: "#ff5f9e", b: "#a78bfa", orbs: 14, sparkleColor: "#ffd6e8" },
  timeline: { a: "#ffd166", b: "#ff5f9e", orbs: 10, sparkleColor: "#ffe9b8" },
  dreams:   { a: "#7dd3fc", b: "#a78bfa", orbs: 18, sparkleColor: "#cfe7ff" },
  reasons:  { a: "#ff5f9e", b: "#ffd166", orbs: 12, sparkleColor: "#ffd6e8" },
  letter:   { a: "#ffd166", b: "#ff8fab", orbs: 8,  sparkleColor: "#ffe1bf" },
};

function Orbs({ count, color }: { count: number; color: string }) {
  const positions = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        p: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, -2 - Math.random() * 8] as [number, number, number],
        s: 0.3 + Math.random() * 0.7,
        speed: 0.6 + Math.random() * 1.2,
      })),
    [count],
  );
  return (
    <>
      {positions.map((o, i) => (
        <Float key={i} speed={o.speed} rotationIntensity={0.6} floatIntensity={1.4}>
          <mesh position={o.p}>
            <sphereGeometry args={[o.s, 32, 32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.8}
              roughness={0.3}
              metalness={0.1}
              transparent
              opacity={0.7}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

export default function AmbientScene({
  variant,
  reduced = false,
  mobile = false,
}: {
  variant: Variant;
  reduced?: boolean;
  mobile?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const { camera, pointer } = useThree();
  const cfg = PALETTE[variant];
  const scroll = useScrollProgressRef();

  useFrame((state) => {
    if (group.current && !reduced) {
      group.current.rotation.y = state.clock.elapsedTime * 0.05 + scroll.current * 0.6;
      group.current.position.z = -scroll.current * 4;
    }
    if (!reduced) {
      const targetZ = 5 - scroll.current * 2.5;
      camera.position.x += (pointer.x * 0.5 - camera.position.x) * 0.03;
      camera.position.y += (pointer.y * 0.3 - scroll.current * 0.6 - camera.position.y) * 0.03;
      camera.position.z += (targetZ - camera.position.z) * 0.04;
      camera.lookAt(0, 0, 0);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 3, 4]} intensity={2.5} color={cfg.a} />
      <pointLight position={[-5, -2, 3]} intensity={2} color={cfg.b} />
      <fog attach="fog" args={["#0a0612", 6, 22]} />
      <group ref={group}>
        <Orbs count={mobile ? Math.ceil(cfg.orbs / 2) : cfg.orbs} color={cfg.a} />
      </group>
      <Sparkles count={mobile ? 40 : 100} scale={[14, 8, 8]} size={2.5} speed={0.25} color={cfg.sparkleColor} />
      <Stars radius={50} depth={40} count={mobile ? 600 : 1800} factor={3} fade speed={0.3} />
    </>
  );
}
