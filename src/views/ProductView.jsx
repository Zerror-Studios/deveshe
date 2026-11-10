"use client";

/**
 * Product page (was `pages/product/[slug]/index.jsx`). Data comes from
 * `lib/page-data/product.server.js`; the JSON-LD from the page.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useVisitor } from "@/hooks/useVisitor";
import { useMutation } from "@apollo/client/react";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { ADD_ITEM_TO_CART, CREATE_BACK_IN_STOCK_REQUEST } from "@/graphql";
import ProductListGrid from "@/components/product/ProductListGrid";
import ProductReviews from "@/components/product/ProductReviews";
import ProductModalPreview from "@/components/product/ProductModalPreview";
import ProductImageGrid from "@/components/product/ProductImageGrid";
import ProductContent from "@/components/product/ProductContent";
import SizeAssistance from "@/components/product/SizeAssistance";
import { toast } from 'react-toastify';
import { trackEcomEvent } from "@/utils/analytics";
import {
  CtaEnum,
  getAnalyticsItemId,
  trackCtaClick,
  trackNotifyMe,
  trackSizeGuideOpen,
} from "@/utils/analytics-events.util";
import { getErrorMessage, getErrorReason } from "@/utils/api-error.util";
import { getLowestPrice, isVariantUnavailable } from "@/utils/catalog.util";
import { getNotifyMeSuccessMessage } from "@/utils/back-in-stock.util";
import { useVariantAvailability } from "@/hooks/useVariantAvailability";
import {
  getStockNote,
  isSoldOut,
  resolveVariantSignal,
} from "@/utils/stock-signal.util";

// A guest's "Notify me" needs an email (PRD-020 FR-13); the server checks it.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ProductDetail = ({
  data,
  productList,
  reviews = [],
  reviewCount = 0,
  reviewSummary = null,
}) => {
  const pathname = usePathname();
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
  const [notifyEmail, setNotifyEmail] = useState("");
  // PRD-020 FR-13: the stock signal (null = today's behaviour). The SSR
  // value shows first; the fresh read on mount and on variant change
  // overrides it, and a failed read keeps it.
  const variantIds = useMemo(
    () => (data?.variants || []).map((variant) => variant?._id),
    [data],
  );
  const { fresh: freshStock, refresh: refreshStock } = useVariantAvailability(
    variantIds,
    { skip: !data?._id },
  );
  // Re-read on a variant change (the mount read already covers the first).
  const lastVariantIdRef = useRef(null);
  useEffect(() => {
    const variantId = variantMatched?._id || null;
    if (variantId && lastVariantIdRef.current && variantId !== lastVariantIdRef.current) {
      refreshStock();
    }
    if (variantId) lastVariantIdRef.current = variantId;
  }, [variantMatched?._id]);
  const variantSignal = resolveVariantSignal(variantMatched, freshStock);
  const soldOut = Boolean(variantMatched) && isSoldOut(variantSignal);
  const stockNote = cartBtn && variantMatched ? getStockNote(variantSignal) : null;
  const isMissingCombination = cartBtn && !variantMatched;
  const isOutOfStock =
    isRejected ||
    isMissingCombination ||
    isVariantUnavailable(variantMatched, freshStock);
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
    // PRD-020 FR-13: guests subscribe with an email, no login needed.
    const email = isLoggedIn ? user?.email : notifyEmail.trim();
    if (!isLoggedIn && !EMAIL_PATTERN.test(email)) {
      toast.error("Enter your email to be notified.");
      return;
    }
    try {
      const productId = data?._id;
      if (!productId) throw new Error("Product ID not found");

      // A missing combination has no variant: ask for the product.
      const payload = {
        input: {
          productId,
          ...(email ? { email } : {}),
          ...(variantMatched?._id ? { variantId: variantMatched._id } : {}),
        },
      };

      await createNotifyRequest({ variables: payload });
      trackNotifyMe(analyticsItemId, variantMatched?.sku);
      // CP-22: a guest's alert starts only after the emailed link is opened.
      toast.success(getNotifyMeSuccessMessage(isLoggedIn));
      if (!isLoggedIn) setNotifyEmail("");
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
              isSoldOut={soldOut}
              stockNote={stockNote}
              freshStock={freshStock}
              showNotifyEmail={!isLoggedIn}
              notifyEmail={notifyEmail}
              setNotifyEmail={setNotifyEmail}
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
            key={pathname}
            data={productList}
            isOutOfStock={isOutOfStock}
            isSoldOut={soldOut}
            loading={loading}
            notifyLoading={notifyLoading}
            handleAddToCart={handleAddToCart}
            handleNotifyMe={handleNotifyMe}
            cartBtn={cartBtn}
            finalPrice={finalPrice}
            analyticsItemId={analyticsItemId}
          />
        </div>

        {showSizeAssist && <SizeAssistance onClose={handleClose} />}
      </div>
      <ProductReviews
        key={data?._id}
        productId={data?._id}
        summary={reviewSummary}
        reviews={reviews}
        totalCount={reviewCount}
      />
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
