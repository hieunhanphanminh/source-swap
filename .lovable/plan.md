## Goal
Stop the gallery tile previews from looking squished/stretched by sizing each tile to its media's natural aspect ratio instead of a single fixed 4.2 × 2.6 plane.

## Changes (single file: `src/components/portfolio/experience/gallery/GalleryTile.tsx`)

1. **Per-tile dimensions from texture**
   - Drop the hard-coded `TILE_W = 4.2`, `TILE_H = 2.6`.
   - Pick a target diagonal/area (e.g. fixed height `H = 2.8`, max width `W_MAX = 4.6`, min width `W_MIN = 2.4`).
   - On texture load, read `tex.image.width / tex.image.height`. Compute:
     - `width = clamp(H * aspect, W_MIN, W_MAX)`
     - `height = width / aspect` (so portrait shots get a tall narrow tile, landscape shots a wide one — neither distorted).
   - Store `[w, h]` in component state so the planeGeometry, edges, caption/badge offsets, and hover scale all use it.

2. **Reposition labels relative to new size**
   - Caption anchor: `[-w/2 + 0.1, -h/2 - 0.1, 0.05]`
   - Subtitle: `[-w/2 + 0.1, -h/2 - 0.45, 0.05]`
   - Date badge: `[-w/2 + 0.55, h/2 + 0.18, 0.01]`
   - PLAY badge: `[w/2 - 0.55, h/2 + 0.18, 0.05]`
   - Update the GSAP hover tween targets to use the new y values.

3. **Carousel spacing safety (only if needed)**
   - With 10 tiles spread across the full 360° ring at `distance = 13`, arc spacing ≈ 8.16 units, so `W_MAX = 4.6` leaves a clear gap. No change needed in `gallery/index.tsx`.

4. **Video tiles**
   - Use the poster texture's aspect for sizing (videos swap in on hover but keep the same plane size, so no jump).

## Out of scope
Lightbox sizing, carousel radius, aurora, and 360° distribution — all unchanged.
