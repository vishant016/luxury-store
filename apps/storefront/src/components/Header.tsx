"use client";

import Link from "next/link";
import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";

const departmentLinks = [
  { label: "Men", href: "/shop?department=men", department: "men" },
  { label: "Women", href: "/shop?department=women", department: "women" },
  { label: "Kids", href: "/shop?department=kids", department: "kids" },
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
];

const subscribeMounted = () => () => {};

function DesktopNavigation({
  pathname,
  useLightOnHero,
}: {
  pathname: string;
  useLightOnHero: boolean;
}) {
  const searchParams = useSearchParams();
  const activeDepartment = searchParams.get("department")?.toLowerCase();
  const allLinks = [...departmentLinks, ...navLinks];

  return (
    <nav className="hidden md:flex items-center gap-8">
      {allLinks.map((link) => {
        const isDepartment = "department" in link;
        const active = isDepartment
          ? pathname === "/shop" && activeDepartment === link.department
          : link.href === "/"
            ? pathname === "/"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            scroll={false}
            className={`relative text-[11px] font-medium tracking-[0.25em] uppercase transition-colors duration-500 ${
              useLightOnHero
                ? active
                  ? "text-white after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-px after:bg-white/90"
                  : "text-white/90 hover:text-white"
                : active
                  ? "text-charcoal after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-[2px] after:bg-charcoal"
                  : "text-charcoal hover:text-gold"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNavigation({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  const searchParams = useSearchParams();
  const activeDepartment = searchParams.get("department")?.toLowerCase();
  const allLinks = [...departmentLinks, ...navLinks];

  return (
    <nav className="flex flex-col px-6 py-4 gap-4">
      {allLinks.map((link) => {
        const isDepartment = "department" in link;
        const active = isDepartment
          ? pathname === "/shop" && activeDepartment === link.department
          : link.href === "/"
            ? pathname === "/"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            scroll={false}
            onClick={onNavigate}
            className={`cursor-pointer text-[11px] font-medium tracking-[0.25em] uppercase transition-colors duration-300 ${
              active
                ? "border-b-2 border-charcoal pb-1 text-charcoal"
                : "border-b-2 border-transparent text-charcoal hover:text-gold"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Header() {
  const pathname = usePathname();
  const isHomeHero = pathname === "/";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeMounted,
    () => true,
    () => false
  );
  const toggleCart = useCartStore((s) => s.toggle);
  const items = useCartStore((s) => s.items);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const customer = useAuthStore((s) => s.customer);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** Solid bar everywhere except homepage hero — white nav on cream disappeared "invisibly" before scroll. */
  const useLightOnHero = isHomeHero && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        useLightOnHero
          ? "border-b border-transparent bg-transparent"
          : "border-b border-stone/70 bg-cream/92 shadow-[0_10px_38px_rgba(26,26,26,0.06)] backdrop-blur-xl backdrop-saturate-150"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden cursor-pointer p-2 -ml-2"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`w-5 h-5 transition-colors duration-300 ${useLightOnHero ? "text-white" : "text-charcoal"}`}
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                />
              )}
            </svg>
          </button>

          {/* Navigation — desktop */}
          <Suspense fallback={<nav className="hidden md:flex items-center gap-8" />}>
            <DesktopNavigation
              pathname={pathname}
              useLightOnHero={useLightOnHero}
            />
          </Suspense>

          {/* Logo */}
          <Link
            href="/"
            className={`absolute left-1/2 -translate-x-1/2 text-lg tracking-[0.4em] uppercase font-serif font-semibold transition-colors duration-500 ${
              useLightOnHero ? "text-white" : "text-charcoal"
            }`}
          >
            Desire
          </Link>

          {/* Account + Cart */}
          <div className="flex items-center gap-1">
            {mounted && (
              <Link
                href={customer ? "/account" : "/login"}
                className="cursor-pointer p-2 group"
                aria-label="Account"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={`w-5 h-5 transition-colors duration-500 ${
                    useLightOnHero
                      ? "text-white/90 group-hover:text-white"
                      : "text-charcoal group-hover:text-gold"
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </Link>
            )}
            <button
              type="button"
              onClick={toggleCart}
              className="relative cursor-pointer p-2 group"
              aria-label="Cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`w-5 h-5 transition-colors duration-500 ${
                  useLightOnHero
                    ? "text-white/90 group-hover:text-white"
                    : "text-charcoal group-hover:text-gold"
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              {mounted && itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gold text-white text-[9px] flex items-center justify-center font-sans"
                >
                  {itemCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="md:hidden border-t border-stone bg-cream"
        >
          <Suspense fallback={null}>
            <MobileNavigation
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </Suspense>
        </motion.div>
      )}
    </header>
  );
}
