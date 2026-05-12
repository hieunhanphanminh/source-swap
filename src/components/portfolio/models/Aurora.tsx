import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Aurora — drifting textured planes used as a romantic substitute for the
 * cloud volumes elsewhere in the scene. Multiple layered planes with additive
 * blending give a soft, glowing aurora veil across the gallery backdrop.
 */
const LAYERS = [
  { pos: [-1, 3, -8] as [number, number, number], scale: [22, 10, 1] as [number, number, number], color: "#ff9ec7", opacity: 0.55, speed: 0.05 },
  { pos: [2, 1.5, -10] as [number, number, number], scale: [26, 9, 1] as [number, number, number], color: "#c98bff", opacity: 0.45, speed: 0.08 },
  { pos: [-3, -2, -6] as [number, number, number], scale: [18, 7, 1] as [number, number, number], color: "#ff5d8f", opacity: 0.35, speed: 0.04 },
  { pos: [4, -4, -12] as [number, number, number], scale: [30, 12, 1] as [number, number, number], color: "#ffd1e6", opacity: 0.4, speed: 0.06 },
];

const AuroraPlane = ({
  texture,
  pos,
  scale,
  color,
  opacity,
  speed,
}: {
  texture: THREE.Texture;
  pos: [number, number, number];
  scale: [number, number, number];
  color: string;
  opacity: number;
  speed: number;
}) => {
  const ref = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => {
    const t = texture.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.needsUpdate = true;
    return t;
  }, [texture]);

  useFrame((_state, delta) => {
    tex.offset.x += delta * speed;
    tex.offset.y += delta * speed * 0.3;
    if (ref.current) {
      ref.current.position.y = pos[1] + Math.sin(performance.now() * 0.0002 * speed * 10) * 0.3;
    }
  });

  return (
    <mesh ref={ref} position={pos} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={tex}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const Aurora = () => {
  const texture = useLoader(THREE.TextureLoader, "/textures/aurora_texture.png");
  return (
    <group position={[0, 0, 0]} frustumCulled={false}>
      {LAYERS.map((l, i) => (
        <AuroraPlane key={i} texture={texture} {...l} />
      ))}
    </group>
  );
};

export default Aurora;
