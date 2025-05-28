import Image from 'next/image';

/**
 * Renders a media thumbnail component, typically used in carousels or galleries.
 * Displays a preview image if available (for videos) or a fallback icon (video/audio).
 * Overlays a play icon on video thumbnails.
 *
 * @param {object} props - The component props.
 * @param {string} [props.url] - The URL of the media file (used indirectly, e.g., for determining type if mime is missing).
 * @param {string} props.mime - The MIME type of the media file (e.g., "video/mp4", "audio/mpeg").
 * @param {string} [props.previewUrl] - The URL for the video preview image.
 * @param {number} [props.width=300] - The width of the thumbnail container in pixels.
 * @param {number} [props.height=300] - The height of the thumbnail container in pixels.
 * @param {number} [props.fontSize=24] - The font size for the fallback icon in pixels.
 * @returns {JSX.Element} The MediaThumb component.
 */
export const MediaThumb = ({
  url,
  mime,
  previewUrl,
  width,
  height,
  fontSize,
}) => {
  /**
   * Determines if the media type is video based on the MIME type.
   * @type {boolean}
   */
  const isVideo = mime?.startsWith('video/');

  /**
   * Determines whether to show the video preview image.
   * True if the media is a video and a preview URL is provided.
   * @type {boolean}
   */
  const showPreview = isVideo && previewUrl;

  /**
   * Inline styles for the main container div.
   * @type {React.CSSProperties}
   */
  const containerStyle = {
    position: 'relative',
    width: width ? `${width}px` : '300px',
    height: height ? `${height}px` : '300px',
    backgroundColor: '#404040',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    overflow: 'hidden',
  };

  /**
   * Inline styles for the fallback icon (video or music icon).
   * Used when a video preview image is not available.
   * @type {React.CSSProperties}
   */
  const fallbackIconStyle = {
    fontSize: fontSize ? `${fontSize}px` : '24px',
    color: 'white',
    opacity: 0.8,
  };

  /**
   * Inline styles for the play icon overlay container.
   * Centered absolutely within the main container.
   * @type {React.CSSProperties}
   */
  const playIconOverlayStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  /**
   * Inline styles for the play icon itself (inside the overlay).
   * @type {React.CSSProperties}
   */
  const playIconStyle = {
    fontSize: '18px',
    color: 'white',
  };

  return (
    <div style={containerStyle}>
      {showPreview && (
        <Image
          src={previewUrl}
          alt='Video thumbnail preview'
          fill
          sizes='(max-width: 768px) 25vw, (max-width: 1200px) 15vw, 10vw'
          style={{ objectFit: 'contain' }}
          unoptimized={true}
        />
      )}
      {!showPreview && (
        <i
          className={isVideo ? 'fas fa-video' : 'fas fa-music'}
          style={fallbackIconStyle}
        />
      )}
      {isVideo && (
        <div style={playIconOverlayStyle}>
          <i className='fas fa-play' style={playIconStyle} />
        </div>
      )}
    </div>
  );
};
