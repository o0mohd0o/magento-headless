'use client';
/**
 * ImageCarousel — port of Magezon\PageBuilder element/image_carousel.phtml.
 *
 * A faithful, jQuery-free reimplementation of the Owl-Carousel based
 * multi-item image carousel ("mgz-carousel mgz-image-hovers owl-carousel").
 *
 * Items are a dynamic-rows array on `element.items` (NOT child elements). Each
 * item is an object with: image, popup_image, title, description, popup_title,
 * custom_link, video_map. Items without an `image` are skipped (matches the
 * template's `if (!$item['image']) continue;`).
 *
 * Unlike Slider (one slide visible at a time), image_carousel shows several
 * items per view, controlled by the responsive owl_item_xl/lg/md/sm/xs fields
 * (defaults 5/4/3/2/1). We pick the visible count from a window-width breakpoint
 * matching Owl's defaults (xs <768, sm <992, md <1200, lg <1500, xl >=1500) and
 * recompute on resize.
 *
 * On-click action (element.onclick):
 *   - ''           : no link, plain image.
 *   - 'magnific'   : open a lightbox. Link target is popup_image, else video_map
 *                    (rendered as an iframe), else the image itself. We provide a
 *                    self-contained React lightbox (no external lib) instead of
 *                    jQuery Magnific Popup.
 *   - 'custom_link': wrap the image in an anchor to item.custom_link.
 *
 * Behavior via hooks: prev/next nav, dot pagination, autoplay
 * (owl_autoplay + owl_autoplay_timeout), loop (owl_loop), RTL (owl_rtl),
 * margin (owl_margin) and lazy-load (owl_lazyload). Class names mirror the
 * storefront so existing style hooks apply; layout-critical bits use small
 * inline styles so this works without the Magezon CSS bundle.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MagezonElementProps, MagezonElement } from '../types';
import { getLinkParams, linkAttrs } from '../links';
import { bool, mediaUrl, str } from '../media';

type Ctx = MagezonElementProps['ctx'];

type CarouselItem = {
  image: string;
  popupImage: string;
  title: string;
  description: string;
  popupTitle: string;
  customLink: unknown;
  videoMap: string;
};

/** Owl-style breakpoints -> number of visible items, using the configured per-tier counts. */
function visibleForWidth(
  width: number,
  counts: { xs: number; sm: number; md: number; lg: number; xl: number },
): number {
  if (width >= 1500) return counts.xl;
  if (width >= 1200) return counts.lg;
  if (width >= 992) return counts.md;
  if (width >= 768) return counts.sm;
  return counts.xs;
}

/** A single popup payload for the lightbox (image or iframe/video). */
type Popup = { type: 'image' | 'iframe'; src: string; title: string };

function Lightbox({ popup, onClose }: { popup: Popup; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="mgz-magnific-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(11,11,11,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '12px',
          right: '16px',
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontSize: '32px',
          lineHeight: 1,
          cursor: 'pointer',
        }}
      >
        &times;
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {popup.type === 'iframe' ? (
          <iframe
            src={popup.src}
            title={popup.title || 'media'}
            frameBorder={0}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            style={{ width: '80vw', maxWidth: '960px', height: '54vw', maxHeight: '540px', border: 0, background: '#000' }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={popup.src}
            alt={popup.title || ''}
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', display: 'block' }}
          />
        )}
        {popup.title && (
          <div
            className="mfp-title"
            style={{ color: '#ccc', marginTop: '10px', textAlign: 'center' }}
            dangerouslySetInnerHTML={{ __html: popup.title }}
          />
        )}
      </div>
    </div>
  );
}

