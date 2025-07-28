import React, { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaUserEdit } from "react-icons/fa";
import { MdOutlineDone } from "react-icons/md";
import { PhoneInput } from "react-international-phone";
import { useMutation } from "@apollo/client";
import { UPDATE_USER_PROFILE } from "@/graphql";
import { useAuthStore } from "@/store/AuthStore";
import { toast } from "react-hot-toast";
import "react-international-phone/style.css";

const SignupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  countryCode: z.string().min(1, "Country Code is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email"),
});

const ProfileSection = () => {
  const [isEditable, setIsEditable] = useState(true);
  const [updateUser, { loading }] = useMutation(UPDATE_USER_PROFILE);
  const { user, setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      countryCode: user.countryCode || "+91",
      phoneNumber: user.phoneNumber || "",
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
    <div className="noti-main-div">
      <div className="pay-top">
        <div className="pay-head">
          <h4>Profile Details</h4>
          <p>
            Easily update your profile details on our platform for a
            personalized experience. Your information is safeguarded with us.
          </p>
        </div>
      </div>

      <div style={{ width: "50%" }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <button
            id="edit_profile"
            type={!isEditable ? "button" : "submit"}
            className="_btn_wrapper _btn_height _w-full"
            disabled={loading}
            onClick={() => setIsEditable((prev) => !prev)}
            style={{
              position: "relative",
              left: "93%",
              width: "40px",
              height: "40px",
              top: "15px",
              borderRadius: "50%",
              padding: "0",
              cursor: "pointer",
            }}
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

          <div className="general-container">
            <div className="user-details-profile">
              <div className="user-image-profile">
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

              <div
                className="fixed-right"
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
                    <input
                      className="general__input"
                      type="text"
                      disabled={isEditable}
                      placeholder="First Name"
                      {...register("firstName")}
                    />
                    {errors.firstName && (
                      <p className="error">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="div-name">
                    <input
                      className="general__input"
                      type="text"
                      disabled={isEditable}
                      placeholder="Last Name"
                      {...register("lastName")}
                    />
                    {errors.lastName && (
                      <p className="error">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                <div className="input-fields">
                  <div className="div-name">
                    <input
                      className="general__input"
                      type="email"
                      disabled={isEditable}
                      placeholder="Email"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="error">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="div-name">
                    <PhoneInput
                      defaultCountry="in"
                      disabled={isEditable}
                      className="phone-con2"
                      style={{ borderBottom: "none" }}
                      inputClassName="general__input__phone"
                      value={`+${user?.countryCode?.replace("+", "") || "91"}${
                        user?.phoneNumber || ""
                      }`}
                      onChange={(value, metadata) => {
                        const countryCode = `+${
                          metadata?.country?.dialCode || 91
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
                      <p className="error">{errors.countryCode.message}</p>
                    )}
                    {errors.phoneNumber && (
                      <p className="error">{errors.phoneNumber.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSection;
