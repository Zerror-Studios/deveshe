import React, { useLayoutEffect } from "react";
import PhoneInput from "react-phone-input-2";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { IoLocationOutline } from "react-icons/io5";
import { useMutation } from "@apollo/client/react";
import { USER_ADDRESS_SAVE_OR_UPDATE } from "@/graphql";
import { useAuthStore } from "@/store/auth-store";
import { addressType } from "@/helpers/Data";
import "react-phone-input-2/lib/style.css";

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

const AddressPopup = ({ isOpen, addressId, listPayload, setOpen, refetch }) => {
  const { user } = useAuthStore();
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
        userId: user?._id,
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
  if (!isOpen) return null;
  return (
    <div onClick={() => setOpen(false)} className="modal-overlay" id="address_popup">
      <div onClick={(e) => e.stopPropagation()} className="modal-content">
        <h3 className="modal-title">
          Address details <span className="location-icon"><IoLocationOutline /></span>
        </h3>

        <div className="info-box">Your Address Details will be saved securely</div>

        <form className="address-form" onSubmit={handleSubmit(onSubmit)}>
          {/* Name */}
          <div className="form-row">
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="First Name"
                {...register("firstname")}
              />
              {errors.firstname && (
                <span className="error-text">{errors.firstname.message}</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Last Name"
                {...register("lastname")}
              />
              {errors.lastname && (
                <span className="error-text">{errors.lastname.message}</span>
              )}
            </div>
          </div>

          {/* Address */}
          <input
            type="text"
            placeholder="Address Line 1"
            {...register("addressline1")}
          />
          {errors.addressline1 && (
            <span className="error-text">{errors.addressline1.message}</span>
          )}

          <input
            type="text"
            placeholder="Address Line 2 (Optional)"
            {...register("addressline2")}
          />

          <div className="form-row">
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="City"
                {...register("city")}
              />
              {errors.city && <span className="error-text">{errors.city.message}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="number"
                placeholder="Postal Number"
                {...register("pincode")}
              />
              {errors.pincode && <span className="error-text">{errors.pincode.message}</span>}
            </div>
          </div>

          {/* Country + State */}
          <div className="form-row">
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Country"
                {...register("country")}
              />
              {errors.country && (
                <span className="error-text">{errors.country.message}</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="State"
                {...register("states")}
              />
              {errors.states && <span className="error-text">{errors.states.message}</span>}
            </div>
          </div>

          {/* Phone + Address Type */}
          <div className="form-row">
            <div style={{ flex: 1 }}>
              <PhoneInput
                country={"in"}
                onChange={(value, metadata) => {
                  const countryCode = `+${metadata?.country?.dialCode || 91
                    }`;
                  const numberOnly = value?.replace(countryCode, "").trim();

                  setValue("countryCode", countryCode, {
                    shouldValidate: true,
                  });
                  setValue("phone", numberOnly, {
                    shouldValidate: true,
                  });
                }}
                enableSearch={true}
                inputStyle={{ width: "100%" }}
                buttonStyle={{ border: "none" }}
                placeholder="Phone number"
              />
              <input type="hidden" {...register("countryCode")} />
              <input type="hidden" {...register("phone")} />
              {errors.phone && (
                <span className="error-text">{errors.phone.message}</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <select {...register("addressType")}>
                {addressType?.map((item, index) => (
                  <option key={index} value={item?.value || ""}>
                    {item?.label || ""}
                  </option>
                ))}
              </select>
              {errors.addressType && <span className="error-text">{errors.addressType.message}</span>}
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn cancel" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" disabled={loading} className="btn save">{loading ? <div className="login-load" /> : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressPopup;
