import React from "react";
import Image from "next/image";
import styles from "@/styles/components/ModalController.module.css";

const ConfirmModal = () => {
  return (
    <div className={styles.content_wrapper}>
      <Image width={100} height={100} src="/delete.gif" alt="Trash" />
      <div className={styles.content_body}>
        <h2>Deactivate Account</h2>
        <p className="popup-message">
          Are you sure you want to deactivate your account?
        </p>
        <ul className={styles.ulList}>
          <li>🚫 You will be logged out immediately</li>
          <li>🔒 Your account will be disabled</li>
          <li>🙈 Your profile and activity will be hidden</li>
        </ul>
      </div>
    </div>
  );
};

export default ConfirmModal;
