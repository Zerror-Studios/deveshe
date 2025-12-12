import React, { useState } from "react";
import SeoHeader from "@/components/seo/SeoHeader";
import ProfileBlocks from "@/components/profileNew/myProfile/ProfileBlocks";
import ProfileHeader from "@/components/profileNew/ProfileHeader";
import AddressBlocks from "@/components/profileNew/address/AddressBlocks";
import OrderBlock from "@/components/profileNew/order/OrderBlock";
import withAuth from "@/lib/withAuth";

const Profile = ({ meta }) => {
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
    <>
      <SeoHeader meta={meta} />
      <section id="profile_section">
        <div id="profile_container">
          <ProfileHeader setTab={setTab} activeTab={tab} />
          {renderTabContent()}
        </div>
      </section>
    </>
  );
};

export default withAuth(Profile);

export async function getStaticProps() {
  const meta = {
    title: "Your Account – DeVeSheDreams",
    description:
      "Access and manage your DeVeSheDreams account. View orders, update personal details, and explore your personalised fashion experience.",
    keywords: [
      "DeVeSheDreams account",
      "login",
      "user dashboard",
      "order history",
      "account settings",
      "profile management"
    ],
    primaryKeywords: ["DeVeSheDreams account", "user dashboard"],
    author: "DeVeSheDreams",
    robots: "noindex, follow",
    og: {
      title: "Your Account – DeVeSheDreams",
      description:
        "Manage your DeVeSheDreams account, track orders, and update your personal information in one secure place."
    },
    twitter: {
      card: "summary_large_image",
      title: "Your Account – DeVeSheDreams",
      description:
        "Log in to your DeVeSheDreams account to manage your orders and profile details."
    }
  };

  return { props: { meta } };
}
