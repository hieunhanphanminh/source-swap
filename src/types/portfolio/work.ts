import * as THREE from "three";

export interface WorkTimelinePoint {
  point: THREE.Vector3,
  year: string,
  title: string,
  subtitle?: string,
  position: 'left' | 'right',
  /** Deeper-level details revealed when the camera reaches this point. */
  detail?: string,
  badge?: string,
  badgeLabel?: string,
  stats?: string[],
  boss?: boolean,
}
