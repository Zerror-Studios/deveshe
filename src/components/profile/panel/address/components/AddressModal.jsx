import React, { useLayoutEffect } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { IoLocationOutline } from "react-icons/io5";
import { PhoneInput } from "react-international-phone";
import { useMutation } from "@apollo/client";
import { USER_ADDRESS_SAVE_OR_UPDATE } from "@/graphql";
import { useAuthStore } from "@/store/AuthStore";
import { addressType } from "@/helpers/Data";
import "react-international-phone/style.css";

// Zod schema
const addressSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  addressType: z.string().min(1, "Address type is required"),
  addressline1: z.string().min(1, "Address Line 1 is required"),
  addressline2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  pincode: z.string().min(4, "Pincode is required"),
  country: z.string().min(1, "Country is required"),
  states: z.string().min(1, "State is required"),
  phone: z.string().min(8, "Phone is required"),
  countryCode: z.string().min(1, "Country code is required"),
});

const AddressModal = ({ addressId, listPayload, setOpen, refetch }) => {
  const {
    user: { _id },
  } = useAuthStore();
  const [saveUpdateAddress, { loading }] = useMutation(
    USER_ADDRESS_SAVE_OR_UPDATE
  );
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      addressType: "HOME",
      addressline1: "",
      addressline2: "",
      city: "",
      pincode: "",
      country: "India",
      states: "",
      phone: "",
      countryCode: "+91",
    },
  });

  useLayoutEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  const onSubmit = async (data) => {
    try {
      const input = {
        userId: _id,
        ...data,
      };
      const { data: response } = await saveUpdateAddress({
        variables: {
          input,
          ...(addressId ? { addressSaveOrUpdateId: addressId } : ""),
        },
      });
      const addressResponse = response?.addressSaveOrUpdate;
      if (addressResponse && Object.keys(addressResponse)?.length) {
        toast.success("Address saved successfully!");
        await refetch(listPayload);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to save");
    } finally {
      reset();
      setOpen(false);
    }
  };

  return (
    <>
      <div className="variant-bg flex-all" data-lenis-prevent>
        <OutsideClickHandler
          onOutsideClick={() => {
            setOpen(false);
          }}
        >
          <form className="add-payment-main" onSubmit={handleSubmit(onSubmit)}>
            <div className="wrap-payment-head">
              <div className="detail-top">
                <p>Address details</p>
                <div className="icons-pay">
                  <IoLocationOutline style={{ fontSize: "20px" }} />
                </div>
              </div>

              <div className="text-pay">
                Your Address Details will be saved securely
              </div>
            </div>
            <div className="card-details" style={{ height: "356px" }}>
              <div className="twoinone2">
                <div className="div-name card-info">
                  <label className="label-text text-sm font-bold">
                    First Name
                  </label>
                  <input
                    className="general__input"
                    type="text"
                    placeholder="Rohit"
                    {...register("firstname")}
                  />
                  {errors.firstname && (
                    <span className="error">{errors.firstname.message}</span>
                  )}
                </div>
                <div className="div-name card-info">
                  <label className="label-text text-sm font-bold">
                    Last Name
                  </label>
                  <input
                    className="general__input"
                    type="text"
                    placeholder="Sharma"
                    {...register("lastname")}
                  />
                  {errors.lastname && (
                    <span className="error">{errors.lastname.message}</span>
                  )}
                </div>
              </div>

              <div className="div-name card-info">
                <label className="label-text text-sm font-bold">
                  Address Line 1
                </label>
                <input
                  className="general__input"
                  type="text"
                  placeholder="Address"
                  {...register("addressline1")}
                />
                {errors.addressline1 && (
                  <span className="error">{errors.addressline1.message}</span>
                )}
              </div>
              <div className="div-name card-info">
                <label className="label-text text-sm font-bold">
                  Address Line 2
                </label>
                <input
                  className="general__input"
                  type="text"
                  placeholder="Address"
                  {...register("addressline2")}
                />
              </div>

              <div className="twoinone2">
                <div className="div-name card-info">
                  <label className="label-text text-sm font-bold">City</label>
                  <input
                    className="general__input"
                    type="text"
                    placeholder="City"
                    {...register("city")}
                  />
                  {errors.city && (
                    <span className="error">{errors.city.message}</span>
                  )}
                </div>
                <div className="div-name card-info">
                  <label className="label-text text-sm font-bold">
                    Postel Number
                  </label>
                  <input
                    className="general__input"
                    type="number"
                    placeholder="211027"
                    {...register("pincode")}
                  />
                  {errors.pincode && (
                    <span className="error">{errors.pincode.message}</span>
                  )}
                </div>
              </div>

              <div className="twoinone2">
                <div className="div-name card-info">
                  <label className="label-text text-sm font-bold">
                    Country
                  </label>
                  <input
                    className="general__input"
                    type="text"
                    placeholder="Country"
                    {...register("country")}
                  />
                  {errors.country && (
                    <span className="error">{errors.country.message}</span>
                  )}
                </div>
                <div className="div-name card-info">
                  <label className="label-text text-sm font-bold">State</label>
                  <input
                    className="general__input"
                    type="text"
                    placeholder="State"
                    {...register("states")}
                  />
                  {errors.states && (
                    <span className="error">{errors.states.message}</span>
                  )}
                </div>
              </div>
              {/* <div className="twoinone2">
                <div className="pro-country">
                  <label className="label-text text-sm font-bold">
                    Country
                  </label>
                  <div className="flex-all k">
                    <select className="general__input" {...register("country")}>
                      {countries.map((item, index) => (
                        <option key={index} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    {errors.country && (
                      <span className="error">{errors.country.message}</span>
                    )}
                  </div>
                </div>
                <div className="div-name card-info">
                  <div className="pro-country">
                    <label className="label-text text-sm font-bold">
                      State
                    </label>
                    <div className="flex-all k">
                      <select className="general__input" {...register("state")}>
                        {states.map((item, index) => (
                          <option key={index} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <span className="error">{errors.state.message}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div> */}

              <div className="twoinone2">
                <div className="div-name card-info">
                  <label className="label-text text-sm font-bold">Phone</label>
                  <PhoneInput
                    defaultCountry="in"
                    className="phone-con2"
                    style={{ borderBottom: "none" }}
                    inputClassName="general__input__phone"
                    onChange={(value, metadata) => {
                      const countryCode = `+${
                        metadata?.country?.dialCode || 91
                      }`;
                      const numberOnly = value?.replace(countryCode, "").trim();

                      setValue("countryCode", countryCode, {
                        shouldValidate: true,
                      });
                      setValue("phone", numberOnly, {
                        shouldValidate: true,
                      });
                    }}
                  />
                  <input type="hidden" {...register("countryCode")} />
                  <input type="hidden" {...register("phone")} />
                  {errors.phone && (
                    <span className="error">{errors.phone.message}</span>
                  )}
                </div>
                <div className="div-name card-info">
                  <div className="pro-country">
                    <label className="label-text text-sm font-bold">
                      Address Type
                    </label>
                    <div className="flex-all k">
                      <select
                        className="general__input"
                        {...register("addressType")}
                      >
                        {addressType?.map((item, index) => (
                          <option key={index} value={item?.value || ""}>
                            {item?.label || ""}
                          </option>
                        ))}
                      </select>
                      {errors.addressType && (
                        <span className="error">
                          {errors.addressType.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="down-menu">
              <button
                className="_btn_wrapper _btn_height _w-full de-btn"
                style={{ width: "73px", marginTop: "0" }}
                onClick={() => {
                  reset(), setOpen(false);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="_btn_wrapper3 _btn_height _w-full"
                disabled={loading}
              >
                {loading ? <div className="login-load" /> : "Save"}
              </button>
            </div>
          </form>
        </OutsideClickHandler>
      </div>
    </>
  );
};

export default AddressModal;
