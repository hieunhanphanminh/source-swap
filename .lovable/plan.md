# Swap page content + loosen cinematic spacing

## 1. Swap content between pages

**`src/pages/GalleryPage.tsx`** — keep the cinematic layout (title card + `CinematicShowcase`), but feed it the 10 reasons instead of photos/videos.

- Remove the `PHOTOS` / `VIDEOS` arrays and the `rhia*` image imports.
- Import the `REASONS` array (lift it out of `ReasonsPage.tsx` into a shared module, e.g. `src/constants/reasons.ts`, so both pages — and any future use — share one source of truth).
- Build `panoramaItems` from `REASONS`:
  - `type: "photo"` (no media — the showcase still needs a valid `PanoramaItem`)
  - `src`: a tiny inline SVG / data-URI placeholder OR a neutral gradient image already in `src/assets`
  - `caption`: `reason.back` (the actual reason)
  - `subtitle`: the emoji + a short tag (or leave subtitle blank)
  - `label`: `REASON ${reason.front}`
- Update the hero copy on this page from "The Most Beautiful Girl / Reel · 2025 — 2026" to something that fits the reasons theme (e.g. "Ten Reasons / A Confession In Ten Parts"). Keep the same typographic structure so the cinematic feel is preserved.

Note on visuals: `CinematicShowcase` is image-centric. Since reasons have no image, we'll render a stylized numeral card ("01" … "10") inside the image slot using the existing `glass-card-gold` look — this keeps the cinematic block intact while making the *text* the hero. If you'd rather have full text-only blocks with no image plane, say so and I'll branch `CinematicShowcase` instead.

**`src/pages/ReasonsPage.tsx`** — keep the flip-card grid + particle canvas, but feed it photos/videos instead of reasons.

- Move `PHOTOS` / `VIDEOS` (and the `rhia*` imports) here, or into `src/constants/gallery.ts` for sharing.
- Replace the `REASONS` array usage with a unified photo+video list.
- `FlipCard` is rewritten so:
  - Front face shows the index (`01`…) and a thumbnail (poster for video)
  - Back face shows the `caption` (large, serif) + `subtitle` (italic) — i.e. the "textbox" content
  - Clicking opens the existing `GalleryLightbox` (via `useGalleryLightboxStore`) so videos still play full-screen
- Update the page header copy from "10 Reasons I Love You" → "The Reel" (or similar) to match the new content.

**`src/routes/gallery.tsx` & `src/routes/reasons.tsx`** — update each route's `head()` (title, description, og:title, og:description) so SEO matches the swapped content.

## 2. Loosen the cinematic showcase

In **`src/components/CinematicShowcase.tsx`**:

- Increase block min-height so image + text never overlap on tall variants:
  `minHeight: "clamp(620px, 86vh, 880px)"` → `clamp(820px, 110vh, 1180px)`.
- Increase vertical gaps between blocks:
  `gap-y-32 sm:gap-y-44 md:gap-y-56` → `gap-y-56 sm:gap-y-72 md:gap-y-96`.
- Widen the stage horizontally (so blocks can spread "to 360"):
  `maxWidth: "1200px"` → `maxWidth: "1600px"`, and bump container horizontal padding (`px-4 sm:px-6 md:px-8` → `px-6 sm:px-10 md:px-16`).
- In the `VARIANTS` table, push text columns further from image columns horizontally — bump `txtTop` deltas and reduce `imgW` slightly on the wide-overlap variants (e.g. `imgW: 72` → `64`) so they don't collide with the text column on the new wider stage.
- Audit the per-variant `txtTop` vs `imgTop` so on the widest desktop the text block never visually overlaps the image bounding box (add ~12% vertical separation on the two variants currently flagged in the code where the values are closest).

## 3. Cleanup

- Delete unused `rhia*` imports from whichever file no longer needs them.
- Delete the `Encounter`/heart leftovers? — out of scope, already done in prior turns.
- No backend, route, or schema changes.

## Files touched

- `src/constants/reasons.ts` (new)
- `src/constants/gallery.ts` (extend or new)
- `src/pages/GalleryPage.tsx`
- `src/pages/ReasonsPage.tsx`
- `src/components/CinematicShowcase.tsx`
- `src/routes/gallery.tsx`, `src/routes/reasons.tsx` (head metadata only)

## Open question

Confirm the visual treatment for reasons inside the cinematic blocks: **(a)** keep an "image plane" that's a stylized numeral card, or **(b)** drop the image plane entirely so each reason is a pure typographic editorial block. (a) is faster and preserves the cinematic rhythm; (b) is more "textbox-true" to your request but requires forking the block layout.
