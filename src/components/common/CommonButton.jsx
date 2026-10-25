import { useRouter } from "next/router";
import React from "react";

// `testId` is a stable hook for the Playwright suites (QA-05).
const CommonButton = ({
  title,
  href,
  onClick,
  loading = false,
  type = "submit",
  testId,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <button
      id="common_black_btn"
      type={type}
      onClick={handleClick}
      disabled={loading}
      data-testid={testId}
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
