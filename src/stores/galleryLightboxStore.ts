import { create } from "zustand";
import type { GalleryItem } from "@/constants/gallery";

interface GalleryLightboxState {
  item: GalleryItem | null;
  open: (item: GalleryItem) => void;
  close: () => void;
}

export const useGalleryLightboxStore = create<GalleryLightboxState>((set) => ({
  item: null,
  open: (item) => set({ item }),
  close: () => set({ item: null }),
}));
