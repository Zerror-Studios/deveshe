/**
 * Payment link data — SERVER ONLY (PRD-028 FR-5; was `getServerSideProps`
 * of `pages/pay/[token].jsx`, kit PRD-002 FR-3.1).
 *
 * Reads `getPaymentRequest(token)` with the edge headers and the shopper's
 * IP (the backend limits reads per IP; the kit's `getRequestClientIp`). `confirm=1` (back from a redirect
 * payment app, already verified on payment-return) starts the page in
 * CONFIRMING while the link still reads payable.
 */

import { getRequestClientIp } from "@zcom/storefront-kit/server";
import { serverQuery } from "@/lib/server-query";
import { GET_PAYMENT_REQUEST } from "@/graphql";
import { getErrorCode, getErrorReason } from "@/utils/api-error.util";
import {
  PayViewEnum,
  isPaymentRequestToken,
  viewFromError,
  viewFromRequest,
} from "@/utils/payment-request.util";

// ─── Loader ───────────────────────────────────────────────────────────────

export async function loadPayPage(token, query) {
  if (!isPaymentRequestToken(token)) {
    return { token: "", request: null, initialView: PayViewEnum.NOT_FOUND };
  }

  const clientIp = await getRequestClientIp();

  let request = null;
  let view;
  try {
    const data = await serverQuery(GET_PAYMENT_REQUEST, { token }, { clientIp });
    request = data?.getPaymentRequest ?? null;
    view = viewFromRequest(request);
  } catch (error) {
    view = viewFromError({
      code: getErrorCode(error),
      reason: getErrorReason(error),
    });
  }
  const isReturning = query?.confirm === "1" && view === PayViewEnum.READY;
  return {
    token,
    request,
    initialView: isReturning ? PayViewEnum.CONFIRMING : view,
  };
}
