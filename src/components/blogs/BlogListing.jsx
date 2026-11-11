"use client";

import React, { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

import BlogGridCard from "@/components/common/card/BlogGridCard";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_DESCRIPTION =
  "Stories on style, fabric, and wearing what you mean.";

export default function BlogListing({
  posts = [],
  description = DEFAULT_DESCRIPTION,
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

    splitText(".blog-listing__heading .split");

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".blog-listing",
            start: "top 75%",
            end: "top 40%",
          },
        })
        .fromTo(
          ".blog-listing__heading .split span",
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
    <section className="blog-listing">
      <div className="blog-listing__header">
        <h2 className="blog-listing__heading">
          <span className="split">Latest </span>
          <span className="split heading-accent">Blogs</span>
        </h2>
        {description ? (
          <p className="blog-listing__description">{description}</p>
        ) : null}
      </div>

      {!posts?.length ? (
        <p className="blog-listing__empty">No blog posts yet.</p>
      ) : (
        <div className="blog-listing__grid">
          {posts.map((post) => (
            <BlogGridCard key={post?._id || post?.slug} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
