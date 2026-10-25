import { MenuData } from "@/helpers/MenuData";
import Link from "next/link";
import React from "react";
import NewsletterForm from "./NewsletterForm";
import { openConsentPreferences } from "@/utils/consent.util";

const Footer = () => {
  return (
    <footer id="footer">
      <div id="footer_top">
        <div id="footer_links">
          <div className="footer_link_wrap">
            <p>Quicklinks</p>
            {MenuData.map((link, idx) => (
              <Link key={idx} href={link.link}>
                {link.name}
              </Link>
            ))}
          </div>
          <div className="footer_link_wrap">
            <p>Customer Care</p>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/shipping-returns">Shipping & Returns</Link>
            <Link href="/terms-of-service">Terms Of Service</Link>
            {/* PRD-014 FR-1.9: reopens the consent banner */}
            <button
              type="button"
              className="footer_consent_btn"
              onClick={openConsentPreferences}
            >
              Cookie Preferences
            </button>
          </div>
          <div className="footer_link_wrap">
            <p>Social</p>
            <a
              target="_blank"
              href="https://www.instagram.com/de_ve_she_dreams"
            >
              Instagram
            </a>
          </div>
        </div>
        <div id="footer_btn">
          {/* PRD-014 FR-2.8 (UX-29): a real sign-up, not a link to "/" */}
          <NewsletterForm />
        </div>
      </div>
      <div id="footer_bottom">
        <div>
          Developed by{" "}
          <a target="_black" href="https://www.zerrorstudios.com/">
            Zerror Studios
          </a>
        </div>
        <p>© 2025. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
