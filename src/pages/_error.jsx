/**
 * Branded error page (PRD-014 UX-36)
 *
 * Server and client errors other than 404 (`pages/404.jsx`) land here
 * instead of Next's unbranded page. The status code is shown, the error
 * itself never is.
 */
import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import CommonButton from "@/components/common/CommonButton";

// ─── Constants ────────────────────────────────────────────────────────────

const INTERNAL_ERROR_STATUS = 500;
const NOT_FOUND_STATUS = 404;

// ─── Component ────────────────────────────────────────────────────────────

const ErrorPage = ({ statusCode }) => {
  const router = useRouter();
  const isNotFound = statusCode === NOT_FOUND_STATUS;

  return (
    <>
      <Head>
        <title>Something went wrong – DeVeSheDreams</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div id="status_section">
        <h2>
          {isNotFound ? "Page " : "Something "}
          <span>{isNotFound ? "not found" : "went wrong"}</span>
        </h2>
        <p>
          {isNotFound
            ? "Sorry, we couldn't find the page you're looking for."
            : "We couldn't load this page. Please try again in a moment."}
        </p>
        {!isNotFound && (
          <CommonButton
            title={"Try again"}
            type="button"
            onClick={() => router.reload()}
          />
        )}
        <CommonButton
          title={"Back to home"}
          type="button"
          onClick={() => router.push("/")}
        />
      </div>
    </>
  );
};

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode =
    res?.statusCode || err?.statusCode || INTERNAL_ERROR_STATUS;
  return { statusCode };
};

export default ErrorPage;
