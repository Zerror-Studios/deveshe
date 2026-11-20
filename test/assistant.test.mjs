/**
 * Shopping assistant (DD-PRD-001): the reply rules, "leave a message",
 * the route rule, the dictation and voice helpers and the motion maths.
 *
 * The replies run on fake loaders: no network, no Apollo, no browser.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

const replies = await import("@/utils/assistant-replies.util");
const speech = await import("@/utils/assistant-dictation.util");
const visuals = await import("@/utils/assistant-gradient.util");
const constants = await import("@/components/assistant/assistant.constants");
const { contactSchema } = await import("@/validations/ContactValidation");

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
      "Talk to us": Intent.CONTACT,
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
      ["I want to talk to a human", Intent.CONTACT],
      ["Leave a message", Intent.LEAVE_MESSAGE],
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
    assert.equal(exchanges.contactFlow, null);
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

// ─── Leave a message (FR-24) ──────────────────────────────────────────────

describe("leave a message", () => {
  const say = (flow, text) => replies.getAssistantReply(text, { contactFlow: flow });

  it("asks one question at a time and checks every answer", async () => {
    let answer = await replies.getAssistantReply("leave a message");
    assert.equal(answer.contactFlow.step, "name");

    answer = await say(answer.contactFlow, "Priya Sharma");
    assert.match(answer.text, /^Thanks, Priya\./);
    assert.equal(answer.contactFlow.step, "email");

    answer = await say(answer.contactFlow, "priya-at-example");
    assert.equal(answer.contactFlow.step, "email");
    assert.match(answer.text, /doesn't look right/);

    answer = await say(answer.contactFlow, "priya@example.com");
    answer = await say(answer.contactFlow, "12345");
    assert.equal(answer.contactFlow.step, "phoneNumber");

    answer = await say(answer.contactFlow, "98765 43210");
    assert.equal(answer.contactFlow.step, "subject");
    assert.deepEqual(answer.chips, [
      "My order",
      "Sizing",
      "An exchange",
      "A collaboration",
    ]);

    // "My order" is a topic here, not a question about orders
    answer = await say(answer.contactFlow, "My order");
    assert.equal(answer.contactFlow.step, "message");

    answer = await say(answer.contactFlow, "hi");
    assert.equal(answer.contactFlow.step, "message");

    answer = await say(answer.contactFlow, "Can I change the colour of my order?");
    assert.equal(answer.contactFlow.step, "confirm");
    assert.match(answer.text, /Phone: 9876543210/);
    assert.deepEqual(answer.chips, ["Send", "Edit", "Cancel"]);

    const sent = await say(answer.contactFlow, "Send");
    assert.deepEqual(sent.action, {
      type: Action.SEND_CONTACT,
      input: {
        name: "Priya Sharma",
        email: "priya@example.com",
        subject: "My order",
        phoneNumber: "9876543210",
        message: "Can I change the colour of my order?",
      },
    });

    const edited = await say(answer.contactFlow, "Edit");
    assert.equal(edited.contactFlow.step, "name");
    assert.equal(edited.contactFlow.values.email, "");
  });

  it("starts from the profile's name and email", () => {
    const answer = replies.startContactFlow({
      firstName: "Priya",
      lastName: "Sharma",
      email: "priya@example.com",
    });
    assert.equal(answer.contactFlow.step, "phoneNumber");
    assert.match(answer.text, /Priya Sharma \(priya@example\.com\)/);
  });

  it("ends on cancel, and on a real question at the first steps", async () => {
    const started = await replies.getAssistantReply("leave a message");
    const cancelled = await say(started.contactFlow, "cancel");
    assert.equal(cancelled.contactFlow, null);
    assert.equal(cancelled.text, replies.ASSISTANT_COPY.contactCancelled);

    const asked = await say(started.contactFlow, "where is my order");
    assert.equal(asked.intent, Intent.ORDERS);
    assert.equal(asked.contactFlow, null);
  });

  it("sends the same input as the contact form", () => {
    const parsed = contactSchema.parse({
      name: "A",
      email: "a@b.co",
      subject: "Hi",
      phoneNumber: "98765-43210",
      message: "Hello team",
    });
    assert.equal(parsed.phoneNumber, "9876543210");
    assert.equal(
      replies.getContactSentReply().text,
      replies.ASSISTANT_COPY.contactSent,
    );
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
