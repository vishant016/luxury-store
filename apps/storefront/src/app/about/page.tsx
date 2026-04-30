import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Desire",
  description:
    "Our story — timeless craftsmanship and curated luxury for the discerning.",
};


export default function AboutPage() {
  return (
    <section className="py-24 px-6 md:px-12 bg-cream">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <p className="text-[10px] tracking-[0.5em] uppercase text-muted mb-4 font-sans">
          Our Story
        </p>
        <h1 className="text-4xl md:text-5xl font-serif font-normal tracking-tight text-charcoal mb-6">
          About Desire
        </h1>
        <div className="mx-auto w-12 h-px bg-gold" />
      </div>

      <div className="max-w-2xl mx-auto space-y-6 text-sm leading-relaxed text-muted font-sans">
        <p>
          Desire brings together enduring silhouettes and considered materials —
          garments made to last beyond the season, with the quiet confidence of true
          craft.
        </p>
        <p>
          We curate small collections focused on proportion, tactility, and
          everyday versatility. Each piece reflects a belief that luxury is spare,
          deliberate, and never loud.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mt-16 text-center">
        <Link
          href="/shop"
          className="inline-block border border-charcoal px-10 py-4 text-[10px] tracking-[0.35em] uppercase text-charcoal font-sans transition-colors duration-500 hover:bg-charcoal hover:text-cream"
        >
          Shop the Collection
        </Link>
      </div>
    </section>
  );
}
