import React from "react";
import Image from "next/image";
import CommonButton from "@/components/common/CommonButton";

export default function NotFoundPage() {
  return (
    <div id="status_section">
      <Image
        width={1000}
        height={1000}
        src="/fail.gif"
        className="fail_gif"
        alt="payment failed"
      />
      <h2>
      Oops! Page Not Found
      </h2>
      <p>
      The page you are looking for might have been removed, renamed,
      or is temporarily unavailable.
      </p>
      <CommonButton title={"Go Back to Home"} href={"/"} />
    </div>
  );
}

