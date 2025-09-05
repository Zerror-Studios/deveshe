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
          <input type="text" placeholder="Username" />
          <input type="text" placeholder="Last Name" />
          <input type="email" placeholder="Email" />
          <input type="phone" placeholder="Phone" />
        </form>
        <span id="edit_user_details"><FaUserEdit /></span>
      </div>
    </div>
  );
};

export default ProfileDetails;
