"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  type Product,
  formatPrice,
  getLowestDisplayPrice,
} from "@/lib/medusa";

interface ProductCardProps {
  product: Product;
  index?: number;
  staticEntry?: boolean;
  /** Tighter tile for featured sidebar / dense grids */
  density?: "default" | "compact";
}

/**
 * Editorial product tile: framed image, quiet type, price as micro-label.
 * Pattern inspired by boutique PLP presentation (not copyrighted assets).
 */
export default function ProductCard({
  product,
  staticEntry = false,
  density = "default",
}: ProductCardProps) {
  const image = product.images?.[0];
  const lowestPrice = getLowestDisplayPrice(product);
  const compact = density === "compact";

  const inner = (
    <article className="group">
      <Link
        href={`/product/${product.handle}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/55 focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
      >
        <div className="card-editorial">
          <div
            className={`relative overflow-hidden bg-[linear-gradient(145deg,#f3efe8_0%,#ebe7df_100%)] ${compact ? "aspect-[3/4]" : "aspect-[4/5]"}`}
          >
            {image ? (
              <Image
                src={image.url}
                alt={product.title}
                fill
                className="object-cover object-center transition-[transform,opacity] duration-[1150ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:opacity-[0.94] group-hover:scale-[1.022]"
                sizes={
                  compact
                    ? "(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 280px"
                    : "(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 22vw"
                }
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center font-sans text-xs text-muted/80">
                No image
              </div>
            )}
          </div>
        </div>

        <div
          className={`mx-auto max-w-[18rem] text-center lg:mx-0 lg:max-w-none lg:text-left ${compact ? "mt-4" : "mt-7"}`}
        >
          <h3
            className={`font-serif font-light leading-snug tracking-[0.06em] text-charcoal ${compact ? "text-[0.875rem] lg:text-[0.9rem]" : "text-[0.938rem] lg:text-[0.9675rem]"}`}
          >
            {product.title}
          </h3>

          {lowestPrice ? (
            <p
              className={`border-t border-stone/30 font-sans text-[10px] font-normal tracking-[0.32em] text-muted uppercase ${compact ? "mt-3 pt-3" : "mt-5 pt-4"}`}
            >
              {formatPrice(lowestPrice.amount, lowestPrice.currency_code)}
            </p>
          ) : (
            <p
              className={`font-sans text-[10px] tracking-[0.25em] text-muted/75 uppercase ${compact ? "mt-3 pt-3" : "mt-5 pt-4"}`}
            >
              Price on request
            </p>
          )}

          <span className="mt-6 inline-flex select-none items-center justify-center gap-2 pt-2 font-sans text-[9px] tracking-[0.35em] text-charcoal opacity-0 transition-opacity duration-[600ms] group-hover:opacity-100 lg:justify-start">
            View detail
            <span aria-hidden className="inline-block translate-x-0 transition-transform duration-500 group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </div>
      </Link>
    </article>
  );

  if (staticEntry) {
    return inner;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.75,
        ease: [0.25, 0.08, 0.25, 1],
      }}
    >
      {inner}
    </motion.div>
  );
}
