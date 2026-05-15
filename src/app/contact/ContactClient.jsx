"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { RxCross2 } from "react-icons/rx";
import ContactForm from "@/components/contact/ContactForm";
import AddressSection from "@/components/contact/AddressSection";

const PhoneModal = dynamic(() => import("@/components/contact/PhoneModal"), {
  ssr: false,
});

export default function ContactClient() {
  const sectionRef = useRef(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

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
        stagger: 0.25,
        duration: 0.8,
        ease: "back.out(1.3)",
      },
      "-=0.6"
    );
  }, []);

  const formDrawer = portalReady
    ? createPortal(
        <div
          className={`contact-form-backdrop ${isFormOpen ? "is-open" : ""}`}
          onClick={() => setIsFormOpen(false)}
          aria-hidden={!isFormOpen}
        >
          <div
            className="contact-form-drawer"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Contact form"
          >
            <div className="contact-form-drawer-header">
              <span className="contact-form-drawer-header-title">Contact form</span>
              <button
                type="button"
                aria-label="Close contact form"
                onClick={() => setIsFormOpen(false)}
              >
                <RxCross2 />
              </button>
            </div>
            <div className="contact-form-drawer-body" data-lenis-prevent>
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
        <div className="contact-hero">
          <div className="animate-item contact-copy">
            <AddressSection onOpenForm={() => setIsFormOpen(true)} />
          </div>
          <div className="animate-item contact-phone">
            <PhoneModal />
          </div>
        </div>
      </section>
      {formDrawer}
    </>
  );
}

