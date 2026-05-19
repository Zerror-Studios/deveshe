"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

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
const MOBILE_NAV_OFFSET = 70;
const MOBILE_BREAKPOINT = 1000;

function getNavOffset() {
  if (typeof window === "undefined") return 0;
  return window.innerWidth <= MOBILE_BREAKPOINT ? MOBILE_NAV_OFFSET : 0;
}

function useIsMobileView() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function MobileFilterPopup({
  isOpen,
  onClose,
  expandedId,
  onToggleSection,
  selections,
  onToggleOption,
  onReset,
  onApply,
}) {
  const [portalReady, setPortalReady] = useState(false);

  const getMenuCount = (menuId) => selections[menuId]?.length ?? 0;

  const totalCount = Object.values(selections).reduce(
    (sum, items) => sum + (items?.length ?? 0),
    0
  );

  const isSelected = (menuId, option) =>
    selections[menuId]?.includes(option) ?? false;

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!portalReady || !isOpen) return null;

  return createPortal(
    <div
      className="cfs-mobile-backdrop"
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <div
        className="cfs-mobile-popup"
        role="dialog"
        aria-modal="true"
        aria-label="Filter"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="cfs-mobile-popup__header">
          <span className="cfs-mobile-popup__title">
            Filter
            {totalCount > 0 && (
              <span className="cfs-mobile-popup__count"> / {totalCount}</span>
            )}
          </span>
          <button type="button" className="cfs-mobile-popup__close" onClick={onClose}>
            [Close]
          </button>
        </header>

        <div className="cfs-mobile-popup__body">
          {FILTER_MENUS.map((menu) => {
            const isExpanded = expandedId === menu.id;
            const menuCount = getMenuCount(menu.id);
            return (
              <div key={menu.id} className="cfs-mobile-popup__section">
                <button
                  type="button"
                  className="cfs-mobile-popup__row"
                  aria-expanded={isExpanded}
                  onClick={() => onToggleSection(menu.id)}
                >
                  <span className="cfs-mobile-popup__row-label">
                    {menu.label}
                    {menuCount > 0 && (
                      <span className="cfs-mobile-popup__count"> / {menuCount}</span>
                    )}
                  </span>
                  <span className="cfs-mobile-popup__toggle">
                    [{isExpanded ? "−" : "+"}]
                  </span>
                </button>
                <div
                  className={`cfs-mobile-popup__options-wrap${
                    isExpanded ? " is-open" : ""
                  }`}
                >
                  <div className="cfs-mobile-popup__options">
                    {menu.options.map((opt) => {
                      const selected = isSelected(menu.id, opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          className={`cfs-mobile-popup__option${
                            selected ? " is-selected" : ""
                          }`}
                          aria-pressed={selected}
                          onClick={() => onToggleOption(menu.id, opt)}
                        >
                          <span className="cfs-mobile-popup__option-text">{opt}</span>
                          {selected && (
                            <span className="cfs-mobile-popup__option-check" aria-hidden>
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <footer className="cfs-mobile-popup__footer">
          <button type="button" className="cfs-mobile-popup__reset" onClick={onReset}>
            Reset all
          </button>
          <button type="button" className="cfs-mobile-popup__apply" onClick={onApply}>
            Show results
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}

export default function CuratedFilterStrip() {
  const isMobileView = useIsMobileView();
  const [activeMenu, setActiveMenu] = useState(null);
  const [isPinned, setIsPinned] = useState(false);
  const [rootMinHeight, setRootMinHeight] = useState(undefined);
  const [isMobilePopupOpen, setIsMobilePopupOpen] = useState(false);
  const [mobileExpandedId, setMobileExpandedId] = useState(null);
  const [mobileSelections, setMobileSelections] = useState({});

  const stripRef = useRef(null);
  const anchorYRef = useRef(null);
  const wasPinnedRef = useRef(false);

  const measureAnchor = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;

    anchorYRef.current = el.getBoundingClientRect().top + window.scrollY;
  }, []);

  const closeMobilePopup = useCallback(() => {
    setIsMobilePopupOpen(false);
    setMobileExpandedId(null);
  }, []);

  const toggleMobileOption = (menuId, option) => {
    setMobileSelections((prev) => {
      const current = prev[menuId] ?? [];
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];

      return { ...prev, [menuId]: next };
    });
  };

  const resetMobileSelections = () => {
    setMobileSelections({});
    setMobileExpandedId(null);
  };
  const openMobilePopup = () => {
    setActiveMenu(null);
    setIsMobilePopupOpen(true);
  };

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(measureAnchor);
    });

    return () => cancelAnimationFrame(id);
  }, [measureAnchor, isMobileView]);

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
    if (isMobileView) {
      setActiveMenu(null);
      return;
    }
    closeMobilePopup();
  }, [isMobileView, closeMobilePopup]);

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!stripRef.current?.contains(e.target)) {
        setActiveMenu(null);
      }
    };

    const onKey = (e) => {
      if (e.key === "Escape") {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const activeData = FILTER_MENUS.find((m) => m.id === activeMenu);

  return (
    <>
      <div
        className="curated-filter-strip-root"
        style={rootMinHeight != null ? { minHeight: rootMinHeight } : undefined}
      >
        <div
          ref={stripRef}
          className={`curated-filter-strip ${
            isPinned ? "curated-filter-strip--pinned" : ""
          }`}
        >
          <div className="curated-filter-strip__inner">
            {isMobileView ? (
              <button
                type="button"
                className="curated-filter-strip__mobile-trigger"
                onClick={openMobilePopup}
              >
                Filter
              </button>
            ) : (
              <>
                {FILTER_MENUS.map((menu, idx) => {
                  const isOpen = activeMenu === menu.id;
                  const isPill = PILL_IDX.includes(idx);

                  return (
                    <div
                      key={menu.id}
                      className={`curated-filter-strip__item${
                        isOpen ? " curated-filter-strip__item--open" : ""
                      }`}
                      onMouseEnter={() => setActiveMenu(menu.id)}
                    >
                      <button
                        type="button"
                        className={`curated-filter-strip__trigger${
                          isOpen ? " curated-filter-strip__trigger--open" : ""
                        }`}
                        aria-expanded={isOpen}
                        aria-haspopup="listbox"
                        onClick={() => setActiveMenu(isOpen ? null : menu.id)}
                      >
                        {isPill && <PillSvg className="cfs-pill-svg--left" />}
                        <span>{menu.label}</span>
                        {isPill && <PillSvg className="cfs-pill-svg--right" />}
                      </button>
                    </div>
                  );
                })}

                <div
                  className={`curated-filter-strip__menu ${
                    activeData ? "curated-filter-strip__menu--open" : ""
                  }`}
                  role="listbox"
                  aria-label={activeData?.label}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  {activeData?.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className="curated-filter-strip__option"
                      role="option"
                      onClick={() => setActiveMenu(null)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <MobileFilterPopup
        isOpen={isMobileView && isMobilePopupOpen}
        onClose={closeMobilePopup}
        expandedId={mobileExpandedId}
        onToggleSection={(id) =>
          setMobileExpandedId((prev) => (prev === id ? null : id))
        }
        selections={mobileSelections}
        onToggleOption={toggleMobileOption}
        onReset={resetMobileSelections}
        onApply={closeMobilePopup}
      />
    </>
  );
}