export function ImageCarousel({ element, ctx }: MagezonElementProps) {
  // --- Heading (title / description) — mirrors mgz-block-heading. ---
  const title = str(element.title);
  const description = str(element.description);
  const titleAlign = str(element.title_align) || 'center';
  const TitleTag = (str(element.title_tag) || 'h2') as keyof React.JSX.IntrinsicElements;
  const showLine = bool(element.show_line);
  const linePosition = str(element.line_position) || 'center';

  // --- Items: dynamic-rows array; drop entries with no image. ---
  const rawItems = Array.isArray(element.items) ? (element.items as MagezonElement[]) : [];
  const items: CarouselItem[] = useMemo(
    () =>
      rawItems
        .filter((it) => str(it.image))
        .map((it) => ({
          image: str(it.image),
          popupImage: str(it.popup_image),
          title: str(it.title),
          description: str(it.description),
          popupTitle: str(it.popup_title),
          customLink: it.custom_link,
          videoMap: str(it.video_map),
        })),
    [rawItems],
  );
  const count = items.length;

  // --- Display options. ---
  const onclick = str(element.onclick); // '' | 'magnific' | 'custom_link'
  const contentPosition = str(element.content_position) || 'middle-center';
  const hoverEffect = str(element.hover_effect);
  const displayOnHover = bool(element.display_on_hover);
  const overlayColor = str(element.overlay_color);
  const lazyLoad = bool(element.owl_lazyload);

  // image_size like "300x200" -> width/height attrs (port of getsize()).
  const size = useMemo(() => {
    const raw = str(element.image_size);
    if (!raw) return null as null | { width: number; height: number };
    const parts = raw.split('x').filter(Boolean);
    const width = parseInt(parts[0] || '0', 10) || 0;
    const height = parseInt(parts[1] || '0', 10) || 0;
    return width ? { width, height } : null;
  }, [element.image_size]);

  // --- Content styling fields (item-content / item-title / item-description). ---
  const contentColor = str(element.content_color) || '#FFF';
  const contentBackground = str(element.content_background) || 'rgba(10,10,10,0.6)';
  const contentPadding = str(element.content_padding) || '10px 20px';
  const contentFullwidth = element.content_fullwidth === undefined ? true : bool(element.content_fullwidth);
  const titleFontSize = str(element.title_font_size);
  const titleFontWeight = str(element.title_font_weight);
  const descFontSize = str(element.description_font_size);
  const descFontWeight = str(element.description_font_weight);
  const imageBorderRadius = str(element.image_border_radius);

  // --- Owl responsive item counts. ---
  const counts = useMemo(
    () => ({
      xl: Number(element.owl_item_xl) || 5,
      lg: Number(element.owl_item_lg) || 4,
      md: Number(element.owl_item_md) || 3,
      sm: Number(element.owl_item_sm) || 2,
      xs: Number(element.owl_item_xs) || 1,
    }),
    [element.owl_item_xl, element.owl_item_lg, element.owl_item_md, element.owl_item_sm, element.owl_item_xs],
  );

  // --- Owl carousel behavior. ---
  const showNav = element.owl_nav === undefined ? true : bool(element.owl_nav);
  const showDots = bool(element.owl_dots);
  const dotsInside = bool(element.owl_dots_insie);
  const navPosition = str(element.owl_nav_position) || 'center_split';
  const navSize = str(element.owl_nav_size) || 'small';
  const loop = element.owl_loop === undefined ? true : bool(element.owl_loop);
  const rtl = bool(element.owl_rtl);
  const margin = element.owl_margin === undefined ? 10 : Number(element.owl_margin) || 0;
  const autoplay = bool(element.owl_autoplay);
  const autoplayTimeout = Number(element.owl_autoplay_timeout) || 5000;

  // --- Responsive visible-count: start at the lg tier (SSR-safe), refine on mount/resize. ---
  const [visible, setVisible] = useState(() => Math.max(1, Math.min(count || 1, counts.lg)));
  useEffect(() => {
    const recompute = () => {
      const v = visibleForWidth(window.innerWidth, counts);
      setVisible(Math.max(1, v));
    };
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, [counts]);

  const perView = Math.max(1, Math.min(visible, count || 1));
  // Number of "pages" (last reachable start index). When looping, allow wrap.
  const maxStart = Math.max(0, count - perView);

  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchX = useRef<number | null>(null);

  // Clamp active when perView / count changes.
  useEffect(() => {
    setActive((cur) => Math.min(cur, maxStart));
  }, [maxStart]);

  const go = useCallback(
    (next: number) => {
      if (count <= perView) {
        setActive(0);
        return;
      }
      if (next < 0) setActive(loop ? maxStart : 0);
      else if (next > maxStart) setActive(loop ? 0 : maxStart);
      else setActive(next);
    },
    [count, perView, loop, maxStart],
  );

  const prev = useCallback(() => go(active - 1), [active, go]);
  const next = useCallback(() => go(active + 1), [active, go]);

  useEffect(() => {
    if (!autoplay || count <= perView) return;
    timer.current = setInterval(() => {
      setActive((cur) => {
        const n = cur + 1;
        if (n > maxStart) return loop ? 0 : cur;
        return n;
      });
    }, autoplayTimeout);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [autoplay, autoplayTimeout, count, perView, loop, maxStart]);

  const [popup, setPopup] = useState<Popup | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
    if (Math.abs(dx) > 40) {
      // In RTL a leftward swipe should advance the same way; mirror delta.
      const forward = rtl ? dx > 0 : dx < 0;
      if (forward) next();
      else prev();
    }
    touchX.current = null;
  };

  if (count === 0) return null;

  // Build the resolved popup link for an item (port of the magnific branch).
  const popupFor = (item: CarouselItem): Popup => {
    if (item.popupImage) return { type: 'image', src: mediaUrl(item.popupImage, ctx), title: item.popupTitle || item.title };
    if (item.videoMap) return { type: 'iframe', src: item.videoMap, title: item.popupTitle || item.title };
    return { type: 'image', src: mediaUrl(item.image, ctx), title: item.popupTitle || item.title };
  };

  const carouselClass = [
    'mgz-carousel',
    'mgz-image-hovers',
    'owl-carousel',
    `image-content-${contentPosition}`,
    onclick === 'magnific' ? 'mgz-magnific' : '',
    hoverEffect ? `hover-type-${hoverEffect}-wrapper` : '',
    displayOnHover ? 'item-content-hover' : '',
    dotsInside ? 'mgz-carousel-dot-inside' : '',
    `mgz-carousel-nav-position-${navPosition}`,
    `mgz-carousel-nav-size-${navSize}`,
  ]
    .filter(Boolean)
    .join(' ');

  // Per-item flex basis so `perView` items show, honoring the margin gap.
  const itemBasis = `calc(${100 / perView}% - ${(margin * (perView - 1)) / perView}px)`;
  const hasMovement = count > perView;

  return (
    <div className="mgz-block">
      {(title || description) && (
        <div
          className={[
            'mgz-block-heading',
            `mgz-block-heading-align-${titleAlign}`,
            showLine ? 'mgz-block-heading-line' : '',
            `mgz-block-heading-line-position-${linePosition}`,
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ textAlign: titleAlign as React.CSSProperties['textAlign'], marginBottom: '20px' }}
        >
          {title && (
            <TitleTag className="title" dangerouslySetInnerHTML={{ __html: title }} />
          )}
          {description && <div className="info" dangerouslySetInnerHTML={{ __html: description }} />}
        </div>
      )}

      <div className="mgz-block-content">
        <div
          className={carouselClass}
          data-type="gallery"
          dir={rtl ? 'rtl' : undefined}
          style={{ position: 'relative', overflow: 'hidden', width: '100%' }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="owl-stage"
            style={{
              display: 'flex',
              flexDirection: rtl ? 'row-reverse' : 'row',
              gap: margin ? `${margin}px` : undefined,
              transform: `translateX(${(rtl ? 1 : -1) * active * (100 / perView)}%)`,
              transition: 'transform 0.4s ease',
            }}
          >
            {items.map((item, i) => {
              const src = mediaUrl(item.image, ctx);

              // Resolve the visible-image anchor (custom_link branch).
              let linkHref = '';
              let linkTitle = '';
              let linkObj = getLinkParams(undefined);
              const isMagnific = onclick === 'magnific';
              if (onclick === 'custom_link' && item.customLink) {
                linkObj = getLinkParams(item.customLink);
                linkHref = linkObj.url;
                linkTitle = linkObj.title || item.title;
              }

              const showContent =
                (item.title || item.description) && contentPosition !== 'none';

              const imageEl = (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={`owl-item-image${lazyLoad ? ' owl-lazy' : ''}`}
                  src={src}
                  alt={item.title || ''}
                  width={size?.width || undefined}
                  height={size?.height || undefined}
                  loading={lazyLoad ? 'lazy' : undefined}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: size?.height ? `${size.height}px` : 'auto',
                    objectFit: size?.height ? 'cover' : undefined,
                    borderRadius: imageBorderRadius || undefined,
                  }}
                />
              );

              return (
                <div
                  key={i}
                  className={['item', 'mgz-carousel-item', hoverEffect ? `hover-type-${hoverEffect}` : '']
                    .filter(Boolean)
                    .join(' ')}
                  style={{ flex: `0 0 ${itemBasis}`, maxWidth: itemBasis, boxSizing: 'border-box' }}
                >
                  <div
                    className={`item-inner mgz-flex-position-${contentPosition}`}
                    style={{ position: 'relative', overflow: 'hidden' }}
                  >
                    {isMagnific ? (
                      <a
                        className={`mgz-carousel-${onclick}`}
                        href={popupFor(item).src}
                        title={item.popupTitle || item.title || undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          setPopup(popupFor(item));
                        }}
                        style={{ display: 'block', cursor: 'zoom-in' }}
                      >
                        {imageEl}
                      </a>
                    ) : linkHref ? (
                      <a
                        className={`mgz-carousel-${onclick}`}
                        href={linkHref}
                        title={linkTitle || undefined}
                        {...linkAttrs(linkObj)}
                        style={{ display: 'block' }}
                      >
                        {imageEl}
                      </a>
                    ) : (
                      imageEl
                    )}

                    {showContent && (
                      <div
                        className="item-content"
                        style={{
                          ...contentPositionStyle(contentPosition),
                          color: contentColor,
                          background: contentPosition === 'below' ? undefined : contentBackground,
                          padding: contentPadding,
                          width: contentFullwidth && contentPosition !== 'below' ? '100%' : undefined,
                          boxSizing: 'border-box',
                          // display_on_hover -> hide until the item is hovered (host CSS may refine).
                          opacity: displayOnHover ? 0 : 1,
                          transition: 'opacity 0.3s ease',
                          pointerEvents: 'none',
                        }}
                      >
                        {item.title && (
                          <div
                            className="item-title"
                            style={{
                              fontSize: titleFontSize || '16px',
                              fontWeight: (titleFontWeight as React.CSSProperties['fontWeight']) || undefined,
                            }}
                            dangerouslySetInnerHTML={{ __html: item.title }}
                          />
                        )}
                        {item.description && (
                          <div
                            className="item-description"
                            style={{
                              fontSize: descFontSize || undefined,
                              fontWeight: (descFontWeight as React.CSSProperties['fontWeight']) || undefined,
                            }}
                            dangerouslySetInnerHTML={{ __html: item.description }}
                          />
                        )}
                      </div>
                    )}

                    {overlayColor && (
                      <div
                        className="mgz-overlay"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: overlayColor,
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {showNav && hasMovement && (
            <div className="owl-nav">
              <button
                type="button"
                className="owl-prev"
                aria-label="Previous"
                onClick={prev}
                style={navButtonStyle('prev', rtl, navSize)}
              >
                <i className="fa fa-angle-left" aria-hidden="true" />
                <span style={srOnly}>Previous</span>
              </button>
              <button
                type="button"
                className="owl-next"
                aria-label="Next"
                onClick={next}
                style={navButtonStyle('next', rtl, navSize)}
              >
                <i className="fa fa-angle-right" aria-hidden="true" />
                <span style={srOnly}>Next</span>
              </button>
            </div>
          )}

          {showDots && hasMovement && (
            <div
              className="owl-dots"
              role="tablist"
              aria-label="Carousel pagination"
              style={{
                position: dotsInside ? 'absolute' : 'static',
                left: 0,
                right: 0,
                bottom: dotsInside ? '12px' : undefined,
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginTop: dotsInside ? 0 : '14px',
                zIndex: 4,
              }}
            >
              {Array.from({ length: maxStart + 1 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`owl-dot${i === active ? ' active' : ''}`}
                  onClick={() => setActive(i)}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    background: i === active ? '#333' : 'rgba(0,0,0,0.35)',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {popup && <Lightbox popup={popup} onClose={() => setPopup(null)} />}
    </div>
  );
}

/** Map Magezon content_position to absolute/below placement for .item-content. */
function contentPositionStyle(position: string): React.CSSProperties {
  if (position === 'below' || position === 'none') {
    return { position: 'static' };
  }
  const [vertical = 'middle', horizontal = 'center'] = position.split('-');
  const base: React.CSSProperties = { position: 'absolute', zIndex: 2 };
  // vertical
  if (vertical === 'top') base.top = 0;
  else if (vertical === 'bottom') base.bottom = 0;
  else {
    base.top = '50%';
  }
  // horizontal
  if (horizontal === 'left') base.left = 0;
  else if (horizontal === 'right') base.right = 0;
  else {
    base.left = '50%';
  }
  // center translate combinations
  const translate: string[] = [];
  if (horizontal === 'center') translate.push('-50%');
  else translate.push('0');
  if (vertical === 'middle') translate.push('-50%');
  else translate.push('0');
  base.transform = `translate(${translate.join(', ')})`;
  return base;
}

const srOnly: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

function navButtonStyle(dir: 'prev' | 'next', rtl: boolean, navSize: string): React.CSSProperties {
  const onLeft = rtl ? dir === 'next' : dir === 'prev';
  const dim = navSize === 'large' ? 48 : navSize === 'small' ? 32 : 40;
  return {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [onLeft ? 'left' : 'right']: '8px',
    zIndex: 4,
    width: `${dim}px`,
    height: `${dim}px`,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.85)',
    color: '#333',
    fontSize: navSize === 'small' ? '16px' : '18px',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties;
}