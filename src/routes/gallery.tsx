import { createFileRoute } from "@tanstack/react-router";
import GalleryPage from "@/pages/GalleryPage";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Ten Reasons — A Confession in Ten Parts" },
      { name: "description", content: "Ten cinematic reasons, scored like a director's reel, for Rhia." },
      { property: "og:title", content: "Ten Reasons — Love Rhia" },
      { property: "og:description", content: "A confession in ten parts, frame by frame." },
    ],
  }),
  component: GalleryPage,
});
