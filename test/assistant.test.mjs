/**
 * Shopping assistant (DD-PRD-001): the reply rules, the store's own
 * answers and "Talk to us" (backend PRD-049 B0), the route rule, the
 * dictation and voice helpers and the motion maths.
 *
 * The replies run on fake loaders: no network, no Apollo, no browser.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

const replies = await import("@/utils/assistant-replies.util");
const speech = await import("@/utils/assistant-dictation.util");
const visuals = await import("@/utils/assistant-gradient.util");
const constants = await import("@/components/assistant/assistant.constants");

const { AssistantIntentEnum: Intent, AssistantActionEnum: Action } = replies;

// ─── Helpers ──────────────────────────────────────────────────────────────

const product = (id, name = `Piece ${id}`) => ({
  _id: id,
  name,
  slug: `piece-${id}`,
  variants: [{ _id: `v${id}`, sku: `SKU-${id}`, price: 2999 }],
  assets: [],
});

/** Loaders that answer from fixed data and record every call. */
const fakeLoaders = ({
  products = {},
  collections = [],
  offers = [],
  orders = [],
} = {}) => {
  const calls = [];
  return {
    calls,
    searchProducts: async (term, options = {}) => {
      calls.push(["searchProducts", term, options]);
      const found = products[term] || [];
      return { products: found, totalCount: found.length };
    },
    getCollections: async () => {
      calls.push(["getCollections"]);
      return collections;
    },
    getOffers: async () => {
      calls.push(["getOffers"]);
      return offers;
    },
    getMyOrders: async () => {
      calls.push(["getMyOrders"]);
      return orders;
    },
  };
};

// ─── Routes (D2) ──────────────────────────────────────────────────────────

describe("isAssistantHiddenPath", () => {
  it("hides the assistant on checkout, payment links and order status", () => {
    for (const path of [
      "/checkout",
      "/checkout/thank-you",
      "/checkout/start",
      "/pay/abc123",
      "/orders/status/token",
    ]) {
      assert.equal(constants.isAssistantHiddenPath(path), true, path);
    }
  });

  it("shows it everywhere else", () => {
    for (const path of [
      "/",
      "/shop",
      "/product/red-dress",
      "/checkouts",
      "/payments",
      "/orders",
      "/profile/orders/1",
      undefined,
    ]) {
      assert.equal(constants.isAssistantHiddenPath(path), false, path);
    }
  });
});

// ─── Matching (FR-23) ─────────────────────────────────────────────────────

