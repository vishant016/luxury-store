"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/medusa";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    close,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
  } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[110] cursor-pointer bg-black/45 backdrop-blur-[3px]"
            onClick={close}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 right-0 z-[120] flex h-full w-full max-w-md flex-col border-l border-stone/80 bg-[linear-gradient(180deg,#fdfcfa_0%,#f8f5ef_48%,#f4f0e8_100%)] shadow-[0_0_0_1px_rgba(197,160,89,0.08),-28px_0_72px_rgba(26,26,26,0.14)] backdrop-blur-xl"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent"
            />
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone/70 bg-white/25 px-6 py-5 backdrop-blur-sm">
              <h2 className="text-[10px] tracking-[0.35em] uppercase font-sans font-medium text-charcoal">
                Your Bag ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
              <button
                type="button"
                onClick={close}
                className="cursor-pointer p-1 text-muted hover:text-charcoal transition-colors duration-300"
                aria-label="Close cart"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="relative flex-1 overflow-y-auto px-6 py-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-sm text-muted mb-2 font-sans">
                    Your bag is empty
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    className="cursor-pointer text-[10px] tracking-[0.25em] uppercase text-charcoal underline underline-offset-4 font-sans"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul className="flex flex-col gap-6">
                  {items.map((item) => (
                    <li
                      key={item.variantId}
                      className="flex gap-4 border-b border-stone/70 pb-6 last:border-0"
                    >
                      <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-[linear-gradient(145deg,#ebe8e4_0%,#e3dfd8_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        )}
                      </div>

                      <div className="flex flex-col flex-1 justify-between min-w-0">
                        <div>
                          <p className="text-sm font-sans font-medium text-charcoal truncate">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-muted mt-0.5 font-sans">
                            {item.variantTitle}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-stone">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.variantId,
                                  item.quantity - 1
                                )
                              }
                              className="cursor-pointer px-2 py-1 text-xs text-muted hover:text-charcoal transition-colors duration-300 font-sans"
                            >
                              &minus;
                            </button>
                            <span className="px-3 py-1 text-xs text-charcoal min-w-[28px] text-center font-sans">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.variantId,
                                  item.quantity + 1
                                )
                              }
                              className="cursor-pointer px-2 py-1 text-xs text-muted hover:text-charcoal transition-colors duration-300 font-sans"
                            >
                              +
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <p className="text-sm text-charcoal font-sans">
                              {formatPrice(
                                item.price * item.quantity,
                                item.currencyCode
                              )}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.variantId)}
                              className="cursor-pointer text-muted hover:text-charcoal transition-colors duration-300"
                              aria-label="Remove item"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-stone/80 bg-white/30 px-6 py-5 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-muted font-sans">
                    Subtotal
                  </p>
                  <p className="text-base font-medium text-charcoal font-sans">
                    {formatPrice(totalPrice())}
                  </p>
                </div>
                <Link
                  href="/checkout"
                  onClick={close}
                  className="btn-editorial-primary mb-3 text-center"
                >
                  Checkout
                </Link>
                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full cursor-pointer py-2 text-[10px] tracking-[0.2em] uppercase text-muted hover:text-charcoal transition-colors duration-300 font-sans"
                >
                  Clear Bag
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
