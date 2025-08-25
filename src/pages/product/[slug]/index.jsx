import React, { Suspense, useEffect, useRef, useState } from "react";

import ProductLoader from "@/components/loaders/ProductLoader";
import SeoHeader from "@/components/seo/SeoHeader";
import ProductListGrid from "@/components/product/ProductListGrid";
import ProductModalPreview from "@/components/product/ProductModalPreview";
import ProductImageGrid from "@/components/product/ProductImageGrid";
import { createApolloClient } from "@/lib/apolloClient";
import { GET_PRODUCT_BY_ID, GET_PRODUCTS } from "@/graphql";
import ProductContent from "@/components/product/ProductContent";
import { useRouter } from "next/router";
import SizeAssistance from "@/components/product/SizeAssistance";

const ProductDetail = ({ meta, data, productList }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState({});
  const router = useRouter();

  const [showSizeAssist, setShowSizeAssist] = useState(false);

  const handleOpen = () => {
    setShowSizeAssist(true);
  };

  const handleClose = () => setShowSizeAssist(false);

  return (
    <>
      <SeoHeader meta={meta} />
      <Suspense fallback={<ProductLoader />}>
        <div className="ProductDetails_wrapper">
          <div className="ProductDetails_cntr">
            <div className="ProductDets_main"></div>
            <div className="ProductDets_grid">
              <ProductImageGrid
                assets={data?.assets || []}
                setSelectedAsset={setSelectedAsset}
              />
              <ProductContent handleOpen={handleOpen} data={data || {}} />
            </div>
            <ProductListGrid key={router.asPath} data={productList} />
          </div>
          <div className="ProductDets_Notify_wrap mobile_add_btn">
            <button
              className="ProductDets_ntfy_btn ProductDets_ntfy_btn_grid"
              id="easysize-cart-button"
              // style={loading ? { backgroundColor: "black" } : {}}
              // onClick={handleAddToCart}
            >
              {/* {loading ? (
              <div className="ani-wrap">
                <div className="ani-main" />
              </div>
            ) : ( */}
              <>
                <span className="ProductDets_ntfy_btn_slect_size">
                  {/* {!cartBtn ? "Select a Size" : "Add to Bag"} */}
                </span>
                <span className="ProductDets_ntfy_btn_AddtoBeg">
                  Add to Bag
                </span>
                <div className="ProductDets_ntfy_btn_price">
                  <span>3999 INR</span>
                </div>
              </>
              {/* )} */}
            </button>
            <p className="ProductDets_info_text sql38zc _1l9nr81o">
              Complimentary shipping on orders above 5000 INR.
            </p>
          </div>
          {showSizeAssist && (
            <SizeAssistance
              onClose={handleClose}
            />
          )}
        </div>
      </Suspense>
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
