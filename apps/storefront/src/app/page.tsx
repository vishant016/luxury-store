import { getProducts } from "@/lib/medusa";
import HeroBanner from "@/components/editorial/HeroBanner";
import PromoFeature from "@/components/editorial/PromoFeature";
import FeaturedProducts from "@/components/FeaturedProducts";
import PageTransition from "@/components/PageTransition";

export default async function HomePage() {
  const products = await getProducts(4);

  return (
    <PageTransition>
      <main className="-mt-16">
        <HeroBanner />

        <section className="border-b border-stone/80 bg-cream py-24 md:py-32">
          <PromoFeature
            imageLeft
            eyebrow="Heritage tailoring"
            title="Silhouettes that transcend seasons"
            description="We design for permanence — natural fibres, restrained palettes, and cut that honours the body. Each piece reflects a quiet confidence found only when craft meets restraint."
            imageSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1400&q=85"
            imageAlt="Refined tailoring and luxury menswear styling"
            ctaHref="/shop"
            ctaLabel="Explore the edit"
          />
        </section>

        <FeaturedProducts products={products} columns={4} />
      </main>
    </PageTransition>
  );
}
