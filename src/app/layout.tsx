import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
});

/**
 * Runs synchronously before first paint: resolve the stored (or system)
 * theme onto `<html data-theme>`, so there is no dark flash in light mode.
 * Kept inline and dependency-free for that reason.
 */
const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem("bahngebot:theme");var t=s==="light"||s==="dark"?s:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="dark";}})();`;

export const metadata: Metadata = {
  title: "bahngebot — Rail fares, distilled",
  description:
    "A quieter way to find Deutsche Bahn Sparpreis fares. Compare routes, flexible dates and hidden connections across the network.",
};

export const viewport: Viewport = {
  themeColor: "#0B0E14",
};

/**
 * Root layout is deliberately backdrop-free: each route mounts its own
 * atmosphere (photo on the landing page, ambient glow on results/explorer).
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="relative min-h-dvh overflow-x-hidden bg-canvas font-sans text-fg">
        <div className="relative z-10 flex min-h-dvh flex-col">{children}</div>
      </body>
    </html>
  );
}
