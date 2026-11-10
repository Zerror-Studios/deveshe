/**
 * Product page data — SERVER ONLY (was `getServerSideProps` of
 * `pages/product/[slug]/index.jsx`, kit PRD-002 FR-3.1).
 *
 * Unknown or unpublished slug → 404 (SF-17). Related products and reviews
 * are optional: a failure leaves their section empty, and the review
 * summary is its own query so the reviews service never breaks the
 * catalog read (PRD-032 FR-C2).
 */

import {
  createServerCatalogClient,
  fetchProductPage,
} from "@/lib/catalog-listing.server";
import {
  GET_PRODUCT_BY_ID,
  GET_PRODUCT_REVIEWS,
  GET_PRODUCT_REVIEW_SUMMARY,
} from "@/graphql";
import { Const, ProductStatus } from "@/utils/Constant";
import { getErrorCode } from "@/utils/api-error.util";

// ─── Constants and helpers ────────────────────────────────────────────────

// "You may also like": products from the same category (PRD-014 FR-0.8).
const RELATED_PRODUCT_LIMIT = 5;
// PRD-014 FR-2.8 / PRD-032 FR-D1: the first page of approved reviews.
const PRODUCT_REVIEW_LIMIT = 10;
const SITE_NAME = "DeVeSheDreams";
const META_DESCRIPTION_MAX_LENGTH = 160;

// Text only, for meta descriptions (the product description is HTML).
const toPlainText = (html = "") =>
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * PRD-014 FR-2.8 (UX-33): per-product meta. A merchant SEO field wins;
 * otherwise the product's own name, description and first image, never
 * the home page's title. The canonical is the slug URL without a query.
 */
const toProductMeta = (product) => {
  const seo = product.seo || {};
  const title = seo.title || `${product.name} – ${SITE_NAME}`;
  const description = (
    seo.description || toPlainText(product.description)
  ).slice(0, META_DESCRIPTION_MAX_LENGTH);
  const image = seo.og?.image || product.assets?.[0]?.path || "";
  return {
    title,
    description,
    keywords: seo.keywords?.length ? seo.keywords.join(", ") : "",
    author: seo.author || SITE_NAME,
    robots: seo.robots || "index, follow",
    canonical: seo.canonical || `${Const.ClientLink}/product/${product.slug}`,
    og: {
      title: seo.og?.title || title,
      description: seo.og?.description || description,
      image,
    },
    twitter: {
      card: seo.twitter?.card || "summary_large_image",
      title: seo.twitter?.title || title,
      description: seo.twitter?.description || description,
      image: seo.twitter?.image || image,
    },
  };
};

// ─── Loader ───────────────────────────────────────────────────────────────

export async function loadProductPage(params) {
  const slug = params?.slug || "";

  try {
    const client = createServerCatalogClient();
    const productRes = await client.query({
      query: GET_PRODUCT_BY_ID,
      variables: { slug },
    });
    const product = productRes?.data?.getClientSideProductById;
    // Unknown or unpublished slug → real 404 (SF-17)
    if (!product || product.status !== ProductStatus.PUBLISHED) {
      return { notFound: true };
    }
    // Related products are optional: a failure leaves the grid empty.
    const categoryId = product.categoryIds?.[0];
    const related = await fetchProductPage(client, {
      limit: RELATED_PRODUCT_LIMIT,
      filters: {
        slugNotInclude: slug,
        ...(categoryId ? { categoryIds: [categoryId] } : {}),
      },
    }).catch(() => ({ products: [] }));
    // Reviews are optional as well: a failure shows an empty section. The
    // summary is its own query, so the reviews service can never break
    // the catalog read above (PRD-032 FR-C2).
    const [reviews, reviewSummary] = await Promise.all([
      client
        .query({
          query: GET_PRODUCT_REVIEWS,
          variables: {
            offset: 0,
            limit: PRODUCT_REVIEW_LIMIT,
            sort: "NEWEST",
            filter: { productId: product._id },
          },
        })
        .then(({ data }) => data?.getReviews)
        .catch(() => null),
      client
        .query({ query: GET_PRODUCT_REVIEW_SUMMARY, variables: { slug } })
        .then(({ data }) => data?.getClientSideProductById?.reviewSummary || null)
        .catch(() => null),
    ]);
    return {
      props: {
        meta: toProductMeta(product),
        data: product,
        productList: related.products,
        reviews: reviews?.data || [],
        reviewCount: reviews?.totalCount || 0,
        reviewSummary,
      },
    };
  } catch (error) {
    if (getErrorCode(error) === "NOT_FOUND") return { notFound: true };
    console.error("Error fetching data:", error.message);
    throw error;
  }
}
