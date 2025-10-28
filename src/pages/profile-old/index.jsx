import React, { useState } from "react";
import Box from "@mui/material/Box";
import SeoHeader from "@/components/seo/SeoHeader";
import TabList from "@/components/profile/TabList";
import TabPanel from "@/components/profile/TabPanel";
import withAuth from "@/lib/withAuth";

const Profile = ({ meta }) => {
  const [tab, setTab] = useState(0);
  return (
    <>
      <SeoHeader meta={meta} />
      <div className="parent-div">
        <div className="outerdiv-pro">
          <div className="div-tab">
            <Box sx={{ width: "100%" }}>
              <TabList tab={tab} setTab={setTab} />
              <TabPanel tab={tab} />
            </Box>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(Profile);

export async function getStaticProps() {
  const meta = {
    title: "Your Profile – DeVeSheDreams Account",
    description:
      "Manage your DeVeSheDreams profile. View your orders, wishlist, saved looks, and customize your fashion journey with us.",
    keywords:
      "DeVeSheDreams profile, user account, fashion wishlist, order history, saved items",
    author: "DeVeSheDreams",
    robots: "noindex,follow",
  };
  return { props: { meta } };
}