describe("matchAssistantIntent", () => {
  it("maps every quick action to its intent", () => {
    const expected = {
      "New arrivals": Intent.NEW_ARRIVALS,
      Delivery: Intent.DELIVERY,
      Exchanges: Intent.EXCHANGES,
      "Track my order": Intent.ORDERS,
      Offers: Intent.OFFERS,
      "Talk to us": Intent.TALK_TO_US,
    };
    assert.deepEqual(Object.keys(expected), replies.QUICK_ACTIONS);
    for (const [label, intent] of Object.entries(expected)) {
      assert.equal(replies.matchAssistantIntent(label).intent, intent, label);
    }
  });

  it("reads common questions", () => {
    const cases = [
      ["Where is my order?", Intent.ORDERS],
      ["has my parcel shipped yet", Intent.ORDERS],
      ["I got the wrong size", Intent.EXCHANGES],
      ["can I get a refund", Intent.EXCHANGES],
      ["Do you ship to the UK?", Intent.DELIVERY],
      ["how long does delivery take", Intent.DELIVERY],
      ["Is cash on delivery available?", Intent.PAYMENT],
      ["any coupon codes?", Intent.OFFERS],
      ["what size should I get", Intent.SIZING],
      ["what do you sell", Intent.COLLECTIONS],
      ["I want to talk to a human", Intent.TALK_TO_US],
      ["Leave a message", Intent.TALK_TO_US],
      ["Reply to the team", Intent.TALK_TO_US],
      ["what's your email address", Intent.CONTACT],
      ["new arrival", Intent.NEW_ARRIVALS],
      ["hi", Intent.GREETING],
      ["Hello there!", Intent.GREETING],
      ["thanks!", Intent.THANKS],
    ];
    for (const [text, intent] of cases) {
      assert.equal(replies.matchAssistantIntent(text).intent, intent, text);
    }
  });

  it("navigates only on a command or a page name", () => {
    assert.deepEqual(replies.matchAssistantIntent("Take me to the lookbook"), {
      intent: Intent.NAVIGATE,
      label: "the lookbook",
      href: "/lookbook",
    });
    assert.equal(
      replies.matchAssistantIntent("open my bag").action,
      Action.OPEN_BAG,
    );
    assert.equal(replies.matchAssistantIntent("go home").href, "/");
    assert.equal(replies.matchAssistantIntent("lookbook").href, "/lookbook");
    // "go" without a page after it is not a command
    assert.equal(
      replies.matchAssistantIntent("can I return it if it doesn't go with my outfit")
        .intent,
      Intent.EXCHANGES,
    );
  });

  it("searches for products with the product words only", () => {
    assert.deepEqual(replies.matchAssistantIntent("show me red dresses"), {
      intent: Intent.PRODUCTS,
      term: "red dresses",
      newest: false,
    });
    assert.equal(
      replies.matchAssistantIntent("Do you have any co-ord sets?").term,
      "co-ord sets",
    );
    assert.equal(
      replies.matchAssistantIntent("I'm looking for a black kurta please").term,
      "black kurta",
    );
    assert.equal(replies.matchAssistantIntent("new dresses").newest, true);
    assert.deepEqual(replies.matchAssistantIntent("show me something"), {
      intent: Intent.PRODUCTS,
      term: "",
      newest: true,
    });
  });

  it("falls back for long chat and empty input", () => {
    assert.equal(
      replies.matchAssistantIntent(
        "my sister said this brand is lovely and she told me to say hello",
      ).intent,
      Intent.FALLBACK,
    );
    assert.equal(replies.matchAssistantIntent("   ").intent, Intent.FALLBACK);
    assert.equal(replies.matchAssistantIntent("?!").intent, Intent.FALLBACK);
  });
});

// ─── Replies ──────────────────────────────────────────────────────────────

