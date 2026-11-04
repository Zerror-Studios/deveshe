import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client/react";
import SeoHeader from "@/components/seo/SeoHeader";
import ProfileBlocks from "@/components/profileNew/myProfile/ProfileBlocks";
import ProfileHeader from "@/components/profileNew/ProfileHeader";
import AddressBlocks from "@/components/profileNew/address/AddressBlocks";
import OrderBlock from "@/components/profileNew/order/OrderBlock";
import ReviewBlocks from "@/components/profileNew/reviews/ReviewBlocks";
import withAuth from "@/lib/withAuth";
import { GET_MY_PROFILE } from "@/graphql";
import { useAuthStore } from "@/store/auth-store";

const Profile = ({ meta }) => {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  // PRD-032 FR-D4: `/profile?tab=reviews` (the "Review" link on a
  // delivered order) opens the reviews tab
  useEffect(() => {
    if (router.isReady && router.query.tab === "reviews") setTab(3);
  }, [router.isReady, router.query.tab]);
  const { setUser } = useAuthStore((state) => state);
  const { data: profileData } = useQuery(GET_MY_PROFILE, {
    fetchPolicy: "network-only",
  });

  // Keep the persisted profile in sync with the server.
  useEffect(() => {
    if (profileData?.getMyProfile) setUser(profileData.getMyProfile);
  }, [profileData]);

  const renderTabContent = () => {
    switch (tab) {
      case 0:
        return <ProfileBlocks />;
      case 1:
        return <AddressBlocks />;
      case 2:
        return <OrderBlock />;
      case 3:
        return <ReviewBlocks />;
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
