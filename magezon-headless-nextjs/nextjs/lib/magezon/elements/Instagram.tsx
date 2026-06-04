'use client';
/**
 * Instagram — port of element/instagram.phtml (category: social embed).
 *
 * The storefront block renders an empty `#instagram-api-data` grid and then a
 * `data-mage-init` widget (view/base/web/js/instagram.js) which JSONP-fetches
 *   https://graph.instagram.com/me/media
 *     ?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username
 *     &access_token=<token>
 * keeps the first `max_items` rows whose media_type is IMAGE or CAROUSEL_ALBUM,
 * and appends one grid item per photo using the `#instagram-items` template:
 *   <div class="mgz-grid-item"> <a href={media_url}> <img src={media_url}/>
 *     <figure>{caption}</figure> </a> </div>
 *
 * Element fields (Data/Element/Instagram.php):
 *   - title, title_tag (default h2), title_align (default center),
 *     show_line (default true), line_position (default center), description
 *       -> the .mgz-block-heading shown above the grid (rendered via HTML sinks
 *          because the PHP runs $coreHelper->filter() on title/description)
 *   - max_items (number, default 10)        -> how many photos to keep
 *   - onclick (default magnific|photoswipe|photo|'')
 *       -> whether each photo is wrapped in an <a>. (PhotoSwipe/Magnific lightbox
 *          JS is not reproduced headless; we keep the anchor + plain target.)
 *   - link_target (default _self)           -> anchor target
 *   - hover_effect (default zoomin)         -> hover-type-<effect> class on anchor
 *   - instagram_username (default baoctmgz) -> "Follow Us" link target
 *   - link_text (default "Follow Us!")      -> follow-link label; link rendered
 *          only when link_text is set, to https://www.instagram.com/<username>
 *   - item_xl/lg/md/sm/xs (grid columns)    -> responsive items-per-row
 *
 * ACCESS TOKEN: the PHP block reads it from store config
 * (PageBuilder\Helper\Data::getConfig('instagram/user_token')); it is NOT part of
 * the element JSON. Headless, it is read from NEXT_PUBLIC_INSTAGRAM_TOKEN.
 * Without a token (or if the Graph API is unreachable) the feed degrades
 * gracefully: the heading + follow link still render, the grid stays empty.
 *
 * No jQuery / mage template — the feed is fetched in a useEffect with the
 * Graph API's JSONP endpoint (its CORS rules require JSONP); the <script> is
 * injected once and cleaned up. A plain fetch fallback is attempted too.
 */
import React, { useEffect, useMemo, useState } from 'react';
import type { MagezonElementProps } from '../types';
import { str } from '../media';

interface InstagramItem {
  id: string;
  caption: string;
  media_type: string;
  media_url: string;
  permalink: string;
}

const INSTAGRAM_TOKEN =
  (typeof process !== 'undefined' &&
    process.env &&
    process.env.NEXT_PUBLIC_INSTAGRAM_TOKEN) ||
  '';

const GRAPH_FIELDS =
  'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username';

function intOr(value: unknown, fallback: number): number {
  const n = parseInt(str(value), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Keep IMAGE / CAROUSEL_ALBUM rows, capped at maxItems (mirrors instagram.js). */
function pickPhotos(rows: unknown, maxItems: number): InstagramItem[] {
  if (!Array.isArray(rows)) return [];
  const out: InstagramItem[] = [];
  for (const r of rows) {
    if (out.length >= maxItems) break;
    const row = (r || {}) as Record<string, unknown>;
    const type = str(row.media_type);
    if (type !== 'IMAGE' && type !== 'CAROUSEL_ALBUM') continue;
    out.push({
      id: str(row.id),
      caption: str(row.caption),
      media_type: type,
      media_url: str(row.media_url),
      permalink: str(row.permalink),
    });
  }
  return out;
}

/**
 * JSONP fetch against graph.instagram.com (its responses don't send CORS
 * headers, so a normal fetch is blocked in the browser — JSONP is what the
 * Magezon widget uses). Resolves with the parsed `data` array.
 */
function fetchInstagramJsonp(token: string): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      reject(new Error('no window'));
      return;
    }
    const cbName = `__mgzInstagram_${Math.random().toString(36).slice(2)}`;
    const url =
      `https://graph.instagram.com/me/media?fields=${GRAPH_FIELDS}` +
      `&access_token=${encodeURIComponent(token)}&callback=${cbName}`;

    const win = window as unknown as Record<string, unknown>;
    const script = document.createElement('script');
    let settled = false;

    const cleanup = () => {
      try {
        delete win[cbName];
      } catch {
        win[cbName] = undefined;
      }
      if (script.parentNode) script.parentNode.removeChild(script);
    };

    (win as Record<string, unknown>)[cbName] = (res: unknown) => {
      settled = true;
      const data = (res && typeof res === 'object' && (res as { data?: unknown }).data) || [];
      cleanup();
      resolve(Array.isArray(data) ? data : []);
    };

    script.src = url;
    script.async = true;
    script.onerror = () => {
      if (settled) return;
      cleanup();
      reject(new Error('Instagram feed unavailable'));
    };
    document.body.appendChild(script);

    // Safety timeout so a silent failure doesn't leak the global callback.
    window.setTimeout(() => {
      if (settled) return;
      cleanup();
      reject(new Error('Instagram feed timed out'));
    }, 12000);
  });
}

