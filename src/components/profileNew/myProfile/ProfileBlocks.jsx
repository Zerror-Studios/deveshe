import React from "react";
import ProfileDetails from "./ProfileDetails";
import EmailPreferences from "./EmailPreferences";
import ChangePassword from "./ChangePassword";
import DeleteAccount from "./DeleteAccount";

const ProfileBlocks = () => {
  return (
    <>
      <ProfileDetails />
      <EmailPreferences />
      <ChangePassword />
      <DeleteAccount />
    </>
  );
};

export default ProfileBlocks;
