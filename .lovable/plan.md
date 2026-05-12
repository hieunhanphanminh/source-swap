## Romantic Gallery 3D Background

Make the gallery portal feel like a love-letter sky: pitch-black void, more aurora curtains in romantic pink/rose/magenta, and a constellation of floating hearts drifting around the carousel.

### Changes

**1. Black background (already in place, reinforce)**
`src/components/portfolio/experience/gallery/index.tsx` already swaps `scene.background` to `0x000000` while the gallery portal is active. Also set `scene.fog = null` during this window so curtains read crisply against the void.

**2. Expand aurora ring (`src/stores/auroraStore.ts`)**
Grow `DEFAULT_LAYERS` from 6 → 12 curtains arranged in a full ring overhead. Taller/wider scales (~`[11, 32, 1]`) and warmer romantic palette:` #ff5d8f`,` #ff9ec7`,` #ffb3d1`,` #c98bff`,` #ff79b0`,` #ffd1e6`. Bump default per-layer opacity to ~0.7 so they pop on black.

**3. Replace bokeh discs with floating hearts (`gallery/index.tsx`)**
Remove the 14 `circleGeometry` bokeh discs. Add a new `FloatingHearts` component (~18 hearts) using a lightweight 2D heart shape — NOT the heavy `HeartMesh` (which uses MeshTransmissionMaterial; too expensive at 18×). Each heart:

- `THREE.Shape` heart extruded with `depth: 0.15`, simple `MeshBasicMaterial` (transparent, additive blend) in rose/pink tones
- Distributed in a wide ring (radius 14–22) at varied heights around the camera's gallery position (y ≈ -39)
- Gentle bob/spin via `useFrame` (skip if `useReducedMotion`)
- Sizes 0.4–1.1, opacities 0.35–0.7

**4. Soft heart glow sprites**
Add ~8 additive billboard sprites (radial-gradient CanvasTexture, pink) behind the hearts for bloom-like halos. Cheap — single shared texture.

**5. Lighting tweak**
Slightly dim ambient (`0.35` → `0.25`) and warm the rim point lights so the black sky reads darker and the aurora is the hero.

### Out of scope

Tile sizing, carousel layout, lightbox, hero/other portals, AuroraDebugPanel logic. No new textures downloaded — hearts are procedural geometry, halo is a generated CanvasTexture.

### Technical notes

- Reuse a single shared heart `ExtrudeGeometry` and a single shared halo `CanvasTexture` across all instances to keep draw cost low.
- All new code is presentation-only inside `src/components/portfolio/experience/gallery/` plus the aurora layer constant.
- Respects `useReducedMotion` for animation.

Estimated cost: well under the 15-credit budget.