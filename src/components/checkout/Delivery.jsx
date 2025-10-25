import React, { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import { countriesData, addressType } from "@/helpers/Data";
import "react-international-phone/style.css";
import { IoLocationOutline } from "react-icons/io5";
import CommonButton from "../common/CommonButton";
import { useAuthStore } from "@/store/auth-store";
import { Sort } from "@/utils/Constant";
import { useQuery } from "@apollo/client";
import { USER_ADDRESS_LIST } from "@/graphql";

const Delivery = ({ errors, control, register, setValue }) => {
  const LIMIT = 10;
  const [isAddress, setIsAddress] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [offset, setOffset] = useState(0);
  const shippingAddress = useWatch({ control, name: "shippingAddress" });
  const { isLoggedIn, user } = useAuthStore((state) => state);
  const payload = {
    filters: { userId: user?._id },
    limit: LIMIT,
    offset,
    sort: { createdAt: Sort.DESC, primary: Sort.ASC },
  };
  const {
    data: addressResponse,
    loading,
  } = useQuery(USER_ADDRESS_LIST, {
    skip: !isLoggedIn,
    variables: payload,
  });
  const { data = [] } = addressResponse?.getAddressByFilters || {};

  useEffect(() => {
    if (data.length > 0) {
      setIsAddress(false);
    }
  }, [data]);

  const handleAddress = (e) => {
    const parsedValue = parseInt(e.target.value, 10);
    setSelectedAddress(parsedValue);
    const selected = data[parsedValue];
    if (!selected) return;
    setValue("shippingAddress", selected, { shouldValidate: true });
    setValue("billingAddress", selected, { shouldValidate: true });
  };

  return (
    <div className="Delivery_container">
      <h2 className="same_style_text">Delivery</h2>
      {!isAddress && data.length > 0 && (
        <>
          <div className="order-div">
            <div style={{ marginTop: "0.6rem" }}>
              <div className="address-grid">
                {loading ? (
                  <>
                    <div className="no-order-div flex-all">
                      <div className="loader-btn" />
                    </div>
                  </>
                ) : (
                  <>
                    {data?.map((item, index) => (
                      <div key={`address-${index}`} className="address-div">
                        <div className="locationlogo">
                          <IoLocationOutline className="localogo" />
                        </div>
                        <div className="address-select-input">
                          <label className="checkbox-container">
                            <input
                              type="radio"
                              value={index}
                              checked={selectedAddress === index}
                              onChange={handleAddress}
                            />
                            <span className="checkmark">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 14 14"
                                focusable="false"
                                aria-hidden="true"
                                className="arrow"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m12.1 2.8-5.877 8.843a.35.35 0 0 1-.54.054L1.4 7.4"
                                ></path>
                              </svg>
                            </span>
                          </label>
                        </div>
                        <div className="add-detail">
                          <div className="name-btn">
                            <p className="add-name">
                              {item?.firstname || ""} {item?.lastname || ""}
                            </p>
                            <div className="actions">{/* <Profilebtn/> */}</div>
                          </div>
                          <p className="add-name">
                            {item?.flat || ""} {item?.addressline1 || ""}
                          </p>
                          <p className="add-name">{item?.addressline2 || ""}</p>
                          <p className="add-name">
                            {item?.city || ""}, {item?.country || ""}
                          </p>
                          <p className="add-name">{item?.pincode || ""}</p>
                          <div className="phone-btn">
                            <p
                              className="add-name"
                              style={{ fontWeight: "400", marginTop: "5px" }}
                            >
                              {" "}
                              {item?.phone || ""}
                            </p>
                          </div>
                          <p className="add-name" style={{ marginTop: "5px" }}>
                            <b>{item?.addressType || ""}</b>
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
          <CommonButton
            title={"Add Address"}
            loading={false}
            type="button"
            onClick={() => setIsAddress(true)}
          />
        </>
      )}
      {isAddress && (
        <div className="Delivery_cntr_form">
          <div className="Delivery_input_cntr">
            <div className="Name_input_cntr">
              <div>
                <input
                  className="w-100"
                  type="text"
                  placeholder="First Name"
                  {...register("shippingAddress.firstname")}
                />
                {errors?.shippingAddress?.firstname && (
                  <span className="error">
                    {errors?.shippingAddress?.firstname?.message || ""}
                  </span>
                )}
              </div>
              <div>
                <input
                  className="w-100"
                  type="text"
                  placeholder="Last Name"
                  {...register("shippingAddress.lastname")}
                />
                {errors?.shippingAddress?.lastname && (
                  <span className="error">
                    {errors?.shippingAddress?.lastname?.message || ""}
                  </span>
                )}
              </div>
            </div>

            <div className="pincode_city_input_cntr">
              <label htmlFor="Select0">
                <select {...register("shippingAddress.country")}>
                  <option value="">Country/Region</option>
                  {countriesData?.map((item, index) => (
                    <option value={item?.name || ""} key={`country-${index}`}>
                      {item?.name || ""}
                    </option>
                  ))}
                </select>
                {errors?.shippingAddress?.country && (
                  <span className="error">
                    {errors?.shippingAddress?.country?.message || ""}
                  </span>
                )}
              </label>
              <div className="w-100">
                <input
                  className="w-100"
                  type="text"
                  placeholder="State"
                  {...register("shippingAddress.states")}
                />
                {errors?.shippingAddress?.states && (
                  <span className="error">
                    {errors?.shippingAddress?.states?.message || ""}
                  </span>
                )}
              </div>
            </div>

            <div className="pincode_city_input_cntr">
              <div>
                <input
                  className="w-100"
                  type="text"
                  placeholder="ZIP Code"
                  {...register("shippingAddress.pincode")}
                />
                {errors?.shippingAddress?.pincode && (
                  <span className="error">
                    {errors?.shippingAddress?.pincode?.message || ""}
                  </span>
                )}
              </div>
              <div>
                <input
                  className="w-100"
                  type="text"
                  placeholder="City"
                  {...register("shippingAddress.city")}
                />
                {errors?.shippingAddress?.city && (
                  <span className="error">
                    {errors?.shippingAddress?.city?.message || ""}
                  </span>
                )}
              </div>
            </div>

            <div className="pincode_city_input_cntr">
              <div>
                <input
                  className="w-100"
                  type="text"
                  placeholder="Company (optional)"
                  {...register("shippingAddress.company")}
                />
              </div>
              <label htmlFor="Select0">
                <select {...register("shippingAddress.addressType")}>
                  <option value="">Address Type</option>
                  {addressType?.map((item, index) => (
                    <option value={item?.value || ""} key={`addr-${index}`}>
                      {item?.label || ""}
                    </option>
                  ))}
                </select>
                {errors?.shippingAddress?.addressType && (
                  <span className="error">
                    {errors?.shippingAddress?.addressType?.message || ""}
                  </span>
                )}
              </label>
            </div>

            <div className="Address_input_cntr">
              <input
                type="text"
                placeholder="Address"
                {...register("shippingAddress.addressline1")}
              />
              {errors?.shippingAddress?.addressline1 && (
                <span className="error">
                  {errors?.shippingAddress?.addressline1?.message || ""}
                </span>
              )}
            </div>

            <div className="Appartment_input_cntr">
              <input
                type="text"
                placeholder="Appartment, suite, etc. (optional)"
                {...register("shippingAddress.addressline2")}
              />
            </div>

            <div className="Phone_input_cntr div-name">
              <PhoneInput
                defaultCountry="in"
                value={`+${
                  shippingAddress?.countryCode?.replace("+", "") || "91"
                }${shippingAddress?.phone || ""}`}
                className="delivery__phone_btn"
                inputClassName="delivery__input__phone"
                onChange={(value, metadata) => {
                  const countryCode = `+${metadata?.country?.dialCode || "91"}`;
                  const numberOnly = value.replace(countryCode, "").trim();

                  setValue("shippingAddress.countryCode", countryCode, {
                    shouldValidate: true,
                  });
                  setValue("shippingAddress.phone", numberOnly, {
                    shouldValidate: true,
                  });
                }}
              />
              <input
                type="hidden"
                {...register("shippingAddress.countryCode")}
              />
              <input type="hidden" {...register("shippingAddress.phone")} />
              {errors?.shippingAddress?.phone && (
                <span className="error">
                  {errors?.shippingAddress?.phone?.message || ""}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Delivery;
