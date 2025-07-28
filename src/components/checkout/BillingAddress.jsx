import React, { useEffect } from "react";
import { useWatch } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import { countriesData, addressType } from "@/helpers/Data";
import "react-international-phone/style.css";

const BillingAddress = ({ errors, control, register, setValue }) => {
  const useShippingAsBilling = useWatch({
    control,
    name: "useShippingAsBilling",
  });
  const shippingAddress = useWatch({ control, name: "shippingAddress" });
  const billingAddress = useWatch({ control, name: "billingAddress" });

  useEffect(() => {
    if (useShippingAsBilling) {
      const { phone, countryCode, ...rest } = shippingAddress || {};
      setValue("billingAddress", {
        ...rest,
        phone: phone || "",
        countryCode: countryCode || "",
        addressType: "BILLING",
      });
    }
  }, [useShippingAsBilling, shippingAddress, setValue]);

  return (
    <div className="Payment_container" style={{ marginTop: "20px" }}>
      <div className="payment_title_cntr">
        <h2 className="same_style_text">Billing address</h2>
      </div>
      <div className="payment_inner_container_bg">
        <fieldset>
          <div className="all_payment_input_cntr">
            <div className="cards_inner_content">
              <label className="checkbox-container credit_card_cntr">
                <input type="checkbox" {...register("useShippingAsBilling")} />
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
                <span>Use shipping address as billing address</span>
              </label>
            </div>
            <div className="basic-creditCards-collapsible">
              <div className="card_details_cntr">
                <div className="card_details_inner_cntr">
                  <div className="card_details_inner_Btm_cntr">
                    <div className="Delivery_cntr_form">
                      <div className="Delivery_input_cntr">
                        <div className="Name_input_cntr">
                          <div>
                            <input
                              disabled={useShippingAsBilling}
                              className="w-100"
                              type="text"
                              placeholder="First name"
                              {...register("billingAddress.firstname")}
                            />
                            {errors?.billingAddress?.firstname && (
                              <span className="error">
                                {errors?.billingAddress?.firstname?.message ||
                                  ""}
                              </span>
                            )}
                          </div>
                          <div>
                            <input
                              disabled={useShippingAsBilling}
                              className="w-100"
                              type="text"
                              placeholder="Last name"
                              {...register("billingAddress.lastname")}
                            />
                            {errors?.billingAddress?.lastname && (
                              <span className="error">
                                {errors?.billingAddress?.lastname?.message ||
                                  ""}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pincode_city_input_cntr">
                          <label htmlFor="Select0">
                            <select
                              disabled={useShippingAsBilling}
                              {...register("billingAddress.country")}
                            >
                              <option value="">Country/Region</option>
                              {countriesData?.map((item, index) => (
                                <option
                                  value={item?.name || ""}
                                  key={`country-${index}`}
                                >
                                  {item?.name || ""}
                                </option>
                              ))}
                            </select>
                            {errors?.billingAddress?.country && (
                              <span className="error">
                                {errors?.billingAddress?.country?.message || ""}
                              </span>
                            )}
                          </label>
                          <div className="w-100">
                            <input
                              disabled={useShippingAsBilling}
                              className="w-100"
                              type="text"
                              placeholder="States"
                              {...register("billingAddress.states")}
                            />
                            {errors?.billingAddress?.states && (
                              <span className="error">
                                {errors?.billingAddress?.states?.message || ""}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pincode_city_input_cntr">
                          <div>
                            <input
                              disabled={useShippingAsBilling}
                              className="w-100"
                              type="number"
                              placeholder="postal code"
                              {...register("billingAddress.pincode")}
                            />
                            {errors?.billingAddress?.pincode && (
                              <span className="error">
                                {errors?.billingAddress?.pincode?.message || ""}
                              </span>
                            )}
                          </div>
                          <div>
                            <input
                              disabled={useShippingAsBilling}
                              className="w-100"
                              type="text"
                              placeholder="City"
                              {...register("billingAddress.city")}
                            />
                            {errors?.billingAddress?.city && (
                              <span className="error">
                                {errors?.billingAddress?.city?.message || ""}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pincode_city_input_cntr">
                          <div>
                            <input
                              disabled={useShippingAsBilling}
                              className="w-100"
                              type="text"
                              placeholder="Company (optional)"
                              {...register("billingAddress.company")}
                            />
                          </div>
                          <label htmlFor="Select0">
                            <select
                              disabled={useShippingAsBilling}
                              {...register("billingAddress.addressType")}
                            >
                              <option value="">Address Type</option>
                              {addressType?.map((item, index) => (
                                <option
                                  value={item?.value || ""}
                                  key={`addr-${index}`}
                                >
                                  {item?.label || ""}
                                </option>
                              ))}
                            </select>
                            {errors?.billingAddress?.addressType && (
                              <span className="error">
                                {errors?.billingAddress?.addressType?.message ||
                                  ""}
                              </span>
                            )}
                          </label>
                        </div>

                        <div className="Address_input_cntr">
                          <input
                            disabled={useShippingAsBilling}
                            type="text"
                            placeholder="Address"
                            {...register("billingAddress.addressline1")}
                          />
                          {errors?.billingAddress?.addressline1 && (
                            <span className="error">
                              {errors?.billingAddress?.addressline1?.message ||
                                ""}
                            </span>
                          )}
                        </div>

                        <div className="Appartment_input_cntr">
                          <input
                            disabled={useShippingAsBilling}
                            type="text"
                            placeholder="Appartment, suite, etc. (optional)"
                            {...register("billingAddress.addressline2")}
                          />
                        </div>

                        <div className="Phone_input_cntr div-name">
                          <PhoneInput
                            disabled={useShippingAsBilling}
                            value={`+${
                              billingAddress?.countryCode?.replace("+", "") ||
                              "91"
                            }${billingAddress?.phone || ""}`}
                            defaultCountry="in"
                            className="delivery__phone_btn"
                            inputClassName="delivery__input__phone"
                            onChange={(value, metadata) => {
                              const countryCode = `+${
                                metadata?.country?.dialCode || "91"
                              }`;
                              const numberOnly = value
                                .replace(countryCode, "")
                                .trim();

                              setValue(
                                "billingAddress.countryCode",
                                countryCode,
                                {
                                  shouldValidate: true,
                                }
                              );
                              setValue("billingAddress.phone", numberOnly, {
                                shouldValidate: true,
                              });
                            }}
                          />
                          <input
                            type="hidden"
                            {...register("billingAddress.countryCode")}
                          />
                          <input
                            type="hidden"
                            {...register("billingAddress.phone")}
                          />
                          {errors?.billingAddress?.phone && (
                            <span className="error">
                              {errors?.billingAddress?.phone?.message || ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
};

export default BillingAddress;
