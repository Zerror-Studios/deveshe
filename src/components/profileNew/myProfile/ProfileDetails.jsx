import CommonButton from "@/components/common/CommonButton";
import React from "react";
import { FaUserEdit } from "react-icons/fa";

const ProfileDetails = () => {
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
        <CommonButton
          title="Upload Avatar"
          // onClick={navigateCheckout}
          // loading={isBtnLoading}
        />
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
            <input type="phone" placeholder="Phone" />
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
