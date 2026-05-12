# Gallery Scene: Clean Up + 360° + Overhead Aurora

## 1. Remove the current aurora from the 3D background

The pink/purple drifting planes currently sit *behind/under* the carousel and read as a washed-out gray haze in the screenshot. Strip them out as a first pass.

- `src/components/portfolio/experience/gallery/index.tsx`
  - Remove the `<Aurora />` block and its `Suspense` wrapper.
  - Remove the `import Aurora from "../../models/Aurora"` line.
- Leave `src/components/portfolio/models/Aurora.tsx` and `src/stores/auroraStore.ts` in place — we'll re-import a reconfigured version in step 3.

## 2. Extend the gallery to a full 360° ring

In `GalleryCarousel` (`src/components/portfolio/experience/gallery/index.tsx`):

- Change `const fov = Math.PI;` → `const fov = Math.PI * 2;` so the 10 tiles distribute evenly around the full circle.
- Keep `distance = 13`. With 10 tiles the angular spacing becomes 36° — comfortable to view as you pan.
- The existing math (`x = -d·cos(angle)`, `z = -d·sin(angle)`, `rotY = π/2 − angle`) already produces tiles facing inward, so no further changes are needed.
- Outer wrapper `<group rotation={[0, -Math.PI / 12, 0]}>` stays so the first tile lands slightly to the left of the camera's forward axis (matches current "starting view").
- Mobile `TouchPanControls` already lets users rotate; on desktop the existing pointer-driven `camera.rotation.y` lerp in `Gallery` lets the user look around — we'll widen its range from `π/4` to `π` so the user can sweep the full ring with mouse movement.

## 3. Re-introduce aurora as overhead curtains on a black sky

### 3a. Black sky inside the gallery portal

In `src/components/portfolio/experience/gallery/index.tsx`, inside the `Gallery` component:

- Add a `useThree()` ref to the scene and, in an effect that watches `isActive`, set `scene.background = new THREE.Color(0x000000)` while active and restore the previous background on cleanup. This keeps the hero/other scenes untouched.
- Optionally lower `ambientLight` intensity (0.55 → 0.35) so the black reads deeper without crushing the tiles.

### 3b. Re-position aurora layers as tall vertical curtains overhead

Update `DEFAULT_LAYERS` in `src/stores/auroraStore.ts` so the planes:
- Sit **above** the camera (current camera y while active is `-39`; new y range roughly `-30` → `-22`, i.e. 9–17 units above the viewer).
- Are **tall and narrow** (vertical curtains): swap scales like `[22, 11, 1]` → `[10, 28, 1]`, `[14, 7, 1]` → `[8, 22, 1]`, etc.
- Wrap around the ring at varied `z` so curtains appear in every direction as the user pans 360°.
- Keep their original baked colors (Aurora.tsx already renders with `color: 0xffffff` + the texture).

Example replacement set (6 curtains spaced around the ring):

```text
{ pos: [ 0,   -22, -14], scale: [10, 28, 1], opacity: 0.65 }
{ pos: [ 12,  -24,  -6], scale: [ 9, 24, 1], opacity: 0.55 }
{ pos: [ 14,  -26,   8], scale: [ 9, 26, 1], opacity: 0.5  }
{ pos: [ 0,   -22,  14], scale: [10, 30, 1], opacity: 0.6  }
{ pos: [-14,  -26,   8], scale: [ 9, 26, 1], opacity: 0.55 }
{ pos: [-12,  -24,  -6], scale: [ 9, 24, 1], opacity: 0.5  }
```

(`speed`/`color` fields stay; they're unused by the static Aurora material but kept for type compatibility.)

### 3c. Re-add `<Aurora />` to the gallery scene

Put the `<Suspense fallback={null}><Aurora /></Suspense>` block back in `Gallery`, but render it **after** the lights so its `renderOrder = -1 - i` still keeps it visually layered as a backdrop relative to the tiles. With the new positions it will appear as standing curtains overhead instead of a low gray haze.

## QA checklist

- Open `/` → scroll into the gallery section: tiles wrap all the way around the camera, no gray haze visible at the bottom.
- Click the gallery portal: background goes black, aurora curtains appear standing overhead around the ring; the wanderer + tiles remain readable.
- Pan with mouse / touch: curtains visible in every direction, no obvious seams.
- Exit portal: previous background is restored; hero scene still shows its original clouds.

No other scenes (hero, timeline, dreams, letter, reasons) are touched.
