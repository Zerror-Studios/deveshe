/**
 * Shopping assistant replies (DD-PRD-001 FR-13, FR-23..FR-26)
 *
 * Scripted answers on the store's own data (D1): keyword rules pick one
 * intent per message, checked in a fixed order. The delivery and exchange
 * answers quote `/shipping-returns`, so when a policy changes, change both.
 * Data comes from loaders the caller passes in (the assistant's Apollo
 * reads), so this file has no browser or Apollo import and `node:test`
 * loads it. `getAssistantReply(text, context)` is the one entry point an
 * AI transport can replace later (PRD §2).
 *
 * A reply is `{ intent, text, contactFlow, products?, links?, chips?,
 * orders?, offers?, action?, searchTerm?, resultCount?, speech? }`; `speech`
 * replaces `text` when read aloud (no contact details). Links are internal
 * paths only, and prices stay the server's.
 */

import {
  formatMoney,
  getShipmentStatusLabel,
} from "@zcom/storefront-kit/core";
import {
  formatOrderDate,
  getOrderStatusLabel,
} from "@/utils/order-detail.util";
import { getLoginPath } from "@/utils/redirect.util";
import { contactSchema } from "@/validations/ContactValidation";

// ─── Vocabulary ───────────────────────────────────────────────────────────

export const AssistantIntentEnum = {
  LEAVE_MESSAGE: "LEAVE_MESSAGE",
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
  FALLBACK: "FALLBACK",
};

export const AssistantActionEnum = {
  NAVIGATE: "navigate",
  OPEN_BAG: "open-bag",
  SEND_CONTACT: "send-contact",
};

export const ContactStepEnum = {
  NAME: "name",
  EMAIL: "email",
  PHONE: "phoneNumber",
  SUBJECT: "subject",
  MESSAGE: "message",
  CONFIRM: "confirm",
};

const Intent = AssistantIntentEnum;
const Step = ContactStepEnum;

// ─── Copy (the owner reviews it, Q1) ──────────────────────────────────────

/** As on `/contact`. */
export const ASSISTANT_SUPPORT_EMAIL = "deveshedreams@gmail.com";

/** FR-13: the chips under the welcome message. */
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
  contact: `You can email the team at ${ASSISTANT_SUPPORT_EMAIL}, use the form on the contact page, or leave a message right here and I'll pass it on.`,
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
  contactStart: "Sure, I'll pass a message to the team.",
  contactSent:
    "Thanks! Your message is with the team, and they'll get back to you soon.",
  contactCancelled: "No problem, I haven't sent anything.",
  contactConfirm: "Send it to the team?",
  contactConfirmHelp: "Tap Send to pass it on, Edit to change it, or Cancel.",
  contactAgain: "Let's go again.",
  networkError: "I couldn't reach the store just now. Please try again.",
};

const productsFoundText = (term) => `Here's what I found for "${term}":`;
const productsNoneText = (term) =>
  `I couldn't find "${term}". Try another word, or browse a collection:`;
const navigateText = (label) => `Taking you to ${label}.`;

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

const LEAVE_MESSAGE_PATTERN =
  /\b(leave (a |me a |the team a )?(message|note)|send (a |the team a )?message|message the team|write to (you|the team)|drop (a |us a )?(line|note))\b/;

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
    /\b(contact|talk to|speak to|speak with|human|real person|agent|support|customer care|customer service|email|e-mail|phone number|call you|whatsapp|complain|complaint|collab|collaboration|collaborate|wholesale|bulk order)\b/,
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
  if (LEAVE_MESSAGE_PATTERN.test(said)) return { intent: Intent.LEAVE_MESSAGE };

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
  contactFlow: null,
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

// ─── Leave a message (FR-24) ──────────────────────────────────────────────

const CONTACT_STEPS = [
  Step.NAME,
  Step.EMAIL,
  Step.PHONE,
  Step.SUBJECT,
  Step.MESSAGE,
];

const CONTACT_QUESTIONS = {
  [Step.NAME]: "What's your name?",
  [Step.EMAIL]: "What's your email, so the team can reply?",
  [Step.PHONE]: "And your phone number? 10 digits, please.",
  [Step.SUBJECT]: "What's it about? A few words is enough.",
  [Step.MESSAGE]: "Go ahead: what would you like to tell the team?",
};

