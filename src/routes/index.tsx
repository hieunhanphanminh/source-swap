import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Every Moment With Rhia — A Love Letter In Code" },
      { name: "description", content: "A cinematic love letter to Rhia Henne — gallery, timeline, reasons, dreams, and a message written entirely for you." },
      { property: "og:title", content: "Every Moment With Rhia" },
      { property: "og:description", content: "A cinematic love letter, written in code, just for you." },
    ],
  }),
  component: Index,
});
