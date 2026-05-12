import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/three/useReducedMotion";

const HEART_GEO_KEY = Symbol.for("gallery.heart.geometry");
const HALO_TEX_KEY = Symbol.for("gallery.heart.halo");

function getHeartGeometry(): THREE.ExtrudeGeometry {
  const cached = (globalThis as any)[HEART_GEO_KEY] as THREE.ExtrudeGeometry | undefined;
  if (cached) return cached;
  const shape = new THREE.Shape();
  shape.moveTo(0.5, 0.5);
  shape.bezierCurveTo(0.5, 0.5, 0.4, 0, 0, 0);
  shape.bezierCurveTo(-0.6, 0, -0.6, 0.7, -0.6, 0.7);
  shape.bezierCurveTo(-0.6, 1.1, -0.3, 1.54, 0.5, 1.9);
  shape.bezierCurveTo(1.2, 1.54, 1.6, 1.1, 1.6, 0.7);
  shape.bezierCurveTo(1.6, 0.7, 1.6, 0, 1.0, 0);
  shape.bezierCurveTo(0.7, 0, 0.5, 0.5, 0.5, 0.5);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.15,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 3,
    curveSegments: 24,
  });
  geo.center();
  geo.rotateZ(Math.PI);
  (globalThis as any)[HEART_GEO_KEY] = geo;
  return geo;
}

function getHaloTexture(): THREE.CanvasTexture {
  const cached = (globalThis as any)[HALO_TEX_KEY] as THREE.CanvasTexture | undefined;
  if (cached) return cached;
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,180,210,1)");
  g.addColorStop(0.4, "rgba(255,120,170,0.4)");
  g.addColorStop(1, "rgba(255,90,150,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  (globalThis as any)[HALO_TEX_KEY] = tex;
  return tex;
}

const PALETTE = ["#ff5d8f", "#ff9ec7", "#ffb3d1", "#ff79b0", "#ffd1e6", "#ff4d88"];

interface HeartItem {
  pos: [number, number, number];
  scale: number;
  color: string;
  opacity: number;
  spin: number;
  bob: number;
  phase: number;
}

function makeHearts(count: number, centerY: number): HeartItem[] {
  const out: HeartItem[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.3;
    const r = 14 + Math.random() * 8;
    const y = centerY + (Math.random() - 0.5) * 14;
    out.push({
      pos: [Math.cos(a) * r, y, Math.sin(a) * r],
      scale: 0.4 + Math.random() * 0.7,
      color: PALETTE[i % PALETTE.length],
      opacity: 0.4 + Math.random() * 0.35,
      spin: 0.15 + Math.random() * 0.4,
      bob: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return out;
}

const Heart = ({ item }: { item: HeartItem }) => {
  const ref = useRef<THREE.Mesh>(null);
  const reduced = useReducedMotion();
  const geo = getHeartGeometry();

  useFrame((state) => {
    if (!ref.current || reduced) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * item.spin;
    ref.current.position.y = item.pos[1] + Math.sin(t * item.bob + item.phase) * 0.6;
  });

  return (
    <mesh
      ref={ref}
      geometry={geo}
      position={item.pos}
      scale={item.scale}
      frustumCulled={false}
    >
      <meshBasicMaterial
        color={item.color}
        transparent
        opacity={item.opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
};

const Halo = ({
  pos,
  size,
  color,
}: {
  pos: [number, number, number];
  size: number;
  color: string;
}) => {
  const tex = getHaloTexture();
  return (
    <sprite position={pos} scale={[size, size, 1]}>
      <spriteMaterial
        map={tex}
        color={color}
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  );
};

export default function FloatingHearts({ centerY = -39 }: { centerY?: number }) {
  const hearts = useMemo(() => makeHearts(18, centerY), [centerY]);
  const halos = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      const r = 16 + (i % 3) * 3;
      return {
        pos: [Math.cos(a) * r, centerY + (Math.random() - 0.5) * 10, Math.sin(a) * r] as [
          number,
          number,
          number,
        ],
        size: 6 + Math.random() * 4,
        color: PALETTE[i % PALETTE.length],
      };
    });
  }, [centerY]);

  return (
    <group>
      {halos.map((h, i) => (
        <Halo key={`halo-${i}`} pos={h.pos} size={h.size} color={h.color} />
      ))}
      {hearts.map((h, i) => (
        <Heart key={`heart-${i}`} item={h} />
      ))}
    </group>
  );
}
