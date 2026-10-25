import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useVisitor } from "@/hooks/useVisitor";
import { useMutation } from "@apollo/client/react";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import {
  createServerCatalogClient,
  fetchProductPage,
} from "@/lib/catalog-listing.server";
import { ADD_ITEM_TO_CART, CREATE_BACK_IN_STOCK_REQUEST, GET_PRODUCT_BY_ID } from "@/graphql";
import SeoHeader from "@/components/seo/SeoHeader";
import ProductListGrid from "@/components/product/ProductListGrid";
import ProductModalPreview from "@/components/product/ProductModalPreview";
import ProductImageGrid from "@/components/product/ProductImageGrid";
import ProductContent from "@/components/product/ProductContent";
import SizeAssistance from "@/components/product/SizeAssistance";
import { toast } from 'react-toastify';
import { ProductStatus } from "@/utils/Constant";
import { trackEcomEvent } from "@/utils/analytics";
import {
  CtaEnum,
  getAnalyticsItemId,
  trackCtaClick,
  trackNotifyMe,
  trackSizeGuideOpen,
} from "@/utils/analytics-events.util";
import {
  getErrorCode,
  getErrorMessage,
  getErrorReason,
} from "@/utils/api-error.util";
import { getLowestPrice, isVariantUnavailable } from "@/utils/catalog.util";
import { getLoginPath } from "@/utils/redirect.util";

// "You may also like": products from the same category (PRD-014 FR-0.8).
const RELATED_PRODUCT_LIMIT = 5;

const ProductDetail = ({ meta, data, productList }) => {
  const router = useRouter();
  const { runWithGuestId } = useVisitor();
  const basePrice = useMemo(() => getLowestPrice(data?.variants), [data]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState({});
  const [showSizeAssist, setShowSizeAssist] = useState(false);
  const [finalPrice, setFinalPrice] = useState(basePrice);
  const [variantMatched, setVariantMatched] = useState(null);
  const [cartBtn, setCartBtn] = useState(false);
  const { user, isLoggedIn } = useAuthStore((state) => state);
  const { openCart } = useCartStore((state) => state);
  const [addItemToCart, { loading }] = useMutation(ADD_ITEM_TO_CART);
  // PRD-014 UX-09 (as rare-element): a full selection with no published
  // variant, an ARCHIVED variant or a PRODUCT_UNAVAILABLE answer shows
  // "Unavailable / Notify me" instead of a silent Add to Bag.
  const [isRejected, setIsRejected] = useState(false);
  const isMissingCombination = cartBtn && !variantMatched;
  const isOutOfStock =
    isRejected || isMissingCombination || isVariantUnavailable(variantMatched);
  const [createNotifyRequest, { loading: notifyLoading }] = useMutation(CREATE_BACK_IN_STOCK_REQUEST);
  // PRD-013: the same item_id the e-commerce events send (variant SKU).
  const analyticsItemId = getAnalyticsItemId(data, variantMatched);

  useEffect(() => {
    if (data?._id) {
      trackEcomEvent.viewItem(data, variantMatched);
    }
  }, [data]);

  useEffect(() => {
    setIsRejected(false);
  }, [variantMatched, data]);

  const handleAddToCart = async () => {
    if (!cartBtn || !variantMatched || isOutOfStock) return;

    try {
      const productId = data?._id;
      if (!productId) throw new Error("Product ID not found");

      // IDs and qty only: the server prices the line.
      const input = {
        productId,
        variantId: variantMatched._id,
        qty: 1,
      };

      // Guests use a server-issued id, re-issued once if it's rejected.
      if (isLoggedIn) {
        await addItemToCart({ variables: { input } });
      } else {
        await runWithGuestId((guestId) =>
          addItemToCart({ variables: { input, guestId } }),
        );
      }
      trackEcomEvent.addToCart(data, variantMatched);
      openCart();
    } catch (err) {
      console.error(err);
      if (getErrorReason(err) === "PRODUCT_UNAVAILABLE") setIsRejected(true);
      toast.error(getErrorMessage(err, "Failed to add item to cart"));
    }
  };

  const handleNotifyMe = async () => {
    if (!isOutOfStock) return;
    if (!isLoggedIn) return router.push(getLoginPath(router.asPath));
    try {
      const productId = data?._id;
      if (!productId) throw new Error("Product ID not found");

      // A missing combination has no variant: ask for the product.
      const payload = {
        input: {
          productId,
          email: user?.email,
          ...(variantMatched?._id ? { variantId: variantMatched._id } : {}),
        },
      };

      await createNotifyRequest({ variables: payload });
      trackNotifyMe(analyticsItemId, variantMatched?.sku);
      toast.success("You’ll be notified when this item is back in stock!");
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to notify"));
    }
  };

  const handleOpen = () => {
    trackCtaClick(CtaEnum.SIZE_GUIDE, { itemId: analyticsItemId });
    trackSizeGuideOpen(analyticsItemId);
    setShowSizeAssist(true);
  };

  const handleClose = () => setShowSizeAssist(false);

  return (
    <>
      <SeoHeader meta={meta} />
      <div className="ProductDetails_wrapper">
        <div className="ProductDetails_cntr">
          <div className="ProductDets_main"></div>
          <div className="ProductDets_grid">
            <ProductImageGrid
              assets={data?.assets || []}
              setSelectedAsset={setSelectedAsset}
              setIsPreviewOpen={setIsPreviewOpen}
              itemId={analyticsItemId}
            />
            <ProductContent
              data={data || {}}
              finalPrice={finalPrice}
              cartBtn={cartBtn}
              loading={loading}
              notifyLoading={notifyLoading}
              isOutOfStock={isOutOfStock}
              setFinalPrice={setFinalPrice}
              setCartBtn={setCartBtn}
              setVariantMatched={setVariantMatched}
              handleOpen={handleOpen}
              handleAddToCart={handleAddToCart}
              handleNotifyMe={handleNotifyMe}
              variantMatched={variantMatched}
              analyticsItemId={analyticsItemId}
            />
          </div>
          <ProductListGrid
            key={router.asPath}
            data={productList}
            isOutOfStock={isOutOfStock}
            loading={loading}
            handleAddToCart={handleAddToCart}
            cartBtn={cartBtn}
            finalPrice={finalPrice}
            analyticsItemId={analyticsItemId}
          />
        </div>

        {showSizeAssist && <SizeAssistance onClose={handleClose} />}
      </div>
      <ProductModalPreview
        data={selectedAsset}
        isOpen={isPreviewOpen}
        setOpen={setIsPreviewOpen}
        setSelectedAsset={setSelectedAsset}
      />
    </>
  );
};

export default ProductDetail;

export async function getServerSideProps({ params }) {
  const slug = params?.slug || "";
  const meta = {
    title: "DeVeSheDreams – Wear Your Imagination",
    description:
      "DeVeSheDreams is a fashion label that turns dreams into wearable art. Collaborating with artists from different disciplines, we create capsule collections that reflect vibrant expression and individuality.",
    keywords:
      "DeVeSheDreams, wearable art, capsule collections, fashion collaborations, expressive clothing, artistic fashion",
    author: "DeVeSheDreams",
    robots: "index, follow",
  };

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
    return {
      props: {
        meta: product.seo?.title ? product.seo : meta,
        data: product,
        productList: related.products,
      },
    };
  } catch (error) {
    if (getErrorCode(error) === "NOT_FOUND") return { notFound: true };
    console.error("Error fetching data:", error.message);
    throw error;
  }
}
