import { createFileRoute } from "@tanstack/react-router";
import TimelinePage from "@/pages/TimelinePage";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Our Timeline — Every Milestone of Our Story" },
      { name: "description", content: "A cinematic walkthrough of every milestone since we met on Valorant." },
      { property: "og:title", content: "Our Timeline — Love Rhia" },
      { property: "og:description", content: "Every milestone of our story." },
    ],
  }),
  component: TimelinePage,
});
