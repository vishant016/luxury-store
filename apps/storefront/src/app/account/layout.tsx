"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";

const sidebarLinks = [
  { label: "Dashboard", href: "/account" },
  { label: "Orders", href: "/account/orders" },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token, customer, logout, refreshCustomer } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    refreshCustomer();
  }, [token, router, refreshCustomer]);

  if (!token || !customer) return null;

  return (
    <section className="py-16 px-6 md:px-12 bg-cream">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-muted mb-2 font-sans">
              My Account
            </p>
            <h1 className="text-2xl font-serif font-normal tracking-tight text-charcoal">
              Welcome, {customer.first_name}
            </h1>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="text-[10px] tracking-[0.25em] uppercase text-muted hover:text-charcoal transition-colors duration-300 font-sans"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <aside>
            <nav className="flex flex-col gap-3.5">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted hover:text-charcoal transition-colors duration-300 font-sans"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>
          <div className="md:col-span-3">{children}</div>
        </div>
      </div>
    </section>
  );
}
