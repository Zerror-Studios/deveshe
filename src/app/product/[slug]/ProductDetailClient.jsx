"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useVisitor } from "@/hooks/useVisitor";
import { useMutation } from "@apollo/client/react";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import {
  ADD_ITEM_TO_CART,
  CREATE_BACK_IN_STOCK_REQUEST,
} from "@/graphql";
import ProductListGrid from "@/components/product/ProductListGrid";
import ProductModalPreview from "@/components/product/ProductModalPreview";
import ProductImageGrid from "@/components/product/ProductImageGrid";
import ProductContent from "@/components/product/ProductContent";
import SizeAssistance from "@/components/product/SizeAssistance";
import { toast } from "react-toastify";
import { Const } from "@/utils/Constant";
import { TokenManager } from "@/utils/tokenManager";
import { trackEcomEvent } from "@/utils/analytics";

export default function ProductDetailClient({ data, productList }) {
  const router = useRouter();
  const pathname = usePathname();
  const { visitorId } = useVisitor();
  const basePrice = useMemo(
    () => (data?.discountedPrice > 0 ? data.discountedPrice : data?.price || 0),
    [data]
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState({});
  const [showSizeAssist, setShowSizeAssist] = useState(false);
  const [finalPrice, setFinalPrice] = useState(basePrice);
  const [variantMatched, setVariantMatched] = useState(null);
  const [cartBtn, setCartBtn] = useState(false);
  const { user, isLoggedIn } = useAuthStore((state) => state);
  const { openCart } = useCartStore((state) => state);
  const token = TokenManager.getAccessToken();
  const [addItemToCart, { loading }] = useMutation(ADD_ITEM_TO_CART);
  const [createNotifyRequest, { loading: notifyLoading }] = useMutation(
    CREATE_BACK_IN_STOCK_REQUEST
  );

  useEffect(() => {
    if (data) {
      trackEcomEvent.viewItem(data, variantMatched);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleAddToCart = async () => {
    if (!cartBtn || variantMatched?.stockStatus === Const.OUT_OF_STOCK) return;

    try {
      const productId = data?._id;
      if (!productId) throw new Error("Product ID not found");

      const payload = {
        input: {
          productId,
          categoryId: data?.categoryIds?.[0],
          variantDetail: variantMatched,
          ...(isLoggedIn && token ? { token } : {}),
        },
        ...(!isLoggedIn && visitorId ? { guestId: visitorId } : {}),
      };

      await addItemToCart({ variables: payload });
      trackEcomEvent.addToCart(data, variantMatched);
      openCart();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to add item to cart");
    }
  };

  const handleNotifyMe = async () => {
    if (variantMatched?.stockStatus !== Const.OUT_OF_STOCK) return;
    if (!isLoggedIn) return router.push("/login");
    try {
      const productId = data?._id;
      if (!productId) throw new Error("Product ID not found");

      const payload = {
        input: {
          productId,
          email: user?.email,
          userId: user?._id,
          variantId: variantMatched?.variantDetailId,
        },
      };

      await createNotifyRequest({ variables: payload });
      toast.success("You’ll be notified when this item is back in stock!");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to notify");
    }
  };

  const handleOpen = () => {
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
            />
            <ProductContent
              data={data || {}}
              finalPrice={finalPrice}
              cartBtn={cartBtn}
              loading={loading}
              notifyLoading={notifyLoading}
              isOutOfStock={variantMatched?.stockStatus === Const.OUT_OF_STOCK}
              setFinalPrice={setFinalPrice}
              setCartBtn={setCartBtn}
              setVariantMatched={setVariantMatched}
              handleOpen={handleOpen}
              handleAddToCart={handleAddToCart}
              handleNotifyMe={handleNotifyMe}
            />
          </div>
          <ProductListGrid
            key={pathname}
            data={productList}
            isOutOfStock={variantMatched?.stockStatus === Const.OUT_OF_STOCK}
            loading={loading}
            handleAddToCart={handleAddToCart}
            cartBtn={cartBtn}
            finalPrice={finalPrice}
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
}

