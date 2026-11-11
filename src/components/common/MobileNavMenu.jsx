"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import "@/styles/components/common/navbar-mobile-menu.css";

export default function MobileNavMenu({
  isOpen,
  onClose,
  expandedId,
  onToggleSection,
  isLoggedIn,
  onLogin,
  shopLinks = [],
  lookbookLinks = [],
  exploreLinks = [],
}) {
  const [portalReady, setPortalReady] = useState(false);

  const sections = [
    { id: "shop", label: "Shop", links: shopLinks },
    { id: "lookbook", label: "Lookbook", links: lookbookLinks },
    { id: "explore", label: "Explore", links: exploreLinks },
  ];

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!portalReady || !isOpen) return null;

  return createPortal(
    <div
      className="nav-mobile-backdrop"
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <div
        className="nav-mobile-popup"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="nav-mobile-popup__header">
          <span className="nav-mobile-popup__title">Menu</span>
          <button
            type="button"
            className="nav-mobile-popup__close"
            onClick={onClose}
          >
            [Close]
          </button>
        </header>

        <div className="nav-mobile-popup__body">
          {!isLoggedIn && (
            <div className="nav-mobile-popup__login">
              <button
                type="button"
                className="nav-mobile-popup__login-btn"
                onClick={onLogin}
              >
                Login / Signup
              </button>
            </div>
          )}

          {sections.map((section) => {
            const isExpanded = expandedId === section.id;
            const linkCount = section.links?.length ?? 0;

            return (
              <div key={section.id} className="nav-mobile-popup__section">
                <button
                  type="button"
                  className="nav-mobile-popup__row"
                  aria-expanded={isExpanded}
                  onClick={() => onToggleSection(section.id)}
                >
                  <span className="nav-mobile-popup__row-label">
                    {section.label}
                    {linkCount > 0 && (
                      <span className="nav-mobile-popup__count">
                        {" "}
                        / {linkCount}
                      </span>
                    )}
                  </span>
                  <span className="nav-mobile-popup__toggle">
                    [{isExpanded ? "−" : "+"}]
                  </span>
                </button>
                <div
                  className={`nav-mobile-popup__options-wrap${
                    isExpanded ? " is-open" : ""
                  }`}
                >
                  <div className="nav-mobile-popup__options">
                    {section.links.map((item) => (
                      <Link
                        key={`${section.id}-${item.href}-${item.name}`}
                        href={item.href}
                        className="nav-mobile-popup__link"
                        onClick={onClose}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <footer className="nav-mobile-popup__footer">
          <div className="nav-mobile-popup__contact">
            <p>contact us</p>
            <p>
              deveshedreams@gmail.com
              <br />
              +919833983775
            </p>
          </div>
          <div className="nav-mobile-popup__social">
            <a
              href="https://www.instagram.com/de_ve_she_dreams"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              Instagram
            </a>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}
