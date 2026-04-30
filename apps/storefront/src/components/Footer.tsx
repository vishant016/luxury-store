import Link from "next/link";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Account", href: "/account" },
];

export default function Footer() {
  return (
    <footer className="border-t border-stone bg-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <p className="text-lg tracking-[0.4em] uppercase font-serif font-semibold text-charcoal mb-5">
              Desire
            </p>
            <p className="text-sm text-muted leading-relaxed max-w-xs font-sans">
              Timeless elegance meets modern craftsmanship. Curated luxury for
              the discerning individual.
            </p>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-6 font-sans">
              Company
            </p>
            <nav className="flex flex-col gap-3.5">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted hover:text-charcoal transition-colors duration-500 font-sans"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-6 font-sans">
              Customer Care
            </p>
            <p className="text-sm text-muted leading-relaxed mb-6 font-sans">
              Browse curated collections or sign in to review account details
              and order history.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="px-6 py-3 bg-charcoal text-cream text-[10px] tracking-[0.2em] uppercase font-sans hover:bg-gold transition-colors duration-500"
              >
                Shop
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 border border-stone text-charcoal text-[10px] tracking-[0.2em] uppercase font-sans hover:border-gold transition-colors duration-500"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-stone">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] tracking-wider text-muted font-sans">
            &copy; {new Date().getFullYear()} Desire. All rights reserved.
          </p>
          <p className="text-[10px] tracking-wider text-muted font-sans">
            Crafted with precision.
          </p>
        </div>
      </div>
    </footer>
  );
}
