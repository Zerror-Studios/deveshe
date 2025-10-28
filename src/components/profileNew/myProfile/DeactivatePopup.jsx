import Image from "next/image";
import React from "react";

const DeactivatePopup = ({ isOpen, onClose, isLoading, handleSave }) => {
  if (!isOpen) return null;

  return (
    <div onClick={onClose} className="deactivate-modal-overlay">
      <div onClick={(e) => e.stopPropagation()} className="deactivate-modal">
        <div className="deactivate-modal-icon">
          <Image width={1000} height={1000} src="/delete.gif" alt="Deactivate Account" />
        </div>
        <h2 className="deactivate-title">Deactivate Account</h2>
        <p className="deactivate-subtitle">
          Are you sure you want to deactivate your account?
        </p>

        <ul className="deactivate-points">
          <li>🚫 You will be logged out immediately</li>
          <li>🔒 Your account will be disabled</li>
          <li>🙈 Your profile and activity will be hidden</li>
        </ul>

        <div className="deactivate-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-deactivate" onClick={handleSave}>
            {isLoading ? (
              <div className="common_btn_loadin">
                <div className="loading_line_wrap">
                  <div className="loading_line"></div>
                </div>
              </div>
            ) : "Deactivate"
            }

          </button>
        </div>
      </div>
    </div>
  );
};

export default DeactivatePopup;
