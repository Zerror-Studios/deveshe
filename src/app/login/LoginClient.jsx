"use client";

import React, { useState } from "react";
import Signup from "@/components/login/Signup";
import Login from "@/components/login/Login";
import Image from "next/image";

export default function LoginClient() {
  const [toggle, setToggle] = useState(false);

  return (
    <div className="login-cont">
      <div
        className="login-left-cont"
        style={{ transform: toggle ? "translateY(0%)" : "translateY(-50%)" }}
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
        style={{ transform: toggle ? "translateY(-50%)" : "translateY(0%)" }}
      >
        <Login setToggle={setToggle} />
        <Signup setToggle={setToggle} />
      </div>
    </div>
  );
}

