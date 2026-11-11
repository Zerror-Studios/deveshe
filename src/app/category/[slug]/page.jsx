/**
 * /category/[slug]: moved to /shop/[categories] (the live site's URL). A
 * permanent redirect (308) that keeps the query string.
 */

import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

const toQueryString = (searchParams = {}) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    for (const item of [].concat(value ?? [])) query.append(key, item);
  }
  const search = query.toString();
  return search ? `?${search}` : "";
};

export default async function Page({ params, searchParams }) {
  const { slug } = await params;
  permanentRedirect(
    `/shop/${encodeURIComponent(slug || "")}${toQueryString(await searchParams)}`,
  );
}
