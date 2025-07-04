import Link from "next/link";
import React from "react";
import Button from "./Button";
import { footerLinks, footerNavlinks } from "@/helpers";
import LinksDot from "@/components/LinksDot";

const Footer = () => {
  return (
    <div className="Footer_wrapper">
      <div className="Footer_cntr">
        <nav className="fotter_nav" aria-label="Primary navigation links">
          <ul className="footer_nav_ul">
            {Object.keys(footerLinks).map((section, sectionIndex) => {
              return (
                <li
                  key={sectionIndex}
                  className="footer_nav_ul_list _list-links"
                >
                  <p className="">{section}</p>
                  <ul>
                    {footerLinks[section].map((link, linkIndex) => (
                      <li
                        key={linkIndex}
                        className="_list-links _list-links-redirect"
                      >
                        <Link href={link.path} passHref className="footer_links links">
                          <LinksDot>{link.name}</LinksDot>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="_btn-width">
          <div className="footer_nav_signup_btn_cntr">
            <div className="footer_nav_signup_btn_align">
              <Button className="_btn-width">Sign up to the newsletter</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="Footer_SocialLinks_cntr">
        <nav aria-label="Additional navigation links">
          <ul className="Footer_SocialLinks_bottom">
            {footerNavlinks.map((item, id) => {
              return (
                <li key={id} className="">
                  <Link href={item.path} className="links">
                    <linksDot>{item.name}</linksDot>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Footer;
