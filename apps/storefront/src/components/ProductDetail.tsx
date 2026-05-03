"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Product } from "@/lib/medusa";
import { formatPrice, pickVariantPrice } from "@/lib/medusa";
import { useCartStore } from "@/store/cart";

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const addToCart = useCartStore((s) => s.addToCart);

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    const defaults: Record<string, string> = {};
    product.options?.forEach((opt) => {
      const first = opt.values?.[0];
      if (first) defaults[opt.title] = first.value;
    });
    return defaults;
  });

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const matchedVariant = product.variants?.find((v) =>
    v.options?.every(
      (o) => selectedOptions[findOptionTitle(product, o.id)] === o.value
    )
  );

  const price = pickVariantPrice(matchedVariant?.prices);

  function handleOptionChange(optionTitle: string, value: string) {
    setSelectedOptions((prev) => ({ ...prev, [optionTitle]: value }));
    setAdded(false);
  }

  function handleAddToCart() {
    if (!matchedVariant || !price) return;
    addToCart(
      {
        variantId: matchedVariant.id,
        productId: product.id,
        title: product.title,
        variantTitle: matchedVariant.title,
        price: price.amount,
        currencyCode: price.currency_code,
        image: product.images?.[0]?.url,
      },
      quantity
    );
    setAdded(true);
    setQuantity(1);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f6f4f0_0%,#f1ece6_46%,#ebe8e2_100%)] px-5 py-12 md:px-10 md:py-16 lg:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(197,160,89,0.09),transparent_56%),radial-gradient(circle_at_94%_18%,rgba(255,255,255,0.55),transparent_58%)]"
      />
      <div className="relative mx-auto max-w-[min(1480px,96vw)]">
        <nav
          aria-label="Breadcrumb"
          className="mb-10 flex flex-wrap items-center gap-x-3 gap-y-2 font-sans text-[10px] tracking-[0.22em] text-muted uppercase"
        >
          <Link
            href="/"
            className="transition-colors duration-500 hover:text-charcoal"
          >
            Home
          </Link>
          <span className="text-stone/60" aria-hidden>
            /
          </span>
          <Link
            href="/shop"
            className="transition-colors duration-500 hover:text-charcoal"
          >
            The Collection
          </Link>
          <span className="text-stone/60" aria-hidden>
            /
          </span>
          <span className="max-w-[min(280px,50vw)] truncate text-charcoal">
            {product.title}
          </span>
        </nav>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20 xl:gap-28">
        {/* Images */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col gap-4"
        >
          <div className="card-editorial overflow-hidden">
          <div className="relative aspect-[4/5] overflow-hidden bg-[linear-gradient(155deg,#f3efe8_0%,#e9e5dc_100%)]">
            {product.images?.[activeImage] && (
              <Image
                src={product.images[activeImage].url}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            )}
          </div>
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`relative cursor-pointer w-20 h-20 overflow-hidden border transition-all duration-500 ${
                    i === activeImage
                      ? "border-gold"
                      : "border-stone hover:border-muted"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`${product.title} ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col justify-center lg:pl-2 xl:pl-4"
        >
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3 font-sans">
            Desire
          </p>
          <h1 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-charcoal mb-4">
            {product.title}
          </h1>

          {price && (
            <p className="text-lg text-muted mb-8 font-sans font-light tracking-[0.02em]">
              {formatPrice(price.amount, price.currency_code)}
            </p>
          )}

          <div className="w-10 h-px bg-gold mb-8" />

          <p className="text-sm text-muted leading-relaxed mb-10 max-w-md font-sans font-light">
            {product.description}
          </p>

          {/* Variant options */}
          <div className="flex flex-col gap-6 mb-8">
            {product.options?.map((option) => (
              <div key={option.id}>
                <p className="text-[10px] tracking-[0.25em] uppercase text-muted mb-3 font-sans">
                  {option.title}:{" "}
                  <span className="text-charcoal">
                    {selectedOptions[option.title]}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {option.values?.map((val) => (
                    <button
                      key={val.id}
                      type="button"
                      onClick={() =>
                        handleOptionChange(option.title, val.value)
                      }
                      className={`cursor-pointer px-5 py-2.5 text-[10px] tracking-[0.15em] uppercase font-sans border transition-all duration-500 ${
                        selectedOptions[option.title] === val.value
                          ? "border-charcoal bg-charcoal text-cream"
                          : "border-stone text-muted hover:border-charcoal hover:text-charcoal"
                      }`}
                    >
                      {val.value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quantity selector */}
          <div className="mb-10">
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted mb-3 font-sans">
              Quantity
            </p>
            <div className="inline-flex items-center border border-stone">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="cursor-pointer px-4 py-2.5 text-sm text-muted hover:text-charcoal transition-colors duration-300 font-sans"
              >
                &minus;
              </button>
              <span className="px-5 py-2.5 text-sm text-charcoal min-w-[48px] text-center border-x border-stone font-sans">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="cursor-pointer px-4 py-2.5 text-sm text-muted hover:text-charcoal transition-colors duration-300 font-sans"
              >
                +
              </button>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={handleAddToCart}
            disabled={!matchedVariant}
            whileHover={matchedVariant ? { scale: 1.005 } : undefined}
            whileTap={matchedVariant ? { scale: 0.995 } : undefined}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className={`w-full cursor-pointer border py-4 text-[10px] tracking-[0.35em] uppercase font-sans transition-all duration-700 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed ${
              added
                ? "border-gold bg-gold text-white shadow-[0_18px_44px_rgba(197,160,89,0.35)]"
                : "border-charcoal bg-charcoal text-cream shadow-[0_18px_46px_rgba(26,26,26,0.18)] hover:bg-charcoal/92 hover:shadow-[0_22px_52px_rgba(26,26,26,0.22)]"
            }`}
          >
            {added ? "Added to Bag" : "Add to Bag"}
          </motion.button>
        </motion.div>
      </div>
      </div>
    </section>
  );
}

function findOptionTitle(product: Product, optionValueId: string): string {
  for (const opt of product.options ?? []) {
    if (opt.values?.some((v) => v.id === optionValueId)) {
      return opt.title;
    }
  }
  return "";
}
