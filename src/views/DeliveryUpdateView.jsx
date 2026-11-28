"use client";

/**
 * Delivery update (backend PRD-051 FR-12)
 *
 * Target of the "Change address" link in the delivery-failed WhatsApp and
 * email: `/delivery/update?token=…`. Reads the token once and removes it
 * from the address bar (so it doesn't linger in history or analytics page
 * URLs), then loads the page through the kit's `useDeliveryUpdate` and
 * saves the shopper's new address, phone or day.
 *
 * Needs `@zcom/storefront-kit` with `useDeliveryUpdate` (kit branch
 * `feat/prd-051-whatsapp`, not released yet). This store is still on kit
 * v2.1.0: until the kit release is installed the hook is missing and the
 * page shows a "reply on WhatsApp" note instead of the form (the namespace
 * import keeps the build working either way).
 *
 * Keep in sync with
 * `storefronts/rare-element/src/app/delivery/update/delivery-update-client.jsx`.
 */

import React, { useEffect, useRef, useState } from "react";
import * as kitClient from "@zcom/storefront-kit/client";
import * as kitCore from "@zcom/storefront-kit/core";
import CommonButton from "@/components/common/CommonButton";

// ─── Constants ────────────────────────────────────────────────────────────

const PAGE_PATH = "/delivery/update";

const FIELDS = [
  { name: "address1", label: "Address", autoComplete: "address-line1" },
  { name: "address2", label: "Apartment, landmark (optional)", autoComplete: "address-line2" },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "state", label: "State", autoComplete: "address-level1" },
  { name: "pincode", label: "PIN code", autoComplete: "postal-code", inputMode: "numeric" },
  { name: "phone", label: "Phone", autoComplete: "tel", type: "tel" },
];

const STATUS_COPY = {
  CLOSED: {
    title: "Can't be changed",
    text: "This delivery was delivered, sent back, or the store has already arranged the next attempt.",
  },
  EXPIRED: {
    title: "Link expired",
    text: "Reply to our WhatsApp message and we'll help you with the delivery.",
  },
  INVALID: {
    title: "Link not valid",
    text: "Please use the link from our WhatsApp message or email.",
  },
};

// ─── Components ───────────────────────────────────────────────────────────

const Shell = ({ children, busy = false }) => (
  <section id="order_status_section">
    <div className="order_status_card" aria-live="polite" aria-busy={busy}>
      {children}
    </div>
  </section>
);

const DeliveryUpdateForm = ({ token }) => {
  const { status, page, loading, error, canSubmit, submit, saving, saveError } =
    kitClient.useDeliveryUpdate(token);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);
  const errorCopy = kitCore.DELIVERY_UPDATE_ERROR_COPY || {};

  const onChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const onSubmit = async (event) => {
    event.preventDefault();
    const result = await submit(form);
    if (result) setSaved(true);
  };

  if (loading && !page) {
    return (
      <Shell busy>
        <h1>Loading…</h1>
      </Shell>
    );
  }
  if (error) {
    return (
      <Shell>
        <h1>Not done</h1>
        <p>{errorCopy[error] || "Please try again in a moment."}</p>
      </Shell>
    );
  }
  if (!canSubmit) {
    const copy = STATUS_COPY[status] || STATUS_COPY.INVALID;
    return (
      <Shell>
        <h1>{copy.title}</h1>
        <p>{copy.text}</p>
        <CommonButton title={"Go Back to Home"} type="button" href={"/"} />
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="order_status_kicker">Delivery</p>
      <h1>Update your delivery</h1>
      <p>
        The courier couldn&apos;t deliver order {page?.orderNo || ""}
        {page?.city ? ` to ${page.city}${page.pincode ? ` ${page.pincode}` : ""}` : ""}. Tell us what to change and
        we&apos;ll ask them to try again.
      </p>
      {saved || page?.status === "SUBMITTED" ? (
        <p role="status">Thank you, we&apos;ve got your details. You can still change them below.</p>
      ) : null}
      <form className="delivery_update_form" onSubmit={onSubmit} noValidate>
        {FIELDS.map((field) => (
          <label key={field.name}>
            <span>{field.label}</span>
            <input
              name={field.name}
              type={field.type || "text"}
              inputMode={field.inputMode}
              autoComplete={field.autoComplete}
              value={form[field.name] || ""}
              onChange={onChange}
            />
          </label>
        ))}
        <label>
          <span>Deliver on (optional)</span>
          <input
            name="preferredDate"
            type="date"
            min={page?.earliestDate}
            max={page?.latestDate}
            value={form.preferredDate || ""}
            onChange={onChange}
          />
        </label>
        <label>
          <span>Note for the courier (optional)</span>
          <textarea name="note" rows={3} maxLength={500} value={form.note || ""} onChange={onChange} />
        </label>
        {saveError ? (
          <p className="delivery_update_error" role="alert">
            {errorCopy[saveError] || "Something went wrong. Try again."}
          </p>
        ) : null}
        <CommonButton title={"Save delivery details"} type="submit" loading={saving} />
      </form>
    </Shell>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────

const DeliveryUpdateView = () => {
  const tokenRef = useRef(undefined);
  const [token, setToken] = useState(undefined);

  useEffect(() => {
    // Once per page view: read the link, then drop it from the address bar
    if (tokenRef.current !== undefined) return;
    const read = kitCore.deliveryUpdateTokenOf
      ? kitCore.deliveryUpdateTokenOf(window.location.search)
      : null;
    tokenRef.current = read;
    window.history.replaceState(null, "", PAGE_PATH);
    setToken(read);
  }, []);

  if (typeof kitClient.useDeliveryUpdate !== "function") {
    return (
      <Shell>
        <h1>Update your delivery</h1>
        <p>Reply to our WhatsApp message with the new address or phone number and we&apos;ll pass it to the courier.</p>
      </Shell>
    );
  }
  if (token === undefined) return null;
  return <DeliveryUpdateForm token={token} />;
};

export default DeliveryUpdateView;
