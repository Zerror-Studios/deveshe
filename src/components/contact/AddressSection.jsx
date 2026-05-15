import React from "react";
import CommonButton from "../common/CommonButton";

const AddressSection = ({ onOpenForm }) => {
  return (
    <div id="address">
      <div className="elem elem-lf contact-intro">
        <div>
          <h2>Let’s talk.</h2>
          <h5>
            We believe in the power of digital, and we love collaborating with
            brands that feel the same. Let&apos;s connect.
          </h5>
        </div>
        <div>
          <div className="elem contact-details">
            <div className="add">
              <h6>Business enquiries</h6>
              <a href="mailto:deveshedreams@gmail.com">deveshedreams@gmail.com</a>
              <a href="tel:+919833983775">+919833983775</a>
            </div>
            <div className="add address_container">
              <div>
                <h6>Address</h6>
                <h5>
                  Bankeybihari Holdings <br />
                  B5, 3rd floor, Everest Apt., <br />
                  Pt. Madan Mohan Malviya Marg, <br />
                  Tardeo, Mumbai-400 034
                </h5>
              </div>
              <CommonButton
                title="Use a form here"
                type="button"
                onClick={onOpenForm}
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AddressSection;
