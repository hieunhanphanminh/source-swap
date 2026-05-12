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
export const DEFAULT_LAYERS: AuroraLayerConfig[] = [
  { pos: [  0, -22, -14], scale: [10, 28, 1], color: "#ff9ec7", opacity: 0.65, speed: 0 },
  { pos: [ 12, -24,  -6], scale: [ 9, 24, 1], color: "#c98bff", opacity: 0.55, speed: 0 },
  { pos: [ 14, -26,   8], scale: [ 9, 26, 1], color: "#ff5d8f", opacity: 0.5,  speed: 0 },
  { pos: [  0, -22,  14], scale: [10, 30, 1], color: "#ffb3d1", opacity: 0.6,  speed: 0 },
  { pos: [-14, -26,   8], scale: [ 9, 26, 1], color: "#ffd1e6", opacity: 0.55, speed: 0 },
  { pos: [-12, -24,  -6], scale: [ 9, 24, 1], color: "#ffa3c4", opacity: 0.5,  speed: 0 },
];

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
