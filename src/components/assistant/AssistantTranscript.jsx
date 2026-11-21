"use client";

/**
 * The conversation (DD-PRD-001 FR-12, FR-13, FR-23)
 *
 * The shopper's messages on the right, the assistant's on the left. A new
 * reply reveals letter by letter (GSAP SplitText, each letter arriving in
 * red and settling to the text colour); screen readers get the whole text
 * at once from a visually hidden copy, the animated copy is `aria-hidden`.
 * Under a reply: product cards, orders, offers with "copy code", links and
 * the latest reply's follow-up chips. New messages scroll into view unless
 * the shopper has scrolled up; then "Scroll to latest" appears. Replies
 * from the store's team (backend PRD-049 B0, `from: "store"`) carry a
 * "The team" label; the store's https links open in a new tab. Since B0.1
 * (D17) an answer the store offers a person with (`offerPerson`) has a
 * quiet "Talk to us" under it, and the latest reply after a miss
 * (`messageTeam`) ends with a clear "Message the team".
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { SplitText } from "gsap/dist/SplitText";
import { FiArrowDown } from "react-icons/fi";
import { getProductGridCardProps } from "@/components/common/card/ProductGridCard";
import {
  ASSISTANT_LIST_ID,
  ASSISTANT_LIST_NAME,
  prefersReducedMotion,
} from "@/components/assistant/assistant.constants";
import { trackSelectItem } from "@/utils/analytics-events.util";
import {
  getRevealDuration,
  MESSAGE_THE_TEAM,
  TALK_TO_US,
} from "@/utils/assistant-replies.util";

// ─── Constants ────────────────────────────────────────────────────────────

const REVEAL_ACCENT = "#fe0000";
const LETTER_FADE_S = 0.35;
const STICK_DISTANCE_PX = 32;
const JUMP_DISTANCE_PX = 120;
const COPIED_MS = 2000;

// ─── Reveal ───────────────────────────────────────────────────────────────

/** The animated copy of a reply: one block per line, revealed once. */
const RevealText = ({ text, animate, onRevealed }) => {
  const visualRef = useRef(null);
  const onRevealedRef = useRef(onRevealed);

  useEffect(() => {
    onRevealedRef.current = onRevealed;
  });

  useLayoutEffect(() => {
    const element = visualRef.current;
    if (!element) return undefined;
    element.replaceChildren(
      ...String(text || "")
        .split("\n")
        .map((line) => {
          const span = document.createElement("span");
          span.className = "assistant_line";
          span.textContent = line || " ";
          return span;
        }),
    );
    if (!animate) return undefined;

    gsap.registerPlugin(SplitText);
    // Spans inside the paragraph; no aria labels (this copy is hidden)
    const split = new SplitText(element.querySelectorAll(".assistant_line"), {
      type: "words,chars",
      tag: "span",
      aria: "none",
    });
    const colour = getComputedStyle(element).color;
    const total = getRevealDuration(text) / 1000;
    const each =
      split.chars.length > 1
        ? Math.max(0, total - LETTER_FADE_S) / split.chars.length
        : 0;
    const tween = gsap.fromTo(
      split.chars,
      { opacity: 0, color: REVEAL_ACCENT },
      {
        opacity: 1,
        color: colour,
        duration: LETTER_FADE_S,
        ease: "power1.out",
        stagger: each,
        onComplete: () => {
          split.revert();
          onRevealedRef.current?.();
        },
      },
    );
    return () => {
      tween.kill();
      split.revert();
    };
  }, [text, animate]);

  return (
    <span ref={visualRef} className="assistant_msg_visual" aria-hidden="true" />
  );
};

// ─── Reply extras ─────────────────────────────────────────────────────────

const ProductCards = ({ products }) => (
  <div className="assistant_cards">
    {products.map((product) => {
      const card = getProductGridCardProps(product);
      if (!card.href || card.href === "/product/") return null;
      return (
        <Link
          key={product._id || card.href}
          href={card.href}
          className="assistant_card"
          onClick={() =>
            trackSelectItem(product, ASSISTANT_LIST_NAME, ASSISTANT_LIST_ID)
          }
        >
          <span className="assistant_card_image">
            {card.src ? (
              <Image src={card.src} alt={card.alt} fill sizes="160px" />
            ) : null}
          </span>
          <span className="assistant_card_name">{card.name}</span>
          <span className="assistant_card_price">{card.price}</span>
        </Link>
      );
    })}
  </div>
);

const OrderList = ({ orders }) => (
  <ul className="assistant_orders">
    {orders.map((order) => (
      <li key={order.id}>
        <Link href={order.href} className="assistant_order">
          <span className="assistant_order_title">{order.title}</span>
          {order.meta && (
            <span className="assistant_order_meta">{order.meta}</span>
          )}
        </Link>
      </li>
    ))}
  </ul>
);

const OfferList = ({ offers }) => {
  const [copied, setCopied] = useState("");

  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      window.setTimeout(
        () => setCopied((current) => (current === code ? "" : current)),
        COPIED_MS,
      );
    } catch {
      setCopied("");
    }
  };

  return (
    <ul className="assistant_offers">
      {offers.map((offer) => (
        <li key={offer.code} className="assistant_offer">
          <div className="assistant_offer_text">
            <p className="assistant_offer_title">{offer.title}</p>
            {offer.detail && (
              <p className="assistant_offer_detail">{offer.detail}</p>
            )}
          </div>
          <button
            type="button"
            className="assistant_offer_copy"
            aria-label={`Copy the code ${offer.code}`}
            onClick={() => copy(offer.code)}
          >
            {copied === offer.code ? "Copied" : offer.code}
          </button>
        </li>
      ))}
    </ul>
  );
};

