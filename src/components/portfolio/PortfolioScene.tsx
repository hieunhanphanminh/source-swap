import CanvasLoader from "./common/CanvasLoader";
import ScrollWrapper from "./common/ScrollWrapper";
import Experience from "./experience";
import AuroraDebugPanel from "./experience/gallery/AuroraDebugPanel";
import GalleryLightbox from "./experience/gallery/GalleryLightbox";
import Footer from "./footer";
import Hero from "./hero";
import { usePortalStore } from "@/stores";

const A11Y_PORTALS: { id: string; label: string }[] = [
  { id: "work", label: "Open our timeline" },
  { id: "gallery", label: "Open photo gallery" },
  { id: "projects", label: "Open ten reasons I love you" },
  { id: "dreams", label: "Open our dreams bucket list" },
  { id: "letter", label: "Open the love letter" },
];

function A11yPortalControls() {
  const setActivePortal = usePortalStore((s) => s.setActivePortal);
  return (
    <nav
      aria-label="3D scene sections"
      className="sr-only-focusable"
      style={{ position: "fixed", top: 8, left: 8, zIndex: 50 }}
    >
      <ul style={{ display: "flex", gap: 8, padding: 0, margin: 0, listStyle: "none" }}>
        {A11Y_PORTALS.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setActivePortal(p.id)}
              className="a11y-portal-btn"
            >
              {p.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ReadableFallback() {
  return (
    <noscript>
      <div style={{ padding: 24, color: "white", background: "#000", minHeight: "100vh" }}>
        <h1>For you, Rhia</h1>
        <p>This site uses an interactive 3D scene. Please enable JavaScript to view it.</p>
        <ul>
          <li><a href="/timeline" style={{ color: "#ffd9e6" }}>Our timeline</a></li>
          <li><a href="/gallery" style={{ color: "#ffd9e6" }}>Photo gallery</a></li>
          <li><a href="/reasons" style={{ color: "#ffd9e6" }}>Ten reasons I love you</a></li>
          <li><a href="/dreams" style={{ color: "#ffd9e6" }}>Our bucket list</a></li>
          <li><a href="/letter" style={{ color: "#ffd9e6" }}>A love letter</a></li>
        </ul>
      </div>
    </noscript>
  );
}

export default function PortfolioScene() {
  return (
    <>
      <h1 className="sr-only">For you, Rhia — an interactive 3D love letter</h1>
      <A11yPortalControls />
      <ReadableFallback />
      <CanvasLoader>
        <ScrollWrapper>
          <Hero />
          <Experience />
          <Footer />
        </ScrollWrapper>
      </CanvasLoader>
      <AuroraDebugPanel />
      <GalleryLightbox />
      <GalleryNavButtonsGate />
    </>
  );
}

function GalleryNavButtonsGate() {
  const isActive = usePortalStore((s) => s.activePortalId === "gallery");
  if (!isActive) return null;
  return <GalleryNavButtons />;
}
