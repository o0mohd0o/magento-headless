'use client';
/**
 * Flickr — port of element/flickr.phtml (category: embed / gallery).
 *
 * The storefront template renders an empty container and lets
 * Magezon_PageBuilder/js/flickr.js (+ flickr-jquery.js) fetch a Flickr photoset
 * via the public Flickr REST API and inject a responsive thumbnail grid, each
 * thumbnail linking to the large image (opened in a blueimp lightbox). This
 * component reproduces that behaviour with React hooks + fetch — no jQuery, no
 * blueimp; clicking a thumbnail opens a minimal self-contained lightbox.
 *
 * Element fields (from Data/Element/Flickr.php + flickr.phtml):
 *   - title            -> heading text (default "Flickr")
 *   - title_align      -> left|center|right (default center)
 *   - title_tag        -> h1..h6 (default h2)
 *   - description      -> heading sub-text (HTML)
 *   - show_line        -> underline accent under the heading (default true)
 *   - flickr_api_key   -> Flickr API key (default a Magezon demo key)
 *   - flickr_album_id  -> Flickr photoset id (default a Magezon demo album)
 *   - show_photo_title -> show each photo's title as alt/caption (default true)
 *   - thum_size        -> Flickr size suffix for the thumbnail (q/t/s/n/m/z/c/l/0);
 *                         the storefront JS hard-codes "n" (Small 320), used here
 *                         as the default when thum_size is empty.
 *   - max_items        -> max photos to render (storefront default 200)
 *   - item_xl/lg/md/sm/xs -> grid columns per breakpoint (defaults 12/12/6/5/4)
 *
 * REST request mirrors flickr-jquery.js:
 *   GET https://api.flickr.com/services/rest/?format=json&nojsoncallback=1
 *       &method=flickr.photosets.getPhotos&api_key=<key>&photoset_id=<id>&per_page=<limit>
 *
 * Thumbnail / large URLs mirror the original plugin's farm-static URLs (upgraded
 * to https): live.staticflickr.com/<server>/<id>_<secret>_<size>.jpg, with
 * "_n" (Small 320) for thumbnails and "_b" (Large 1024) for the lightbox.
 *
 * Degrades gracefully: while loading shows a spinner; if the API key/album is
 * missing or the request fails/returns no photos, renders nothing (matching the
 * storefront, which simply leaves the gallery empty).
 */
import React, { useEffect, useState, useCallback } from 'react';
import type { MagezonElementProps } from '../types';
import { bool, str } from '../media';

interface FlickrPhoto {
  id: string;
  thumbnail: string;
  href: string;
  title: string;
}

interface FlickrApiPhoto {
  id?: string;
  secret?: string;
  server?: string;
  farm?: number | string;
  title?: string;
}

// Map the configured thumbnail size code to a Flickr URL size suffix.
// Codes come from Data/Element/Flickr::getThumbnailSize(); "0" == original
// (no suffix). The storefront JS itself always uses "n", so that is the default.
function thumbSuffix(code: string): string {
  const allowed = new Set(['q', 't', 's', 'n', 'm', 'z', 'c', 'l']);
  if (code === '0') return ''; // original: no size suffix
  return allowed.has(code) ? code : 'n';
}

function buildStaticUrl(p: FlickrApiPhoto, suffix: string): string {
  // https://live.staticflickr.com/{server}/{id}_{secret}[_{size}].jpg
  const base = `https://live.staticflickr.com/${str(p.server)}/${str(p.id)}_${str(p.secret)}`;
  return suffix ? `${base}_${suffix}.jpg` : `${base}.jpg`;
}

