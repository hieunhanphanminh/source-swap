## Goal
Replace the Wanderer 3D model in the gallery scene with the uploaded `encounter.glb`, and tone down its colors so it blends into the romantic plum/pink atmosphere (lower contrast, softer palette).

## Steps

1. **Add the asset**
   - Copy `user-uploads://encounter.glb` → `public/models/encounter.glb` so `useGLTF('models/encounter.glb')` can load it (same convention as `wanderer_above_the_sea_of_fog.glb`).

2. **Create `src/components/portfolio/models/Encounter.tsx`**
   - Generic loader using `useGLTF` + `useMemo` to clone the scene (so recoloring doesn't mutate the cached GLTF).
   - Traverse all meshes; for each material:
     - Soften `color` by mixing with a warm pink mid-tone (`#f1c6d6`, mix factor ~0.45) — this compresses the dynamic range so highlights/shadows stop clashing with the deep plum sky.
     - Clamp `emissive` and `emissiveIntensity` (mix toward `#3a1430` * 0.2) so any glowing parts don't blow out against the aurora.
     - Set `roughness` ≈ 0.85, `metalness` ≈ 0.1 (if PBR), and `toneMapped = true`.
     - Reduce overall brightness via `color.multiplyScalar(0.85)`.
   - Accept the same props shape as `Wanderer` (`position`, `rotation`, `scale`) so the swap is one-line.
   - Call `useGLTF.preload('models/encounter.glb')`.

3. **Swap in the gallery scene** (`src/components/portfolio/experience/gallery/index.tsx`)
   - Remove the `Wanderer` import + JSX block.
   - Render `<Encounter />` in the same position/rotation/scale slot. Other gallery pieces (Aurora, clouds, sakura, hearts, tiles, lights) stay untouched.
   - Leave `Wanderer` available for the other scenes (Projects, Reasons) — only the gallery is changed.

4. **Optional preloading**
   - Add `Encounter` to `src/components/portfolio/common/Preloader.tsx` alongside the existing models so the gallery doesn't pop in.

## Notes
- All edits stay frontend/presentation; no store, route, or data changes.
- Recoloring is done at runtime via material mutation on a cloned scene — the original `.glb` is untouched, so we can tune the mix factor quickly if it still looks too punchy.
- If the model turns out to use `MeshBasicMaterial` (unlit, like Wanderer), we'll fall back to just `color.lerp(pink, 0.45).multiplyScalar(0.85)` since basic materials ignore roughness/emissive.
