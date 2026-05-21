"use client";

import { useEffect, useState } from "react";
import { FiCopy } from "react-icons/fi";
import { FaFacebookF, FaXTwitter } from "react-icons/fa6";

export default function BlogPostShare({ slug, title }) {
  const [copied, setCopied] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(`${window.location.origin}/blogs/${slug}`);
  }, [slug]);

  const handleCopy = async () => {
    if (!pageUrl) return;

    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(title || "");

  return (
    <div className="blog-post__end">
      <hr className="blog-post__divider" aria-hidden />
      <div className="blog-post__share">
        <span className="blog-post__shareLabel">(Share)</span>
        <div className="blog-post__shareActions">
          <button
            type="button"
            className="blog-post__shareBtn"
            onClick={handleCopy}
            aria-label={copied ? "Link copied" : "Copy link"}
          >
            <FiCopy aria-hidden />
          </button>
          <a
            href={
              pageUrl
                ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
                : undefined
            }
            className="blog-post__shareBtn"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Facebook"
            tabIndex={pageUrl ? 0 : -1}
          >
            <FaFacebookF aria-hidden />
          </a>
          <a
            href={
              pageUrl
                ? `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
                : undefined
            }
            className="blog-post__shareBtn"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on X"
            tabIndex={pageUrl ? 0 : -1}
          >
            <FaXTwitter aria-hidden />
          </a>
        </div>
      </div>
    </div>
  );
}
