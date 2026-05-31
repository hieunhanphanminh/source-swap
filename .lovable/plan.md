## Why you only see blue

When you click the **GALLERY** tile, the camera flies to `y ≈ -39` (set in `src/components/portfolio/experience/gallery/index.tsx`) so the carousel tiles can sit in front of it. But the rest of the "world" in that portal is anchored near the origin:

- `Wanderer` is placed at `(0, -1, -1)` — ~38 units **above** the new camera position, so it's completely out of frame.
- The scene has no ground plane, no sky/stars, no environment map — just an ambient light and a light fog (`#e6ecf2`, near→far 18→60).
- The portal's background color from `GridTile` (`#d6c0c8`) plus the fog is what fills the frame — that's the flat blue/grey you're seeing.

Compare with the Projects / Dreams portals, which either move the camera less or place their props at the same y as the carousel, so the world actually shows up.

## Fix plan (visual only, no behavior change)

**File: `src/components/portfolio/experience/gallery/index.tsx`**

1. **Move the world to the camera, not the other way around.** Wrap `Wanderer` (and the new ground/sky) in a `<group position={[0, -40, 0]}>` so they sit at the same y as the focused camera (`y = -39`). Keep the carousel where it is — it already works.
2. **Add a ground plane** (large `planeGeometry`, soft neutral material, rotated `-Math.PI/2`) beneath the carousel for depth reference.
3. **Add atmosphere**: a `Sparkles` field and a soft hemisphere or directional light so the wanderer and tiles aren't flat-lit. Optionally a low-res `Environment preset="dawn"` for subtle reflections.
4. **Tune the fog** from `["#e6ecf2", 18, 60]` to a warmer near/far that matches the dawn palette (e.g. `["#d8c9b8", 22, 70]`) so the horizon reads as sky rather than as the portal's flat background.
5. **Reposition Wanderer** within the new group to `(3, 0, -6)` and slightly rotated so it stands beside the arc instead of overlapping the tiles.

**No changes** to:
- `GridTile` (portal mechanics, hover, escape) — works correctly.
- The carousel logic, lightbox, or scroll/portal stores.
- Other portals (Dreams, Projects, Work, Letter).

## Verification

After the change, opening the GALLERY portal should show the wanderer silhouette on a faint horizon with sparkles, the arc of tiles in front, and fog blending into a warm sky — not a flat blue wall.
