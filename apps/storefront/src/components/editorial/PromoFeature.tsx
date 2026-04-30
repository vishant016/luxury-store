"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export type PromoFeatureProps = {
  imageLeft?: boolean;
  eyebrow?: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export default function PromoFeature({
  imageLeft = true,
  eyebrow = "Craft & cloth",
  title,
  description,
  imageSrc,
  imageAlt = "",
  ctaHref = "/shop",
  ctaLabel = "Discover",
}: PromoFeatureProps) {
  const imageBlock = (
    <div className="relative min-h-[22rem] w-full overflow-hidden bg-stone md:min-h-[28rem] lg:min-h-[32rem]">
      <Image
        src={imageSrc}
        alt={imageAlt || title}
        fill
        className="object-cover transition-transform duration-[1100ms] ease-in-out hover:scale-[1.02]"
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority={false}
      />
      <div className="pointer-events-none absolute inset-0 bg-charcoal/[0.03]" />
    </div>
  );

  const textBlock = (
    <div className="flex flex-col justify-center bg-ivory px-8 py-20 md:px-16 md:py-28 lg:px-20 lg:py-32">
      <p className="font-sans text-[10px] tracking-[0.45em] text-gold uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-6 font-serif text-3xl leading-tight tracking-tight text-charcoal md:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      <p className="mt-8 max-w-md font-sans text-sm leading-relaxed text-muted md:text-base">
        {description}
      </p>
      <div className="mt-12">
        <Link
          href={ctaHref}
          className="inline-block border border-charcoal bg-transparent px-10 py-3.5 font-sans text-[10px] tracking-[0.32em] text-charcoal uppercase transition-all duration-[600ms] ease-in-out hover:border-gold hover:bg-charcoal hover:text-cream"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );

  return (
    <section className="border-y border-stone/80 bg-ivory">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.95, ease: [0.25, 0.1, 0.25, 1] }}
        className="mx-auto grid max-w-[100rem] grid-cols-1 lg:grid-cols-2"
      >
        {imageLeft ? (
          <>
            {imageBlock}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {imageBlock}
          </>
        )}
      </motion.div>
    </section>
  );
}
