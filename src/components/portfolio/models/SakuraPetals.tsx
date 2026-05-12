import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface Petal {
  basePos: THREE.Vector3;
  size: number;
  swayAmp: number;
  swayFreq: number;
  fallSpeed: number;
  spinAxis: THREE.Vector3;
  spinSpeed: number;
  color: string;
  opacity: number;
}

const PETAL_COLORS = ["#ffd1e6", "#ffb3d1", "#ff9ec7", "#ffc9b8", "#e9c8ff"];

// A small heart-ish petal shape (rounded teardrop) — light + cheap.
const petalShape = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, 0.5);
  s.bezierCurveTo(0.55, 0.55, 0.55, -0.15, 0, -0.5);
  s.bezierCurveTo(-0.55, -0.15, -0.55, 0.55, 0, 0.5);
  return s;
})();

const sharedGeo = new THREE.ShapeGeometry(petalShape);

interface Props {
  count?: number;
  /** Y center where petals drift around. */
  centerY?: number;
  /** Half-extent of the volume the petals fill. */
  radius?: number;
  /** Vertical extent above/below centerY. */
  height?: number;
}

const SakuraPetals = ({
  count = 60,
  centerY = 0,
  radius = 18,
  height = 22,
}: Props) => {
  const groupRef = useRef<THREE.Group>(null);

  const petals = useMemo<Petal[]>(() => {
    return Array.from({ length: count }, () => ({
      basePos: new THREE.Vector3(
        (Math.random() - 0.5) * radius * 2,
        (Math.random() - 0.5) * height,
        (Math.random() - 0.5) * radius * 2,
      ),
      size: 0.12 + Math.random() * 0.22,
      swayAmp: 0.4 + Math.random() * 0.9,
      swayFreq: 0.3 + Math.random() * 0.7,
      fallSpeed: 0.25 + Math.random() * 0.6,
      spinAxis: new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5,
      ).normalize(),
      spinSpeed: 0.3 + Math.random() * 0.9,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      opacity: 0.55 + Math.random() * 0.35,
    }));
  }, [count, radius, height]);

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.children.forEach((child, i) => {
      const p = petals[i];
      if (!p) return;
      // Falling, looping back to top.
      const y =
        p.basePos.y - ((t * p.fallSpeed) % height) + height / 2;
      const x = p.basePos.x + Math.sin(t * p.swayFreq + i) * p.swayAmp;
      const z = p.basePos.z + Math.cos(t * p.swayFreq * 0.7 + i) * p.swayAmp * 0.5;
      child.position.set(x, centerY + y, z);
      child.rotateOnAxis(p.spinAxis, p.spinSpeed * 0.01);
    });
  });

  return (
    <group ref={groupRef}>
      {petals.map((p, i) => (
        <mesh key={i} geometry={sharedGeo} scale={p.size}>
          <meshBasicMaterial
            color={p.color}
            transparent
            opacity={p.opacity}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

export default SakuraPetals;
