import React from "react";

const AddressSection = () => {
  return (
    <div id="address" className="contact-details">
      <div className="contact-details__row">
        <div className="contact-details__col">
          <div className="contact-detail-block">
            <h6>Studio address</h6>
            <p>
              Bankeybihari Holdings
              <br />
              B5, 3rd floor, Everest Apt.,
              <br />
              Pt. Madan Mohan Malviya Marg,
              <br />
              Tardeo, Mumbai — 400 034
            </p>
          </div>

          <div className="contact-detail-block">
            <h6>Response time</h6>
            <p>
              We reply to most messages within two business days. For order
              updates, include your order number in the form.
            </p>
          </div>
        </div>

        <div className="contact-details__col">
          <div className="contact-detail-block">
            <h6>Business enquiries</h6>
            <a href="mailto:deveshedreams@gmail.com">deveshedreams@gmail.com</a>
            <a href="tel:+919833983775">+91 98339 83775</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressSection;
