import React from "react";

const DeactiveSection = () => {
  return (
    <div className="noti-main-div">
      <div className="security-left">
        <h4>Delete Account</h4>
      </div>

      <div className="delete-info passguide">
        <p>
          To deactivate your account, first delete its resources. If you are the
          only owner of any teams, either assign another owner or deactivate the
          team.
        </p>
        <div className="_btn_wrapper _btn_height _w-full de-btn">
          Deactivate Account
        </div>
      </div>
    </div>
  );
};

export default DeactiveSection;
