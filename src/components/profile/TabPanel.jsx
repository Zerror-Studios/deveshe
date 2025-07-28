import React, { useState } from "react";
import dynamic from "next/dynamic";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const Basic = dynamic(() => import("@/components/profile/panel").then(mod => mod.Basic), {
  ssr: false,
});
const Order = dynamic(() => import("@/components/profile/panel").then(mod => mod.Order), {
  ssr: false,
});
const Payment = dynamic(() => import("@/components/profile/panel").then(mod => mod.Payment), {
  ssr: false,
});
const Address = dynamic(() => import("@/components/profile/panel").then(mod => mod.Address), {
  ssr: false,
});

const CustomTabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ minHeight: "calc(100vh - 180px)" }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 4 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const TabPanel = ({ tab }) => {
  return (
    <>
      <CustomTabPanel value={tab} index={0}>
        <Basic />
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={1}>
        <Order />
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={2}>
        <Payment />
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={3}>
        <Address />
      </CustomTabPanel>
    </>
  );
};

export default TabPanel;
