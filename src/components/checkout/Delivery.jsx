import React from "react";
import { useWatch } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import { countriesData, addressType } from "@/helpers/Data";
import "react-international-phone/style.css";

const Delivery = ({ errors, control, register, setValue }) => {
  const shippingAddress = useWatch({ control, name: "shippingAddress" });
  return (
    <div className="Delivery_container">
      <h2 className="same_style_text">Delivery</h2>
      <div className="Delivery_cntr_form">
        <div className="Delivery_input_cntr">
          <div className="Name_input_cntr">
            <div>
              <input
                className="w-100"
                type="text"
                placeholder="First name"
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
                placeholder="Last name"
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
                placeholder="States"
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
                type="number"
                placeholder="postal code"
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
            <input type="hidden" {...register("shippingAddress.countryCode")} />
            <input type="hidden" {...register("shippingAddress.phone")} />
            {errors?.shippingAddress?.phone && (
              <span className="error">
                {errors?.shippingAddress?.phone?.message || ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
