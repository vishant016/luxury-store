"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth";

export default function AccountDashboard() {
  const customer = useAuthStore((s) => s.customer);

  if (!customer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h2 className="text-[10px] tracking-[0.3em] uppercase font-sans font-medium text-charcoal mb-6">
        Account Details
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        <div className="p-6 border border-stone">
          <p className="text-[10px] tracking-wider uppercase text-muted mb-1 font-sans">
            Name
          </p>
          <p className="text-sm text-charcoal font-sans">
            {customer.first_name} {customer.last_name}
          </p>
        </div>
        <div className="p-6 border border-stone">
          <p className="text-[10px] tracking-wider uppercase text-muted mb-1 font-sans">
            Email
          </p>
          <p className="text-sm text-charcoal font-sans">{customer.email}</p>
        </div>
        <div className="p-6 border border-stone">
          <p className="text-[10px] tracking-wider uppercase text-muted mb-1 font-sans">
            Member Since
          </p>
          <p className="text-sm text-charcoal font-sans">
            {new Date(customer.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <Link
        href="/account/orders"
        className="inline-block px-8 py-3 border border-charcoal text-[10px] tracking-[0.25em] uppercase text-charcoal font-sans hover:bg-charcoal hover:text-cream transition-all duration-500"
      >
        View Order History
      </Link>
    </motion.div>
  );
}
