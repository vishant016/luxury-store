import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

/** Amounts: USD/EUR in smallest units (cent); INR in paise (1 ₹ = 100 paise). */
function buildVariants(
  sizes: string[],
  colors: string[],
  skuPrefix: string,
  priceUsd: number,
  priceEur: number,
  priceInr: number
) {
  return sizes.flatMap((size) =>
    colors.map((color) => ({
      title: `${size} / ${color}`,
      sku: `${skuPrefix}-${size}-${color}`.toUpperCase().replace(/\s/g, "-"),
      options: { Size: size, Color: color },
      prices: [
        { amount: priceUsd, currency_code: "usd" as const },
        { amount: priceEur, currency_code: "eur" as const },
        { amount: priceInr, currency_code: "inr" as const },
      ],
    }))
  );
}

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  const countries = ["us", "gb", "de", "fr", "it", "in"];

  logger.info("Seeding luxury store data...");

  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Luxury Storefront",
          description: "Primary online sales channel",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Storefront Publishable Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  });

  await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "Luxury Store",
          supported_currencies: [
            { currency_code: "inr", is_default: true },
            { currency_code: "usd", is_default: false },
            { currency_code: "eur", is_default: false },
          ],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  });

  logger.info("Seeding regions...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "India",
          currency_code: "inr",
          countries: ["in"],
          payment_providers: ["pp_system_default"],
        },
        {
          name: "North America",
          currency_code: "usd",
          countries: ["us"],
          payment_providers: ["pp_system_default"],
        },
        {
          name: "Europe",
          currency_code: "eur",
          countries: ["gb", "de", "fr", "it"],
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });

  const regionIN = regionResult[0];
  const regionNA = regionResult[1];
  const regionEU = regionResult[2];

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });

  logger.info("Seeding stock location...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Main Warehouse",
          address: {
            city: "New York",
            country_code: "US",
            address_1: "100 Fifth Avenue",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment...");
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Standard Delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Worldwide",
        geo_zones: countries.map((c) => ({
          country_code: c,
          type: "country" as const,
        })),
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  const standardShippingPrices = [
    { currency_code: "usd" as const, amount: 1000 },
    { currency_code: "eur" as const, amount: 1000 },
    { currency_code: "inr" as const, amount: 15000 },
    { region_id: regionIN.id, amount: 15000 },
    { region_id: regionNA.id, amount: 1000 },
    { region_id: regionEU.id, amount: 1000 },
  ];

  const expressShippingPrices = [
    { currency_code: "usd" as const, amount: 2500 },
    { currency_code: "eur" as const, amount: 2500 },
    { currency_code: "inr" as const, amount: 39900 },
    { region_id: regionIN.id, amount: 39900 },
    { region_id: regionNA.id, amount: 2500 },
    { region_id: regionEU.id, amount: 2500 },
  ];

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Delivered in 5-7 business days.",
          code: "standard",
        },
        prices: standardShippingPrices,
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Delivered in 1-2 business days.",
          code: "express",
        },
        prices: expressShippingPrices,
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  });

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });

  logger.info(
    "Seeding product categories (Men / Women / Kids + typed children)..."
  );

  type ParentDept = "Men" | "Women" | "Kids";

  function deptHandlePrefix(dept: ParentDept): string {
    switch (dept) {
      case "Men":
        return "mens";
      case "Women":
        return "womens";
      case "Kids":
        return "kids";
    }
  }

  const PRODUCT_TYPES = [
    "Shirts",
    "Knitwear",
    "Trousers",
    "Outerwear",
    "Accessories",
    "Footwear",
  ] as const;

  type ProductType = (typeof PRODUCT_TYPES)[number];

  const { result: parentCategories } =
    await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [
          { name: "Men", is_active: true, handle: "men" },
          { name: "Women", is_active: true, handle: "women" },
          { name: "Kids", is_active: true, handle: "kids" },
        ],
      },
    });

  function parentCategoryId(dept: ParentDept): string {
    const c = parentCategories.find((row) => row.name === dept);
    if (!c) throw new Error(`Missing parent category: ${dept}`);
    return c.id;
  }

  const childCategoryInput: {
    name: string;
    handle: string;
    parent_category_id: string;
  }[] = [];

  for (const dept of ["Men", "Women", "Kids"] as ParentDept[]) {
    const parentId = parentCategoryId(dept);
    const prefix = deptHandlePrefix(dept);
    for (const ty of PRODUCT_TYPES) {
      const slug = ty.toLowerCase().replace(/\s+/g, "-");
      childCategoryInput.push({
        parent_category_id: parentId,
        name: `${dept} — ${ty}`,
        handle: `${prefix}-${slug}`,
      });
    }
  }

  const { result: leafCategories } =
    await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: childCategoryInput.map(
          ({ name, handle, parent_category_id }) => ({
            name,
            handle,
            is_active: true,
            parent_category_id,
          })
        ),
      },
    });

  function menLeaf(ty: ProductType): string {
    const handle = `${deptHandlePrefix("Men")}-${ty.toLowerCase()}`;
    const row = leafCategories.find((l) => l.handle === handle);
    if (!row) {
      throw new Error(`Missing Men leaf category handle ${handle}`);
    }
    return row.id;
  }

  const sizes = ["S", "M", "L", "XL"];

  logger.info("Seeding luxury products...");
  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Classic Oxford Shirt",
          category_ids: [menLeaf("Shirts")],
          description:
            "Crafted from premium cotton with a refined spread collar and mother-of-pearl buttons. A timeless wardrobe essential that embodies effortless sophistication.",
          handle: "classic-oxford-shirt",
          weight: 300,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-back.png",
            },
          ],
          options: [
            { title: "Size", values: sizes },
            { title: "Color", values: ["White", "Light Blue", "Navy"] },
          ],
          variants: buildVariants(
            sizes,
            ["White", "Light Blue", "Navy"],
            "OXFORD",
            12500,
            11500,
            1049900
          ),
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Cashmere Cable-Knit Sweater",
          category_ids: [menLeaf("Knitwear")],
          description:
            "Luxuriously soft pure cashmere in a heritage cable-knit pattern. Relaxed yet refined — designed for weekend elegance and everyday warmth.",
          handle: "cashmere-cable-knit-sweater",
          weight: 450,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-back.png",
            },
          ],
          options: [
            { title: "Size", values: sizes },
            { title: "Color", values: ["Cream", "Charcoal", "Camel"] },
          ],
          variants: buildVariants(
            sizes,
            ["Cream", "Charcoal", "Camel"],
            "CASHMERE",
            34500,
            31900,
            2879900
          ),
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Tailored Wool Trousers",
          category_ids: [menLeaf("Trousers")],
          description:
            "Impeccably tailored from Italian virgin wool with a flat-front silhouette and satin waistband trim. The foundation of a distinguished wardrobe.",
          handle: "tailored-wool-trousers",
          weight: 550,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-back.png",
            },
          ],
          options: [
            { title: "Size", values: sizes },
            { title: "Color", values: ["Black", "Charcoal Grey", "Tan"] },
          ],
          variants: buildVariants(
            sizes,
            ["Black", "Charcoal Grey", "Tan"],
            "TROUSERS",
            27500,
            25500,
            2299900
          ),
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Fine Merino Wool Polo",
          category_ids: [menLeaf("Knitwear")],
          description:
            "Ultra-fine merino with a supple hand-feel and clean self-collar. Moves from weekday meetings to evening plans without missing a beat.",
          handle: "fine-merino-wool-polo",
          weight: 280,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-back.png",
            },
          ],
          options: [
            { title: "Size", values: sizes },
            { title: "Color", values: ["Navy", "Stone", "Wine"] },
          ],
          variants: buildVariants(
            sizes,
            ["Navy", "Stone", "Wine"],
            "MERINO-POLO",
            7900,
            7200,
            659900
          ),
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Italian Linen Blazer",
          category_ids: [menLeaf("Outerwear")],
          description:
            "Half-lined linen from Northern Italy — breathable structure, soft shoulder, and a natural drape tailored for warmer climates.",
          handle: "italian-linen-blazer",
          weight: 620,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-back.png",
            },
          ],
          options: [
            { title: "Size", values: sizes },
            { title: "Color", values: ["Sand", "Navy"] },
          ],
          variants: buildVariants(
            sizes,
            ["Sand", "Navy"],
            "LINEN-BLAZER",
            48900,
            44900,
            4199900
          ),
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Silk Twill Scarf",
          category_ids: [menLeaf("Accessories")],
          description:
            "Hand-finished silk twill with muted house print. Wear at the collar, pocket, or bag — understated polish in motion.",
          handle: "silk-twill-scarf",
          weight: 80,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
            },
          ],
          options: [{ title: "Color", values: ["Burgundy", "Olive", "Ivory"] }],
          variants: ["Burgundy", "Olive", "Ivory"].map((color) => ({
            title: color,
            sku: `SCARF-${color}`.toUpperCase().replace(/\s/g, "-"),
            options: { Color: color },
            prices: [
              { amount: 8900, currency_code: "usd" as const },
              { amount: 8200, currency_code: "eur" as const },
              { amount: 749900, currency_code: "inr" as const },
            ],
          })),
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Calf Leather Belt",
          category_ids: [menLeaf("Accessories")],
          description:
            "Full-grain Italian calf with a slim brushed buckle. Cut to length for a clean end — the quiet anchor of tailored separates.",
          handle: "calf-leather-belt",
          weight: 220,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
            },
          ],
          options: [
            { title: "Size", values: ["32", "34", "36", "38"] },
            { title: "Color", values: ["Black", "Cognac"] },
          ],
          variants: buildVariants(
            ["32", "34", "36", "38"],
            ["Black", "Cognac"],
            "BELT",
            11900,
            10900,
            999900
          ),
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Suede Driving Loafer",
          category_ids: [menLeaf("Footwear")],
          description:
            "Unlined suede with a flexible sole and cushioned insole. Made for city driving and long walks — comfort without surrendering polish.",
          handle: "suede-driving-loafer",
          weight: 480,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-back.png",
            },
          ],
          options: [
            { title: "Size", values: ["40", "41", "42", "43", "44"] },
            { title: "Color", values: ["Chocolate", "Navy Suede"] },
          ],
          variants: buildVariants(
            ["40", "41", "42", "43", "44"],
            ["Chocolate", "Navy Suede"],
            "LOAFER",
            22900,
            20900,
            1949900
          ),
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
      ],
    },
  });
  logger.info("Finished seeding products.");

  logger.info("Seeding inventory levels...");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 100,
        inventory_item_id: item.id,
      })),
    },
  });

  logger.info("Luxury store seed complete.");
  logger.info(`Publishable API Key: ${publishableApiKey.token}`);
}
