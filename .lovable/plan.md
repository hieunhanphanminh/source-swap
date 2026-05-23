# Make Gallery match the Reasons section

The "reasons" 3D portal you're comparing against is the `projects` portal (the in-scene one rendered with the Wanderer painting and the curved row of cards in image-17). The gallery currently differs from it in three ways. This plan brings them into alignment.

## 1. Same opening camera framing as reasons

`Gallery` and `Projects` already animate the camera to the same position (`y: -39`, `x: 2`, `z: 11.5`). The reason image-18 looks tilted-up while image-17 looks level is the **carousel layout**, not the camera:

- Reasons (`ProjectsCarousel`): `fov = Math.PI` (180°), fixed `distance = 13`, tiles placed at `y: 1` in a half-arc in front of the camera.
- Gallery (`GalleryCarousel`): `FOV = Math.PI * 2` (full 360°) and a distance derived from tile count, which pushes tiles out and wraps them behind the camera.

Fix: change `GalleryCarousel` in `src/components/portfolio/experience/gallery/index.tsx` to use the same layout math as `ProjectsCarousel`:

- `FOV = Math.PI`, `DISTANCE = 13`, tiles at `y: 1`.
- Keep the existing `BASE_GROUP_ROTATION`, `focusTile` GSAP rotation, and lightbox open behavior — the `angle` math stays the same, only the arc width changes.

No change to the `useEffect` camera tween or `useFrame` pointer lerp — those already mirror the reasons section.

## 2. Remove residual pink/purple from the 3D background

Two sources contribute to the pink/rose haze:

1. `AmbientScene` (`src/three/scenes/AmbientScene.tsx`) is not actually rendered behind the in-scene portals (`PortfolioScene` uses its own canvas), so it does not affect the gallery view — no change needed here.
2. The Wanderer GLB itself has warm pink/rose strokes in the sky (visible in both image-17 and image-18). It is baked into the painting's materials and cannot be "deleted" without editing the model.

Fix: add a subtle scene tint in the gallery group only — a large desaturating fog (`<fog attach="fog" args={["#e6ecf2", 18, 60]} />`) plus a soft cool ambient light. This shifts the warm pinks toward neutral grey-blue without touching the model file. Scoped to the gallery group so the reasons section is unchanged.

If you instead want the pinks fully gone (not just muted), the alternative is to swap the Wanderer model for a different backdrop — say so and I'll propose options.

## 3. Gallery tile styling to match the reason textbox

The reason cards (`ProjectTile`) use: white translucent plane (`color="#FFF"`, `opacity 0.3`), **black** title/subtitle text, and **black** edges. Image-17 shows that look — light glass with dark serif text.

Your message says "text into white *like* the reason textbox." Those two things conflict (the reason textbox uses dark text on a white panel). I'll take the most consistent reading: **mirror the reason tile exactly** — white translucent panel, black text, black edges — so the gallery reads the same way image-17 does. If you actually want white text on a dark panel instead, tell me and I'll flip it.

Changes in `src/components/portfolio/experience/gallery/GalleryTile.tsx`:

- Backdrop plane: `color="#ffffff"`, `opacity 0.3` (was `#0b1220` / 0.55).
- Edges on media plane and badges: `color="black"` (was `#ffffff`).
- Caption text color: `"black"` (was `#f8fafc`).
- Meta/label text color: `"black"` (was `#e2e8f0`).
- Subtitle (hover whisper): `"black"`.
- Date badge plane: `color="#ffffff"`, `opacity 0.3`, black edges.
- PLAY badge: keep dark fill + white text (it's a CTA button, matches the reason "VIEW ↗" button).

## Files touched

- `src/components/portfolio/experience/gallery/index.tsx` — carousel layout constants.
- `src/components/portfolio/experience/gallery/GalleryTile.tsx` — tile colors / edges.

No changes to `AmbientScene`, `ProjectsCarousel`, or the Wanderer model.
