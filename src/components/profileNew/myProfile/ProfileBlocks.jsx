import React from "react";
import ProfileDetails from "./ProfileDetails";
import EmailPreferences from "./EmailPreferences";

// Change password and account deactivation are hidden until the backend
// has customer operations for them (PRD-002 SF-1, backend gap).
const ProfileBlocks = () => {
  return (
    <>
      <ProfileDetails />
      <EmailPreferences />
    </>
  );
};

export default ProfileBlocks;
