/**
 * Shopping assistant state (DD-PRD-001): open or closed, the phase, the
 * conversation and the "Talk to us" flow (backend PRD-049 B0).
 *
 * In memory only (FR-9): never persisted, so nothing the shopper typed
 * outlives a reload. The conversation stays while they move around the
 * site and shows again, without animation, when the assistant reopens.
 * A signed-in shopper's messages with the team live on the server (the
 * store's Inbox) and come back from there (`chatSeenIds` marks the ones
 * already shown).
 */

import { create } from "zustand";

// ─── Vocabulary ───────────────────────────────────────────────────────────

/** FR-10, FR-11: what the assistant is doing; the orb and status read it. */
export const AssistantPhaseEnum = {
  IDLE: "idle",
  ENTERING: "entering",
  LISTENING: "listening",
  THINKING: "thinking",
  REPLYING: "replying",
  DICTATING: "dictating",
  SLEEPING: "sleeping",
  EXITING: "exiting",
};

let lastMessageId = 0;

// ─── Store ────────────────────────────────────────────────────────────────

export const useAssistantStore = create((set) => ({
  isOpen: false,
  /** FR-3: the intro bubble stays quiet once the shopper has opened it. */
  hasOpened: false,
  /** The launcher's centre (px), where the ripple starts and ends. */
  origin: null,
  phase: AssistantPhaseEnum.IDLE,
  messages: [],
  /** True after the shopper's first message (chips go, the orb shrinks). */
  hasInteracted: false,
  /** B0: the running "Talk to us" flow, or null. */
  chatFlow: null,
  /** B0: ids of the team thread's messages already in the conversation. */
  chatSeenIds: [],
  /** B0: the thread's earlier messages were shown once. */
  chatHistoryShown: false,
  error: null,

  open: (origin) =>
    set((state) =>
      state.isOpen
        ? state
        : {
            isOpen: true,
            hasOpened: true,
            origin: origin || state.origin,
            error: null,
          },
    ),
  close: () => set((state) => (state.isOpen ? { isOpen: false } : state)),
  setPhase: (phase) => set({ phase }),
  setError: (error) => set({ error }),
  setChatFlow: (chatFlow) => set({ chatFlow }),
  markChatSeen: (ids) =>
    set((state) => ({
      chatSeenIds: [...new Set([...state.chatSeenIds, ...ids])],
    })),
  setChatHistoryShown: (chatHistoryShown) => set({ chatHistoryShown }),

  /** Adds a message and returns its id. */
  addMessage: (message) => {
    lastMessageId += 1;
    const id = `assistant-msg-${lastMessageId}`;
    set((state) => ({
      messages: [...state.messages, { ...message, id }],
      hasInteracted: state.hasInteracted || message.role === "user",
    }));
    return id;
  },

  /** FR-9: a message that has played its reveal shows at once from then on. */
  markRevealed: (id) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === id ? { ...message, revealed: true } : message,
      ),
    })),
}));
