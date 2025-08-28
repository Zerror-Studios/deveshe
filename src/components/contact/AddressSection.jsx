import React from "react";

const AddressSection = () => {
  return (
    <div id="address">
      <div className="elem elem-lf">
        <h5>
          We believe in the power of digital, and we love collaborating with
          brands that feel the same. Let&apos;s connect.
        </h5>
      </div>
      <div className="elem">
        <div className="add">
          <h6>Business enquiries</h6>
          <a href="mailto:deveshedreams@gmail.com">deveshedreams@gmail.com</a>
          <a href="tel:+919833983775">+919833983775</a>
        </div>
        <div className="add">
          <h6>Address</h6>
          <h5>
            1102, Mahindra Heights. <br /> 96 Tardeo Road. <br /> Mumbai 400034
          </h5>
        </div>
      </div>
    </div>
  );
};

export default AddressSection;
