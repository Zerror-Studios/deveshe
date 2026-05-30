"use client";

import React, { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

import ProductGridCard from "@/components/common/card/ProductGridCard";
import ProductLoader from "@/components/loaders/ProductLoader";
import { useShopFilter } from "@/context/ShopFilterContext";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_DESCRIPTION =
  "Handpicked styles to elevate your everyday look.";

const EMPTY_FILTER_MESSAGE =
  "No products match your filters. Try adjusting or resetting filters above.";

function getEmptyProductsMessage(categoryName, isShop) {
  if (isShop && categoryName?.trim()) {
    return `Nothing in ${categoryName.trim()} yet—the rack's taking a breather. Check back soon.`;
  }
  if (isShop) {
    return "The shop's gone quiet for now. Fresh pieces landing soon.";
  }
  return "No products here yet—the rack's taking a breather.";
}

function getCuratedHeading(categoryName, isShop) {
  if (!isShop || !categoryName?.trim()) {
    return { primary: "Top ", accent: "Picks" };
  }

  const words = categoryName.trim().split(/\s+/);
  if (words.length === 1) {
    return { primary: "", accent: words[0] };
  }

  const accent = words.pop();
  return { primary: `${words.join(" ")} `, accent };
}

export default function CuratedProducts({
  products = [],
  categoryName,
  isShop = false,
  description,
}) {
  const shopFilter = useShopFilter();
  const sourceProducts = shopFilter?.products ?? products;
  const displayProducts = shopFilter?.filteredProducts ?? products;
  const heading = getCuratedHeading(categoryName, isShop);
  const descriptionText =
    description ??
    (isShop && categoryName
      ? `Explore our curated ${categoryName} selection.`
      : DEFAULT_DESCRIPTION);

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
  }, [heading.primary, heading.accent]);

  return (
    <section
      className={`curated-container ${isShop ? "is-shop" : ""}`}
    >
      <div className="curated-header">
        <h2 className="curated-heading">
          {heading.primary ? (
            <span className="split">{heading.primary}</span>
          ) : null}
          <span className="split heading-accent">{heading.accent}</span>
        </h2>
        {descriptionText ? (
          <p className="curated-description">{descriptionText}</p>
        ) : null}
      </div>
      {!displayProducts || displayProducts.length === 0 ? (
        shopFilter?.hasActiveFilters && sourceProducts?.length > 0 ? (
          <p className="curated-description curated-grid__empty">
            {EMPTY_FILTER_MESSAGE}
          </p>
        ) : sourceProducts == null ? (
          <ProductLoader />
        ) : (
          <div className="curated-grid__empty curated-empty">
            <p className="curated-empty__message">
              {getEmptyProductsMessage(categoryName, isShop)}
            </p>
          </div>
        )
      ) : (
        <div className="curated-grid">
          {displayProducts.map((product) => (
            <ProductGridCard
              key={product?._id || product?.slug}
              product={product}
            />
          ))}
        </div>
      )}
    </section>
  );
}