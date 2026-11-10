/**
 * Payment return (PRD-011 FR-4.3; was `pages/api/payments/return.js`).
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
const SEE_OTHER = 303;

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Form-urlencoded or JSON body fields; anything else reads as none. */
async function readBody(request) {
  const type = request.headers.get("content-type") || "";
  try {
    if (type.includes("application/json")) {
      const body = await request.json();
      return body && typeof body === "object" ? body : {};
    }
    if (
      type.includes("application/x-www-form-urlencoded") ||
      type.includes("multipart/form-data")
    ) {
      const form = await request.formData();
      return Object.fromEntries(
        [...form.entries()].filter(([, value]) => typeof value === "string"),
      );
    }
  } catch {
    // An unreadable body is treated as empty: the page shows the failure
  }
  return {};
}

function redirectToReturnPage(fields) {
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
  // A relative Location, as the Pages API route sent: the browser resolves
  // it against the address it is on, never a host the server guessed.
  return new Response(null, {
    status: SEE_OTHER,
    headers: {
      Location: query ? `${RETURN_PAGE_PATH}?${query}` : RETURN_PAGE_PATH,
    },
  });
}

// ─── Handlers ─────────────────────────────────────────────────────────────

const queryFields = (request) =>
  Object.fromEntries(new URL(request.url).searchParams.entries());

export async function GET(request) {
  return redirectToReturnPage(queryFields(request));
}

export async function POST(request) {
  const body = await readBody(request);
  return redirectToReturnPage({ ...queryFields(request), ...body });
}
