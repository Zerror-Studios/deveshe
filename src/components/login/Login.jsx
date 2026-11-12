import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { toast } from 'react-toastify';
import CommonButton from "../common/CommonButton";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/utils/api-error.util";
import { getSafeNextPath } from "@/utils/redirect.util";
import Link from "next/link";

// Schema validation
const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Password sign-in (backend PRD-041 FR-11): only for customers who already
// have a password; the default is the email code (`CodeSignIn`).
const Login = ({ onUseCode, inactive = false }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const { login } = useAuth();
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
      const { mergeFailed } = await login(formData);
      toast.success("Login successful!");
      if (mergeFailed) {
        toast.info("Some items from your bag are no longer available.");
      }
      router.replace(getSafeNextPath(searchParams.get("next"), "/"));
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
    <div className="left-two" inert={inactive || undefined}>
      <div className="login-inner">
        <div className="login-t">Sign in with password</div>

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
          <CommonButton title={"Sign in"} loading={loading} />
        </form>

        <div className="not-up">
          No password?{" "}
          <span
            role="button"
            tabIndex={0}
            onClick={onUseCode}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") onUseCode();
            }}
          >
            Sign in with an email code
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
