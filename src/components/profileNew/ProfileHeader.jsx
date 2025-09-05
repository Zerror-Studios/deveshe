import React from "react";
import CommonButton from "../common/CommonButton";

const tabs = [
  { id: 0, label: "My Profile" },
  { id: 1, label: "Saved Addresses" },
  { id: 2, label: "Order History" },
];

const ProfileHeader = ({ activeTab, setTab }) => {
  return (
    <div id="profile_header">
      <div>
        {tabs.map((tab) => (
          <span
            key={tab.id}
            className={`profile_tab ${activeTab === tab.id ? "active_tab" : ""}`}
            onClick={() => setTab(tab.id)}
          >
            {tab.label}
          </span>
        ))}
      </div>

      <CommonButton
        title="Logout"
        // onClick={navigateCheckout}
        // loading={isBtnLoading}
      />
    </div>
  );
};

export default ProfileHeader;
