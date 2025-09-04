import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "@apollo/client";
import { useAuthStore } from "@/store/auth-store";
import { UserStatus } from "@/utils/Constant";
import { UPDATE_USER_STATUS } from "@/graphql";
import ModalComponent from "@/components/common/ModalComponent";
import ConfirmModal from "./ui/ConfirmModal";
import toast from "react-hot-toast";

const DeactiveSection = () => {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { user, clearAuth } = useAuthStore((state) => state);
  const [userUpdate, { loading }] = useMutation(UPDATE_USER_STATUS);
  const handleSave = async () => {
    try {
      const input = {
        email: user?.email,
        status: UserStatus.DEACTIVE,
      };
      const { data: response } = await userUpdate({ variables: input });
      const message = response?.changeUserStatus || {};
      if (message) {
        toast.success(message || "Account Deactivated Successfully");
        logout();
        setIsOpen(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to deactivate account");
    }
  };
  return (
    <>
      <div className="noti-main-div">
        <div className="security-left">
          <h4>Delete Account</h4>
        </div>

        <div className="delete-info passguide">
          <p>
            To deactivate your account, first delete its resources. If you are
            the only owner of any teams, either assign another owner or
            deactivate the team.
          </p>
          <div
            className="_btn_wrapper _btn_height _w-full de-btn"
            style={{ width: "auto" }}
            onClick={() => setIsOpen(true)}
          >
            Deactivate Account
          </div>
        </div>
      </div>
      <ModalComponent
        isOpen={isOpen}
        isLoading={loading}
        setIsOpen={setIsOpen}
        closeButtonText={"Cancel"}
        saveButtonText={"Deactive"}
        onModalClose={() => setIsOpen(false)}
        onModalSave={handleSave}
      >
        <ConfirmModal />
      </ModalComponent>
    </>
  );
};

export default DeactiveSection;