export function Flickr({ element }: MagezonElementProps) {
  const apiKey = str(element.flickr_api_key);
  const albumId = str(element.flickr_album_id);
  const showPhotoTitle =
    element.show_photo_title === undefined ? true : bool(element.show_photo_title);
  const maxRaw = Number(str(element.max_items));
  const photosLimit = Number.isFinite(maxRaw) && maxRaw > 0 ? maxRaw : 200;
  const thumb = thumbSuffix(str(element.thum_size));

  // Heading.
  const title = str(element.title);
  const description = str(element.description);
  const titleAlign = str(element.title_align) || 'center';
  const allowedTags = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
  const titleTag = (allowedTags.has(str(element.title_tag))
    ? str(element.title_tag)
    : 'h2') as keyof React.JSX.IntrinsicElements;
  const showLine = element.show_line === undefined ? true : bool(element.show_line);

  // Responsive columns (storefront mgz-grid-col-* classes => percentage widths).
  const colVal = (v: unknown, fallback: number) => {
    const n = Number(str(v));
    return Number.isFinite(n) && n > 0 && n <= 12 ? n : fallback;
  };
  const cols = {
    xl: colVal(element.item_xl, 12),
    lg: colVal(element.item_lg, 12),
    md: colVal(element.item_md, 6),
    sm: colVal(element.item_sm, 5),
    xs: colVal(element.item_xs, 4),
  };
  // Default breakpoint width uses the smallest (mobile-first); media queries
  // below override at larger viewports.
  const widthPct = (n: number) => `${(n / 12) * 100}%`;

  const [photos, setPhotos] = useState<FlickrPhoto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (!apiKey || !albumId) {
      setLoading(false);
      setPhotos([]);
      return;
    }
    let cancelled = false;
    const params = new URLSearchParams({
      format: 'json',
      nojsoncallback: '1',
      method: 'flickr.photosets.getPhotos',
      api_key: apiKey,
      photoset_id: albumId,
      per_page: String(photosLimit),
    });
    const url = `https://api.flickr.com/services/rest/?${params.toString()}`;

    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('flickr http error'))))
      .then((data: { stat?: string; photoset?: { photo?: FlickrApiPhoto[] } }) => {
        if (cancelled) return;
        if (data && data.stat === 'ok' && data.photoset && Array.isArray(data.photoset.photo)) {
          const out: FlickrPhoto[] = data.photoset.photo
            .slice(0, photosLimit)
            .map((p) => ({
              id: str(p.id),
              thumbnail: buildStaticUrl(p, thumb),
              href: buildStaticUrl(p, 'b'),
              title: showPhotoTitle ? str(p.title) : '',
            }));
          setPhotos(out);
        } else {
          setPhotos([]);
        }
      })
      .catch(() => {
        if (!cancelled) setPhotos([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, albumId, photosLimit, thumb, showPhotoTitle]);

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const step = useCallback(
    (dir: number) => {
      setLightbox((cur) => {
        if (cur === null || !photos || photos.length === 0) return cur;
        return (cur + dir + photos.length) % photos.length;
      });
    },
    [photos],
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, closeLightbox, step]);

  const heading =
    title || description ? (
      <div
        className={`mgz-flickr-heading mgz-flickr-heading-${titleAlign}${
          showLine ? ' mgz-flickr-heading-line' : ''
        }`}
        style={{ textAlign: titleAlign as React.CSSProperties['textAlign'], marginBottom: 20 }}
      >
        {title
          ? React.createElement(
              titleTag,
              {
                className: 'mgz-flickr-title',
                style: {
                  margin: 0,
                  display: 'inline-block',
                  borderBottom: showLine ? '2px solid currentColor' : undefined,
                  paddingBottom: showLine ? 8 : undefined,
                },
              },
              title,
            )
          : null}
        {description ? (
          <div
            className="mgz-flickr-info"
            style={{ marginTop: 8 }}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        ) : null}
      </div>
    ) : null;

  // Nothing usable to show (and not loading): render only the heading, mirroring
  // the storefront which leaves the gallery container empty.
  const hasPhotos = Array.isArray(photos) && photos.length > 0;

  const styleId = `mgz-flickr-${str(element.id) || 'el'}`;

  return (
    <div className="mgz-flickr" data-flickr-id={styleId}>
      {/* Scoped responsive grid widths (mobile-first; widen at breakpoints). */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
[data-flickr-id="${styleId}"] .mgz-flickr-grid{display:flex;flex-wrap:wrap;margin:-5px;}
[data-flickr-id="${styleId}"] .mgz-flickr-item{box-sizing:border-box;padding:5px;width:${widthPct(
            cols.xs,
          )};}
[data-flickr-id="${styleId}"] .mgz-flickr-item a{display:block;line-height:0;}
[data-flickr-id="${styleId}"] .mgz-flickr-item img{width:100%;height:auto;display:block;}
@media (min-width:576px){[data-flickr-id="${styleId}"] .mgz-flickr-item{width:${widthPct(
            cols.sm,
          )};}}
@media (min-width:768px){[data-flickr-id="${styleId}"] .mgz-flickr-item{width:${widthPct(
            cols.md,
          )};}}
@media (min-width:992px){[data-flickr-id="${styleId}"] .mgz-flickr-item{width:${widthPct(
            cols.lg,
          )};}}
@media (min-width:1200px){[data-flickr-id="${styleId}"] .mgz-flickr-item{width:${widthPct(
            cols.xl,
          )};}}
`,
        }}
      />

      {heading}

      {loading ? (
        <div
          className="mgz-flickr-spinner"
          style={{ textAlign: 'center', padding: '30px 0' }}
          aria-label="Loading"
        >
          <span
            style={{
              display: 'inline-block',
              width: 28,
              height: 28,
              border: '3px solid rgba(0,0,0,0.15)',
              borderTopColor: 'rgba(0,0,0,0.55)',
              borderRadius: '50%',
              animation: 'mgz-flickr-spin 0.8s linear infinite',
            }}
          />
          <style
            dangerouslySetInnerHTML={{
              __html: '@keyframes mgz-flickr-spin{to{transform:rotate(360deg);}}',
            }}
          />
        </div>
      ) : null}

      {!loading && hasPhotos ? (
        <div className="mgz-flickr-grid">
          {photos!.map((photo, i) => (
            <div className="mgz-flickr-item" key={photo.id || i}>
              <a
                href={photo.href}
                title={photo.title}
                onClick={(e) => {
                  e.preventDefault();
                  setLightbox(i);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={photo.title} src={photo.thumbnail} loading="lazy" />
              </a>
            </div>
          ))}
        </div>
      ) : null}

      {lightbox !== null && hasPhotos ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={photos![lightbox].title}
            src={photos![lightbox].href}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain' }}
          />
          {photos![lightbox].title ? (
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                left: 0,
                right: 0,
                textAlign: 'center',
                color: '#fff',
                font: '14px/1.4 sans-serif',
                padding: '0 16px',
                pointerEvents: 'none',
              }}
            >
              {photos![lightbox].title}
            </div>
          ) : null}
          <button
            type="button"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            style={lightboxBtn({ top: 12, right: 16, fontSize: 30 })}
          >
            ×
          </button>
          {photos!.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                style={lightboxBtn({ left: 16, top: '50%', fontSize: 40, transform: 'translateY(-50%)' })}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                style={lightboxBtn({ right: 16, top: '50%', fontSize: 40, transform: 'translateY(-50%)' })}
              >
                ›
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function lightboxBtn(extra: React.CSSProperties): React.CSSProperties {
  return {
    position: 'absolute',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    lineHeight: 1,
    cursor: 'pointer',
    padding: 8,
    ...extra,
  };
}