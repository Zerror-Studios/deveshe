import SeoHeader from "@/components/seo/SeoHeader";
import React from "react";

const shippingReturns = ({meta}) => {
  return (
    <>
    <SeoHeader meta={meta} />
    <div id="legal-page">
      <h2>Shipping & Returns</h2>
      <div className="legal-container">
        <h3>Shipping Policy</h3>
        <p className="subheading-legal"><strong>How long will it take to deliver my order (domestic and international)?</strong></p>
        <ul>
            <li>Orders in India are normally delivered in 1-2 business days (City or State), 3-5 business days (Metro to Metro), and 5-7+ business days (Rest of India) after they have been shipped. Delivery times may vary depending on the shipping address and other considerations (public holidays, severe weather, etc.)</li>
        </ul>
        <p>Edit: Since all of our pieces are made to order, the shipping time on each piece will vary but the customer will be notified of the delivery timeline. </p>
        <p className="subheading-legal"><strong>For all international orders, shipping duration depends from country to country. How can I track my order?</strong></p>
        <p>The tracking page or track details are shared with the customer via e-mail.</p>
        <p className="highlight">All India Shipping is free. International shipping and customs duties will be borne by the customer.</p>
        <h3>Returns & Exchange Policy</h3>
        <p className="subheading-legal"><strong>Terms Of The Exchange Policy:</strong></p>
        <ul>
            <li>Products will be only exchanged in the case of delivering a wrong product or the wrong product size or if a damaged product has been delivered.</li>
            <li>Exchanges are only possible for the same product in a different size. </li>
            <li>We do not accept exchanges on numerous product categories, like caps, hats, and socks, in order to maintain stringent sanitary standards for our items.</li>
            <li>There is no refund Provided by the company.</li>
        </ul>
        <p className="subheading-legal"><strong>Procedure For Product Returns & Exchange:</strong></p>
        <ul>
            <li>Once a customer submits a complaint for a product return/exchange via e-mail, our Quality Control Team will review your complaint and, if our team gives us a green signal, we will arrange a reversal order. The courier will pick up the parcel from the customer's location and will ship it to us within 3 - 7 days. Once the goods arrive at our warehouse, we will send the customer a replacement within 3-4 business days.</li>
        </ul>
      </div>
    </div>
    </>
  );
};

export default shippingReturns;


export async function getStaticProps() {
  const meta = {
    title: "Shipping & Returns – DeVeSheDreams",
    description:
      "Get information about shipping timelines, delivery charges, and return policies at DeVeSheDreams.",
    keywords:
      "shipping policy, return policy, delivery info, DeVeSheDreams returns, exchange policy",
    author: "DeVeSheDreams",
    robots: "index,follow",
  };
  return { props: { meta } };
}
