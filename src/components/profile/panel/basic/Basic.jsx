import React from "react";
import ProfileSection from "@/components/profile/panel/basic/components/ProfileSection";
import EmailSection from "@/components/profile/panel/basic/components/EmailSection";
import PasswordSection from "@/components/profile/panel/basic/components/PasswordSection";
import DeactiveSection from "@/components/profile/panel/basic/components//DeactiveSection";

const Basic = () => {
  return (
    <>
      <ProfileSection />
      <EmailSection />
      <PasswordSection />
      <DeactiveSection />
    </>
  );
};

export default Basic;
