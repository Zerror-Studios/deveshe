/**
 * Email preferences (PRD-014 FR-2.8, UX-29)
 *
 * One real choice, the customer's marketing-email consent
 * (`emailSubscribedStatus`, 1 = opted in), saved with `updateMyProfile`.
 * Replaces four unbound checkboxes and a button that did nothing.
 */

import React, { useEffect, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";

import CommonButton from "@/components/common/CommonButton";
import { UPDATE_MY_PROFILE } from "@/graphql";
import { useAuthStore } from "@/store/auth-store";
import { getErrorMessage } from "@/utils/api-error.util";

// ─── Constants ────────────────────────────────────────────────────────────

const EMAIL_STATUS_SUBSCRIBED_CODE = 1;
const EMAIL_STATUS_UNSUBSCRIBED_CODE = 0;

// ─── Component ────────────────────────────────────────────────────────────

const EmailPreferences = () => {
  const { user, setUser } = useAuthStore((state) => state);
  const [updateProfile, { loading }] = useMutation(UPDATE_MY_PROFILE);
  const isSubscribed =
    user?.emailSubscribedStatus === EMAIL_STATUS_SUBSCRIBED_CODE;
  const [wantsEmail, setWantsEmail] = useState(isSubscribed);

  useEffect(() => {
    setWantsEmail(isSubscribed);
  }, [isSubscribed]);

  const handleSave = async () => {
    if (loading || wantsEmail === isSubscribed) return;
    try {
      const { data } = await updateProfile({
        variables: {
          input: {
            emailSubscribedStatus: wantsEmail
              ? EMAIL_STATUS_SUBSCRIBED_CODE
              : EMAIL_STATUS_UNSUBSCRIBED_CODE,
          },
        },
      });
      if (data?.updateMyProfile) {
        setUser({ ...user, ...data.updateMyProfile });
        toast.success("Your email preference is saved.");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't save your preference."));
    }
  };

  return (
    <div id="email_preferences" className="detail_block">
      <div className="profile_left_container">
        <h4>Email Preferences</h4>
        <p>
          Choose whether we may email you news and offers. You can change this
          at any time, and every email has an unsubscribe link.
        </p>
      </div>
      <div className="profile_right_container">
        <label className="checkbox_container" htmlFor="email_pref_marketing">
          <input
            id="email_pref_marketing"
            type="checkbox"
            checked={wantsEmail}
            disabled={!user}
            onChange={(event) => setWantsEmail(event.target.checked)}
          />
          <p>Email me with news and offers</p>
        </label>
        <CommonButton
          type="button"
          title="Update My Preferences"
          onClick={handleSave}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default EmailPreferences;
