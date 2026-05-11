import { Text, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { usePortalStore } from "@/stores";
import { lazy, Suspense, useRef } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from 'three';
import GridTile from "./GridTile";

// Lazy-load each portal scene so they don't bloat first paint.
const Work = lazy(() => import("./work"));
const Projects = lazy(() => import("./projects"));
const Gallery = lazy(() => import("./gallery"));
const Dreams = lazy(() => import("./dreams"));
const Letter = lazy(() => import("./letter"));

interface TileDef {
  id: string;
  title: string;
  color: string;
  Content: React.LazyExoticComponent<React.ComponentType>;
}

const TILES: TileDef[] = [
  { id: "dreams", title: "OUR DREAMS", color: "#c9d6c0", Content: Dreams },
  { id: "gallery", title: "GALLERY", color: "#d6c0c8", Content: Gallery },
  { id: "work", title: "OUR TIMELINE", color: "#b9c6d6", Content: Work },
  { id: "projects", title: "REASONS I LOVE YOU", color: "#bdd1e3", Content: Projects },
  { id: "letter", title: "A LETTER", color: "#f0d9a8", Content: Letter },
];

const Experience = () => {
  const titleRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const data = useScroll();
  const isActive = usePortalStore((state) => !!state.activePortalId);

  const fontProps = {
    font: "./soria-font.ttf",
    fontSize: 0.4,
    color: 'white',
  };

  useFrame((_, delta) => {
    const d = data.range(0.8, 0.2);
    const e = data.range(0.7, 0.2);

    if (groupRef.current && !isActive) {
      groupRef.current.position.y = d > 0 ? -1 : -30;
      groupRef.current.visible = d > 0;
    }

    if (titleRef.current) {
      titleRef.current.children.forEach((text, i) => {
        const y = Math.max(Math.min((1 - d) * (10 - i), 10), 0.5);
        text.position.y = THREE.MathUtils.damp(text.position.y, y, 7, delta);
        /* eslint-disable @typescript-eslint/no-explicit-any */
        (text as any).fillOpacity = e;
      });
    }
  });

  const getTitle = () => {
    const title = 'us'.toUpperCase();
    return title.split('').map((char, i) => {
      const diff = isMobile ? 0.4 : 0.8;
      return (
        <Text key={i} {...fontProps} position={[i * diff, 2, 1]}>{char}</Text>
      );
    });
  };

  // Layout: Desktop = 5 tiles in one horizontal arc. Mobile = 5 stacked vertically.
  const tileSize: [number, number] = isMobile ? [2.4, 1.5] : [2.2, 2.6];
  const tileGap = isMobile ? 1.7 : 2.6;

  return (
    <group position={[0, -41.5, 12]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
      <group rotation={[0, 0, Math.PI / 2]}>
        <group ref={titleRef} position={[isMobile ? -1.8 : -3.6, 4, -2]}>
          {getTitle()}
        </group>

        <group position={[0, -1, 0]} ref={groupRef}>
          {TILES.map((tile, i) => {
            const offset = (i - (TILES.length - 1) / 2) * tileGap;
            const position = isMobile
              ? new THREE.Vector3(0, offset, 0)
              : new THREE.Vector3(offset, 0, 0);
            return (
              <Suspense key={tile.id} fallback={null}>
                <GridTile
                  id={tile.id}
                  title={tile.title}
                  color={tile.color}
                  textAlign="center"
                  position={position}
                  size={tileSize}
                  titleSize={isMobile ? 0.7 : 0.85}
                >
                  <tile.Content />
                </GridTile>
              </Suspense>
            );
          })}
        </group>
      </group>
    </group>
  );
};

export default Experience;
