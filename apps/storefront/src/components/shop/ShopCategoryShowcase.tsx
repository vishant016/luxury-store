"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { CategoryPreviewTile } from "@/lib/medusa";

type Props = {
  tiles: CategoryPreviewTile[];
  activeHandle?: string | null;
  title?: string;
  linkMode?: "department" | "subcategory";
  departmentHandle?: string;
  selectionLabel?: string;
};

type ScrollThumb = { widthPct: number; leftPct: number };

/** Scroll thumb fills the track proportional to viewport; slides with scrollLeft. */
function useCarouselThumb(scrollerEl: HTMLElement | null): ScrollThumb {
  const [thumb, setThumb] = useState<ScrollThumb>({
    widthPct: 100,
    leftPct: 0,
  });

  const measure = useCallback(() => {
    const el = scrollerEl;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    if (scrollWidth <= clientWidth || scrollWidth - clientWidth < 4) {
      setThumb({ widthPct: 100, leftPct: 0 });
      return;
    }

    const maxScroll = scrollWidth - clientWidth;
    const widthPct = Math.min(
      92,
      Math.max(22, (clientWidth / scrollWidth) * 100)
    );
    const leftPct = (scrollLeft / maxScroll) * (100 - widthPct);

    setThumb({ widthPct, leftPct });
  }, [scrollerEl]);

  useEffect(() => {
    const el = scrollerEl;
    if (!el) return undefined;

    const onScroll = () => measure();
    el.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    const frame = requestAnimationFrame(measure);

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [measure, scrollerEl]);

  return thumb;
}

export default function ShopCategoryShowcase({
  tiles,
  activeHandle,
  title = "Shop by category",
  linkMode = "department",
  departmentHandle,
  selectionLabel,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollerEl, setScrollerEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setScrollerEl(scrollRef.current);
  }, []);

  const thumb = useCarouselThumb(scrollerEl);

  const scrollByViewport = useCallback((dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * Math.max(el.clientWidth * 0.75, 260),
      behavior: "smooth",
    });
  }, []);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;

    const updateEnds = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const max = scrollWidth - clientWidth - 4;
      setCanPrev(scrollLeft > 4);
      setCanNext(scrollLeft < max);
    };

    updateEnds();
    el.addEventListener("scroll", updateEnds, { passive: true });
    const ro = new ResizeObserver(updateEnds);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateEnds);
      ro.disconnect();
    };
  }, [tiles.length]);

  if (tiles.length === 0) return null;

  const getTileHref = (handle: string) => {
    if (linkMode === "subcategory" && departmentHandle) {
      return `/shop?department=${encodeURIComponent(departmentHandle)}&category=${encodeURIComponent(handle)}`;
    }

    return `/shop?department=${encodeURIComponent(handle)}`;
  };

  return (
    <section
      aria-label="Shop by category"
      className="border-b border-stone/35 bg-[#ebe8e4] py-8 md:py-10"
    >
      <div className="mx-auto max-w-[min(1480px,96vw)] px-5 md:px-10">
        <p className="mb-8 font-sans text-[10px] tracking-[0.32em] text-muted uppercase">
          {title}
        </p>

        <div className="relative">
          {canPrev && (
            <button
              type="button"
              aria-label="Previous categories"
              onClick={() => scrollByViewport(-1)}
              className="absolute left-1 top-[32%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-stone/30 bg-[#fcfbf9]/95 text-charcoal shadow-sm backdrop-blur-[1px] transition-colors hover:bg-white sm:flex"
            >
              <ChevronIcon direction="left" />
            </button>
          )}
          <div
            ref={scrollRef}
            tabIndex={-1}
            role="region"
            aria-label="Browse categories horizontally"
            className="scrollbar-none flex gap-5 overflow-x-auto overflow-y-hidden pb-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory scroll-smooth md:gap-6 [&::-webkit-scrollbar]:hidden"
          >
            {tiles.map((tile) => {
              const selected = activeHandle === tile.handle;
              return (
                <Link
                  key={tile.id}
                  href={getTileHref(tile.handle)}
                  scroll={false}
                  className="group w-[min(42vw,280px)] shrink-0 snap-start rounded-sm outline-none ring-0 ring-offset-0 focus-visible:ring-2 focus-visible:ring-charcoal/20 sm:w-[min(36vw,300px)] md:w-[min(28vw,280px)] lg:w-[min(18vw,260px)]"
                >
                  <div
                    className={`rounded-sm border bg-white p-px shadow-sm transition-[border-color,box-shadow] duration-500 ease-out ${
                      selected
                        ? "border-charcoal shadow-[0_10px_32px_-4px_rgba(0,0,0,0.16)]"
                        : "border-stone/[0.18] shadow-[0_1px_0_rgba(0,0,0,0.03)] group-hover:border-stone/[0.45] group-hover:shadow-[0_10px_28px_-6px_rgba(0,0,0,0.08)]"
                    }`}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#eae6e2]">
                      {selected ? (
                        <span className="absolute left-3 top-3 z-10 bg-charcoal px-3 py-1.5 font-sans text-[8px] font-semibold uppercase tracking-[0.24em] text-cream">
                          Selected
                        </span>
                      ) : null}
                      {tile.imageUrl ? (
                        <Image
                          src={tile.imageUrl}
                          alt={`${tile.name} — shop this category`}
                          fill
                          className="object-cover transition-transform duration-[1.05s] ease-out group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 18vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#eae6e2] to-[#ddd9d4] px-3 text-left font-sans text-[10px] leading-relaxed tracking-[0.2em] text-muted uppercase">
                          {tile.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-5 min-h-[3.75rem]">
                    <p
                      className={`max-w-[18rem] font-sans text-[11px] leading-tight tracking-[0.2em] uppercase ${selected ? "font-semibold text-charcoal" : "text-charcoal"} transition-colors`}
                    >
                      {tile.name}
                    </p>
                    <p
                      className={`mt-1.5 font-sans text-[9px] font-normal uppercase tracking-[0.32em] ${
                        selected ? "text-charcoal" : "text-muted"
                      }`}
                    >
                      {selected
                        ? "Currently selected"
                        : linkMode === "subcategory"
                          ? "Opens category"
                          : "Opens full department"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {canNext && (
            <button
              type="button"
              aria-label="Next categories"
              onClick={() => scrollByViewport(1)}
              className="absolute right-1 top-[32%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-stone/30 bg-[#fcfbf9]/95 text-charcoal shadow-sm backdrop-blur-[1px] transition-colors hover:bg-white sm:flex"
            >
              <ChevronIcon direction="right" />
            </button>
          )}
        </div>

        <div className="mt-8">
          {selectionLabel ? (
            <p className="mb-5 font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-charcoal">
              {selectionLabel}
            </p>
          ) : null}
          <div
            className="relative h-0.5 w-32 overflow-hidden rounded-full bg-stone/35 sm:w-44 md:w-56"
            aria-hidden
          >
            <div
              className="absolute top-0 h-full rounded-full bg-charcoal/80 transition-all duration-150 ease-out"
              style={{
                width: `${thumb.widthPct}%`,
                left: `${thumb.leftPct}%`,
              }}
            />
          </div>
          <p className="sr-only">
            Swipe sideways or use the arrow buttons on larger screens to see all
            categories. Each tile shows an image with the category name below.
          </p>
        </div>
      </div>
    </section>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={direction === "left" ? "mr-px" : "ml-px"}
      aria-hidden
    >
      {direction === "left" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}
