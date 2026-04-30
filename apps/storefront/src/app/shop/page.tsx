import {
  getProductCategories,
  getProducts,
  getDepartmentPreviewTiles,
  getCategoryPreviewTiles,
  getProductsMergedForLeaves,
  getParentCategories,
  getChildCategories,
  shortCategoryTitle,
} from "@/lib/medusa";
import ProductCard from "@/components/ProductCard";
import PageTransition from "@/components/PageTransition";
import ShopCollectionChrome from "@/components/shop/ShopCollectionChrome";
import ShopCategoryShowcase from "@/components/shop/ShopCategoryShowcase";

const baseMeta = {
  title: "Shop — Desire",
  description:
    "Browse Desire — Men, Women, Kids — curated shirts, knitwear, tailoring, and more.",
} as const;

function normalizeOne(
  raw: string | string[] | undefined
): string | undefined {
  if (typeof raw === "string") return raw.trim() || undefined;
  if (Array.isArray(raw) && raw[0]) return raw[0].trim() || undefined;
  return undefined;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    department?: string | string[];
    category?: string | string[];
  }>;
}) {
  const resolved = await searchParams;
  const deptSlug = normalizeOne(resolved.department)?.toLowerCase();
  const catSlug = normalizeOne(resolved.category)?.toLowerCase();
  const categories = await getProductCategories();

  if (catSlug) {
    const leaf = categories.find(
      (c) =>
        Boolean(c.parent_category_id) &&
        (c.handle.toLowerCase() === catSlug || c.id === catSlug)
    );
    if (leaf) {
      return { title: `${leaf.name} — Desire`, description: baseMeta.description };
    }
  }

  if (deptSlug) {
    const p = categories.find(
      (c) =>
        !c.parent_category_id &&
        (c.handle.toLowerCase() === deptSlug || c.id === deptSlug)
    );
    if (p) {
      return {
        title: `${p.name} — Shop — Desire`,
        description: baseMeta.description,
      };
    }
  }

  return baseMeta;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    department?: string | string[];
    category?: string | string[];
  }>;
}) {
  const resolved = await searchParams;
  const deptSlug = normalizeOne(resolved.department)?.toLowerCase();
  const catSlug = normalizeOne(resolved.category)?.toLowerCase();

  const allCategories = await getProductCategories();
  const parents = getParentCategories(allCategories);

  const parentBySlug = new Map(
    parents.map((p) => [p.handle.toLowerCase(), p] as const)
  );

  const activeParent =
    deptSlug !== undefined ? parentBySlug.get(deptSlug) : undefined;

  const activeLeaf =
    catSlug !== undefined
      ? allCategories.find(
          (c) =>
            Boolean(c.parent_category_id) &&
            (c.handle.toLowerCase() === catSlug || c.id === catSlug)
        )
      : undefined;

  /** Parent from ?department= or inferred from leaf ?category=. */
  const resolvedParent =
    activeParent ??
    (activeLeaf?.parent_category_id
      ? parents.find((p) => p.id === activeLeaf.parent_category_id)
      : undefined);

  let invalidDept = Boolean(deptSlug && !parentBySlug.get(deptSlug));
  let invalidLeaf = Boolean(catSlug && !activeLeaf);

  if (
    activeLeaf?.parent_category_id &&
    deptSlug !== undefined &&
    activeParent &&
    activeLeaf.parent_category_id !== activeParent.id
  ) {
    invalidDept = true;
  }

  if (activeLeaf && !activeLeaf.parent_category_id) {
    invalidLeaf = true;
  }

  const invalid = invalidDept || invalidLeaf;

  const leafsForDept = resolvedParent
    ? getChildCategories(allCategories, resolvedParent.id)
    : [];

  const departmentTiles = !resolvedParent
    ? await getDepartmentPreviewTiles(parents, allCategories)
    : [];
  const subcategoryTiles = resolvedParent
    ? await getCategoryPreviewTiles(leafsForDept)
    : [];

  let products: Awaited<ReturnType<typeof getProducts>> = [];

  if (!invalid) {
    if (activeLeaf) {
      products = await getProducts(100, { categoryId: activeLeaf.id });
    } else if (resolvedParent) {
      const ids = leafsForDept.map((c) => c.id);
      products = await getProductsMergedForLeaves(ids, 80);
    } else {
      products = await getProducts(120);
    }
  }

  return (
    <PageTransition>
      <div className="bg-[#ebe8e4] pb-28 pt-0 md:pb-32">
        {!resolvedParent ? (
          <ShopCollectionChrome
            title="The Collection"
            eyebrow="Collections"
            scopeHint={null}
            description={null}
          />
        ) : null}
        {!resolvedParent ? (
          <ShopCategoryShowcase tiles={departmentTiles} />
        ) : null}
        {!invalid && resolvedParent ? (
          <ShopCategoryShowcase
            tiles={subcategoryTiles}
            activeHandle={activeLeaf?.handle ?? null}
            title={`${resolvedParent.name}: Shop by Category`}
            linkMode="subcategory"
            departmentHandle={resolvedParent.handle}
            selectionLabel={
              activeLeaf
                ? `Selected: ${shortCategoryTitle(activeLeaf)}`
                : `Selected: All ${resolvedParent.name} pieces`
            }
          />
        ) : null}

        <section className="mx-auto max-w-[min(1480px,96vw)] px-5 pt-10 md:px-10 md:pt-12 lg:pt-14">
          {invalid ? (
            <div className="border border-stone bg-white/40 px-8 py-16 text-center">
              <p className="font-sans text-sm text-muted">
                That collection couldn’t be found. Use Men, Women, or Kids above,
                or pick a subcategory.
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="border border-stone bg-white/40 px-8 py-16 text-center">
              <p className="font-sans text-sm text-muted">
                No pieces here yet — try another department or browse all.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-20 sm:grid-cols-2 sm:gap-x-14 sm:gap-y-22 lg:grid-cols-3 lg:gap-x-14 xl:gap-x-18">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}

          <p className="mx-auto mt-24 max-w-md text-center font-sans text-[11px] leading-relaxed tracking-wide text-muted/90">
            Styling imagery is illustrative. Product photography reflects studio lighting;
            garment colour may read slightly warmer or cooler than on screen.
          </p>
        </section>
      </div>
    </PageTransition>
  );
}
