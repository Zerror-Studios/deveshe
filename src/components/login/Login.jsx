import React, { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { useLazyQuery } from "@apollo/client";
import { LOGIN_USER } from "@/graphql";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth-store";

// Schema validation
const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const Login = ({ setToggle }) => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const { setToken, setUser, setIsLoggedIn } = useAuthStore((state) => state);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
  });

  const [loginUser, { loading }] = useLazyQuery(LOGIN_USER, {
    fetchPolicy: "network-only",
    onCompleted: (response) => {
      const { user, userToken } = response?.userLogin || {};
      if (userToken && user) {
        setToken(userToken);
        setUser(user);
        setIsLoggedIn(true);
        toast.success("Login successful!");
        router.back();
      } else {
        toast.error("Invalid login credentials.");
      }
    },
    onError: (err) => {
      console.error("Login error:", err);
      const gqlMessage = err?.graphQLErrors?.[0]?.message;
      toast.error(gqlMessage || err.message || "Login failed");
    },
  });

  const onSubmit = (formData) => {
    loginUser({ variables: formData });
  };

  return (
    <div className="left-two">
      <div className="login-inner">
        <div className="login-t">Login</div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="inp-rel">
            <input
              className="login-inp"
              placeholder="Email"
              {...register("email")}
            />
            {errors?.email && (
              <div className="error">{errors?.email?.message || ""}</div>
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
              <div className="error">{errors?.password?.message || ""}</div>
            )}
          </div>

          <button
            type="submit"
            className="login-btn flex-all"
            disabled={loading}
          >
            {loading ? <div className="login-load"></div> : "Login"}
          </button>
        </form>

        <div className="not-up">
          Not a member yet? <span onClick={() => setToggle(true)}>Sign up</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
