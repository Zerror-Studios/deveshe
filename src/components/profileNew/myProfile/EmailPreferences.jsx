import CommonButton from "@/components/common/CommonButton";
import React from "react";

const EmailPreferences = () => {
  return (
    <div id="email_preferences" className="detail_block">
      <div className="profile_left_container">
        <h4>Email Preferences</h4>
        <p>
          Manage your email preferences for a personalized experience tailored
          to your preferences. Your data security is our utmost priority.
        </p>
      </div>
      <div className="profile_right_container">
        <h5>I would like to receive notifications for :</h5>
        <div className="checkbox_container">
          <input type="checkbox" />
          <p>Product Announcements and Updates</p>
        </div>
        <div className="checkbox_container">
          <input type="checkbox" />
          <p>Events and Meetups</p>
        </div>
        <div className="checkbox_container">
          <input type="checkbox" />
          <p>User Research Surveys</p>
        </div>
        <div className="checkbox_container">
          <input type="checkbox" />
          <p>Hatch Startup Program</p>
        </div>
        <div className="checkbox_container">
          <input type="checkbox" />
          <p>
            To unsubscribe from all email communications, click below. We
            respect your choice and apologize for any inconvenience. You can
            resubscribe at any time. Thank you.
          </p>
        </div>
          <CommonButton
        title="Update My Preferences"
        // onClick={navigateCheckout}
        // loading={isBtnLoading}
      />
      </div>
    </div>
  );
};

export default EmailPreferences;
