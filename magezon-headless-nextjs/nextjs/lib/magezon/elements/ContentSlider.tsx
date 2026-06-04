'use client';
/**
 * ContentSlider — port of element/content_slider.phtml.
 *
 * Structure (.mgz-block):
 *   - optional heading (.mgz-block-heading): title (configurable tag/align),
 *     description (HTML), and an optional decorative line (show_line /
 *     line_position / line_color / line_width).
 *   - content (.mgz-block-content): an owl-carousel of repeatable `items`.
 *     Each item carries a single `content` field (HTML, was
 *     $coreHelper->filter()) rendered inside a `.mgz-content-carouse-slide`.
 *
 * Unlike content collection elements, the slides are NOT child elements
 * (element.elements) — they are a flat repeatable `items` array whose only
 * field is `content`. So we render the HTML directly rather than via
 * <MagezonElements/>.
 *
 * The storefront drives the slider with owl-carousel (jQuery) via
 * data-mage-init carousel options (getOwlCarouselOptions). Here it is
 * reimplemented with React hooks (no jQuery):
 *   - responsive items-per-view from owl_item_xl/lg/md/sm/xs (default 1 for
 *     this element — see getDefaultValues)
 *   - prev/next nav (owl_nav), dots (owl_dots, default on)
 *   - autoplay (owl_autoplay / owl_autoplay_timeout / owl_autoplay_hover_pause)
 *   - loop (owl_loop), inter-slide gap (owl_margin)
 *
 * The Style-tab CSS the storefront emits via getAdditionalStyleHtml()
 * (owl colors, scoped line/title colors) is added by <ElementWrapper>'s
 * generated stylesheet and is NOT reproduced here, except the decorative
 * line color/width which we inline since they are simple element fields.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MagezonElementProps, MagezonElement } from '../types';
import { bool, str } from '../media';

function intOr(value: unknown, fallback: number): number {
  const n = parseInt(str(value), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Pick items-per-view for the current viewport, mirroring owl xl/lg/md/sm/xs breakpoints. */
function useItemsPerView(el: MagezonElement): number {
  const xl = intOr(el.owl_item_xl, 1);
  const lg = intOr(el.owl_item_lg, xl);
  const md = intOr(el.owl_item_md, lg);
  const sm = intOr(el.owl_item_sm, md);
  const xs = intOr(el.owl_item_xs, sm);

  const compute = useCallback(() => {
    if (typeof window === 'undefined') return xl;
    const w = window.innerWidth;
    if (w >= 1200) return xl;
    if (w >= 992) return lg;
    if (w >= 768) return md;
    if (w >= 480) return sm;
    return xs;
  }, [xl, lg, md, sm, xs]);

  const [perView, setPerView] = useState<number>(xl);
  useEffect(() => {
    const onResize = () => setPerView(compute());
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [compute]);

  return Math.max(1, perView);
}

/** Normalize a CSS length: bare numbers become px (mirrors Magezon getStyleProperty). */
function cssLength(value: unknown): string {
  const s = str(value).trim();
  if (!s) return '';
  return /^-?\d+(\.\d+)?$/.test(s) ? `${s}px` : s;
}

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'p', 'span']);

