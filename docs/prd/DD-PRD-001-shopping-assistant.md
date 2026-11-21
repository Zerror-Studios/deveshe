# DD-PRD-001 — Shopping assistant: chat, dictation and the opening ripple

| Field | Value |
|---|---|
| Status | Implemented 2026-11-20 (working tree, not committed). **Dynamic since 2026-11-20 (backend PRD-049 step B0, D14/D15; working tree):** the store's own answers and "Talk to us" come from the backend through the kit's `useStoreChat` (needs kit ≥ 1.6.0, not released yet, §11). **B0.1 (D14 here, backend D17, 2026-11-21; working tree):** "Talk to us" in the header and under every answer, "Message the team" after a miss, the reply time and away line, the question kept through sign-in (§12). Dictation waits for the kit option (FR-21) |
| Owner | Store owner; requested by sunny-zerror on 2026-11-20 |
| Repos affected | storefronts/deveshe-dreams; zcom-storefront-kit (one security-header option, FR-21; the store chat engine, B0) |
| Source-of-truth PRD | This file for the look and the store's own answers. The dynamic part (FAQs, settings, "Talk to us", replies) is backend PRD-049 step B0: `zcom-backend/docs/prd/PRD-049-support-help-centre-and-store-inbox.md` (D14, D15), kit pointer `zcom-storefront-kit/docs/prd/PRD-049-store-chat.md` |
| Created / Updated | 2026-11-20 / 2026-11-21 (B0.1) |
| Approved by / on | Owner (sunny-zerror), in conversation: "yes approved now make the changes in code" / 2026-11-20 |

**Numbering:** this PRD is numbered in the store's own series (`DD-PRD-`, like `KIT-PRD-`) because it has no backend part and the backend's PRD index, which assigns platform numbers, isn't on the machine where it was drafted. Rename it if the workspace gives it a platform number (Q4).

## 1. Problem and goal

Shoppers keep asking the same few questions:

- how long a made-to-order piece takes to arrive;
- whether they can exchange a size;
- where their order is;
- what's on offer.

Today the answers sit on `/shipping-returns`, or reach the shopper days later through the contact form.

**Goal:** a shopping assistant at the bottom left of every page. It is modelled on the assistant at emotion-agency.com: its button, speech bubble, the ripple that opens and closes it, the orb, the input ring and voice dictation. It answers those questions at once from the store's own policies, finds products, shows signed-in shoppers their orders, and passes anything else to the team through the existing contact form.

**It worked if:**

