import { createFileRoute } from "@tanstack/react-router";
import ReasonsPage from "@/pages/ReasonsPage";

export const Route = createFileRoute("/reasons")({
  head: () => ({
    meta: [
      { title: "The Most Beautiful Girl — A Reel for Rhia" },
      { name: "description", content: "An interactive flip-card reel of photos and clips of Rhia." },
      { property: "og:title", content: "The Most Beautiful Girl — Love Rhia" },
      { property: "og:description", content: "Frames and clips, flipped open like little love notes." },
    ],
  }),
  component: ReasonsPage,
});
