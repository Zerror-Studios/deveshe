"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function MaterialDetailModal({ material, onClose }) {
  useEffect(() => {
    if (!material) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.body.classList.add("overflow-hidden");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [material, onClose]);

  if (!material) return null;

  const usedCount = material.usedIn?.length ?? 0;
  const usedLabel =
    usedCount === 1 ? "Used in 1 item" : `Used in ${usedCount} items`;

  return (
    <div
      className="material-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="material-modal-title"
    >
      <button
        type="button"
        className="material-modal__backdrop"
        onClick={onClose}
        aria-label="Close material details"
      />

      <div className="material-modal__panel">
        <span className="material-modal__tab" aria-hidden />

        <div className="material-modal__content">
          <section className="material-modal__section">
            <h2 id="material-modal-title" className="material-modal__label">
              Description
            </h2>
            <p className="material-modal__text">{material.description}</p>
          </section>

          <section className="material-modal__section">
            <h2 className="material-modal__label">Source</h2>
            <div className="material-modal__source">
              <div className="material-modal__sourceLogo" aria-hidden>
                {(material.source?.name || "—").charAt(0)}
              </div>
              <div className="material-modal__sourceText">
                <span className="material-modal__sourceName">
                  {material.source?.name}
                </span>
                <span className="material-modal__sourceCountry">
                  {material.source?.country}
                </span>
              </div>
            </div>
          </section>

          {usedCount > 0 ? (
            <section className="material-modal__section">
              <h2 className="material-modal__label">{usedLabel}</h2>
              <ul className="material-modal__products">
                {material.usedIn.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.href || "/shop"}
                      className="material-modal__product"
                      onClick={onClose}
                    >
                      <div className="material-modal__productMedia">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="material-modal__productImage"
                            sizes="120px"
                          />
                        ) : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <button
            type="button"
            className="material-modal__close"
            onClick={onClose}
          >
            [CLOSE]
          </button>
        </div>
      </div>
    </div>
  );
}
