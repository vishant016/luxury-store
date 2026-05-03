"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import AddressForm, {
  type AddressData,
} from "@/components/checkout/AddressForm";
import ShippingSelector, {
  shippingOptions,
} from "@/components/checkout/ShippingSelector";
import OrderSummary from "@/components/checkout/OrderSummary";

const emptyAddress: AddressData = {
  fullName: "",
  email: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  postalCode: "",
};

const subscribeMounted = () => () => {};

function validateAddress(
  data: AddressData
): Partial<Record<keyof AddressData, string>> {
  const errors: Partial<Record<keyof AddressData, string>> = {};
  if (!data.fullName.trim()) errors.fullName = "Required";
  if (!data.email.trim()) errors.email = "Required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Invalid email";
  if (!data.phone.trim()) errors.phone = "Required";
  if (!data.addressLine.trim()) errors.addressLine = "Required";
  if (!data.city.trim()) errors.city = "Required";
  if (!data.state.trim()) errors.state = "Required";
  if (!data.postalCode.trim()) errors.postalCode = "Required";
  return errors;
}

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const customer = useAuthStore((s) => s.customer);

  const mounted = useSyncExternalStore(
    subscribeMounted,
    () => true,
    () => false
  );
  const [address, setAddress] = useState<AddressData>(emptyAddress);
  const [prefilled, setPrefilled] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressData, string>>
  >({});
  const [shippingId, setShippingId] = useState("standard");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (customer && !prefilled) {
      queueMicrotask(() => {
        setAddress((prev) => ({
          ...prev,
          fullName:
            prev.fullName ||
            `${customer.first_name} ${customer.last_name}`.trim(),
          email: prev.email || customer.email,
        }));
        setPrefilled(true);
      });
    }
  }, [customer, prefilled]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost =
    shippingOptions.find((o) => o.id === shippingId)?.price ?? 0;

  function handleSubmit() {
    const validationErrors = validateAddress(address);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitted(true);
    clearCart();
  }

  if (!mounted) return null;

  if (submitted) {
    return (
      <section className="py-32 px-6 text-center bg-cream">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-md mx-auto"
        >
          <div className="w-16 h-16 rounded-full bg-gold text-white flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-serif font-normal tracking-tight text-charcoal mb-3">
            Order Confirmed
          </h1>
          <p className="text-sm text-muted mb-8 font-sans">
            Thank you for your order. This is a demo — no payment was processed.
          </p>
          <Link
            href="/shop"
            className="inline-block px-10 py-4 bg-charcoal text-cream text-[10px] tracking-[0.35em] uppercase font-sans hover:bg-gold transition-colors duration-500"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="py-32 px-6 text-center bg-cream">
        <h1 className="text-2xl font-serif font-normal tracking-tight text-charcoal mb-3">
          Your bag is empty
        </h1>
        <Link
          href="/shop"
          className="inline-block mt-4 px-10 py-4 bg-charcoal text-cream text-[10px] tracking-[0.35em] uppercase font-sans hover:bg-gold transition-colors duration-500"
        >
          Shop Now
        </Link>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden py-16 px-6 md:px-12">
      <div className="relative mx-auto max-w-7xl">
        <h1 className="text-3xl font-serif font-normal tracking-tight text-charcoal mb-12">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left — Form */}
          <div className="lg:col-span-3 flex flex-col gap-10">
            {!customer && (
              <div className="panel-editorial flex items-center justify-between rounded-sm p-4">
                <p className="text-xs text-muted font-sans">
                  Have an account?{" "}
                  <Link
                    href="/login"
                    className="text-charcoal underline underline-offset-4"
                  >
                    Sign in
                  </Link>{" "}
                  for a faster checkout
                </p>
              </div>
            )}

            <AddressForm
              data={address}
              onChange={setAddress}
              errors={errors}
            />

            <ShippingSelector
              selected={shippingId}
              onSelect={setShippingId}
            />

            <motion.button
              onClick={handleSubmit}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="btn-editorial-primary"
            >
              Place Demo Order
            </motion.button>
          </div>

          {/* Right — Summary */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                shippingCost={shippingCost}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
