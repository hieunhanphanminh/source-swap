# Remove HeartMesh and textures folder

## Files to delete
- `src/three/HeartMesh.tsx`
- `public/textures/` (contains only `aurora_texture.png`, unused anywhere)

## Files to update
- `src/three/scenes/HeroScene.tsx` — currently imports and renders `<HeartMesh />`. Remove the import, the `heartGroup` ref, the heart-related `useFrame` block that tweens `heartGroup.position.z`/`scale`, and the `<group ref={heartGroup}>…</group>` JSX. Keep lights, Environment, Sparkles, Stars, and the camera pointer/scroll lerp.

## Notes
- No other files reference `HeartMesh` or the textures folder (verified via ripgrep).
- Hero scene will still render its ambient 3D world (lights, sparkles, stars) — just without the central heart object.
