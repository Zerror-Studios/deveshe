import Section1 from "@/components/contact/Section1";
import SeoHeader from "@/components/seo/SeoHeader";
import React from "react";

const Contact = ({ meta }) => {
  return (
    <>
      <SeoHeader meta={meta} />
      <Section1 />
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
