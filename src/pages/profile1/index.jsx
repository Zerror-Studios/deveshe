import React, { useState } from "react";
import ProfileBlocks from "@/components/profileNew/myProfile/ProfileBlocks";
import ProfileHeader from "@/components/profileNew/ProfileHeader";
import AddressBlocks from "@/components/profileNew/address/AddressBlocks";
import OrderBlock from "@/components/profileNew/order/OrderBlock";

const ProfilePage = () => {
  const [tab, setTab] = useState(0);

  const renderTabContent = () => {
    switch (tab) {
      case 0:
        return <ProfileBlocks />;
      case 1:
        return <AddressBlocks />;
      case 2:
        return <OrderBlock />;
      default:
        return <ProfileBlocks />;
    }
  };

  return (
    <section id="profile_section">
      <div id="profile_container">
        <ProfileHeader setTab={setTab} activeTab={tab} />
        {renderTabContent()}
      </div>
    </section>
  );
};

export default ProfilePage;
