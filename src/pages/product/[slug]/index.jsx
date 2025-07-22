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
gsap.registerPlugin(ScrollTrigger);
const ProductDetail = ({ meta, data, productList }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState({});

  useEffect(() => {
    if (window.innerWidth >= 1000) {
      const container = document.querySelector(".ProductDets_Big_img_wrap");
      const BlurContainer = document.querySelector(".ProductDets_grid");
      if (container) {
        const innerHeight = container.clientHeight;
        let sidebarHeight = "12.6117%";
        if (window.innerWidth >= 1300) {
          sidebarHeight = "12.6117%";
        } else if (window.innerWidth >= 1000) {
          sidebarHeight = "24.2424%";
        }

        gsap.fromTo(
          ".ProductDets_img_slider_bar",
          { height: sidebarHeight },
          {
            scrollTrigger: {
              trigger: container,
              start: "top top",
              end: `+=${innerHeight}`,
              scrub: true,
              markers: false,
            },
            top: "100%",
            transform: `translateY(-100%)`,
          }
        );
      } else {
        console.error(
          'Element with className "ProductDets_Big_img_wrap" not found.'
        );
      }
      // gsap.to(document.querySelector(".ProductDets_grid"), {
      //   // onComplete:()=>{
      //   //   gsap.to(document.querySelector(".ProductDets_grid"), {filter: "blur(10px)",duration:.5})
      //   // },
      //   onUpdate: function(self) {
      //     if (self.progress === 1) {
      //       gsap.to(".ProductDets_grid", { filter: "blur(10px)", duration: 0.5 });
      //     } else if (self.progress < 1) {
      //       gsap.to(".ProductDets_grid", { filter: "blur(0px)", duration: 0.5 });
      //     }
      //   },
      //   scrollTrigger: {
      //     trigger: ".Similar_prd_wrap",
      //     scroller:"body",
      //     start: "top 0%",
      //     end: "top -350%",
      //     scrub: true,
      //     markers: true,
      //   },
      //   filter: "blur(10px)",
      //   transform: "translateZ(0)",
      // });
    }
  }, []);

  useEffect(() => {
    ScrollTrigger.create({
      trigger: ".Similar_prd_wrap",
      scroller: "body",
      start: "top 0%",
      end: "top -350%",
      scrub: true,
      markers: false,
      onUpdate: (self) => {
        if (self.progress === 1) {
          gsap.to(".ProductDets_grid", { filter: "blur(10px)", duration: 0.5 });
        } else {
          gsap.to(".ProductDets_grid", { filter: "blur(0px)", duration: 0.5 });
        }
      },
    });
  }, []);

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
