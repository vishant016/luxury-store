"use client";

import { motion } from "framer-motion";
import type { Product } from "@/lib/medusa";
import ProductCard from "./ProductCard";

interface FeaturedProductsProps {
  products: Product[];
  columns?: 3 | 4;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.74,
      ease: [0.25, 0.08, 0.25, 1] as const,
    },
  },
};

export default function FeaturedProducts({
  products,
  columns = 4,
}: FeaturedProductsProps) {
  const gridCols =
    columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      id="featured"
      className="bg-[#fcfbf9] px-5 py-24 md:px-10 md:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-[min(1480px,96vw)]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-20 border-b border-stone/35 pb-16 text-center md:mb-24 md:pb-20"
        >
          <p className="mb-5 font-sans text-[10px] tracking-[0.48em] text-muted uppercase">
            Curated selection
          </p>
          <h2 className="font-serif text-3xl font-light tracking-[0.02em] text-charcoal md:text-[2.25rem] lg:text-[2.65rem]">
            Featured Collection
          </h2>
          <p className="mx-auto mt-8 max-w-md font-sans text-sm font-light leading-relaxed text-muted">
            A tight edit — each piece chosen for silhouette, fibre, and how it settles on the frame.
          </p>
          <div className="mx-auto mt-10 h-px w-12 bg-charcoal/15" />
        </motion.div>

        <motion.div
          className={`grid gap-x-10 gap-y-20 md:gap-x-14 md:gap-y-22 ${gridCols}`}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.06, margin: "0px 0px -14% 0px" }}
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard product={product} staticEntry />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
