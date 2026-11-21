/**
 * Shopping assistant replies (DD-PRD-001 FR-13, FR-23..FR-26; dynamic since
 * backend PRD-049 step B0, D14, D15)
 *
 * Keyword rules pick one intent per message, checked in a fixed order, and
 * each intent is answered in this order (DD-PRD-001 §10 "B0 routing"):
 * 1. **Live data first** when the intent is clear: navigation, orders, new
 *    arrivals, offers, collections, greetings and thanks never ask the FAQs.
 * 2. **"Talk to us"** (and "leave a message", "a real person") starts a
 *    message to the team: signed-in shoppers type it here and it goes to the
 *    store's dashboard Inbox (`sendStoreChatMessage`, the caller sends it);
 *    guests get the store's sign-in prompt and a sign-in link that comes
 *    back to the open chat (`?chat=open`).
 * 3. **The store's own answers** (FAQs staff edit in the dashboard, asked
 *    through `loaders.askStore`, the kit's `useStoreChat().ask`) for policy
 *    questions, product words and anything else. A match is the answer.
 * 4. **The scripted answers below** when the FAQs don't match, are switched
 *    off (`answersEnabled: false`) or can't be reached, so the store keeps
 *    working before staff fill in their FAQs. Product words then search the
 *    catalog. A question nothing answered is a miss.
 * 5. **"Talk to us" with every answer** (backend PRD-049 B0.1, D17): while
 *    the store takes messages, the backend's `offerPerson` comes with every
 *    answer it gave, so the reply carries `offerPerson` (a quiet "Talk to
 *    us" under it) or, after a miss, `messageTeam` (a clear "Message the
 *    team" button), with the shopper's `question` to start the message.
 *
 * The delivery and exchange answers quote `/shipping-returns`, so when a
 * policy changes, change both (or let staff answer it in the dashboard).
 * Data comes from loaders the caller passes in (the assistant's Apollo
 * reads and the kit's store chat), so this file has no browser or Apollo
 * import and `node:test` loads it. `getAssistantReply(text, context)` is the
 * one entry point.
 *
 * A reply is `{ intent, text, chatFlow, products?, links?, chips?, orders?,
 * offers?, action?, searchTerm?, resultCount?, speech?, missed?,
 * offerPerson?, messageTeam?, question?, handoff?, cancelledChat? }`;
 * `speech` replaces `text` when read aloud. Links are paths on this site or
 * the store's https links (`external: true`), and prices stay the server's.
 */

import {
  formatMoney,
  getShipmentStatusLabel,
  isExternalStoreChatLink,
  toStoreChatLinkHref,
  withStoreChatOpen,
} from "@zcom/storefront-kit/core";
import {
  formatOrderDate,
  getOrderStatusLabel,
} from "@/utils/order-detail.util";
import { getLoginPath } from "@/utils/redirect.util";

// ─── Vocabulary ───────────────────────────────────────────────────────────

export const AssistantIntentEnum = {
  TALK_TO_US: "TALK_TO_US",
  NAVIGATE: "NAVIGATE",
  ORDERS: "ORDERS",
  EXCHANGES: "EXCHANGES",
  PAYMENT: "PAYMENT",
  NEW_ARRIVALS: "NEW_ARRIVALS",
  DELIVERY: "DELIVERY",
  OFFERS: "OFFERS",
  SIZING: "SIZING",
  CONTACT: "CONTACT",
  COLLECTIONS: "COLLECTIONS",
  THANKS: "THANKS",
  GREETING: "GREETING",
  PRODUCTS: "PRODUCTS",
  /** The store's own answer (an FAQ staff wrote in the dashboard). */
  FAQ: "FAQ",
  FALLBACK: "FALLBACK",
};

export const AssistantActionEnum = {
  NAVIGATE: "navigate",
  OPEN_BAG: "open-bag",
  /** Send `text` to the team (`sendStoreChatMessage`, signed in). */
  SEND_CHAT: "send-chat",
};

/** The "Talk to us" flow: the shopper is typing a message for the team. */
export const ChatStepEnum = {
  COMPOSE: "compose",
};

const Intent = AssistantIntentEnum;

// ─── Copy (the owner reviews it, Q1) ──────────────────────────────────────

/** As on `/contact`. */
export const ASSISTANT_SUPPORT_EMAIL = "deveshedreams@gmail.com";

/** FR-13: the chips under the welcome message (the store's own, B0). */
export const TALK_TO_US = "Talk to us";
export const REPLY_TO_TEAM = "Reply to the team";
/** B0.1: the clear button after a question nothing answered. */
export const MESSAGE_THE_TEAM = "Message the team";
/** B0.1: the chip that drops a message kept through sign-in. */
export const DISCARD_DRAFT = "Don't send";

