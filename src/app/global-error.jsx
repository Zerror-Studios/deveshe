"use client";

/**
 * Last-resort error page (kit PRD-002 FR-3.2): the root layout itself
 * failed, so this renders its own `<html>` without the site's providers
 * or CSS. Plain markup and a full reload only.
 */

const GlobalError = () => (
  <html lang="en">
    <body
      style={{
        minHeight: "100vh",
        margin: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        background: "#fadcde",
        textAlign: "center",
        padding: "0 1.5rem",
      }}
    >
      <title>Something went wrong – DeVeSheDreams</title>
      <meta name="robots" content="noindex, nofollow" />
      <h2>Something went wrong</h2>
      <p>We couldn't load this page. Please try again in a moment.</p>
      <a href="/" style={{ marginTop: "1rem", textDecoration: "underline" }}>
        Back to home
      </a>
    </body>
  </html>
);

export default GlobalError;