export function ContentSlider({ element }: MagezonElementProps) {
  // ---- Heading ----------------------------------------------------------
  const title = str(element.title);
  const description = str(element.description);
  const titleAlign = str(element.title_align) || 'center';
  const rawTag = str(element.title_tag).toLowerCase();
  const TitleTag = (HEADING_TAGS.has(rawTag) ? rawTag : 'h2') as keyof React.JSX.IntrinsicElements;
  const showLine = bool(element.show_line);
  const linePosition = str(element.line_position) || 'center';
  const lineColor = str(element.line_color);
  const lineWidth = cssLength(element.line_width);

  // ---- Slides -----------------------------------------------------------
  const slides: string[] = useMemo(() => {
    const raw = Array.isArray(element.items) ? element.items : [];
    return raw.map((it) => str((it as Record<string, unknown> | null)?.content));
  }, [element.items]);

  // ---- Carousel options -------------------------------------------------
  const perView = useItemsPerView(element);
  const nav = bool(element.owl_nav);
  const dots = element.owl_dots === undefined ? true : bool(element.owl_dots);
  const autoplay = bool(element.owl_autoplay);
  const autoplayTimeout = intOr(element.owl_autoplay_timeout, 5000);
  const pauseOnHover = bool(element.owl_autoplay_hover_pause);
  const loop = bool(element.owl_loop);
  const margin = intOr(element.owl_margin, 0);

  const pageCount = Math.max(1, Math.ceil(slides.length / perView));
  const [page, setPage] = useState(0);
  const hovering = useRef(false);

  useEffect(() => {
    setPage((p) => Math.min(p, pageCount - 1));
  }, [pageCount]);

  const goTo = useCallback(
    (next: number) => {
      if (pageCount <= 1) return;
      if (loop) setPage(((next % pageCount) + pageCount) % pageCount);
      else setPage(Math.max(0, Math.min(pageCount - 1, next)));
    },
    [pageCount, loop],
  );
  const prev = useCallback(() => goTo(page - 1), [goTo, page]);
  const next = useCallback(() => goTo(page + 1), [goTo, page]);

  useEffect(() => {
    if (!autoplay || pageCount <= 1) return;
    const id = window.setInterval(() => {
      if (pauseOnHover && hovering.current) return;
      setPage((p) => (loop ? (p + 1) % pageCount : p + 1 >= pageCount ? 0 : p + 1));
    }, Math.max(800, autoplayTimeout));
    return () => window.clearInterval(id);
  }, [autoplay, autoplayTimeout, pauseOnHover, loop, pageCount]);

  if (slides.length === 0) return null;

  const trackStyle: React.CSSProperties = {
    display: 'flex',
    transition: 'transform 0.4s ease',
    transform: `translateX(-${page * 100}%)`,
  };
  const itemWidth = `${100 / perView}%`;

  const heading =
    title || description ? (
      <div
        className={
          `mgz-block-heading mgz-block-heading-align-${titleAlign}` +
          (showLine ? ' mgz-block-heading-line' : '') +
          ` mgz-block-heading-line-position-${linePosition}`
        }
      >
        {title && (
          <TitleTag className="title">{title}</TitleTag>
        )}
        {showLine && (lineColor || lineWidth) && (
          <span
            className="mgz-block-heading-rule"
            aria-hidden="true"
            style={{
              display: 'block',
              height: lineWidth || '1px',
              backgroundColor: lineColor || undefined,
              width: '50px',
              margin:
                linePosition === 'left'
                  ? '10px 0'
                  : linePosition === 'right'
                    ? '10px 0 10px auto'
                    : '10px auto',
            }}
          />
        )}
        {description && (
          <div className="info" dangerouslySetInnerHTML={{ __html: description }} />
        )}
      </div>
    ) : null;

  return (
    <div className="mgz-block">
      {heading}
      <div className="mgz-block-content">
        <div
          className="mgz-carousel mgz-content-carousel"
          onMouseEnter={() => {
            hovering.current = true;
          }}
          onMouseLeave={() => {
            hovering.current = false;
          }}
        >
          <div className="mgz-carousel-stage" style={{ overflow: 'hidden' }}>
            <div className="mgz-carousel-track" style={trackStyle}>
              {slides.map((html, i) => (
                <div
                  key={i}
                  className="mgz-carousel-item"
                  role="group"
                  aria-roledescription="slide"
                  style={{
                    flex: `0 0 ${itemWidth}`,
                    maxWidth: itemWidth,
                    boxSizing: 'border-box',
                    paddingLeft: margin ? margin / 2 : undefined,
                    paddingRight: margin ? margin / 2 : undefined,
                  }}
                >
                  <div
                    className="mgz-content-carouse-slide"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </div>
              ))}
            </div>
          </div>

          {nav && pageCount > 1 && (
            <div className="mgz-carousel-nav owl-nav">
              <button
                type="button"
                className="owl-prev"
                aria-label="Previous"
                onClick={prev}
                disabled={!loop && page === 0}
              >
                <i className="fa fa-angle-left" />
              </button>
              <button
                type="button"
                className="owl-next"
                aria-label="Next"
                onClick={next}
                disabled={!loop && page >= pageCount - 1}
              >
                <i className="fa fa-angle-right" />
              </button>
            </div>
          )}

          {dots && pageCount > 1 && (
            <div className="mgz-carousel-dots owl-dots" role="tablist">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`owl-dot${i === page ? ' active' : ''}`}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-selected={i === page}
                  role="tab"
                  onClick={() => goTo(i)}
                >
                  <span />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
