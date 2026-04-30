"use client";

import { STORE_CURRENCY, formatPrice } from "@/lib/medusa";

export interface ShippingOption {
  id: string;
  label: string;
  description: string;
  /** Amount in smallest currency unit — matches Medusa seeded flat rates */
  price: number;
}

const STANDARD_USD_EUR_INR = 1000 as const;
const EXPRESS_USD_EUR_INR = 2500 as const;
const STANDARD_INR = 15000 as const;
const EXPRESS_INR = 39900 as const;

const shippingOptions: ShippingOption[] = [
  {
    id: "standard",
    label: "Standard Delivery",
    description: "5–7 business days",
    price: STORE_CURRENCY === "inr" ? STANDARD_INR : STANDARD_USD_EUR_INR,
  },
  {
    id: "express",
    label: "Express Delivery",
    description: "1–2 business days",
    price: STORE_CURRENCY === "inr" ? EXPRESS_INR : EXPRESS_USD_EUR_INR,
  },
];

interface ShippingSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export default function ShippingSelector({
  selected,
  onSelect,
}: ShippingSelectorProps) {
  const currencyHint = STORE_CURRENCY;

  return (
    <div>
      <h2 className="text-[10px] tracking-[0.3em] uppercase font-sans font-medium text-charcoal mb-6">
        Shipping Method
      </h2>

      <div className="flex flex-col gap-3">
        {shippingOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={`flex cursor-pointer items-center justify-between px-5 py-4 border text-left transition-all duration-500 ${
              selected === option.id
                ? "border-charcoal bg-ivory"
                : "border-stone hover:border-muted"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                  selected === option.id
                    ? "border-gold"
                    : "border-stone"
                }`}
              >
                {selected === option.id && (
                  <div className="w-2 h-2 rounded-full bg-gold" />
                )}
              </div>
              <div>
                <p className="text-sm font-sans font-medium text-charcoal">
                  {option.label}
                </p>
                <p className="text-xs text-muted font-sans">
                  {option.description}
                </p>
              </div>
            </div>
            <p className="text-sm text-charcoal font-sans">
              {option.price === 0
                ? "Free"
                : formatPrice(option.price, currencyHint)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export { shippingOptions };
