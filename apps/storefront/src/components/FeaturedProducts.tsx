"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/medusa";
import { formatPrice, getLowestDisplayPrice } from "@/lib/medusa";
import ProductCard from "./ProductCard";

interface FeaturedProductsProps {
  products: Product[];
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 22,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: [0.25, 0.08, 0.25, 1] as const,
    },
  },
};

function FeaturedHeroProduct({ product }: { product: Product }) {
  const image = product.images?.[0];
  const price = getLowestDisplayPrice(product);

  return (
    <motion.div
      variants={itemVariants}
      className="flex min-h-0 flex-col md:col-span-7 md:h-full"
    >
      <Link
        href={`/product/${product.handle}`}
        className="group relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/55 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f3efe8] md:h-full"
      >
        <div className="card-editorial flex min-h-0 flex-1 flex-col overflow-hidden md:h-full">
          {/* Mobile: fixed editorial crop. md+: stretch with sidebar row so no dead zone under hero */}
          <div className="relative aspect-[4/5] min-h-[min(92vw,420px)] md:aspect-auto md:min-h-0 md:flex-1">
            {image ? (
              <Image
                src={image.url}
                alt={product.title}
                fill
                priority
                className="object-cover object-center transition-[transform,opacity] duration-[1.25s] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.035]"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[linear-gradient(145deg,#ebe8e4_0%,#ddd9d4_100%)] font-sans text-sm text-muted">
                No image
              </div>
            )}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/72 via-charcoal/18 to-transparent"
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_85%,rgba(197,160,89,0.22),transparent_55%)] opacity-90 mix-blend-soft-light" />

            <div className="absolute inset-x-0 bottom-0 z-[1] p-7 md:p-10 lg:p-12">
              <p className="font-sans text-[10px] tracking-[0.42em] text-white/75 uppercase">
                Signature piece
              </p>
              <h3 className="mt-4 max-w-xl font-serif text-2xl font-light leading-[1.12] tracking-tight text-white md:text-3xl lg:text-[2.35rem]">
                {product.title}
              </h3>
              {price ? (
                <p className="mt-5 font-sans text-[11px] font-normal tracking-[0.28em] text-white/88 uppercase">
                  {formatPrice(price.amount, price.currency_code)}
                </p>
              ) : null}
              <span className="mt-8 inline-flex border border-white/90 bg-white/[0.07] px-9 py-3.5 font-sans text-[10px] tracking-[0.36em] text-white uppercase backdrop-blur-md transition-all duration-500 group-hover:border-white group-hover:bg-white group-hover:text-charcoal">
                View piece
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function FeaturedProducts({
  products,
}: FeaturedProductsProps) {
  if (products.length === 0) return null;

  const [hero, ...rest] = products;

  return (
    <section
      id="featured"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#faf8f4_0%,#f7f4ee_38%,#f0ebe3_100%)] px-5 py-16 md:px-8 md:py-20 lg:px-10 lg:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(197,160,89,0.11),transparent_54%),radial-gradient(circle_at_96%_72%,rgba(255,255,255,0.5),transparent_56%)]"
      />

      <div className="relative mx-auto max-w-[min(1480px,96vw)]">
        {/* Header — tighter, editorial split */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-10 grid gap-8 border-b border-stone/40 pb-10 md:mb-12 md:grid-cols-12 md:gap-10 md:pb-12 md:items-end"
        >
          <div className="md:col-span-5">
            <p className="font-sans text-[10px] tracking-[0.48em] text-muted uppercase">
              Curated selection
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light tracking-[0.02em] text-charcoal md:text-[2.35rem] lg:text-[2.75rem] lg:leading-[1.08]">
              Featured Collection
            </h2>
          </div>
          <div className="relative md:col-span-7 md:pl-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-px top-2 hidden h-[calc(100%-0.5rem)] w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent md:block"
            />
            <p className="max-w-xl font-sans text-sm font-light leading-relaxed text-muted lg:max-w-none lg:text-[0.9375rem] lg:leading-relaxed">
              A tight edit — each piece chosen for silhouette, fibre, and how it
              settles on the frame. Start with the signature look, then explore the
              supporting pieces beside it.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.32em] text-charcoal uppercase transition-colors duration-500 hover:text-gold"
            >
              Shop the full collection
              <span aria-hidden className="text-gold">
                →
              </span>
            </Link>
          </div>
        </motion.div>

        {/* Live imagery: hero + compact stack — md+ stretch row height to tallest column */}
        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-stretch md:gap-10 xl:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08, margin: "0px 0px -12% 0px" }}
        >
          <FeaturedHeroProduct product={hero} />

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:col-span-5 md:h-full md:min-h-0 md:content-start md:gap-x-6 md:gap-y-8 lg:gap-x-7 lg:gap-y-9">
            {rest.map((product, i) => {
              const loneOnBottom =
                rest.length % 2 === 1 && i === rest.length - 1;
              return (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  className={
                    loneOnBottom
                      ? "flex w-full justify-center sm:col-span-2"
                      : "flex w-full justify-center"
                  }
                >
                  {/* Fixed max width keeps both columns equal; lone tile spans full row and stays centered */}
                  <div className="w-full max-w-[300px]">
                    <ProductCard
                      product={product}
                      staticEntry
                      density="compact"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
