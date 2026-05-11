import { createFileRoute } from "@tanstack/react-router";
import GalleryPage from "@/pages/GalleryPage";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Photo Gallery — The Most Beautiful Girl" },
      { name: "description", content: "An immersive cinematic gallery for Rhia." },
      { property: "og:title", content: "Photo Gallery — Love Rhia" },
      { property: "og:description", content: "An immersive cinematic gallery." },
    ],
  }),
  component: GalleryPage,
});
