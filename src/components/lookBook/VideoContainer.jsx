import React, { useRef, useState } from 'react'

const VideoContainer = () => {
  const videoRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
        setIsPaused(false)
      } else {
        videoRef.current.pause()
        setIsPaused(true)
      }
    }
  }

  return (
    <div id='lb-video-container'>
      <div id='lb-video-overlay' onClick={handleVideoClick}>
        <p>{isPaused ? 'Play' : 'Pause'}</p>
      </div>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        src="https://s3.amazonaws.com/a.storyblok.com/f/161230/x/331e8920f8/teaser2-corrected-16x9-2.mp4"
      />
    </div>
  )
}

export default VideoContainer
