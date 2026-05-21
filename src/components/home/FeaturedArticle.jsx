"use client";

import BracketSlideCta from "@/components/common/BracketSlideCta";
import Image from "next/image";
import React, { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedArticle() {
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

    return (
        <section className="article-container">
            <p className="article-heading">
                <span className="split">Latest </span>
                <span className="split heading-accent">Blogs</span>
            </p>
            {/* 🔥 HERO IMAGE */}
            <div className="article-imageWrapper">
                <Image
                    width={1000}
                    height={1000}
                    src="https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F2796x1573%2Fdefb514004%2Fj-sam-ban.jpg&w=1920&q=90" // replace with your image
                    alt="article"
                    className="article-image"
                />
            </div>

            {/* 🔥 CONTENT */}
            <div className="article-content">
                <h2 className="article-title">
                What to wear in 40&deg;C without looking like you gave up 
                </h2>

                <p className="article-desc">
                Why is linen the only fabric that makes sense in the Indian Summer?...
                </p>


                <BracketSlideCta
                    label="Read more"
                    href="/blog/what-to-wear-in-40c-without-looking-like-you-gave-up"
                    ariaLabel="Read more"
                />
            </div>
        </section>
    );
}