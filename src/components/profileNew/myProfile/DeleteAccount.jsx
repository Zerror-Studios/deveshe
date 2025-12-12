import React, { useState } from "react";
import { toast } from 'react-toastify';
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "@apollo/client/react";
import { useAuthStore } from "@/store/auth-store";
import { UserStatus } from "@/utils/Constant";
import { UPDATE_USER_STATUS } from "@/graphql";
import CommonButton from "@/components/common/CommonButton";
import DeactivatePopup from "./DeactivatePopup";

const DeleteAccount = () => {
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
      <div id="delete_account" className="detail_block">
        <div className="profile_left_container">
          <h4>Delete Account</h4>
        </div>
        <div className="profile_right_container">
          <p>
            To deactivate your account, first delete its resources. If you are the
            only owner of any teams, either assign another owner or deactivate the
            team.
          </p>
          <div
            className="_btn_wrapper _btn_height _w-full de-btn"
            style={{ minWidth: "220px" }}
            onClick={() => setIsOpen(true)}
          >
            Deactivate Account
          </div>
        </div>
      </div>
      <DeactivatePopup isOpen={isOpen} isLoading={loading} handleSave={handleSave} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default DeleteAccount;
