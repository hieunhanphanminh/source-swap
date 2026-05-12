import { useEffect } from "react";
import { useGalleryLightboxStore } from "@/stores/galleryLightboxStore";

const GalleryLightbox = () => {
  const item = useGalleryLightboxStore((s) => s.item);
  const close = useGalleryLightboxStore((s) => s.close);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, close]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.caption}
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(8, 4, 14, 0.92)",
        backdropFilter: "blur(14px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4vh 4vw",
        cursor: "zoom-out",
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        aria-label="Close"
        style={{
          position: "absolute",
          top: 20,
          right: 24,
          background: "rgba(255,255,255,0.08)",
          color: "#fff",
          border: "1px solid rgba(255,193,214,0.4)",
          borderRadius: 999,
          width: 44,
          height: 44,
          fontSize: 22,
          cursor: "pointer",
        }}
      >
        ×
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "min(1100px, 92vw)",
          maxHeight: "78vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "default",
        }}
      >
        {item.type === "photo" ? (
          <img
            src={item.src}
            alt={item.caption}
            style={{
              maxWidth: "100%",
              maxHeight: "78vh",
              objectFit: "contain",
              borderRadius: 12,
              boxShadow: "0 30px 80px rgba(255, 93, 143, 0.25)",
            }}
          />
        ) : (
          <video
            src={item.src}
            poster={item.thumb}
            autoPlay
            controls
            playsInline
            loop
            style={{
              maxWidth: "100%",
              maxHeight: "78vh",
              borderRadius: 12,
              boxShadow: "0 30px 80px rgba(255, 93, 143, 0.25)",
            }}
          />
        )}
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          marginTop: 22,
          textAlign: "center",
          color: "#fff",
          maxWidth: "min(800px, 92vw)",
          cursor: "default",
        }}
      >
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 11,
            letterSpacing: "0.45em",
            color: "#ffb3d1",
            marginBottom: 10,
          }}
        >
          {item.label}
        </div>
        <h2
          style={{
            fontFamily: "'Soria', 'Fraunces', serif",
            fontSize: "clamp(1.6rem, 3.2vw, 2.6rem)",
            lineHeight: 1.1,
            margin: 0,
            color: "#fff5f5",
          }}
        >
          {item.caption}
        </h2>
        <p
          style={{
            marginTop: 10,
            fontFamily: "'Fraunces', serif",
            fontStyle: "italic",
            fontSize: "clamp(0.95rem, 1.4vw, 1.15rem)",
            color: "#ffd1dc",
          }}
        >
          {item.subtitle}
        </p>
      </div>
    </div>
  );
};

export default GalleryLightbox;