describe("getAssistantReply", () => {
  it("answers the policies from the shipping and returns page", async () => {
    const delivery = await replies.getAssistantReply("delivery");
    assert.match(delivery.text, /free across India/);
    assert.match(delivery.text, /made to order/);
    assert.deepEqual(delivery.links, [
      { label: "Shipping & returns", href: "/shipping-returns" },
    ]);
    const exchanges = await replies.getAssistantReply("exchanges");
    assert.match(exchanges.text, /don't give refunds/);
    assert.match(exchanges.text, /deveshedreams@gmail\.com/);
    assert.equal(exchanges.chatFlow, null);
  });

  it("shows up to 4 products and the search link", async () => {
    const found = [1, 2, 3, 4, 5].map((id) => product(id));
    const loaders = fakeLoaders({ products: { "red dresses": found } });
    const answer = await replies.getAssistantReply("show me red dresses", {
      loaders,
    });
    assert.equal(answer.intent, Intent.PRODUCTS);
    assert.equal(answer.products.length, 4);
    assert.equal(answer.searchTerm, "red dresses");
    assert.equal(answer.resultCount, 5);
    assert.deepEqual(answer.links, [
      { label: "See all results", href: "/search?q=red%20dresses" },
    ]);
  });

  it("retries with the last word, then offers the collections", async () => {
    const loaders = fakeLoaders({
      products: { dress: [product(7)] },
      collections: [{ name: "Dresses", slug: "dresses" }, { name: "No slug" }],
    });
    const retried = await replies.getAssistantReply("flowy summer dress", {
      loaders,
    });
    assert.deepEqual(
      loaders.calls.map((call) => call[1]),
      ["flowy summer dress", "dress"],
    );
    assert.match(retried.text, /"dress"/);

    const none = await replies.getAssistantReply("velvet capes", { loaders });
    assert.equal(none.resultCount, 0);
    assert.deepEqual(none.links, [
      { label: "Dresses", href: "/shop/dresses" },
      { label: "Browse the shop", href: "/shop" },
    ]);
  });

  it("shows the newest pieces for new arrivals", async () => {
    const loaders = fakeLoaders({ products: { "": [product(1), product(2)] } });
    const answer = await replies.getAssistantReply("New arrivals", { loaders });
    assert.equal(answer.products.length, 2);
    assert.deepEqual(loaders.calls[0], ["searchProducts", "", { newest: true }]);
  });

  it("asks guests to sign in instead of looking orders up", async () => {
    const loaders = fakeLoaders();
    const answer = await replies.getAssistantReply("track my order", {
      loaders,
      isLoggedIn: false,
    });
    assert.equal(loaders.calls.length, 0);
    assert.deepEqual(answer.links, [
      { label: "Sign in", href: "/login?next=%2Fprofile" },
    ]);
  });

  it("lists a signed-in shopper's latest orders", async () => {
    const loaders = fakeLoaders({
      orders: [
        {
          _id: "o1",
          orderNo: "1042",
          displayStatus: "SHIPPED",
          trackingStatus: null,
          createdAt: "2026-11-02T10:00:00.000Z",
        },
      ],
    });
    const answer = await replies.getAssistantReply("where is my order", {
      loaders,
      isLoggedIn: true,
    });
    assert.equal(answer.orders.length, 1);
    assert.equal(answer.orders[0].title, "Order #1042");
    assert.equal(answer.orders[0].href, "/profile/orders/o1");
    assert.match(answer.orders[0].meta, /Shipped/);
    assert.match(answer.orders[0].meta, /2026/);
  });

  it("treats a refused order read as a guest", async () => {
    const loaders = fakeLoaders();
    loaders.getMyOrders = async () => null;
    const answer = await replies.getAssistantReply("my orders", {
      loaders,
      isLoggedIn: true,
    });
    assert.equal(answer.text, replies.ASSISTANT_COPY.ordersGuest);
  });

  it("describes offers from the server's values", async () => {
    const loaders = fakeLoaders({
      offers: [
        {
          promotionCode: "FESTIVE10",
          promotionName: "Festive 10",
          promotionType: "PERCENTAGE",
          discount: 10,
          minimumSubtotal: 1999,
          endDate: null,
        },
        { promotionCode: "" },
        null,
      ],
    });
    const answer = await replies.getAssistantReply("offers", { loaders });
    assert.equal(answer.offers.length, 1);
    assert.equal(answer.offers[0].code, "FESTIVE10");
    assert.match(answer.offers[0].detail, /^10% off, on orders over .*1,999/);

    const empty = await replies.getAssistantReply("offers", {
      loaders: fakeLoaders(),
    });
    assert.equal(empty.text, replies.ASSISTANT_COPY.offersNone);
  });

  it("returns navigation and bag actions", async () => {
    const lookbook = await replies.getAssistantReply("take me to the lookbook");
    assert.deepEqual(lookbook.action, {
      type: Action.NAVIGATE,
      href: "/lookbook",
    });
    const bag = await replies.getAssistantReply("open my bag");
    assert.deepEqual(bag.action, { type: Action.OPEN_BAG });
  });

  it("lets a failing loader reject, so the caller shows the error", async () => {
    const loaders = fakeLoaders();
    loaders.searchProducts = async () => {
      throw new Error("offline");
    };
    await assert.rejects(
      replies.getAssistantReply("red dress", { loaders }),
      /offline/,
    );
  });

  it("takes between 0.5 s and 1.6 s to reveal a reply", () => {
    assert.equal(replies.getRevealDuration("hi"), 500);
    assert.equal(replies.getRevealDuration("x".repeat(500)), 1600);
  });
});

// ─── The store's answers (backend PRD-049 B0) ─────────────────────────────

/** A kit `StoreChatAnswer`. */
const storeAnswer = (overrides = {}) => ({
  answersEnabled: true,
  matched: false,
  faqId: null,
  question: null,
  answer: null,
  links: [],
  suggestions: [],
  offerPerson: false,
  ...overrides,
});

/** Loaders with `askStore` answering `answer` (or throwing it). */
const storeLoaders = (answer, data = {}) => {
  const loaders = fakeLoaders(data);
  loaders.askStore = async (text) => {
    loaders.calls.push(["askStore", text]);
    if (answer instanceof Error) throw answer;
    return typeof answer === "function" ? answer(text) : answer;
  };
  return loaders;
};

const signedIn = {
  messagingEnabled: true,
  signedIn: true,
  signInPrompt: "Sign in to message us.",
  returnPath: "/shop?q=red",
};
const guest = { ...signedIn, signedIn: false };

describe("the store's answers", () => {
  it("uses the store's FAQ answer when it matches", async () => {
    const loaders = storeLoaders(
      storeAnswer({
        matched: true,
        faqId: "f1",
        answer: "We dispatch in 3 days.",
        offerPerson: true,
        links: [
          { label: "Shipping", url: "/shipping-returns" },
          { label: "Courier", url: "https://courier.example/track" },
          { label: "Bad", url: "javascript:alert(1)" },
        ],
      }),
    );
    const answer = await replies.getAssistantReply("how long does delivery take", {
      loaders,
      chat: signedIn,
    });
    assert.equal(answer.intent, Intent.FAQ);
    assert.equal(answer.text, "We dispatch in 3 days.");
    assert.deepEqual(answer.links, [
      { label: "Shipping", href: "/shipping-returns" },
      { label: "Courier", href: "https://courier.example/track", external: true },
    ]);
    // B0.1: "Talk to us" under the answer, with the question to start it
    assert.equal(answer.offerPerson, true);
    assert.equal(answer.question, "how long does delivery take");
    assert.equal(answer.chips.includes(replies.TALK_TO_US), false);
    assert.deepEqual(loaders.calls, [["askStore", "how long does delivery take"]]);
  });

  it("falls back to the scripted answers when the FAQs are off or unreachable", async () => {
    for (const failing of [
      storeAnswer({ answersEnabled: false }),
      new Error("offline"),
    ]) {
      const loaders = storeLoaders(failing);
      const answer = await replies.getAssistantReply("delivery", { loaders });
      assert.equal(answer.intent, Intent.DELIVERY);
      assert.match(answer.text, /free across India/);
      assert.equal(answer.missed, undefined);
      assert.equal(answer.offerPerson, undefined);
    }
  });

  it("keeps the scripted answer when an FAQ misses but we know the topic", async () => {
    const loaders = storeLoaders(storeAnswer());
    const answer = await replies.getAssistantReply("I got the wrong size", {
      loaders,
    });
    assert.equal(answer.intent, Intent.EXCHANGES);
  });

  it("answers live-data questions before asking the FAQs", async () => {
    const loaders = storeLoaders(storeAnswer({ matched: true, answer: "FAQ" }), {
      products: { "": [product(1)] },
    });
    for (const text of ["track my order", "New arrivals", "offers", "hi", "take me to the lookbook"]) {
      const answer = await replies.getAssistantReply(text, { loaders });
      assert.notEqual(answer.intent, Intent.FAQ, text);
    }
    assert.equal(loaders.calls.filter((call) => call[0] === "askStore").length, 0);
  });

  it("asks the FAQs before searching products, and searches when they miss", async () => {
    const faq = storeLoaders(storeAnswer({ matched: true, answer: "Yes, gift cards from ₹1,000." }));
    const giftCards = await replies.getAssistantReply("do you have gift cards", {
      loaders: faq,
    });
    assert.equal(giftCards.intent, Intent.FAQ);
    assert.equal(faq.calls.some((call) => call[0] === "searchProducts"), false);

    const search = storeLoaders(storeAnswer(), {
      products: { "red dresses": [product(1)] },
    });
    const found = await replies.getAssistantReply("show me red dresses", {
      loaders: search,
    });
    assert.equal(found.intent, Intent.PRODUCTS);
    assert.equal(found.products.length, 1);
  });

  it("is a miss only when nothing answered, with Did you mean chips", async () => {
    const loaders = storeLoaders(
      storeAnswer({ suggestions: [{ id: "f2", question: "Do you gift wrap?" }] }),
    );
    const answer = await replies.getAssistantReply(
      "my sister said this brand is lovely and she told me to say hello",
      { loaders, chat: signedIn },
    );
    assert.equal(answer.missed, true);
    assert.match(answer.text, /^I don't have an answer for that yet\. Did you mean/);
    assert.deepEqual(answer.chips, ["Do you gift wrap?"]);
    assert.equal(answer.messageTeam, false);
  });

  it("ends a miss with Message the team (B0.1 offerPerson), only with messaging on", async () => {
    const missed = storeAnswer({ offerPerson: true });
    const withChat = await replies.getAssistantReply("??? qwerty zxcv", {
      loaders: storeLoaders(missed),
      chat: signedIn,
    });
    assert.match(withChat.text, /message the team/);
    assert.equal(withChat.messageTeam, true);
    assert.equal(withChat.question, "??? qwerty zxcv");
    assert.deepEqual(withChat.chips, []);

    const noProducts = await replies.getAssistantReply("velvet capes", {
      loaders: storeLoaders(missed),
      chat: signedIn,
    });
    assert.match(noProducts.text, /^I couldn't find "velvet capes"\. Would you like/);
    assert.ok(noProducts.links.length > 0);

    const off = await replies.getAssistantReply("??? qwerty zxcv", {
      loaders: storeLoaders(missed),
      chat: { ...signedIn, messagingEnabled: false },
    });
    assert.equal(off.chips.includes(replies.TALK_TO_US), false);
    assert.equal(off.messageTeam, undefined);

    // FAQs off: the backend still offers a person, so no dead end
    const answersOff = await replies.getAssistantReply("??? qwerty zxcv", {
      loaders: storeLoaders(
        storeAnswer({
          answersEnabled: false,
          offerPerson: true,
          suggestions: [{ id: "f9", question: "Hidden FAQ" }],
        }),
      ),
      chat: signedIn,
    });
    assert.equal(answersOff.messageTeam, true);
    assert.deepEqual(answersOff.chips, []);
  });

  it("puts Talk to us under our own answer when the FAQs offer a person (B0.1)", async () => {
    const answer = await replies.getAssistantReply("delivery", {
      loaders: storeLoaders(storeAnswer({ offerPerson: true })),
      chat: signedIn,
    });
    assert.equal(answer.intent, Intent.DELIVERY);
    assert.equal(answer.offerPerson, true);
    assert.equal(answer.question, "delivery");
    // Not twice: the chip goes
    assert.deepEqual(answer.chips, ["Exchanges", "Track my order"]);
  });

  it("uses the store's welcome and quick buttons once its answers are on", () => {
    const config = {
      answersEnabled: true,
      messagingEnabled: true,
      welcome: "Welcome to DeVeShe!",
      chips: [{ label: "Delivery", question: "How long does delivery take?" }],
    };
    assert.equal(replies.getWelcomeText(config), "Welcome to DeVeShe!");
    assert.deepEqual(replies.getQuickActions(config), [
      { label: "Delivery", question: "How long does delivery take?" },
      { label: "Talk to us", question: "Talk to us" },
    ]);
    // Answers off, or no config: our own copy and chips
    const off = { ...config, answersEnabled: false };
    assert.equal(replies.getWelcomeText(off), replies.ASSISTANT_COPY.welcome);
    assert.deepEqual(
      replies.getQuickActions(null).map((action) => action.label),
      replies.QUICK_ACTIONS,
    );
    assert.equal(
      replies
        .getQuickActions({ ...off, messagingEnabled: false })
        .some((action) => action.label === "Talk to us"),
      false,
    );
  });
});

// ─── Talk to us (backend PRD-049 B0, D15) ─────────────────────────────────

describe("talk to us", () => {
  it("asks a guest to sign in and come back to the open chat", async () => {
    const answer = await replies.getAssistantReply("Talk to us", { chat: guest });
    assert.equal(answer.text, "Sign in to message us.");
    assert.deepEqual(answer.links, [
      {
        label: "Sign in",
        href: `/login?next=${encodeURIComponent("/shop?q=red&chat=open")}`,
      },
    ]);
    assert.equal(answer.chatFlow, null);
    assert.equal(answer.handoff, true);
  });

  it("lets a signed-in shopper type a message, then sends it", async () => {
    const started = await replies.getAssistantReply("Talk to us", { chat: signedIn });
    assert.equal(started.chatFlow.step, "compose");
    assert.deepEqual(started.chips, ["Cancel"]);
    assert.equal(started.handoff, true);

    // Anything typed now is the message, even a question
    const send = await replies.getAssistantReply("Where is my order #1042?", {
      chatFlow: started.chatFlow,
      chat: signedIn,
    });
    assert.deepEqual(send.action, {
      type: Action.SEND_CHAT,
      text: "Where is my order #1042?",
    });

    const cancelled = await replies.getAssistantReply("cancel", {
      chatFlow: started.chatFlow,
      chat: signedIn,
    });
    assert.equal(cancelled.chatFlow, null);
    assert.equal(cancelled.text, replies.ASSISTANT_COPY.talkCancelled);
    assert.equal(cancelled.cancelledChat, true);

    // B0.1: "Don't send" drops a message kept through sign-in
    const discarded = await replies.getAssistantReply(replies.DISCARD_DRAFT, {
      chatFlow: started.chatFlow,
      chat: signedIn,
    });
    assert.equal(discarded.cancelledChat, true);
    assert.equal(discarded.action, undefined);
  });

  it("shows the reply time, and out of hours the away line and when the team is back (B0.1)", () => {
    const status = {
      replyTime: "We usually reply within a few hours.",
      awayMessage: "We're away for the night.",
      isOpen: false,
      nextOpenAt: "2026-11-23T04:30:00.000Z",
    };
    assert.equal(replies.formatTeamBackAt(status.nextOpenAt, "en-GB"), "Mon 23 Nov, 10:00");
    const lines = replies.getTeamStatusLines(status, "en-GB");
    assert.deepEqual(lines, [
      "We're away for the night.",
      "The team is back Mon 23 Nov, 10:00. You can still send a message now, and we'll email you their reply.",
      "We usually reply within a few hours.",
    ]);
    // Open, or empty texts: only what the store wrote
    assert.deepEqual(replies.getTeamStatusLines({ ...status, isOpen: true }), [
      "We usually reply within a few hours.",
    ]);
    assert.deepEqual(
      replies.getTeamStatusLines({ replyTime: "", awayMessage: "", isOpen: false, nextOpenAt: null }),
      [],
    );
    assert.equal(replies.formatTeamBackAt("not a date"), "");
    assert.equal(replies.formatTeamBackAt(null), "");
  });

  it("shows the contact details when the store takes no chat messages", async () => {
    const answer = await replies.getAssistantReply("Talk to us", {
      chat: { ...signedIn, messagingEnabled: false },
    });
    assert.equal(answer.intent, Intent.CONTACT);
    assert.equal(answer.text, replies.ASSISTANT_COPY.contact);
    // No chat state at all (the backend unreachable): the same
    const unknown = await replies.getAssistantReply("Talk to us");
    assert.equal(unknown.text, replies.ASSISTANT_COPY.contact);
  });

  it("answers each send failure by its key", () => {
    assert.equal(
      replies.getChatSendFailedReply("CHAT_SIGN_IN_REQUIRED", signedIn).links[0].label,
      "Sign in",
    );
    assert.equal(
      replies.getChatSendFailedReply("CHAT_MESSAGING_OFF", signedIn).text,
      replies.ASSISTANT_COPY.contact,
    );
    assert.equal(
      replies.getChatSendFailedReply("RATE_LIMITED", signedIn).text,
      replies.ASSISTANT_COPY.talkRateLimited,
    );
    // Anything else keeps the flow open, so the next message sends
    assert.equal(
      replies.getChatSendFailedReply("NETWORK", signedIn).chatFlow.step,
      "compose",
    );
    assert.equal(replies.getChatSentReply().text, replies.ASSISTANT_COPY.talkSent);
  });

  it("shows the team's replies as theirs, with a way to answer", () => {
    const reply = replies.toStoreReplyMessage({
      id: "r1",
      from: "STORE",
      text: "Yes, it's back!",
      createdAt: "2026-11-20T10:00:00Z",
    });
    assert.deepEqual(reply, {
      role: "assistant",
      from: "store",
      text: "Yes, it's back!",
      chatMessageId: "r1",
      chips: [replies.REPLY_TO_TEAM],
    });
    const mine = replies.toStoreReplyMessage(
      { id: "m1", from: "SHOPPER", text: "Hi" },
      { isHistory: true },
    );
    assert.equal(mine.role, "user");
    assert.equal(mine.chips, undefined);
  });
});

// ─── Dictation and voice (FR-16..FR-22) ───────────────────────────────────

describe("speech helpers", () => {
  const result = (transcript, isFinal) =>
    Object.assign([{ transcript }], { isFinal });

  it("joins final results and the interim tail", () => {
    const results = [result("hello", true), result(" red dress", false)];
    assert.equal(speech.readRecognitionText(results), "hello red dress");
  });

  it("merges Android's repeated results", () => {
    const results = [
      result("show me", true),
      result("show me red", true),
      result("show me red dresses", false),
    ];
    assert.equal(
      speech.readRecognitionText(results, { mergeRevisions: true }),
      "show me red dresses",
    );
    assert.equal(
      speech.readRecognitionText(results),
      "show me show me red show me red dresses",
    );
  });

  it("adds dictated words after the field's text", () => {
    assert.equal(speech.appendDictation("I like ", "red"), "I like red");
    assert.equal(speech.appendDictation("", " red "), "red");
    assert.equal(speech.appendDictation("kept", "  "), "kept");
  });

  it("stops after 15 s of silence or 3 minutes", () => {
    const base = { startedAt: 0, lastSoundAt: 0 };
    assert.equal(speech.getDictationStopReason({ ...base, now: 14999 }), null);
    assert.equal(
      speech.getDictationStopReason({ ...base, now: 15000 }),
      "silence",
    );
    assert.equal(
      speech.getDictationStopReason({
        startedAt: 0,
        lastSoundAt: 179000,
        now: 180000,
      }),
      "max",
    );
  });

  it("keeps waveform bars and levels in range", () => {
    assert.equal(speech.getWaveBarHeight(0), 0);
    assert.equal(speech.getWaveBarHeight(5), 1);
    assert.equal(speech.getWaveBarHeight(-1), 0);
    const rising = speech.smoothLevel(0, 1, 0.05);
    const falling = 1 - speech.smoothLevel(1, 0, 0.05);
    assert.ok(rising > falling, "rises faster than it falls");
    assert.equal(speech.getByteRmsLevel(new Uint8Array(64).fill(128)), 0);
  });

});

// ─── Motion (FR-6, FR-14) ─────────────────────────────────────────────────

describe("motion maths", () => {
  it("rests the ring at 70° ahead of where it is", () => {
    for (const angle of [0, 69, 70, 100, 359, 725]) {
      const { target, duration } = visuals.getRingRest(angle);
      assert.ok(target > angle, `ahead of ${angle}`);
      assert.equal(((target % 360) + 360) % 360, 70);
      assert.ok(target - angle <= 360);
      assert.equal(duration, ((target - angle) / 360) * visuals.RING_TURN_S);
    }
    assert.equal(visuals.getRingResumeDelay(90), -2);
    assert.equal(visuals.getRingResumeDelay(-90), -6);
  });

  it("covers the whole screen from the button", () => {
    const radius = visuals.getRippleRadius(48, 700, 1200, 800);
    assert.ok(radius - visuals.ASSISTANT_RIPPLE_EDGE_PX >= Math.hypot(1152, 700));
  });

  it("keeps the blobs near their home", () => {
    for (const blob of visuals.ASSISTANT_BLOBS) {
      for (const time of [0, 1.7, 42]) {
        const frame = visuals.getBlobFrame(blob, time);
        assert.ok(Math.abs(frame.x - blob.baseX) <= blob.ampX + 1e-9);
        assert.ok(Math.abs(frame.y - blob.baseY) <= blob.ampY + 1e-9);
      }
    }
  });
});
