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
    <header className="relative overflow-hidden border-b border-stone/40 bg-[linear-gradient(180deg,rgba(252,251,247,0.92)_0%,rgba(247,244,238,0.96)_55%,rgba(241,237,230,1)_100%)] pb-8 pt-10 text-center backdrop-blur-[2px] md:pb-10 md:pt-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(197,160,89,0.10),transparent_58%),radial-gradient(circle_at_92%_16%,rgba(255,255,255,0.55),transparent_60%)]"
      />
      <nav
        aria-label="Breadcrumb"
        className="relative mb-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-sans text-[10px] tracking-[0.22em] text-muted uppercase"
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
      <p className="relative mb-4 font-sans text-[10px] tracking-[0.48em] text-gold uppercase">
        {eyebrow}
      </p>
      <h1 className="relative mx-auto max-w-4xl font-serif text-4xl font-light tracking-[0.02em] text-charcoal md:text-5xl md:leading-[1.1] lg:text-[3.35rem]">
        {title}
      </h1>
      {scopeHint ? (
        <p
          className="relative mx-auto mt-5 max-w-lg rounded-sm border border-stone/45 bg-white/70 px-5 py-2.5 font-sans text-[11px] font-medium uppercase leading-snug tracking-[0.12em] text-charcoal shadow-[0_12px_38px_rgba(26,26,26,0.06)] backdrop-blur-sm"
          role="status"
        >
          {scopeHint}
        </p>
      ) : null}
      <p className="relative mx-auto mt-6 max-w-lg font-sans text-sm font-light leading-relaxed text-muted">
        {body}
      </p>
      <div className="relative mx-auto mt-7 h-px w-14 bg-gradient-to-r from-transparent via-charcoal/28 to-transparent" />
    </header>
  );
}
