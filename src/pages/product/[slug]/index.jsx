import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useVisitor } from "@/hooks/useVisitor";
import { useMutation } from "@apollo/client/react";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { createApolloClient } from "@/lib/apolloClient";
import { ADD_ITEM_TO_CART, CREATE_BACK_IN_STOCK_REQUEST, GET_PRODUCT_BY_ID, GET_PRODUCTS } from "@/graphql";
import SeoHeader from "@/components/seo/SeoHeader";
import ProductListGrid from "@/components/product/ProductListGrid";
import ProductModalPreview from "@/components/product/ProductModalPreview";
import ProductImageGrid from "@/components/product/ProductImageGrid";
import ProductContent from "@/components/product/ProductContent";
import SizeAssistance from "@/components/product/SizeAssistance";
import { toast } from 'react-toastify';
import { Const, ProductStatus, StockStatus } from "@/utils/Constant";
import { TokenManager } from "@/utils/tokenManager";
import { trackEcomEvent } from "@/utils/analytics";

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
  const { user, isLoggedIn } = useAuthStore((state) => state);
  const { openCart } = useCartStore((state) => state);
  const token = TokenManager.getAccessToken();
  const [addItemToCart, { loading }] = useMutation(ADD_ITEM_TO_CART);
  const [createNotifyRequest, { loading: notifyLoading }] = useMutation(CREATE_BACK_IN_STOCK_REQUEST);

  useEffect(() => {
    if (data) {
      trackEcomEvent.viewItem(data, variantMatched);
    }
  }, [data]);

  const handleAddToCart = async () => {
    if (!cartBtn || variantMatched.stockStatus === Const.OUT_OF_STOCK) return;

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
      toast.error(err.message || "Failed to add item to cart");
    }
  };

  const handleNotifyMe = async () => {
    if (variantMatched.stockStatus !== Const.OUT_OF_STOCK) return;
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
      toast.error(err.message || "Failed to notify");
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
            key={router.asPath}
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
    const client = createApolloClient();
    const queries = [
      client.query({
        query: GET_PRODUCT_BY_ID,
        variables: { slug },
      }),
      client.query({
        query: GET_PRODUCTS,
        variables: {
          offset: 0,
          limit: 5,
          filters: {
            categoryIds: ["6898b3cdddf0354e025da816"],
            status: ProductStatus.PUBLISHED,
            slugNotInclude: slug,
          },
        },
      }),
    ].filter(Boolean);

    const [productRes, productListRes] = await Promise.all(queries);
    return {
      props: {
        meta: productRes?.data?.getClientSideProductById?.meta || meta,
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
