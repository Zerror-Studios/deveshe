// Backend PRD-047 FR-8 (kit 1.5.0): one vote per browser; `voterId` is the
// `zc_poll_voter` cookie id, and a repeat vote changes nothing and returns
// the current results.
export { VoteBlogPollDocument as VOTE_BLOG_POLL } from "@zcom/storefront-kit/graphql";