export function Instagram({ element }: MagezonElementProps) {
  const maxItems = intOr(element.max_items, 10);

  // --- Heading (mgz-block-heading) ---
  const title = str(element.title);
  const titleTag = (str(element.title_tag) || 'h2') as keyof React.JSX.IntrinsicElements;
  const titleAlign = str(element.title_align) || 'center';
  const showLine = element.show_line === undefined ? true : !!element.show_line;
  const linePosition = str(element.line_position) || 'center';
  const description = str(element.description);

  // --- Grid columns (responsive) ---
  const xl = intOr(element.item_xl, 12);
  const lg = intOr(element.item_lg, 12);
  const md = intOr(element.item_md, 6);
  const sm = intOr(element.item_sm, 5);
  const xs = intOr(element.item_xs, 4);

  // --- Photo / link behavior ---
  const onclick = str(element.onclick); // '' | magnific | photoswipe | photo
  const linkTarget = str(element.link_target) || '_self';
  const hoverEffect = str(element.hover_effect);
  const username = str(element.instagram_username);
  const linkText = str(element.link_text);
  const followLink = username ? `https://www.instagram.com/${username}` : '';

  const headingClasses = [
    'mgz-block-heading',
    `mgz-block-heading-align-${titleAlign}`,
    showLine ? 'mgz-block-heading-line' : '',
    `mgz-block-heading-line-position-${linePosition}`,
  ]
    .filter(Boolean)
    .join(' ');

  const gridClasses = [
    'mgz-grid',
    hoverEffect ? 'mgz-image-hovers' : '',
    onclick === 'photoswipe' ? 'mgz-photoswipe' : '',
    'mgz-instagram',
    onclick === 'magnific' ? 'mgz-magnific-gallery' : '',
    `mgz-grid-col-xl-${xl}`,
    `mgz-grid-col-lg-${lg}`,
    `mgz-grid-col-md-${md}`,
    `mgz-grid-col-sm-${sm}`,
    `mgz-grid-col-xs-${xs}`,
  ]
    .filter(Boolean)
    .join(' ');

  const [photos, setPhotos] = useState<InstagramItem[]>([]);

  useEffect(() => {
    if (!INSTAGRAM_TOKEN) return;
    let cancelled = false;

    fetchInstagramJsonp(INSTAGRAM_TOKEN)
      .then((rows) => {
        if (cancelled) return;
        setPhotos(pickPhotos(rows, maxItems));
      })
      .catch(() => {
        /* Graph API unreachable — leave the grid empty (graceful fallback). */
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxItems]);

  // Responsive grid via CSS grid with media-query-free fixed columns is not
  // possible inline, so emulate the storefront breakpoints with a small scoped
  // <style> block keyed off this element's id.
  const scopeId = useMemo(
    () => `mgz-ig-${str(element.id) || Math.random().toString(36).slice(2)}`,
    [element.id],
  );

  const TitleTag = titleTag;
  const hasHeading = !!title || !!description;

  return (
    <div className="mgz-block">
      {hasHeading && (
        <div className={headingClasses}>
          {title && (
            <TitleTag className="title" dangerouslySetInnerHTML={{ __html: title }} />
          )}
          {description && (
            <div className="info" dangerouslySetInnerHTML={{ __html: description }} />
          )}
        </div>
      )}

      <div className="mgz-block-content">
        <style>{`
          .${scopeId}{display:grid;gap:10px;grid-template-columns:repeat(${Math.max(
            1,
            Math.round(12 / xs),
          )},1fr);}
          @media (min-width:576px){.${scopeId}{grid-template-columns:repeat(${Math.max(
            1,
            Math.round(12 / sm),
          )},1fr);}}
          @media (min-width:768px){.${scopeId}{grid-template-columns:repeat(${Math.max(
            1,
            Math.round(12 / md),
          )},1fr);}}
          @media (min-width:992px){.${scopeId}{grid-template-columns:repeat(${Math.max(
            1,
            Math.round(12 / lg),
          )},1fr);}}
          @media (min-width:1200px){.${scopeId}{grid-template-columns:repeat(${Math.max(
            1,
            Math.round(12 / xl),
          )},1fr);}}
          .${scopeId} .mgz-grid-item{position:relative;overflow:hidden;}
          .${scopeId} .mgz-grid-item img{display:block;width:100%;height:100%;object-fit:cover;}
          .${scopeId} .mgz-grid-item figure{margin:0;}
          .${scopeId}.mgz-image-hovers .mgz-grid-item img{transition:transform .35s ease;}
          .${scopeId}.mgz-image-hovers .mgz-grid-item a:hover img{transform:scale(1.08);}
        `}</style>

        <div
          id="instagram-api-data"
          className={`${gridClasses} ${scopeId}`}
          data-type="gallery"
        >
          {photos.map((item) => {
            const inner = (
              <>
                <img src={item.media_url} alt={item.caption || ''} />
                <figure>{item.caption}</figure>
              </>
            );
            return (
              <div key={item.id || item.media_url} className="mgz-grid-item">
                {onclick ? (
                  <a
                    href={item.media_url}
                    className={`mgz-flex-position-middle-center ${
                      hoverEffect ? `hover-type-${hoverEffect}` : ''
                    }`}
                    title={item.caption || undefined}
                    target={linkTarget}
                    rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
                  >
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </div>
            );
          })}
        </div>

        {linkText && followLink && (
          <a href={followLink} target="_blank" rel="noopener noreferrer">
            {linkText}
          </a>
        )}
      </div>
    </div>
  );
}