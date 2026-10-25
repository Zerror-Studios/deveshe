/**
 * Saved-address selection at checkout (PRD-014 UX-02)
 *
 * With saved addresses the delivery form is hidden, so one must always be
 * selected, and a validation error must show outside the hidden form:
 * - `toFormAddress` maps a saved address to the form values (nulls become
 *   empty strings for zod);
 * - `pickSavedAddressIndex` chooses the preferred address (a payment
 *   retry's kept order, FR-0.12 / W0V-C-03), else the primary one (the
 *   server lists it first), else the first one;
 * - `getFirstFieldError` is the first message the step shows at its top.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Saved address → checkout form values. */
export const toFormAddress = (address) => ({
  firstname: address.firstname || "",
  lastname: address.lastname || "",
  addressType: address.addressType || "",
  flat: address.flat || "",
  addressline1: address.addressline1 || "",
  addressline2: address.addressline2 || "",
  landmark: address.landmark || "",
  country: address.country || "",
  states: address.states || "",
  city: address.city || "",
  pincode: address.pincode || "",
  countryCode: address.countryCode || "",
  phone: address.phone || "",
  primary: Boolean(address.primary),
});

/**
 * Index of the saved address to preselect, or -1 when there is none.
 * `isPreferredAddress(formAddress)` (optional) wins over the primary one.
 */
export const pickSavedAddressIndex = (
  addresses = [],
  isPreferredAddress = null,
) => {
  if (!addresses?.length) return -1;
  const preferredIndex = isPreferredAddress
    ? addresses.findIndex((address) =>
        isPreferredAddress(toFormAddress(address)),
      )
    : -1;
  if (preferredIndex >= 0) return preferredIndex;
  const primaryIndex = addresses.findIndex((address) => address?.primary);
  return primaryIndex >= 0 ? primaryIndex : 0;
};

/** First field error message of a react-hook-form error group. */
export const getFirstFieldError = (fieldErrors) =>
  Object.values(fieldErrors || {}).find((error) => error?.message)?.message;
