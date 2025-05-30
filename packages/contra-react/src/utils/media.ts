/**
 * Media utility functions
 */

export function detectMediaType(url: string): 'image' | 'video' {
  if (!url || typeof url !== 'string') return 'image';
  
  const urlLower = url.toLowerCase();
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.ogg'];
  const isVideo = videoExtensions.some(ext => urlLower.includes(ext));
  const isCloudinaryVideo = urlLower.includes('cloudinary.com/') && urlLower.includes('/video/');
  
  return (isVideo || isCloudinaryVideo) ? 'video' : 'image';
}

export function extractVideoThumbnail(videoUrl: string): string | null {
  if (videoUrl.includes('cloudinary.com/') && videoUrl.includes('/video/')) {
    return videoUrl
      .replace('/video/', '/image/')
      .replace(/\.(mp4|webm|mov|avi|mkv)$/i, '.jpg')
      .replace('fl_progressive', 'f_auto,q_auto,c_fill');
  }
  return null;
}

export function getMediaErrorPlaceholder(type: 'image' | 'video'): string {
  return type === 'video' ? '🎬 Video unavailable' : '🖼️ Image unavailable';
} 