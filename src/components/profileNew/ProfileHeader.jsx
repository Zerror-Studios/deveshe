import React from "react";
import { useRouter } from "next/navigation";
import CommonButton from "@/components/common/CommonButton";
import { useAuthStore } from "@/store/auth-store";
import { TokenManager } from "@/utils/tokenManager";

const tabs = [
  { id: 0, label: "My Profile" },
  { id: 1, label: "Saved Addresses" },
  { id: 2, label: "Order History" },
];

const ProfileHeader = ({ activeTab, setTab }) => {
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const handleSignout = () => {
    TokenManager.clearTokens();
    clearAuth();
    localStorage.removeItem("user-data");
    router.replace("/");
  };
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
        type="button"
        variant="danger"
        onClick={handleSignout}
        className="profile-logout-btn"
      />
    </div>
  );
};

export default ProfileHeader;
