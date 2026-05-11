import { createFileRoute } from "@tanstack/react-router";
import DreamsPage from "@/pages/DreamsPage";

export const Route = createFileRoute("/dreams")({
  head: () => ({
    meta: [
      { title: "Bucket List — Dreams We'll Make Real" },
      { name: "description", content: "Every dream we'll bring to life, together." },
      { property: "og:title", content: "Bucket List — Love Rhia" },
      { property: "og:description", content: "Dreams we'll make real." },
    ],
  }),
  component: DreamsPage,
});
