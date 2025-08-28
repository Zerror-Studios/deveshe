import React from "react";
import SeoHeader from "@/components/seo/SeoHeader";
import PhoneModal from "@/components/contact/PhoneModal";
import ContactForm from "@/components/contact/ContactForm";
import AddressSection from "@/components/contact/AddressSection";

const Contact = ({ meta }) => {
  return (
    <>
      <SeoHeader meta={meta} />
      <section id="contact_form">
        <PhoneModal />
        <ContactForm />
        <AddressSection />
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
