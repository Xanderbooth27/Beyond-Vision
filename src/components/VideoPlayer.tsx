"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface VideoPlayerProps {
  src?: string;
  poster: string;
  aspectRatio?: string;
  borderRadius?: string;
  height?: string;
  /** Keep control bar visible while playing (default: fades until hover). */
  controlsAlwaysVisible?: boolean;
}

export default function VideoPlayer({
  src,
  poster,
  aspectRatio = "16/10",
  borderRadius = "0px",
  height = "auto",
  controlsAlwaysVisible = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const showControls = controlsAlwaysVisible || isHovered || !isPlaying;

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleProgress = () => {
    const video = videoRef.current;
    if (!video?.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  };

  const seek = (clientX: number) => {
    const video = videoRef.current;
    const track = progressRef.current;
    if (!video?.duration || !track) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
    setProgress(ratio * 100);
  };

  const onProgressPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    seek(event.clientX);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onProgressMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.buttons !== 1) return;
    event.stopPropagation();
    seek(event.clientX);
  };

  if (!src) {
    return (
      <div
        className="bv-video-player bv-video-player--empty"
        style={{ aspectRatio, height, borderRadius }}
      >
        <img src={poster} alt="" />
      </div>
    );
  }

  return (
    <div
      className="bv-video-player"
      style={{ aspectRatio, height, borderRadius }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="bv-video-player__media"
        onClick={togglePlay}
        onTimeUpdate={handleProgress}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        muted={isMuted}
        playsInline
        loop
        preload="metadata"
        disablePictureInPicture
        controlsList="nodownload noremoteplayback"
      />

      <AnimatePresence>
        {!isPlaying && (
          <motion.button
            type="button"
            className="bv-video-player__center-play"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            aria-label="Play video"
          >
            <Play size={28} fill="currentColor" strokeWidth={0} style={{ marginLeft: "3px" }} />
          </motion.button>
        )}
      </AnimatePresence>

      <div
        className={`bv-video-player__controls${showControls ? " bv-video-player__controls--visible" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="bv-video-player__control-btn"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause size={18} fill="currentColor" strokeWidth={0} />
          ) : (
            <Play size={18} fill="currentColor" strokeWidth={0} style={{ marginLeft: "2px" }} />
          )}
        </button>

        <div
          ref={progressRef}
          className="bv-video-player__progress"
          role="slider"
          aria-label="Video progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          onPointerDown={onProgressPointer}
          onPointerMove={onProgressMove}
        >
          <div className="bv-video-player__progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <button
          type="button"
          className="bv-video-player__mute-btn"
          onClick={() => setIsMuted((m) => !m)}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={17} strokeWidth={2} /> : <Volume2 size={17} strokeWidth={2} />}
        </button>
      </div>

      <style jsx>{`
        .bv-video-player {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: #0a0a0a;
          border-radius: inherit;
        }

        .bv-video-player--empty img,
        .bv-video-player__media {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .bv-video-player__media {
          cursor: pointer;
        }

        .bv-video-player__center-play {
          position: absolute;
          inset: 0;
          margin: auto;
          width: 72px;
          height: 72px;
          display: grid;
          place-items: center;
          border: none;
          border-radius: 50%;
          background: var(--accent);
          color: #0a0a0a;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08);
          z-index: 2;
          pointer-events: auto;
        }

        .bv-video-player__center-play:hover {
          filter: brightness(1.06);
        }

        .bv-video-player__controls {
          position: absolute;
          left: 0.85rem;
          right: 0.85rem;
          bottom: 0.85rem;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.65rem 1rem 0.65rem 0.85rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: linear-gradient(
            105deg,
            rgba(72, 68, 58, 0.55) 0%,
            rgba(32, 36, 48, 0.62) 55%,
            rgba(22, 28, 42, 0.7) 100%
          );
          backdrop-filter: blur(22px) saturate(1.2);
          -webkit-backdrop-filter: blur(22px) saturate(1.2);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
          opacity: 0;
          transform: translateY(6px);
          pointer-events: none;
          transition: opacity 0.22s ease, transform 0.22s ease;
        }

        .bv-video-player__controls--visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .bv-video-player__control-btn {
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          padding: 0;
          border: none;
          background: transparent;
          color: var(--accent);
          cursor: pointer;
        }

        .bv-video-player__control-btn:hover {
          filter: brightness(1.1);
        }

        .bv-video-player__progress {
          flex: 1;
          min-width: 0;
          height: 4px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.14);
          position: relative;
          cursor: pointer;
          touch-action: none;
        }

        .bv-video-player__progress-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          border-radius: inherit;
          background: var(--accent);
          box-shadow: 0 0 12px rgba(255, 244, 87, 0.55);
          pointer-events: none;
        }

        .bv-video-player__mute-btn {
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          padding: 0;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.92);
          cursor: pointer;
        }

        .bv-video-player__mute-btn:hover {
          color: #fff;
        }

        @media (prefers-reduced-motion: reduce) {
          .bv-video-player__controls {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
