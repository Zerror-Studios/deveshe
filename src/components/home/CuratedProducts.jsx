"use client";

import React, { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

import ProductGridCard from "@/components/common/card/ProductGridCard";
import ProductLoader from "@/components/loaders/ProductLoader";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_DESCRIPTION =
  "Discover handpicked pieces designed to elevate your everyday wardrobe.";

export default function CuratedProducts({
  products = [],
  categoryName,
  isShop = false,
  description,
}) {
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
  }, [categoryName]);

  return (
    <section
      className={`curated-container ${isShop ? "is-shop" : ""}`}
    >
      <div className="curated-header">
        <h2 className="curated-heading">
          <span className="split">Top </span>
          <span className="split heading-accent">Picks</span>
        </h2>
        {descriptionText ? (
          <p className="curated-description">{descriptionText}</p>
        ) : null}
      </div>
      {!products || products.length === 0 ? (
        <ProductLoader />
      ) : (
        <div className="curated-grid">
          {products.map((product) => (
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