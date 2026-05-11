
import { Edges, MeshPortalMaterial, Text, TextProps, useScroll } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { usePortalStore } from '@/stores';
import gsap from "gsap";
import { useEffect, useImperativeHandle, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import * as THREE from 'three';

interface GridTileProps {
  id: string;
  title: string;
  textAlign: TextProps['textAlign'];
  children: React.ReactNode;
  color: string;
  position: THREE.Vector3;
  /** Plane size [width, height]. Defaults to 4×4 (legacy). */
  size?: [number, number];
  /** Display title scale multiplier. */
  titleSize?: number;
  /** Optional ref for imperative open/close (used by accessibility overlay). */
  controlRef?: React.MutableRefObject<{ open: () => void; close: () => void } | null>;
}

const GridTile = (props: GridTileProps) => {
  const titleRef = useRef<THREE.Group>(null);
  const gridRef = useRef<THREE.Group>(null);
  const hoverBoxRef = useRef<THREE.Mesh>(null);
  const portalRef = useRef(null);
  const {
    title, textAlign, children, color, position, id,
    size = [4, 4], titleSize = 1, controlRef
  } = props;
  const [w, h] = size;
  const { camera } = useThree();
  const setActivePortal = usePortalStore((state) => state.setActivePortal);
  const isActive = usePortalStore((state) => state.activePortalId === id);
  const activePortalId = usePortalStore((state) => state.activePortalId);
  const data = useScroll();

  useFrame(() => {
    const d = data.range(0.95, 0.05);
    if (isMobile && titleRef.current) {
      /* eslint-disable  @typescript-eslint/no-explicit-any */
      (titleRef.current as any).fillOpacity = d;
    }
  });

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') exitPortal(true);
  };

  const portalInto = (e?: { stopPropagation?: () => void }) => {
    if (isActive || activePortalId) return;
    e?.stopPropagation?.();
    setActivePortal(id);
    document.body.style.cursor = 'auto';
    const div = document.createElement('div');

    div.className = 'fixed close';
    div.setAttribute('role', 'button');
    div.setAttribute('aria-label', 'Close portal');
    div.setAttribute('tabindex', '0');
    div.style.transform = 'rotateX(90deg)';
    div.onclick = () => exitPortal(true);
    div.onkeydown = (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); exitPortal(true); }
    };

    if (!document.querySelector('.close')) {
      document.body.appendChild(div);
      gsap.fromTo(div, { scale: 0, rotate: '-180deg' }, {
        opacity: 1, zIndex: 10, transform: 'rotateX(0deg)', scale: 1, duration: 1,
      });
      setTimeout(() => div.focus(), 50);
    }
    document.body.addEventListener('keydown', handleEscape);
    gsap.to(portalRef.current, { blend: 1, duration: 0.5 });
  };

  const exitPortal = (force = false) => {
    if (!force && !activePortalId) return;
    setActivePortal(null);

    gsap.to(camera.position, { x: 0, duration: 1 });
    gsap.to(camera.rotation, { x: -Math.PI / 2, y: 0, duration: 1 });
    gsap.to(portalRef.current, { blend: 0, duration: 1 });

    gsap.to(document.querySelector('.close'), {
      scale: 0,
      duration: 0.5,
      onComplete: () => {
        document.querySelectorAll('.close').forEach((el) => el.remove());
      }
    });
    document.body.removeEventListener('keydown', handleEscape);
  };

  // Allow external (DOM-level a11y) to open/close this portal.
  useImperativeHandle(controlRef, () => ({
    open: () => portalInto(),
    close: () => exitPortal(true),
  }), [activePortalId, isActive]);

  const fontProps: Partial<TextProps> = {
    font: "./soria-font.ttf",
    maxWidth: w * 0.85,
    anchorX: 'center',
    anchorY: 'bottom',
    fontSize: 0.45 * titleSize,
    color: 'white',
    textAlign: textAlign,
    fillOpacity: isMobile ? 1 : 0,
  };

  const onPointerOver = () => {
    if (isActive || isMobile) return;
    document.body.style.cursor = 'pointer';
    gsap.to(titleRef.current, { fillOpacity: 1 });
    if (gridRef.current && hoverBoxRef.current) {
      gsap.to(gridRef.current.position, { z: 0.5, duration: 0.4 });
      gsap.to(hoverBoxRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.4 });
    }
  };

  const onPointerOut = () => {
    if (isMobile) return;
    document.body.style.cursor = 'auto';
    gsap.to(titleRef.current, { fillOpacity: 0 });
    if (gridRef.current && hoverBoxRef.current) {
      gsap.to(gridRef.current.position, { z: 0, duration: 0.4 });
      gsap.to(hoverBoxRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.4 });
    }
  };

  return (
    <mesh ref={gridRef}
      position={position}
      onClick={portalInto}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}>
      <planeGeometry args={[w, h, 1]} />
      <group>
        <mesh position={[0, 0, -0.01]} ref={hoverBoxRef} scale={[0, 0, 0]}>
          <boxGeometry args={[w, h, 0.5]} />
          <meshPhysicalMaterial color="#444" transparent opacity={0.3} />
          <Edges color="white" lineWidth={3} />
        </mesh>
        <Text position={[0, -h / 2 + 0.2, 0.4]} {...fontProps} ref={titleRef}>
          {title}
        </Text>
      </group>
      <MeshPortalMaterial ref={portalRef} blend={0} resolution={0} blur={0}>
        <color attach="background" args={[color]} />
        {children}
      </MeshPortalMaterial>
    </mesh>
  );
};

export default GridTile;
