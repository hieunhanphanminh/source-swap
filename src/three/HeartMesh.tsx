import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

function buildHeartGeometry() {
  // Classic 2D heart curve, scaled then extruded.
  const shape = new THREE.Shape();
  const x = 0;
  const y = 0;
  shape.moveTo(x + 0.5, y + 0.5);
  shape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
  shape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
  shape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
  shape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
  shape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
  shape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.18,
    bevelSize: 0.18,
    bevelSegments: 8,
    curveSegments: 64,
  });
  geo.center();
  geo.rotateZ(Math.PI);
  geo.scale(0.9, 0.9, 0.9);
  return geo;
}

export default function HeartMesh({ reduced = false }: { reduced?: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(buildHeartGeometry, []);

  useFrame((state) => {
    if (!ref.current || reduced) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.45;
    ref.current.rotation.x = Math.sin(t * 0.6) * 0.12;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={ref} geometry={geometry} castShadow receiveShadow>
        <MeshTransmissionMaterial
          color="#ff5f9e"
          thickness={0.8}
          roughness={0.08}
          transmission={1}
          ior={1.45}
          chromaticAberration={0.06}
          anisotropy={0.3}
          distortion={0.2}
          distortionScale={0.4}
          temporalDistortion={0.1}
          attenuationColor="#ff80b5"
          attenuationDistance={1.5}
        />
      </mesh>
    </Float>
  );
}