export const QUICK_ACTIONS = [
  "New arrivals",
  "Delivery",
  "Exchanges",
  "Track my order",
  "Offers",
  "Talk to us",
];

export const ASSISTANT_COPY = {
  welcome:
    "Hi, I'm the DeVeSheDreams assistant. Ask me about a piece, delivery, exchanges or your order, or tap one below.",
  greeting:
    "Hi! I can find pieces, explain delivery and exchanges, show your orders and current offers, or pass a message to the team. What would you like?",
  thanks: "Happy to help! Anything else?",
  fallback:
    "I can help with pieces, delivery, exchanges, orders and offers, or pass a message to the team.",
  delivery:
    "Shipping is free across India. Every piece is made to order, so we let you know your order's timeline once you've ordered. After it ships, delivery takes 1–2 business days within your city or state, 3–5 between metro cities and 5–7 or more for the rest of India. For international orders, the customer pays the shipping and customs duties.",
  exchanges: `We exchange a piece only if we sent the wrong item, the wrong size or a damaged piece, and only for the same piece in another size. Caps, hats and socks can't be exchanged, and we don't give refunds. To ask for an exchange, email ${ASSISTANT_SUPPORT_EMAIL}: our quality team reviews it, a courier collects the parcel within 3–7 days, and we send the replacement within 3–4 business days of receiving it.`,
  sizing:
    "Each product page has its own size guide next to the sizes. Every piece is made to order, so if you're between sizes, leave the team a message and they'll help. Tell me what you're looking for and I'll find it.",
  payment:
    "You pay online on the checkout's payment step, where the ways you can pay are shown.",
  contact: `You can email the team at ${ASSISTANT_SUPPORT_EMAIL} or use the form on the contact page.`,
  contactWithChat: `You can email the team at ${ASSISTANT_SUPPORT_EMAIL}, use the form on the contact page, or tap Talk to us to message them right here.`,
  ordersGuest:
    "Sign in to see your orders. For an order you placed as a guest, open the status link in your order email.",
  ordersNone: "You haven't placed an order with this account yet.",
  ordersIntro: "Here are your latest orders:",
  offersIntro: "Here are the offers you can use right now:",
  offersNone:
    "There are no offers running right now. Sign up for the newsletter at the bottom of the page to hear about the next one.",
  newArrivals: "Here's what's new:",
  collections: "Here are our collections:",
  shopOnly: "Browse everything in the shop:",
  openBag: "Opening your bag.",
  talkStart:
    "Sure. What would you like to tell the team? Their reply will show up here, and we'll email you too.",
  talkSent:
    "Sent! The team will reply here, and we'll email you when they do.",
  talkCancelled: "No problem, I haven't sent anything.",
  talkRateLimited:
    "You've sent a lot of messages in the last hour. Please wait a little, or email the team.",
  talkFailed: "I couldn't send that just now. Please try again.",
  signInPrompt:
    "Sign in to message the team. They'll reply here and by email.",
  missed: "I don't have an answer for that yet.",
  missedSuggestions: "Did you mean one of these?",
  offerPerson: "Would you like to message the team?",
  draftRestored:
    "Here's the message you started before signing in. Check it and tap send when you're ready.",
  teamBack: (when) =>
    `The team is back ${when}. You can still send a message now, and we'll email you their reply.`,
  networkError: "I couldn't reach the store just now. Please try again.",
};

const productsFoundText = (term) => `Here's what I found for "${term}":`;
const productsNoneText = (term) =>
  `I couldn't find "${term}". Try another word, or browse a collection:`;
const navigateText = (label) => `Taking you to ${label}.`;
const productsMissedText = (term) => `I couldn't find "${term}".`;

const SHOP_LINK = { label: "Browse the shop", href: "/shop" };
const POLICY_LINK = { label: "Shipping & returns", href: "/shipping-returns" };
const CONTACT_LINK = { label: "Contact page", href: "/contact" };

/** FR-12: the phrase shown while a reply is being prepared. */
const THINKING_PHRASES = {
  [Intent.PRODUCTS]: "Looking through the collection…",
  [Intent.NEW_ARRIVALS]: "Looking through the collection…",
  [Intent.COLLECTIONS]: "Looking through the collection…",
  [Intent.DELIVERY]: "Checking our policies…",
  [Intent.EXCHANGES]: "Checking our policies…",
  [Intent.PAYMENT]: "Checking our policies…",
  [Intent.SIZING]: "Checking our policies…",
  [Intent.ORDERS]: "Finding your orders…",
  [Intent.OFFERS]: "Checking today's offers…",
};

export const getThinkingPhrase = (intent) =>
  THINKING_PHRASES[intent] || "One moment…";

