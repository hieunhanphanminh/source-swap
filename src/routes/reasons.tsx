import { createFileRoute } from "@tanstack/react-router";
import ReasonsPage from "@/pages/ReasonsPage";

export const Route = createFileRoute("/reasons")({
  head: () => ({
    meta: [
      { title: "10 Reasons — Why I Love You, Rhia" },
      { name: "description", content: "Ten reasons, hand-written, for Rhia Henne." },
      { property: "og:title", content: "10 Reasons — Love Rhia" },
      { property: "og:description", content: "Why I love you, Rhia." },
    ],
  }),
  component: ReasonsPage,
});
