import React from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/auth-store";
import { AuthCookies } from "@/utils/AuthCookies"

const tabs = [
  { id: 0, label: "My Profile" },
  { id: 1, label: "Saved Addresses" },
  { id: 2, label: "Order History" },
];

const ProfileHeader = ({ activeTab, setTab }) => {
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const handleSignout = () => {
    AuthCookies.remove();
    clearAuth();
    localStorage.clear();
    router.replace("/");
  }
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

      <div
        id="logout_btn"
        onClick={handleSignout}
        className="_btn_wrapper _btn_height _w-full de-btn"
      >
        Logout
      </div>
    </div>
  );
};

export default ProfileHeader;
