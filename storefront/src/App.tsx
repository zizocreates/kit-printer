// The app shell: router, layout, smooth scroll on desktop only, and one MotionConfig that honours reduced motion.
import { useEffect, useState } from "react";
import { createBrowserRouter, Outlet, RouterProvider, useLocation, useNavigationType } from "react-router";
import { MotionConfig } from "motion/react";
import { CartProvider } from "./lib/cart";
import { AnnouncementBar } from "./components/AnnouncementBar";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { Home } from "./routes/Home";
import { Collection } from "./routes/Collection";
import { Product } from "./routes/Product";
import { HowItsBuilt } from "./routes/HowItsBuilt";
import { NotFound } from "./routes/NotFound";

function useSmoothScroll() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;
    let stop = () => {};
    import("lenis").then(({ default: Lenis }) => {
      const lenis = new Lenis({ lerp: 0.12 });
      let raf = 0;
      const tick = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
      stop = () => { cancelAnimationFrame(raf); lenis.destroy(); };
    });
    return () => stop();
  }, []);
}

// New page, top of the page. Back and forward are left to the browser. (React Router's ScrollRestoration keys a
// fresh load as "default", so it carried one page's scroll into the next fresh visit.)
function useScrollToTop() {
  const { pathname } = useLocation();
  const type = useNavigationType();
  useEffect(() => { if (type !== "POP") window.scrollTo(0, 0); }, [pathname, type]);
}

function Layout() {
  useSmoothScroll();
  useScrollToTop();
  return (
    <MotionConfig reducedMotion="user">
      <CartProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
          Skip to content
        </a>
        <AnnouncementBar />
        <Header />
        <main id="main" className="min-h-[70vh]">
          <Outlet />
        </main>
        <Footer />
        <CartDrawer />
      </CartProvider>
    </MotionConfig>
  );
}

export const routes = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "kits", element: <Collection /> },
      { path: "kits/:handle", element: <Product /> },
      { path: "how-its-built", element: <HowItsBuilt /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];

export function App() {
  const [router] = useState(() => createBrowserRouter(routes));
  return <RouterProvider router={router} />;
}
