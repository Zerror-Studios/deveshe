"use client";

/**
 * /login (backend PRD-041 FR-11, FR-12): the email code first
 * (`CodeSignIn`, also the sign-up), "Sign in with password instead" slides
 * to the password form (`Login`) for customers who have one. Both go to
 * `?next=` after signing in.
 */

import React, { useState } from "react";
import Image from "next/image";
import CodeSignIn from "@/components/login/CodeSignIn";
import Login from "@/components/login/Login";

const UserLogin = () => {
  // false: the code sign-in; true: the password form
  const [usePassword, setUsePassword] = useState(false);
  return (
    <>
      <div className="login-cont">
        <div
          className="login-left-cont"
          style={{ transform: usePassword ? "translateY(0%)" : "translateY(-50%)" }}
        >
          <div className="left-one">
            <Image
              width={1000}
              height={1000}
              src="/assets/images/login/img1.webp"
              alt="image"
            />
          </div>
          <div className="left-one">
            <Image
              width={1000}
              height={1000}
              src="/assets/images/login/img2.webp"
              alt="image"
            />
          </div>
        </div>
        <div
          className="login-right-cont"
          style={{ transform: usePassword ? "translateY(-50%)" : "translateY(0%)" }}
        >
          {/* The panel out of view takes no focus or clicks */}
          <CodeSignIn
            inactive={usePassword}
            onUsePassword={() => setUsePassword(true)}
          />
          <Login inactive={!usePassword} onUseCode={() => setUsePassword(false)} />
        </div>
      </div>
    </>
  );
};

export default UserLogin;
