
import { Text } from "@react-three/drei";

import { useProgress } from "@react-three/drei";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import CloudContainer from "../models/Cloud";
import SakuraPetals from "../models/SakuraPetals";
import WindowModel from "../models/WindowModel";
import FloatingHearts from "../experience/gallery/FloatingHearts";
import TextWindow from "./TextWindow";

const Hero = () => {
  const titleRef = useRef<THREE.Mesh>(null);
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100 && titleRef.current) {
      gsap.fromTo(titleRef.current.position, {
        y: -10,
        duration: 1,
      }, {
        y: 0,
        duration: 3
      });
    }
  }, [progress]);

  const fontProps = {
    font: "./soria-font.ttf",
    fontSize: 1.2,
  };

  return (
    <>
      {/* Soft cinematic fog — pink sunset haze */}
      <fog attach="fog" args={["#ffd6e7", 10, 60]} />

      {/* Warm romantic lighting */}
      <ambientLight intensity={1.2} color="#ffb6c1" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.6}
        color="#ffd28a"
      />
      <pointLight position={[-6, 4, 3]} intensity={1.2} color="#ff9ec7" distance={30} />
      <pointLight position={[6, -2, 4]} intensity={0.9} color="#d9b8ff" distance={30} />

      <Text position={[0, 2, -10]} {...fontProps} ref={titleRef}>For you, Rhia.</Text>
      <CloudContainer />

      {/* Sakura petals drifting through the hero */}
      <SakuraPetals count={70} centerY={0} radius={20} height={24} />

      {/* Subtle floating hearts behind the title */}
      <FloatingHearts centerY={0} />

      <group position={[0, -25, 5.69]}>
        <pointLight castShadow position={[1, 1, -2.5]} intensity={60} distance={10} color="#ffd1a8" />
        <WindowModel receiveShadow />
        <TextWindow />
      </group>
    </>
  );
};

export default Hero;
