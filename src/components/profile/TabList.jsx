import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { styled } from "@mui/material/styles";
import { useApolloClient } from "@apollo/client";
import { useAuthStore } from "@/store/auth-store";

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
  const client = useApolloClient();
  const { clearAuth } = useAuthStore((state) => state);

  const handleLogout = async () => {
    try {
      clearAuth();
      localStorage.removeItem("user-auth");
      await client.clearStore();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

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
        <AntTab id="tab" label="Saved Addresses" />
        {/* <AntTab id="tab" label="Order History" /> */}
      </AntTabs>
      <div
        id="logout_btn"
        onClick={handleLogout}
        className="_btn_wrapper _btn_height _w-full de-btn"
      >
        Logout
      </div>
    </div>
  );
};

export default TabList;