const CONTACT_STEP_ERRORS = {
  [Step.NAME]: "Could you tell me your name?",
  [Step.EMAIL]: "That email doesn't look right. Could you check it?",
  [Step.PHONE]: "Please send a 10-digit phone number.",
  [Step.SUBJECT]: "A few words about the topic, please.",
  [Step.MESSAGE]: "Could you write a little more? At least 5 characters.",
};

const CONTACT_SUBJECT_CHIPS = [
  "My order",
  "Sizing",
  "An exchange",
  "A collaboration",
];
const CONTACT_CONFIRM_CHIPS = ["Send", "Edit", "Cancel"];

const CANCEL_PATTERN =
  /^(cancel|stop|never ?mind|exit|quit|forget it|no thanks|don't send( it)?)$/;
const SEND_PATTERN = /^(send( it)?|yes|yep|yeah|ok|okay|sure|confirm|go ahead)$/;
const EDIT_PATTERN = /^(edit|change( it)?|no|start (over|again))$/;

/** Questions that leave the flow instead of being taken as an answer. */
const LEAVING_INTENTS = new Set([
  Intent.NAVIGATE,
  Intent.ORDERS,
  Intent.EXCHANGES,
  Intent.PAYMENT,
  Intent.NEW_ARRIVALS,
  Intent.DELIVERY,
  Intent.OFFERS,
  Intent.SIZING,
  Intent.COLLECTIONS,
]);
/** The steps where such a question can arrive (not the topic or message). */
const LEAVABLE_STEPS = new Set([Step.NAME, Step.EMAIL, Step.PHONE]);

const emptyContactValues = () => ({
  name: "",
  email: "",
  phoneNumber: "",
  subject: "",
  message: "",
});

/** One answer checked with the contact form's own rule. */
const checkContactAnswer = (step, answer) => {
  const result = contactSchema.shape[step].safeParse(String(answer || "").trim());
  return result.success ? { ok: true, value: result.data } : { ok: false };
};

const getNextContactStep = (values) =>
  CONTACT_STEPS.find((step) => !values[step]) || Step.CONFIRM;

const isLeavingQuestion = (answer) =>
  LEAVING_INTENTS.has(matchAssistantIntent(answer).intent);

/** FR-24: the message as the shopper will send it. */
export const summariseContact = (values) =>
  [
    "Here's your message:",
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    `Phone: ${values.phoneNumber}`,
    `Topic: ${values.subject}`,
    `Message: ${values.message}`,
    "",
    ASSISTANT_COPY.contactConfirm,
  ].join("\n");

/**
 * A flow step. `speech` is what is read aloud (D10): never the shopper's
 * name, email or phone, so no contact details reach the voice service.
 */
const askContactStep = (flow, lead = "", speechLead = "") => {
  if (flow.step === Step.CONFIRM) {
    return reply(Intent.LEAVE_MESSAGE, summariseContact(flow.values), {
      contactFlow: flow,
      chips: CONTACT_CONFIRM_CHIPS,
      speech: `Here's your message. ${ASSISTANT_COPY.contactConfirm}`,
    });
  }
  const question = CONTACT_QUESTIONS[flow.step];
  return reply(Intent.LEAVE_MESSAGE, lead ? `${lead} ${question}` : question, {
    contactFlow: flow,
    chips: flow.step === Step.SUBJECT ? CONTACT_SUBJECT_CHIPS : ["Cancel"],
    speech: speechLead ? `${speechLead} ${question}` : question,
  });
};

/**
 * FR-24: starts "leave a message". A signed-in shopper's name and email
 * come from the profile; they can change them with Edit before sending.
 */
export const startContactFlow = (profile) => {
  const values = emptyContactValues();
  const name = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (name && checkContactAnswer(Step.NAME, name).ok) values.name = name;
  const email = String(profile?.email || "").trim();
  if (email && checkContactAnswer(Step.EMAIL, email).ok) values.email = email;
  const lead =
    values.name && values.email
      ? `${ASSISTANT_COPY.contactStart} I'll send it as ${values.name} (${values.email}); you can change that before it goes.`
      : ASSISTANT_COPY.contactStart;
  return askContactStep(
    { step: getNextContactStep(values), values },
    lead,
    ASSISTANT_COPY.contactStart,
  );
};

/**
 * FR-24: the flow's reply to `text`, or `null` when the shopper asked
 * something else (the caller answers that instead, and the flow ends).
 */
export const advanceContactFlow = (flow, text) => {
  const answer = String(text || "").trim();
  const said = normalise(answer);
  if (CANCEL_PATTERN.test(said)) {
    return reply(Intent.LEAVE_MESSAGE, ASSISTANT_COPY.contactCancelled, {
      chips: QUICK_ACTIONS,
    });
  }

  if (flow.step === Step.CONFIRM) {
    if (SEND_PATTERN.test(said)) {
      const parsed = contactSchema.safeParse(flow.values);
      if (parsed.success) {
        return reply(Intent.LEAVE_MESSAGE, "", {
          contactFlow: flow,
          action: { type: AssistantActionEnum.SEND_CONTACT, input: parsed.data },
        });
      }
    }
    // Edit starts again; so does a Send that doesn't validate (it can't
    // happen, every answer was checked, but it never sends a bad message)
    if (EDIT_PATTERN.test(said) || SEND_PATTERN.test(said)) {
      return askContactStep(
        { step: Step.NAME, values: emptyContactValues() },
        ASSISTANT_COPY.contactAgain,
      );
    }
    if (isLeavingQuestion(answer)) return null;
    return reply(Intent.LEAVE_MESSAGE, ASSISTANT_COPY.contactConfirmHelp, {
      contactFlow: flow,
      chips: CONTACT_CONFIRM_CHIPS,
    });
  }

  const step = flow.step;
  const leavable = LEAVABLE_STEPS.has(step);
  const checked = checkContactAnswer(step, answer);
  if (!checked.ok) {
    if (leavable && isLeavingQuestion(answer)) return null;
    return reply(Intent.LEAVE_MESSAGE, CONTACT_STEP_ERRORS[step], {
      contactFlow: flow,
      chips: ["Cancel"],
    });
  }
  // A name passes any check, so a question there is caught here
  if (step === Step.NAME && isLeavingQuestion(answer)) return null;

  const values = { ...flow.values, [step]: checked.value };
  const lead =
    step === Step.NAME ? `Thanks, ${checked.value.split(" ")[0]}.` : "";
  return askContactStep({ step: getNextContactStep(values), values }, lead);
};

/** FR-24: after `submitContactForm` saved the message. */
export const getContactSentReply = () =>
  reply(Intent.LEAVE_MESSAGE, ASSISTANT_COPY.contactSent, {
    chips: ["New arrivals", "Track my order"],
  });

// ─── Entry point ──────────────────────────────────────────────────────────

/**
 * FR-23: the reply to `text`.
 *
 * `context`:
 * - `contactFlow`: the running "leave a message" flow, or null;
 * - `profile`: the signed-in shopper's profile (name and email), or null;
 * - `isLoggedIn`: whether a customer session may exist (orders);
 * - `loaders`: `searchProducts(term, { newest })` → `{ products,
 *   totalCount }`, `getCollections()` → categories, `getOffers()` →
 *   promotions, `getMyOrders()` → orders, or null for a guest.
 *
 * A loader that fails rejects the reply; the caller shows the error.
 */
export async function getAssistantReply(text, context = {}) {
  const {
    contactFlow = null,
    profile = null,
    isLoggedIn = false,
    loaders = {},
  } = context;

  if (contactFlow) {
    const next = advanceContactFlow(contactFlow, text);
    if (next) return next;
  }

  const match = matchAssistantIntent(text);
  switch (match.intent) {
    case Intent.LEAVE_MESSAGE:
      return startContactFlow(profile);
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
        chips: ["Leave a message", "Track my order"],
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
        chips: ["Exchanges", "Track my order", "Talk to us"],
      });
    case Intent.OFFERS:
      return replyWithOffers(loaders);
    case Intent.SIZING:
      return reply(Intent.SIZING, ASSISTANT_COPY.sizing, {
        chips: ["New arrivals", "Leave a message"],
      });
    case Intent.CONTACT:
      return reply(Intent.CONTACT, ASSISTANT_COPY.contact, {
        links: [CONTACT_LINK],
        chips: ["Leave a message"],
      });
    case Intent.COLLECTIONS:
      return replyWithCollections(loaders);
    case Intent.THANKS:
      return reply(Intent.THANKS, ASSISTANT_COPY.thanks, {
        chips: ["New arrivals", "Talk to us"],
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
