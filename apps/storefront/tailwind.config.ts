import type { Config } from "tailwindcss";

/**
 * Tailwind v4: design tokens live in `src/app/globals.css` (`@theme inline`).
 * This file declares content paths for tooling; extend here if you add plugins.
 *
 * Fonts: `--font-geist-sans`, `--font-playfair` via `layout.tsx`.
 * Palette: cream, charcoal, gold, ivory, stone, muted.
 */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
} satisfies Config;
