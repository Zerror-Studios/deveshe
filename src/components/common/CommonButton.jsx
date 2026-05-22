"use client";

import React from "react";
import { useRouter } from "next/navigation";

const CommonButton = ({
  title,
  href,
  onClick,
  loading = false,
  type = "submit",
  variant = "default",
  className = "",
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  const rootClass = [
    "common-btn",
    variant === "danger" ? "common-btn--danger" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      id={variant === "default" ? "common_black_btn" : undefined}
      type={type}
      className={rootClass}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <div className="common_btn_loadin">
          <div className="loading_line_wrap">
            <div className="loading_line"></div>
          </div>
        </div>
      ) : (
        title
      )}
    </button>
  );
};

export default CommonButton;
