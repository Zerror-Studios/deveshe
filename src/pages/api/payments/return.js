/**
 * Payment return (PRD-011 FR-4.3)
 * Keep in sync with rare-element `app/api/payments/return/route.js`.
 *
 * Where redirect and form-post payment apps send the shopper back: PayU
 * POSTs its response here (`surl` / `furl`), Cashfree redirects here with
 * `order_id`. A cross-site POST carries no session cookie, so nothing is
 * verified here: the route only reads which payment it was and sends the
 * browser (303, a GET that carries the cookie) to `/checkout/payment-return`,
 * which calls `verifyPayment`. The backend confirms the status with the
 * provider; nothing in this request is trusted.
 */

// ─── Constants ────────────────────────────────────────────────────────────

const RETURN_PAGE_PATH = "/checkout/payment-return";
const PROVIDER_ORDER_KEYS = ["txnid", "order_id", "razorpay_order_id", "providerOrderId"];
const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;
const SAFE_REF_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const KNOWN_PROVIDERS = ["payu", "cashfree", "razorpay", "nimbbl"];

// ─── Handler ──────────────────────────────────────────────────────────────

export default function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    res.status(405).end();
    return;
  }
  // Next parses form-urlencoded and JSON bodies into req.body
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const fields = { ...req.query, ...body };
  const params = new URLSearchParams();

  const provider = String(fields.provider || "").toLowerCase();
  if (KNOWN_PROVIDERS.includes(provider)) params.set("provider", provider);
  const ref = PROVIDER_ORDER_KEYS.map((key) => fields[key]).find(
    (value) => typeof value === "string" && SAFE_REF_PATTERN.test(value),
  );
  if (ref) params.set("ref", ref);
  // PayU echoes our order id in udf1
  if (OBJECT_ID_PATTERN.test(String(fields.udf1 || ""))) {
    params.set("orderId", fields.udf1);
  }
  const query = params.toString();
  res.redirect(303, query ? `${RETURN_PAGE_PATH}?${query}` : RETURN_PAGE_PATH);
}
