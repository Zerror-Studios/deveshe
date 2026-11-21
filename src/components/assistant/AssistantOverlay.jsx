"use client";

/**
 * The shopping assistant (DD-PRD-001 FR-6..FR-26)
 *
 * Opens with a ripple from the launcher: a CSS radial mask on the stage
 * whose radius GSAP tweens over 1.1 s, with a blurring ring on its edge;
 * the content fades in after .65 s. Closing runs it back into the button
 * in .9 s. While open, the page stops scrolling and is `inert`, one history
 * entry makes Back close the assistant (FR-8), and links inside close it
 * before they navigate, so that entry never stays behind.
 *
 * Replies come from `getAssistantReply` on the store's existing reads
 * through the kit's Apollo client and, since backend PRD-049 B0 (D14,
 * D15), the store's own answers and "Talk to us" through the kit's
 * `useStoreChat`: the welcome and quick buttons are the ones staff edit in
 * the dashboard, a signed-in shopper's message goes to the store's Inbox,
 * and the team's replies are read every 5 s (15 s in a hidden tab) while
 * the assistant is open. Since B0.1 (D17) "Talk to us" sits in the header
 * and under every answer ("Message the team" after a miss), the message
 * box shows the team's reply time and, outside chat hours, when they are
 * back; a guest's question is kept through sign-in by the kit and put back
 * in the message box afterwards, never sent without the shopper's tap.
 * Prices stay the server's. The conversation lives
 * in `store/assistant-store.js`, in memory only. Loaded on demand by the
 * launcher (`ssr: false`).
 */

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useApolloClient } from "@apollo/client/react";
import { useStoreChat } from "@zcom/storefront-kit/client";
import gsap from "gsap";
import { FiMessageCircle, FiX } from "react-icons/fi";
import AssistantInput from "@/components/assistant/AssistantInput";
import AssistantOrb from "@/components/assistant/AssistantOrb";
import AssistantTranscript from "@/components/assistant/AssistantTranscript";
import DictationGlow from "@/components/assistant/DictationGlow";
import {
  ASSISTANT_CLOSE_MS,
  ASSISTANT_CONTENT_DELAY_MS,
  ASSISTANT_CONTENT_FADE_MS,
  ASSISTANT_DIALOG_ID,
  ASSISTANT_HISTORY_FALLBACK_MS,
  ASSISTANT_NAVIGATE_DELAY_MS,
  ASSISTANT_OPEN_MS,
  ASSISTANT_REDUCED_FADE_MS,
  ASSISTANT_REPLY_DELAY_MS,
  ASSISTANT_SLEEP_MS,
  prefersReducedMotion,
} from "@/components/assistant/assistant.constants";
import {
  GET_CATEGORIES,
  GET_PRODUCTS,
  GET_VALID_PROMOTIONS,
  ORDER_LIST,
} from "@/graphql";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import { useDictation } from "@/hooks/useDictation";
import { readVisitorId } from "@/hooks/useVisitor";
import { AssistantPhaseEnum, useAssistantStore } from "@/store/assistant-store";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { trackSearch } from "@/utils/analytics-events.util";
import {
  getErrorCode,
  getErrorMessage,
  getErrorReason,
} from "@/utils/api-error.util";
import { DICTATION_SOUND_LEVEL } from "@/utils/assistant-dictation.util";
import { getRippleRadius } from "@/utils/assistant-gradient.util";
import {
  ASSISTANT_COPY,
  AssistantActionEnum,
  ChatStepEnum,
  DISCARD_DRAFT,
  TALK_TO_US,
  getAssistantReply,
  getChatSendFailedReply,
  getChatSentReply,
  getQuickActions,
  getRevealDuration,
  getTeamStatusLines,
  getThinkingPhrase,
  getWelcomeText,
  matchAssistantIntent,
  toStoreReplyMessage,
} from "@/utils/assistant-replies.util";
import { toProductPageVariables } from "@/utils/catalog-listing.util";
import { ListingSortEnum } from "@/utils/listing-sort.util";

