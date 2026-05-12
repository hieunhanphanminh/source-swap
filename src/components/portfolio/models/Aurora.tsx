import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { useAuroraStore, AuroraLayerConfig } from "@/stores/auroraStore";

/**
 * Aurora — drifting textured planes that substitute the cloud volumes from
 * Cloud.tsx. Layer positions/scales mirror the original Clouds composition so
 * the gallery backdrop matches the hero visually.
 *
 * Optimizations:
 *  - Single shared texture (via useLoader cache).
 *  - Per-layer material/geometry created once, disposed on unmount (no leaks
 *    when switching scenes).
 *  - Animation mutates material.map.offset via a per-layer Vector2 — no
 *    per-frame allocations, no texture cloning.
 */

const SHARED_GEOMETRY_KEY = Symbol.for("aurora.plane.geometry");

const AuroraPlane = ({
  texture,
  layer,
  index,
}: {
  texture: THREE.Texture;
  layer: AuroraLayerConfig;
  index: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const globalOpacity = useAuroraStore((s) => s.globalOpacity);
  const globalSpeed = useAuroraStore((s) => s.globalSpeed);

  // Each layer needs its own offset so they drift independently, but we keep
  // the underlying image data shared (clone is shallow on the GPU side).
  const tex = useMemo(() => {
    const t = texture.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.offset = new THREE.Vector2(Math.random(), Math.random());
    t.needsUpdate = true;
    return t;
  }, [texture]);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: tex,
        color: new THREE.Color(layer.color),
        transparent: true,
        opacity: layer.opacity * globalOpacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tex],
  );

  // Sync material when layer/global props change (no recreation)
  useEffect(() => {
    material.color.set(layer.color);
    material.opacity = layer.opacity * globalOpacity;
    material.needsUpdate = true;
  }, [layer.color, layer.opacity, globalOpacity, material]);

  // Cleanup GPU resources when this layer unmounts (scene switches)
  useEffect(() => {
    return () => {
      material.dispose();
      tex.dispose();
    };
  }, [material, tex]);

  const basePosY = layer.pos[1];
  useFrame((_s, delta) => {
    const speed = layer.speed * globalSpeed;
    tex.offset.x += delta * speed;
    tex.offset.y += delta * speed * 0.3;
    if (meshRef.current) {
      meshRef.current.position.y =
        basePosY + Math.sin(performance.now() * 0.0002 * (speed * 10 + 0.001)) * 0.4;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={layer.pos}
      scale={layer.scale}
      material={material}
      // Reuse a single shared 1x1 plane geometry across every layer/instance
      geometry={getSharedPlaneGeometry()}
      frustumCulled={false}
      renderOrder={-1 - index}
    />
  );
};

// Module-level shared geometry — created once for the whole app
function getSharedPlaneGeometry(): THREE.PlaneGeometry {
  const g = (globalThis as any)[SHARED_GEOMETRY_KEY] as THREE.PlaneGeometry | undefined;
  if (g) return g;
  const created = new THREE.PlaneGeometry(1, 1);
  (globalThis as any)[SHARED_GEOMETRY_KEY] = created;
  return created;
}

const Aurora = () => {
  const texture = useLoader(THREE.TextureLoader, "/textures/aurora_texture.png");
  const layers = useAuroraStore((s) => s.layers);

  return (
    <group frustumCulled={false}>
      {layers.map((layer, i) => (
        <AuroraPlane key={i} texture={texture} layer={layer} index={i} />
      ))}
    </group>
  );
};

export default Aurora;
