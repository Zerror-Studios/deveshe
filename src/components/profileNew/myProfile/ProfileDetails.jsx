import React, { useState } from "react";
import CommonButton from "@/components/common/CommonButton";
import { FaUserEdit } from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const ProfileDetails = () => {
  const [phone, setPhone] = useState("");

  return (
    <div id="profile_details" className="detail_block">
      <div className="profile_left_container">
        <h4>Profile Details</h4>
        <p>
          Easily update your profile details on our platform for a personalized
          experience. Your information is safeguarded with us.
        </p>
      </div>

      <div className="profile_right_container">
        <div className="profile_avatar">AA</div>
        <CommonButton title="Upload Avatar" />

        <form className="user_form">
          <div className="user_form_input">
            <input type="text" placeholder="Username" />
            <span className="error-text">Username is required</span>
          </div>

          <div className="user_form_input">
            <input type="text" placeholder="Last Name" />
            <span className="error-text">Lastname is required</span>
          </div>

          <div className="user_form_input">
            <input type="email" placeholder="Email" />
            <span className="error-text">Email is required</span>
          </div>

          <div className="user_form_input">
            <PhoneInput
              country={"in"}        // default flag (India)
              value={phone}
              onChange={setPhone}
              enableSearch={true}   // allows searching countries
              inputStyle={{ width: "100%" }} // full width like other inputs
              buttonStyle={{ border: "none" }} // clean flag dropdown
              placeholder="Enter phone number"
            />
            <span className="error-text">Phone number is required</span>
          </div>
        </form>

        <span id="edit_user_details">
          <FaUserEdit />
        </span>
      </div>
    </div>
  );
};

export default ProfileDetails;
