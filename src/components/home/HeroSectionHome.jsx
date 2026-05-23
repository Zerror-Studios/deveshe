import React from "react";
import Image from "next/image";
import Link from "next/link";

const HERO_SLIDES = [
  {
    image: "/assets/images/home/Homepage1.webp",
    alt: "Tops collection",
    title: "Tops",
    description:
      "Easy layers and statement pieces — built for everyday dopamine dressing.",
    href: "/shop/tops",
    cta: "Shop tops",
  },
  {
    image: "/assets/images/home/Homepage2.webp",
    alt: "Jackets collection",
    title: "Jackets",
    description:
      "Outerwear with personality — structure, print, and warmth for every mood.",
    href: "/shop/jackets",
    cta: "Shop jackets",
  },
  {
    image: "/assets/images/home/Homepage3.webp",
    alt: "Dresses collection",
    title: "Dresses",
    description:
      "Dreamy silhouettes and bold prints — each dress is a feeling, stitched in.",
    href: "/shop/dresses",
    cta: "Shop dresses",
  },
  {
    image: "/assets/images/home/Homepage4.webp",
    alt: "Co-ord sets collection",
    title: "Co-ord sets",
    description:
      "Matching sets, zero guesswork — polished from head to toe in one move.",
    href: "/shop/co-cord-sets",
    cta: "Shop co-ord sets",
  },
];

const HeroSectionHome = () => {
  return (
    <div id="hero_section_home">
      {HERO_SLIDES.map((slide) => (
        <Link
          href={slide.href}
          className="home_banner_container_inner home_banner_container_inner--link"
          key={slide.href}
          aria-label={`${slide.title} — ${slide.cta}`}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            width={1000}
            height={1000}
            priority={slide.href === HERO_SLIDES[0].href}
          />
          <div className="home-hero-slide__content">
            <h2 className="home-hero-slide__title">{slide.title}</h2>
            <p className="home-hero-slide__description">{slide.description}</p>
            <span className="common-btn common-btn--light home-hero-slide__cta">
              {slide.cta}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default HeroSectionHome;
