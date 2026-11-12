import Link from "next/link";
import React from "react";
import { openConsentPreferences } from "@zcom/storefront-kit/core";
import NewsletterForm from "./NewsletterForm";

const Footer = () => {
  return (
    <footer>
      <div className="noise-overlay" aria-hidden="true"></div>

      {/* Hero */}
      <div className="footer-hero">
        <h2 className="footer-hero-headline">
          <span className="footer-hero-headline__line">Made to be worn.</span>
          <span className="footer-hero-headline__line">Or judged.</span>
          <span className="footer-hero-headline__line">Or both.</span>
        </h2>
        <div className="footer-copyright-badge">
          <span className="copy-symbol">©</span>26
        </div>
      </div>

      {/* Description + newsletter (PRD-014 FR-2.8, UX-29) */}
      <div className="footer-intro">
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
        <NewsletterForm />
      </div>

      {/* Divider */}
      <hr className="footer-divider" />

      {/* Bottom grid */}
      <div className="footer-bottom">

        {/* Brand */}
        <div className="footer-brand">
          <p>© 2026.</p>
          <p>All rights reserved.</p>
          <p className="footer-dev-credit">
            Developed by{" "}
            <a
              href="https://zerrorstudios.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Zerror Studios
            </a>
            .
          </p>
        </div>

        {/* Pages */}
        <div className="footer-links">
          <Link href="/shop">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/blogs">Blogs</Link>
          <Link href="/contact">Customer Support</Link>
          <Link href="/material-index">Material Index</Link>
        </div>

        {/* Policy */}
        <div className="footer-policy">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/shipping-returns">Shipping & Returns</Link>
          <Link href="/terms-of-service">Terms of Service</Link>
          {/* PRD-014 FR-1.9: reopens the consent banner */}
          <button
            type="button"
            className="footer_consent_btn"
            onClick={openConsentPreferences}
          >
            Cookie Preferences
          </button>
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