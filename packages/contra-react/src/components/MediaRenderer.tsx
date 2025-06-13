import React, { useState, useRef, useEffect } from 'react';
import type { CSSProperties, ImgHTMLAttributes, VideoHTMLAttributes } from 'react';
import { useContraContext } from './ContraProvider';

export interface MediaRendererProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  loading?: 'lazy' | 'eager';
  aspectRatio?: string;
  objectFit?: CSSProperties['objectFit'];
  onError?: () => void;
  // Video-specific props
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsInline?: boolean;
}

/**
 * Enterprise Media Renderer
 * Automatically detects media type and renders appropriate element
 * Supports images, videos, and professional fallbacks
 */
export function MediaRenderer({
  src,
  alt = 'Media content',
  className = '',
  style,
  loading = 'lazy',
  aspectRatio,
  objectFit = 'cover',
  onError,
  ...videoProps
}: MediaRendererProps) {
  const { config } = useContraContext();
  const [error, setError] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Detect media type
  useEffect(() => {
    if (!src) return;
    
    const urlLower = src.toLowerCase();
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.ogg'];
    const isVideoFile = videoExtensions.some(ext => urlLower.includes(ext));
    const isCloudinaryVideo = urlLower.includes('cloudinary.com/') && urlLower.includes('/video/');
    
    setIsVideo(isVideoFile || isCloudinaryVideo);
  }, [src]);

  // Handle hover-to-play functionality
  useEffect(() => {
    if (!videoRef.current || !config.videoHoverPlay || config.videoAutoplay || isMobile) return;

    const video = videoRef.current;
    
    if (isHovering) {
      video.play().catch(() => {
        // Ignore play errors (browser policies)
      });
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isHovering, config.videoHoverPlay, config.videoAutoplay, isMobile]);

  const handleError = () => {
    setError(true);
    onError?.();
  };

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio,
    overflow: 'hidden',
    borderRadius: 'inherit',
    backgroundColor: error ? '#f3f4f6' : undefined,
    ...style,
  };

  const mediaStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit,
    display: 'block',
  };

  // Render error state
  if (error || !src) {
    return (
      <div 
        className={`contra-media-error ${className}`}
        style={containerStyle}
      >
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#9ca3af',
          fontSize: '12px',
          textAlign: 'center',
        }}>
          {isVideo ? '🎬 Video unavailable' : '🖼️ Image unavailable'}
        </div>
      </div>
    );
  }

  // Render video
  if (isVideo) {
    const videoAttributes: VideoHTMLAttributes<HTMLVideoElement> = {
      src,
      className: `contra-media-video ${className}`,
      style: mediaStyle,
      onError: handleError,
      autoPlay: config.videoAutoplay,
      muted: config.videoMuted ?? true,
      loop: config.videoLoop ?? true,
      controls: config.videoControls ?? false,
      playsInline: true,
      preload: 'metadata',
      ...videoProps,
    };

    return (
      <div
        className="contra-media-container"
        style={containerStyle}
        onMouseEnter={() => !isMobile && setIsHovering(true)}
        onMouseLeave={() => !isMobile && setIsHovering(false)}
        onClick={(e) => {
          if (isMobile && videoRef.current) {
            const video = videoRef.current;
            if (video.paused) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          }
        }}
      >
        <video ref={videoRef} {...videoAttributes}>
          <source src={src} type="video/mp4" />
          <source src={src.replace('.mp4', '.webm')} type="video/webm" />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#9ca3af',
            fontSize: '12px',
            textAlign: 'center',
            cursor: isMobile ? 'pointer' : 'default',
          }}>
            {isMobile ? '👆 Tap to play' : '🎬 Video'}
          </div>
        </video>
      </div>
    );
  }

  // Render image
  const imgAttributes: ImgHTMLAttributes<HTMLImageElement> = {
    src,
    alt,
    className: `contra-media-image ${className}`,
    style: mediaStyle,
    loading,
    onError: handleError,
  };

  return (
    <div className="contra-media-container" style={containerStyle}>
      <img {...imgAttributes} />
    </div>
  );
}

/**
 * Extract video thumbnail URL from Cloudinary video URL
 */
export function extractVideoThumbnail(videoUrl: string): string | null {
  if (videoUrl.includes('cloudinary.com/') && videoUrl.includes('/video/')) {
    return videoUrl
      .replace('/video/', '/image/')
      .replace(/\.(mp4|webm|mov|avi|mkv)$/i, '.jpg')
      .replace('fl_progressive', 'f_auto,q_auto,c_fill');
  }
  return null;
} 