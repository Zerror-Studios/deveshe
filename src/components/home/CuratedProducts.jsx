"use client";

import React, { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

import CuratedProductCard from "@/components/common/card/CuratedProductCard";
import { getProductPriceLabel } from "@/utils/Util";
import ProductLoader from "@/components/loaders/ProductLoader";

gsap.registerPlugin(ScrollTrigger);

function getFirstAsset(product) {
  return product?.assets?.length ? product.assets[0].path : "";
}

export default function CuratedProducts({
  products = [],
  categoryName,
  isShop = false,
}) {
  useEffect(() => {
    const splitText = (selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        el.removeAttribute("data-split");
        const letters = (el.textContent || "")
          .split("")
          .map((char) =>
            char === " " ? `<span>&nbsp;</span>` : `<span>${char}</span>`
          );
        el.innerHTML = letters.join("");
        el.dataset.split = "true";
      });
    };

    splitText(".curated-heading .split");

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".curated-container",
            start: "top 75%",
            end: "top 40%",
          },
        })
        .fromTo(
          ".curated-heading .split span",
          { rotateX: "90deg" },
          {
            duration: 0.8,
            rotateX: "0deg",
            stagger: 0.03,
            ease: "bounce.out",
          }
        );

      setTimeout(() => ScrollTrigger.refresh(), 200);
    });

    return () => ctx.revert();
  }, [categoryName]);

  return (
    <section
      className={`curated-container ${isShop ? "is-shop" : ""}`}
    >
      <h2 className="curated-heading">
        <span className="split">Latest / </span>
        <span className="split heading-accent">Curated</span>
      </h2>
      {!products || products.length === 0 ? (
        <ProductLoader />
      ) : (
        <div className="curated-grid">
          {products.map((product) => (
            <CuratedProductCard
              key={product?._id || product?.slug}
              href={"/product/" + (product?.slug || "")}
              src={getFirstAsset(product)}
              alt={product?.name || ""}
              name={product?.name || ""}
              price={getProductPriceLabel(
                product?.variants,
                product?.discountedPrice
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}