// ─── Constants ────────────────────────────────────────────────────────────

const Phase = AssistantPhaseEnum;

const BUSY_PHASES = new Set([Phase.THINKING, Phase.REPLYING]);
const SEARCH_LIMIT = 4;
const COLLECTION_LIMIT = 12;
const ORDER_LIMIT = 3;
const MESSAGE_MAX_LENGTH = 2000;
const LEVEL_BUMP_MS = 1000;
/** B0: earlier messages with the team shown when the assistant opens. */
const CHAT_HISTORY_LIMIT = 6;

// ─── Helpers ──────────────────────────────────────────────────────────────

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
const seconds = (ms) => ms / 1000;

/** FR-15: the error strip's words for a failed read or send. */
const toAssistantError = (error) =>
  getErrorCode(error) || getErrorReason(error)
    ? getErrorMessage(error, ASSISTANT_COPY.networkError)
    : ASSISTANT_COPY.networkError;

/** An internal path for a click on a same-origin link, else null. */
const getInternalHref = (event) => {
  const anchor = event.target?.closest?.("a[href]");
  if (
    !anchor ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    anchor.target === "_blank"
  ) {
    return null;
  }
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  return `${url.pathname}${url.search}${url.hash}`;
};

// ─── Component ────────────────────────────────────────────────────────────

