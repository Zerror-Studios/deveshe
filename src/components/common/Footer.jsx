import Link from "next/link";
import React from "react";
import NoiseOverlay from "@/components/common/NoiseOverlay";

const Footer = () => {
  return (
    <footer>
      <NoiseOverlay className="noise--footer" />

      {/* Hero */}
      <div className="footer-hero">
        <h2 className="footer-hero-headline">
          Made to be worn.<br />
          Or judged. Or both.
        </h2>
        <div className="footer-copyright-badge">
          <span className="copy-symbol">©</span>26
        </div>
      </div>

      {/* Description */}
      <p className="footer-description">
        <span className="footer-description__line">
          Created by the DeVeSheDreams team, this store and
        </span>
        <span className="footer-description__line">
          signature collection celebrates our collective creativity
        </span>
        <span className="footer-description__line">
          and passion for apparel. Carefully designed.
        </span>
      </p>

      {/* Divider */}
      <hr className="footer-divider" />

      {/* Bottom grid */}
      <div className="footer-bottom">

        {/* Brand */}
        <div className="footer-brand">
          <p>DeVeSheDreams</p>
          <p>All rights reserved © 2026</p>
        </div>

        {/* Policy */}
        <div className="footer-policy">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/shipping-returns">Shipping & Returns</Link>
          <Link href="/terms-of-service">Terms of Service</Link>
        </div>

        {/* Nav */}
        <div className="footer-links">
          <Link href="/shop">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/blogs">Blogs</Link>
          <Link href="/contact">Customer Support</Link>
          <Link href="/material-index">Material Index</Link>
        </div>

        {/* Social */}
        <div className="footer-social">
          <a
            href="https://www.instagram.com/de_ve_she_dreams"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        </div>
        

      </div>

    </footer>
  );
};

export default Footer;