/** FR-12: how long a reply takes to appear (ms), by its length. */
export const getRevealDuration = (text) =>
  Math.round(Math.min(1600, Math.max(500, String(text || "").length * 14)));

// ─── Matching (FR-23) ─────────────────────────────────────────────────────

/** Lower case, plain apostrophes, letters, digits, hyphens and spaces. */
const normalise = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9'\- ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** B0: wanting a person, which "Talk to us" answers. */
const TALK_TO_US_PATTERN =
  /\b(talk to (us|you|someone|somebody|a person|a human|a real person|the team|an agent)|speak (to|with) (us|you|someone|somebody|a person|a human|a real person|the team|an agent)|real person|human|(live )?agent|reply to the team|leave (a |me a |the team a )?(message|note)|send (a |the team a )?message|message (the team|you|us)|write to (you|the team)|drop (a |us a )?(line|note))\b/;

const NAVIGATION_TARGETS = [
  { words: "bag|cart|basket|checkout|check out", label: "your bag", bag: true },
  { words: "look ?books?", href: "/lookbook", label: "the lookbook" },
  { words: "blogs?|journal", href: "/blogs", label: "the journal" },
  { words: "about(?: us| page)?|story", href: "/about", label: "our story" },
  { words: "account|profile", href: "/profile", label: "your account" },
  {
    words: "contact(?: page| form)?",
    href: "/contact",
    label: "the contact page",
  },
  {
    words:
      "shipping(?: (?:and )?returns?)?(?: page| policy)?|returns? (?:page|policy)",
    href: "/shipping-returns",
    label: "Shipping & returns",
  },
  { words: "shop|store", href: "/shop", label: "the shop" },
  { words: "home(?: ?page)?", href: "/", label: "the home page" },
].map((target) => ({
  ...target,
  // A command right before the page: "take me to the lookbook", "open my bag"
  command: new RegExp(
    `\\b(?:go|open|take me|bring me|navigate|visit|show me)(?: (?:to|back|me|the|my|our|your|us)){0,3} (?:${target.words})\\b`,
  ),
  // Or the page alone: "lookbook", "my bag"
  alone: new RegExp(`^(?:the |my )?(?:${target.words})$`),
}));

