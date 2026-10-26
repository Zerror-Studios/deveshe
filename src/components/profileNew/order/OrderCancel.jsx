/**
 * Shopper cancel (PRD-015 FR-11, FR-20)
 *
 * Shown only when the server says `canCancel`. "Cancel order" opens an
 * inline confirmation (refunds go back to the original payment method);
 * `cancelMyOrder` re-checks every rule, and its reasons are mapped in
 * `utils/api-error.util.js`.
 */

import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";
import { CANCEL_MY_ORDER } from "@/graphql";
import { getErrorMessage } from "@/utils/api-error.util";
import {
  CANCEL_CONFIRM_MESSAGE,
  CANCEL_REASON_MAX_LENGTH,
  toCancelReason,
} from "@/utils/order-detail.util";

const OrderCancel = ({ orderId, onChanged }) => {
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const confirmRef = useRef(null);
  const [cancelOrder, { loading }] = useMutation(CANCEL_MY_ORDER);

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  const handleConfirm = async () => {
    setError("");
    try {
      await cancelOrder({
        variables: { orderId, reason: toCancelReason(reason) },
      });
      toast.success("Your order was cancelled.");
      setConfirming(false);
      await onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't cancel this order."));
    }
  };

  if (!confirming) {
    return (
      <div className="order_detail_actions">
        <button
          type="button"
          className="btn-cancel"
          onClick={() => setConfirming(true)}
        >
          Cancel order
        </button>
      </div>
    );
  }

  return (
    <div
      ref={confirmRef}
      className="detail_block order_detail_block"
      role="alertdialog"
      aria-labelledby="order_cancel_title"
      aria-describedby="order_cancel_text"
      tabIndex={-1}
    >
      <div className="order_detail_column">
        <h4 id="order_cancel_title">Cancel this order</h4>
        <p id="order_cancel_text">{CANCEL_CONFIRM_MESSAGE}</p>
        <label htmlFor="order_cancel_reason">Reason (optional)</label>
        <textarea
          id="order_cancel_reason"
          className="order_detail_input"
          maxLength={CANCEL_REASON_MAX_LENGTH}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        <div className="order_detail_actions">
          <button
            type="button"
            className="btn-deactivate"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Cancelling…" : "Yes, cancel order"}
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={() => setConfirming(false)}
            disabled={loading}
          >
            Keep order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCancel;
