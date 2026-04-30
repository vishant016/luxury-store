"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export type HeroBannerProps = {
  title?: string;
  eyebrow?: string;
  imageSrc?: string;
  videoSrc?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80";

export default function HeroBanner({
  eyebrow = "Spring / Summer 2026",
  title = "The Art of\nRefined Living",
  imageSrc = DEFAULT_IMAGE,
  videoSrc,
  ctaHref = "/shop",
  ctaLabel = "Shop the Collection",
}: HeroBannerProps) {
  return (
    <section className="relative h-screen min-h-[32rem] flex items-center justify-center overflow-hidden bg-charcoal">
      {/* Video or image background. */}
      {videoSrc ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={imageSrc}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${imageSrc})` }}
        />
      )}

      {/* Subtle editorial overlay */}
      <div className="absolute inset-0 bg-black/42" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
          className="mb-10 font-sans text-[10px] tracking-[0.55em] text-white/72 uppercase"
        >
          {eyebrow}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: "easeOut" }}
          className="font-serif text-5xl leading-[1.06] tracking-tight text-white md:text-6xl lg:text-[4.25rem]"
        >
          {(() => {
            const lines = title.split("\n");
            return lines.map((line, i) => (
              <span key={i} className="block">
                {i === 0 ? (
                  line
                ) : (
                  <span className="italic font-normal text-white/96">{line}</span>
                )}
              </span>
            ));
          })()}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.65, ease: "easeOut" }}
          className="mt-10 max-w-lg font-sans text-sm font-light leading-relaxed text-white/78 md:text-base"
        >
          Timeless silhouettes, quiet luxury, and craft you can feel — curated
          for those who dress with intention.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.9, ease: "easeOut" }}
          className="mt-14"
        >
          <Link
            href={ctaHref}
            className="inline-block border border-white/85 bg-white/5 px-14 py-4 font-sans text-[10px] tracking-[0.38em] text-white uppercase backdrop-blur-[2px] transition-all duration-[650ms] ease-in-out hover:border-white hover:bg-white hover:text-charcoal"
          >
            {ctaLabel}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
