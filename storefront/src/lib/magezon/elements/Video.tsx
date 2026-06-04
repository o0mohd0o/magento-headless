/**
 * Video — port of element/video.phtml (embed category).
 *
 * The storefront builds the final embed URL in PHP (Block\Element\Video::getVideoLink()):
 *  - YouTube  -> https://www.youtube.com/embed/<id>?<params>  (or youtube-nocookie.com in privacy mode)
 *  - Vimeo    -> https://player.vimeo.com/video/<id>?<params>
 *  - Local    -> the raw .mp4 url, rendered with a native <video> tag
 * That logic is reproduced here from the raw `link` field (no block helper exists headless).
 *
 * Behavior notes:
 *  - When show_preview_image + a preview_image are set, the iframe/video src is deferred
 *    (lazyLink) and an overlay image is shown (PHP swaps link -> lazyLink).
 *  - When show_preview_image + lightbox, the whole thing is an <a> that would open the
 *    embed in a popup. With no JS lightbox lib available headless we render the anchor
 *    pointing at the embed URL (opens the video) so the preview still acts as a play link.
 *  - autoplay forces mute (browser policy / matches PHP `if ($autoPlay) $mute = false;` +
 *    YouTube `mute=1` override).
 *
 * Fields: title, title_align, title_tag, description, show_line, video_type, link,
 * aspect_ratio, start_at, end_at, autoplay, mute, loop, controls, modest_branding,
 * related_videos, youtube_privacy, vimeo_title, vimeo_portrait, vimeo_byline, video_color,
 * show_preview_image, preview_image, lightbox, show_play_icon, play_icon, video_title,
 * video_description.
 */
import React from 'react';
import type { MagezonElementProps } from '../types';
import { bool, mediaUrl, str } from '../media';

const TITLE_TAGS: ReadonlySet<string> = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'p']);

function getYoutubeId(link: string): string {
  const m = link.match(
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/,
  );
  return m && m[7] ? m[7] : '';
}

/** Reproduces Block\Element\Video::getVideoLink() from the raw element fields. */
function buildVideoLink(element: MagezonElementProps['element']): string {
  const raw = str(element.link);
  if (!raw) return '';

  // Local .mp4 short-circuit (PHP overrides link with the filtered raw value at the end).
  if (raw.indexOf('.mp4') !== -1) return raw;

  const isYoutube = raw.indexOf('youtube') !== -1 || raw.indexOf('youtu.be') !== -1;
  const isVimeo = raw.indexOf('vimeo') !== -1;
  if (!isYoutube && !isVimeo) return '';

  const showPreview = bool(element.show_preview_image);
  const lightbox = bool(element.lightbox);
  const autoplay = bool(element.autoplay);
  const loop = bool(element.loop);
  const videoType = str(element.video_type);

  let link = raw;

  // YouTube: convert watch url -> embed url (skipped only for preview-image + lightbox combo).
  if (isYoutube && (!showPreview || (showPreview && !lightbox))) {
    link = 'https://www.youtube.com/embed/' + getYoutubeId(raw);
    if (bool(element.youtube_privacy)) {
      link = link.replace('youtube.com', 'youtube-nocookie.com');
    }
  }
  if (isVimeo) {
    link = link.replace('vimeo.com', 'player.vimeo.com/video');
  }

  // Build query params (mirrors getVideoLinkParams()).
  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', '1');
  params.set('loop', loop ? '1' : '0');

  if (videoType === 'youtube') {
    params.set('mute', bool(element.mute) ? '1' : '0');
    params.set('controls', bool(element.controls) ? '1' : '0');
    params.set('modestbranding', bool(element.modest_branding) ? '1' : '0');
    params.set('rel', bool(element.related_videos) ? '1' : '0');
    if (str(element.start_at)) params.set('start', String(parseInt(str(element.start_at), 10) || 0));
    if (str(element.end_at)) params.set('end', String(parseInt(str(element.end_at), 10) || 0));
    if (autoplay) params.set('mute', '1');
    if (loop) params.set('playlist', getYoutubeId(raw));
  }
  if (videoType === 'vimeo') {
    params.set('muted', bool(element.mute) ? '1' : '0');
    params.set('controls', bool(element.controls) ? '1' : '0');
    params.set('title', bool(element.vimeo_title) ? '1' : '0');
    params.set('portrait', bool(element.vimeo_portrait) ? '1' : '0');
    params.set('byline', bool(element.vimeo_byline) ? '1' : '0');
    const color = str(element.video_color);
    params.set('color', color ? color.replace('#', '') : '');
    params.set('api', '1');
    params.set('player_id', 'player');
    params.set('autopause', 'false');
  }

  let query = params.toString();
  if (videoType === 'vimeo' && parseInt(str(element.start_at), 10)) {
    query += '#t=' + (parseInt(str(element.start_at), 10) || 0) + 's';
  }
  return link + '?' + query;
}

