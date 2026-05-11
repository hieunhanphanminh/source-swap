import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

const PortfolioScene = lazy(() => import("@/components/portfolio/PortfolioScene"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "For you, Rhia ✌️" },
      { name: "description", content: "A 3D love letter — for Rhia." },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-black text-white">
        <span className="text-sm tracking-widest opacity-70">LOADING…</span>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="h-[100dvh] w-full flex items-center justify-center bg-black text-white">
          <span className="text-sm tracking-widest opacity-70">LOADING…</span>
        </div>
      }
    >
      <PortfolioScene />
    </Suspense>
  );
}
