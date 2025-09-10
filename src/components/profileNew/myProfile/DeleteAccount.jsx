import CommonButton from "@/components/common/CommonButton";
import React, { useState } from "react";
import DeactivatePopup from "./DeactivatePopup";

const DeleteAccount = () => {
    const [isOpen, setIsOpen] = useState(false);
  
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
        <CommonButton
          title="Deactivate Account"
          onClick={()=>setIsOpen(true)}
          // loading={isBtnLoading}
        />
      </div>
    </div>
    <DeactivatePopup isOpen={isOpen} onClose={()=>setIsOpen(false)} />
   </>
  );
};

export default DeleteAccount;
