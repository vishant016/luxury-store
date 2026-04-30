"use client";

import Image from "next/image";
import type { CartItem } from "@/store/cart";
import { formatPrice } from "@/lib/medusa";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
}

export default function OrderSummary({
  items,
  subtotal,
  shippingCost,
}: OrderSummaryProps) {
  const total = subtotal + shippingCost;

  return (
    <div className="bg-ivory border border-stone p-6 lg:p-8">
      <h2 className="text-[10px] tracking-[0.3em] uppercase font-sans font-medium text-charcoal mb-6">
        Order Summary
      </h2>

      <ul className="flex flex-col gap-4 mb-6">
        {items.map((item) => (
          <li key={item.variantId} className="flex gap-4">
            <div className="relative w-16 h-20 flex-shrink-0 bg-stone overflow-hidden">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              )}
            </div>
            <div className="flex flex-col justify-between flex-1 min-w-0">
              <div>
                <p className="text-sm font-sans font-medium text-charcoal truncate">
                  {item.title}
                </p>
                <p className="text-[10px] text-muted font-sans">
                  {item.variantTitle}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted font-sans">
                  Qty {item.quantity}
                </p>
                <p className="text-sm text-charcoal font-sans">
                  {formatPrice(item.price * item.quantity, item.currencyCode)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-t border-stone pt-4 flex flex-col gap-3">
        <div className="flex justify-between text-sm font-sans">
          <span className="text-muted">Subtotal</span>
          <span className="text-charcoal">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm font-sans">
          <span className="text-muted">Shipping</span>
          <span className="text-charcoal">
            {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
          </span>
        </div>
        <div className="flex justify-between text-base font-medium border-t border-stone pt-3 mt-1 font-sans">
          <span className="text-charcoal">Total</span>
          <span className="text-charcoal">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
