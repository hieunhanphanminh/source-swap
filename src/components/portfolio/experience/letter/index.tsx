import { Text, TextProps } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";
import { usePortalStore } from "@/stores";
import { LETTER_PARAGRAPHS } from "@/constants/letter";

const Letter = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const isActive = usePortalStore((s) => s.activePortalId === "letter");

  useEffect(() => {
    if (isActive) {
      gsap.to(camera.position, { x: 0, y: -41, z: 11, duration: 1 });
    }
  }, [isActive]);

  useFrame((state, delta) => {
    if (groupRef.current && isActive) {
      // gentle reading scroll
      const total = LETTER_PARAGRAPHS.length * 0.85;
      groupRef.current.position.y = THREE.MathUtils.damp(
        groupRef.current.position.y,
        ((state.clock.elapsedTime * 0.12) % total) - 1.2,
        2, delta
      );
    }
  });

  const baseProps: Partial<TextProps> = {
    font: "./Vercetti-Regular.woff",
    color: "#1a1a1a",
    anchorX: "left",
    maxWidth: isMobile ? 3.4 : 4,
    fontSize: 0.22,
  };

  return (
    <group>
      <ambientLight intensity={1} />
      {/* Parchment */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[isMobile ? 4.5 : 5.4, 7.5]} />
        <meshBasicMaterial color="#f5e9d6" />
      </mesh>
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[isMobile ? 4.5 : 5.4, 7.5]} />
        <meshBasicMaterial color="#000" transparent opacity={0.05} />
      </mesh>

      <group ref={groupRef} position={[isMobile ? -2 : -2.4, 0, 0]}>
        {LETTER_PARAGRAPHS.map((p, i) => {
          const isGreeting = i === 0;
          const isSignoff = i >= LETTER_PARAGRAPHS.length - 2;
          return (
            <Text
              key={i}
              {...baseProps}
              font={isGreeting || isSignoff ? "./soria-font.ttf" : "./Vercetti-Regular.woff"}
              fontSize={isGreeting ? 0.36 : 0.22}
              color={isGreeting || isSignoff ? "#7a1a3a" : "#222"}
              position={[0, -i * 0.85, 0]}
              anchorX={isSignoff ? "right" : "left"}
            >
              {p}
            </Text>
          );
        })}
      </group>
    </group>
  );
};

export default Letter;
