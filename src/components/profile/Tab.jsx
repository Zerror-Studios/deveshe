import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import { useState, useEffect } from "react";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Orders from "./Order";
import Payment from "./Payment";
import Security from "./Security";
import { styled } from "@mui/material/styles";
import Notification from "./Notification";
import { FaUserEdit } from "react-icons/fa";
import { MdOutlineDone } from "react-icons/md";
import Address from "./Address";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { Getone, Updateuser } from "../../../api_fetch/admin/User";

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

const StyledTabs = styled((props) => (
  <Tabs
    {...props}
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))({
  "& .MuiTabs-indicator": {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  "& .MuiTabs-indicatorSpan": {
    maxWidth: 40,
    width: "100%",
    backgroundColor: "#635ee7",
  },
});

const StyledTab = styled((props) => <Tab disableRipple {...props} />)(
  ({ theme }) => ({
    textTransform: "none",
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.pxToRem(15),
    marginRight: theme.spacing(1),
    color: "rgba(255, 255, 255, 0.7)",
    "&.Mui-selected": {
      color: "#fff",
    },
    "&.Mui-focusVisible": {
      backgroundColor: "rgba(100, 95, 228, 0.32)",
    },
  })
);

function CustomTabPanel(props) {
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
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const [load, setLoad] = useState(false);
  const [dis, Setdis] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <div className="div-tab">
        <Box sx={{ width: "100%" }}>
          <AntTabs
            id="ant-tabs"
            value={value}
            onChange={handleChange}
            aria-label="ant example"
            sx={{ borderColor: "rgba(0,0,0,0.2)" }}
          >
            <AntTab id="tab" label="My Profile" />
            <AntTab id="tab" label="Order History" />
            <AntTab id="tab" label="Payment Method" />
            <AntTab id="tab" label="Saved Addresses" />
          </AntTabs>
          <CustomTabPanel value={value} index={0}>
            <div className="noti-main-div">
              <div className="pay-top">
                <div className="pay-head">
                  <h4>Profile Details</h4>
                  <p>
                    Easily update your profile details on our platform for a
                    personalized experience. Your information is safeguarded
                    with us.{" "}
                  </p>
                  <p></p>
                </div>
              </div>
              <div style={{ width: "50%" }}>
                <div
                  id="edit_profile"
                  className="_btn_wrapper _btn_height _w-full"
                  onClick={() => {
                    Updatefun(userData);
                  }}
                  style={{
                    position: "relative",
                    left: "93%",
                    width: "40px",
                    height: "40px",
                    top: "15px",
                    borderRadius: "50%",
                    padding: "0",
                  }}
                >
                  {textbtn == "Edit" ? (
                    <FaUserEdit className="status-btnpro" />
                  ) : (
                    <MdOutlineDone className="status-btnpro" />
                  )}
                </div>

                <div className="general-container">
                  <div className="user-details-profile">
                    <div className="user-image-profile">
                      <img src="https://mantisdashboard.io/assets/avatar-6-Cv0iCdgR.png" />
                    </div>

                    <div
                      class="fixed-right"
                      style={{ marginTop: "2vh", justifyContent: "center" }}
                    >
                      <div
                        className="_btn_wrapper3 _btn_height _w-full"
                        style={{ width: "170px" }}
                      >
                        Upload Avatar
                      </div>
                    </div>
                  </div>

                  <div style={{ width: "100%" }}>
                    <div style={{ marginBottom: "15px" }}>
                      <div className="input-fields">
                        <div className="div-name">
                          {/* <label className="label-text text-sm font-bold">
                            First Name
                          </label> */}
                          <input
                            className="general__input"
                            type="text"
                            disabled={!dis}
                            placeholder="First Name"
                            name="firstname"
                            value={userData.firstname || ""}
                            onChange={handleData}
                          />
                        </div>
                        <div className="div-name">
                          {/* <label className="label-text text-sm font-bold">
                            Last Name
                          </label> */}
                          <input
                            className="general__input"
                            type="text"
                            disabled={!dis}
                            placeholder="Last Name"
                            name="lastname"
                            value={userData.lastname || ""}
                            onChange={handleData}
                          />
                        </div>
                      </div>

                      <div className="input-fields">
                        <div className="div-name">
                          {/* <label className="label-text text-sm font-bold">
                            Email
                          </label> */}
                          <input
                            className="general__input"
                            type="email"
                            disabled={!dis}
                            placeholder="Email"
                            name="email"
                            value={userData.email || ""}
                            onChange={handleData}
                          />
                          {/* <div className="general__input c0" name="email" style={{padding:'10px 14px 0px 14px'}}>
                            {userData.email}
                          </div> */}
                        </div>
                        <div className="div-name">
                          {/* <label className="label-text text-sm font-bold">
                            Phone No.
                          </label> */}
                          <PhoneInput
                            defaultCountry="in"
                            disabled={!dis}
                            value={phone}
                            className="phone-con2"
                            style={{ borderBottom: "none" }}
                            inputClassName="general__input__phone"
                            onChange={(phone) =>
                              setUserData({ ...userData, phoneno: phone })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Notification />
            <Security email={userData.email} />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <Orders />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            <Payment email={userData.email} />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={3}>
            <Address email={userData.email} />
          </CustomTabPanel>
        </Box>
      </div>
    </>
  );
}
