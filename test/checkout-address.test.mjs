/**
 * Saved-address checkout (PRD-014 UX-02 regression, K-01)
 *
 * A returning customer with saved addresses sees no address form, so the
 * delivery step must preselect one (preferred → primary → first), the
 * preselected address must pass the checkout schema without touching the
 * form, and an invalid one must yield a message the step shows at its top.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { getFirstFieldError, pickSavedAddressIndex, toFormAddress } =
  await import("@/utils/checkout-address.util");
const { AddressSchema } = await import("@/validations/CheckoutValidation");

// ─── Fixtures ─────────────────────────────────────────────────────────────

const savedAddress = (overrides = {}) => ({
  firstname: "Asha",
  lastname: "Rao",
  addressType: "HOME",
  flat: null,
  addressline1: "12 MG Road",
  addressline2: null,
  landmark: null,
  country: "India",
  states: "Karnataka",
  city: "Bengaluru",
  pincode: "560001",
  countryCode: "+91",
  phone: "9800000000",
  primary: false,
  ...overrides,
});

// ─── Selection ────────────────────────────────────────────────────────────

describe("pickSavedAddressIndex", () => {
  it("preselects the primary address of two", () => {
    const addresses = [savedAddress(), savedAddress({ primary: true })];
    assert.equal(pickSavedAddressIndex(addresses), 1);
  });

  it("falls back to the first address when none is primary", () => {
    assert.equal(pickSavedAddressIndex([savedAddress(), savedAddress()]), 0);
  });

  it("prefers a payment retry's kept address over the primary one", () => {
    const addresses = [
      savedAddress({ primary: true }),
      savedAddress({ city: "Mysuru" }),
    ];
    const isKeptAddress = (formAddress) => formAddress.city === "Mysuru";
    assert.equal(pickSavedAddressIndex(addresses, isKeptAddress), 1);
    assert.equal(pickSavedAddressIndex(addresses, () => false), 0);
  });

  it("selects nothing without saved addresses", () => {
    assert.equal(pickSavedAddressIndex([]), -1);
    assert.equal(pickSavedAddressIndex(undefined), -1);
  });
});

// ─── Validation ───────────────────────────────────────────────────────────

describe("preselected address validation", () => {
  it("passes the checkout schema as saved (nulls become empty strings)", () => {
    const formAddress = toFormAddress(savedAddress({ primary: true }));
    assert.equal(formAddress.addressline2, "");
    assert.equal(formAddress.primary, true);
    assert.equal(AddressSchema.safeParse(formAddress).success, true);
  });

  it("gives an incomplete saved address a visible first error", () => {
    const formAddress = toFormAddress(savedAddress({ pincode: null }));
    const result = AddressSchema.safeParse(formAddress);
    assert.equal(result.success, false);
    const fieldErrors = Object.fromEntries(
      result.error.issues.map((issue) => [
        issue.path[0],
        { message: issue.message },
      ]),
    );
    assert.equal(getFirstFieldError(fieldErrors), "Pincode is required");
  });

  it("shows no message without errors", () => {
    assert.equal(getFirstFieldError(undefined), undefined);
    assert.equal(getFirstFieldError({ city: {} }), undefined);
  });
});
