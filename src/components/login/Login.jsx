import React, { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { useLazyQuery } from "@apollo/client/react";
import { LOGIN_USER } from "@/graphql";
import { toast } from 'react-toastify';
import { useAuthStore } from "@/store/auth-store";
import CommonButton from "../common/CommonButton";
import { TokenManager } from "@/utils/tokenManager";

// Schema validation
const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const Login = ({ setToggle }) => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const { setUser, setIsLoggedIn } = useAuthStore((state) => state);
  const [loginUser, { loading }] = useLazyQuery(LOGIN_USER, { fetchPolicy: "network-only" });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (formData) => {
    try {
      const { data } = await loginUser({ variables: formData });
      const { user, accessToken, refreshToken } = data?.userLogin || {};
      if (accessToken && refreshToken && user) {
        localStorage.removeItem("visitorId");
        localStorage.removeItem("visitorExpire");
        TokenManager.clearTokens(); // clear previous
        TokenManager.setTokens(accessToken, refreshToken);
        setUser(user);
        setIsLoggedIn(true);
        toast.success("Login successful!");
        router.back();
      } else {
        toast.error("Invalid login credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      const gqlMessage = err?.graphQLErrors?.[0]?.message;
      toast.error(gqlMessage || err.message || "Login failed");
    }
  };

  return (
    <div className="left-two">
      <div className="login-inner">
        <div className="login-t">Login</div>

        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
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
              className="login-inp"
              type={visible ? "text" : "password"}
              placeholder="Password"
              {...register("password")}
            />
            {errors?.password && (
              <div className="error-p">{errors?.password?.message || ""}</div>
            )}
          </div>
          <CommonButton title={"Login"} loading={loading} />
        </form>

        <div className="not-up">
          Not a member yet? <span onClick={() => setToggle(true)}>Sign up</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
