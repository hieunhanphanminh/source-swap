import { Sparkles, Stars, Environment } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import HeartMesh from "../HeartMesh";
import { useScrollProgressRef } from "../useScrollProgress";

export default function HeroScene({ reduced = false, mobile = false }: { reduced?: boolean; mobile?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const heartGroup = useRef<THREE.Group>(null);
  const { camera, pointer } = useThree();
  const scroll = useScrollProgressRef();

  useFrame(() => {
    if (reduced) return;
    // Clamp scroll influence: heart only reacts to the first 20% of scroll
    // (the hero viewport) and is locked in place after that, so it never
    // intrudes on the countdown / CTAs further down the page.
    const s = Math.min(1, scroll.current / 0.2);
    const targetZ = 7.5 + s * 1.5;          // always behind UI plane
    const targetY = pointer.y * 0.2 + 0.3 + s * 0.6;
    camera.position.x += (pointer.x * 0.35 - camera.position.x) * 0.04;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.position.z += (targetZ - camera.position.z) * 0.04;
    camera.lookAt(0, 0, 0);

    // Push the heart group itself further back as user scrolls,
    // and shrink it slightly so it never overlaps content.
    if (heartGroup.current) {
      const targetHeartZ = -1.5 - s * 2.5;
      const targetScale = 1 - s * 0.25;
      heartGroup.current.position.z += (targetHeartZ - heartGroup.current.position.z) * 0.06;
      heartGroup.current.scale.setScalar(
        heartGroup.current.scale.x + (targetScale - heartGroup.current.scale.x) * 0.06
      );
    }
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 2, 4]} intensity={3} color="#ff5f9e" />
      <pointLight position={[-4, -1, 2]} intensity={2} color="#ffd166" />
      <pointLight position={[0, 4, -3]} intensity={1.5} color="#a78bfa" />
      <Environment preset="night" />
      <group ref={heartGroup} position={[0, 0, -1.5]}>
        <HeartMesh reduced={reduced} />
      </group>
      <Sparkles count={mobile ? 60 : 140} scale={[8, 6, 6]} size={3} speed={0.3} color="#ffb3d1" />
      <Stars radius={40} depth={30} count={mobile ? 800 : 2500} factor={3} fade speed={0.5} />
    </group>
  );
}
