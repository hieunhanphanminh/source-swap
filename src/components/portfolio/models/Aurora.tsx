import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAuroraStore, AuroraLayerConfig } from "@/stores/auroraStore";

/**
 * Aurora — drifting textured planes that substitute the cloud volumes from
 * Cloud.tsx. Layer positions/scales mirror the original Clouds composition so
 * the gallery backdrop matches the hero visually.
 *
 * Loads the texture imperatively (no Suspense) so a slow/failed image never
 * suspends an ancestor scene. On error we fall back to a soft radial gradient
 * generated on a CanvasTexture so layers still render gracefully.
 */

const SHARED_GEOMETRY_KEY = Symbol.for("aurora.plane.geometry");
const SHARED_TEXTURE_KEY = Symbol.for("aurora.shared.texture");
const SHARED_FALLBACK_KEY = Symbol.for("aurora.fallback.texture");

function getSharedPlaneGeometry(): THREE.PlaneGeometry {
  const g = (globalThis as any)[SHARED_GEOMETRY_KEY] as THREE.PlaneGeometry | undefined;
  if (g) return g;
  const created = new THREE.PlaneGeometry(1, 1);
  (globalThis as any)[SHARED_GEOMETRY_KEY] = created;
  return created;
}

function buildFallbackTexture(): THREE.Texture {
  const cached = (globalThis as any)[SHARED_FALLBACK_KEY] as THREE.Texture | undefined;
  if (cached) return cached;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  (globalThis as any)[SHARED_FALLBACK_KEY] = tex;
  return tex;
}

function loadSharedTexture(): Promise<THREE.Texture> {
  const cached = (globalThis as any)[SHARED_TEXTURE_KEY] as Promise<THREE.Texture> | undefined;
  if (cached) return cached;
  const p = new Promise<THREE.Texture>((resolve) => {
    new THREE.TextureLoader().load(
      "/textures/aurora_texture.png",
      (tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        resolve(tex);
      },
      undefined,
      () => resolve(buildFallbackTexture()),
    );
  });
  (globalThis as any)[SHARED_TEXTURE_KEY] = p;
  return p;
}

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

  // Per-layer texture clone so each layer can drift independently. Image data
  // stays shared on the GPU.
  const tex = useMemo(() => {
    const t = texture.clone();
    t.needsUpdate = true;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.offset = new THREE.Vector2(Math.random(), Math.random());
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

  useEffect(() => {
    material.color.set(layer.color);
    material.opacity = layer.opacity * globalOpacity;
    material.needsUpdate = true;
  }, [layer.color, layer.opacity, globalOpacity, material]);

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
      geometry={getSharedPlaneGeometry()}
      frustumCulled={false}
      renderOrder={-1 - index}
    />
  );
};

const Aurora = () => {
  const layers = useAuroraStore((s) => s.layers);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadSharedTexture().then((t) => {
      if (!cancelled) setTexture(t);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!texture) return null;

  return (
    <group frustumCulled={false}>
      {layers.map((layer, i) => (
        <AuroraPlane key={i} texture={texture} layer={layer} index={i} />
      ))}
    </group>
  );
};

export default Aurora;
