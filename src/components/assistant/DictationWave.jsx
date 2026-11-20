"use client";

/**
 * The dictation waveform (DD-PRD-001 FR-17): bars scrolling right to left,
 * one every 100 ms, 2 px wide with 3 px gaps, each as tall as the loudest
 * level in its slot; dots stand where there has been no sound yet. Drawn
 * in the element's CSS `color`, from the level `getLevel()` returns.
 */

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  DICTATION_BAR_MS,
  getWaveBarHeight,
} from "@/utils/assistant-dictation.util";

const BAR_WIDTH_PX = 2;
const BAR_GAP_PX = 3;
const MIN_BAR_PX = 2;
const DOT_PX = 2;

const DictationWave = ({ getLevel }) => {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !ctx) return undefined;

    const bars = [];
    let width = 0;
    let height = 0;
    let scale = 1;
    let peak = 0;
    let elapsed = 0;
    let colour = "#fe0000";
    let colourFrames = 0;

    const resize = () => {
      scale = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.round(root.clientWidth * scale);
      height = Math.round(root.clientHeight * scale);
      canvas.width = width;
      canvas.height = height;
    };

    const draw = (_time, deltaMs) => {
      peak = Math.max(peak, getLevel?.() || 0);
      elapsed += deltaMs;
      if (elapsed >= DICTATION_BAR_MS) {
        elapsed %= DICTATION_BAR_MS;
        bars.push(getWaveBarHeight(peak));
        peak = 0;
      }
      if (colourFrames <= 0) {
        colour = getComputedStyle(canvas).color;
        colourFrames = 6;
      }
      colourFrames -= 1;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = colour;
      const step = (BAR_WIDTH_PX + BAR_GAP_PX) * scale;
      const barWidth = BAR_WIDTH_PX * scale;
      const dot = DOT_PX * scale;
      const slots = Math.ceil(width / step) + 2;
      if (bars.length > slots) bars.splice(0, bars.length - slots);
      const offset = (elapsed / DICTATION_BAR_MS) * step;
      for (let slot = 0; slot < slots; slot += 1) {
        const x = width - offset - (slot + 1) * step;
        if (x + barWidth < 0) break;
        if (slot < bars.length) {
          const barHeight = Math.max(
            MIN_BAR_PX * scale,
            bars[bars.length - 1 - slot] * height * 0.9,
          );
          ctx.fillRect(x, (height - barHeight) / 2, barWidth, barHeight);
        } else {
          ctx.globalAlpha = 0.35;
          ctx.fillRect(x + (barWidth - dot) / 2, (height - dot) / 2, dot, dot);
          ctx.globalAlpha = 1;
        }
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(root);
    resize();
    gsap.ticker.add(draw);
    return () => {
      gsap.ticker.remove(draw);
      observer.disconnect();
    };
  }, [getLevel]);

  return (
    <div ref={rootRef} className="assistant_wave" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default DictationWave;
