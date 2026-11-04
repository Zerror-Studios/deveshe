import { Const } from "@/utils/Constant";
import { toProductOffers } from "@/utils/product-offers.util";
import { toJsonLd } from "@/utils/json-ld.util";
import { toReviewJsonLd } from "@/utils/review.util";

// PRD-014 FR-2.8 (UX-33): Product JSON-LD for /product/[slug]; offers from
// `utils/product-offers.util`, with `availability` from the product rollup
// when the store has the stock signal on (PRD-020 FR-14; `null` leaves it
// out). PRD-032 FR-D1: `aggregateRating` and up to 10 `review` entries,
// only when the product has approved reviews (`toReviewJsonLd`).

const DESCRIPTION_MAX_LENGTH = 500;

// Text only: JSON-LD is data, not markup (toJsonLd escapes it as well).
const toPlainText = (html = "") =>
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, DESCRIPTION_MAX_LENGTH);

const ProductSchema = ({ product }) => {
  if (!product) return null;

  const {
    name,
    description,
    assets,
    slug,
    variants,
    availability,
    reviewSummary,
    jsonLdReviews,
  } = product;
  const productUrl = `${Const.ClientLink}/product/${slug}`;
  const images = (assets || []).map((asset) => asset?.path).filter(Boolean);
  const offers = toProductOffers(variants, productUrl, availability);

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name,
    ...(images.length ? { image: images.slice(0, 5) } : {}),
    description: toPlainText(description),
    sku: variants?.[0]?.sku || slug,
    brand: {
      "@type": "Brand",
      name: Const.Brand,
    },
    ...(offers ? { offers } : {}),
    ...toReviewJsonLd(reviewSummary, jsonLdReviews),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toJsonLd(schema) }}
    ></script>
  );
};

export default ProductSchema;
