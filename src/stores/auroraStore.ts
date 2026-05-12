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
export const DEFAULT_LAYERS: AuroraLayerConfig[] = [
  { pos: [-1, -5, 0],   scale: [22, 11, 1], color: "#ff9ec7", opacity: 0.55, speed: 0.05 },
  { pos: [2, -5, 2],    scale: [14, 7, 1],  color: "#c98bff", opacity: 0.45, speed: 0.08 },
  { pos: [-10, -15, 4], scale: [20, 10, 1], color: "#ff5d8f", opacity: 0.4,  speed: 0.04 },
  { pos: [6, -8, 8],    scale: [16, 8, 1],  color: "#ffb3d1", opacity: 0.35, speed: 0.07 },
  { pos: [0, -25, 20],  scale: [34, 14, 1], color: "#ffd1e6", opacity: 0.5,  speed: 0.03 },
  { pos: [10, -20, -5], scale: [24, 12, 1], color: "#ffa3c4", opacity: 0.4,  speed: 0.06 },
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
