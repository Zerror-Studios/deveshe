import React, { useEffect, useLayoutEffect, useState } from "react";
import { getProductPriceLabel } from "@/utils/Util";
import ProductCard from "../common/card/ProductCard";
import { usePathname, useSearchParams } from "next/navigation";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { StockStatus } from "@/utils/Constant";
gsap.registerPlugin(ScrollTrigger);

const ProductListGrid = ({
  title = "You may also like",
  data,
  isOutOfStock,
  loading,
  handleAddToCart,
  cartBtn,
  finalPrice,
}) => {
  if (!data && data.length === 0) return;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);

  // detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 576);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useLayoutEffect(() => {
    if (window.innerWidth < 1000) return;

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
  }, [pathname, searchParams, data]);
  return (
    <div className="Similar_prd_wrap">
      <h2 className="Similar_prd_head">
        <span className="Similar_prd_like-this">{title || ""}</span>
      </h2>
      <div className="Similar_prd_cntr">
        {(!isMobile ? data : data?.slice(0, 4))?.map((item, idx) => {
          return (
            <ProductCard
              key={idx}
              href={`/product/${item?.slug || ""}`}
              src={item?.assets?.[0]?.path || ""}
              alt={item?.assets?.[0]?.altText || ""}
              name={item?.name || ""}
              price={getProductPriceLabel(
                item?.variants,
                item?.discountedPrice
              )}
            />
          );
        })}
      </div>

      <div className="ProductDets_Notify_wrap mobile_add_btn">
        <button
          className="ProductDets_ntfy_btn ProductDets_ntfy_btn_grid"
          id="easysize-cart-button"
          style={loading ? { backgroundColor: "black" } : {}}
          onClick={handleAddToCart}
        >
          {loading ? (
            <div className="ani-wrap">
              <div className="ani-main" />
            </div>
          ) : (
            <>
              <span className="ProductDets_ntfy_btn_slect_size">
                {!cartBtn ? "Select a Size" : isOutOfStock ? StockStatus.OUT_OF_STOCK : "Add to Bag"}
              </span>
              <span className="ProductDets_ntfy_btn_AddtoBeg">{isOutOfStock ? StockStatus.OUT_OF_STOCK : "Add to Bag"}</span>
              <div className="ProductDets_ntfy_btn_price">
                <span>{finalPrice} INR</span>
              </div>
            </>
          )}
        </button>
        <p className="ProductDets_info_text sql38zc _1l9nr81o">
          Complimentary shipping on orders above 5000 INR.
        </p>
      </div>
    </div>
  );
};

export default ProductListGrid;
