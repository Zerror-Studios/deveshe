"use client";

/**
 * Branded error page (was `pages/_error.jsx`; PRD-014 UX-36).
 *
 * A page that fails to render lands here instead of Next's unbranded
 * page; the error itself is never shown. "Try again" re-renders the
 * route (`reset`), "Back to home" leaves it.
 */

import React from "react";
import { useRouter } from "next/navigation";
import CommonButton from "@/components/common/CommonButton";

const ErrorPage = ({ reset }) => {
  const router = useRouter();

  return (
    <div id="status_section">
      <title>Something went wrong – DeVeSheDreams</title>
      <meta name="robots" content="noindex, nofollow" />
      <h2>
        Something <span>went wrong</span>
      </h2>
      <p>We couldn't load this page. Please try again in a moment.</p>
      <CommonButton title={"Try again"} type="button" onClick={() => reset()} />
      <CommonButton
        title={"Back to home"}
        type="button"
        onClick={() => router.push("/")}
      />
    </div>
  );
};

export default ErrorPage;
