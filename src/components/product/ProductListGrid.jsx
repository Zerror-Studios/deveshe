import React, { useLayoutEffect } from "react";
import { formatePrice } from "@/utils/Util";
import ProductCard from "../common/card/ProductCard";
import { useRouter } from "next/router";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const ProductListGrid = ({ title = "You may also like", data }) => {
  if (!data && data.length === 0) return;
  const router = useRouter();

  useLayoutEffect(() => {
    if (window.innerWidth < 576) return;

    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".Similar_prd_wrap",
          scroller: "body",
          start: "top bottom",
          end: "top 60%",
          scrub: true,
          invalidateOnRefresh: false,
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
    }, 280);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [router.asPath, data]);
  return (
    <div className="Similar_prd_wrap">
      <h2 className="Similar_prd_head">
        <span className="Similar_prd_like-this">{title || ""}</span>
      </h2>
      <div className="Similar_prd_cntr">
        {data?.slice(0, 4).map((item, idx) => {
          const minVariant = item?.variants.reduce((min, item) =>
            item.variantPrice < min.variantPrice ? item : min
          );
          return (
            <ProductCard
              key={idx}
              href={`/product/${item?._id || ""}`}
              src={item?.assets?.[0]?.path || ""}
              alt={item?.assets?.[0]?.altText || ""}
              name={item?.name || ""}
              price={`Starts from ${formatePrice(
                minVariant?.variantPrice || item?.discountedPrice || ""
              )}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProductListGrid;
