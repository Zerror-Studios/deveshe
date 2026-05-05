"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import ContactForm from "@/components/contact/ContactForm";
import AddressSection from "@/components/contact/AddressSection";

const PhoneModal = dynamic(() => import("@/components/contact/PhoneModal"), {
  ssr: false,
});

export default function ContactClient() {
  const sectionRef = useRef(null);

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

  return (
    <section id="contact_form" ref={sectionRef}>
      <PhoneModal />
      <div className="animate-item">
        <ContactForm />
      </div>
      <div className="animate-item">
        <AddressSection />
      </div>
    </section>
  );
}

