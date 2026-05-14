import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import appCss from "../styles.css?url";
import FloatingNav from "@/components/FloatingNav";
import SplashScreen from "@/components/SplashScreen";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import SceneBackdrop from "@/components/SceneBackdrop";

import MouseSpotlight from "@/components/MouseSpotlight";
import RouteProgress from "@/components/RouteProgress";
import NotFound from "@/pages/NotFound";
import { useReducedMotion } from "@/three/useReducedMotion";
import { useParallax } from "@/hooks/useParallax";

function NotFoundComponent() {
  return <NotFound />;
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. You can try again or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Every Moment With Rhia — A Love Letter In Code" },
      { name: "description", content: "A cinematic love letter, written in code, just for you Rhia Henne." },
      { name: "author", content: "For Rhia Henne" },
      { property: "og:title", content: "Every Moment With Rhia" },
      { property: "og:description", content: "A cinematic love letter, written in code, just for you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function CinematicOutlet() {
  const location = useLocation();
  const reduced = useReducedMotion();
  useParallax();

  // Global scroll-reveal: observes any [data-reveal] element on each route
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => (entry.target as HTMLElement).classList.add("visible"), i * 80);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    const id = requestAnimationFrame(() => {
      document.querySelectorAll("[data-reveal]:not(.visible)").forEach((el) => obs.observe(el));
    });
    return () => { cancelAnimationFrame(id); obs.disconnect(); };
  }, [location.pathname]);

  // Reduced-motion: skip the cinematic 3D transition; just fade.
  const initial = reduced
    ? { opacity: 0 }
    : { opacity: 0, y: 60, scale: 0.96, rotateX: 6, filter: "blur(14px)" };
  const animate = reduced
    ? { opacity: 1 }
    : { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" };
  const exit = reduced
    ? { opacity: 0 }
    : { opacity: 0, y: -40, scale: 1.04, rotateX: -4, filter: "blur(12px)" };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        data-cinematic-root
        className="perspective-shell relative"
        initial={initial}
        animate={animate}
        exit={exit}
        transition={{ duration: reduced ? 0.25 : 0.85, ease: [0.23, 1, 0.32, 1] }}
        style={{ transformStyle: "preserve-3d", zIndex: 10 }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem("splash_shown")) setSplashDone(true);
  }, []);

  // Home page is a full-screen 3D canvas — render bare, without overlays.
  if (location.pathname === "/") {
    return (
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SmoothScrollProvider>
        <div className="scene-void" aria-hidden />
        {mounted && !splashDone ? (
          <SplashScreen onComplete={() => setSplashDone(true)} />
        ) : (
          <>
            <SceneBackdrop />
            <MouseSpotlight />
            <RouteProgress />
            <FloatingNav />
            <CinematicOutlet />
          </>
        )}
      </SmoothScrollProvider>
    </QueryClientProvider>
  );
}

