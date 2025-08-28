import { useRouter } from "next/router";
import React from "react";

const CommonButton = ({ title, href, onClick }) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <button id="common_black_btn" onClick={handleClick}>
      {title}
    </button>
  );
};

export default CommonButton;
