import CommonButton from "@/components/common/CommonButton";
import React, { useState } from "react";
import AddressPopup from "./AddressPopup";

const AddressHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div id="profile_header_inside" className="detail_block">
        <div className="profile_left_container">
          <h4>Saved Address</h4>
          <p>
            Easily manage your saved addresses for seamless checkout
            experiences. Your information is kept safe and secure with us.
          </p>
        </div>
        <CommonButton
          title="Add Address"
          onClick={() => setIsOpen(true)}
          // loading={isBtnLoading}
        />
      </div>
      <AddressPopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default AddressHeader;
