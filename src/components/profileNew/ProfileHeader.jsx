import React from "react";
import { useAuth } from "@/context/AuthContext";
import CommonButton from "../common/CommonButton";

const tabs = [
  { id: 0, label: "My Profile" },
  { id: 1, label: "Saved Addresses" },
  { id: 2, label: "Order History" },
];

const ProfileHeader = ({ activeTab, setTab }) => {
  const { logout } = useAuth();
  return (
    <div id="profile_header">
      <div className="tab_container">
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
        onClick={logout}
      // loading={isBtnLoading}
      />
    </div>
  );
};

export default ProfileHeader;
