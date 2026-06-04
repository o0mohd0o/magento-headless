'use client';
/**
 * Testimonials — port of element/testimonials.phtml.
 *
 * Renders an owl-carousel of repeatable `items`. Each item:
 *   - image (media path)              - resolved to absolute via mediaUrl()
 *   - name, job, link (text)
 *   - content (HTML, was $coreHelper->filter()) - rendered via an HTML sink
 *   - box_background_color / box_color (per-item, applied inline)
 *
 * Three layouts (`testimonial_type`): type1 (image on top, then content, then
 * name/job), type2 (content, then image + name/job in meta row), type3
 * (content bubble, then image + inline name,job).
 *
 * The storefront uses owl-carousel (jQuery) driven by data-mage-init carousel
 * options. Here the carousel is reimplemented with React hooks (no jQuery):
 *   - responsive items-per-view from owl_item_xl/lg/md/sm/xs (default 1)
 *   - prev/next nav (owl_nav), dots (owl_dots)
 *   - autoplay (owl_autoplay / owl_autoplay_timeout / owl_autoplay_hover_pause)
 *   - loop (owl_loop), inter-slide gap (owl_margin)
 *
 * Per-item / element typography & box colors set in the Style tab are emitted by
 * the storefront as a scoped <style> block (getAdditionalStyleHtml); that CSS is
 * NOT reproduced here apart from the per-item box colors, which are inlined.
 * Image width/border-radius styling likewise lives in that style block — we honor
 * the legacy width/height attributes (image_width / image_height) on <img>.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MagezonElementProps, MagezonElement } from '../types';
import { bool, mediaUrl, str } from '../media';

interface TItem {
  image: string;
  name: string;
  job: string;
  link: string;
  content: string;
  boxBg: string;
  boxColor: string;
}

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

export function Testimonials({ element, ctx }: MagezonElementProps) {
  const type = str(element.testimonial_type) || 'type1';
  const imageWidth = str(element.image_width);
  const imageHeight = str(element.image_height);

  const items: TItem[] = useMemo(() => {
    const raw = Array.isArray(element.items) ? element.items : [];
    return raw.map((it) => {
      const o = (it ?? {}) as Record<string, unknown>;
      return {
        image: mediaUrl(o.image, ctx),
        name: str(o.name),
        job: str(o.job),
        link: str(o.link),
        content: str(o.content),
        boxBg: str(o.box_background_color),
        boxColor: str(o.box_color),
      };
    });
  }, [element.items, ctx]);

  const perView = useItemsPerView(element);
  const nav = bool(element.owl_nav);
  const dots = bool(element.owl_dots);
  const autoplay = bool(element.owl_autoplay);
  const autoplayTimeout = intOr(element.owl_autoplay_timeout, 5000);
  const pauseOnHover = bool(element.owl_autoplay_hover_pause);
  const loop = bool(element.owl_loop);
  const margin = intOr(element.owl_margin, 0) === 0 ? 0 : intOr(element.owl_margin, 0);

  const pageCount = Math.max(1, Math.ceil(items.length / perView));
  const [page, setPage] = useState(0);
  const hovering = useRef(false);

  // Keep page in range when perView (responsive) changes.
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

  if (items.length === 0) return null;

  const renderImage = (item: TItem) =>
    item.image ? (
      <img
        src={item.image}
        alt={item.name}
        width={imageWidth || undefined}
        height={imageHeight || undefined}
      />
    ) : null;

  const renderNameInner = (item: TItem) =>
    item.link ? <a href={item.link}>{item.name}</a> : item.name;

  const renderItem = (item: TItem, i: number) => {
    const boxStyle: React.CSSProperties = {};
    if (item.boxColor) boxStyle.color = item.boxColor;
    if (item.boxBg) boxStyle.backgroundColor = item.boxBg;

    const contentEl = (
      <div
        className="mgz-testimonial-content"
        dangerouslySetInnerHTML={{ __html: item.content }}
      />
    );

    let inner: React.ReactNode = null;

    if (type === 'type1') {
      inner = (
        <>
          {item.image && (
            <div className="mgz-testimonial-image">{renderImage(item)}</div>
          )}
          {contentEl}
          <div className="mgz-testimonial-meta">
            {(item.name || item.job) && (
              <div className="mgz-testimonial-details">
                {item.name && (
                  <span className="mgz-testimonial-name">
                    {item.link ? (
                      <a href={item.link}>
                        <span>{item.name}</span>
                        {item.job ? ',' : ''}
                      </a>
                    ) : (
                      <>
                        <span>{item.name}</span>
                        {item.job ? ',' : ''}
                      </>
                    )}
                  </span>
                )}
                {item.job && <span className="mgz-testimonial-job">{item.job}</span>}
              </div>
            )}
          </div>
        </>
      );
    } else if (type === 'type2') {
      inner = (
        <>
          {contentEl}
          <div className="mgz-testimonial-meta">
            {item.image && (
              <div className="mgz-testimonial-image">{renderImage(item)}</div>
            )}
            {(item.name || item.job) && (
              <div className="mgz-testimonial-details">
                {item.name && (
                  <div className="mgz-testimonial-name">{renderNameInner(item)}</div>
                )}
                {item.job && <div className="mgz-testimonial-job">{item.job}</div>}
              </div>
            )}
          </div>
        </>
      );
    } else {
      // type3
      inner = (
        <>
          {contentEl}
          <div className="mgz-testimonial-meta">
            {item.image && (
              <span className="mgz-testimonial-image">{renderImage(item)}</span>
            )}
            {item.name && (
              <span className="mgz-testimonial-name">
                {item.link ? (
                  <a href={item.link}>
                    {item.name}
                    {item.job ? ', ' : ''}
                  </a>
                ) : (
                  <>
                    {item.name}
                    {item.job ? ', ' : ''}
                  </>
                )}
              </span>
            )}
            {item.job && <span className="mgz-testimonial-job">{item.job}</span>}
          </div>
        </>
      );
    }

    return (
      <div
        key={i}
        className={`mgz-testimonial mgz-testimonial${i}`}
        style={Object.keys(boxStyle).length ? boxStyle : undefined}
        role="group"
        aria-roledescription="slide"
      >
        {inner}
      </div>
    );
  };

  const trackStyle: React.CSSProperties = {
    display: 'flex',
    transition: 'transform 0.4s ease',
    transform: `translateX(-${page * 100}%)`,
  };

  const itemWidth = `${100 / perView}%`;

  return (
    <div
      className={`mgz-testimonials mgz-testimonials-${type} mgz-carousel`}
      onMouseEnter={() => {
        hovering.current = true;
      }}
      onMouseLeave={() => {
        hovering.current = false;
      }}
    >
      <div className="mgz-carousel-stage" style={{ overflow: 'hidden' }}>
        <div className="mgz-carousel-track" style={trackStyle}>
          {items.map((item, i) => (
            <div
              key={i}
              className="mgz-carousel-item"
              style={{
                flex: `0 0 ${itemWidth}`,
                maxWidth: itemWidth,
                boxSizing: 'border-box',
                paddingLeft: margin ? margin / 2 : undefined,
                paddingRight: margin ? margin / 2 : undefined,
              }}
            >
              {renderItem(item, i)}
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
  );
}
