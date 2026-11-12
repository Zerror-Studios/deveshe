import React, { useEffect, useRef, useState } from "react";
import { useWatch } from "react-hook-form";
import { countriesData, addressType } from "@/helpers/Data";
import { IoLocationOutline } from "react-icons/io5";
import CommonButton from "../common/CommonButton";
import PhoneInput from "../common/PhoneInput";
import { useAuthStore } from "@/store/auth-store";
import { useQuery } from "@apollo/client/react";
import { USER_ADDRESS_LIST } from "@/graphql";
import {
  getFirstFieldError,
  pickSavedAddressIndex,
  toFormAddress,
} from "@/utils/checkout-address.util";

// `isPreferredAddress(formAddress)` (optional) marks the saved address to
// preselect over the primary one: the kept order's address on a payment
// retry (PRD-014 FR-0.12 / W0V-C-03).
const Delivery = ({
  errors,
  control,
  register,
  setValue,
  isPreferredAddress = null,
}) => {
  const [isAddress, setIsAddress] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  // True while the selection is ours, not the shopper's.
  const isAutoSelectedRef = useRef(true);
  const shippingPhone = useWatch({ control, name: "shippingAddress.phone" });
  const shippingCountryCode = useWatch({
    control,
    name: "shippingAddress.countryCode",
  });
  const { isLoggedIn } = useAuthStore((state) => state);
  const {
    data: addressResponse,
    loading,
  } = useQuery(USER_ADDRESS_LIST, {
    skip: !isLoggedIn,
  });
  const data = addressResponse?.getAddresses || [];
  const shippingErrors = errors?.shippingAddress;
  const firstShippingError = getFirstFieldError(shippingErrors);

  const selectAddress = (index) => {
    const selected = data[index];
    if (!selected) return;
    setSelectedAddress(index);
    const formAddress = toFormAddress(selected);
    setValue("shippingAddress", formAddress, { shouldValidate: true });
    setValue("billingAddress", formAddress, { shouldValidate: true });
  };

  // PRD-014 UX-02: with saved addresses the form is hidden, so one must be
  // selected: the preferred address (a retry's kept order), else the
  // primary one (the server lists it first), else the first one. It may
  // re-run when the preference arrives, never over a shopper's choice.
  useEffect(() => {
    if (data.length === 0 || !isAutoSelectedRef.current) return;
    const index = pickSavedAddressIndex(data, isPreferredAddress);
    if (index === selectedAddress) return;
    if (selectedAddress === null) setIsAddress(false);
    selectAddress(index);
  }, [data, isPreferredAddress]);

  // A saved address that fails validation can't be fixed in a hidden
  // form: open the form with it so every field error is visible.
  useEffect(() => {
    if (shippingErrors && !isAddress) setIsAddress(true);
  }, [shippingErrors]);

  const handleAddress = (e) => {
    isAutoSelectedRef.current = false;
    selectAddress(parseInt(e.target.value, 10));
  };

  return (
    <div className="Delivery_container">
      <h2 className="same_style_text">Delivery</h2>
      {firstShippingError && (
        <p className="error" role="alert">
          Please check your delivery address: {firstShippingError}
        </p>
      )}
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
            onClick={() => {
              isAutoSelectedRef.current = false;
              setIsAddress(true);
            }}
          />
        </>
      )}
      {isAddress && data.length > 0 && (
        <button
          type="button"
          className="Delivery_saved_link"
          onClick={() => setIsAddress(false)}
        >
          Use a saved address
        </button>
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
                label="Phone"
                countryCode={shippingCountryCode}
                phone={shippingPhone}
                onChange={({ countryCode, phone }) => {
                  setValue("shippingAddress.countryCode", countryCode, {
                    shouldValidate: true,
                  });
                  setValue("shippingAddress.phone", phone, {
                    shouldValidate: true,
                  });
                }}
                error={errors?.shippingAddress?.phone?.message || ""}
              />
              <input
                type="hidden"
                {...register("shippingAddress.countryCode")}
              />
              <input type="hidden" {...register("shippingAddress.phone")} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Delivery;
