import { Edges, Text, TextProps, useTexture } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";

import { usePortalStore } from "@/stores";
import { useGalleryLightboxStore } from "@/stores/galleryLightboxStore";
import { GalleryItem } from "@/constants/gallery";

interface GalleryTileProps {
  item: GalleryItem;
  index: number;
  position: [number, number, number];
  rotation: [number, number, number];
  activeId: number | null;
  onClick: () => void;
}

const TARGET_AREA = 11; // ~4.2 * 2.6
const W_MIN = 2.4;
const W_MAX = 4.8;
const H_MIN = 2.0;
const H_MAX = 3.6;

const GalleryTile = ({ item, index, position, rotation, activeId, onClick }: GalleryTileProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const hoverAnimRef = useRef<gsap.core.Timeline | null>(null);
  const [desktopHovered, setDesktopHovered] = useState(false);
  const isActive = usePortalStore((state) => state.activePortalId === "gallery");
  const hovered = isMobile ? activeId === index : desktopHovered;

  // Photo texture (always loaded — small webp). For videos we load a poster.
  const posterSrc = item.type === "photo" ? item.src : (item.thumb || item.src);
  const tex = useTexture(posterSrc);
  if (tex) {
    tex.anisotropy = 4;
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    (tex as THREE.Texture).colorSpace = THREE.SRGBColorSpace;
  }

  // Size the plane to the media's natural aspect so it doesn't squish/stretch.
  const [dims, setDims] = useState<[number, number]>([4.2, 2.6]);
  useEffect(() => {
    const img = (tex as THREE.Texture)?.image as { width?: number; height?: number } | undefined;
    if (!img?.width || !img?.height) return;
    const aspect = img.width / img.height;
    // Solve w*h = AREA with w/h = aspect → w = sqrt(AREA*aspect), h = sqrt(AREA/aspect)
    let w = Math.sqrt(TARGET_AREA * aspect);
    let h = Math.sqrt(TARGET_AREA / aspect);
    if (w > W_MAX) { w = W_MAX; h = w / aspect; }
    if (h > H_MAX) { h = H_MAX; w = h * aspect; }
    if (w < W_MIN) { w = W_MIN; h = w / aspect; }
    if (h < H_MIN) { h = H_MIN; w = h * aspect; }
    setDims([w, h]);
  }, [tex]);
  const [TILE_W, TILE_H] = dims;

  // Lazy video texture — only created on first hover.
  const [videoTex, setVideoTex] = useState<THREE.VideoTexture | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (item.type !== "video") return;
    if (hovered && !videoTex) {
      const v = document.createElement("video");
      v.src = item.src;
      v.crossOrigin = "anonymous";
      v.loop = true;
      v.muted = true;
      v.playsInline = true;
      v.preload = "metadata";
      videoElRef.current = v;
      v.play().catch(() => {});
      const t = new THREE.VideoTexture(v);
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearFilter;
      setVideoTex(t);
    } else if (videoElRef.current) {
      if (hovered) videoElRef.current.play().catch(() => {});
      else videoElRef.current.pause();
    }
  }, [hovered, item.type, item.src]);

  useEffect(() => () => {
    if (videoElRef.current) {
      videoElRef.current.pause();
      videoElRef.current.src = "";
    }
    videoTex?.dispose();
  }, [videoTex]);

  const captionProps: Partial<TextProps> = useMemo(() => ({
    font: "./soria-font.ttf",
    color: "#fff5f5",
  }), []);

  const metaProps: Partial<TextProps> = useMemo(() => ({
    font: "./Vercetti-Regular.woff",
    color: "#ffd1dc",
    anchorX: "left",
    anchorY: "top",
  }), []);

  useEffect(() => {
    if (!groupRef.current) return;
    hoverAnimRef.current?.kill();

    const [, mediaMesh, caption, dateGroup, subtitle, badge] = groupRef.current.children;

    hoverAnimRef.current = gsap.timeline();
    hoverAnimRef.current
      .to(groupRef.current.position, { z: hovered ? 1 : 0, duration: 0.2 }, 0)
      .to(groupRef.current.position, { y: hovered ? 0.4 : 0 }, 0)
      .to(groupRef.current.scale, {
        x: hovered ? 1.3 : 1,
        y: hovered ? 1.3 : 1,
        z: hovered ? 1.3 : 1,
      }, 0)
      .to(caption.position, { y: hovered ? -TILE_H / 2 - 0.2 : -TILE_H / 2 }, 0)
      .to(subtitle, { fillOpacity: hovered ? 1 : 0, duration: 0.4 }, 0)
      .to(subtitle.position, { y: hovered ? -TILE_H / 2 - 0.5 : -TILE_H / 2 - 0.35 }, 0)
      .to(dateGroup.position, { y: hovered ? TILE_H / 2 + 0.35 : TILE_H / 2 + 0.2 }, 0)
      .to(mediaMesh.scale, { y: hovered ? 1.05 : 1, x: hovered ? 1.05 : 1 }, 0)
      .to((mediaMesh as THREE.Mesh).material, { opacity: hovered ? 1 : 0.92 }, 0)
      .to(badge.scale, { x: hovered && item.type === "video" ? 1 : 0, y: hovered && item.type === "video" ? 1 : 0 }, 0);
  }, [hovered, item.type, TILE_H]);

  useEffect(() => {
    if (groupRef.current) {
      gsap.to(groupRef.current.position, {
        y: isActive ? 0 : -10,
        duration: 1,
        delay: isActive ? index * 0.08 : 0,
      });
    }
  }, [isActive]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (videoElRef.current) videoElRef.current.pause();
    onClick();
  };

  const activeTex = item.type === "video" && videoTex && hovered ? videoTex : tex;

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={() => !isMobile && isActive && setDesktopHovered(true)}
      onPointerOut={() => !isMobile && isActive && setDesktopHovered(false)}
    >
      <group ref={groupRef} renderOrder={10}>
        {/* Soft pink glow halo behind the frame */}
        <mesh position={[0, 0, -0.05]} renderOrder={9}>
          <planeGeometry args={[TILE_W * 1.35, TILE_H * 1.35, 1]} />
          <meshBasicMaterial color="#ff9bbf" transparent opacity={0.18} depthWrite={false} depthTest={false} />
        </mesh>

        {/* Media plane — the "photo/video frame". */}
        <mesh onClick={handleClick} position={[0, 0, 0.02]} renderOrder={11}>
          <planeGeometry args={[TILE_W, TILE_H, 1]} />
          <meshBasicMaterial map={activeTex} transparent opacity={0.92} toneMapped={false} depthTest={false} depthWrite={false} />
          <Edges color="#ffe1e9" lineWidth={1.5} />
        </mesh>

        {/* Caption (title under the frame) */}
        <Text
          {...captionProps}
          position={[-TILE_W / 2 + 0.1, -TILE_H / 2, 0.05]}
          anchorX="left"
          anchorY="bottom"
          maxWidth={TILE_W - 0.2}
          fontSize={0.42}
        >
          {item.caption}
        </Text>

        {/* Date / label badge above frame */}
        <group position={[-TILE_W / 2 + 0.55, TILE_H / 2 + 0.2, 0.01]}>
          <mesh>
            <planeGeometry args={[1.7, 0.4, 1]} />
            <meshBasicMaterial color="#ff9bbf" transparent opacity={0.18} />
            <Edges color="#ffe1e9" lineWidth={1} />
          </mesh>
          <Text {...metaProps} position={[-0.7, 0.18, 0]} fontSize={0.22}>
            {item.label}
          </Text>
        </group>

        {/* Subtitle (whisper line) — fades in on hover */}
        <Text
          {...metaProps}
          color="#fff5f5"
          fillOpacity={0}
          maxWidth={TILE_W - 0.2}
          position={[-TILE_W / 2 + 0.1, -TILE_H / 2 - 0.35, 0.05]}
          fontSize={0.18}
        >
          {item.subtitle}
        </Text>

        {/* PLAY badge — visible on hover for video tiles */}
        <group position={[TILE_W / 2 - 0.55, TILE_H / 2 + 0.2, 0.05]} scale={[0, 0, 1]}>
          <mesh>
            <planeGeometry args={[1, 0.4, 1]} />
            <meshBasicMaterial color="#ff5d8f" />
            <Edges color="#fff" lineWidth={1} />
          </mesh>
          <Text
            font="./Vercetti-Regular.woff"
            color="white"
            position={[-0.35, 0.17, 0.01]}
            fontSize={0.2}
            anchorX="left"
            anchorY="top"
          >
            ▶  PLAY
          </Text>
        </group>
      </group>
    </group>
  );
};

export default GalleryTile;
