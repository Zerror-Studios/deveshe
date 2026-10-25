import React, { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { useApolloClient } from "@apollo/client/react";
import { toast } from 'react-toastify';
import CommonButton from "../common/CommonButton";
import { CustomerSession } from "@/lib/customer-session.service";
import { getErrorMessage } from "@/utils/api-error.util";
import { getSafeNextPath } from "@/utils/redirect.util";
import Link from "next/link";

// Schema validation
const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const Login = ({ setToggle }) => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const client = useApolloClient();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (formData) => {
    if (loading) return;
    setLoading(true);
    try {
      const { failedMergeCount } = await CustomerSession.login(
        client,
        formData,
      );
      toast.success("Login successful!");
      if (failedMergeCount > 0) {
        toast.info("Some items from your bag are no longer available.");
      }
      router.replace(getSafeNextPath(router.query.next, "/"));
    } catch (err) {
      console.error("Login error:", err);
      toast.error(
        getErrorMessage(err, "Login failed", {
          UNAUTHENTICATED: "Invalid email or password.",
          BAD_USER_INPUT: "Invalid email or password.",
        }),
      );
    } finally {
      setLoading(false);
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
          <div className="forgot-link">
            <Link href="/forgot-password">Forgot password?</Link>
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
