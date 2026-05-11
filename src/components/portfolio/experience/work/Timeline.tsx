import { Box, Edges, Line, Text, TextProps } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { usePortalStore } from "@/stores";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";

import { WORK_TIMELINE } from "@/constants";
import { WorkTimelinePoint } from "@/types/portfolio";

const reusableLeft = new THREE.Vector3(-0.3, 0, -0.1);
const reusableRight = new THREE.Vector3(0.3, 0, -0.1);

const TimelinePoint = ({
  point,
  diff,
  isCurrent,
}: {
  point: WorkTimelinePoint;
  diff: number;
  isCurrent: boolean;
}) => {
  const getPoint = useMemo(() => {
    switch (point.position) {
      case 'left': return reusableLeft;
      case 'right': return reusableRight;
      default: return new THREE.Vector3();
    }
  }, [point.position]);

  const textAlign = point.position === 'left' ? 'right' : 'left';
  const accent = point.boss ? '#ffd54f' : 'white';

  const textProps: Partial<TextProps> = useMemo(() => ({
    font: "./Vercetti-Regular.woff",
    color: accent,
    anchorX: textAlign,
    fillOpacity: 2 - 2 * diff,
  }), [textAlign, diff, accent]);

  const titleProps = useMemo(() => ({
    ...textProps,
    font: "./soria-font.ttf",
    fontSize: 0.6,
    maxWidth: 3,
  }), [textProps]);

  // Deep-level panel — only shown when this point is the focused one.
  const detailOpacity = isCurrent ? 1 : 0;
  const detailGroupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (detailGroupRef.current) {
      detailGroupRef.current.scale.x = THREE.MathUtils.damp(
        detailGroupRef.current.scale.x,
        isCurrent ? 1 : 0.001,
        6,
        delta,
      );
      detailGroupRef.current.scale.y = detailGroupRef.current.scale.x;
    }
  });

  return (
    <group position={point.point} scale={isMobile ? 0.35 : 0.6}>
      <Box args={[0.2, 0.2, 0.2]} position={[0, 0, -0.1]} scale={[1 - diff, 1 - diff, 1 - diff]}>
        <meshBasicMaterial color={accent} wireframe />
        <Edges color={accent} lineWidth={1.5} />
      </Box>
      <group>
        <group position={getPoint}>
          <Text {...textProps} fontSize={0.3} position={[-diff / 2, 0, 0]}>
            {point.year}
          </Text>
          <group position={[0, -0.5, 0]}>
            <Text {...titleProps} fontSize={0.6} maxWidth={3} position={[0, -diff / 2, 0]}>
              {point.title}
            </Text>
            {point.subtitle && (
              <Text {...textProps} fontSize={0.2} position={[0, -0.4 - diff, 0]}>
                {point.subtitle}
              </Text>
            )}
          </group>

          {/* Deeper-level reveal: badge + detail + stats. */}
          <group ref={detailGroupRef} position={[0, -1.4, 0]} scale={[0.001, 0.001, 1]}>
            {point.badgeLabel && (
              <Text
                {...textProps}
                font="./Vercetti-Regular.woff"
                fontSize={0.16}
                color={accent}
                fillOpacity={detailOpacity}
                position={[0, 0, 0]}
              >
                {`${point.badge ?? '✦'}  ${point.badgeLabel.toUpperCase()}`}
              </Text>
            )}
            {point.detail && (
              <Text
                {...textProps}
                fontSize={0.18}
                color="#f6e7d8"
                fillOpacity={detailOpacity * 0.95}
                maxWidth={3.4}
                position={[0, -0.35, 0]}
                lineHeight={1.25}
              >
                {point.detail}
              </Text>
            )}
            {point.stats && point.stats.length > 0 && (
              <Text
                {...textProps}
                fontSize={0.14}
                color={accent}
                fillOpacity={detailOpacity * 0.85}
                maxWidth={3.4}
                position={[0, -1.25, 0]}
              >
                {point.stats.join('   ·   ')}
              </Text>
            )}
            {point.boss && (
              <Text
                {...textProps}
                fontSize={0.13}
                color="#ffd54f"
                fillOpacity={detailOpacity}
                position={[0, 0.28, 0]}
              >
                ★ GRAND CHAPTER ★
              </Text>
            )}
          </group>
        </group>
      </group>
    </group>
  );
};

const Timeline = ({ progress }: { progress: number }) => {
  const { camera } = useThree();
  const isActive = usePortalStore((state) => state.activePortalId === 'work');
  const timeline = useMemo(() => WORK_TIMELINE, []);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(timeline.map(p => p.point), false), [timeline]);
  const curvePoints = useMemo(() => curve.getPoints(500), [curve]);
  const visibleCurvePoints = useMemo(() => curvePoints.slice(0, Math.max(1, Math.ceil(progress * curvePoints.length))), [curvePoints, progress]);
  const visibleTimelinePoints = useMemo(() => timeline.slice(0, Math.max(1, Math.round(progress * (timeline.length - 1) + 1))), [timeline, progress]);
  const focusedIndex = Math.round(progress * (timeline.length - 1));

  const [visibleDashedCurvePoints, setVisibleDashedCurvePoints] = useState<THREE.Vector3[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useFrame((_, delta) => {
    if (isActive) {
      const position = curve.getPoint(progress);
      camera.position.x = THREE.MathUtils.damp(camera.position.x, (isMobile ? -1 : -2) + position.x, 4, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, -39 + position.z, 4, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, 13 - position.y, 4, delta);
    }
  });

  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    if (groupRef.current) {
      tl.to(groupRef.current.scale, {
        x: isActive ? 1 : 0,
        y: isActive ? 1 : 0,
        z: isActive ? 1 : 0,
        duration: 1,
        delay: isActive ? 0.4 : 0,
      });
      tl.to(groupRef.current.position, {
        y: isActive ? 0 : -2,
        duration: 1,
        delay: isActive ? 0.4 : 0,
      }, 0);
    }

    if (isActive) {
      let i = 0;
      clearInterval(intervalRef.current!);
      setTimeout(() => {
        intervalRef.current = setInterval(() => {
          const p = i++ / 100;
          setVisibleDashedCurvePoints(curvePoints.slice(0, Math.max(1, Math.ceil(p * curvePoints.length))));
          if (i > 100 && intervalRef.current) clearInterval(intervalRef.current);
        }, 10);
      }, 1000);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisibleDashedCurvePoints([]);
      clearInterval(intervalRef.current!);
    }

    return () => clearInterval(intervalRef.current!);
  }, [isActive]);

  return (
    <group position={[0, -0.1, -0.1]}>
      <Line points={visibleCurvePoints} color="white" lineWidth={3} />
      {visibleDashedCurvePoints.length > 0 && (
        <Line
          points={visibleDashedCurvePoints}
          color="white"
          lineWidth={0.5}
          dashed
          dashSize={0.25}
          gapSize={0.25}
        />
      )}
      <group ref={groupRef}>
        {visibleTimelinePoints.map((point, i) => {
          const diff = Math.min(2 * Math.max(i - (progress * (timeline.length - 1)), 0), 1);
          return (
            <TimelinePoint
              point={point}
              key={i}
              diff={diff}
              isCurrent={i === focusedIndex && isActive}
            />
          );
        })}
      </group>
    </group>
  );
};

export default Timeline;
