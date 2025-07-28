import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useMutation } from "@apollo/client";
import { UPDATE_USER_PASSWORD } from "@/graphql";
import { useAuthStore } from "@/store/AuthStore";
import { toast } from "react-hot-toast";

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

const PasswordSection = () => {
  const [visible, setVisible] = useState({
    currentPassword: false,
    newPassword: false,
    renewPassword: false,
  });
  const [updatePassword, { loading }] = useMutation(UPDATE_USER_PASSWORD);
  const { user, setToken } = useAuthStore();

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
        setToken(userToken);
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
    <form onSubmit={handleSubmit(onSubmit)} className="noti-main-div">
      <div className="security-left">
        <h4>Change Password</h4>
        <div className="passguide">
          <p>New password must contain:</p>
          <p>- At least 8 characters</p>
          <p>- At least 1 lowercase letter (a-z)</p>
          <p>- At least 1 uppercase letter (A-Z)</p>
          <p>- At least 1 number (0-9)</p>
          <p>- At least 1 special character</p>
        </div>
      </div>

      <div className="form-secure" style={{ width: "50%" }}>
        {/* Current Password */}
        <div className="curr-pass" style={{ position: "relative" }}>
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
            className="general__input"
            type={visible?.currentPassword ? "text" : "password"}
            placeholder="Enter Current Password"
            {...register("currentPassword")}
          />
          {errors.currentPassword && (
            <p className="error">{errors.currentPassword.message}</p>
          )}
        </div>

        {/* New Password */}
        <div className="curr-pass" style={{ position: "relative" }}>
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
            className="general__input"
            type={visible?.newPassword ? "text" : "password"}
            placeholder="Enter New Password"
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="error">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="curr-pass" style={{ position: "relative" }}>
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
            className="general__input"
            type={visible?.renewPassword ? "text" : "password"}
            placeholder="Confirm New Password"
            {...register("renewPassword")}
          />
          {errors.renewPassword && (
            <p className="error">{errors.renewPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <div className="secure-btn">
          <button
            type="submit"
            className="_btn_wrapper3 _btn_height _w-full"
            style={{ width: "170px" }}
            disabled={loading}
          >
            {loading ? <div className="login-load" /> : "Change Password"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PasswordSection;
