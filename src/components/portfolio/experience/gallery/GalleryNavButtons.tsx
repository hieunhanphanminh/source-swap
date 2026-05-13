import { ChevronLeft, ChevronRight } from "lucide-react";
import { stepGallery } from "./GalleryPanControls";

const GalleryNavButtons = () => {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-10 z-40 flex justify-center gap-4">
      <button
        type="button"
        aria-label="Previous"
        onClick={() => stepGallery(-1)}
        className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 hover:scale-105"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => stepGallery(1)}
        className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 hover:scale-105"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
};

export default GalleryNavButtons;
