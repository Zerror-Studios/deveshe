"use client";

import React, { useEffect, useState } from "react";

export default function SiteGate({ children }) {
  const [granted, setGranted] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/site-access")
      .then((res) => res.json())
      .then((data) => setGranted(Boolean(data.granted)))
      .catch(() => setGranted(false));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/site-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError("Incorrect password. Please try again.");
        setLoading(false);
        return;
      }

      setGranted(true);
      setPassword("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (granted === null) {
    return <div className="site-gate site-gate--loading" aria-hidden />;
  }

  if (!granted) {
    return (
      <div className="site-gate">
        <div className="site-gate__inner">
          <p className="site-gate__eyebrow">DeVeSheDreams</p>
          <h1 className="site-gate__title">
            We&apos;re updating
            <br />
            our collection.
          </h1>
          <p className="site-gate__message">
            Come back soon — something new is on the way.
          </p>

          <form className="site-gate__form" onSubmit={handleSubmit}>
            <input
              id="site-gate-password"
              type="password"
              className="site-gate__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              disabled={loading}
            />
            {error ? <p className="site-gate__error">{error}</p> : null}
            <button
              type="submit"
              className="site-gate__submit"
              disabled={loading}
            >
              {loading ? "Checking..." : "Enter"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return children;
}

