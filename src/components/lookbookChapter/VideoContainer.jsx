"use client";

import { htmlParser } from "@/utils/Util";
import React, { useRef, useState } from "react";

const VideoContainer = ({ data }) => {
  const videoRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPaused(false);
      } else {
        videoRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  return (
    <>
      {data?.paragraph && (
        <div id="lb-text-container">
          <p>{htmlParser(data?.paragraph || "")}</p>
        </div>
      )}
      <div id="lb-video-container" className="skeleton-loading">
        <div
          id="lb-video-overlay"
          role="button"
          tabIndex={0}
          aria-label={isPaused ? "Play video" : "Pause video"}
          onClick={handleVideoClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleVideoClick();
            }
          }}
        >
          <p>{isPaused ? "Play" : "Pause"}</p>
        </div>
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={data?.imageUrl || undefined}
          src={data?.videourl || undefined}
        />
      </div>
    </>
  );
};

export default VideoContainer;
