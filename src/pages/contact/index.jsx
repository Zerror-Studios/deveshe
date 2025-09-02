import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import SeoHeader from "@/components/seo/SeoHeader";
import PhoneModal from "@/components/contact/PhoneModal";
import ContactForm from "@/components/contact/ContactForm";
import AddressSection from "@/components/contact/AddressSection";

const Contact = ({ meta }) => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const children = section.querySelectorAll(".animate-item");

    // Hide everything initially
    gsap.set(section, { opacity: 0, y: 30 });
    gsap.set(children, { opacity: 0, y: 20, scale: 0.98 });

    const tl = gsap.timeline({ defaults: { duration: 0.8, ease: "power3.out" } });

    // Animate the section
    tl.fromTo(
      section,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1 }
    );

    // Animate children with fluid motion
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
      "-=0.6" // overlap with section animation for smoothness
    );
  }, []);

  return (
    <>
      <SeoHeader meta={meta} />
      <section id="contact_form" ref={sectionRef}>
          <PhoneModal />
        <div className="animate-item">
          <ContactForm />
        </div>
        <div className="animate-item">
          <AddressSection />
        </div>
      </section>
    </>
  );
};

export default Contact;

export async function getStaticProps() {
  const meta = {
    title: "Contact – DeVeSheDreams",
    description:
      "Got a question or collaboration idea? Contact DeVeSheDreams for customer support, press inquiries, or artist partnerships. We'd love to hear from you!",
    keywords:
      "contact DeVeSheDreams, customer service, fashion brand email, artist collaboration, support",
    author: "DeVeSheDreams",
    robots: "index,follow",
  };
  return { props: { meta } };
}
