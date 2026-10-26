import React, { useEffect, useLayoutEffect, useState } from "react";
import { getProductPriceLabel } from "@/utils/Util";
import ProductCard from "../common/card/ProductCard";
import { useRouter } from "next/router";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { StockStatus } from "@/utils/Constant";
import { CtaEnum, trackCtaClick } from "@/utils/analytics-events.util";
import { SOLD_OUT_LABEL } from "@/utils/stock-signal.util";
gsap.registerPlugin(ScrollTrigger);

// 2 / 3 / 5 columns (styles/home.css `.Similar_prd_cntr`), RPERF-12.
const SIMILAR_GRID_SIZES =
  "(max-width: 576px) 50vw, (max-width: 1000px) 33vw, 20vw";

const ProductListGrid = ({
  title = "You may also like",
  data,
  isOutOfStock,
  isSoldOut = false,
  loading,
  notifyLoading,
  handleAddToCart,
  handleNotifyMe,
  cartBtn,
  finalPrice,
  analyticsItemId,
}) => {
  if (!data && data.length === 0) return;
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 576);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // PRD-020 FR-13: the mobile bag button mirrors the PDP's state.
  const unavailableLabel = isSoldOut ? SOLD_OUT_LABEL : StockStatus.UNAVAILABLE;

  const handleAddToBagClick = () => {
    trackCtaClick(CtaEnum.ADD_TO_CART, { itemId: analyticsItemId });
    handleAddToCart();
  };

  const handleNotifyClick = () => {
    trackCtaClick(CtaEnum.NOTIFY_ME, { itemId: analyticsItemId });
    handleNotifyMe?.();
  };

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

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 280);

    return () => {
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, [router.asPath, data]);
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
              price={getProductPriceLabel(item?.variants)}
              sizes={SIMILAR_GRID_SIZES}
              product={item}
              listName={title}
            />
          );
        })}
      </div>

      <div className="ProductDets_Notify_wrap mobile_add_btn">
        <button
          className="ProductDets_ntfy_btn ProductDets_ntfy_btn_grid"
          id="easysize-cart-button"
          style={loading ? { backgroundColor: "black" } : {}}
          onClick={handleAddToBagClick}
        >
          {loading ? (
            <div className="ani-wrap">
              <div className="ani-main" />
            </div>
          ) : (
            <>
              <span className="ProductDets_ntfy_btn_slect_size">
                {!cartBtn ? "Select a Size" : isOutOfStock ? unavailableLabel : "Add to Bag"}
              </span>
              <span className="ProductDets_ntfy_btn_AddtoBeg">{isOutOfStock ? unavailableLabel : "Add to Bag"}</span>
              <div className="ProductDets_ntfy_btn_price">
                <span>{finalPrice} INR</span>
              </div>
            </>
          )}
        </button>
        {isOutOfStock && handleNotifyMe && (
          <button
            className="ProductDets_ntfy_btn ProductDets_ntfy_btn_grid"
            style={notifyLoading ? { backgroundColor: "black" } : {}}
            onClick={handleNotifyClick}
          >
            {notifyLoading ? (
              <div className="ani-wrap">
                <div className="ani-main" />
              </div>
            ) : (
              <span className="ProductDets_ntfy_btn_AddtoBeg">Notify me</span>
            )}
          </button>
        )}
        <p className="ProductDets_info_text sql38zc _1l9nr81o">
          Complimentary shipping on orders above 5000 INR.
        </p>
      </div>
    </div>
  );
};

export default ProductListGrid;