export function Video({ element, ctx }: MagezonElementProps) {
  const title = str(element.title);
  const titleAlign = str(element.title_align) || 'center';
  const titleTag = (TITLE_TAGS.has(str(element.title_tag)) ? str(element.title_tag) : 'h2') as keyof React.JSX.IntrinsicElements;
  const description = str(element.description);
  const showLine = bool(element.show_line);
  const aspectRatio = str(element.aspect_ratio) || '169';

  const showPreviewImage = bool(element.show_preview_image);
  const lightBox = bool(element.lightbox);
  const previewImage = element.preview_image ? mediaUrl(element.preview_image, ctx) : '';

  let link = buildVideoLink(element);
  let lazyLink = '';
  // PHP: when a preview image is shown, defer the real src into lazyLink.
  if (showPreviewImage && previewImage) {
    lazyLink = link;
    link = '';
  }

  const showPlayIcon = bool(element.show_play_icon);
  const playIcon = element.play_icon ? mediaUrl(element.play_icon, ctx) : '';
  const videoTitle = str(element.video_title);
  const videoDescription = str(element.video_description);

  const controls = bool(element.controls);
  const autoPlay = bool(element.autoplay);
  const loop = bool(element.loop);
  // autoplay implies muted (PHP sets $mute = false then forces muted attr via $autoPlay).

  if (!link && !lazyLink) return null;

  const effectiveSrc = lazyLink || link;
  const isMp4 = effectiveSrc.indexOf('.mp4') !== -1;

  const headingClass =
    'mgz-block-heading mgz-block-heading-align-' + titleAlign + (showLine ? ' mgz-block-heading-line' : '');

  const heading =
    title || description ? (
      <div className={headingClass}>
        {title &&
          React.createElement(titleTag, {
            className: 'title',
            dangerouslySetInnerHTML: { __html: title },
          })}
        {description && <div className="info" dangerouslySetInnerHTML={{ __html: description }} />}
      </div>
    ) : null;

  // The actual media (only rendered when NOT a preview-image+lightbox combo).
  let media: React.ReactNode = null;
  if (!showPreviewImage || !lightBox) {
    if (isMp4) {
      media = (
        <video controls={controls} autoPlay={autoPlay} loop={loop} muted={autoPlay} playsInline>
          <source src={effectiveSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      media = (
        <iframe
          width={1110}
          height={624}
          src={link || undefined}
          data-src={lazyLink || undefined}
          frameBorder={0}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={videoTitle || title || 'Video'}
        />
      );
    }
  }

  const overlay =
    previewImage && showPreviewImage ? (
      <div
        className="mgz-video-image-overlay"
        style={{
          backgroundImage: `url('${previewImage}')`,
          ...(showPlayIcon ? {} : { cursor: 'pointer' }),
        }}
      >
        {showPlayIcon && (
          <div className="mgz-video-embed-play">
            {playIcon ? (
              <img src={playIcon} title={videoTitle || undefined} alt={videoTitle || ''} />
            ) : (
              <i className="mgz-icon mgz-icon-play" />
            )}
            {videoTitle && <h2 className="mgz-video-title" dangerouslySetInnerHTML={{ __html: videoTitle }} />}
            {videoDescription && (
              <div className="mgz-video-description" dangerouslySetInnerHTML={{ __html: videoDescription }} />
            )}
          </div>
        )}
      </div>
    ) : null;

  const videoInner = (
    <>
      {media}
      {overlay}
    </>
  );

  return (
    <div className="mgz-block">
      {heading}
      <div className="mgz-block-content">
        <div className={`mgz-video mgz-video-aspect-ratio-${aspectRatio}`}>
          {showPreviewImage && lightBox ? (
            <a
              href={(link || lazyLink) || '#'}
              className="mgz-magnific"
              data-type="iframe"
              target="_blank"
              rel="noopener noreferrer"
            >
              {videoInner}
            </a>
          ) : (
            videoInner
          )}
        </div>
      </div>
    </div>
  );
}
