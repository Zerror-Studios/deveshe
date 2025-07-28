import React, { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { PhoneInput } from "react-international-phone";
import { useMutation } from "@apollo/client";
import { SIGN_UP_USER } from "@/graphql";
import { useAuthStore } from "@/store/auth-store";
import { UserStatus } from "@/utils/Constant";
import toast from "react-hot-toast";
import "react-international-phone/style.css";

const SignupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  countryCode: z.string().min(1, "Country Code is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

const Signup = ({ setToggle }) => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [signupUser, { loading }] = useMutation(SIGN_UP_USER);
  const { setToken, setUser, setIsLoggedIn } = useAuthStore((state) => state);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SignupSchema),
  });

  const onSubmit = async (data) => {
    try {
      const input = {
        ...data,
        status: UserStatus.ACTIVE,
      };
      const { data: response } = await signupUser({ variables: { input } });
      const { user, userToken } = response?.clientUserSave || {};
      if (userToken && Object.keys(user).length > 0) {
        setToken(userToken);
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

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
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

                  setValue("countryCode", countryCode, {
                    shouldValidate: true,
                  });
                  setValue("phoneNumber", numberOnly, { shouldValidate: true });
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

            <button
              type="submit"
              className="login-btn flex-all"
              disabled={loading}
            >
              {loading ? <div className="login-load" /> : "Signup"}
            </button>
          </form>

          <div className="not-up">
            Already a member? <span onClick={() => setToggle(false)}>Login</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
