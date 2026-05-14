## Goal
Make the Encounter Tilt Brush model in the gallery scene the visual centerpiece — keep its painterly character but add depth, glow, sharper textures, gentle motion, and grounding, with a saturated palette that pops against the plum/pink atmosphere.

## Changes

### 1. `src/components/portfolio/models/Encounter.tsx` — material + texture upgrades

- **Pop tint (B2)**: per-brush color treatment in the material cache:
  - `Marker`, `TaperedMarker`, `TaperedFlat`: `color.offsetHSL(0, +0.15, +0.05)` (more saturated, slight lift).
  - `DuctTape`, `Paper`: `color.offsetHSL(0, -0.2, 0)` (desaturate so they recede).
  - `Light`, `LightWire`, `Highlighter`, `SoftHighlighter`, `Splatter`: leave as-is — bloom will handle pop.
- **Fake AO depth (A1)** on non-additive materials via `material.onBeforeCompile`: inject a cheap NdotV rim-darken into the fragment so silhouettes get edge falloff without real lights. Keep additive brushes flat.
- **Crisp textures (D1+D2)**: replace the hard-coded `anisotropy = 4` with `gl.capabilities.getMaxAnisotropy()` (read via `useThree`), set `minFilter = LinearMipmapLinearFilter`, `generateMipmaps = true`.
- **Saturation lift on vertex colors**: in the same `onBeforeCompile`, add `vColor.rgb = mix(vec3(dot(vColor.rgb, vec3(0.3,0.59,0.11))), vColor.rgb, 1.25);` to push saturation ~25%.

### 2. `src/components/portfolio/experience/gallery/index.tsx` — motion + grounding

- **Idle float (E1)**: wrap `<Encounter />` in a ref'd `<group>`; in `useFrame`, animate `position.y = baseY + Math.sin(t * 0.6) * 0.15` and `rotation.y += delta * 0.05`.
- **Contact shadow (F2)**: add `<ContactShadows position={[0, -1.6, -1]} opacity={0.45} scale={6} blur={2.4} far={3} color="#1a0a14" />` from `@react-three/drei` directly under the model.
- Keep cursor-follow camera behavior untouched.

### 3. `src/components/portfolio/PortfolioScene.tsx` — postprocessing bloom (C1)

- Install `@react-three/postprocessing` if not already present (check first).
- Inside the `<Canvas>` tree, mount `<EffectComposer disableNormalPass>` with a `<Bloom>` pass tuned for additive brushes:
  - `intensity={1.1}`, `luminanceThreshold={0.55}`, `luminanceSmoothing={0.25}`, `mipmapBlur`.
- Gate the composer on `activePortalId === "gallery"` so other scenes aren't affected and we don't pay the postprocess cost when not needed.
- Verify `gl` tone mapping stays compatible (already `toneMapped: false` on Encounter materials, so bloom won't double-boost them).

## Technical notes

- Bloom only "sees" pixels above the luminance threshold; since Light/Highlighter/Splatter use `AdditiveBlending` and `toneMapped: false`, they'll naturally clear the threshold and glow, while painted strokes stay grounded.
- `onBeforeCompile` is applied once per cached material — no per-frame cost.
- Contact shadow uses an off-screen render; cheap at this scale (one model, blur 2.4).
- All edits are presentation-only. No store, route, data, or model-source changes. The `.glb` and texture files stay untouched.

## Out of scope (offered earlier, deferred)
- Cel/toon shading (A3), real PBR lighting (A2), fog/vignette/CA (C2/C3), KTX2 compression (D3), parallax tilt + entrance anim (E2/E3), rim-light backdrop (F1).
- Easy to add in a follow-up if the recommended pack still feels short.
