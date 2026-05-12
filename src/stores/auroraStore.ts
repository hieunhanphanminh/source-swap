import { create } from "zustand";

export interface AuroraLayerConfig {
  pos: [number, number, number];
  scale: [number, number, number];
  color: string;
  opacity: number;
  speed: number;
}

// Mirrors the cloud volumes in src/components/portfolio/models/Cloud.tsx
// (Clouds container is at y=-5; positions below already include that offset).
// Tall vertical "aurora curtains" arranged in a ring above the gallery camera.
// The gallery portal repositions the camera to roughly y = -39, so y values
// here (~-26..-22) place the curtains overhead.
const RING_PALETTE = ["#ff5d8f", "#ff9ec7", "#ffb3d1", "#c98bff", "#ff79b0", "#ffd1e6"];
const RING_COUNT = 12;
const RING_RADIUS = 15;
export const DEFAULT_LAYERS: AuroraLayerConfig[] = Array.from({ length: RING_COUNT }, (_, i) => {
  const a = (i / RING_COUNT) * Math.PI * 2;
  const x = Math.cos(a) * RING_RADIUS;
  const z = Math.sin(a) * RING_RADIUS;
  const y = -23 - (i % 3) * 1.5;
  const w = 10 + (i % 4) * 0.8;
  const h = 28 + (i % 5) * 1.5;
  return {
    pos: [x, y, z] as [number, number, number],
    scale: [w, h, 1] as [number, number, number],
    color: RING_PALETTE[i % RING_PALETTE.length],
    opacity: 0.7,
    speed: 0,
  };
});

interface AuroraState {
  layers: AuroraLayerConfig[];
  globalOpacity: number;
  globalSpeed: number;
  panelOpen: boolean;
  setLayer: (i: number, patch: Partial<AuroraLayerConfig>) => void;
  setGlobalOpacity: (v: number) => void;
  setGlobalSpeed: (v: number) => void;
  togglePanel: () => void;
  reset: () => void;
}

export const useAuroraStore = create<AuroraState>((set) => ({
  layers: DEFAULT_LAYERS.map((l) => ({ ...l })),
  globalOpacity: 1,
  globalSpeed: 1,
  panelOpen: false,
  setLayer: (i, patch) =>
    set((s) => {
      const next = s.layers.slice();
      next[i] = { ...next[i], ...patch };
      return { layers: next };
    }),
  setGlobalOpacity: (v) => set({ globalOpacity: v }),
  setGlobalSpeed: (v) => set({ globalSpeed: v }),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
  reset: () => set({ layers: DEFAULT_LAYERS.map((l) => ({ ...l })), globalOpacity: 1, globalSpeed: 1 }),
}));
