'use client';
/**
 * ImageGallery — port of Magezon\PageBuilder element/image_gallery.phtml.
 *
 * The storefront template builds a Fotorama gallery from an `items`
 * dynamic-rows array. Each item has a `type` ("media" | "link" | "video"):
 *
 *   - media: `image` is the thumbnail; optional `full_image` is the large image
 *            shown in the lightbox (falls back to the thumbnail).
 *   - link:  `link` is an external image/URL used directly as the lightbox src.
 *   - video: `image` is the poster thumbnail; `video_url` (YouTube/Vimeo/file)
 *            opens in the lightbox. Fotorama auto-detects the provider; here we
 *            build the matching iframe/<video> embed.
 *
 * Every item may carry a `caption` (HTML from the editor field).
 *
 * Since there is no headless equivalent of the Fotorama JS bundle, this is a
 * self-contained responsive CSS grid plus a lightweight React lightbox (no
 * external libs): click to open, prev/next + keyboard (Esc/←/→) navigation,
 * and the configured `loop` option. The Fotorama-only sizing/transition
 * options don't map to a static grid and are intentionally ignored.
 *
 * Class names mirror the storefront (mgz-fotorama, mgz-fotorama-item) so any
 * host style hooks still apply; layout-critical bits use small inline styles
 * so this works without the Magezon CSS bundle.
 */
import React, { useCallback, useEffect, useState } from 'react';
import type { MagezonElement, MagezonElementProps } from '../types';
import { bool, mediaUrl, str } from '../media';

type Ctx = MagezonElementProps['ctx'];

interface GalleryItem {
  type: string;
  thumb: string; // grid thumbnail
  full: string; // large image for the lightbox (image items only)
  href: string; // external link target (link items)
  videoUrl: string; // raw video url (video items)
  caption: string; // optional HTML caption
}

/** Build the lightbox video embed src for a YouTube/Vimeo url, else ''. */
function videoEmbedSrc(url: string): string {
  if (!url) return '';
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{6,})/,
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  return '';
}

function isFileVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i.test(url);
}

function buildItems(raw: unknown, ctx: Ctx): GalleryItem[] {
  if (!Array.isArray(raw)) return [];
  const out: GalleryItem[] = [];
  for (const it of raw as MagezonElement[]) {
    if (!it || typeof it !== 'object') continue;
    const type = str(it.type) || 'media';
    const image = mediaUrl(str(it.image), ctx);
    const fullImage = mediaUrl(str(it.full_image), ctx);
    const link = str(it.link);
    const videoUrl = str(it.video_url);
    const caption = str(it.caption);

    let thumb = '';
    let full = '';
    let href = '';

    if (type === 'media' || type === 'video') {
      thumb = image;
      full = fullImage || image;
    }
    if (type === 'link') {
      // External link items use the link itself as the image source
      // (matches the template, which sets both the <a href> and image to it).
      thumb = link;
      full = link;
      href = link;
    }

    // Skip empty items (no thumb and not a video with a url).
    if (!thumb && !(type === 'video' && videoUrl)) continue;

    out.push({ type, thumb, full, href, videoUrl, caption });
  }
  return out;
}

export function ImageGallery({ element, ctx }: MagezonElementProps) {
  const items = buildItems(element.items, ctx);

  const loop = bool(element.loop);
  const showCaptions =
    element.captions === undefined ? true : bool(element.captions);
  const startIndex = Math.max(0, Number(element.startindex) || 0);

  // Grid sizing derived from the configured thumbnail width (Fotorama default 64,
  // but as a static gallery a larger minimum reads better; clamp to a sane floor).
  const thumbW = Number(element.thumbwidth) || 0;
  const minTile = thumbW > 0 ? Math.max(thumbW, 160) : 220;

  const count = items.length;
  // Template clamps startindex to 0 when it exceeds the last item.
  const initialIndex = startIndex > count - 1 ? 0 : startIndex;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(initialIndex);

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      if (next < 0) setActive(loop ? count - 1 : 0);
      else if (next >= count) setActive(loop ? 0 : count - 1);
      else setActive(next);
    },
    [count, loop],
  );

  const openAt = useCallback((i: number) => {
    setActive(i);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(active - 1);
      else if (e.key === 'ArrowRight') go(active + 1);
    };
    window.addEventListener('keydown', onKey);
    // Lock body scroll while the lightbox is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, active, go, close]);

  if (count === 0) return null;

  const current = items[Math.min(active, count - 1)];
  const embed = current ? videoEmbedSrc(current.videoUrl) : '';
  const fileVideo =
    current && current.type === 'video' && isFileVideo(current.videoUrl);

  return (
    <div className="mgz-fotorama mgz-image-gallery">
      <div
        className="mgz-image-gallery-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${minTile}px, 1fr))`,
          gap: '10px',
        }}
      >
        {items.map((item, i) => {
          const isVideo = item.type === 'video';
          return (
            <button
              key={i}
              type="button"
              className="mgz-fotorama-item"
              onClick={() => openAt(i)}
              aria-label={isVideo ? 'Play video' : 'Open image'}
              style={{
                position: 'relative',
                display: 'block',
                padding: 0,
                border: 'none',
                cursor: 'pointer',
                background: '#f4f4f4',
                overflow: 'hidden',
                aspectRatio: '1 / 1',
                width: '100%',
              }}
            >
              {item.thumb ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.thumb}
                  alt=""
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              ) : (
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#888',
                  }}
                >
                  ▶
                </span>
              )}

              {isVideo && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.25)',
                  }}
                >
                  <span
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      paddingLeft: '4px',
                    }}
                  >
                    ▶
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {open && current && (
        <div
          className="mgz-image-gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery"
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            style={{
              ...lbBtn,
              top: '16px',
              right: '16px',
              fontSize: '28px',
            }}
          >
            ×
          </button>

          {count > 1 && (
            <button
              type="button"
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                go(active - 1);
              }}
              style={{ ...lbBtn, left: '16px', top: '50%', transform: 'translateY(-50%)' }}
            >
              ‹
            </button>
          )}

          <figure
            onClick={(e) => e.stopPropagation()}
            style={{
              margin: 0,
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {embed ? (
              <iframe
                src={embed}
                title="Gallery video"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  width: 'min(90vw, 960px)',
                  aspectRatio: '16 / 9',
                  border: 0,
                  background: '#000',
                }}
              />
            ) : fileVideo ? (
              <video
                controls
                autoPlay
                playsInline
                style={{ maxWidth: '90vw', maxHeight: '80vh', background: '#000' }}
              >
                <source src={current.videoUrl} />
                Your browser does not support the video tag.
              </video>
            ) : current.full ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={current.full}
                alt=""
                style={{
                  maxWidth: '90vw',
                  maxHeight: showCaptions && current.caption ? '78vh' : '88vh',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            ) : (
              <div style={{ color: '#fff', padding: '40px' }}>
                Media unavailable.
              </div>
            )}

            {showCaptions && current.caption && (
              <figcaption
                className="mgz-fotorama-caption"
                style={{
                  color: '#fff',
                  textAlign: 'center',
                  maxWidth: '90vw',
                  fontSize: '14px',
                }}
                dangerouslySetInnerHTML={{ __html: current.caption }}
              />
            )}
          </figure>

          {count > 1 && (
            <button
              type="button"
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                go(active + 1);
              }}
              style={{ ...lbBtn, right: '16px', top: '50%', transform: 'translateY(-50%)' }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const lbBtn: React.CSSProperties = {
  position: 'absolute',
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  border: 'none',
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.15)',
  color: '#fff',
  fontSize: '32px',
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
};
