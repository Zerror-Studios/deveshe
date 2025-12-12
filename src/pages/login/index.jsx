import React, { useState } from "react";
import Signup from "@/components/login/Signup";
import Login from "@/components/login/Login";
import Image from "next/image";
import SeoHeader from "@/components/seo/SeoHeader";

const UserLogin = ({ meta }) => {
  const [toggle, setToggle] = useState(false);
  return (
    <>
      <SeoHeader meta={meta} />
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
    </>
  );
};

export default UserLogin;

export async function getStaticProps() {
  const meta = {
    title: "Login – DeVeSheDreams",
    description:
      "Access your DeVeSheDreams account to manage orders, update your profile, and enjoy a personalized fashion experience.",
    keywords: [
      "DeVeSheDreams login",
      "account access",
      "sign in",
      "user account",
      "dashboard",
      "profile management"
    ],
    primaryKeywords: ["DeVeSheDreams login", "account access"],
    author: "DeVeSheDreams",
    robots: "noindex, nofollow",
    og: {
      title: "Login – DeVeSheDreams",
      description:
        "Sign in to your DeVeSheDreams account to access your orders, profile, and personalized fashion recommendations."
    },
    twitter: {
      card: "summary_large_image",
      title: "Login – DeVeSheDreams",
      description:
        "Log in to your DeVeSheDreams account to manage your orders and profile details securely."
    }
  };

  return { props: { meta } };
}
