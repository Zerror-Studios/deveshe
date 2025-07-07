import SeoHeader from "@/components/seo/SeoHeader";
import React from "react";

const privacyPolicy = ({meta}) => {
  return (
   <>
   <SeoHeader meta={meta} />
    <div id="legal-page">
      <h2>Privacy Policy</h2>
      <div className="legal-container">
        <p>
          [Company Name] ("we" or "us") values your privacy and is committed to
          protecting your personal information. Here's a summary of how we
          collect, use, and share your data:
        </p>
        <p>
          <strong>Information We Collect:</strong> We may collect personal
          information such as contact details and payment information when you
          interact with us.
        </p>
        <p>
          <strong>Use of Information:</strong> We use your information to
          process orders, provide customer support, and improve our products and
          services.
        </p>
        <p>
          <strong>Sharing Your Information:</strong> We may share your
          information with trusted third parties for order fulfillment and
          marketing purposes.
        </p>
        <p>
          <strong>Cookies and Tracking:</strong> We use cookies to enhance your
          browsing experience and deliver personalized content and ads.
        </p>
        <p>
          <strong>Data Security:</strong> We take reasonable measures to protect
          your information, but no method is 100% secure.
        </p>
        <p>
          <strong>Your Choices:</strong> You have the right to access, correct,
          or delete your data and unsubscribe from marketing communications.
        </p>
        <p>
          We respect your privacy and prioritize the protection of your personal
          information. When you use our service, we may request certain
          personally identifiable information that enables us to contact or
          identify you.
        </p>
        <p>
          This information may include, but is not limited to (1)Email address
          (2)First name and last name (3) Phone number (4) Address (5) State or
          province (6) ZIP/Postal code (7) City
        </p>
        <p>
          We value your trust and are committed to protecting your personal
          information. We assure you that we will not sell, distribute, or lease
          your personal information to any third party unless we have obtained
          your explicit permission or are legally obligated to do so.
        </p>
        <p>
          We strive to maintain accurate and complete information about you. If
          you believe that any information we hold about you is inaccurate or
          incomplete, please contact us promptly. You can reach us by writing or
          emailing us at{" "}
          <a target="_blank" href="mailto:companyemailaddress@gmail.com">
            companyemailaddress@gmail.com
          </a>
          , and we will promptly make the necessary updates or corrections.
        </p>
        <p>
          Your privacy is our priority, and we appreciate your cooperation in
          ensuring the accuracy of your personal information.
        </p>
      </div>
    </div>
   </>
  );
};

export default privacyPolicy;


export async function getStaticProps() {
  const meta = {
    title: "Privacy Policy – DeVeSheDreams",
    description:
      "Learn how DeVeSheDreams collects, uses, and protects your personal information while shopping with us.",
    keywords:
      "privacy policy, personal data, data protection, DeVeSheDreams privacy",
    author: "DeVeSheDreams",
    robots: "index,follow",
  };
  return { props: { meta } };
}
