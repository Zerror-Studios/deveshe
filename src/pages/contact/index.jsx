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
    title: "Contact Us – DeVeSheDreams",
    description:
      "Get in touch with DeVeSheDreams for any queries, support, or feedback. Our team is here to assist you with your fashion experience.",
    keywords: [
      "DeVeSheDreams contact",
      "customer support",
      "help",
      "feedback",
      "reach us",
      "inquiries"
    ],
    primaryKeywords: ["DeVeSheDreams contact", "customer support"],
    author: "DeVeSheDreams",
    robots: "index, follow",
    og: {
      title: "Contact Us – DeVeSheDreams",
      description:
        "Reach out to DeVeSheDreams for support, inquiries, or feedback and let us assist you with your fashion experience."
    },
    twitter: {
      card: "summary_large_image",
      title: "Contact Us – DeVeSheDreams",
      description:
        "Contact DeVeSheDreams for any questions, support, or feedback. Our team is ready to help you."
    }
  };

  return { props: { meta } };
}
