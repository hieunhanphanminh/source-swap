import { useEffect, useRef, useState } from "react";
import { usePortalStore } from "@/stores";
import { useGalleryLightboxStore } from "@/stores/galleryLightboxStore";
import { GALLERY_ITEMS } from "@/constants/gallery";

const GalleryScrollRow = () => {
  const isActive = usePortalStore((s) => s.activePortalId === "gallery");
  const open = useGalleryLightboxStore((s) => s.open);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // Reset scroll on activation
  useEffect(() => {
    if (isActive && scrollerRef.current) scrollerRef.current.scrollLeft = 0;
  }, [isActive]);

  // Convert vertical wheel to horizontal scroll inside the row
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !isActive) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center pointer-events-none"
      style={{ paddingTop: "8vh", paddingBottom: "8vh" }}
    >
      <div
        ref={scrollerRef}
        className="pointer-events-auto w-full h-full overflow-x-auto overflow-y-hidden flex items-center gap-6 px-[10vw] snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <style>{`
          .gallery-scroll-row::-webkit-scrollbar { display: none; }
        `}</style>
        {GALLERY_ITEMS.map((item, i) => {
          const isHover = hoverIdx === i;
          return (
            <button
              key={item.id}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              onClick={() => open(item)}
              className="snap-center shrink-0 group relative flex flex-col items-start gap-3 outline-none"
              style={{
                width: "min(70vw, 520px)",
                transition: "transform 400ms cubic-bezier(0.23,1,0.32,1)",
                transform: isHover ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
              }}
            >
              <div
                className="font-mono text-[10px] tracking-[0.4em] uppercase"
                style={{ color: "#ffd1dc", opacity: 0.85 }}
              >
                {item.label}
              </div>
              <div
                className="relative w-full overflow-hidden rounded-sm"
                style={{
                  aspectRatio: "4 / 5",
                  boxShadow: isHover
                    ? "0 30px 80px -20px rgba(255, 93, 143, 0.45), 0 0 0 1px rgba(255, 225, 233, 0.4)"
                    : "0 18px 50px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255, 225, 233, 0.2)",
                  transition: "box-shadow 400ms ease",
                }}
              >
                {item.type === "photo" ? (
                  <img
                    src={item.src}
                    alt={item.caption}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    style={{
                      transition: "transform 700ms cubic-bezier(0.23,1,0.32,1)",
                      transform: isHover ? "scale(1.06)" : "scale(1)",
                    }}
                  />
                ) : (
                  <>
                    <img
                      src={item.thumb || item.src}
                      alt={item.caption}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      style={{
                        transition: "transform 700ms cubic-bezier(0.23,1,0.32,1)",
                        transform: isHover ? "scale(1.06)" : "scale(1)",
                      }}
                    />
                    <div
                      className="absolute top-3 right-3 px-2 py-1 text-[10px] tracking-[0.3em] font-mono"
                      style={{
                        background: "#ff5d8f",
                        color: "white",
                        borderRadius: 2,
                      }}
                    >
                      ▶ PLAY
                    </div>
                  </>
                )}
              </div>
              <div className="text-left">
                <div
                  style={{
                    fontFamily: "'Fraunces', serif",
                    color: "#fff5f5",
                    fontSize: "1.4rem",
                    lineHeight: 1.1,
                  }}
                >
                  {item.caption}
                </div>
                <div
                  className="mt-1 text-xs"
                  style={{
                    color: "#ffd1dc",
                    opacity: isHover ? 1 : 0.7,
                    transition: "opacity 300ms ease",
                  }}
                >
                  {item.subtitle}
                </div>
              </div>
            </button>
          );
        })}
        <div className="shrink-0" style={{ width: "10vw" }} />
      </div>
    </div>
  );
};

export default GalleryScrollRow;
