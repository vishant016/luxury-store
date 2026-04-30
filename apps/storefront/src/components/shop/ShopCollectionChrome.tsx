import Link from "next/link";

type Props = {
  title: string;
  eyebrow?: string;
  /** e.g. "Men · All pieces" — clarifies catalogue scope */
  scopeHint?: string | null;
  /** Replaces default supporting paragraph when provided */
  description?: string | null;
};

/**
 * Editorial page chrome: breadcrumbs + runway-style title zone.
 */
export default function ShopCollectionChrome({
  title,
  eyebrow = "Menswear",
  scopeHint,
  description,
}: Props) {
  const body =
    description ??
    "Curated proportions and fibres — photographed for clarity of cut, not spectacle.";

  return (
    <header className="border-b border-stone/35 bg-[#fcfbf9] pb-8 pt-10 text-center md:pb-10 md:pt-12">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-sans text-[10px] tracking-[0.22em] text-muted uppercase"
      >
        <Link
          href="/"
          className="transition-colors duration-500 hover:text-charcoal"
        >
          Home
        </Link>
        <span className="text-stone/80" aria-hidden>
          /
        </span>
        <Link href="/shop" className="transition-colors duration-500 hover:text-charcoal">
          Shop
        </Link>
      </nav>
      <p className="mb-4 font-sans text-[10px] tracking-[0.45em] text-gold uppercase">
        {eyebrow}
      </p>
      <h1 className="mx-auto max-w-4xl font-serif text-4xl font-light tracking-[0.02em] text-charcoal md:text-5xl md:leading-[1.1] lg:text-[3.35rem]">
        {title}
      </h1>
      {scopeHint ? (
        <p
          className="mx-auto mt-5 max-w-lg rounded-sm border border-stone/40 bg-white/80 px-5 py-2.5 font-sans text-[11px] font-medium uppercase leading-snug tracking-[0.12em] text-charcoal shadow-[0_1px_0_rgba(0,0,0,0.04)]"
          role="status"
        >
          {scopeHint}
        </p>
      ) : null}
      <p className="mx-auto mt-6 max-w-lg font-sans text-sm font-light leading-relaxed text-muted">
        {body}
      </p>
      <div className="mx-auto mt-7 h-px w-14 bg-charcoal/20" />
    </header>
  );
}