// ─── Message ──────────────────────────────────────────────────────────────

const AssistantMessage = ({
  message,
  isLatest,
  animate,
  onChip,
  onTalk,
  onRevealed,
}) => {
  const isUser = message.role === "user";
  // B0.1: a clear button on the latest miss, a quiet one under answers
  const showMessageTeam = !isUser && isLatest && message.messageTeam;
  const showTalk =
    !isUser && !showMessageTeam && (message.offerPerson || message.messageTeam);
  const hasExtras =
    !isUser &&
    (message.products?.length ||
      message.orders?.length ||
      message.offers?.length ||
      message.links?.length ||
      showMessageTeam ||
      showTalk ||
      (isLatest && message.chips?.length));

  return (
    <>
      {message.text ? (
        <div className={`assistant_msg ${isUser ? "is-user" : "is-assistant"}`}>
          {isUser ? (
            <p className="assistant_msg_text">{message.text}</p>
          ) : (
            <p className="assistant_msg_text">
              {message.from === "store" && (
                <span className="assistant_msg_from">The team</span>
              )}
              <span className="assistant_sr_only">{message.text}</span>
              <RevealText
                text={message.text}
                animate={animate}
                onRevealed={() => onRevealed(message.id)}
              />
            </p>
          )}
        </div>
      ) : null}
      {hasExtras ? (
        <div
          className={`assistant_extras${animate ? " is-entering" : ""}`}
          style={
            animate
              ? { animationDelay: `${getRevealDuration(message.text)}ms` }
              : undefined
          }
        >
          {message.products?.length > 0 && (
            <ProductCards products={message.products} />
          )}
          {message.orders?.length > 0 && <OrderList orders={message.orders} />}
          {message.offers?.length > 0 && <OfferList offers={message.offers} />}
          {message.links?.length > 0 && (
            <div className="assistant_links">
              {message.links.map((link) =>
                link.external ? (
                  <a
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    className="assistant_link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                    <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    className="assistant_link"
                  >
                    {link.label}
                    <span aria-hidden="true">→</span>
                  </Link>
                ),
              )}
            </div>
          )}
          {isLatest && message.chips?.length > 0 && (
            <div className="assistant_chips">
              {message.chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className="assistant_chip"
                  onClick={() => onChip(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
          {showMessageTeam && (
            <button
              type="button"
              className="assistant_talk is-primary"
              onClick={() => onTalk(message.question)}
            >
              {MESSAGE_THE_TEAM}
            </button>
          )}
          {showTalk && (
            <button
              type="button"
              className="assistant_talk"
              aria-label="Talk to us about this"
              onClick={() => onTalk(message.question)}
            >
              {TALK_TO_US}
            </button>
          )}
        </div>
      ) : null}
    </>
  );
};

// ─── Transcript ───────────────────────────────────────────────────────────

const AssistantTranscript = ({
  messages,
  thinkingText,
  onChip,
  onTalk,
  onRevealed,
}) => {
  const scrollRef = useRef(null);
  const listRef = useRef(null);
  const stickRef = useRef(true);
  const [reducedMotion] = useState(prefersReducedMotion);
  const [jumpVisible, setJumpVisible] = useState(false);

  const scrollToEnd = (smooth) => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    scroller.scrollTo({
      top: scroller.scrollHeight,
      behavior: smooth && !reducedMotion ? "smooth" : "auto",
    });
  };

  const handleScroll = () => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const distance =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    stickRef.current = distance < STICK_DISTANCE_PX;
    setJumpVisible(distance > JUMP_DISTANCE_PX);
  };

  // New messages come into view unless the shopper scrolled up
  useLayoutEffect(() => {
    if (stickRef.current) scrollToEnd(false);
  }, [messages.length, thinkingText]);

  // So do replies that grow as they reveal or as their images load
  useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;
    const observer = new ResizeObserver(() => {
      if (stickRef.current) scrollToEnd(false);
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  const lastIndex = messages.length - 1;

  return (
    <div className="assistant_transcript">
      <div
        ref={scrollRef}
        className="assistant_transcript_scroll"
        role="log"
        aria-label="Conversation"
        onScroll={handleScroll}
      >
        <div ref={listRef} className="assistant_transcript_list">
          {messages.map((message, index) => (
            <AssistantMessage
              key={message.id}
              message={message}
              isLatest={index === lastIndex && message.role === "assistant"}
              animate={
                message.role === "assistant" &&
                !message.revealed &&
                !reducedMotion
              }
              onChip={onChip}
              onTalk={onTalk}
              onRevealed={onRevealed}
            />
          ))}
          {thinkingText && (
            <div className="assistant_msg is-assistant is-thinking">
              <p className="assistant_msg_text">{thinkingText}</p>
            </div>
          )}
        </div>
      </div>
      {jumpVisible && (
        <button
          type="button"
          className="assistant_jump"
          aria-label="Scroll to latest"
          onClick={() => {
            stickRef.current = true;
            setJumpVisible(false);
            scrollToEnd(true);
          }}
        >
          <FiArrowDown aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default AssistantTranscript;