- shoppers use it: GA4 records `search` events from the assistant and `select_item` with list id `assistant`;
- fewer contact-form messages ask about delivery and exchanges (the owner's inbox);
- the home and product pages keep their Lighthouse scores.

## 2. Scope

**In scope:**
- The launcher button and speech bubble, bottom left (D2).
- The full-screen assistant: the opening and closing ripple, orb, status, transcript, quick-action chips, an input with a rotating ring, and "Scroll to latest".
- Dictation through the browser's speech recognition, with a live waveform and a glow around the screen edges. The microphone needs a kit header option (D5, FR-21).
- Spoken replies in the browser's own voice, off by default (D4).
- A scripted reply engine on existing backend operations (D1). It covers store policies, product search, collections, offers, the signed-in shopper's orders and navigation, plus a "leave a message" flow that calls `submitContactForm`.
- Reduced-motion, keyboard and screen-reader support, unit tests and docs.

**Out of scope:**
- AI answers from Claude or any other model. The reply engine sits behind one function, `getAssistantReply(text, context)`, so an AI transport can replace it once a backend PRD adds a tenant-aware assistant operation.
- New GraphQL operations, models or events.
- New analytics events: the event vocabulary belongs to the backend (PRD-013).
- Saving the conversation or sending it anywhere: it lives in memory until the page reloads.
- Languages other than English.
- Site sounds, the reference's WebGL page distortion (approximated in CSS, §6.3) and its "leave this page?" prompt.
- Live chat with a person, and a rare-element twin.
- The checkout, payment-link and order-status pages (D2).
- No new npm dependency. The feature uses the Web Speech API, `speechSynthesis`, canvas 2D and GSAP, including its `ScrambleTextPlugin`, which ships in the public `gsap` package already installed.

## 3. Users and permissions

The assistant serves every shopper, signed in or not, and needs no backend permission change.

Order answers come from `myOrders`, which the server answers only with the signed-in customer's own orders. A guest gets guidance and links, never a lookup by email or order number.

## 4. Decisions (owner, 2026-11-20, in conversation)

| # | Decision | Rejected |
|---|---|---|
| D1 | Scripted answers on existing backend operations; AI later through a backend PRD | AI through a backend PRD now; AI through a storefront route holding a server key; animations only |
| D2 | Bottom left on every page except `/checkout*`, `/pay/*` and `/orders/status/*` | The contact page only; every page |
| D3 | The reference's moving gradients re-tinted to the store's red `#fe0000` and blush `#fadcde` | The reference's violet and blue |
| D4 | Spoken replies off by default; a speaker button turns them on, and the choice is remembered on the device | On by default with a mute button; no voice output |
| D5 | The microphone is allowed through a new option on the kit's `buildSecurityHeaders`, released as a kit tag. The assistant ships without waiting; the mic button stays hidden until the tag is pinned | Override the kit's header locally; drop dictation |
| D6 | Spoken replies use a woman's voice ("make voice to girl voice", after trying it) | The first English voice (often a man's on Windows) |
| D12 | No voice: replies are silent; the speaker button, `/api/assistant/speak` and `GOOGLE_TTS_API_KEY` are removed (supersedes D4, D6, D10; FR-22 dropped). The chat column is vertically centred beside the orb on desktop (owner, 2026-11-20, "remove voice feature just make it silent respond also aligned mine chatbox vertically center") | Spoken replies |
| D9 | The microphone is allowed now through a local override of the kit header in `next.config.mjs` (`microphone=(self)`, this store only), the owner's explicit exception to CLAUDE.md "plumbing is the kit's" (2026-11-20, "add microphone feature"). Move it into the kit later (FR-21) | Wait for the kit option |
| D10 | Replies are read by Google Cloud Text-to-Speech (en-IN Neural2-A, a woman's voice), as the reference does with Google TTS, through a server route holding `GOOGLE_TTS_API_KEY`; the browser voice reads while no key is set (owner, 2026-11-20, "the voice is not clear and not similar"). Cost: Google's per-character price after its monthly free tier | Browser voices only |
| D11 | The open assistant matches the reference's layout, sizes, icons, glow and type exactly, in DeVeSheDreams' red and blush (owner, 2026-11-20, "not looks similar … check the input field alignment") | The reference's violet |
| D8 | The button moves to the bottom-right corner (owner, 2026-11-20: "should be present in bottom right side"); supersedes the side in D2 and D7. Next's dev badge goes back to its default bottom left. On a first visit the cookie banner covers it until the shopper chooses | Bottom left |
| D13 | **Dynamic (backend PRD-049 D14, D15, owner 2026-11-20):** not rebuilt; answers come from what staff edit in the dashboard (Inbox › Chat answers: FAQs, welcome, bubble text, quick buttons) through the kit's `useStoreChat`, no AI. "Talk to us" needs a signed-in shopper: guests see the store's sign-in prompt and a sign-in link back to the open chat; messages go to the dashboard Inbox and the team's replies come back into the chat. Replaces FR-24 (the in-chat contact form) and supersedes D1's "scripted only" (§11) | Keep the scripted answers only |
| D14 | **Talk to us everywhere (backend PRD-049 D17, step B0.1, owner 2026-11-21):** "Talk to us" in the chat header and under every answer while the store takes messages; "Message the team" ends a reply that found nothing; the store's reply time near the message box and, outside its chat hours, its away line and when the team is back (messages still go); a guest's question is kept through sign-in and put back in the message box, never sent without a tap. Supersedes §11 item 6's "second miss in a row" (§12) | Offer a person only after two misses (B0) |
| D7 | The button stays in its corner on every page, the footer included ("place the assistance on bottom left side"). It still rises above the phone add-to-bag bar, so it never covers the buy button | Rising above the footer's last row |

## 5. Functional requirements

### Launcher and bubble

- **FR-1** A round button (`aria-label` "Open the shopping assistant") sits fixed at the bottom left.
  - Above 1024 px it is 52 px wide, 20 px from the bottom and 48 px from the left.
  - At 1024 px and below it is 40 px wide, 16 px from the bottom and from the left.
  - Inside, a canvas paints a moving gradient in the D3 palette: four drifting soft blobs and two sine waves, blended additively.
  - The canvas draws at half the frame rate and at most 2× device pixels, and only while the tab is visible and the assistant is closed.
- **FR-2** On hover (pointer devices only), a blurred glow grows under the button (scale .6 → 1 in .4 s) and the bubble reads "I'm the DeVeSheDreams assistant. Click to chat with me."
- **FR-3** Once per browser session, 5 s after the page loads, the bubble says "Hi! Looking for a piece, delivery times or your order? Ask me." for 5 s. It stays quiet if the shopper has already opened the assistant. The flag lives in `sessionStorage`, wrapped in try/catch; without storage the bubble shows once per page load.
- **FR-4** The bubble sits 84 px above the bottom edge and is at most 260 px wide.
  - It is red, with a radial gradient that slowly morphs over 14 s and back.
  - Its text is 10 px uppercase.
  - It appears with a .3 s fade and a 6 px rise.
  - Its text "decodes" in: characters scramble into place over .5 s, through GSAP's `ScrambleTextPlugin`.
  - It is decorative (`aria-hidden`); the button carries the label.
- **FR-5** The button stays in the bottom-right corner on every page (D7, D8), the footer included.
  - On phones it rises above the product page's sticky add-to-bag bar (`.mobile_add_btn`), so it never covers the buy button.
  - It sits under the bag drawer (z-index 999), the mobile menu (1000), the material modal (1200) and the consent banner.

### Opening and closing

- **FR-6 Opening.** A click, or Enter or Space, opens the assistant.
  - A ripple spreads from the button's centre to the farthest corner of the screen in 1.1 s (`power2.inOut`). It reveals the assistant's stage, a blush ground with the site's grain, and a soft refractive ring travels on its edge.
  - The assistant's content fades in over .45 s, starting at .65 s.
  - The page stops scrolling: the overlay covers the screen and carries `data-lenis-prevent`, and the body doesn't scroll, as with the contact drawer.
  - The page behind becomes `inert`.
  - Focus moves to the message field on pointer devices. Touch devices skip this so no keyboard pops up.
- **FR-7 Closing.** Four things close the assistant:
  - the close button;
  - Escape, which first cancels any running dictation;
  - the browser's Back button;
  - any navigation the assistant itself starts, including a click on a link inside it.

  The content fades out in .45 s and the ripple collapses back into the button in .9 s (`power2.inOut`). Scrolling and the page come back, and focus returns to the button.
- **FR-8 Back button.** Opening pushes one history entry for the same URL (`history.pushState`, with no query string, so no server page renders again), and Back closes the assistant. Closing it any other way removes that entry, so the history never holds a duplicate.
- **FR-9 Memory.** The conversation stays while the shopper moves around the site and shows again, without animation, when the assistant reopens. It is lost on reload and never written to storage.

### The assistant screen

- **FR-10 Layout.**
  - Above 1024 px, the conversation column (550 px) sits on the left and the orb (520 px) on the right.
  - At 1024 px and below, the orb sits on top at 320 px and shrinks to 100 px after the shopper's first message; the conversation sits below it.
  - A header at the top right holds only the speaker button (FR-22) and the close button, as on the reference (D11): white circles with a red icon, the speaker tinted red while muted.
- **FR-11 Orb.** A canvas orb uses the button's painter inside a soft circle, and its look follows the phase:
  - entering: grows in;
  - listening: drifts calmly;
  - thinking: swirls faster and pulses;
  - replying: pulses with the reply;
  - dictating: swells with the microphone level;
  - sleeping: after 45 s without activity it dims and slows, and any activity wakes it.

  It renders only while the assistant is open.
- **FR-12 Transcript.**
  - The shopper's messages sit on the right in a red gradient bubble with white text; the assistant's sit on the left in a frosted white bubble with dark text.
  - Bubbles are at most 88 % wide and 12 px apart. The top and bottom of the list fade out, and no scrollbar shows.
  - New messages scroll into view unless the shopper has scrolled up; then a "Scroll to latest" button appears.
  - While a reply is being prepared, an italic bubble shows a short phrase: "Looking through the collection…", "Checking our policies…" or "Finding your orders…".
  - Replies decode in. Screen readers get the full text at once: the transcript is `aria-live="polite"` and the animated copy is `aria-hidden`.
- **FR-13 Quick actions.**
  - The welcome message reads "Hi, I'm the DeVeSheDreams assistant. Ask me about a piece, delivery, exchanges or your order, or tap one below."
  - Under it, chips appear one after another: "New arrivals", "Delivery", "Exchanges", "Track my order", "Offers" and "Talk to us". They disappear after the shopper's first message.
  - Replies can carry their own follow-up chips and links.
- **FR-14 Input.** A pill holds the message controls.
  - A thin ring around it turns once every 8 s and eases to rest at 70° on hover or focus, with a soft red glow underneath.
  - Inside are the mic button (FR-20), a field reading "Ask me anything…" and the send button, which is disabled while the field is empty.
  - The field grows to 6 lines; past one line, the buttons move under the text.
  - Enter sends and Shift+Enter starts a new line.
  - While a reply is in progress, the send button becomes Stop, which ends the reply.
- **FR-15 Errors.** An error strip with a dismiss button sits above the input. It says "I couldn't reach the store just now. Please try again." for network and server failures (GraphQL errors go through `utils/api-error.util.js`), and shows the dictation messages from FR-20.

### Dictation

- **FR-16** The mic button starts dictation:
  - the browser's speech recognition, continuous with interim results, in language `en-IN`;
  - a microphone level meter: `getUserMedia` with echo cancellation, noise suppression and automatic gain, read through an analyser with FFT size 1024.

  On Android the recogniser and the meter can't share the microphone, so the level is simulated from the recogniser's events, as the reference does.
- **FR-17** While dictating:
  - The input row becomes a waveform with Cancel (✕) and Insert (✓) buttons. Its bars scroll right to left, one every 100 ms, 2 px wide with 3 px gaps; each bar's height comes from the loudest level in its slot, and dots stand where there has been no sound yet.
  - A glow turns around the screen edges once every 12 s: a 3 px conic-gradient border and a 56 px inner glow at 85 % opacity. It fades in over .6 s after a .1 s delay, and out over .45 s.
  - The orb swells with the level.
- **FR-18** Insert adds the recognised words to the field, after any text already there, and focuses the field. Nothing is sent until the shopper sends it. Cancel and Escape drop the words.
- **FR-19** Dictation stops by itself after 15 s without sound, or after 3 minutes. When the browser ends recognition early it restarts, and it gives up after 3 empty restarts in a row.
- **FR-20** The mic button shows only where both of these hold:
  - the browser has speech recognition (Chrome, Edge and Safari do; Firefox doesn't);
  - the page's permissions policy allows the microphone, checked with `allowsFeature("microphone")` on `document.featurePolicy` or `document.permissionsPolicy` where the browser has either.

  If the permission is refused, the strip says "Microphone access was blocked." and the button hides for the rest of the visit. The microphone stream stops on Insert, on Cancel and on close.
- **FR-21 (D5, D9)** The microphone is allowed for the store's own origin (`microphone=(self)`). Today `next.config.mjs` rewrites only that value in the kit's `Permissions-Policy` (D9); every other store keeps `microphone=()`. Later the kit's `buildSecurityHeaders` gets an option for it, and this local rewrite goes.

### Voice

- **FR-22** The speaker button (`aria-pressed`) turns spoken replies on and off.
  - It is off by default, and the choice is remembered on the device in `localStorage` (key `zc_assistant_voice`, holding only "on" or "off", wrapped in try/catch).
  - When it is on, replies are read through the browser's speech synthesis in a woman's voice (D6), and the orb pulses while the voice speaks.
    - Browsers don't report a voice's gender, so women's voices are recognised by the names Windows, Edge, Chrome, macOS and iOS give them, for example Heera, Neerja, Zira, Google UK English Female, Samantha and Veena.
    - English (India) comes next, then on-device voices. A woman's voice is read at pitch 1.1.
    - If the browser has no woman's voice, the closest voice reads at pitch 1.35, a lighter tone.
  - Stop, a new message, dictation and closing the assistant all silence it.

### Answers (scripted, D1)

- **FR-23** The reply engine is plain JavaScript with no JSX (`utils/assistant-replies.util.js`). It matches the message to one intent by keyword rules, checked in a fixed order, and returns text plus optional product cards, links, chips and an action; a message that matches nothing gets the fallback. All store copy lives in this one module, quoted from `/shipping-returns` so the two pages always agree.

| Intent | Examples | Answer | Data |
|---|---|---|---|
| Greeting and help | "hi", "what can you do" | What it can help with, plus the quick-action chips | – |
| Products | "show me co-ord sets", "red dress", "new arrivals" | Up to 4 product cards (image, name, server price) and "See all results" (`/search?q=…`). With no match: "I couldn't find that", plus collection chips | `getClientSideProducts` (`filters.search`, `limit: 4`; "new arrivals" sorts by newest) |
| Collections | "what do you sell", "collections" | Collection chips linking to `/shop/<slug>` | `getClientSideCategories` |
| Delivery | "shipping", "how long", "international" | Shipping is free across India. Pieces are made to order, so each order's timeline is shared with the shopper. After dispatch, delivery takes 1–2, 3–5 or 5–7+ business days, depending on distance. Customers pay international shipping and duties. Link to Shipping & returns | – |
| Exchanges | "return", "exchange", "refund", "wrong size" | Exchanges are only for a wrong item, wrong size or damage, and only for the same piece in another size. Caps, hats and socks can't be exchanged, and there are no refunds. The steps: email the team, a quality check, pickup in 3–7 days, then a replacement in 3–4 business days. Link | – |
| Orders | "where is my order", "track" | Signed in: the latest 3 orders (`orderNo`, date, `displayStatus`, and the shipment status in the kit's words through `getShipmentStatusLabel`), each linking to `/profile/orders/<id>`; with no orders, it says so. Guest: "Sign in to see your orders" (`getLoginPath`), and "For a guest order, open the status link in your order email." | `myOrders` (`limit: 3`) |
| Offers | "offers", "coupon", "discount" | The store's valid promotions (name, code, minimum order), each with "Copy code". With none: "No offers right now", plus the newsletter | `getAllValidPromotions` |
| Sizing | "size", "fit", "measurements" | Each product page has its own size guide. Offers a product search and adds the made-to-order note | – |
| Payment | "payment", "how do I pay" | You pay online on the checkout's payment step, where the options appear. Provider names are never hard-coded | – |
| Contact | "talk to someone", "contact", "complaint" | The support email (`deveshedreams@gmail.com`, as on `/contact`) and "Leave a message here" (FR-24) | – |
| Navigation | "open my bag", "take me to the lookbook", "blogs", "about", "home", "my account" | Says where it is going, closes the assistant (FR-7), then navigates. "My bag" opens the bag drawer | – |
| Fallback | anything else | "I can help with pieces, delivery, exchanges, orders and offers, or pass a message to the team.", plus the chips | – |

- **FR-24 Leave a message.** *Superseded by §11 (backend PRD-049 B0, D13): "Talk to us" now sends `sendStoreChatMessage` for signed-in shoppers; the in-chat contact form below was removed.*
  - The chat asks one question at a time: name, email, phone (10 digits), topic, then message.
  - Each answer is checked with the contact form's rules. The zod schema moves from `components/contact/ContactForm.jsx` to `validations/ContactValidation.jsx`, and both use it.
  - A summary follows, with Send, Edit and Cancel.
  - Send calls `submitContactForm` with the same input as the form. On success the assistant says "Thanks! The team will get back to you soon."; on failure the error strip shows and the summary stays.
  - For a signed-in shopper, the name and email start filled in from their profile, and they can change them.
  - "Cancel", or asking about something else, leaves the flow.
- **FR-25 Prices and data.** Prices are the server's values, formatted as on the product cards; nothing is computed in the browser. Reads go through the kit's Apollo client and the same-origin proxy, using the store's existing documents re-exported from `src/graphql`.
- **FR-26 Analytics.** The assistant sends only existing events:
  - a products answer sends `search` through `trackSearch(term, count)`, with the extracted product words and never the whole message;
  - a click on a product card sends `select_item` with list id `assistant` and list name "Shopping assistant".

  New `assistant_*` events are a follow-up through the backend vocabulary.

## 6. UX

### 6.1 States

- The assistant moves through closed → opening → open → closing → closed. While open, it is listening, thinking, replying, dictating or sleeping.
- The error strip can show in any open state.
- **Reduced motion:**
  - a .25 s fade instead of the ripple;
  - no decoding text;
  - a still orb;
  - no turning ring and no rotating glow.

  Dictation still shows the waveform.

### 6.2 Colours (D3)

The reference's violets become the store's reds. These are starting values, tuned in the browser so text passes WCAG AA:

- **Blobs:** `#fe0000`, `#ff5a6e`, `#fadcde` and `#c8102e`.
- **Waves:** `#ff3c50` and `#ff96a5`.
- **Input ring and dictation glow:** `#fe0000` → `#ff96a5` → `#fadcde`.
- **Shopper's bubble:** `#fe0000` → `#ff5a6e`.
- **Text on blush:** `#1a1a1a`, or the store's accessible grey `#595959`.

### 6.3 What we copy from the reference, and how

The reference was read from its production bundle on 2026-11-20 (components `AIButton`, `AIBubble`, `AIOverlay`, `InputForm`, `AIOverlayDictationWave` and `AIOverlayDictationGlow`).

| Element | Reference | Here |
|---|---|---|
| Button | Canvas 2D: 4 blobs and 2 waves at half the frame rate; bottom right, 52 px | The same painter in the D3 palette; bottom left (D2) |
| Bubble | Morphing radial gradient (`@property` colours, 14 s); custom decoding text | The same gradient; GSAP `ScrambleTextPlugin` |
| Opening | WebGL ripple from the button's centre (grid noise, chromatic aberration), 1.1 s; the interface fades in over .45 s after .65 s | A CSS radial mask on the stage layer (radius tweened by GSAP), with a `backdrop-filter` ring on its edge; same timings |
| Closing | Ripple back in .9 s; interface fades out in .45 s | The same |
| Orb | A three.js scene behind the page | Canvas 2D: no WebGL, and three stays on the contact page only |
| Input ring | Conic gradient on an `@property` angle, 8 s, resting at 70° on hover or focus | The same |
| Dictation | Web Speech API and an analyser, waveform canvas, edge glow, Cancel and Insert | The same |
| Voice | A Google TTS endpoint, else the browser's voice; on by default | The browser's voice only, a woman's (D6); off by default (D4) |
| Answers | A Claude endpoint, else keyword replies | Keyword replies on store data (D1) |
| Sounds, "leave this page?" prompt | Yes | Not copied |

### 6.4 Planned files

- `components/assistant/AssistantLauncher.jsx`: rendered by `Layout`, with the route check. It loads the rest through `next/dynamic` (`ssr: false`) on the first hover, focus or click.
- `components/assistant/`: `AssistantBubble.jsx`, `AssistantOverlay.jsx`, `AssistantOrb.jsx`, `AssistantTranscript.jsx`, `AssistantInput.jsx`, `DictationWave.jsx`, `DictationGlow.jsx`, and `assistant.constants.js` (with `ASSISTANT_ENABLED` and the excluded routes).
- `hooks/useDictation.jsx` (recognition and level meter) and `hooks/useAssistantVoice.jsx`.
- `store/assistant-store.js`: zustand, not persisted.
- `utils/assistant-replies.util.js`, `utils/assistant-gradient.util.js` (the painter) and `utils/assistant-dictation.util.js` (pure timing and transcript helpers).
- `validations/ContactValidation.jsx`: the moved schema, kept free of JSX as the test hooks require.
- `styles/components/common/assistant.css`, imported in `app/layout.jsx`.
- `test/assistant.test.mjs`.

## 7. Non-functional

- **Tenant and contract:** no new endpoint or operation. Every read goes through the kit's client and proxy, so nothing reaches the gateway that the site doesn't send already.
- **Privacy:**
  - The conversation stays in memory only, and no PII goes into analytics. The voice setting isn't personal data.
  - Speech recognition is the browser's own. In Chrome, Google's speech service processes the audio; we never receive it. The privacy policy needs one line saying so (owner text, Q2).
  - Spoken replies (D10) send the assistant's reply text to Google Cloud Text-to-Speech. Never what the shopper typed, and never contact details: the "leave a message" steps are read from a `speech` text without the name, email or phone. The privacy policy line (Q2) covers this too.
  - Speech synthesis prefers on-device voices.
- **Security:**
  - Replies render as text (React escapes them), never as HTML, and links are internal paths only.
  - The microphone opens only when the shopper clicks the mic and closes afterwards.
  - The header change (FR-21) allows the microphone for this origin only, not for embedded frames.
- **Performance:**
  - The launcher is small (target under 6 KB gzipped) and starts its canvas after the page's `load` event.
  - Everything else is a lazy chunk loaded on intent, so no page's first-load JS grows by more than the launcher.
  - Canvases run at half the frame rate and at most 2× device pixels, and stop while hidden.
  - Nothing shifts the layout.
  - Lighthouse may not drop on the home page (94 mobile / 97 desktop) or the product page (73 / 98).
  - GSAP plugins register in the component that uses them, and timelines clean up with a `gsap.context()` revert (CLAUDE.md §3).
- **Accessibility:**
  - The overlay is a `role="dialog"` with `aria-modal`, labelled "Shopping assistant". It uses `hooks/useDialogA11y.jsx` for the focus trap, Escape, `inert` and returning focus.
  - Every icon button has a label, and the chips are buttons.
  - The conversation is a `role="log"` live region, so replies are read once and in full. A polite live region announces when dictation starts, and errors are alerts.
  - Contrast meets AA, and reduced motion follows §6.1.
- **Browsers:** the last two versions of Chrome, Edge, Safari (iOS included), Firefox (without dictation) and Samsung Internet.
- **Layering:** the launcher sits under the bag drawer, mobile menu and modals. The overlay sits at z-index 1100, and toasts and the consent banner stay above it.

## 8. Open questions

| # | Question | Owner | Blocks |
|---|---|---|---|
| Q1 | Review the assistant's copy (all in `utils/assistant-replies.util.js`), the support email it shows and the chips | Store owner | Go-live, not code |
| Q2 | One line in the privacy policy about dictation and the browser's speech service | Store owner | Go-live |
| Q3 | The kit option's name and its release (FR-21), replacing the local rewrite (D9) | Kit maintainer | Nothing (D9 covers it meanwhile) |
| Q6 | A Google Cloud API key restricted to the Text-to-Speech API, set as `GOOGLE_TTS_API_KEY` locally and in hosting | Owner | The clear voice only (the browser voice reads meanwhile) |
| Q4 | PRD number: the store series (`DD-PRD-001`) or a platform `PRD-NNN` | Lead | Nothing |
| Q5 | On desktop the launcher overlaps the left end of the home hero's "Shop …" pill, which sits in the same bottom-left corner. The whole slide is one link, so nothing is blocked. Options: leave it; give the hero's text block about 24 px more room at the bottom; or let the button step aside while the pill is under it | Owner / design | Nothing |

## 9. Rollout and verification

- **Rollout:** the assistant ships switched on, through the usual `dev` → `uat` → `main` flow. Setting `ASSISTANT_ENABLED = false` in `components/assistant/assistant.constants.js` turns it off.
- **Dictation** appears once the kit tag with FR-21 is pinned, recorded as a T2 release line. Until then FR-20 keeps the mic button hidden. Testing dictation in the browser before that needs a temporary local header change in dev, never committed.
- **Tests** (`node:test`, run by `prebuild`):
  - intent matching for every intent, near misses included;
  - product-word extraction;
  - the message flow's validation steps and summary;
  - route exclusion;
  - the ring's resting-angle maths;
  - the dictation stop rules;
  - reading and writing the voice setting with no storage available.
- **Browser check:**
  - Chrome, Safari and Firefox at 375, 768 and 1440 px;
  - Android Chrome and iOS Safari, for dictation and the on-screen keyboard;
  - keyboard only, a VoiceOver smoke test, and reduced motion;
  - Lighthouse on the home and product pages, mobile and desktop.
- **Done when:**
  - FR-1 to FR-26 hold (FR-21 once the kit tag lands);
  - the tests and the build pass;
  - the browser check is done;
  - the docs in §10 are updated.

## 10. Implementation log

- 2026-11-20: Draft.
  - The reference was analysed from its production bundle; its timings and sizes are in §5 and §6.3.
  - Decisions D1–D5 are recorded.
  - Found that the kit's `Permissions-Policy` sends `microphone=()` (`buildSecurityHeaders`, with no option), which blocks dictation; hence D5 and FR-21.
  - Docs to update on delivery:
    - `CLAUDE.md` (§1 status, §2 map, §3 rules, §4 test count);
    - `docs/architecture/solution-architecture.md` (presentation);
    - `docs/README.md` and the changelog;
    - the privacy policy page, once the Q2 text exists.
- 2026-11-20: Approved by the owner in conversation ("yes approved now make the changes in code"). Implemented the same day in the working tree, not committed.
  - **Files:**
    - `components/assistant/`: `AssistantLauncher`, `AssistantBubble`, `AssistantOverlay`, `AssistantOrb`, `AssistantTranscript`, `AssistantInput`, `DictationWave`, `DictationGlow` and `assistant.constants.js`;
    - `hooks/useDictation.jsx` and `hooks/useAssistantVoice.jsx`;
    - `store/assistant-store.js`;
    - `utils/assistant-replies.util.js`, `utils/assistant-dictation.util.js` and `utils/assistant-gradient.util.js`;
    - `validations/ContactValidation.jsx`, the schema moved out of `ContactForm.jsx`, which now imports it;
    - `styles/components/common/assistant.css`, imported in `app/layout.jsx`;
    - `Layout.jsx` renders the launcher, and `GET_VALID_PROMOTIONS` re-exports the kit's `GetValidPromotionsDocument`.
  - **Checks:**
    - `test/assistant.test.mjs`: 32 tests. The whole suite passes, 205 of 205, and `npm run build` passes.
    - The launcher adds 1,405 bytes gzipped to the shared layout chunk, measured with and without it.
    - The assistant is a lazy chunk of about 19 KB gzipped, and ScrambleText one of about 3.8 KB.
  - **Browser check:** headless Chrome, driven over the DevTools protocol with no package, against `next start` at 1440×900 and 390×844, passed 26 of 27 checks:
    - the launcher's position, the hover bubble and the ripple opening;
    - the inert page, the scroll lock and the history entry;
    - focus in the field on desktop, and none on the phone;
    - the welcome message and its chips, the Delivery and Exchanges answers, product search with collection links, offers, new arrivals with 4 cards, and the guest orders answer;
    - Escape, the close button and Back, with focus returning to the launcher;
    - the conversation kept on reopen;
    - the phone launcher clearing the add-to-bag bar, and the orb shrinking after the first message.

    The missed check is the intro bubble's timing in one run: slow media-CDN images held back `load`. A separate run showed it about 6 s after load, for 5 s.
  - **Not checked:** dictation (the kit's `microphone=()` hides it, as FR-20 intends), spoken replies, Safari, Firefox, real phones, a screen reader, reduced motion and Lighthouse.
  - **Deviations:**
    - FR-4: ScrambleText loads after `load`, once the browser is idle, not in the first load; until it arrives, the bubble's text appears without decoding.
    - FR-7: the button can't be clicked while the assistant is open, because the stage covers it, so that way of closing was dropped.
    - FR-10: the status pill also says "Hello" while entering, "Resting" while sleeping and "Bye" while exiting.
    - FR-24: cancel words and the chips leave the flow at any step, and a real question leaves it at the name, email and phone steps. The topic and message steps take any text, so "My order" counts as a topic.
    - §6.4: the launcher's copy lives in `assistant.constants.js`, which keeps the reply engine out of the first load. `assistant-gradient.util.js` also holds the ripple and ring maths.
    - §7: accessibility as now written there.
  - **Found while building:** the site styles every `<footer>` element (`footer.css`: `overflow: hidden`, a background, `z-index`), so the assistant uses `div`s.
- 2026-11-20: Owner feedback after trying it: "place the assistance on bottom left side and make voive to girl voice" (D6, D7).
  - **Placement (D7):** near the end of a page the button rose 177 px above the footer's last row and looked as if it had left the corner. It now stays at bottom left; only the phone add-to-bag lift remains (`AVOID_SELECTORS`).
  - **Dev badge:** `next.config.mjs` puts Next's dev badge at the bottom right. In `next dev` it sat on the button; it doesn't exist in production.
  - **Voice (D6):** `pickAssistantVoice` ranks a woman's voice first, recognised by name; `getVoicePitch` returns 1.1, or 1.35 when the browser has no woman's voice.
    - On this machine, Chrome lists only Google's network voices ("Google US English", "Google UK English Female" and others), so it now picks "Google US English" (a woman's voice, listed first) and never "Google UK English Male".
    - Edge and Windows add Microsoft voices: Heera, Zira and Neerja now win over Ravi and David.
  - **Checks:** tests 205/205 (the voice test covers these names) and the build pass. On the dev server, the button sits at left 48 px and bottom 20 px both at the top and at the very end of the home page, and the dev badge is at the bottom right.
- 2026-11-20: Owner feedback with the reference's input screenshots: "add microphone feature … the opened [assistant] not looks similar … the voice is not clear … check the input field alignment" (D9, D10, D11).
  - **Microphone (D9):** `next.config.mjs` rewrites the kit's `Permissions-Policy` to `microphone=(self)`. The mic button now shows, and dictation runs with the waveform and the edge glow.
  - **Voice (D10):**
    - `app/api/assistant/speak/route.js` and `lib/assistant-tts.server.js` call Google Cloud Text-to-Speech (en-IN-Neural2-A, MP3, key in the `X-Goog-Api-Key` header).
    - Guards: same-origin only, at most 900 characters, 20 a minute per IP and 300 per instance, and the last 100 answers cached.
    - `hooks/useAssistantVoice.jsx` plays the server voice through Web Audio; its level drives the orb. It falls back to the browser voice when no key is set or a request fails.
    - The browser voice no longer shifts pitch on a woman's voice (1.0; 1.2 otherwise).
    - `toSpeakableText` reads "1–2" as "1 to 2" and "&" as "and".
    - `amplify.yml` passes `GOOGLE_TTS_API_KEY` to the server.
  - **Look (D11), from the reference's stylesheet and the owner's screenshots:**
    - the header shows only the voice and close buttons (no status pill);
    - glass chips at 12 px, in one sideways-scrolling row on phones;
    - 20 px between the chips and the input, and a 40 px transcript margin;
    - the input field at 14 px on 20 px lines (16 px on phones) with a `#9ca3af` placeholder;
    - an up-right send arrow, and a halo of 40 px blur at 30%;
    - dark waveform bars.
  - **Alignment:** the single-line check now counts lines rather than comparing pixels, so 125% and 150% display scaling no longer flip the input into two-line mode.
  - **Dev badge:** Next's dev badge moves to the top left (`devIndicators`); at the bottom left it covered the mic button on phones in `next dev`.
  - **Checks:**
    - Tests 213/213, including 8 new ones for the voice route, spoken text and contact details staying out of speech; the build passes.
    - The production build in headless Chrome with a fake microphone, at 1440×900 and 390×844: the mic shows, dictation draws the waveform and glow, and Cancel returns to the field. The pill is 60 px, the field 32 px and single-line. No page errors.
    - On the dev server: `Permissions-Policy` shows `microphone=(self)`, and the voice route answers `{"available":false}` until a key is set.
  - **Couldn't check:** the Google voice itself (no key yet), and the reference rendered side by side (its 3D page doesn't finish loading on this machine).
- 2026-11-20: D12. Voice removed: the speaker button, `hooks/useAssistantVoice.jsx`, `app/api/assistant/speak`, `lib/assistant-tts.server.js`, the voice helpers and their tests, and `GOOGLE_TTS_API_KEY` from `amplify.yml`. The desktop chat column sizes to its content and is centred vertically. Dictation (microphone) stays. Tests 203/203; checked on the dev server at 1920×906.
- 2026-11-20: **D13, backend PRD-049 B0 (dynamic answers and "Talk to us").** See §11. Files: `utils/assistant-replies.util.js` (routing, store answers, Talk to us; the contact-form flow removed), `components/assistant/AssistantOverlay.jsx` (`useStoreChat`, the team's replies, the store's welcome and quick buttons), `AssistantLauncher.jsx` (the store's bubble text, `?chat=open`), `AssistantTranscript.jsx` ("The team" label, https links in a new tab), `store/assistant-store.js` (`chatFlow`, `chatSeenIds`), `assistant.css` (`.assistant_msg_from`). Tests 212/212 (+9 net in `test/assistant.test.mjs`); `next build` compiled; both run against the unreleased kit build copied into `node_modules` and then restored (§11).

- 2026-11-21: **D14, backend PRD-049 B0.1.** See §12. Files: `utils/assistant-replies.util.js` (`offerPerson` / `messageTeam` / `question` / `handoff` / `cancelledChat` on replies, `getTeamStatusLines`, `formatTeamBackAt`, `MESSAGE_THE_TEAM`, `DISCARD_DRAFT`; the FAQs' answer is used for `offerPerson` even with answers off; `resetMisses` gone), `AssistantOverlay.jsx` (header "Talk to us", `talkToTeam`, the restored draft, the team status lines), `AssistantTranscript.jsx` (quiet "Talk to us", "Message the team"), `AssistantInput.jsx` (`getValue()`, `clear()`), `assistant.css` (`.assistant_header_talk`, `.assistant_talk`, `.assistant_team_status`). Tests 214/214 (+2 net in `test/assistant.test.mjs`), run against the working-tree kit build through a temporary resolve hook outside the repo (the pinned v1.5.0 lacks the store chat exports, so plain `npm test` fails that one file as before); the JSX parses with Next's SWC. Not run: `next build`, the browser, a live backend.

## 11. Dynamic answers and "Talk to us" (backend PRD-049 step B0)

**Decision:** D13 (backend PRD-049 D14, D15). The look, launcher, orb, ripple, transcript and dictation are unchanged; the reply logic and "Talk to us" change.

**Routing (`getAssistantReply`, in this order):**
1. A running "Talk to us" flow takes the text as the message (or "Cancel").
2. **Live data first** when the intent is clear: navigation, orders, new arrivals, offers, collections, greetings and thanks never ask the FAQs (their answers depend on the shopper's data, which FAQs can't know).
3. **"Talk to us"** ("talk to us", "a human", "leave a message", "reply to the team"): signed-in → "What would you like to tell the team?", then the next message goes to `sendStoreChatMessage`; guest → the store's `signInPrompt` and "Sign in" (`/login?next=<this page>?chat=open`); the store not taking messages, or the backend unreachable → the contact details (email, contact page).
4. **The store's FAQs** (`askStoreChat`, through the kit) for delivery, exchanges, payment, sizing, contact, product words and anything else. A match is the answer (with its links: site paths, or https links in a new tab).
5. **Our scripted answers** when the FAQs miss, are off or can't be reached, so the assistant works before staff fill in their FAQs (the backend seeds them switched off). Product words then search the catalog.
6. **A miss** only when nothing answered (the fallback, or a product search that found nothing): the FAQs' "Did you mean" questions as chips and, ~~on the second miss in a row~~ (superseded by §12, D14: with every answer while the store takes messages, the backend's `offerPerson`), "Would you like to message the team?" with a clear "Message the team".

**Store texts:** once the store's answers are on (`answersEnabled`), the welcome, the intro bubble and the quick buttons are the store's (`storeChatConfig`; a button sends its `question`); otherwise ours. "Talk to us" is added to the buttons while the store takes messages. The hover bubble stays ours. Note for the owner: the backend's defaults have answers on with generic texts, so save the Deveshe welcome, bubble text and buttons in the dashboard (Inbox › Chat answers) before this ships, or the generic ones show.

**Replies:** while the assistant is open and the shopper is signed in, the kit reads the thread every 5 s (15 s in a hidden tab). On the first read the latest 6 messages show as history; then each new reply from the team appears with a "The team" label and a "Reply to the team" chip. The thread lives on the server; the assistant's own conversation stays in memory. The backend emails the shopper "The store replied" with a link to `/?chat=open`; the launcher opens the assistant for `?chat=open` on any page (also after signing in from the chat) and removes it from the address.

**Send failures:** `CHAT_SIGN_IN_REQUIRED` → the sign-in prompt; `CHAT_MESSAGING_OFF` → the contact details; `RATE_LIMITED` (20 an hour) → "You've sent a lot of messages…" with the contact page; anything else → "I couldn't send that" with the flow still open.

**Kit release needed:** the store imports `useStoreChat`, `useStoreChatConfig`, `takeStoreChatOpenRequest`, `withStoreChatOpen`, `toStoreChatLinkHref` and `isExternalStoreChatLink`, which ship in kit 1.6.0 (not released). Until `package.json` pins it (`#v1.6.0`, with the lockfile), `npm test` and `npm run build` fail on the missing exports. Verified on 2026-11-20 by copying the local kit build into `node_modules/@zcom/storefront-kit/dist`, running `npm test` (212/212) and `next build` (compiled; the prerender then stopped on `/blogs` because no gateway was running on :4000, as before), and restoring the original copy byte for byte.

**Not checked:** the browser, a live backend (the Inbox round trip, the email link) and phones. `submitContactForm` is no longer used by the assistant (the contact page still uses it).

## 12. Talk to us everywhere, team hours, the question kept through sign-in (backend PRD-049 step B0.1)

**Decision:** D14 (backend PRD-049 D17). Needs the backend's B0.1 fields and kit 1.6.0 (unreleased; the B0.1 kit changes are folded into it).

- **Header:** a "Talk to us" pill beside the close button while the store takes messages (`canTalkToUs`). It starts the "Talk to us" flow (§11 item 3); a guest's text already in the message box is kept for after sign-in. While the flow is running it only focuses the box.
- **Under every answer:** the kit's `askStoreChat` now returns `offerPerson` with every answer while the store takes messages, so an FAQ answer, and our own scripted answer to a question the FAQs were asked about, carries a quiet underlined "Talk to us" (and loses the "Talk to us" chip, so it isn't shown twice). Live-data answers (orders, new arrivals, offers, collections, greetings) don't ask the FAQs, so they have none; the header button covers them.
- **After a miss:** "I don't have an answer for that yet. … Would you like to message the team?" ends with a filled "Message the team" button (latest reply only), also when the store's FAQs are off. Tapping it, or the quiet "Talk to us", starts the flow with the shopper's question in the message box (signed in) or keeps it for after sign-in (guest). Nothing is sent until the shopper taps send.
- **Team hours:** near the message box, while the shopper is writing to the team or was just handed to them (the flow, the sign-in prompt, "Sent!"): the store's `replyTime` and, while `isOpen` is false, its `awayMessage` and "The team is back Mon 23 Nov, 10:00 am. You can still send a message now, and we'll email you their reply." (`nextOpenAt`, in the shopper's locale, Asia/Kolkata time). Empty texts are left out.
- **Kept through sign-in:** a guest's question goes into the kit's draft (`saveDraft`, session storage, 30 minutes). The sign-in link returns with `?chat=open` (unchanged), which opens the assistant; once signed in the kit's `pendingDraft` is put back in the message box with "Here's the message you started before signing in…" and a "Don't send" chip, and the flow is open. The shopper taps send (the kit drops the draft once sent) or "Don't send" (dropped, box cleared). It is offered once per draft per visit.
- **Removed:** the miss count (`resetMisses`), which the kit no longer has.

