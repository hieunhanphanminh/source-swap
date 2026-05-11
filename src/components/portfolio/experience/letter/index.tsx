import { Text, TextProps } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { usePortalStore } from "@/stores";
import { LETTER_PARAGRAPHS } from "@/constants/letter";

const LINE_GAP = 0.42;
const VISIBLE_H = 2.2;

const Letter = () => {
  const groupRef = useRef<THREE.Group>(null);
  const isActive = usePortalStore((s) => s.activePortalId === "letter");

  useFrame((state) => {
    if (groupRef.current) {
      const speed = isActive ? 0.18 : 0.05;
      const total = LETTER_PARAGRAPHS.length * LINE_GAP + VISIBLE_H;
      groupRef.current.position.y = ((state.clock.elapsedTime * speed) % total) - VISIBLE_H / 2;
    }
  });

  const baseProps: Partial<TextProps> = {
    font: "./Vercetti-Regular.woff",
    color: "#222",
    anchorX: "center",
    maxWidth: 2.2,
    fontSize: 0.13,
    textAlign: "center",
  };

  return (
    <group>
      <ambientLight intensity={1} />
      <color attach="background" args={["#f0d9a8"]} />

      {/* Parchment */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[2.6, 3.4]} />
        <meshBasicMaterial color="#f5e9d6" />
      </mesh>

      <group ref={groupRef}>
        {LETTER_PARAGRAPHS.map((p, i) => {
          const isGreeting = i === 0;
          const isSignoff = i >= LETTER_PARAGRAPHS.length - 2;
          return (
            <Text
              key={i}
              {...baseProps}
              font={isGreeting || isSignoff ? "./soria-font.ttf" : "./Vercetti-Regular.woff"}
              fontSize={isGreeting ? 0.2 : 0.13}
              color={isGreeting || isSignoff ? "#7a1a3a" : "#222"}
              position={[0, -i * LINE_GAP, 0]}
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
