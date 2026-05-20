"use client";

import Image from "next/image";
import React, { useEffect, useRef } from "react";

const SPEED = 2.6;
const DEFAULT_ORB_SIZE = 112;

export default function CartEmptyState({ active }) {
  const playgroundRef = useRef(null);
  const orbRef = useRef(null);
  const stateRef = useRef({
    x: 32,
    y: 32,
    vx: SPEED,
    vy: SPEED * 0.85,
  });

  const getOrbSize = () => orbRef.current?.offsetWidth ?? DEFAULT_ORB_SIZE;

  useEffect(() => {
    if (!active) return;

    const playground = playgroundRef.current;
    const orb = orbRef.current;
    if (!playground || !orb) return;

    let frameId = 0;
    let resizeObserver;

    const setOrbPosition = (x, y) => {
      orb.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const initPosition = () => {
      const orbSize = getOrbSize();
      const bounds = playground.getBoundingClientRect();
      const maxX = Math.max(bounds.width - orbSize, 0);
      const maxY = Math.max(bounds.height - orbSize, 0);
      stateRef.current.x = Math.min(Math.max(stateRef.current.x, 0), maxX);
      stateRef.current.y = Math.min(Math.max(stateRef.current.y, 0), maxY);
      setOrbPosition(stateRef.current.x, stateRef.current.y);
    };

    const tick = () => {
      const orbSize = getOrbSize();
      const bounds = playground.getBoundingClientRect();
      const maxX = bounds.width - orbSize;
      const maxY = bounds.height - orbSize;

      if (maxX <= 0 || maxY <= 0) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      let { x, y, vx, vy } = stateRef.current;

      x += vx;
      y += vy;

      if (x <= 0) {
        x = 0;
        vx = Math.abs(vx);
      } else if (x >= maxX) {
        x = maxX;
        vx = -Math.abs(vx);
      }

      if (y <= 0) {
        y = 0;
        vy = Math.abs(vy);
      } else if (y >= maxY) {
        y = maxY;
        vy = -Math.abs(vy);
      }

      stateRef.current = { x, y, vx, vy };
      setOrbPosition(x, y);
      frameId = requestAnimationFrame(tick);
    };

    const startMotion = () => {
      initPosition();
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(tick);
    };

    const readyId = requestAnimationFrame(() => {
      requestAnimationFrame(startMotion);
    });

    resizeObserver = new ResizeObserver(() => {
      initPosition();
    });
    resizeObserver.observe(playground);

    const onResize = () => initPosition();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(readyId);
      cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [active]);

  return (
    <div ref={playgroundRef} className="cart-empty">
      <div className="cart-empty__copy">
        <p className="cart-empty__title">Not even one thing?</p>
        <p className="cart-empty__subtitle">That&apos;s sad.</p>
      </div>

      <div ref={orbRef} className="cart-empty__orb">
        <Image
          src="/buy.webp"
          alt=""
          fill
          sizes="(max-width: 576px) 100px, (max-width: 992px) 120px, 132px"
          className="cart-empty__orb-img"
          priority
        />
      </div>
    </div>
  );
}
