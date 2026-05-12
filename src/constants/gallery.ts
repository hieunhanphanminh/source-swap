export type GalleryItem = {
  id: string;
  type: "photo" | "video";
  src: string;
  thumb?: string;
  caption: string;
  subtitle: string;
  label: string;
};

// Mirrors the source GalleryPage — photos and videos as a single carousel.
export const GALLERY_ITEMS: GalleryItem[] = [
  { id: "p-1", type: "photo", src: "/rhia-gallery/rhia1.webp", caption: "Soft little smile", subtitle: "The look that rewires my whole day", label: "MOMENT 01" },
  { id: "p-2", type: "photo", src: "/rhia-gallery/rhia2.webp", caption: "Main character energy", subtitle: "Every angle, an entire moodboard", label: "MOMENT 02" },
  { id: "p-3", type: "photo", src: "/rhia-gallery/rhia6.webp", caption: "Mirror, mirror", subtitle: "Caught the prettiest girl in the frame", label: "MOMENT 03" },
  { id: "p-4", type: "photo", src: "/rhia-gallery/rhia4.webp", caption: "Puppy mode activated", subtitle: "Should be illegal to be this cute", label: "MOMENT 04" },
  { id: "p-5", type: "photo", src: "/rhia-gallery/rhia5.webp", caption: "Pink, plush, perfect", subtitle: "Hello Kitty wishes she was you", label: "MOMENT 05" },
  { id: "p-6", type: "photo", src: "/rhia-gallery/rhia3.webp", caption: "Heart-stopper", subtitle: "I forget how to breathe, every time", label: "MOMENT 06" },
  { id: "v-1", type: "video", src: "/videos/vid1.mp4", thumb: "/videos/thumb1.jpg", caption: "Giggles on loop", subtitle: "Dec 29, 2025 — caught mid-laugh", label: "DEC 2025" },
  { id: "v-2", type: "video", src: "/videos/vid2.mp4", thumb: "/videos/thumb2.jpg", caption: "Just us, unfiltered", subtitle: "Jan 28, 2026 — favorite kind of chaos", label: "JAN 2026" },
  { id: "v-3", type: "video", src: "/videos/vid3.mp4", thumb: "/videos/thumb3.jpg", caption: "Replay-worthy", subtitle: "The clip I keep coming back to", label: "CLIP 03" },
  { id: "v-4", type: "video", src: "/videos/vid4.mp4", thumb: "/videos/thumb4.jpg", caption: "Blanket fortress", subtitle: "Dec 1, 2025 — softest evening", label: "DEC 2025" },
];

// Backwards-compat (the floating-grid component still imports this).
export const GALLERY_PHOTOS = GALLERY_ITEMS.filter((i) => i.type === "photo");
