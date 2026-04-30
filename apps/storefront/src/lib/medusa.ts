import { cache } from "react";

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "";
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

/** Display / cart currency — match Medusa store default (e.g. inr). Falls back to first available price. */
export const STORE_CURRENCY = (
  process.env.NEXT_PUBLIC_STORE_CURRENCY ?? "inr"
).toLowerCase();

async function medusaFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${MEDUSA_BACKEND_URL}${endpoint}`, {
    headers: {
      "x-publishable-api-key": PUBLISHABLE_KEY,
      "Content-Type": "application/json",
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Medusa API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export interface ProductImage {
  id: string;
  url: string;
}

export interface MoneyAmount {
  amount: number;
  currency_code: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  prices: MoneyAmount[];
  options: { id: string; value: string }[];
}

export interface ProductOption {
  id: string;
  title: string;
  values: { id: string; value: string }[];
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  images: ProductImage[];
  variants: ProductVariant[];
  options: ProductOption[];
}

interface ProductsResponse {
  products: Product[];
  count: number;
  offset: number;
  limit: number;
}

export interface ProductCategorySummary {
  id: string;
  name: string;
  handle: string;
  rank: number;
  parent_category_id: string | null;
}

interface ProductCategoriesResponse {
  product_categories: ProductCategorySummary[];
}

export const getProductCategories = cache(async function (): Promise<
  ProductCategorySummary[]
> {
  const data = await medusaFetch<ProductCategoriesResponse>(
    `/store/product-categories?limit=200&fields=id,name,handle,rank,parent_category_id`
  );
  return [...(data.product_categories ?? [])].sort(
    (a, b) =>
      (a.rank !== b.rank ? a.rank - b.rank : a.name.localeCompare(b.name))
  );
});

export function getParentCategories(
  categories: ProductCategorySummary[]
): ProductCategorySummary[] {
  return categories.filter((c) => c.parent_category_id == null);
}

export function getChildCategories(
  categories: ProductCategorySummary[],
  parentId: string
): ProductCategorySummary[] {
  return categories
    .filter((c) => c.parent_category_id === parentId)
    .sort((a, b) =>
      a.rank !== b.rank ? a.rank - b.rank : a.name.localeCompare(b.name)
    );
}

/** Short rail label: "Men — Shirts" → "Shirts". */
export function shortCategoryTitle(category: ProductCategorySummary): string {
  const sep = " — ";
  if (!category.name.includes(sep)) return category.name;
  return category.name.split(sep)[1]?.trim() ?? category.name;
}

export async function getProducts(
  limit = 12,
  opts?: { categoryId?: string }
): Promise<Product[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    fields: "*variants,*variants.prices,*images,*options,*options.values",
  });
  if (opts?.categoryId) {
    params.append("category_id", opts.categoryId);
  }
  const data = await medusaFetch<ProductsResponse>(
    `/store/products?${params.toString()}`
  );
  return data.products;
}

export async function getProductsMergedForLeaves(
  leafIds: string[],
  limitPerLeaf = 100
): Promise<Product[]> {
  if (leafIds.length === 0) return [];
  const batches = await Promise.all(
    leafIds.map((id) => getProducts(limitPerLeaf, { categoryId: id }))
  );
  const byId = new Map<string, Product>();
  for (const batch of batches) {
    for (const p of batch) {
      byId.set(p.id, p);
    }
  }
  return [...byId.values()].sort((a, b) => a.title.localeCompare(b.title));
}

/** One hero image per category from the first listed product — for shop/browse tiles. */
export interface CategoryPreviewTile {
  id: string;
  name: string;
  handle: string;
  imageUrl: string | null;
}

/** Department carousel: first image found under any child category. */
export async function getDepartmentPreviewTiles(
  parents: ProductCategorySummary[],
  allCategories: ProductCategorySummary[]
): Promise<CategoryPreviewTile[]> {
  return Promise.all(
    parents.map(async (parent) => {
      const children = getChildCategories(allCategories, parent.id);
      let imageUrl: string | null = null;
      for (const child of children) {
        const products = await getProducts(1, { categoryId: child.id });
        const url = products[0]?.images?.[0]?.url;
        if (url) {
          imageUrl = url;
          break;
        }
      }
      return {
        id: parent.id,
        name: parent.name,
        handle: parent.handle,
        imageUrl,
      };
    })
  );
}

/** Category carousel: first image found directly inside each category. */
export async function getCategoryPreviewTiles(
  categories: ProductCategorySummary[]
): Promise<CategoryPreviewTile[]> {
  return Promise.all(
    categories.map(async (category) => {
      const products = await getProducts(1, { categoryId: category.id });
      return {
        id: category.id,
        name: shortCategoryTitle(category),
        handle: category.handle,
        imageUrl: products[0]?.images?.[0]?.url ?? null,
      };
    })
  );
}

export async function getProductByHandle(
  handle: string
): Promise<Product | null> {
  const data = await medusaFetch<ProductsResponse>(
    `/store/products?handle=${handle}&fields=*variants,*variants.prices,*images,*options,*options.values`
  );
  return data.products[0] ?? null;
}

/** Price row for the storefront currency, or first currency Medusa returned. */
export function pickVariantPrice(
  prices: MoneyAmount[] | undefined
): MoneyAmount | undefined {
  if (!prices?.length) return undefined;
  const preferred = prices.find(
    (p) => p.currency_code.toLowerCase() === STORE_CURRENCY
  );
  return preferred ?? prices[0];
}

/** Lowest display price among variants (using preferred currency per variant). */
export function getLowestDisplayPrice(product: Product): MoneyAmount | undefined {
  const amounts = product.variants
    ?.map((v) => pickVariantPrice(v.prices))
    .filter((p): p is MoneyAmount => p != null);
  if (!amounts?.length) return undefined;
  return [...amounts].sort((a, b) => a.amount - b.amount)[0];
}

export function formatPrice(
  amount: number,
  currencyCode: string = STORE_CURRENCY
): string {
  const code = currencyCode.toLowerCase();
  const locale =
    code === "inr" ? "en-IN" : code === "eur" ? "de-DE" : "en-US";
  const minimumFractionDigits =
    code === "jpy" || code === "krw" ? 0 : undefined;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code.toUpperCase(),
    minimumFractionDigits: minimumFractionDigits ?? 0,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}
