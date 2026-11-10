"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import ProfileBlocks from "@/components/profileNew/myProfile/ProfileBlocks";
import ProfileHeader from "@/components/profileNew/ProfileHeader";
import AddressBlocks from "@/components/profileNew/address/AddressBlocks";
import OrderBlock from "@/components/profileNew/order/OrderBlock";
import ReviewBlocks from "@/components/profileNew/reviews/ReviewBlocks";
import withAuth from "@/lib/withAuth";
import { GET_MY_PROFILE } from "@/graphql";
import { useAuthStore } from "@/store/auth-store";

const Profile = () => {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState(0);
  // PRD-032 FR-D4: `/profile?tab=reviews` (the "Review" link on a
  // delivered order) opens the reviews tab
  useEffect(() => {
    if (tabParam === "reviews") setTab(3);
  }, [tabParam]);
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
