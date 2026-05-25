import { createFileRoute } from "@tanstack/react-router";
import GalleryPage from "@/pages/GalleryPage";
import { getRequestOrigin } from "@/lib/origin.functions";

export const Route = createFileRoute("/gallery")({
  loader: async () => {
    const origin = await getRequestOrigin();
    return { origin };
  },
  head: ({ loaderData }) => {
    const origin = loaderData?.origin ?? "";
    const ogImage = origin ? `${origin}/og/gallery-og.jpg` : "/og/gallery-og.jpg";
    return {
      meta: [
        { title: "Ten Reasons — A Confession in Ten Parts" },
        { name: "description", content: "Ten cinematic reasons, scored like a director's reel, for Rhia." },
        { property: "og:title", content: "Ten Reasons — Love Rhia" },
        { property: "og:description", content: "A confession in ten parts, frame by frame." },
        { property: "og:image", content: ogImage },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "/gallery" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: "/gallery" },
      ],
    };
  },
  component: GalleryPage,
});
