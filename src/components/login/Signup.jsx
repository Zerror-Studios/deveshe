import React, { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { PhoneInput } from "react-international-phone";
import { useMutation } from "@apollo/client/react";
import { SIGN_UP_USER } from "@/graphql";
import { useAuthStore } from "@/store/auth-store";
import { UserStatus } from "@/utils/Constant";
import { toast } from 'react-toastify';
import "react-international-phone/style.css";
import CommonButton from "../common/CommonButton";
import { TokenManager } from "@/utils/tokenManager";

const SignupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    countryCode: z.string().min(1, "Country Code is required"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const Signup = ({ setToggle }) => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [signupUser, { loading }] = useMutation(SIGN_UP_USER);
  const { setUser, setIsLoggedIn } = useAuthStore((state) => state);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SignupSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...rest } = data;
      const input = {
        ...rest,
        status: UserStatus.ACTIVE,
      };
      const { data: response } = await signupUser({ variables: { input } });
      const { user, accessToken, refreshToken } = response?.clientUserSave || {};
      if (accessToken && refreshToken && Object.keys(user).length > 0) {
        localStorage.removeItem("visitorId");
        localStorage.removeItem("visitorExpire");
        TokenManager.clearTokens(); // clear previous
        TokenManager.setTokens(accessToken, refreshToken);
        setUser(user);
        setIsLoggedIn(true);
        toast.success("Account created successfully!");
        router.back();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Signup failed");
    }
  };

  return (
    <>
      <div className="left-two">
        <div className="login-inner">
          <div className="login-t">Sign Up</div>

          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <div className="name-cont">
              <div className="half-inp-cont inp-rel">
                <input
                  className="login-inp"
                  placeholder="First Name"
                  {...register("firstName")}
                />
                {errors?.firstName && (
                  <div className="error-p">
                    {errors?.firstName?.message || ""}
                  </div>
                )}
              </div>
              <div className="half-inp-cont inp-rel">
                <input
                  className="login-inp"
                  placeholder="Last Name"
                  {...register("lastName")}
                />
                {errors?.lastName && (
                  <div className="error-p">
                    {errors?.lastName?.message || ""}
                  </div>
                )}
              </div>
            </div>

            <div className="phone-div inp-rel">
              {/* <label>Phone Number:</label> */}
              <PhoneInput
                defaultCountry="in"
                inputClassName="general__input__phone signup-inp"
                className="phone-con signup-inp"
                onChange={(value, metadata) => {
                  const countryCode = `+${metadata?.country?.dialCode || 91}`;
                  const numberOnly = value?.replace(countryCode, "").trim();

                  setValue("countryCode", countryCode);
                  setValue("phoneNumber", numberOnly);
                }}
              />
              <input type="hidden" {...register("countryCode")} />
              <input type="hidden" {...register("phoneNumber")} />
              {errors?.phoneNumber && (
                <div className="error-p phone-error">
                  {errors?.phoneNumber?.message || ""}
                </div>
              )}
            </div>

            <div className="inp-rel">
              <input
                className="login-inp"
                placeholder="Email"
                {...register("email")}
              />
              {errors?.email && (
                <div className="error-p">{errors?.email?.message || ""}</div>
              )}
            </div>

            <div className="pass-cont inp-rel">
              <div
                className="eye-cont flex-all"
                onClick={() => setVisible(!visible)}
              >
                {visible ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
              </div>
              <input
                type={visible ? "text" : "password"}
                className="login-inp"
                placeholder="Password"
                {...register("password")}
              />
              {errors?.password && (
                <div className="error-p">{errors?.password?.message || ""}</div>
              )}
            </div>
            {/* Confirm Password */}
            <div className="pass-cont inp-rel">
              <div
                className="eye-cont flex-all"
                onClick={() => setConfirmVisible(!confirmVisible)}
              >
                {confirmVisible ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
              </div>
              <input
                type={confirmVisible ? "text" : "password"}
                className="login-inp"
                placeholder="Confirm Password"
                {...register("confirmPassword")}
              />
              {errors?.confirmPassword && (
                <div className="error-p">
                  {errors?.confirmPassword?.message}
                </div>
              )}
            </div>

            <CommonButton title={"Signup"} loading={loading} />
          </form>

          <div className="not-up">
            Already a member?{" "}
            <span onClick={() => setToggle(false)}>Login</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
