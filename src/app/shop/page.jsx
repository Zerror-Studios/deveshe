/**
 * /shop (live site design; data: `lib/page-data/shop.server.js`). Every
 * published product, filtered and sorted on the client.
 */

import { cache } from "react";
import PageSchemas from "@/components/seo/PageSchemas";
import ShopView from "@/views/ShopView";
import { loadShopPage } from "@/lib/page-data/shop.server";
import { toMetadata } from "@/lib/seo-metadata.util";

// Rendered per request, like the other data pages.
export const dynamic = "force-dynamic";

// One read for the metadata and the page.
const getPage = cache(async () => await loadShopPage());

export async function generateMetadata() {
  const { meta } = await getPage();
  return toMetadata(meta, "/shop");
}

export default async function Page() {
  const { meta, products, categories, lookbooks, loadError } = await getPage();
  return (
    <>
      <PageSchemas meta={meta} path="/shop" />
      <ShopView
        products={products}
        categories={categories}
        lookbooks={lookbooks}
        loadError={loadError}
      />
    </>
  );
}
