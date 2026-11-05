/**
 * Hashed customer data for Google enhanced conversions (PRD-034 FR-1.6)
 *
 * Google's tag takes `sha256_email_address` and `sha256_phone_number`:
 * SHA-256 hex of the normalised value, hashed here in the browser with
 * SubtleCrypto. The plain email or phone is never passed to any tag.
 * Normalising matches the backend's core `hashForAds`: email trimmed and
 * lower-cased; phone in E.164 (`+91XXXXXXXXXX` for a 10-digit Indian
 * number). A value that can't be normalised is left out, never guessed.
 */

// ─── Constants ────────────────────────────────────────────────────────────

const DEFAULT_COUNTRY_CODE = "91";
const E164_MIN_DIGITS = 8;
const E164_MAX_DIGITS = 15;
const INDIAN_MOBILE_LENGTH = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Normalising ──────────────────────────────────────────────────────────

/** `"  Asha@Example.COM "` → `"asha@example.com"`; "" when not an email. */
export function normalizeEmail(email) {
  const value = String(email ?? "").trim().toLowerCase();
  return EMAIL_PATTERN.test(value) ? value : "";
}

/**
 * The phone in E.164 (`+` and digits), or "". Same rule as the backend's
 * core `normalizeAdsPhone` / `adsPhoneE164`: `+` or `00` means it already
 * has a country code; otherwise leading `0`s are dropped and the country
 * code (default India, 91) is added to a 10-digit number or to one that
 * doesn't start with it. 8 to 15 digits, else "".
 */
export function normalizePhoneE164(phone, countryCode = "") {
  const raw = String(phone ?? "").trim();
  let digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const code =
    String(countryCode ?? "").replace(/\D/g, "") || DEFAULT_COUNTRY_CODE;
  if (raw.startsWith("+") || raw.startsWith("00")) {
    digits = digits.replace(/^00/, "");
  } else {
    digits = digits.replace(/^0+/, "");
    if (digits.length === INDIAN_MOBILE_LENGTH || !digits.startsWith(code)) {
      digits = `${code}${digits}`;
    }
  }
  return digits.length >= E164_MIN_DIGITS && digits.length <= E164_MAX_DIGITS
    ? `+${digits}`
    : "";
}

// ─── Hashing ──────────────────────────────────────────────────────────────

/** SHA-256 hex of `text` (SubtleCrypto); "" when it's unavailable. */
export async function sha256Hex(text) {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle || !text) return "";
  const digest = await subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * The Google tag's `user_data` from `{ email, phone, countryCode }`, with
 * only hashed values, or null when there's nothing usable.
 */
export async function buildEnhancedUserData(customer) {
  const email = normalizeEmail(customer?.email);
  const phone = normalizePhoneE164(customer?.phone, customer?.countryCode);
  const userData = {};
  if (email) userData.sha256_email_address = await sha256Hex(email);
  if (phone) userData.sha256_phone_number = await sha256Hex(phone);
  Object.keys(userData).forEach((key) => {
    if (!userData[key]) delete userData[key];
  });
  return Object.keys(userData).length ? userData : null;
}
