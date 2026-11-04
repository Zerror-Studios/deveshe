/**
 * Review your order from the email (PRD-032 FR-R3, FR-D3)
 *
 * Target of the review-request email: `/review?token=…`, signed for one
 * order. No login: the token is the permission, so the page reads it once,
 * removes it from the address bar (history and analytics page URLs never
 * hold it) and keeps it in memory only. It lists the order's products
 * (`reviewLinkOrder`); products already reviewed show as done; one Submit
 * sends every rated product (`submitReviewsWithLink`). Photos upload with
 * the same token. An invalid or expired link says how to review instead.
 * Never indexed (robots.txt disallows `/review`).
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { GET_REVIEW_LINK_ORDER, SUBMIT_REVIEWS_WITH_LINK } from "@/graphql";
import SeoHeader from "@/components/seo/SeoHeader";
import CommonButton from "@/components/common/CommonButton";
import ReviewFields from "@/components/product/review/ReviewFields";
import { Const } from "@/utils/Constant";
import {
  REASON_INVALID_LINK,
  reviewErrorFeedback,
  reviewErrorReason,
  submittedMessage,
  toReviewFormValue,
  toSubmitReviewInput,
} from "@/utils/review.util";

// ─── Constants ────────────────────────────────────────────────────────────

const StatusEnum = {
  LOADING: "LOADING",
  READY: "READY",
  DONE: "DONE",
  INVALID_LINK: "INVALID_LINK",
  NETWORK_ERROR: "NETWORK_ERROR",
};

const PAGE_PATH = "/review";

const META = {
  title: "Review your order – DeVeSheDreams",
  description: "Tell other shoppers what you think of your order.",
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  canonical: `${Const.ClientLink}${PAGE_PATH}`,
  og: {
    title: "Review your order – DeVeSheDreams",
    description: "Tell other shoppers what you think of your order.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Review your order – DeVeSheDreams",
    description: "Tell other shoppers what you think of your order.",
  },
};

const firstValue = (value) => (Array.isArray(value) ? value[0] : value) || "";

// ─── Page ─────────────────────────────────────────────────────────────────

const ReviewOrder = () => {
  const router = useRouter();
  const client = useApolloClient();
  const tokenRef = useRef(null);
  const [status, setStatus] = useState(StatusEnum.LOADING);
  const [order, setOrder] = useState(null);
  const [forms, setForms] = useState({});
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState({});
  const [submitReviews, { loading: submitting }] = useMutation(SUBMIT_REVIEWS_WITH_LINK);

  const load = useCallback(async () => {
    if (!tokenRef.current) {
      setStatus(StatusEnum.INVALID_LINK);
      return;
    }
    setStatus(StatusEnum.LOADING);
    try {
      const { data } = await client.query({
        query: GET_REVIEW_LINK_ORDER,
        variables: { token: tokenRef.current },
        fetchPolicy: "network-only",
      });
      const linkOrder = data?.reviewLinkOrder;
      setOrder(linkOrder);
      setForms(
        Object.fromEntries(
          (linkOrder?.items || [])
            .filter((item) => !item.review)
            .map((item) => [item.productId, toReviewFormValue(null)]),
        ),
      );
      setStatus(StatusEnum.READY);
    } catch (error) {
      // Any answer from the server (expired, forged, another store's
      // link) means this link can't be used; only a network failure retries
      setStatus(CombinedGraphQLErrors.is(error) ? StatusEnum.INVALID_LINK : StatusEnum.NETWORK_ERROR);
    }
  }, [client]);

  useEffect(() => {
    // Once per page view, after the query string is available.
    if (!router.isReady || tokenRef.current !== null) return;
    tokenRef.current = firstValue(router.query.token);
    router.replace(PAGE_PATH, undefined, { shallow: true });
    load();
  }, [router, load]);

  const updateForm = (productId) => (update) =>
    setForms((current) => ({
      ...current,
      [productId]: typeof update === "function" ? update(current[productId]) : update,
    }));

  const rated = Object.entries(forms).filter(([, value]) => value.rating > 0);
  const isUploading = Object.values(uploading).some(Boolean);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (rated.length === 0) {
      setMessage("Choose a star rating for at least one product.");
      return;
    }
    try {
      const { data } = await submitReviews({
        variables: {
          token: tokenRef.current,
          items: rated.map(([productId, value]) => toSubmitReviewInput(productId, value)),
        },
      });
      const saved = data?.submitReviewsWithLink || [];
      const allLive = saved.length > 0 && saved.every((review) => review.status === "APPROVED");
      setMessage(submittedMessage(allLive ? "APPROVED" : "PENDING"));
      setStatus(StatusEnum.DONE);
    } catch (error) {
      if (reviewErrorReason(error) === REASON_INVALID_LINK) {
        setStatus(StatusEnum.INVALID_LINK);
        return;
      }
      setMessage(reviewErrorFeedback(error).message);
    }
  };

  const items = order?.items || [];

  return (
    <>
      <SeoHeader meta={META} />
      <section className="review_link_page" aria-live="polite" aria-busy={status === StatusEnum.LOADING}>
        {status === StatusEnum.LOADING && <h2 className="product_reviews_title">Loading your order…</h2>}

        {status === StatusEnum.INVALID_LINK && (
          <div id="status_section">
            <h2>Link expired</h2>
            <p>This link has expired. Log in to review your purchases.</p>
            <CommonButton title={"Log in"} type="button" href={"/login?next=%2Fprofile"} />
          </div>
        )}

        {status === StatusEnum.NETWORK_ERROR && (
          <div id="status_section">
            <h2>Not loaded</h2>
            <p>We couldn&apos;t reach the store. Please check your connection and try again.</p>
            <CommonButton title={"Try Again"} type="button" onClick={load} />
          </div>
        )}

        {status === StatusEnum.DONE && (
          <div id="status_section">
            <h2>Thank you</h2>
            <p>{message}</p>
            <CommonButton title={"Go Back to Home"} type="button" href={"/"} />
          </div>
        )}

        {status === StatusEnum.READY && (
          <form onSubmit={handleSubmit} noValidate>
            <h2 className="product_reviews_title">
              {order?.orderNo ? `Review your order ${order.orderNo}` : "Review your order"}
            </h2>
            <p className="product_review_meta">
              Reviews are checked by the store before they appear.
            </p>
            {items.length === 0 && <p>There is nothing left to review on this order.</p>}
            <ul className="review_link_items">
              {items.map((item) => (
                <li key={item.productId} className="product_review">
                  <div className="review_link_item_head">
                    {item.imageUrl && (
                      <Image src={item.imageUrl} alt={item.name || ""} width={80} height={80} unoptimized />
                    )}
                    <p className="product_review_title">{item.name}</p>
                  </div>
                  {item.review ? (
                    <p className="product_review_meta">You&apos;ve reviewed this product. Thank you!</p>
                  ) : (
                    <ReviewFields
                      idPrefix={`link-${item.productId}`}
                      value={forms[item.productId]}
                      onChange={updateForm(item.productId)}
                      photosEnabled={Boolean(order?.photosEnabled)}
                      linkToken={tokenRef.current}
                      disabled={submitting}
                      onUploadingChange={(isBusy) =>
                        setUploading((current) => ({ ...current, [item.productId]: isBusy }))
                      }
                    />
                  )}
                </li>
              ))}
            </ul>
            {message && <p className="review_field_error" role="alert">{message}</p>}
            {Object.keys(forms).length > 0 && (
              <CommonButton
                title={rated.length > 1 ? `Submit ${rated.length} reviews` : "Submit review"}
                type="submit"
                loading={submitting || isUploading}
              />
            )}
          </form>
        )}
      </section>
    </>
  );
};

export default ReviewOrder;
