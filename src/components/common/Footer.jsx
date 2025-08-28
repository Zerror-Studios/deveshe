import { MenuData } from "@/helpers/MenuData";
import Link from "next/link";
import React from "react";
import CommonButton from "./CommonButton";

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
          <CommonButton title={"Sign up to the newsletter"} href={"/"} />
        </div>
      </div>
      <div id="footer_bottom">
        <p>© 2025 De Ve She Dreams. All rights reserved.</p>
        <div>
          Developed by{" "}
          <a target="_black" href="https://www.zerrorstudios.com/">
            Zerror Studios
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
