/**
 * /shop (live site design; data: `lib/page-data/shop.server.js`). Every
 * published product, filtered and sorted on the client.
 */

import { cache } from "react";
import PageSchemas from "@/components/seo/PageSchemas";
import ShopView from "@/views/ShopView";
import { loadShopPage } from "@/lib/page-data/shop.server";
import { toMetadata } from "@/lib/seo-metadata.util";

// Cached and rebuilt every 5 minutes (ISR, like Nahara's catalog pages);
// each rebuild reads the gateway afresh (kit 1.2.2), and the CDN serves it.
export const revalidate = 300; // literal: Next reads it at build (= STORE_REVALIDATE_SECONDS)

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
