"use client";

/**
 * The assistant's orb (DD-PRD-001 FR-11): the launcher's gradient inside
 * a soft circle, drawn on a canvas at half the frame rate while `active`.
 * Its pace and glow follow the phase: calm while listening, faster and
 * pulsing while thinking, pulsing with a reply, swelling with the
 * microphone while dictating, dim and slow while sleeping. With reduced
 * motion it draws one still frame per phase.
 */

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "@/components/assistant/assistant.constants";
import { AssistantPhaseEnum } from "@/store/assistant-store";
import { paintAssistantOrb } from "@/utils/assistant-gradient.util";
import { smoothLevel } from "@/utils/assistant-dictation.util";

// ─── Phases ───────────────────────────────────────────────────────────────

const PHASE_MOTION = {
  [AssistantPhaseEnum.IDLE]: { speed: 0.6, intensity: 0.85 },
  [AssistantPhaseEnum.ENTERING]: { speed: 1.4, intensity: 1 },
  [AssistantPhaseEnum.LISTENING]: { speed: 1, intensity: 1 },
  [AssistantPhaseEnum.THINKING]: { speed: 2.2, intensity: 1 },
  [AssistantPhaseEnum.REPLYING]: { speed: 1.6, intensity: 1 },
  [AssistantPhaseEnum.DICTATING]: { speed: 1.3, intensity: 1 },
  [AssistantPhaseEnum.SLEEPING]: { speed: 0.35, intensity: 0.55 },
  [AssistantPhaseEnum.EXITING]: { speed: 1.4, intensity: 1 },
};

/**
 * The level the orb swells to: the microphone, a thinking pulse, or the
 * reply: the server voice's own level while it speaks, else a soft pulse.
 */
const getTargetLevel = (phase, clock, micLevel, voiceLevel) => {
  if (phase === AssistantPhaseEnum.DICTATING) return micLevel;
  if (phase === AssistantPhaseEnum.THINKING) {
    return 0.18 + 0.18 * Math.sin(clock * 6);
  }
  if (phase === AssistantPhaseEnum.REPLYING) {
    if (voiceLevel > 0.02) return Math.min(1, voiceLevel * 1.4);
    return Math.max(
      0,
      0.3 + 0.2 * Math.sin(clock * 9.1) + 0.15 * Math.sin(clock * 13.7 + 1.3),
    );
  }
  return 0;
};

// ─── Component ────────────────────────────────────────────────────────────

const AssistantOrb = ({ phase, active, levelsRef }) => {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !ctx || !active) return undefined;

    let size = 0;
    let clock = 0;
    let speed = 1;
    let intensity = 1;
    let level = 0;
    let lastTime = performance.now();
    let skip = false;
    const still = prefersReducedMotion();

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      size = Math.max(1, Math.round(root.clientWidth * scale));
      canvas.width = size;
      canvas.height = size;
    };

    const paint = () => {
      const motion =
        PHASE_MOTION[phaseRef.current] ||
        PHASE_MOTION[AssistantPhaseEnum.LISTENING];
      if (still) {
        paintAssistantOrb(ctx, size, 1.5, { intensity: motion.intensity });
        return;
      }
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      skip = !skip;
      // Half the frame rate: the time still advances on skipped frames
      speed += (motion.speed - speed) * (1 - Math.exp(-dt / 0.4));
      intensity += (motion.intensity - intensity) * (1 - Math.exp(-dt / 0.6));
      clock += dt * speed;
      const target = getTargetLevel(
        phaseRef.current,
        clock,
        levelsRef?.current?.mic || 0,
        levelsRef?.current?.agent || 0,
      );
      level = smoothLevel(level, target, dt, 0.08, 0.3);
      if (skip) return;
      paintAssistantOrb(ctx, size, clock, { level, intensity });
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (still) paint();
    });
    observer.observe(root);
    resize();
    if (still) {
      paint();
      return () => observer.disconnect();
    }
    gsap.ticker.add(paint);
    return () => {
      gsap.ticker.remove(paint);
      observer.disconnect();
    };
  }, [active, levelsRef]);

  // A still orb redraws when the phase changes
  useEffect(() => {
    if (!active || !prefersReducedMotion()) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas.width) return;
    const motion =
      PHASE_MOTION[phase] || PHASE_MOTION[AssistantPhaseEnum.LISTENING];
    paintAssistantOrb(ctx, canvas.width, 1.5, { intensity: motion.intensity });
  }, [phase, active]);

  return (
    <div ref={rootRef} className="assistant_orb_canvas" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default AssistantOrb;
