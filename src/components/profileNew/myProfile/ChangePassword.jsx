import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useMutation } from "@apollo/client/react";
import { UPDATE_USER_PASSWORD } from "@/graphql";
import { useAuthStore } from "@/store/auth-store";
import { AuthCookies } from "@/utils/AuthCookies";
import { toast } from "react-toastify";
import CommonButton from "@/components/common/CommonButton";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Must include at least one lowercase letter")
      .regex(/[A-Z]/, "Must include at least one uppercase letter")
      .regex(/[0-9]/, "Must include at least one number")
      .regex(/[^a-zA-Z0-9]/, "Must include at least one special character"),
    renewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.renewPassword, {
    path: ["renewPassword"],
    message: "Passwords do not match",
  });

const ChangePassword = () => {
  const [visible, setVisible] = useState({
    currentPassword: false,
    newPassword: false,
    renewPassword: false,
  });
  const [updatePassword, { loading }] = useMutation(UPDATE_USER_PASSWORD);
  const { user } = useAuthStore((state) => state);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onVisibleChange = (key) => {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onSubmit = async (data) => {
    try {
      const input = {
        email: user?.email || null,
        currentPassword: data?.currentPassword || null,
        newPassword: data?.renewPassword || null,
      };
      const { data: response } = await updatePassword({
        variables: { ...input },
      });
      const { userToken } = response?.changeUserPassword || {};
      if (userToken) {
        AuthCookies.set(userToken);
        reset();
        toast.success("Password Updated successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Update failed");
      reset();
    }
  };
  return (
    <div id="change_password" className="detail_block">
      <div className="profile_left_container">
        <h4>Change Password</h4>
        <p>
          New password must contain: <br />
          - At least 8 characters <br />
          - At least 1 lowercase letter (a-z) <br />
          - At least 1 uppercase letter (A-Z) <br />
          - At least 1 number (0-9) <br />- At least 1 special character
        </p>
      </div>
      <div className="profile_right_container">
        <form onSubmit={handleSubmit(onSubmit)} className="change_pass_form">
          <div className="password_input">
            <div
              className="eye-cont flex-all"
              style={{ top: "-13px", color: "rgba(0,0,0,0.2)" }}
              onClick={() => onVisibleChange("currentPassword")}
            >
              {visible?.currentPassword ? (
                <AiOutlineEye />
              ) : (
                <AiOutlineEyeInvisible />
              )}
            </div>
            <input
              type={visible?.currentPassword ? "text" : "password"}
              placeholder="Enter Current Password"
              {...register("currentPassword")}
            />
            {errors.currentPassword && (
              <span className="error-text">{errors.currentPassword.message}</span>
            )}
          </div>
          <div className="password_input">
            <div
              className="eye-cont flex-all"
              style={{ top: "-13px", color: "rgba(0,0,0,0.2)" }}
              onClick={() => onVisibleChange("newPassword")}
            >
              {visible?.newPassword ? (
                <AiOutlineEye />
              ) : (
                <AiOutlineEyeInvisible />
              )}
            </div>
            <input
              type={visible?.newPassword ? "text" : "password"}
              placeholder="Enter New Password"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <span className="error-text">{errors.newPassword.message}</span>
            )}
          </div>
          <div className="password_input">
            <div
              className="eye-cont flex-all"
              style={{ top: "-13px", color: "rgba(0,0,0,0.2)" }}
              onClick={() => onVisibleChange("renewPassword")}
            >
              {visible?.renewPassword ? (
                <AiOutlineEye />
              ) : (
                <AiOutlineEyeInvisible />
              )}
            </div>
            <input
              type={visible?.renewPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              {...register("renewPassword")}
            />
            {errors.renewPassword && (
              <span className="error-text">{errors.renewPassword.message}</span>
            )}
          </div>
          <CommonButton
            type="submit"
            title="Change Password"
            loading={loading}
          />
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
