"use client";

import React from "react";
import { useRouter } from "next/navigation";

const CommonButton = ({
  title,
  children,
  href,
  onClick,
  loading = false,
  disabled = false,
  type = "submit",
  variant = "default",
  className = "",
  useDefaultId = true,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  const variantClass =
    variant === "brand"
      ? "common-btn--brand"
      : variant === "danger"
        ? "common-btn--danger"
        : "common-btn--light";

  const rootClass = ["common-btn", variantClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      id={
        (variant === "default" || variant === "light") && useDefaultId
          ? "common_black_btn"
          : undefined
      }
      type={type}
      className={rootClass}
      onClick={handleClick}
      disabled={loading || disabled}
    >
      {loading ? (
        <div className="common_btn_loadin">
          <div className="loading_line_wrap">
            <div className="loading_line"></div>
          </div>
        </div>
      ) : (
        children ?? title
      )}
    </button>
  );
};

export default CommonButton;
