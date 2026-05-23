"use client";

import BracketSlideCta from "@/components/common/BracketSlideCta";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedArticle({ blog }) {
  useEffect(() => {
    const splitText = (selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        if (!el.dataset.split) {
          const letters = (el.textContent || "")
            .split("")
            .map((char) =>
              char === " " ? `<span>&nbsp;</span>` : `<span>${char}</span>`
            );
          el.innerHTML = letters.join("");
          el.dataset.split = "true";
        }
      });
    };

    splitText(".article-heading .split");

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".article-container",
            start: "top 75%",
            end: "top 40%",
          },
        })
        .fromTo(
          ".article-heading .split span",
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

  if (!blog?.slug) return null;

  const href = `/blogs/${blog.slug}`;
  const imageSrc = blog.image || "";
  const imageAlt = blog.imageAlt || blog.title || "Latest blog";

  return (
    <section className="article-container">
      <p className="article-heading">
        <span className="split">Latest </span>
        <span className="split heading-accent">Blogs</span>
      </p>

      {imageSrc ? (
        <Link
          href={href}
          className="article-imageLink"
          aria-label={`Read article: ${blog.title}`}
        >
          <div className="article-imageWrapper">
            <Image
              width={1000}
              height={1000}
              src={imageSrc}
              alt={imageAlt}
              className="article-image"
            />
          </div>
        </Link>
      ) : null}

      <div className="article-content">
        <Link href={href} className="article-titleLink">
          <h2 className="article-title">{blog.title}</h2>
        </Link>

        {blog.excerpt ? (
          <p className="article-desc">{blog.excerpt}</p>
        ) : null}

        <BracketSlideCta
          label="Read more"
          href={href}
          ariaLabel={`Read more: ${blog.title}`}
        />
      </div>
    </section>
  );
}
