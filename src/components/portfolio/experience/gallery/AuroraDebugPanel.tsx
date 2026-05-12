import { useAuroraStore } from "@/stores/auroraStore";
import { usePortalStore } from "@/stores";

/**
 * Floating HTML overlay (rendered outside the Canvas) that lets you tweak
 * aurora opacity, speed, and per-layer color/opacity/speed in real time.
 * Only visible while the Gallery portal is active.
 */
const AuroraDebugPanel = () => {
  const isGallery = usePortalStore((s) => s.activePortalId === "gallery");
  const { layers, globalOpacity, globalSpeed, panelOpen } = useAuroraStore();
  const { setLayer, setGlobalOpacity, setGlobalSpeed, togglePanel, reset } = useAuroraStore();

  if (!isGallery) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 50,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        color: "#fff",
      }}
    >
      <button
        onClick={togglePanel}
        aria-label="Toggle aurora debug panel"
        style={{
          background: "rgba(20,8,30,0.7)",
          border: "1px solid rgba(255,150,200,0.4)",
          color: "#ffd1e6",
          padding: "6px 10px",
          borderRadius: 8,
          cursor: "pointer",
          backdropFilter: "blur(8px)",
        }}
      >
        {panelOpen ? "✕ Aurora" : "✦ Aurora"}
      </button>

      {panelOpen && (
        <div
          style={{
            marginTop: 8,
            width: 280,
            maxHeight: "70vh",
            overflowY: "auto",
            background: "rgba(20,8,30,0.85)",
            border: "1px solid rgba(255,150,200,0.3)",
            borderRadius: 10,
            padding: 12,
            backdropFilter: "blur(10px)",
          }}
        >
          <Row label={`Global opacity ${globalOpacity.toFixed(2)}`}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={globalOpacity}
              onChange={(e) => setGlobalOpacity(parseFloat(e.target.value))}
              style={{ width: "100%" }}
            />
          </Row>
          <Row label={`Global speed ${globalSpeed.toFixed(2)}`}>
            <input
              type="range"
              min={0}
              max={4}
              step={0.05}
              value={globalSpeed}
              onChange={(e) => setGlobalSpeed(parseFloat(e.target.value))}
              style={{ width: "100%" }}
            />
          </Row>

          <hr style={{ border: 0, borderTop: "1px solid rgba(255,150,200,0.2)", margin: "10px 0" }} />

          {layers.map((l, i) => (
            <fieldset
              key={i}
              style={{
                border: "1px solid rgba(255,150,200,0.15)",
                borderRadius: 6,
                padding: 8,
                marginBottom: 8,
              }}
            >
              <legend style={{ padding: "0 6px", color: "#ffb3d1" }}>Layer {i + 1}</legend>
              <Row label={`Opacity ${l.opacity.toFixed(2)}`}>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={l.opacity}
                  onChange={(e) => setLayer(i, { opacity: parseFloat(e.target.value) })}
                  style={{ width: "100%" }}
                />
              </Row>
              <Row label={`Speed ${l.speed.toFixed(2)}`}>
                <input
                  type="range"
                  min={0}
                  max={0.5}
                  step={0.005}
                  value={l.speed}
                  onChange={(e) => setLayer(i, { speed: parseFloat(e.target.value) })}
                  style={{ width: "100%" }}
                />
              </Row>
              <Row label="Color">
                <input
                  type="color"
                  value={l.color}
                  onChange={(e) => setLayer(i, { color: e.target.value })}
                  aria-label={`Layer ${i + 1} color`}
                />
              </Row>
            </fieldset>
          ))}

          <button
            onClick={reset}
            style={{
              marginTop: 4,
              width: "100%",
              padding: "6px 8px",
              borderRadius: 6,
              border: "1px solid rgba(255,150,200,0.3)",
              background: "transparent",
              color: "#ffd1e6",
              cursor: "pointer",
            }}
          >
            Reset to defaults
          </button>
        </div>
      )}
    </div>
  );
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label style={{ display: "block", marginBottom: 6 }}>
    <span style={{ display: "block", marginBottom: 2, color: "#ffd1e6" }}>{label}</span>
    {children}
  </label>
);

export default AuroraDebugPanel;
