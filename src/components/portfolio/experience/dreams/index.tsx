import { Text, TextProps } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";
import { usePortalStore } from "@/stores";
import { DREAMS } from "@/constants/dreams";

const lineProps: Partial<TextProps> = {
  font: "./Vercetti-Regular.woff",
  color: "white",
  anchorX: "left",
  anchorY: "middle",
  fontSize: 0.22,
  maxWidth: 4,
};

const Dreams = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const isActive = usePortalStore((s) => s.activePortalId === "dreams");

  useEffect(() => {
    if (isActive) {
      gsap.to(camera.position, { x: 0, y: -41, z: 11, duration: 1 });
    }
  }, [isActive]);

  useFrame((state, delta) => {
    if (groupRef.current && isActive) {
      // Auto-scroll the list slowly
      groupRef.current.position.y = THREE.MathUtils.damp(
        groupRef.current.position.y,
        ((state.clock.elapsedTime * 0.18) % (DREAMS.length * 0.55)) - 1,
        2, delta
      );
    }
  });

  return (
    <group>
      <ambientLight intensity={0.7} />
      <Text
        font="./soria-font.ttf"
        fontSize={0.55}
        color="white"
        anchorX="center"
        position={[0, 2.2, 0]}>
        Our Bucket List
      </Text>
      <group ref={groupRef} position={[isMobile ? -1.5 : -2.2, 0, 0]}>
        {DREAMS.map((d, i) => (
          <group key={i} position={[0, -i * 0.55, 0]}>
            <Text {...lineProps} fontSize={0.36} position={[0, 0, 0.05]}>
              {d.emoji}
            </Text>
            <Text {...lineProps} position={[0.6, 0, 0]}>
              {d.title}
            </Text>
          </group>
        ))}
      </group>
      {/* fade overlays top/bottom */}
      <mesh position={[0, 2.6, 0.5]}>
        <planeGeometry args={[8, 1]} />
        <meshBasicMaterial color="#bdd1e3" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, -2.6, 0.5]}>
        <planeGeometry args={[8, 1]} />
        <meshBasicMaterial color="#bdd1e3" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

export default Dreams;
