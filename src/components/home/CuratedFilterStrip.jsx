"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const PILL_PATH =
  "M10.21 4V0a4.09 4.09 0 0 1-4 4H4a4.09 4.09 0 0 1-4-4v24a4.09 4.09 0 0 1 4-4h2.21a4.09 4.09 0 0 1 4 4V4Z";

const PillSvg = ({ className }) => (
  <svg
    viewBox="0 0 10.21 24"
    className={`cfs-pill-svg ${className}`}
    preserveAspectRatio="none"
    aria-hidden="true"
    focusable="false"
  >
    <path d={PILL_PATH} />
  </svg>
);

const FILTER_MENUS = [
  {
    id: "collection",
    label: "Collection",
    options: ["All collections", "Spring / Summer", "Fall / Winter", "Archive"],
  },
  {
    id: "productType",
    label: "Product type",
    options: ["All types", "Tops", "Bottoms", "Outerwear", "Dresses", "Accessories"],
  },
  {
    id: "size",
    label: "Size",
    options: ["All sizes", "XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: "sort",
    label: "Sort by",
    options: ["Featured", "Newest", "Price: low to high", "Price: high to low"],
  },
];

const PILL_IDX = [1, 2];

function getNavOffset() {
  return 0;
}

export default function CuratedFilterStrip() {
  const [openId, setOpenId] = useState(null);
  const [isPinned, setIsPinned] = useState(false);
  const [rootMinHeight, setRootMinHeight] = useState(undefined);

  const stripRef = useRef(null);
  const anchorYRef = useRef(null);
  const wasPinnedRef = useRef(false);

  const measureAnchor = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;
    anchorYRef.current = el.getBoundingClientRect().top + window.scrollY;
  }, []);

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(measureAnchor);
    });
    return () => cancelAnimationFrame(id);
  }, [measureAnchor]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const onScroll = () => {
      if (anchorYRef.current == null) measureAnchor();
      const navTop = getNavOffset();
      const anchor = anchorYRef.current ?? 0;
      const pinned = window.scrollY >= anchor - navTop;

      if (wasPinnedRef.current && !pinned) {
        requestAnimationFrame(() => {
          requestAnimationFrame(measureAnchor);
        });
      }
      wasPinnedRef.current = pinned;
      setIsPinned(pinned);

      if (pinned) {
        setRootMinHeight(strip.offsetHeight);
      } else {
        setRootMinHeight(undefined);
      }
    };

    const onResize = () => {
      anchorYRef.current = null;
      requestAnimationFrame(() => {
        measureAnchor();
        onScroll();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [measureAnchor]);

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!stripRef.current?.contains(e.target)) setOpenId(null);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpenId(null);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      className="curated-filter-strip-root"
      style={rootMinHeight != null ? { minHeight: rootMinHeight } : undefined}
    >
      <div
        ref={stripRef}
        className={`curated-filter-strip ${isPinned ? "curated-filter-strip--pinned" : ""}`}
      >
        <div
          className="curated-filter-strip__inner"
          onMouseLeave={() => setOpenId(null)}
        >
          {FILTER_MENUS.map((menu, idx) => {
            const isOpen = openId === menu.id;
            const isPill = PILL_IDX.includes(idx);

            return (
              <div
                key={menu.id}
                className="curated-filter-strip__item"
                onMouseEnter={() => setOpenId(menu.id)}
              >
                <button
                  type="button"
                  className={`curated-filter-strip__trigger ${isOpen ? "curated-filter-strip__trigger--open" : ""}`}
                  aria-expanded={isOpen}
                  aria-haspopup="listbox"
                  onClick={() => setOpenId(isOpen ? null : menu.id)}
                >
                  {isPill && <PillSvg className="cfs-pill-svg--left" />}
                  <span>{menu.label}</span>
                  {isPill && <PillSvg className="cfs-pill-svg--right" />}
                  <div className="curated-filter-strip__hoverline" />
                </button>

                <div
                  className={`curated-filter-strip__menu ${isOpen ? "curated-filter-strip__menu--open" : ""}`}
                  role="listbox"
                  aria-label={menu.label}
                >
                  {menu.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className="curated-filter-strip__option"
                      role="option"
                      onClick={() => setOpenId(null)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
