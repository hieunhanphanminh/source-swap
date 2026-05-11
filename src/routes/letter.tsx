import { createFileRoute } from "@tanstack/react-router";
import LoveLetterPage from "@/pages/LoveLetterPage";

export const Route = createFileRoute("/letter")({
  head: () => ({
    meta: [
      { title: "A Love Letter — For You, Rhia" },
      { name: "description", content: "A love letter, written entirely for Rhia Henne." },
      { property: "og:title", content: "A Love Letter — Love Rhia" },
      { property: "og:description", content: "Written entirely for you." },
    ],
  }),
  component: LoveLetterPage,
});
