import { createFileRoute } from "@tanstack/react-router";
import ReasonsPage from "@/pages/ReasonsPage";
import { getRequestOrigin } from "@/lib/origin.functions";

export const Route = createFileRoute("/reasons")({
  loader: async () => {
    const origin = await getRequestOrigin();
    return { origin };
  },
  head: ({ loaderData }) => {
    const origin = loaderData?.origin ?? "";
    const ogImage = origin ? `${origin}/og/reasons-og.jpg` : "/og/reasons-og.jpg";
    return {
      meta: [
        { title: "The Most Beautiful Girl — A Reel for Rhia" },
        { name: "description", content: "An interactive flip-card reel of photos and clips of Rhia." },
        { property: "og:title", content: "The Most Beautiful Girl — Love Rhia" },
        { property: "og:description", content: "Frames and clips, flipped open like little love notes." },
        { property: "og:image", content: ogImage },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "/reasons" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: "/reasons" },
      ],
    };
  },
  component: ReasonsPage,
});