const AssistantOverlay = () => {
  const router = useRouter();
  const client = useApolloClient();

  const isOpen = useAssistantStore((state) => state.isOpen);
  const phase = useAssistantStore((state) => state.phase);
  const messages = useAssistantStore((state) => state.messages);
  const hasInteracted = useAssistantStore((state) => state.hasInteracted);
  const error = useAssistantStore((state) => state.error);
  const hasMessages = messages.length > 0;

  // B0: the store's answers, "Talk to us" and the team's replies (polled
  // only while open and signed in)
  const storeChat = useStoreChat({ open: isOpen });
  const {
    ask: askStore,
    send: sendToTeam,
    config: chatConfig,
    canTalkToUs,
    pendingDraft,
  } = storeChat;
  const chatFlow = useAssistantStore((state) => state.chatFlow);

  const [thinkingText, setThinkingText] = useState(null);
  const [isRendered, setIsRendered] = useState(false);

  const rootRef = useRef(null);
  const rippleRef = useRef(null);
  const stageRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const levelsRef = useRef({ mic: 0 });
  const timelineRef = useRef(null);
  const replyTokenRef = useRef(0);
  const sendingRef = useRef(false);
  const historyEntryRef = useRef(false);
  const pendingExitRef = useRef(null);
  const idleTimerRef = useRef(null);
  const phaseTimerRef = useRef(null);
  const lastLevelBumpRef = useRef(0);
  const latestRef = useRef({});
  /** B0.1: the kept draft already put back in the message box. */
  const offeredDraftRef = useRef(null);

  // D12: replies are silent (no voice)
  const stopVoice = useCallback(() => {}, []);

  // ─── Activity (FR-11: the orb sleeps after 45 s) ───────────────────────

  const bump = useCallback(() => {
    window.clearTimeout(idleTimerRef.current);
    const state = useAssistantStore.getState();
    if (!state.isOpen) return;
    if (state.phase === Phase.SLEEPING) state.setPhase(Phase.LISTENING);
    idleTimerRef.current = window.setTimeout(() => {
      const current = useAssistantStore.getState();
      if (current.isOpen && current.phase === Phase.LISTENING) {
        current.setPhase(Phase.SLEEPING);
      }
    }, ASSISTANT_SLEEP_MS);
  }, []);

  // ─── Dictation (FR-16..FR-20) ──────────────────────────────────────────

  const dictation = useDictation({
    onConfirm: (text) => {
      inputRef.current?.insert(text);
      bump();
    },
    onError: (message) => useAssistantStore.getState().setError(message),
    onLevel: (level) => {
      levelsRef.current.mic = level;
      const now = performance.now();
      if (
        level > DICTATION_SOUND_LEVEL &&
        now - lastLevelBumpRef.current > LEVEL_BUMP_MS
      ) {
        lastLevelBumpRef.current = now;
        bump();
      }
    },
  });
  const { cancel: cancelDictation, start: startListening } = dictation;

  useEffect(() => {
    const state = useAssistantStore.getState();
    if (dictation.isDictating) state.setPhase(Phase.DICTATING);
    else if (state.phase === Phase.DICTATING) state.setPhase(Phase.LISTENING);
  }, [dictation.isDictating]);

  // ─── Replies ───────────────────────────────────────────────────────────

  /**
   * FR-12, FR-22: "replying" while the reply reveals or is read aloud;
   * `speech` replaces `text` aloud (no contact details, D10).
   */
  const playReply = useCallback(
    (text, token, speech) => {
      const toListening = () => {
        if (replyTokenRef.current !== token) return;
        const state = useAssistantStore.getState();
        if (state.phase === Phase.REPLYING) state.setPhase(Phase.LISTENING);
        bump();
      };
      window.clearTimeout(phaseTimerRef.current);
      useAssistantStore.getState().setPhase(Phase.REPLYING);
      phaseTimerRef.current = window.setTimeout(
        toListening,
        getRevealDuration(text),
      );
    },
    [bump],
  );

  /** Stops a reply in progress (Stop, a new message, dictation, close). */
  const interrupt = useCallback(() => {
    if (sendingRef.current) return;
    replyTokenRef.current += 1;
    window.clearTimeout(phaseTimerRef.current);
    stopVoice();
    setThinkingText(null);
    const state = useAssistantStore.getState();
    if (BUSY_PHASES.has(state.phase)) state.setPhase(Phase.LISTENING);
  }, [stopVoice]);

  /** FR-25: the store's existing reads, through the kit's client. */
  const loaders = useMemo(
    () => ({
      searchProducts: async (term, { newest = false } = {}) => {
        const { data } = await client.query({
          query: GET_PRODUCTS,
          variables: toProductPageVariables({
            filters: term ? { search: term } : {},
            limit: SEARCH_LIMIT,
            offset: 0,
            sort: newest ? ListingSortEnum.NEWEST : undefined,
          }),
        });
        const page = data?.getClientSideProducts;
        return {
          products: page?.products || [],
          totalCount: page?.totalCount || 0,
        };
      },
      getCollections: async () => {
        const { data } = await client.query({
          query: GET_CATEGORIES,
          variables: { offset: 0, limit: COLLECTION_LIMIT },
        });
        return data?.getClientSideCategories?.categories || [];
      },
      getOffers: async () => {
        const guestId = readVisitorId();
        const { data } = await client.query({
          query: GET_VALID_PROMOTIONS,
          variables: guestId ? { guestId } : {},
          fetchPolicy: "network-only",
        });
        return data?.getAllValidPromotions || [];
      },
      getMyOrders: async () => {
        try {
          const { data } = await client.query({
            query: ORDER_LIST,
            variables: { limit: ORDER_LIMIT, offset: 0 },
            fetchPolicy: "network-only",
          });
          return data?.myOrders?.orders || [];
        } catch (failure) {
          // The session ended: answer as for a guest
          if (getErrorCode(failure) === "UNAUTHENTICATED") return null;
          throw failure;
        }
      },
      // B0: the store's FAQs (B0.1: `offerPerson` with every answer)
      askStore,
    }),
    [client, askStore],
  );

  /** B0: the chat's state for the reply engine, read when a message goes. */
  const readChat = useCallback(() => {
    const current = latestRef.current.storeChat;
    return {
      messagingEnabled: !!current?.messagingEnabled,
      signedIn: !!current?.signedIn,
      signInPrompt: current?.config?.signInPrompt || "",
      returnPath: `${window.location.pathname}${window.location.search}`,
    };
  }, []);

  // ─── Closing (FR-7, FR-8) ──────────────────────────────────────────────

  const finishClose = useCallback(() => {
    historyEntryRef.current = false;
    useAssistantStore.getState().close();
    const exit = pendingExitRef.current;
    pendingExitRef.current = null;
    if (exit?.openBag) useCartStore.getState().openCart();
    if (exit?.href) router.push(exit.href);
  }, [router]);

  const stopEverything = useCallback(() => {
    replyTokenRef.current += 1;
    window.clearTimeout(phaseTimerRef.current);
    window.clearTimeout(idleTimerRef.current);
    stopVoice();
    cancelDictation();
    setThinkingText(null);
  }, [stopVoice, cancelDictation]);

  /** Closes, then goes to `href` or opens the bag, after the Back step. */
  const requestClose = useCallback(
    ({ href = null, openBag = false } = {}) => {
      stopEverything();
      pendingExitRef.current = { href, openBag };
      if (historyEntryRef.current && window.history.state?.zcAssistant) {
        window.history.back();
        window.setTimeout(() => {
          if (useAssistantStore.getState().isOpen) finishClose();
        }, ASSISTANT_HISTORY_FALLBACK_MS);
        return;
      }
      finishClose();
    },
    [stopEverything, finishClose],
  );

  const handleEscape = useCallback(() => {
    if (dictation.isDictating) cancelDictation();
    else requestClose();
  }, [dictation.isDictating, cancelDictation, requestClose]);

  // ─── Sending (FR-23..FR-26) ────────────────────────────────────────────

  const sendMessage = useCallback(
    async (raw) => {
      const text = String(raw || "").trim().slice(0, MESSAGE_MAX_LENGTH);
      if (!text || sendingRef.current) return;
      const store = useAssistantStore.getState();
      if (BUSY_PHASES.has(store.phase)) interrupt();
      stopVoice();
      bump();
      store.setError(null);
      store.addMessage({ role: "user", text });

      const token = (replyTokenRef.current += 1);
      const intent = store.chatFlow ? null : matchAssistantIntent(text).intent;
      setThinkingText(getThinkingPhrase(intent));
      store.setPhase(Phase.THINKING);
      const startedAt = performance.now();

      let reply;
      try {
        const auth = useAuthStore.getState();
        const chat = readChat();
        reply = await getAssistantReply(text, {
          chatFlow: useAssistantStore.getState().chatFlow,
          isLoggedIn: auth.isLoggedIn,
          chat,
          loaders,
        });
        if (reply.action?.type === AssistantActionEnum.SEND_CHAT) {
          // B0: to the store's Inbox; the flow ends even if the shopper
          // has closed meanwhile
          sendingRef.current = true;
          let result;
          try {
            result = await sendToTeam(reply.action.text);
          } finally {
            sendingRef.current = false;
          }
          if (result.message) {
            // The kit drops a draft kept through sign-in once it is sent
            useAssistantStore.getState().markChatSeen([result.message.id]);
            reply = getChatSentReply();
          } else {
            reply = getChatSendFailedReply(result.error, chat);
          }
          useAssistantStore.getState().setChatFlow(reply.chatFlow || null);
        }
      } catch (failure) {
        if (replyTokenRef.current !== token) return;
        setThinkingText(null);
        const current = useAssistantStore.getState();
        current.setError(toAssistantError(failure));
        current.setPhase(Phase.LISTENING);
        return;
      }

      const remaining =
        ASSISTANT_REPLY_DELAY_MS - (performance.now() - startedAt);
      if (remaining > 0) await wait(remaining);
      if (replyTokenRef.current !== token) return;

      setThinkingText(null);
      const current = useAssistantStore.getState();
      current.setChatFlow(reply.chatFlow || null);
      if (reply.cancelledChat) {
        // B0.1: "Don't send" drops a message kept through sign-in
        latestRef.current.storeChat?.discardDraft();
        inputRef.current?.clear();
      }
      if (reply.searchTerm) trackSearch(reply.searchTerm, reply.resultCount);
      current.addMessage({
        role: "assistant",
        text: reply.text,
        products: reply.products,
        orders: reply.orders,
        offers: reply.offers,
        links: reply.links,
        chips: reply.chips,
        // B0.1: "Talk to us" under the answer, "Message the team" after a miss
        offerPerson: !!reply.offerPerson,
        messageTeam: !!reply.messageTeam,
        question: reply.question || "",
        handoff: !!reply.handoff,
      });
      playReply(reply.text, token, reply.speech);

      const action = reply.action;
      if (
        action?.type === AssistantActionEnum.NAVIGATE ||
        action?.type === AssistantActionEnum.OPEN_BAG
      ) {
        window.setTimeout(() => {
          if (replyTokenRef.current !== token) return;
          requestClose(
            action.type === AssistantActionEnum.OPEN_BAG
              ? { openBag: true }
              : { href: action.href },
          );
        }, ASSISTANT_NAVIGATE_DELAY_MS);
      }
    },
    [
      interrupt,
      stopVoice,
      bump,
      loaders,
      readChat,
      sendToTeam,
      playReply,
      requestClose,
    ],
  );

  /**
   * B0.1: "Talk to us" from the header or under an answer. A guest's
   * `question` (or the text in the box) is kept through sign-in by the
   * kit; a signed-in shopper starts the message with it in the box. Never
   * sends anything by itself.
   */
  const talkToTeam = useCallback(
    (question = "") => {
      const current = latestRef.current.storeChat;
      const typed = inputRef.current?.getValue?.() || "";
      const text = String(question || "").trim();
      if (useAssistantStore.getState().chatFlow) {
        // Already writing to the team: just help with the message
        if (text && !typed.trim()) inputRef.current?.insert(text);
        inputRef.current?.focus();
        return;
      }
      if (current?.messagingEnabled && !current.signedIn) {
        const draft = text || typed.trim();
        if (draft) current.saveDraft(draft);
      }
      void sendMessage(TALK_TO_US);
      if (current?.messagingEnabled && current.signedIn && text && !typed) {
        inputRef.current?.insert(text);
      }
    },
    [sendMessage],
  );

  const startDictation = useCallback(() => {
    if (BUSY_PHASES.has(useAssistantStore.getState().phase)) interrupt();
    stopVoice();
    bump();
    useAssistantStore.getState().setError(null);
    startListening();
  }, [interrupt, stopVoice, bump, startListening]);

  /**
   * FR-13: the welcome message, once, as the content fades in (the
   * store's own once its answers are on, B0).
   */
  const addWelcome = useCallback(() => {
    const state = useAssistantStore.getState();
    if (state.messages.length) return;
    const welcome = getWelcomeText(latestRef.current.storeChat?.config);
    state.addMessage({ role: "assistant", text: welcome });
    replyTokenRef.current += 1;
    playReply(welcome, replyTokenRef.current);
  }, [playReply]);

  // The timelines call these after renders; keep the latest at hand
  useLayoutEffect(() => {
    latestRef.current = { addWelcome, bump, storeChat };
  });

  // ─── The message kept through sign-in (B0.1) ───────────────────────────

  // Back from signing in: the kit holds what the guest typed; put it in
  // the message box with the "Talk to us" flow open. Never sent for them.
  useEffect(() => {
    if (!isOpen || !hasMessages || !pendingDraft || !canTalkToUs) return;
    if (offeredDraftRef.current === pendingDraft) return;
    offeredDraftRef.current = pendingDraft;
    const state = useAssistantStore.getState();
    state.setChatFlow({ step: ChatStepEnum.COMPOSE });
    state.addMessage({
      role: "assistant",
      text: ASSISTANT_COPY.draftRestored,
      chips: [DISCARD_DRAFT],
      handoff: true,
    });
    replyTokenRef.current += 1;
    playReply(ASSISTANT_COPY.draftRestored, replyTokenRef.current);
    inputRef.current?.clear();
    inputRef.current?.insert(pendingDraft);
  }, [isOpen, hasMessages, pendingDraft, canTalkToUs, playReply]);

  // ─── The team's replies (B0) ───────────────────────────────────────────

  // The thread's messages join the conversation once: on the first read
  // the latest few as history, then each new reply from the team
  useEffect(() => {
    if (!isOpen || !hasMessages || !storeChat.threadLoaded) return;
    const state = useAssistantStore.getState();
    const seen = new Set(state.chatSeenIds);
    const fresh = storeChat.messages.filter((message) => !seen.has(message.id));
    if (!state.chatHistoryShown) {
      const history = fresh.slice(-CHAT_HISTORY_LIMIT);
      history.forEach((message, index) =>
        state.addMessage({
          ...toStoreReplyMessage(message, {
            isHistory: index < history.length - 1,
          }),
          revealed: true,
        }),
      );
      state.setChatHistoryShown(true);
    } else {
      fresh
        .filter((message) => message.from === "STORE")
        .forEach((message) => state.addMessage(toStoreReplyMessage(message)));
    }
    if (fresh.length) state.markChatSeen(fresh.map((message) => message.id));
  }, [isOpen, hasMessages, storeChat.threadLoaded, storeChat.messages]);

  // ─── Open and close (FR-6, FR-7) ───────────────────────────────────────

  useLayoutEffect(() => {
    const root = rootRef.current;
    const ripple = rippleRef.current;
    const stage = stageRef.current;
    const panel = panelRef.current;
    if (!root || !ripple || !stage || !panel) return;

    const state = useAssistantStore.getState();
    const reduced = prefersReducedMotion();
    const wasHidden = getComputedStyle(root).visibility === "hidden";
    timelineRef.current?.kill();

    if (isOpen) {
      const { x, y } = state.origin || {
        x: window.innerWidth - 72,
        y: window.innerHeight - 46,
      };
      const radius = getRippleRadius(
        x,
        y,
        window.innerWidth,
        window.innerHeight,
      );
      setIsRendered(true);
      state.setPhase(Phase.ENTERING);
      stage.classList.remove("is-revealed");
      gsap.set(root, {
        "--assistant-x": `${x}px`,
        "--assistant-y": `${y}px`,
        visibility: "visible",
        pointerEvents: "auto",
      });
      if (wasHidden) {
        gsap.set(root, { "--assistant-r": "0px", opacity: 1 });
        gsap.set(panel, { opacity: 0 });
      }

      const timeline = gsap.timeline({
        onComplete: () => {
          stage.classList.add("is-revealed");
          const current = useAssistantStore.getState();
          if (current.isOpen && current.phase === Phase.ENTERING) {
            current.setPhase(Phase.LISTENING);
          }
          latestRef.current.bump?.();
        },
      });
      if (reduced) {
        gsap.set(root, { "--assistant-r": `${radius}px` });
        timeline
          .fromTo(
            root,
            { opacity: wasHidden ? 0 : 1 },
            { opacity: 1, duration: seconds(ASSISTANT_REDUCED_FADE_MS) },
            0,
          )
          .to(
            panel,
            { opacity: 1, duration: seconds(ASSISTANT_REDUCED_FADE_MS) },
            0,
          )
          .call(() => latestRef.current.addWelcome?.(), null, 0);
      } else {
        gsap.set(root, { opacity: 1 });
        timeline
          .to(
            root,
            {
              "--assistant-r": `${radius}px`,
              duration: seconds(ASSISTANT_OPEN_MS),
              ease: "power2.inOut",
            },
            0,
          )
          .fromTo(
            ripple,
            { opacity: 0 },
            { opacity: 1, duration: 0.35, ease: "power1.out" },
            0,
          )
          .to(ripple, { opacity: 0, duration: 0.45, ease: "power1.in" }, 0.65)
          .to(
            panel,
            {
              opacity: 1,
              duration: seconds(ASSISTANT_CONTENT_FADE_MS),
              ease: "power1.out",
            },
            seconds(ASSISTANT_CONTENT_DELAY_MS),
          )
          .call(
            () => latestRef.current.addWelcome?.(),
            null,
            seconds(ASSISTANT_CONTENT_DELAY_MS),
          );
      }
      timelineRef.current = timeline;
      return;
    }

    if (wasHidden) return;
    state.setPhase(Phase.EXITING);
    // Collapse into the button where it is now, from a radius that still
    // covers the screen if the window changed size while open
    const button = document
      .querySelector(".assistant_launcher_btn")
      ?.getBoundingClientRect();
    if (button?.width) {
      gsap.set(root, {
        "--assistant-x": `${button.left + button.width / 2}px`,
        "--assistant-y": `${button.top + button.height / 2}px`,
      });
    }
    if (stage.classList.contains("is-revealed")) {
      const x = button?.width
        ? button.left + button.width / 2
        : window.innerWidth - 72;
      const y = button?.width
        ? button.top + button.height / 2
        : window.innerHeight - 46;
      gsap.set(root, {
        "--assistant-r": `${getRippleRadius(x, y, window.innerWidth, window.innerHeight)}px`,
      });
    }
    stage.classList.remove("is-revealed");
    gsap.set(root, { pointerEvents: "none" });
    const timeline = gsap.timeline({
      onComplete: () => {
        gsap.set(root, { visibility: "hidden" });
        setIsRendered(false);
        useAssistantStore.getState().setPhase(Phase.IDLE);
      },
    });
    if (reduced) {
      timeline.to(root, {
        opacity: 0,
        duration: seconds(ASSISTANT_REDUCED_FADE_MS),
      });
    } else {
      timeline
        .to(
          panel,
          {
            opacity: 0,
            duration: seconds(ASSISTANT_CONTENT_FADE_MS),
            ease: "power1.in",
          },
          0,
        )
        .to(
          root,
          {
            "--assistant-r": "0px",
            duration: seconds(ASSISTANT_CLOSE_MS),
            ease: "power2.inOut",
          },
          0,
        )
        .fromTo(ripple, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.1)
        .to(ripple, { opacity: 0, duration: 0.3 }, 0.6);
    }
    timelineRef.current = timeline;
  }, [isOpen]);

  // ─── While open: scroll, inert page, Back (FR-6, FR-8) ─────────────────

  // Declared before useDialogA11y: on close this cleanup runs first, so
  // the page is no longer inert when focus goes back to the launcher.
  useEffect(() => {
    if (!isOpen) return undefined;
    const page = document.querySelector(".home-wrapper");
    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    page?.setAttribute("inert", "");
    return () => {
      body.style.overflow = previousOverflow;
      page?.removeAttribute("inert");
    };
  }, [isOpen]);

  useDialogA11y(panelRef, isOpen, handleEscape);

  // Pointer devices start in the field; touch skips it (no keyboard pops up)
  useEffect(() => {
    if (!isOpen) return;
    if (window.matchMedia?.("(pointer: fine)").matches) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    if (!window.history.state?.zcAssistant) {
      window.history.pushState(
        { ...(window.history.state || {}), zcAssistant: true },
        "",
      );
    }
    historyEntryRef.current = true;
    const handlePopState = (event) => {
      if (event.state?.zcAssistant) return;
      historyEntryRef.current = false;
      stopEverything();
      finishClose();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isOpen, stopEverything, finishClose]);

  useEffect(
    () => () => {
      timelineRef.current?.kill();
      window.clearTimeout(idleTimerRef.current);
      window.clearTimeout(phaseTimerRef.current);
      replyTokenRef.current += 1;
    },
    [],
  );

  // ─── Render ────────────────────────────────────────────────────────────

  const handleClickCapture = (event) => {
    const href = getInternalHref(event);
    if (!href) return;
    event.preventDefault();
    requestClose({ href });
  };

  if (typeof document === "undefined") return null;

  const canInterrupt = BUSY_PHASES.has(phase);
  const { markRevealed, setError } = useAssistantStore.getState();
  // B0.1: the reply time and away line near the message box, while the
  // shopper is writing to the team or was just handed to them
  const lastMessage = messages[messages.length - 1];
  const teamLines =
    canTalkToUs && (chatFlow || lastMessage?.handoff)
      ? getTeamStatusLines(storeChat)
      : [];

  return createPortal(
    <div ref={rootRef} className="assistant_root" data-lenis-prevent>
      <div ref={rippleRef} className="assistant_ripple" aria-hidden="true" />
      <div ref={stageRef} className="assistant_stage">
        <div
          ref={panelRef}
          id={ASSISTANT_DIALOG_ID}
          className="assistant_panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assistant_title"
          tabIndex={-1}
          onClickCapture={handleClickCapture}
          onPointerDown={bump}
          onKeyDown={bump}
        >
          <h2 id="assistant_title" className="assistant_sr_only">
            Shopping assistant
          </h2>
          <p className="assistant_sr_only" aria-live="polite">
            {dictation.isDictating ? "Listening to you" : ""}
          </p>

          {/* B0.1: Talk to us and the close button, top right */}
          <header className="assistant_header">
            <div className="assistant_actions">
              {canTalkToUs && (
                <button
                  type="button"
                  className="assistant_header_talk"
                  aria-label="Talk to us: message the team"
                  onClick={() => talkToTeam()}
                >
                  <FiMessageCircle aria-hidden="true" />
                  <span>{TALK_TO_US}</span>
                </button>
              )}
              <button
                type="button"
                className="assistant_icon_btn is-close"
                aria-label="Close the shopping assistant"
                onClick={() => requestClose()}
              >
                <FiX aria-hidden="true" />
              </button>
            </div>
          </header>

          <div
            className={`assistant_content${hasInteracted ? " is-interacted" : ""}`}
          >
            <div className="assistant_conversation">
              <AssistantTranscript
                messages={messages}
                thinkingText={phase === Phase.THINKING ? thinkingText : null}
                onChip={sendMessage}
                onTalk={talkToTeam}
                onRevealed={markRevealed}
              />
              {error && (
                <div className="assistant_error" role="alert">
                  <span>{error}</span>
                  <button
                    type="button"
                    aria-label="Dismiss the error"
                    onClick={() => setError(null)}
                  >
                    <FiX aria-hidden="true" />
                  </button>
                </div>
              )}
              {/* A div: the site styles every <footer> (footer.css) */}
              <div className="assistant_footer">
                {!hasInteracted && messages.length > 0 && (
                  <div className="assistant_quick">
                    {getQuickActions(chatConfig).map((action, index) => (
                      <button
                        key={action.label}
                        type="button"
                        className="assistant_chip"
                        style={{ animationDelay: `${1.2 + index * 0.06}s` }}
                        onClick={() => sendMessage(action.question)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                {teamLines.length > 0 && (
                  <div className="assistant_team_status" aria-live="polite">
                    {teamLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                )}
                <AssistantInput
                  ref={inputRef}
                  canInterrupt={canInterrupt}
                  onSubmit={sendMessage}
                  onInterrupt={interrupt}
                  onDictate={startDictation}
                  onActivity={bump}
                  dictation={dictation}
                />
              </div>
            </div>
            <div
              className={`assistant_orb${hasInteracted ? " is-interacted" : ""}`}
            >
              <AssistantOrb
                phase={phase}
                active={isRendered}
                levelsRef={levelsRef}
              />
            </div>
          </div>
        </div>
        <DictationGlow visible={dictation.isDictating} />
      </div>
    </div>,
    document.body,
  );
};

export default AssistantOverlay;