const INTENT_RULES = [
  [
    Intent.ORDERS,
    /\b(track|tracking|where's my|where is my|my orders?|order status|status of my|order history|(past|previous) orders?|my purchases?|(has|is|did) my (order|parcel|package)|delivered yet|shipped yet|dispatched yet)\b/,
  ],
  [
    Intent.EXCHANGES,
    /\b(returns?|returning|exchanges?|exchanging|refunds?|refunded|replace|replacement|wrong (size|item|product|piece|colou?r)|damaged|defective|torn|faulty)\b/,
  ],
  [
    Intent.PAYMENT,
    /\b(payments?|pay (with|by|using|via|online|later)|how (do|can|should) i pay|upi|cash on delivery|cod|net ?banking|credit card|debit card|emi|gpay|paytm|phonepe)\b/,
  ],
  [
    Intent.NEW_ARRIVALS,
    /\b(new arrivals?|new in|newest|latest|what's new|whats new|just in|new collection|new drops?)\b/,
  ],
  [
    Intent.DELIVERY,
    /\b(ship|ships|shipping|shipped|deliver|delivers|delivery|deliveries|dispatch|courier|how long|when will|arrive|arrives|arrival|international|internationally|abroad|overseas|outside india|made to order|lead time|timeline)\b/,
  ],
  [
    Intent.OFFERS,
    /\b(offers?|coupons?|discounts?|promo|promos|promo ?codes?|promotions?|sale|sales|deals?|vouchers?)\b/,
  ],
  [
    Intent.SIZING,
    /\b(size|sizes|sizing|fit|fits|fitting|measure|measurements?|bust|chest|waist|hips?|petite|plus size)\b/,
  ],
  [
    Intent.CONTACT,
    /\b(contact|support|customer care|customer service|email|e-mail|phone number|call you|whatsapp|complain|complaint|collab|collaboration|collaborate|wholesale|bulk order)\b/,
  ],
  [
    Intent.COLLECTIONS,
    /\b(collections?|categor(y|ies)|what do you (sell|have|make|offer)|what can i buy|range|catalog|catalogue)\b/,
  ],
];

const THANKS_PATTERN =
  /^(thanks?( you)?( so much)?|thank u|thx|ty|great|cool|ok|okay|perfect|awesome|nice|bye|goodbye|see you|got it)( thanks?)?$/;
const GREETING_PATTERN =
  /^(hi+|hello|hey+|hiya|yo|namaste|hola|good (morning|afternoon|evening))( there)?$|^(help|help me|what can you do|who are you|how does this work)$/;
const PRODUCT_CUES =
  /\b(show|find|search|looking|look for|have|got|want|need|buy|shop|sell|stock|carry|any|price|cost)\b/;

const FILLER_WORDS = new Set(
  (
    "a an the some any me my i i'm im you your yours we us our for in of on at by with " +
    "to and or but is are am be was were do does did have has had got get gets show shows " +
    "find search searching want wants need needs like love buy shop shopping see look " +
    "looking please pls plz thanks thank hi hello hey can could would will should may " +
    "might it its this that these those there here what which who where when how " +
    "something anything stuff thing things item items product products piece pieces one " +
    "ones kind sort type new also just really very more other another available " +
    "availability price prices cost costs much many sell sells stock carry"
  ).split(" "),
);

/** FR-23: the product words of a message, at most 5 ("red co-ord set"). */
export const extractProductTerm = (text) =>
  normalise(text)
    .replace(/'s\b/g, "")
    .split(" ")
    .map((word) => word.replace(/^[-']+|[-']+$/g, ""))
    .filter(
      (word) =>
        word.length > 1 && /[a-z]/.test(word) && !FILLER_WORDS.has(word),
    )
    .slice(0, 5)
    .join(" ");

const matchNavigation = (said) => {
  const target = NAVIGATION_TARGETS.find(
    (item) => item.command.test(said) || item.alone.test(said),
  );
  if (!target) return null;
  return target.bag
    ? { label: target.label, action: AssistantActionEnum.OPEN_BAG }
    : { label: target.label, href: target.href };
};

/**
 * FR-23: the message's intent, with what it needs: `term` and `newest` for
 * products, `href` or `action` and `label` for navigation.
 */
export const matchAssistantIntent = (text) => {
  const said = normalise(text);
  if (!said) return { intent: Intent.FALLBACK };
  if (TALK_TO_US_PATTERN.test(said)) return { intent: Intent.TALK_TO_US };

  const navigation = matchNavigation(said);
  if (navigation) return { intent: Intent.NAVIGATE, ...navigation };

  const rule = INTENT_RULES.find(([, pattern]) => pattern.test(said));
  if (rule) return { intent: rule[0] };
  if (THANKS_PATTERN.test(said)) return { intent: Intent.THANKS };
  if (GREETING_PATTERN.test(said)) return { intent: Intent.GREETING };

  const hasCue = PRODUCT_CUES.test(said);
  if (said.split(" ").length > 8 && !hasCue) return { intent: Intent.FALLBACK };
  const term = extractProductTerm(said);
  if (term) {
    return { intent: Intent.PRODUCTS, term, newest: /\bnew\b/.test(said) };
  }
  if (hasCue) return { intent: Intent.PRODUCTS, term: "", newest: true };
  return { intent: Intent.FALLBACK };
};

// ─── Data answers ─────────────────────────────────────────────────────────

const reply = (intent, text, extra = {}) => ({
  intent,
  text,
  chatFlow: null,
  ...extra,
});

/** The searches to try: the words, then the last one, then the longest. */
const getSearchAttempts = (term) => {
  const words = term.split(" ").filter((word) => word.length > 2);
  const attempts = [term];
  if (words.length > 1) {
    attempts.push(words[words.length - 1]);
    attempts.push([...words].sort((a, b) => b.length - a.length)[0]);
  }
  return [...new Set(attempts.filter(Boolean))];
};

const toCollectionLinks = (collections) =>
  (collections || [])
    .filter((collection) => collection?.slug && collection?.name)
    .slice(0, 8)
    .map((collection) => ({
      label: collection.name,
      href: `/shop/${encodeURIComponent(collection.slug)}`,
    }));

const loadCollectionLinks = async (loaders) => {
  try {
    return [...toCollectionLinks(await loaders.getCollections?.()), SHOP_LINK];
  } catch {
    return [SHOP_LINK];
  }
};

async function replyWithProducts({ term, newest }, loaders) {
  if (!term) return replyWithNewArrivals(loaders);
  for (const attempt of getSearchAttempts(term)) {
    const page = await loaders.searchProducts(attempt, { newest });
    const products = (page?.products || []).filter(Boolean).slice(0, 4);
    if (products.length) {
      return reply(Intent.PRODUCTS, productsFoundText(attempt), {
        products,
        links: [
          {
            label: "See all results",
            href: `/search?q=${encodeURIComponent(attempt)}`,
          },
        ],
        searchTerm: term,
        resultCount: page?.totalCount || products.length,
      });
    }
  }
  return reply(Intent.PRODUCTS, productsNoneText(term), {
    links: await loadCollectionLinks(loaders),
    searchTerm: term,
    resultCount: 0,
  });
}

async function replyWithNewArrivals(loaders) {
  const page = await loaders.searchProducts("", { newest: true });
  const products = (page?.products || []).filter(Boolean).slice(0, 4);
  if (!products.length) {
    return reply(Intent.NEW_ARRIVALS, ASSISTANT_COPY.shopOnly, {
      links: [SHOP_LINK],
    });
  }
  return reply(Intent.NEW_ARRIVALS, ASSISTANT_COPY.newArrivals, {
    products,
    links: [SHOP_LINK],
  });
}

async function replyWithCollections(loaders) {
  const links = await loadCollectionLinks(loaders);
  const text =
    links.length > 1 ? ASSISTANT_COPY.collections : ASSISTANT_COPY.shopOnly;
  return reply(Intent.COLLECTIONS, text, { links });
}

/** FR-23: an order as a line: number, date, status and shipment status. */
export const toOrderLine = (order) => {
  const status = getOrderStatusLabel(order?.displayStatus, "");
  const shipment = getShipmentStatusLabel(order?.trackingStatus);
  const meta = [
    formatOrderDate(order?.createdAt),
    status,
    shipment && shipment !== status ? shipment : "",
  ].filter(Boolean);
  return {
    id: String(order._id),
    title: order?.orderNo ? `Order #${order.orderNo}` : "Your order",
    meta: meta.join(" · "),
    href: `/profile/orders/${encodeURIComponent(order._id)}`,
  };
};

const guestOrdersReply = () =>
  reply(Intent.ORDERS, ASSISTANT_COPY.ordersGuest, {
    links: [{ label: "Sign in", href: getLoginPath("/profile") }],
  });

async function replyWithOrders(isLoggedIn, loaders) {
  if (!isLoggedIn) return guestOrdersReply();
  const orders = await loaders.getMyOrders?.();
  if (!orders) return guestOrdersReply();
  const lines = orders.filter((order) => order?._id).slice(0, 3);
  if (!lines.length) {
    return reply(Intent.ORDERS, ASSISTANT_COPY.ordersNone, {
      chips: ["New arrivals"],
    });
  }
  return reply(Intent.ORDERS, ASSISTANT_COPY.ordersIntro, {
    orders: lines.map(toOrderLine),
  });
}

/** FR-23: an offer as `{ code, title, detail }`, from the server's values. */
export const describeOffer = (promotion) => {
  const type = String(promotion?.promotionType || "");
  const discount = Number(promotion?.discount);
  const minimum = Number(promotion?.minimumSubtotal);
  const parts = [];
  if (Number.isFinite(discount) && discount > 0) {
    if (/percent/i.test(type)) parts.push(`${discount}% off`);
    else if (/fixed|flat|amount/i.test(type)) {
      parts.push(`${formatMoney(discount, "INR")} off`);
    }
  }
  if (/ship/i.test(type)) parts.push("free shipping");
  if (Number.isFinite(minimum) && minimum > 0) {
    parts.push(`on orders over ${formatMoney(minimum, "INR")}`);
  }
  const until = formatOrderDate(promotion?.endDate);
  if (until) parts.push(`until ${until}`);
  return {
    code: String(promotion.promotionCode),
    title: promotion?.promotionName || String(promotion.promotionCode),
    detail: parts.join(", "),
  };
};

async function replyWithOffers(loaders) {
  const promotions = (await loaders.getOffers?.()) || [];
  const offers = promotions
    .filter((promotion) => promotion?.promotionCode)
    .slice(0, 5)
    .map(describeOffer);
  if (!offers.length) {
    return reply(Intent.OFFERS, ASSISTANT_COPY.offersNone, {
      chips: ["New arrivals"],
    });
  }
  return reply(Intent.OFFERS, ASSISTANT_COPY.offersIntro, { offers });
}

// ─── The store's answers (backend PRD-049 B0) ─────────────────────────────

/** Intents answered with live data before any FAQ is asked. */
const LIVE_FIRST_INTENTS = new Set([
  Intent.NAVIGATE,
  Intent.ORDERS,
  Intent.NEW_ARRIVALS,
  Intent.OFFERS,
  Intent.COLLECTIONS,
  Intent.THANKS,
  Intent.GREETING,
]);

/** True when `text`'s intent asks the store's FAQs first. */
export const asksStoreFirst = (intent) =>
  intent !== Intent.TALK_TO_US && !LIVE_FIRST_INTENTS.has(intent);

/**
 * The chat's state from the kit's `useStoreChat`, with safe defaults:
 * `messagingEnabled` (the store takes messages), `signedIn` (a shopper
 * session), `signInPrompt` (the store's words) and `returnPath` (where
 * signing in comes back to, with the chat open).
 */
const readChat = (chat) => ({
  messagingEnabled: !!chat?.messagingEnabled,
  signedIn: !!chat?.signedIn,
  signInPrompt: String(chat?.signInPrompt || "").trim(),
  returnPath: chat?.returnPath || "/",
});

/** The FAQ's links as transcript links (unsafe ones dropped). */
export const toStoreAnswerLinks = (links) =>
  (links || [])
    .map((link) => {
      const href = toStoreChatLinkHref(link?.url);
      const label = String(link?.label || "").trim();
      if (!href || !label) return null;
      return isExternalStoreChatLink(href)
        ? { label, href, external: true }
        : { label, href };
    })
    .filter(Boolean)
    .slice(0, 5);

/**
 * Asks the store's FAQs: the answer (with `offerPerson`, B0.1, even when
 * the FAQs are off), or null when the store can't be reached.
 */
const askStore = async (text, loaders) => {
  if (typeof loaders.askStore !== "function") return null;
  try {
    return (await loaders.askStore(text)) || null;
  } catch {
    // Unreachable, rate limited or too long: the scripted answers stand in
    return null;
  }
};

/** A matched FAQ as a reply. */
export const toStoreAnswerReply = (answer, chat) =>
  reply(Intent.FAQ, String(answer?.answer || "").trim(), {
    links: toStoreAnswerLinks(answer?.links),
    chips: ["New arrivals"],
    // B0.1: "Talk to us" sits under the answer itself
    offerPerson: !!answer?.offerPerson && readChat(chat).messagingEnabled,
  });

/**
 * Nothing answered `text`: "Did you mean" chips from the FAQs and, while
 * the store takes messages (`offerPerson`, B0.1), a clear "Message the
 * team" (`messageTeam`) instead of a dead end. `base` is a reply that
 * already says it found nothing (a product search), else the miss copy.
 */
export const toMissedReply = (answer, chat, base = null) => {
  const { messagingEnabled } = readChat(chat);
  const suggestions = (answer?.suggestions || [])
    .map((suggestion) => String(suggestion?.question || "").trim())
    .filter(Boolean)
    .slice(0, 3);
  const offerPerson = !!answer?.offerPerson && messagingEnabled;
  const fallback = base || reply(Intent.FALLBACK, ASSISTANT_COPY.missed);
  if (!suggestions.length && !offerPerson) {
    return {
      ...fallback,
      chips: fallback.chips?.length
        ? fallback.chips
        : QUICK_ACTIONS.filter(
            (label) => messagingEnabled || label !== TALK_TO_US,
          ),
      missed: true,
    };
  }
  const lead = base?.searchTerm
    ? productsMissedText(base.searchTerm)
    : ASSISTANT_COPY.missed;
  const parts = [lead];
  if (suggestions.length) parts.push(ASSISTANT_COPY.missedSuggestions);
  if (offerPerson) parts.push(ASSISTANT_COPY.offerPerson);
  return {
    ...fallback,
    text: parts.join(" "),
    chips: suggestions,
    missed: true,
    messageTeam: offerPerson,
  };
};

// ─── Talk to us (backend PRD-049 B0, D15) ─────────────────────────────────

const CANCEL_PATTERN =
  /^(cancel|stop|never ?mind|exit|quit|forget it|no thanks|don't send( it)?|back( to the assistant)?)$/;

/** The contact details, for a store that isn't taking chat messages. */
const contactReply = (chat) =>
  reply(
    Intent.CONTACT,
    readChat(chat).messagingEnabled
      ? ASSISTANT_COPY.contactWithChat
      : ASSISTANT_COPY.contact,
    {
      links: [CONTACT_LINK],
      chips: readChat(chat).messagingEnabled ? [TALK_TO_US] : [],
    },
  );

/** A guest: the store's sign-in prompt and a link back to the open chat. */
export const getSignInReply = (chat) => {
  const { signInPrompt, returnPath } = readChat(chat);
  return reply(Intent.TALK_TO_US, signInPrompt || ASSISTANT_COPY.signInPrompt, {
    links: [
      { label: "Sign in", href: getLoginPath(withStoreChatOpen(returnPath)) },
    ],
    handoff: true,
  });
};

/**
 * "Talk to us": a signed-in shopper types the message next (the flow), a
 * guest is asked to sign in, and a store without chat messaging shows its
 * contact details.
 */
export const startTalkToUs = (chat) => {
  const { messagingEnabled, signedIn } = readChat(chat);
  if (!messagingEnabled) return contactReply(chat);
  if (!signedIn) return getSignInReply(chat);
  return reply(Intent.TALK_TO_US, ASSISTANT_COPY.talkStart, {
    chatFlow: { step: ChatStepEnum.COMPOSE },
    chips: ["Cancel"],
    handoff: true,
  });
};

/** The flow's reply to `text`: cancel, or send it to the team. */
export const advanceTalkToUs = (flow, text, chat) => {
  const message = String(text || "").trim();
  if (!message || CANCEL_PATTERN.test(normalise(message))) {
    // `cancelledChat`: the caller drops a message kept through sign-in
    return reply(Intent.TALK_TO_US, ASSISTANT_COPY.talkCancelled, {
      chips: QUICK_ACTIONS,
      cancelledChat: true,
    });
  }
  if (!readChat(chat).signedIn) return getSignInReply(chat);
  return reply(Intent.TALK_TO_US, "", {
    chatFlow: flow,
    action: { type: AssistantActionEnum.SEND_CHAT, text: message },
  });
};

/** After `sendStoreChatMessage` stored the message. */
export const getChatSentReply = () =>
  reply(Intent.TALK_TO_US, ASSISTANT_COPY.talkSent, {
    chips: ["New arrivals", "Track my order"],
    handoff: true,
  });

/**
 * A send that failed, by the kit's error key: sign in, messaging off, the
 * hourly limit, or try again (the flow stays open, so the next message
 * sends).
 */
export const getChatSendFailedReply = (key, chat) => {
  if (key === "CHAT_SIGN_IN_REQUIRED") return getSignInReply(chat);
  if (key === "CHAT_MESSAGING_OFF") {
    return contactReply({ ...chat, messagingEnabled: false });
  }
  if (key === "RATE_LIMITED") {
    return reply(Intent.TALK_TO_US, ASSISTANT_COPY.talkRateLimited, {
      links: [CONTACT_LINK],
    });
  }
  return reply(Intent.TALK_TO_US, ASSISTANT_COPY.talkFailed, {
    chatFlow: { step: ChatStepEnum.COMPOSE },
    chips: ["Cancel"],
  });
};

/** A message from the store's team, as the transcript shows it. */
export const toStoreReplyMessage = (message, { isHistory = false } = {}) => ({
  role: message?.from === "SHOPPER" ? "user" : "assistant",
  from: message?.from === "SHOPPER" ? "shopper" : "store",
  text: String(message?.text || ""),
  chatMessageId: message?.id || null,
  chips: !isHistory && message?.from !== "SHOPPER" ? [REPLY_TO_TEAM] : undefined,
});

// ─── Quick actions (B0: the store's chips) ────────────────────────────────

/**
 * The chips under the welcome: the store's own (`{ label, question }`,
 * tapping asks `question`) once its answers are on, else these; "Talk to
 * us" is added when the store takes messages and has none.
 */
export const getQuickActions = (config) => {
  const own =
    config?.answersEnabled && Array.isArray(config.chips)
      ? config.chips
          .filter((chip) => chip?.label && chip?.question)
          .map((chip) => ({ label: chip.label, question: chip.question }))
      : [];
  const actions = own.length
    ? own
    : QUICK_ACTIONS.filter((label) => label !== TALK_TO_US).map((label) => ({
        label,
        question: label,
      }));
  const messaging = config ? !!config.messagingEnabled : true;
  const hasTalk = actions.some(
    (action) => matchAssistantIntent(action.question).intent === Intent.TALK_TO_US,
  );
  if (messaging && !hasTalk) {
    actions.push({ label: TALK_TO_US, question: TALK_TO_US });
  }
  return actions;
};

// ─── The team's hours (B0.1, D17) ─────────────────────────────────────────

/** The store's time zone, for "Back Mon, 10:00 am". */
export const TEAM_TIME_ZONE = "Asia/Kolkata";

/**
 * When the team is back, in the shopper's words ("Mon, 23 Nov, 10:00 am"),
 * or "" for a missing or unreadable date.
 */
export const formatTeamBackAt = (iso, locale = undefined) => {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      timeZone: TEAM_TIME_ZONE,
    }).format(date);
  } catch {
    return "";
  }
};

/**
 * The lines near the message box: the store's reply time and, while the
 * team is out (`isOpen: false`), its away message and when it is back.
 * Shoppers can message either way. Empty texts are left out.
 */
export const getTeamStatusLines = (status, locale = undefined) => {
  const lines = [];
  const replyTime = String(status?.replyTime || "").trim();
  if (status && status.isOpen === false) {
    const away = String(status.awayMessage || "").trim();
    if (away) lines.push(away);
    const back = formatTeamBackAt(status.nextOpenAt, locale);
    if (back) lines.push(ASSISTANT_COPY.teamBack(back));
  }
  if (replyTime) lines.push(replyTime);
  return lines;
};

/** The store's welcome once its answers are on, else ours. */
export const getWelcomeText = (config) =>
  (config?.answersEnabled && String(config.welcome || "").trim()) ||
  ASSISTANT_COPY.welcome;

// ─── Entry point ──────────────────────────────────────────────────────────

/** The scripted answer to a matched intent (live data or our own copy). */
async function getScriptedReply(match, context) {
  const { isLoggedIn, loaders, chat } = context;
  switch (match.intent) {
    case Intent.TALK_TO_US:
      return startTalkToUs(chat);
    case Intent.NAVIGATE:
      return match.action === AssistantActionEnum.OPEN_BAG
        ? reply(Intent.NAVIGATE, ASSISTANT_COPY.openBag, {
            action: { type: AssistantActionEnum.OPEN_BAG },
          })
        : reply(Intent.NAVIGATE, navigateText(match.label), {
            action: { type: AssistantActionEnum.NAVIGATE, href: match.href },
          });
    case Intent.ORDERS:
      return replyWithOrders(isLoggedIn, loaders);
    case Intent.EXCHANGES:
      return reply(Intent.EXCHANGES, ASSISTANT_COPY.exchanges, {
        links: [POLICY_LINK],
        chips: [TALK_TO_US, "Track my order"],
      });
    case Intent.PAYMENT:
      return reply(Intent.PAYMENT, ASSISTANT_COPY.payment, {
        chips: ["Delivery", "Offers"],
      });
    case Intent.NEW_ARRIVALS:
      return replyWithNewArrivals(loaders);
    case Intent.DELIVERY:
      return reply(Intent.DELIVERY, ASSISTANT_COPY.delivery, {
        links: [POLICY_LINK],
        chips: ["Exchanges", "Track my order", TALK_TO_US],
      });
    case Intent.OFFERS:
      return replyWithOffers(loaders);
    case Intent.SIZING:
      return reply(Intent.SIZING, ASSISTANT_COPY.sizing, {
        chips: ["New arrivals", TALK_TO_US],
      });
    case Intent.CONTACT:
      return contactReply(chat);
    case Intent.COLLECTIONS:
      return replyWithCollections(loaders);
    case Intent.THANKS:
      return reply(Intent.THANKS, ASSISTANT_COPY.thanks, {
        chips: ["New arrivals", TALK_TO_US],
      });
    case Intent.GREETING:
      return reply(Intent.GREETING, ASSISTANT_COPY.greeting, {
        chips: QUICK_ACTIONS,
      });
    case Intent.PRODUCTS:
      return replyWithProducts(match, loaders);
    default:
      return reply(Intent.FALLBACK, ASSISTANT_COPY.fallback, {
        chips: QUICK_ACTIONS,
      });
  }
}

/**
 * FR-23 (B0): the reply to `text`.
 *
 * `context`:
 * - `chatFlow`: the running "Talk to us" flow, or null;
 * - `isLoggedIn`: whether a customer session may exist (orders);
 * - `chat`: the store chat's state (`messagingEnabled`, `signedIn`,
 *   `signInPrompt`, `returnPath`), from the kit's `useStoreChat`;
 * - `loaders`: `searchProducts(term, { newest })` → `{ products,
 *   totalCount }`, `getCollections()` → categories, `getOffers()` →
 *   promotions, `getMyOrders()` → orders, or null for a guest;
 *   `askStore(text)` → the kit's `StoreChatAnswer` (with `offerPerson`
 *   on every answer while the store takes messages, B0.1).
 *
 * A data loader that fails rejects the reply; the caller shows the error.
 * The FAQs failing never does: the scripted answers stand in.
 */
export async function getAssistantReply(text, context = {}) {
  const {
    chatFlow = null,
    isLoggedIn = false,
    chat = null,
    loaders = {},
  } = context;
  const scriptedContext = { isLoggedIn, loaders, chat };

  if (chatFlow) return advanceTalkToUs(chatFlow, text, chat);

  const match = matchAssistantIntent(text);
  const answer = asksStoreFirst(match.intent)
    ? await askStore(text, loaders)
    : null;
  const question = String(text || "").trim();
  if (
    answer?.answersEnabled &&
    answer.matched &&
    String(answer.answer || "").trim()
  ) {
    return { ...toStoreAnswerReply(answer, chat), question };
  }

  // The FAQs missed (or are off): our own answer, if we have one
  let result = await getScriptedReply(match, scriptedContext);
  const foundNothing =
    match.intent === Intent.FALLBACK ||
    (match.intent === Intent.PRODUCTS && result.resultCount === 0);
  if (answer && foundNothing) {
    result = toMissedReply(
      answer.answersEnabled ? answer : { ...answer, suggestions: [] },
      chat,
      match.intent === Intent.FALLBACK ? null : result,
    );
  } else if (answer?.offerPerson && readChat(chat).messagingEnabled) {
    // B0.1: "Talk to us" under our own answer, not twice in its chips
    result = {
      ...result,
      offerPerson: true,
      chips: result.chips?.filter((chip) => chip !== TALK_TO_US),
    };
  }
  return answer ? { ...result, question } : result;
}
