"use client";

/**
 * Shop hero (live site design): the collection's cover with a parallax
 * scroll, its name and description, and the filter strip that fades in as
 * the hero scrolls away. Used by /shop and /shop/[categories].
 */

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import CuratedFilterStrip from "@/components/home/CuratedFilterStrip";

// The shop's own cover, also used by a category without a cover image.
export const SHOP_DEFAULT_HERO_IMAGE = "/assets/images/home/shop page.webp";

const HeroSection = ({
  heroImageSrc,
  categoryName,
  isDefault = false,
  showFilter = true,
  animateNav = true,
  categoryDescription,
}) => {
  // A category without a cover shows the shop's own cover.
  const resolvedSrc =
    isDefault || !heroImageSrc
      ? heroImageSrc || SHOP_DEFAULT_HERO_IMAGE
      : encodeURI(heroImageSrc);
  const sectionRef = useRef(null);
  const innerRef = useRef(null);
  const imgRef = useRef(null);
  const paragraphRef = useRef(null);
  const filterWrapRef = useRef(null);
  const categoryNameRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // The element, not the ref: React clears the ref before the cleanup
    const section = sectionRef.current;
    if (!section || !innerRef.current || !imgRef.current) return;

    const ctx = gsap.context(() => {
      const nav = document.querySelector("#nav");

      gsap.set(innerRef.current, { yPercent: 0, force3D: true });
      gsap.set(imgRef.current, {
        yPercent: 0,
        scale: 1,
        transformOrigin: "50% 0%",
        force3D: true,
      });
      if (filterWrapRef.current) {
        gsap.set(filterWrapRef.current, {
          autoAlpha: 0,
          pointerEvents: "none",
        });
      }

      gsap.to(innerRef.current, {
        yPercent: -100,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(imgRef.current, {
        yPercent: 100,
        scale: 1.5,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      if (nav) {
        gsap.set(nav, { yPercent: 0 });
        gsap.to(nav, {
          yPercent: -110,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "140px top",
            scrub: true,
          },
        });
      }
      // The category name exists only on /shop/[categories]
      gsap.to([paragraphRef.current, categoryNameRef.current].filter(Boolean), {
        color: "#fe0000",
        duration: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "bottom 60%",
          end: "bottom 50%",
          scrub: true,
        },
      });
      if (showFilter && filterWrapRef.current) {
        gsap.to(filterWrapRef.current, {
          autoAlpha: 1,
          pointerEvents: "auto",
          duration: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "bottom 60%",
            end: "bottom 50%",
            scrub: true,
          },
        });
      }

    }, section);

    return () => ctx.revert();
  }, [resolvedSrc, showFilter]);

  return (
    <div ref={sectionRef} className="shop_hero_section">
      <div className="shop_hero_section_content">
        {categoryName && (
          <span ref={categoryNameRef} className="shop_hero_section_category_name">{categoryName}</span>
        )}
        <p ref={paragraphRef}>{categoryDescription || "Discover our latest collection of outerwear. Carefully crafted from the finest fabrics and premium hardware."}</p>
        {showFilter ? (
          <div ref={filterWrapRef} className="shop_hero_filter_wrap">
            <CuratedFilterStrip />
          </div>
        ) : null}
      </div>
      <div ref={innerRef} className="shop_hero_section_inner">
        {/* The page's LCP: fetched first */}
        <img
          src={resolvedSrc}
          alt={categoryName ? `${categoryName} collection` : "DeVeSheDreams shop"}
          ref={imgRef}
          fetchPriority="high"
        />
      </div>
    </div>
  );
};

export default HeroSection
