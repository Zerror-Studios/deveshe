import React from "react";
import { useRouter } from "next/navigation";
import CommonButton from "@/components/common/CommonButton";
import { useAuth } from "@/context/AuthContext";

const tabs = [
  { id: 0, label: "My Profile" },
  { id: 1, label: "Saved Addresses" },
  { id: 2, label: "Order History" },
  // PRD-032 FR-D4
  { id: 3, label: "My Reviews" },
];

const ProfileHeader = ({ activeTab, setTab }) => {
  const router = useRouter();
  const { logout } = useAuth();
  const handleSignout = async () => {
    // Leave the guarded page first so withAuth does not redirect to /login.
    await router.replace("/");
    await logout();
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
