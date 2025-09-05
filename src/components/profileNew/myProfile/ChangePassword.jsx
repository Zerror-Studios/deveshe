import CommonButton from "@/components/common/CommonButton";

const ChangePassword = () => {
  return (
    <div id="change_password" className="detail_block">
      <div className="profile_left_container">
        <h4>Change Password</h4>
        <p>
          New password must contain: <br />
          - At least 8 characters <br />
          - At least 1 lowercase letter (a-z) <br />
          - At least 1 uppercase letter (A-Z) <br />
          - At least 1 number (0-9) <br />- At least 1 special character
        </p>
      </div>
      <div className="profile_right_container">
        <form className="change_pass_form">
          <input type="password"  placeholder="Enter Current Password"/>
          <input type="password"  placeholder="Enter New Password"/>
          <input type="password"  placeholder="Confirm New Password"/>
          <CommonButton
          title="Change Password"
          // onClick={navigateCheckout}
          // loading={isBtnLoading}
        />
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
