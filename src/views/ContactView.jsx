"use client";

/**
 * Contact (was `pages/contact`). The live site's design (main, 2026-05):
 * address and support copy on the left, the 3D phone with a "Use a form"
 * call to action on the right, and the contact form in a side drawer.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { RxCross2 } from "react-icons/rx";
import ContactForm from "@/components/contact/ContactForm";
import AddressSection from "@/components/contact/AddressSection";
import BracketSlideCta from "@/components/common/BracketSlideCta";
import { useDialogA11y } from "@/hooks/useDialogA11y";

// three / R3F stay out of the main bundle and off the server (SF-17).
const PhoneModal = dynamic(() => import("@/components/contact/PhoneModal"), {
  ssr: false,
});

const Contact = () => {
  const sectionRef = useRef(null);
  const drawerRef = useRef(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const closeForm = useCallback(() => setIsFormOpen(false), []);

  // PRD-014 UX-31: focus moves into the drawer, Escape closes it.
  useDialogA11y(drawerRef, isFormOpen, closeForm);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!portalReady) return;
    document.body.style.overflow = isFormOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFormOpen, portalReady]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const children = section.querySelectorAll(".animate-item");

    gsap.set(section, { opacity: 0, y: 30 });
    gsap.set(children, { opacity: 0, y: 20, scale: 0.98 });

    const tl = gsap.timeline({
      defaults: { duration: 0.8, ease: "power3.out" },
    });

    tl.fromTo(section, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 });
    tl.fromTo(
      children,
      { opacity: 0, y: 20, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.12,
        duration: 0.8,
        ease: "back.out(1.3)",
      },
      "-=0.6"
    );

    return () => tl.kill();
  }, []);

  const formDrawer = portalReady
    ? createPortal(
        <div
          className={`contact-form-backdrop ${isFormOpen ? "is-open" : ""}`}
          onClick={closeForm}
          aria-hidden={!isFormOpen}
        >
          <div
            className="contact-form-drawer"
            ref={drawerRef}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Contact form"
            tabIndex={-1}
            inert={!isFormOpen}
          >
            <div className="contact-form-drawer-header">
              <span className="contact-form-drawer-header-title">
                Send a message
              </span>
              <button
                type="button"
                aria-label="Close contact form"
                onClick={closeForm}
              >
                <RxCross2 aria-hidden="true" />
              </button>
            </div>
            <div className="contact-form-drawer-body" data-lenis-prevent>
              <p className="contact-form-drawer-lead">
                Tell us what you need — sizing, orders, collaborations, or
                anything else. We read every note.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <section id="contact_form" ref={sectionRef}>
        <div className="contact-page">
          <div className="contact-page__split">
            <div className="contact-page__left animate-item">
              <header className="contact-page__header">
                <p className="contact-page__eyebrow">Customer Support</p>
                <h1 className="contact-page__title">
                  <span>Let&apos;s</span>{" "}
                  <span className="contact-page__title-accent">talk</span>
                </h1>
                <p className="contact-page__lead">
                  We believe in the power of digital, and we love collaborating
                  with brands that feel the same. Reach out — we&apos;re here to
                  help.
                </p>
              </header>

              <AddressSection />
            </div>

            <div className="contact-page__right animate-item">
              <div className="contact-page__phone-col">
                <PhoneModal />
                <BracketSlideCta
                  label="Use a form"
                  onClick={() => setIsFormOpen(true)}
                  className="contact-page__form-cta"
                  ariaLabel="Open contact form"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {formDrawer}
    </>
  );
};

export default Contact;
