import React, { Suspense, useEffect, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import ProductLoader from "@/components/loaders/ProductLoader";
import SeoHeader from "@/components/seo/SeoHeader";
import ProductListGrid from "@/components/product/ProductListGrid";
import ProductModalPreview from "@/components/product/ProductModalPreview";
import ProductImageGrid from "@/components/product/ProductImageGrid";
import { createApolloClient } from "@/lib/apolloClient";
import { GET_PRODUCT_BY_ID, GET_PRODUCTS } from "@/graphql";
import ProductContent from "@/components/product/ProductContent";
import { useRouter } from "next/router";
gsap.registerPlugin(ScrollTrigger);
const ProductDetail = ({ meta, data, productList }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (window.innerWidth < 576) return;

    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".ProductDets_grid",
          start: "bottom bottom", // when the top hits the top of the viewport
          end: "bottom center", // when the bottom hits the top of the viewport (i.e., scrolls out)
          scrub: true,
        },
      });

      tl.fromTo(
        ".ProductDets_grid",
        { filter: "blur(0px)" },
        { filter: "blur(10px)", ease: "none" }
      );
    });

    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [router.asPath]);

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
              <ProductContent data={data || {}} />
            </div>
            <ProductListGrid data={productList} />
          </div>
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
