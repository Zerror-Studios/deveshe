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

function getMenuCount(selections, menuId) {
  return selections[menuId]?.length ?? 0;
}

function getTotalCount(selections) {
  return Object.values(selections).reduce(
    (sum, items) => sum + (items?.length ?? 0),
    0
  );
}

function isOptionSelected(selections, menuId, option) {
  return selections[menuId]?.includes(option) ?? false;
}

function toggleSelection(prev, menuId, option) {
  const current = prev[menuId] ?? [];
  const next = current.includes(option)
    ? current.filter((item) => item !== option)
    : [...current, option];
  return { ...prev, [menuId]: next };
}

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

  const totalCount = getTotalCount(selections);

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
            const menuCount = getMenuCount(selections, menu.id);
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
                      const selected = isOptionSelected(selections, menu.id, opt);
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
  const [pinTop, setPinTop] = useState(0);
  const [rootMinHeight, setRootMinHeight] = useState(undefined);
  const [isMobilePopupOpen, setIsMobilePopupOpen] = useState(false);
  const [mobileExpandedId, setMobileExpandedId] = useState(null);
  const [selections, setSelections] = useState({});

  const stripRef = useRef(null);
  const totalCount = getTotalCount(selections);
  const anchorYRef = useRef(null);
  const wasPinnedRef = useRef(false);

  const measureAnchor = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;

    anchorYRef.current = el.getBoundingClientRect().top + window.scrollY;
  }, []);

  const getShouldPin = useCallback(() => {
    const strip = stripRef.current;
    if (!strip) return false;

    const navTop = getNavOffset();
    const rect = strip.getBoundingClientRect();
    const heroSection = strip.closest(".shop_hero_section");

    if (heroSection) {
      const heroTop = heroSection.offsetTop;
      const heroHeight = heroSection.offsetHeight;
      const pinAt = heroTop + heroHeight * 0.5;
      const unpinAt = heroTop + heroHeight * 0.72;
      const heroRect = heroSection.getBoundingClientRect();

      if (wasPinnedRef.current) {
        if (window.scrollY < unpinAt) return false;
        if (heroRect.bottom > window.innerHeight * 0.58) return false;
        return true;
      }

      const filterRevealScroll = heroTop + heroHeight * 0.45;
      const stripAtTop = rect.top <= navTop + 2;

      return window.scrollY >= Math.max(pinAt, filterRevealScroll) && stripAtTop;
    }

    if (anchorYRef.current == null) measureAnchor();
    const anchor = anchorYRef.current ?? 0;
    const pinAt = anchor - navTop;
    const unpinAt = pinAt - 48;

    if (wasPinnedRef.current) {
      return window.scrollY >= unpinAt;
    }

    return window.scrollY >= pinAt && rect.top <= navTop + 2;
  }, [measureAnchor]);

  const closeMobilePopup = useCallback(() => {
    setIsMobilePopupOpen(false);
    setMobileExpandedId(null);
  }, []);

  const toggleOption = (menuId, option) => {
    setSelections((prev) => toggleSelection(prev, menuId, option));
  };

  const resetSelections = () => {
    setSelections({});
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
      const pinned = getShouldPin();
      const navTop = getNavOffset();

      if (wasPinnedRef.current && !pinned) {
        requestAnimationFrame(() => {
          requestAnimationFrame(measureAnchor);
        });
      }

      wasPinnedRef.current = pinned;

      setIsPinned(pinned);
      setPinTop(navTop);
    };

    const onResize = () => {
      anchorYRef.current = null;

      requestAnimationFrame(() => {
        measureAnchor();
        onScroll();
      });
    };

    const onHeroRefresh = () => {
      anchorYRef.current = null;
      requestAnimationFrame(onScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    const heroSection = strip.closest(".shop_hero_section");
    if (heroSection) {
      window.addEventListener("load", onHeroRefresh);
    }

    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (heroSection) {
        window.removeEventListener("load", onHeroRefresh);
      }
    };
  }, [measureAnchor, getShouldPin]);

  useLayoutEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    if (!isPinned) {
      setRootMinHeight(undefined);
      return;
    }

    const styles = getComputedStyle(strip);
    const marginBottom = parseFloat(styles.marginBottom) || 0;

    setRootMinHeight(strip.offsetHeight + marginBottom);
  }, [isPinned]);

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
          style={isPinned ? { top: pinTop } : undefined}
        >
          <div className="curated-filter-strip__inner">
            {isMobileView ? (
              <button
                type="button"
                className="curated-filter-strip__mobile-trigger"
                onClick={openMobilePopup}
              >
                Filter
                {totalCount > 0 && (
                  <span className="curated-filter-strip__count">
                    {" "}
                    / {totalCount}
                  </span>
                )}
              </button>
            ) : (
              <div className="curated-filter-strip__desktop">
                <div className="curated-filter-strip__filters">
                  {FILTER_MENUS.map((menu, idx) => {
                    const isOpen = activeMenu === menu.id;
                    const isPill = PILL_IDX.includes(idx);
                    const menuCount = getMenuCount(selections, menu.id);

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
                          <span>
                            {menu.label}
                            {menuCount > 0 && (
                              <span className="curated-filter-strip__count">
                                {" "}
                                / {menuCount}
                              </span>
                            )}
                          </span>
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
                    {activeData?.options.map((opt) => {
                      const selected = isOptionSelected(
                        selections,
                        activeData.id,
                        opt
                      );
                      return (
                        <button
                          key={opt}
                          type="button"
                          className={`curated-filter-strip__option${
                            selected ? " is-selected" : ""
                          }`}
                          role="option"
                          aria-selected={selected}
                          onClick={() => toggleOption(activeData.id, opt)}
                        >
                          <span className="curated-filter-strip__option-text">
                            {opt}
                          </span>
                          {selected && (
                            <span
                              className="curated-filter-strip__option-check"
                              aria-hidden
                            >
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {totalCount > 0 && (
                  <button
                    type="button"
                    className="curated-filter-strip__reset"
                    onClick={resetSelections}
                  >
                    Reset all
                  </button>
                )}
              </div>
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
        selections={selections}
        onToggleOption={toggleOption}
        onReset={resetSelections}
        onApply={closeMobilePopup}
      />
    </>
  );
}
