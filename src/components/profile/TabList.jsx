import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { styled } from "@mui/material/styles";

const AntTabs = styled(Tabs)({
  borderBottom: "1px solid #e8e8e8",
  "& .MuiTabs-indicator": {
    backgroundColor: "#000",
  },
});

const AntTab = styled((props) => <Tab disableRipple {...props} />)(
  ({ theme }) => ({
    textTransform: "none",
    minWidth: 0,
    [theme.breakpoints.up("sm")]: {
      minWidth: 0,
    },
    fontWeight: theme.typography.fontWeightRegular,
    marginRight: theme.spacing(1),
    color: "rgba(0, 0, 0, 0.85)",
    fontSize: "12px",
    fontFamily: ["Helvetica, sans-serif"].join(","),
    "&:hover": {
      color: "#000",
      opacity: 1,
    },
    "&.Mui-selected": {
      color: "#000",
      fontWeight: theme.typography.fontWeightMedium,
    },
    "&.Mui-focusVisible": {
      backgroundColor: "#000",
    },
  })
);
const TabList = ({ tab, setTab }) => {
  return (
    <div id="tab_list">
      <AntTabs
        id="ant-tabs"
        value={tab}
        onChange={(event, value) => setTab(value)}
        aria-label="ant example"
        sx={{ borderColor: "rgba(0,0,0,0.2)" }}
      >
        <AntTab id="tab" label="My Profile" />
        <AntTab id="tab" label="Order History" />
        <AntTab id="tab" label="Payment Method" />
        <AntTab id="tab" label="Saved Addresses" />
        
      </AntTabs>
       <div id="logout_btn" className="_btn_wrapper _btn_height _w-full de-btn">
          Logout
        </div>
    </div>
  );
};

export default TabList;
