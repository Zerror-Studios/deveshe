import React from "react";
import OutsideClickHandler from "react-outside-click-handler";
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
  return (
    <div className={`${styles.modal} ${isOpen ? styles.show : ""}`}>
      <OutsideClickHandler
        onOutsideClick={() => {
          setIsOpen(false);
        }}
      >
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
      </OutsideClickHandler>
    </div>
  );
};

export default ModalComponent;
