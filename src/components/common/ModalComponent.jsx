import React, { useEffect, useRef } from "react";
import styles from "@/styles/components/ModalController.module.css";
import CommonButton from "./CommonButton";
import Button from "./Button";

const ModalComponent = ({
  size = "normal",
  isOpen,
  setIsOpen,
  heading,
  subheading,
  saveButtonText,
  closeButtonText,
  onModalClose,
  onModalSave,
  isLoading,
  children,
}) => {
  const wrapperRef = useRef(null);

  // A press outside the dialog closes it (was react-outside-click-handler,
  // which doesn't support React 19).
  useEffect(() => {
    if (!isOpen) return undefined;
    const onPointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [isOpen, setIsOpen]);

  return (
    <div className={`${styles.modal} ${isOpen ? styles.show : ""}`}>
      <div ref={wrapperRef}>
        <div className={`${styles.modal_Wrapper} ${styles[size]}`}>
          {heading || subheading ? (
            <div className={styles.header}>
              <div></div>
            </div>
          ) : null}
          <div className={styles.body}>{children}</div>
          <div className={styles.footer}>
            {onModalClose && (
              <Button>
                <div onClick={onModalClose}>{closeButtonText}</div>
              </Button>
            )}
            <CommonButton
              title={saveButtonText}
              onClick={onModalSave}
              loading={isLoading}
              type="button"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalComponent;
