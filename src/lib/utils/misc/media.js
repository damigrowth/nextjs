export const getMediaType = (url) => {
  const extension = url.split('.').pop()?.toLowerCase();

  // Image extensions
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];

  // Video extensions
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];

  // Audio extensions
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac'];

  if (imageExtensions.includes(extension)) return 'image';
  if (videoExtensions.includes(extension)) return 'video';
  if (audioExtensions.includes(extension)) return 'audio';

  return 'unknown';
};
