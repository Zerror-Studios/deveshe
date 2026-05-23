import Link from "next/link";
import React from "react";

/**
 * Bracketed heading CTA with duplicate-line hover slide.
 * Pass either `href` (internal navigation) or `onClick` (e.g. from a client parent).
 */
export default function BracketSlideCta({
  label,
  href,
  onClick,
  className = "",
  ariaLabel,
  disabled = false,
  loading = false,
  type = "button",
}) {
  const rootClass = ["bracketSlideCta", className].filter(Boolean).join(" ");

  const computedAria = ariaLabel ?? label;
  const lineText = label;

  const inner = (
    <>
      <span className="bracketSlideCta__bracket">[</span>
      <span className="bracketSlideCta__clip">
        <span className="bracketSlideCta__rail">
          <span className="bracketSlideCta__line">{lineText}</span>
          <span className="bracketSlideCta__line">{lineText}</span>
        </span>
      </span>
      <span className="bracketSlideCta__bracket">]</span>
    </>
  );

  const isDisabled = disabled || loading;

  if (href != null && href !== "" && !isDisabled) {
    return (
      <Link
        href={href}
        className={rootClass}
        aria-label={computedAria}
        onClick={onClick}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={rootClass}
      onClick={onClick}
      aria-label={computedAria}
      disabled={isDisabled}
      aria-busy={loading || undefined}
    >
      {inner}
    </button>
  );
}
