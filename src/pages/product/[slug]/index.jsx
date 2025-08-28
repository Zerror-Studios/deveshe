import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useVisitor } from "@/hooks/useVisitor";
import { useMutation } from "@apollo/client";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { createApolloClient } from "@/lib/apolloClient";
import { ADD_ITEM_TO_CART, GET_PRODUCT_BY_ID, GET_PRODUCTS } from "@/graphql";
import SeoHeader from "@/components/seo/SeoHeader";
import ProductListGrid from "@/components/product/ProductListGrid";
import ProductModalPreview from "@/components/product/ProductModalPreview";
import ProductImageGrid from "@/components/product/ProductImageGrid";
import ProductContent from "@/components/product/ProductContent";
import SizeAssistance from "@/components/product/SizeAssistance";
import toast from "react-hot-toast";

const ProductDetail = ({ meta, data, productList }) => {
  const router = useRouter();
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
  const { token, isLoggedIn } = useAuthStore((state) => state);
  const { openCart } = useCartStore((state) => state);
  const [addItemToCart, { loading }] = useMutation(ADD_ITEM_TO_CART);

  const handleAddToCart = async () => {
    if (!cartBtn) return;

    try {
      const productId = router?.query?.slug;
      if (!productId) throw new Error("Product ID not found");

      const payload = {
        input: {
          productId,
          variantDetail: variantMatched,
          ...(isLoggedIn && token ? { token } : {}),
        },
        ...(!isLoggedIn && visitorId ? { guestId: visitorId } : {}),
      };

      await addItemToCart({ variables: payload });
      openCart();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to add item to cart");
    }
  };

  const handleOpen = () => {
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
            />
            <ProductContent
              data={data || {}}
              finalPrice={finalPrice}
              cartBtn={cartBtn}
              loading={loading}
              setFinalPrice={setFinalPrice}
              setCartBtn={setCartBtn}
              setVariantMatched={setVariantMatched}
              handleOpen={handleOpen}
              handleAddToCart={handleAddToCart}
            />
          </div>
          <ProductListGrid
            key={router.asPath}
            data={productList}
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
};

export default ProductDetail;

export async function getServerSideProps({ params }) {
  const id = params?.slug || "";
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
    const client = createApolloClient();
    const queries = [
      client.query({
        query: GET_PRODUCT_BY_ID,
        variables: { getClientSideProductByIdId: id },
      }),
      client.query({
        query: GET_PRODUCTS,
        variables: { offset: 0, limit: 5 },
      }),
    ].filter(Boolean);

    const [productRes, productListRes] = await Promise.all(queries);
    return {
      props: {
        meta,
        data: productRes?.data?.getClientSideProductById || {},
        productList:
          productListRes?.data?.getClientSideProducts?.products || [],
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return {
      props: {
        meta,
        data: {},
        productList: [],
      },
    };
  }
}
