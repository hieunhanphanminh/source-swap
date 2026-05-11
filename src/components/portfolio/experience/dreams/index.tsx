import { Text, TextProps } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { usePortalStore } from "@/stores";
import { DREAMS } from "@/constants/dreams";

const lineProps: Partial<TextProps> = {
  font: "./Vercetti-Regular.woff",
  color: "white",
  anchorX: "left",
  anchorY: "middle",
  fontSize: 0.16,
  maxWidth: 2.4,
};

const ROW_H = 0.32;
const VISIBLE_H = 2.2;

const Dreams = () => {
  const groupRef = useRef<THREE.Group>(null);
  const isActive = usePortalStore((s) => s.activePortalId === "dreams");

  useFrame((state) => {
    if (groupRef.current) {
      const speed = isActive ? 0.25 : 0.08;
      const total = DREAMS.length * ROW_H + VISIBLE_H;
      groupRef.current.position.y = ((state.clock.elapsedTime * speed) % total) - VISIBLE_H / 2;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.9} />
      <color attach="background" args={["#c9d6c0"]} />

      {/* Header */}
      <Text
        font="./soria-font.ttf"
        fontSize={0.32}
        color="white"
        anchorX="center"
        position={[0, 1.05, 0.1]}
      >
        Our Bucket List
      </Text>

      {/* Scrolling list, clipped visually by fade panels */}
      <group ref={groupRef} position={[-1.3, 0, 0]}>
        {DREAMS.map((d, i) => (
          <group key={i} position={[0, -i * ROW_H, 0]}>
            <Text {...lineProps} fontSize={0.22} position={[0, 0, 0.05]}>
              {d.emoji}
            </Text>
            <Text {...lineProps} position={[0.4, 0, 0.05]}>
              {d.title}
            </Text>
          </group>
        ))}
      </group>

      {/* Fade overlays top/bottom */}
      <mesh position={[0, 0.85, 0.5]}>
        <planeGeometry args={[3.2, 0.4]} />
        <meshBasicMaterial color="#c9d6c0" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, -1.1, 0.5]}>
        <planeGeometry args={[3.2, 0.4]} />
        <meshBasicMaterial color="#c9d6c0" transparent opacity={0.85} />
      </mesh>
    </group>
  );
};

export default Dreams;
