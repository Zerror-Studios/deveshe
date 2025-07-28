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
      <div id="lb-video-container">
        <div id="lb-video-overlay" onClick={handleVideoClick}>
          <p>{isPaused ? "Play" : "Pause"}</p>
        </div>
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          src={data?.videourl || ""}
        />
      </div>
    </>
  );
};

export default VideoContainer;
