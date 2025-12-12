import React, { useState } from "react";
import CommonButton from "@/components/common/CommonButton";
import { FaUserEdit } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client/react";
import { UPDATE_USER_PROFILE } from "@/graphql";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Image from "next/image";
import { MdOutlineDone } from "react-icons/md";

const SignupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  countryCode: z.string().min(1, "Country Code is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email"),
});

const ProfileDetails = () => {
  const [isEditable, setIsEditable] = useState(true);
  const [updateUser, { loading }] = useMutation(UPDATE_USER_PROFILE);
  const { user, setUser } = useAuthStore((state) => state);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      countryCode: user?.countryCode || "+91",
      phoneNumber: user?.phoneNumber || "",
    },
  });
  const onSubmit = async (data) => {
    if (!isEditable) return;
    try {
      const input = {
        ...data,
      };
      const { data: response } = await updateUser({
        variables: { input, clientUserUpdateId: user?._id },
      });
      const updatedUser = response?.clientUserUpdate?.user;

      if (updatedUser) {
        setUser(updatedUser);
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Update failed");
    }
  };

  return (
    <div id="profile_details" className="detail_block">
      <div className="profile_left_container">
        <h4>Profile Details</h4>
        <p>
          Easily update your profile details on our platform for a personalized
          experience. Your information is safeguarded with us.
        </p>
      </div>

      <div className="profile_right_container">
        <div className="profile_avatar">
          <Image
            src={
              user?.profileImg ||
              `https://avatar.iran.liara.run/username?username=${user?.firstName}+${user?.lastName}`
            }
            alt="avatar"
            width={100}
            height={100}
            layout="responsive"
          />
        </div>
        <CommonButton title="Upload Avatar" />

        <form className="user_form" onSubmit={handleSubmit(onSubmit)}>
          <div className="user_form_input">
            <input
              type="text"
              disabled={isEditable}
              placeholder="First Name"
              {...register("firstName")}
            />
            {errors.firstName && (
              <span className="error-text">{errors.firstName.message}</span>
            )}
          </div>

          <div className="user_form_input">
            <input
              type="text"
              disabled={isEditable}
              placeholder="Last Name"
              {...register("lastName")}
            />
            {errors.lastName && (
              <span className="error-text">{errors.lastName.message}</span>
            )}
          </div>

          <div className="user_form_input">
            <input
              type="email"
              disabled={isEditable}
              placeholder="Email"
              {...register("email")}
            />
            {errors.email && (
              <span className="error-text">{errors.email.message}</span>
            )}
          </div>

          <div className="user_form_input">
            <PhoneInput
              defaultCountry="in"
              disabled={isEditable}
              enableSearch={true}   // allows searching countries
              inputStyle={{ width: "100%" }} // full width like other inputs
              buttonStyle={{ border: "none" }} // clean flag dropdown
              placeholder="Enter phone number"
              value={`+${user?.countryCode?.replace("+", "") || "91"}${user?.phoneNumber || ""
                }`}
              onChange={(value, metadata) => {
                const countryCode = `+${metadata?.country?.dialCode || 91
                  }`;
                const numberOnly = value
                  ?.replace(countryCode, "")
                  .trim();

                setValue("countryCode", countryCode, {
                  shouldValidate: true,
                });
                setValue("phoneNumber", numberOnly, {
                  shouldValidate: true,
                });
              }}
            />
            <input type="hidden" {...register("countryCode")} />
            <input type="hidden" {...register("phoneNumber")} />
            {errors.countryCode && (
              <span className="error-text">{errors.countryCode.message}</span>
            )}
            {errors.phoneNumber && (
              <span className="error-text">{errors.phoneNumber.message}</span>
            )}
          </div>
          <button
            id="edit_user_details"
            type={!isEditable ? "button" : "submit"}
            disabled={loading}
            onClick={() => setIsEditable((prev) => !prev)}
          >
            {loading ? (
              <div className="loader-btn" />
            ) : (
              <>
                {isEditable ? (
                  <FaUserEdit className="status-btnpro" />
                ) : (
                  <MdOutlineDone className="status-btnpro" />
                )}
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ProfileDetails;
