/**
 * Returns on the order page (PRD-015 FR-2, FR-5, FR-19, FR-20)
 *
 * "Request a return" appears only while the server lists `returnableItems`
 * (delivered, inside the store's window, returns on). Each line has a
 * quantity stepper capped at `returnableQty`; one reason and condition
 * apply to the request. The order's `returnRequests` follow with their
 * status, and a REQUESTED one can be withdrawn. The policy text is the
 * store's own page (`/shipping-returns`); the API carries none.
 *
 * Same behaviour as rare-element `components/account/orders/OrderReturns.jsx`
 * (deveshe styling).
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiMinus, FiPlus } from "react-icons/fi";
import { useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";
import { CANCEL_MY_RETURN_REQUEST, CREATE_RETURN_REQUEST } from "@/graphql";
import { getErrorMessage } from "@/utils/api-error.util";
import {
  RETURN_CONDITIONS,
  RETURN_REASONS,
  canWithdrawReturn,
  createReturnForm,
  formatOrderDate,
  getReturnErrorOverrides,
  getReturnStatusLabel,
  setReturnQuantity,
  toCreateReturnInput,
} from "@/utils/order-detail.util";
import { formatePrice } from "@/utils/Util";

const RETURNS_POLICY_PATH = "/shipping-returns";

const OrderReturns = ({
  orderId,
  returnableItems = [],
  returnableUntil,
  returnRequests = [],
  onChanged,
}) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => createReturnForm(returnableItems));
  const [error, setError] = useState("");
  const [createReturn, { loading: creating }] =
    useMutation(CREATE_RETURN_REQUEST);
  const [withdrawReturn, { loading: withdrawing }] = useMutation(
    CANCEL_MY_RETURN_REQUEST,
  );
  const canRequest = returnableItems.length > 0;
  const returnBy = formatOrderDate(returnableUntil);

  // A refetched order brings new limits: start the form again from them.
  const limitsKey = returnableItems
    .map((item) => `${item.orderItemId}:${item.returnableQty}`)
    .join(",");
  useEffect(() => {
    setForm(createReturnForm(returnableItems));
  }, [limitsKey]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const { input, error: formError } = toCreateReturnInput(
      orderId,
      form,
      returnableItems,
    );
    if (formError) {
      setError(formError);
      return;
    }
    try {
      await createReturn({ variables: { input } });
      toast.success("Your return request was sent.");
      setOpen(false);
      await onChanged?.();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "We couldn't send your return request.",
          getReturnErrorOverrides(returnableUntil),
        ),
      );
    }
  };

  const handleWithdraw = async (id) => {
    try {
      await withdrawReturn({ variables: { id } });
      toast.success("Your return request was withdrawn.");
      await onChanged?.();
    } catch (err) {
      toast.error(getErrorMessage(err, "We couldn't withdraw this request."));
    }
  };

  if (!canRequest && returnRequests.length === 0) return null;

  return (
    <section className="detail_block order_detail_block" aria-labelledby="order_returns_title">
      <div className="order_detail_column">
        <h4 id="order_returns_title">Returns</h4>

        {canRequest && !open && (
          <div className="order_detail_actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setOpen(true)}
            >
              Request a return
            </button>
            {returnBy && (
              <p>{`Return by ${returnBy}.`}</p>
            )}
          </div>
        )}

        {canRequest && open && (
          <form className="order_detail_column" onSubmit={handleSubmit} noValidate>
            <p>
              {returnBy ? `Return by ${returnBy}. ` : ""}
              <Link href={RETURNS_POLICY_PATH} className="order_link_btn">
                Read our returns policy
              </Link>
            </p>
            <ul className="order_detail_list">
              {returnableItems.map((item) => {
                const quantity = form.quantities[item.orderItemId] || 0;
                return (
                  <li key={item.orderItemId} className="order_return_line">
                    <p>{item.name}</p>
                    <div className="cart_qt order_return_stepper">
                      <button
                        type="button"
                        aria-label={`Fewer ${item.name} to return`}
                        disabled={quantity <= 0}
                        onClick={() =>
                          setForm((prev) => setReturnQuantity(prev, item, quantity - 1))
                        }
                      >
                        <FiMinus aria-hidden="true" />
                      </button>
                      <span aria-live="polite">{quantity}</span>
                      <button
                        type="button"
                        aria-label={`More ${item.name} to return`}
                        disabled={quantity >= item.returnableQty}
                        onClick={() =>
                          setForm((prev) => setReturnQuantity(prev, item, quantity + 1))
                        }
                      >
                        <FiPlus aria-hidden="true" />
                      </button>
                    </div>
                    <p>{`Up to ${item.returnableQty}`}</p>
                  </li>
                );
              })}
            </ul>
            <div className="order_detail_field">
              <label htmlFor="return_reason">
                Reason
              </label>
              <select
                id="return_reason"
                className="order_detail_input"
                value={form.reason}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, reason: event.target.value }))
                }
              >
                <option value="">Choose a reason</option>
                {RETURN_REASONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="order_detail_field">
              <label htmlFor="return_condition">
                Condition
              </label>
              <select
                id="return_condition"
                className="order_detail_input"
                value={form.condition}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, condition: event.target.value }))
                }
              >
                <option value="">Choose the condition</option>
                {RETURN_CONDITIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {error && (
              <p className="error-text" role="alert">
                {error}
              </p>
            )}
            <div className="order_detail_actions">
              <button
                type="submit"
                className="btn-deactivate"
                disabled={creating}
              >
                {creating ? "Sending…" : "Send return request"}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setOpen(false);
                  setError("");
                }}
                disabled={creating}
              >
                Not now
              </button>
            </div>
          </form>
        )}

        {returnRequests.length > 0 && (
          <ul className="order_detail_list">
            {returnRequests.map((request) => (
              <li key={request.id} className="order_return_request">
                <p>
                  <strong>{getReturnStatusLabel(request.status)}</strong>
                  {` · requested ${formatOrderDate(request.createdAt)}`}
                </p>
                <p>
                  {(request.items || [])
                    .map((line) => `${line.name || "Item"} × ${line.quantity}`)
                    .join(", ")}
                </p>
                {request.refundAmount > 0 && (
                  <p>{`Refunded ${formatePrice(request.refundAmount)}`}</p>
                )}
                {canWithdrawReturn(request) && (
                  <button
                    type="button"
                    className="order_link_btn"
                    onClick={() => handleWithdraw(request.id)}
                    disabled={withdrawing}
                  >
                    Withdraw request
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default OrderReturns;
