import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import ProductCard from "../common/card/ProductCard";
import { getProductPriceLabel } from "@/utils/Util";

// PRD-014 FR-0.8: the server sends the featured set (index.jsx); this
// section never shows an endless skeleton: a failed load or an empty
// catalogue renders a state with a way forward.
const ProductSection = ({ data, sectionRef, totalCount = 0, loadError }) => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (loadError || !data || data.length === 0) {
    return (
      <div ref={sectionRef} id="shop" className="shop_state" role="status">
        <p>
          {loadError
            ? "We could not load the collection right now."
            : "New pieces are on their way. Check back soon."}
        </p>
        {loadError && (
          <button
            type="button"
            className="listing_button"
            onClick={() => router.replace(router.asPath)}
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  const getFirstAsset = (product) =>
    product?.assets && product.assets.length > 0 ? product.assets[0].path : "";

  const leftCard = (
    <ProductCard
      href={"/product/" + (data[0]?.slug || "")}
      src={getFirstAsset(data[0])}
      alt={data[0]?.name || ""}
      name={data[0]?.name || ""}
      price={getProductPriceLabel(data[0]?.variants)}
      product={data[0]}
      listName="Home products"
    />
  );

  return (
    <>
      <div ref={sectionRef} id="shop">
        {/* Desktop → left and right separate */}
        {!isMobile && <div className="product_left_section skeleton-loading">{leftCard}</div>}

        <div className="product_right_section">
          {/* Mobile → put left card here */}
          {isMobile && leftCard}

          {data.slice(1).map((item) => (
            <ProductCard
              key={item?._id}
              href={"/product/" + (item?.slug || "")}
              src={getFirstAsset(item)}
              alt={item?.name || ""}
              name={item?.name || ""}
              price={getProductPriceLabel(item?.variants)}
              product={item}
              listName="Home products"
            />
          ))}
        </div>
      </div>
      <div className="shop_view_all">
        <Link href="/products" className="listing_button">
          {totalCount > data.length ? `View all ${totalCount}` : "View all"}
        </Link>
      </div>
    </>
  );
};

export default ProductSection;
