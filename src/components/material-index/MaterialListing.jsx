"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

import MaterialGridCard from "@/components/common/card/MaterialGridCard";
import MaterialDetailModal from "@/components/material-index/MaterialDetailModal";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_DESCRIPTION =
  "A catalogue of cloth — where each fabric comes from, how it behaves, and what we build with it.";

export default function MaterialListing({
  materials = [],
  description = DEFAULT_DESCRIPTION,
}) {
  const [activeMaterial, setActiveMaterial] = useState(null);

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

    splitText(".material-listing__heading .split");

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".material-listing",
            start: "top 75%",
            end: "top 40%",
          },
        })
        .fromTo(
          ".material-listing__heading .split span",
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
  }, []);

  return (
    <>
      <section
        className={`material-listing${activeMaterial ? " material-listing--dimmed" : ""}`}
      >
        <div className="material-listing__header">
          <h2 className="material-listing__heading">
            <span className="split">Material </span>
            <span className="split heading-accent">Index</span>
          </h2>
          {description ? (
            <p className="material-listing__description">{description}</p>
          ) : null}
        </div>

        {!materials?.length ? (
          <p className="material-listing__empty">No materials listed yet.</p>
        ) : (
          <div className="material-listing__grid">
            {materials.map((material) => (
              <MaterialGridCard
                key={material.id}
                material={material}
                onSelect={setActiveMaterial}
              />
            ))}
          </div>
        )}
      </section>

      <MaterialDetailModal
        material={activeMaterial}
        onClose={() => setActiveMaterial(null)}
      />
    </>
  );
}
