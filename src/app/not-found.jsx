import React from "react";

export default function NotFoundPage() {
  return (
    <div
      style={{
        height: "100vh",
        fontSize: "1.875rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
      }}
    >
      <p>Sorry, we couldn't find the page you're looking for.</p>
      <p>Page not found</p>
    </div>
  );
}

